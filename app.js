const commonItems = [
  "建具（窓・扉）不具合",
  "建具（網戸・雨戸）不具合",
  "1のクレセント / 鍵 / 取手 不具合",
  "電気不具合",
  "水漏れ",
  "木部腐食",
  "シロアリ跡あり",
  "外壁不具合",
  "雨漏れ跡",
  "床鳴り"
];

const inspectionItems = [
  ["トイレ", "ウォシュレット", "水漏れ・動作不良の確認"],
  ["トイレ", "換気扇", "動作音・吸い込みの確認"],
  ["トイレ", "水漏れ", "便器まわり・給排水の確認"],
  ["トイレ", "排水管の状況", "排水時の異音・漏れの確認"],
  ["トイレ", "鍵", "開閉・施錠の確認"],
  ["洗面室", "水漏れ", "洗面台・給排水の確認"],
  ["洗面室", "排水管の状況", "排水時の異音・漏れの確認"],
  ["浴室", "水漏れ（給湯口含む）", "浴槽・給湯口・排水まわりの確認"],
  ["浴室", "排水管の状況", "排水の流れ・臭気の確認"],
  ["浴室", "浴乾", "動作・異音・フィルターの確認"],
  ["浴室", "鍵", "開閉・施錠の確認"],
  ["キッチン", "水漏れ", "シンク下・水栓の確認"],
  ["キッチン", "排水管の状況", "排水時の漏れ・臭気の確認"],
  ["キッチン", "レンジフード", "動作・異音・照明の確認"],
  ["キッチン", "食洗機", "動作・水漏れの確認"],
  ["給湯器", "水漏れ", "本体・配管まわりの確認"],
  ["給湯器", "その他不具合", "リモコン・燃焼・年式の確認"],
  ["傾斜", "6/1000以上の勾配", "3m以上の数値を別紙参照"],
  ["傾斜", "床の沈みやたわみ", "歩行時の沈み・きしみ確認"],
  ["雨漏り跡", "天井 / 内壁 / 窓枠", "シミ・浮き・カビの確認"],
  ["水染み跡", "床下", "床下の水染み確認"],
  ["腐食", "木部・鉄部", "腐食・サビ・欠損の確認"],
  ["蟻道", "シロアリの害", "蟻道・食害跡の確認"],
  ["バルコニー", "防水層", "浮き・破れ・排水の確認"],
  ["バルコニー", "その他", "手すり・排水・その他不具合の確認"],
  ["外壁", "仕上げ不具合", "浮き・剥がれ・割れの確認"],
  ["外壁", "クラック", "ひび割れ幅・範囲の確認"],
  ["外壁", "シーリング", "破断・隙間・劣化の確認"],
  ["基礎", "クラック/不具合", "幅・深さ・範囲の確認"],
  ["外構", "その他", "門扉・塀・土間の確認"],
  ["網戸", "破れ", "破れ・外れ・動作の確認"],
  ["電気", "通電チェック", "照明・コンセントの確認"],
  ["ガス", "開栓後チェック", "開栓後に動作確認"],
  ["TV端子", "電波チェック", "受信状況の確認"]
];

const state = {
  completionPhotos: [],
  correctionPhotos: [],
  floorPlan: null,
  planMarkers: [],
  planView: {
    zoom: 1,
    panX: 0,
    panY: 0
  }
};

const DEFAULT_DOCUMENT_TITLE = document.title;
const PHOTO_STATUS_BATCH_SIZE = 10;
const PHOTO_MAX_EDGE = 1600;
const PHOTO_JPEG_QUALITY = 0.78;
const PLAN_SYMBOLS = ["1", "2", "3", "4", "5", "6", "7", "8", "●", "○"];
const APP_VERSION = "68";
const REPORT_TEMPLATE_IMAGE_SRC = `./assets/templates/completion-report-format.png?v=${APP_VERSION}`;
const REPORT_TEMPLATE_LAYOUT = {
  width: 1590,
  height: 2246,
  propertyName: { x: 156, y: 242, width: 570, height: 54 },
  inspectionDate: { x: 1268, y: 124, width: 245, height: 40 },
  staffName: { x: 1218, y: 242, width: 235, height: 54 },
  propertySpecificMemo: { x: 738, y: 395, width: 710, height: 300 },
  generalMemo: { x: 78, y: 790, width: 1418, height: 220 },
  masks: [
    { x: 1096, y: 1586, width: 245, height: 32 }
  ],
  inspections: {
    rowsPerSide: 17,
    firstRowCenterY: 1216,
    rowHeight: 48.2,
    mark: {
      left: { yesX: 462, noX: 542 },
      right: { yesX: 967, noX: 1047 }
    },
    memo: { x: 1094, width: 398, height: 38 }
  }
};
const TEMPLATE_COMPLETION_CHECKS = [
  { name: "templateRepairTilt", label: "傾斜 補修済み", rowIndex: 0, x: 1374 },
  { name: "templateRepairLeak", label: "雨漏れ跡 補修済み", rowIndex: 2, x: 1374 },
  { name: "templateTermiteProtected", label: "蟻道 防蟻済み", rowIndex: 5, x: 1374 }
];
const CORRECTION_REPORT_MODES = {
  correction: {
    eyebrow: "是正箇所作成",
    introTitle: "是正写真と依頼文を作成",
    outputButton: "是正箇所だけ出力",
    sectionTitle: "是正箇所",
    sectionBadge: "写真・依頼文",
    uploadTitle: "是正箇所の写真を追加",
    uploadHelp: "写真アルバムから選び、依頼文を作成できます",
    textareaLabel: "是正依頼文",
    textareaPlaceholder: "是正依頼文を入力",
    emptyState: "是正写真はまだ追加されていません。",
    outputOptionTitle: "是正箇所",
    outputOptionHelp: "住所・是正写真・依頼文",
    printTitle: "是正箇所",
    defaultCaption: "是正箇所"
  },
  status: {
    eyebrow: "現状報告作成",
    introTitle: "現状写真と報告文を作成",
    outputButton: "現状報告だけ出力",
    sectionTitle: "現状報告",
    sectionBadge: "写真・報告文",
    uploadTitle: "現状報告の写真を追加",
    uploadHelp: "写真アルバムから選び、報告文を作成できます",
    textareaLabel: "現状報告文",
    textareaPlaceholder: "現状報告文を入力",
    emptyState: "現状報告写真はまだ追加されていません。",
    outputOptionTitle: "現状報告",
    outputOptionHelp: "住所・現状写真・報告文",
    printTitle: "現状報告",
    defaultCaption: "現状報告"
  }
};
const LEGACY_DRAFT_STORAGE_KEY = "sanjo_completion_report_draft";
const DRAFTS_STORAGE_KEY = "sanjo_completion_report_drafts_v2";
const ACTIVE_DRAFT_STORAGE_KEY = "sanjo_completion_report_active_draft";
const OUTPUT_SNAPSHOT_STORAGE_KEY = "sanjo_completion_report_output_snapshot";
const ASSET_DB_NAME = "sanjo_completion_report_assets";
const ASSET_DB_VERSION = 1;
const ASSET_STORE_NAME = "assets";

const form = document.querySelector("#reportForm");
const saveStatus = document.querySelector("#saveStatus");
const photoRestoreNotice = document.querySelector("#photoRestoreNotice");
const commonChecks = document.querySelector("#commonChecks");
const inspectionChecks = document.querySelector("#inspectionChecks");
const completionInput = document.querySelector("#completionPhotos");
const correctionInput = document.querySelector("#correctionPhotos");
const floorPlanInput = document.querySelector("#floorPlanImage");
const completionPreview = document.querySelector("#completionPreview");
const correctionList = document.querySelector("#correctionList");
const floorPlanBoard = document.querySelector("#floorPlanBoard");
const previewDialog = document.querySelector("#previewDialog");
const reportPreview = document.querySelector("#reportPreview");
const printRoot = document.querySelector("#printRoot");
const printPageStyle = document.createElement("style");
const homeView = document.querySelector("#homeView");
const editorView = document.querySelector("#editorView");
const homeDraftGrid = document.querySelector("#homeDraftGrid");
const draftSelect = document.querySelector("#draftSelect");
const homeNewDraftButton = document.querySelector("#homeNewDraftButton");
const backHomeButton = document.querySelector("#backHomeButton");
const deleteDraftButton = document.querySelector("#deleteDraftButton");
const draftNote = document.querySelector("#draftNote");
const pageTabs = document.querySelectorAll("[data-page-tab]");
const pagePanels = document.querySelectorAll("[data-page-panel]");
const outputInputs = document.querySelectorAll("[name^='output_']");
const symbolChips = document.querySelectorAll("[data-symbol]");
const correctionModeLabelElements = document.querySelectorAll("[data-correction-mode-label]");
const correctionReportTypeInputs = document.querySelectorAll("[name='correctionReportType']");
let selectedPlanSymbol = PLAN_SYMBOLS[0];
let draggedMarkerId = null;
let isPanningPlan = false;
let planPanStart = null;
let planPointerMoved = false;
let lastPlanPointerStart = 0;
let activeDraftId = localStorage.getItem(ACTIVE_DRAFT_STORAGE_KEY) || "";
let isApplyingDraft = false;
let assetDbPromise = null;
let assetPersistTimer = null;
let missingDraftPhotoCount = 0;

document.head.append(printPageStyle);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=68").catch(() => {
      saveStatus.textContent = "通常表示";
    });
  });
}

function showPage(pageName) {
  pageTabs.forEach((tab) => {
    const active = tab.dataset.pageTab === pageName;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", active ? "true" : "false");
  });

  pagePanels.forEach((panel) => {
    panel.hidden = panel.dataset.pagePanel !== pageName;
  });

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showHome() {
  editorView.hidden = true;
  homeView.hidden = false;
  renderDraftList();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showEditor() {
  homeView.hidden = true;
  editorView.hidden = false;
  showPage("report");
}

function makeSegmented(name, options, value = "none") {
  return `
    <div class="segmented" role="radiogroup">
      ${options.map((option) => `
        <label>
          <input type="radio" name="${name}" value="${option.value}" ${option.value === value ? "checked" : ""}>
          <span>${option.label}</span>
        </label>
      `).join("")}
    </div>
  `;
}

function renderChecks() {
  if (commonChecks) {
    commonChecks.innerHTML = commonItems.map((item, index) => `
      <div class="common-row common-reference-row">
        <div class="check-title">${getCommonItemSymbol(index)} ${item}</div>
      </div>
    `).join("");
  }

  inspectionChecks.innerHTML = inspectionItems.map(([place, item, hint], index) => `
    <div class="inspection-row">
      <div class="inspection-meta">
        <span class="inspection-template-side">${index < REPORT_TEMPLATE_LAYOUT.inspections.rowsPerSide ? "左列" : "右列"} ${index % REPORT_TEMPLATE_LAYOUT.inspections.rowsPerSide + 1}行目</span>
        <span class="inspection-place">${place}</span>
        <span class="inspection-item">${item}</span>
        <span class="empty-state">${hint}</span>
      </div>
      <div>
        ${makeSegmented(`inspection_${index}`, [
          { label: "○", value: "ok" },
          { label: "△", value: "check" },
          { label: "×", value: "repair" },
          { label: "-", value: "unknown" }
        ], "ok")}
        <input class="memo-input" name="inspectionMemo_${index}" type="text" placeholder="メモ">
      </div>
    </div>
  `).join("");
}

function getCommonItemSymbol(index) {
  if (index < 8) return String(index + 1);
  return index === 8 ? "●" : "○";
}

async function initApp() {
  renderChecks();
  updateCorrectionModeView();
  await loadDraft();
  renderCompletionPhotos();
  renderCorrectionPhotos();
  renderFloorPlan();
  showHome();
}

async function appendPhotos(files, collection, render, decoratePhoto) {
  const list = [...files].filter((file) => file.type.startsWith("image/"));
  if (!list.length) return;

  setPhotoInputsDisabled(true);
  try {
    const addedPhotos = [];
    for (let index = 0; index < list.length; index += 1) {
      try {
        saveStatus.textContent = `写真圧縮 ${index + 1}/${list.length}`;
        const basePhoto = await readPhotoFile(list[index]);
        const photo = decoratePhoto ? decoratePhoto(basePhoto) : basePhoto;
        if (!photo.imageElement && basePhoto.imageElement) {
          setPhotoImageElement(photo, basePhoto.imageElement);
        }
        if (!photo.assetBlob && basePhoto.assetBlob) {
          setPhotoBlob(photo, basePhoto.assetBlob);
        }
        addedPhotos.push(photo);
      } catch (error) {
        console.warn("写真を追加できませんでした", error);
      }

      if ((index + 1) % PHOTO_STATUS_BATCH_SIZE === 0) {
        saveStatus.textContent = `写真追加 ${index + 1}/${list.length}`;
        await nextFrame();
      }
    }

    collection.push(...addedPhotos);
    render();
    saveStatus.textContent = `写真追加 ${addedPhotos.length}枚`;
    saveDraft();
    await persistDraftAssets(activeDraftId);
  } finally {
    setPhotoInputsDisabled(false);
  }
}

async function readPhotoFile(file) {
  const compressed = await compressImageFile(file, PHOTO_MAX_EDGE, PHOTO_JPEG_QUALITY);
  const photo = {
    id: createId(),
    name: file.name,
    src: compressed.src,
    width: compressed.width,
    height: compressed.height,
    originalSize: file.size,
    compressedSize: compressed.size
  };
  setPhotoBlob(photo, compressed.blob);
  await cachePhotoImage(photo);
  return photo;
}

function setPhotoBlob(photo, blob) {
  Object.defineProperty(photo, "assetBlob", {
    value: blob,
    enumerable: false,
    configurable: true
  });
}

async function compressImageFile(file, maxEdge, quality) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const sourceWidth = image.naturalWidth || image.width;
    const sourceHeight = image.naturalHeight || image.height;
    if (!sourceWidth || !sourceHeight) {
      return {
        src: await blobToDataUrl(file),
        width: sourceWidth,
        height: sourceHeight,
        size: file.size
      };
    }

    const scale = Math.min(1, maxEdge / Math.max(sourceWidth, sourceHeight));
    const width = Math.max(1, Math.round(sourceWidth * scale));
    const height = Math.max(1, Math.round(sourceHeight * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: false });
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    return {
      blob,
      src: URL.createObjectURL(blob),
      width,
      height,
      size: blob.size
    };
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function readPlanFile(file) {
  const src = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const plan = {
        id: createId(),
        name: file.name,
        src,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      };
      setPhotoBlob(plan, file);
      resolve(plan);
    };
    image.onerror = () => {
      const plan = {
        id: createId(),
        name: file.name,
        src
      };
      setPhotoBlob(plan, file);
      resolve(plan);
    };
    image.src = src;
  });
}

function setPhotoInputsDisabled(disabled) {
  completionInput.disabled = disabled;
  correctionInput.disabled = disabled;
  floorPlanInput.disabled = disabled;
}

function renderCompletionPhotos() {
  const photos = state.completionPhotos.filter((photo) => photo?.src);
  completionPreview.innerHTML = photos.length
    ? photos.map((photo) => `
      <div class="photo-tile">
        <img src="${photo.src}" alt="${escapeHtml(photo.name)}" data-photo-id="${escapeHtml(photo.id)}" loading="lazy" decoding="async">
        <button type="button" data-remove-completion="${photo.id}" aria-label="写真を削除">×</button>
      </div>
    `).join("")
    : `<p class="empty-state">完工写真はまだ追加されていません。</p>`;
  bindPhotoLoadErrorHandlers(completionPreview, "completion");
}

function renderCorrectionPhotos() {
  const photos = state.correctionPhotos.filter((photo) => photo?.src);
  const labels = getCorrectionReportModeLabels();
  correctionList.innerHTML = photos.length
    ? photos.map((photo) => `
        <article class="correction-card" data-correction-id="${photo.id}">
          <img src="${photo.src}" alt="${escapeHtml(photo.name)}" data-photo-id="${escapeHtml(photo.id)}" loading="lazy" decoding="async">
          <button class="remove-photo" type="button" data-remove-correction="${photo.id}" aria-label="写真を削除">×</button>
          <label class="field">
            <span>${escapeHtml(labels.textareaLabel)}</span>
            <textarea data-correction-field="comment" rows="2" placeholder="${escapeHtml(labels.textareaPlaceholder)}">${escapeHtml(photo.comment || "")}</textarea>
          </label>
        </article>
      `).join("")
    : `<p class="empty-state">${escapeHtml(labels.emptyState)}</p>`;
  bindPhotoLoadErrorHandlers(correctionList, "correction");
}

function bindPhotoLoadErrorHandlers(root, kind) {
  root.querySelectorAll("img[data-photo-id]").forEach((image) => {
    image.addEventListener("error", () => {
      removeBrokenPhoto(kind, image.dataset.photoId);
    }, { once: true });
  });
}

function removeBrokenPhoto(kind, id) {
  if (!id) return;
  const key = kind === "completion" ? "completionPhotos" : "correctionPhotos";
  const photo = state[key].find((item) => item.id === id);
  if (!photo) return;
  revokePhotoUrl(photo);
  state[key] = state[key].filter((item) => item.id !== id);
  missingDraftPhotoCount += 1;
  updatePhotoRestoreNotice();
  if (kind === "completion") renderCompletionPhotos();
  if (kind === "correction") renderCorrectionPhotos();
  saveDraft();
}

function updatePhotoRestoreNotice() {
  if (!photoRestoreNotice) return;
  if (!missingDraftPhotoCount) {
    photoRestoreNotice.hidden = true;
    photoRestoreNotice.textContent = "";
    return;
  }
  photoRestoreNotice.hidden = false;
  photoRestoreNotice.textContent = `保存済み写真のうち${missingDraftPhotoCount}枚を復元できませんでした。該当写真は再追加してください。`;
  saveStatus.textContent = "写真を再追加";
}

function renderFloorPlan() {
  if (!state.floorPlan?.src) {
    floorPlanBoard.innerHTML = `<p class="empty-state">間取図面を追加すると、ここに配置画面が表示されます。</p>`;
    return;
  }

  floorPlanBoard.innerHTML = `
    <div class="plan-canvas" style="${getPlanCanvasStyle()}">
      <img class="plan-image" src="${state.floorPlan.src}" alt="${escapeHtml(state.floorPlan.name)}" draggable="false">
      ${state.planMarkers.map((marker) => `
        <button
          class="plan-marker"
        type="button"
        data-marker-id="${marker.id}"
        style="${getPlanMarkerStyle(marker)}"
        aria-label="記号 ${escapeHtml(marker.symbol)}"
      >${escapeHtml(marker.symbol)}</button>
      `).join("")}
    </div>
  `;
  floorPlanBoard.classList.toggle("is-zoomed", state.planView.zoom > 1);
}

function getPlanCanvasStyle() {
  const view = state.planView;
  return `width: ${view.zoom * 100}%;`;
}

function getPlanMarkerStyle(marker) {
  return `left: ${marker.x}%; top: ${marker.y}%;`;
}

function getFormData() {
  const data = Object.fromEntries(new FormData(form).entries());
  data.correctionReportType = normalizeCorrectionReportType(data.correctionReportType);
  data.common = commonItems.map((item, index) => ({
    item,
    status: data[`common_${index}`] || "none"
  }));
  data.inspections = inspectionItems.map(([place, item, hint], index) => ({
    place,
    item,
    hint,
    status: data[`inspection_${index}`] || "unknown",
    memo: data[`inspectionMemo_${index}`] || ""
  }));
  data.templateCompletionChecks = Object.fromEntries(
    TEMPLATE_COMPLETION_CHECKS.map(({ name }) => [name, data[name] === "1"])
  );
  data.completionPhotos = state.completionPhotos;
  data.correctionPhotos = state.correctionPhotos;
  data.floorPlan = state.floorPlan;
  data.planMarkers = state.planMarkers;
  data.planView = state.planView;
  return data;
}

function normalizeCorrectionReportType(value) {
  return CORRECTION_REPORT_MODES[value] ? value : "correction";
}

function getCorrectionReportModeLabels(value = form.elements.correctionReportType?.value) {
  return CORRECTION_REPORT_MODES[normalizeCorrectionReportType(value)];
}

function setCorrectionReportType(value) {
  const normalized = normalizeCorrectionReportType(value);
  const field = form.elements.correctionReportType;
  if (field) field.value = normalized;
  updateCorrectionModeView();
}

function updateCorrectionModeView() {
  const labels = getCorrectionReportModeLabels();
  correctionModeLabelElements.forEach((element) => {
    const key = element.dataset.correctionModeLabel;
    if (labels[key]) element.textContent = labels[key];
  });
}

function commitActiveFormField() {
  const active = document.activeElement;
  if (!active || !form.contains(active) || typeof active.blur !== "function") return;
  active.blur();
}

function prepareFormForOutput() {
  commitActiveFormField();
  saveDraft();
  saveOutputSnapshot();
}

function saveOutputSnapshot() {
  try {
    const data = getFormData();
    sessionStorage.setItem(OUTPUT_SNAPSHOT_STORAGE_KEY, JSON.stringify({
      draftId: activeDraftId,
      data: {
        propertyName: data.propertyName || "",
        staffName: data.staffName || "",
        inspectionDate: data.inspectionDate || ""
      }
    }));
  } catch (error) {
    // Session storage may be unavailable in private or constrained browser modes.
  }
}

function restoreOutputSnapshotIfNeeded() {
  let snapshot;
  try {
    snapshot = JSON.parse(sessionStorage.getItem(OUTPUT_SNAPSHOT_STORAGE_KEY) || "null");
  } catch (error) {
    sessionStorage.removeItem(OUTPUT_SNAPSHOT_STORAGE_KEY);
    return;
  }

  if (!snapshot?.data || snapshot.draftId !== activeDraftId) return;
  let restored = false;
  ["propertyName", "staffName", "inspectionDate"].forEach((name) => {
    const field = form.elements[name];
    const value = snapshot.data[name];
    if (!field || field.value || !value) return;
    field.value = value;
    restored = true;
  });

  if (!restored) return;
  saveDraft();
  renderDraftList();
}

function saveDraft() {
  if (isApplyingDraft) return;
  try {
    const records = getDraftRecords();
    const now = new Date().toISOString();
    if (!activeDraftId || !records.some((record) => record.id === activeDraftId)) {
      activeDraftId = createId();
      localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
    }

    const data = getDraftDataForStorage();
    const existingIndex = records.findIndex((record) => record.id === activeDraftId);
    const record = {
      id: activeDraftId,
      updatedAt: now,
      data
    };

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }

    saveDraftRecords(records);
    scheduleAssetPersist(activeDraftId);
    renderDraftList(records);
    saveStatus.textContent = "保存済み";
    setTimeout(() => {
      saveStatus.textContent = "自動保存";
    }, 800);
  } catch (error) {
    saveStatus.textContent = "一時保存";
  }
}

function getDraftDataForStorage() {
  const data = getFormData();
  const completionPhotos = validPhotos(data.completionPhotos);
  const correctionPhotos = validPhotos(data.correctionPhotos);
  return {
    ...data,
    completionPhotos: completionPhotos.map(({ id, name, width, height, originalSize, compressedSize }) => ({
      id,
      name,
      width,
      height,
      originalSize,
      compressedSize
    })),
    correctionPhotos: correctionPhotos.map(({ id, name, comment, width, height, originalSize, compressedSize }) => ({
      id,
      name,
      comment,
      width,
      height,
      originalSize,
      compressedSize
    })),
    floorPlan: data.floorPlan ? {
      id: data.floorPlan.id,
      name: data.floorPlan.name,
      width: data.floorPlan.width,
      height: data.floorPlan.height
    } : null,
    planMarkers: data.planMarkers,
    planView: data.planView,
    selectedOutputs: getSelectedOutputs()
  };
}

async function loadDraft() {
  migrateLegacyDraft();
  const records = getDraftRecords();
  if (!records.length) {
    activeDraftId = createId();
    localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
    renderDraftList(records);
    return;
  }

  const activeRecord = records.find((record) => record.id === activeDraftId) || sortDraftRecords(records)[0];
  activeDraftId = activeRecord.id;
  localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
  await applyDraftData(activeRecord.data);
  renderDraftList(records);
}

function migrateLegacyDraft() {
  if (getDraftRecords().length) return;

  let data;
  try {
    const raw = localStorage.getItem(LEGACY_DRAFT_STORAGE_KEY);
    if (!raw) return;
    data = JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem(LEGACY_DRAFT_STORAGE_KEY);
    return;
  }

  activeDraftId = createId();
  localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
  saveDraftRecords([{
    id: activeDraftId,
    updatedAt: new Date().toISOString(),
    data
  }]);
  localStorage.removeItem(LEGACY_DRAFT_STORAGE_KEY);
}

async function applyDraftData(data = {}) {
  isApplyingDraft = true;
  try {
    resetCurrentForm();
    missingDraftPhotoCount = 0;
    updatePhotoRestoreNotice();

    Object.entries(data).forEach(([key, value]) => {
      const field = form.elements[key];
      if (field && typeof value === "string") field.value = value;
    });
    applyTemplateCompletionChecks(data);
    setCorrectionReportType(data.correctionReportType || "correction");

    data.common?.forEach((row, index) => {
      const field = form.querySelector(`[name="common_${index}"][value="${row.status}"]`);
      if (field) field.checked = true;
    });

    data.inspections?.forEach((row, index) => {
      const field = form.querySelector(`[name="inspection_${index}"][value="${row.status}"]`);
      const memo = form.elements[`inspectionMemo_${index}`];
      if (field) field.checked = true;
      if (memo) memo.value = row.memo || "";
    });

    state.completionPhotos = await restoreDraftPhotos(activeDraftId, "completion", data.completionPhotos || []);
    state.correctionPhotos = await restoreDraftPhotos(activeDraftId, "correction", data.correctionPhotos || []);
    state.floorPlan = await restoreDraftFloorPlan(activeDraftId, data.floorPlan);
    state.planMarkers = Array.isArray(data.planMarkers) ? data.planMarkers : [];
    if (data.planView) {
      state.planView = {
        zoom: data.planView.zoom || 1,
        panX: data.planView.panX || 0,
        panY: data.planView.panY || 0
      };
    }

    const outputs = Array.isArray(data.selectedOutputs)
      ? data.selectedOutputs
      : ["report", "plan", "correction", "completion"].filter((output) => data[`output_${output}`]);
    if (outputs.length) {
      outputInputs.forEach((input) => {
        input.checked = outputs.includes(input.value);
      });
    }

    renderCompletionPhotos();
    renderCorrectionPhotos();
    renderFloorPlan();
    updatePhotoRestoreNotice();
  } finally {
    isApplyingDraft = false;
  }

  if (missingDraftPhotoCount) {
    saveDraft();
    updatePhotoRestoreNotice();
  }
}

function applyTemplateCompletionChecks(data = {}) {
  TEMPLATE_COMPLETION_CHECKS.forEach(({ name }) => {
    const field = form.elements[name];
    if (!field) return;
    field.checked = Boolean(data.templateCompletionChecks?.[name] || data[name]);
  });
}

function getDraftRecords() {
  try {
    const records = JSON.parse(localStorage.getItem(DRAFTS_STORAGE_KEY) || "[]");
    return Array.isArray(records) ? records.filter((record) => record?.id && record?.data) : [];
  } catch (error) {
    localStorage.removeItem(DRAFTS_STORAGE_KEY);
    return [];
  }
}

function saveDraftRecords(records) {
  localStorage.setItem(DRAFTS_STORAGE_KEY, JSON.stringify(sortDraftRecords(records)));
}

function openAssetDb() {
  if (!("indexedDB" in window)) return Promise.resolve(null);
  if (assetDbPromise) return assetDbPromise;
  assetDbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(ASSET_DB_NAME, ASSET_DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ASSET_STORE_NAME)) {
        const store = db.createObjectStore(ASSET_STORE_NAME, { keyPath: "key" });
        store.createIndex("draftId", "draftId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  }).catch((error) => {
    console.warn("画像保存DBを開けませんでした", error);
    return null;
  });
  return assetDbPromise;
}

async function persistDraftAssets(draftId) {
  if (!draftId) return;
  const db = await openAssetDb();
  if (!db) return;
  const assets = [
    ...state.completionPhotos.map((photo) => ({ kind: "completion", item: photo })),
    ...state.correctionPhotos.map((photo) => ({ kind: "correction", item: photo })),
    ...(state.floorPlan ? [{ kind: "floorPlan", item: state.floorPlan }] : [])
  ];
  const activeKeys = assets.map(({ kind, item }) => assetKey(draftId, kind, item.id));

  await new Promise((resolve, reject) => {
    const transaction = db.transaction(ASSET_STORE_NAME, "readwrite");
    const store = transaction.objectStore(ASSET_STORE_NAME);
    assets.forEach(({ kind, item }) => {
      const blob = item.assetBlob;
      if (!blob) return;
      store.put({
        key: assetKey(draftId, kind, item.id),
        draftId,
        kind,
        id: item.id,
        name: item.name,
        blob,
        width: item.width,
        height: item.height,
        originalSize: item.originalSize,
        compressedSize: item.compressedSize
      });
    });
    const index = store.index("draftId");
    const cursorRequest = index.openCursor(IDBKeyRange.only(draftId));
    cursorRequest.onsuccess = () => {
      const cursor = cursorRequest.result;
      if (!cursor) return;
      if (!activeKeys.includes(cursor.value.key)) cursor.delete();
      cursor.continue();
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  }).catch((error) => {
    console.warn("画像を保存できませんでした", error);
  });
}

function scheduleAssetPersist(draftId = activeDraftId) {
  clearTimeout(assetPersistTimer);
  assetPersistTimer = setTimeout(() => {
    assetPersistTimer = null;
    persistDraftAssets(draftId);
  }, 250);
}

function cancelScheduledAssetPersist() {
  clearTimeout(assetPersistTimer);
  assetPersistTimer = null;
}

async function restoreDraftPhotos(draftId, kind, photos) {
  const restored = [];
  for (const photo of photos) {
    const asset = await getDraftAsset(draftId, kind, photo.id);
    if (!asset?.blob) {
      missingDraftPhotoCount += 1;
      continue;
    }
    const restoredPhoto = {
      ...photo,
      name: photo.name || asset.name,
      src: URL.createObjectURL(asset.blob),
      width: photo.width || asset.width,
      height: photo.height || asset.height,
      originalSize: photo.originalSize || asset.originalSize,
      compressedSize: photo.compressedSize || asset.compressedSize
    };
    setPhotoBlob(restoredPhoto, asset.blob);
    const image = await cachePhotoImage(restoredPhoto);
    if (!image) {
      revokePhotoUrl(restoredPhoto);
      missingDraftPhotoCount += 1;
      continue;
    }
    restored.push(restoredPhoto);
  }
  return restored;
}

async function restoreDraftFloorPlan(draftId, floorPlan) {
  if (!floorPlan?.id) return null;
  const asset = await getDraftAsset(draftId, "floorPlan", floorPlan.id);
  if (!asset?.blob) return null;
  const restoredPlan = {
    ...floorPlan,
    name: floorPlan.name || asset.name,
    src: URL.createObjectURL(asset.blob),
    width: floorPlan.width || asset.width,
    height: floorPlan.height || asset.height
  };
  setPhotoBlob(restoredPlan, asset.blob);
  return restoredPlan;
}

async function getDraftAsset(draftId, kind, id) {
  const db = await openAssetDb();
  if (!db || !draftId || !id) return null;
  return new Promise((resolve) => {
    const request = db.transaction(ASSET_STORE_NAME, "readonly")
      .objectStore(ASSET_STORE_NAME)
      .get(assetKey(draftId, kind, id));
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => resolve(null);
  });
}

async function deleteDraftAssets(draftId) {
  const db = await openAssetDb();
  if (!db || !draftId) return;
  await new Promise((resolve, reject) => {
    const transaction = db.transaction(ASSET_STORE_NAME, "readwrite");
    const store = transaction.objectStore(ASSET_STORE_NAME);
    const index = store.index("draftId");
    const request = index.openCursor(IDBKeyRange.only(draftId));
    request.onsuccess = () => {
      const cursor = request.result;
      if (!cursor) return;
      cursor.delete();
      cursor.continue();
    };
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  }).catch((error) => {
    console.warn("下書き画像を削除できませんでした", error);
  });
}

function assetKey(draftId, kind, id) {
  return `${draftId}:${kind}:${id}`;
}

function sortDraftRecords(records) {
  return [...records].sort((a, b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || "")));
}

function renderDraftList(records = getDraftRecords()) {
  const sorted = sortDraftRecords(records);
  draftSelect.innerHTML = sorted.length
    ? sorted.map((record) => `
      <option value="${record.id}" ${record.id === activeDraftId ? "selected" : ""}>
        ${escapeHtml(getDraftTitle(record))}
      </option>
    `).join("")
    : `<option value="">新規下書き</option>`;
  draftSelect.disabled = !sorted.length;
  deleteDraftButton.disabled = !sorted.length;
  draftNote.textContent = sorted.length
    ? `${sorted.length}件の下書きを保存中`
    : "物件名ごとに自動保存されます。";
  renderHomeDraftGrid(sorted);
}

function renderHomeDraftGrid(records) {
  if (!homeDraftGrid) return;
  homeDraftGrid.innerHTML = records.length
    ? records.map((record) => `
      <article class="home-draft-card">
        <button class="home-draft-open" type="button" data-open-draft="${record.id}">
          <span class="document-stack" aria-hidden="true"><span></span></span>
          <span class="draft-address">${escapeHtml(getDraftAddress(record))}</span>
          <span class="draft-updated">${escapeHtml(formatDraftDate(record.updatedAt) || "未保存")}</span>
        </button>
        <button
          class="home-draft-delete"
          type="button"
          data-delete-draft="${record.id}"
          aria-label="${escapeHtml(getDraftAddress(record))}を削除"
        >×</button>
      </article>
    `).join("")
    : `<div class="home-empty">＋ボタンから物件を追加</div>`;
}

function getDraftAddress(record) {
  return String(record.data?.propertyName || "").trim() || "無題の物件";
}

function getDraftTitle(record) {
  const name = getDraftAddress(record);
  const date = formatDraftDate(record.updatedAt);
  return date ? `${name}（${date}）` : name;
}

function formatDraftDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hour}:${minute}`;
}

function resetCurrentForm() {
  form.reset();
  setCorrectionReportType("correction");
  missingDraftPhotoCount = 0;
  updatePhotoRestoreNotice();
  state.completionPhotos.forEach(revokePhotoUrl);
  state.correctionPhotos.forEach(revokePhotoUrl);
  revokePhotoUrl(state.floorPlan);
  state.completionPhotos = [];
  state.correctionPhotos = [];
  state.floorPlan = null;
  state.planMarkers = [];
  state.planView = {
    zoom: 1,
    panX: 0,
    panY: 0
  };
  renderChecks();
  renderCompletionPhotos();
  renderCorrectionPhotos();
  renderFloorPlan();
  outputInputs.forEach((input) => {
    input.checked = true;
  });
}

async function handleDraftSelectChange(event) {
  event.stopPropagation();
  const nextDraftId = event.target.value;
  if (!nextDraftId) return;
  await openDraft(nextDraftId);
}

async function openDraft(draftId) {
  if (!draftId) return;
  if (draftId === activeDraftId) {
    showEditor();
    return;
  }

  saveDraft();
  cancelScheduledAssetPersist();
  await persistDraftAssets(activeDraftId);
  activeDraftId = draftId;
  localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
  const record = getDraftRecords().find((item) => item.id === activeDraftId);
  if (record) {
    await applyDraftData(record.data);
    renderDraftList();
    saveStatus.textContent = "下書き切替";
    showEditor();
  }
}

async function createNewDraft() {
  saveDraft();
  cancelScheduledAssetPersist();
  await persistDraftAssets(activeDraftId);
  activeDraftId = createId();
  localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
  resetCurrentForm();
  saveDraft();
  renderDraftList();
  showEditor();
  form.elements.propertyName?.focus();
  saveStatus.textContent = "新規下書き";
}

async function deleteDraft(draftId) {
  const records = getDraftRecords();
  const targetRecord = records.find((record) => record.id === draftId);
  if (!targetRecord) return false;

  const title = String(targetRecord.data?.propertyName || "").trim() || "無題の物件";
  if (!confirm(`「${title}」の下書きを削除しますか？`)) return false;

  const deletingActiveDraft = draftId === activeDraftId;
  const remaining = records.filter((record) => record.id !== draftId);
  await deleteDraftAssets(draftId);
  saveDraftRecords(remaining);

  if (deletingActiveDraft) {
    if (remaining.length) {
      activeDraftId = sortDraftRecords(remaining)[0].id;
      localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
      await applyDraftData(remaining.find((record) => record.id === activeDraftId)?.data);
    } else {
      activeDraftId = createId();
      localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
      resetCurrentForm();
    }
  }

  renderDraftList(remaining);
  saveStatus.textContent = "下書き削除";
  return true;
}

function buildPreview() {
  prepareFormForOutput();
  const data = getFormData();
  data.completionPhotos = validPhotos(data.completionPhotos);
  data.correctionPhotos = validPhotos(data.correctionPhotos);
  const printDate = renderPrintDate(data.inspectionDate);
  const selectedOutputs = getSelectedOutputs();
  if (!selectedOutputs.length) {
    reportPreview.innerHTML = "";
    printRoot.innerHTML = "";
    saveStatus.textContent = "出力ページを選択";
    return false;
  }

  const includeReport = selectedOutputs.includes("report");
  const includePlan = selectedOutputs.includes("plan");
  const includeCompletion = selectedOutputs.includes("completion");
  const includeCorrection = selectedOutputs.includes("correction");
  const completionPages = includeCompletion ? photoPages(data.completionPhotos) : [];
  const correctionPages = includeCorrection ? photoPages(data.correctionPhotos) : [];
  const correctionLabels = getCorrectionReportModeLabels(data.correctionReportType);
  const planPage = includePlan && data.floorPlan?.src ? renderPlanPrintPage(data) : "";

  const html = `
    ${includeReport ? renderReportTemplatePrintPage(data) : ""}
    ${planPage}
    ${correctionPages.map((photos, pageIndex) => `
      <section class="print-page correction-page">
        <h2>${escapeHtml(correctionLabels.printTitle)}${correctionPages.length > 1 ? ` ${pageIndex + 1}` : ""}<span class="print-page-date">${printDate}</span></h2>
        ${pageIndex === 0 ? `<div class="correction-address"><strong>住所</strong><span>${escapeHtml(data.propertyName || "")}</span></div>` : ""}
        <div class="print-photo-grid correction-grid ${pageIndex === 0 ? "has-correction-address" : ""}">
          ${renderNinePhotoSlots(photos, pageIndex, (photo, serial) => `
            <figure class="print-photo correction-print">
              <div class="photo-frame"><img src="${photo.src}" alt=""></div>
              <figcaption class="correction-caption">${escapeHtml(photo.comment || `${correctionLabels.defaultCaption} ${serial}`)}</figcaption>
            </figure>
          `).join("")}
        </div>
      </section>
    `).join("")}
    ${completionPages.map((photos, pageIndex) => `
      <section class="print-page photo-page">
        <h2>完工写真${completionPages.length > 1 ? ` ${pageIndex + 1}` : ""}<span class="print-page-date">${printDate}</span></h2>
        <div class="print-photo-grid">
          ${renderNinePhotoSlots(photos, pageIndex, (photo, serial) => `
            <figure class="print-photo">
              <div class="photo-frame"><img src="${photo.src}" alt=""></div>
              <figcaption>${serial}</figcaption>
            </figure>
          `).join("")}
        </div>
      </section>
    `).join("")}
  `;

  reportPreview.innerHTML = html;
  printRoot.innerHTML = html;
  if (!html.trim()) {
    saveStatus.textContent = "出力内容なし";
    return false;
  }
  return true;
}

function renderReportTemplatePrintPage(data) {
  const fieldStyle = (rect) => `left:${toPercent(rect.x, REPORT_TEMPLATE_LAYOUT.width)}%;top:${toPercent(rect.y, REPORT_TEMPLATE_LAYOUT.height)}%;width:${toPercent(rect.width, REPORT_TEMPLATE_LAYOUT.width)}%;height:${toPercent(rect.height, REPORT_TEMPLATE_LAYOUT.height)}%;`;
  const maskHtml = REPORT_TEMPLATE_LAYOUT.masks.map((rect) => `
    <span class="report-template-mask" style="${fieldStyle(rect)}"></span>
  `).join("");
  const markHtml = data.inspections.map((row, index) => {
    const placement = getInspectionStatusPlacement(row.status);
    if (!placement.column) return "";
    const slot = getInspectionTemplateSlot(index);
    const x = REPORT_TEMPLATE_LAYOUT.inspections.mark[slot.side][`${placement.column}X`];
    const y = getInspectionRowCenterY(slot.rowIndex);
    return `<span class="report-template-mark" style="left:${toPercent(x, REPORT_TEMPLATE_LAYOUT.width)}%;top:${toPercent(y, REPORT_TEMPLATE_LAYOUT.height)}%;">${escapeHtml(placement.label)}</span>`;
  }).join("");
  const completionCheckHtml = TEMPLATE_COMPLETION_CHECKS.map((item) => {
    if (!data.templateCompletionChecks?.[item.name]) return "";
    return `<span class="report-template-check" style="left:${toPercent(item.x, REPORT_TEMPLATE_LAYOUT.width)}%;top:${toPercent(getInspectionRowCenterY(item.rowIndex), REPORT_TEMPLATE_LAYOUT.height)}%;">✓</span>`;
  }).join("");
  const memoHtml = getInspectionRowMemos(data.inspections).map((memo, rowIndex) => {
    if (!memo) return "";
    const layout = REPORT_TEMPLATE_LAYOUT.inspections;
    const y = getInspectionRowCenterY(rowIndex) - layout.memo.height / 2;
    return `<span class="report-template-row-memo" style="left:${toPercent(layout.memo.x, REPORT_TEMPLATE_LAYOUT.width)}%;top:${toPercent(y, REPORT_TEMPLATE_LAYOUT.height)}%;width:${toPercent(layout.memo.width, REPORT_TEMPLATE_LAYOUT.width)}%;height:${toPercent(layout.memo.height, REPORT_TEMPLATE_LAYOUT.height)}%;">${escapeHtml(memo)}</span>`;
  }).join("");

  return `
    <section class="print-page report-page template-report-page">
      <img class="report-template-image" src="${REPORT_TEMPLATE_IMAGE_SRC}" alt="">
      ${maskHtml}
      <span class="report-template-text report-template-property" style="${fieldStyle(REPORT_TEMPLATE_LAYOUT.propertyName)}">${escapeHtml(data.propertyName || "")}</span>
      <span class="report-template-text report-template-date" style="${fieldStyle(REPORT_TEMPLATE_LAYOUT.inspectionDate)}">${escapeHtml(formatJapaneseDate(data.inspectionDate))}</span>
      <span class="report-template-text report-template-staff" style="${fieldStyle(REPORT_TEMPLATE_LAYOUT.staffName)}">${escapeHtml(data.staffName || "")}</span>
      <span class="report-template-text report-template-property-specific" style="${fieldStyle(REPORT_TEMPLATE_LAYOUT.propertySpecificMemo)}">${escapeHtml(data.propertySpecificMemo || "")}</span>
      <span class="report-template-text report-template-general-memo" style="${fieldStyle(REPORT_TEMPLATE_LAYOUT.generalMemo)}">${escapeHtml(data.generalMemo || "")}</span>
      ${markHtml}
      ${completionCheckHtml}
      ${memoHtml}
    </section>
  `;
}

function toPercent(value, base) {
  return ((value / base) * 100).toFixed(4);
}

function photoPages(photos) {
  const valid = validPhotos(photos);
  return valid.length ? chunk(valid, 9) : [];
}

function validPhotos(photos) {
  return Array.isArray(photos) ? photos.filter((photo) => photo?.src) : [];
}

function renderPlanPrintPage(data) {
  const frameStyle = getPlanPrintFrameStyle(data.floorPlan);
  const orientation = getPlanOrientation(data.floorPlan);
  const printDate = renderPrintDate(data.inspectionDate);
  return `
    <section class="print-page plan-page is-${orientation}-plan">
      <h2>間取図面</h2>
      <div class="print-page-date plan-print-date">${printDate}</div>
      <div class="plan-print-frame" style="${frameStyle}">
        <img src="${data.floorPlan.src}" alt="">
        ${data.planMarkers.map((marker) => `
          <span class="plan-print-marker" style="left: ${marker.x}%; top: ${marker.y}%">${escapeHtml(marker.symbol)}</span>
        `).join("")}
      </div>
      <div class="plan-print-legend">
        <span>1 建具（窓・扉）不具合</span>
        <span>2 建具（網戸・雨戸）不具合</span>
        <span>3 クレセント / 取手不具合</span>
        <span>4 電気不具合</span>
        <span>5 水漏れ</span>
        <span>6 木部腐食</span>
        <span>7 シロアリ跡あり</span>
        <span>8 外壁不具合</span>
        <span>● 雨漏れ跡</span>
        <span>○ 床鳴り</span>
      </div>
    </section>
  `;
}

function renderPrintDate(date) {
  return escapeHtml(getPrintDateText(date));
}

function getPrintDateText(date) {
  return `確認日 ${String(date || "").trim()}`;
}

function getPlanPrintFrameStyle(plan) {
  const { maxWidth, maxHeight } = getPlanPrintBounds(plan);
  const width = plan?.width || 297;
  const height = plan?.height || 210;
  const aspect = width / height;
  const heightFromWidth = maxWidth / aspect;
  if (heightFromWidth <= maxHeight) {
    return `width: ${maxWidth}mm; height: ${heightFromWidth.toFixed(2)}mm;`;
  }

  return `width: ${(maxHeight * aspect).toFixed(2)}mm; height: ${maxHeight}mm;`;
}

function getPlanOrientation(plan) {
  const width = plan?.width || 297;
  const height = plan?.height || 210;
  return width >= height ? "landscape" : "portrait";
}

function getPlanPrintBounds(plan) {
  return getPlanOrientation(plan) === "landscape"
    ? { maxWidth: 293, maxHeight: 206 }
    : { maxWidth: 206, maxHeight: 293 };
}

function renderNinePhotoSlots(photos, pageIndex, renderPhoto) {
  return Array.from({ length: 9 }, (_, index) => {
    const photo = photos[index];
    const serial = pageIndex * 9 + index + 1;
    if (photo) return renderPhoto(photo, serial);
    return `
      <figure class="print-photo empty-photo-slot">
        <div class="photo-frame"></div>
        <figcaption>${serial}</figcaption>
      </figure>
    `;
  });
}

function exportJson() {
  const data = JSON.stringify(getFormData(), null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${getOutputFileName()}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

async function exportFloorPlanPdf() {
  if (!state.floorPlan?.src) {
    saveStatus.textContent = "図面を追加";
    return false;
  }

  const { canvas } = await createFloorPlanPdfCanvas();
  const jpegBytes = await canvasToJpegBytes(canvas);
  const pdfBytes = createImagePdf([{
    imageBytes: jpegBytes,
    imageWidth: canvas.width,
    imageHeight: canvas.height,
    pageWidth: 841.89,
    pageHeight: 595.28
  }]);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  downloadBlob(blob, `${getOutputFileName()}_間取図.pdf`);
  saveStatus.textContent = "PDF保存";
  return true;
}

async function exportSelectedPdfDirect() {
  if (!buildPreview()) return false;
  saveOutputSnapshot();

  saveStatus.textContent = "PDF作成中";
  const data = getFormData();
  const correctionPages = photoPages(data.correctionPhotos);
  const completionPages = photoPages(data.completionPhotos);
  const correctionLabels = getCorrectionReportModeLabels(data.correctionReportType);
  const pages = [];
  const previewPages = [...reportPreview.querySelectorAll(".print-page")];
  let correctionPageIndex = 0;
  let completionPageIndex = 0;
  for (const page of previewPages) {
    if (page.classList.contains("plan-page") && state.floorPlan?.src) {
      const { canvas } = await createFloorPlanPdfCanvas();
      const imageBytes = await canvasToJpegBytes(canvas);
      pages.push({
        imageBytes,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        pageWidth: 841.89,
        pageHeight: 595.28
      });
      continue;
    }

    if (page.classList.contains("report-page")) {
      const canvas = await createTemplateReportPdfCanvas(data);
      const imageBytes = await canvasToJpegBytes(canvas);
      pages.push({
        imageBytes,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        pageWidth: 595.28,
        pageHeight: 841.89
      });
      continue;
    }

    if (page.classList.contains("correction-page")) {
      const canvas = await createPhotoPdfCanvas({
        title: `${correctionLabels.printTitle}${correctionPages.length > 1 ? ` ${correctionPageIndex + 1}` : ""}`,
        dateText: getPrintDateText(data.inspectionDate),
        photos: correctionPages[correctionPageIndex] || [],
        pageIndex: correctionPageIndex,
        kind: "correction",
        address: correctionPageIndex === 0 ? data.propertyName || "" : "",
        captionPrefix: correctionLabels.defaultCaption
      });
      const imageBytes = await canvasToJpegBytes(canvas);
      pages.push({
        imageBytes,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        pageWidth: 595.28,
        pageHeight: 841.89
      });
      correctionPageIndex += 1;
      continue;
    }

    if (page.classList.contains("photo-page")) {
      const canvas = await createPhotoPdfCanvas({
        title: `完工写真${completionPages.length > 1 ? ` ${completionPageIndex + 1}` : ""}`,
        dateText: getPrintDateText(data.inspectionDate),
        photos: completionPages[completionPageIndex] || [],
        pageIndex: completionPageIndex,
        kind: "completion"
      });
      const imageBytes = await canvasToJpegBytes(canvas);
      pages.push({
        imageBytes,
        imageWidth: canvas.width,
        imageHeight: canvas.height,
        pageWidth: 595.28,
        pageHeight: 841.89
      });
      completionPageIndex += 1;
      continue;
    }

    const canvas = await renderPrintPageToCanvas(page);
    const imageBytes = await canvasToJpegBytes(canvas);
    pages.push({
      imageBytes,
      imageWidth: canvas.width,
      imageHeight: canvas.height,
      pageWidth: 595.28,
      pageHeight: 841.89
    });
  }

  if (!pages.length) {
    saveStatus.textContent = "出力内容なし";
    return false;
  }

  const pdfBytes = createImagePdf(pages);
  saveOutputSnapshot();
  downloadBlob(new Blob([pdfBytes], { type: "application/pdf" }), `${getOutputFileName()}.pdf`);
  saveStatus.textContent = "PDF保存";
  if (previewDialog.open) previewDialog.close();
  return true;
}

async function createTemplateReportPdfCanvas(data) {
  const template = await loadImage(REPORT_TEMPLATE_IMAGE_SRC);
  const canvas = document.createElement("canvas");
  canvas.width = REPORT_TEMPLATE_LAYOUT.width;
  canvas.height = REPORT_TEMPLATE_LAYOUT.height;
  const context = canvas.getContext("2d", { alpha: false });

  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(template, 0, 0, canvas.width, canvas.height);
  drawReportTemplateMasks(context);

  drawReportFieldText(context, data.propertyName, REPORT_TEMPLATE_LAYOUT.propertyName, {
    font: "700 42px system-ui, -apple-system, sans-serif",
    lineHeight: 48,
    align: "center"
  });
  drawReportFieldText(context, formatJapaneseDate(data.inspectionDate), REPORT_TEMPLATE_LAYOUT.inspectionDate, {
    font: "700 28px system-ui, -apple-system, sans-serif",
    lineHeight: 32,
    align: "center"
  });
  drawReportFieldText(context, data.staffName, REPORT_TEMPLATE_LAYOUT.staffName, {
    font: "700 38px system-ui, -apple-system, sans-serif",
    lineHeight: 44,
    align: "center"
  });
  drawReportFieldText(context, data.propertySpecificMemo, REPORT_TEMPLATE_LAYOUT.propertySpecificMemo, {
    font: "700 24px system-ui, -apple-system, sans-serif",
    lineHeight: 34
  });
  drawReportFieldText(context, data.generalMemo, REPORT_TEMPLATE_LAYOUT.generalMemo, {
    font: "700 24px system-ui, -apple-system, sans-serif",
    lineHeight: 34
  });

  data.inspections.forEach((row, index) => {
    const placement = getInspectionStatusPlacement(row.status);
    if (!placement.column) return;
    const slot = getInspectionTemplateSlot(index);
    const x = REPORT_TEMPLATE_LAYOUT.inspections.mark[slot.side][`${placement.column}X`];
    const y = getInspectionRowCenterY(slot.rowIndex);
    drawCenteredReportText(context, placement.label, x, y, "700 31px system-ui, -apple-system, sans-serif");
  });

  TEMPLATE_COMPLETION_CHECKS.forEach((item) => {
    if (!data.templateCompletionChecks?.[item.name]) return;
    drawCenteredReportText(
      context,
      "✓",
      item.x,
      getInspectionRowCenterY(item.rowIndex),
      "700 28px system-ui, -apple-system, sans-serif"
    );
  });

  getInspectionRowMemos(data.inspections).forEach((memo, rowIndex) => {
    if (!memo) return;
    const layout = REPORT_TEMPLATE_LAYOUT.inspections;
    drawReportFieldText(context, memo, {
      x: layout.memo.x,
      y: getInspectionRowCenterY(rowIndex) - layout.memo.height / 2,
      width: layout.memo.width,
      height: layout.memo.height
    }, {
      font: "700 20px system-ui, -apple-system, sans-serif",
      lineHeight: 24
    });
  });

  return canvas;
}

function drawReportTemplateMasks(context) {
  context.fillStyle = "#fff";
  REPORT_TEMPLATE_LAYOUT.masks.forEach((rect) => {
    context.fillRect(rect.x, rect.y, rect.width, rect.height);
  });
}

function drawReportFieldText(context, text, rect, options = {}) {
  const value = String(text || "").trim();
  if (!value) return;
  drawWrappedText(context, value, rect.x, rect.y, rect.width, rect.height, {
    font: options.font || "700 22px system-ui, -apple-system, sans-serif",
    lineHeight: options.lineHeight || 28,
    align: options.align || "left"
  });
}

function drawCenteredReportText(context, text, x, y, font) {
  context.fillStyle = "#111";
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(text, x, y);
}

function getInspectionStatusPlacement(status) {
  if (status === "ok") return { column: "no", label: "○" };
  if (status === "check") return { column: "yes", label: "△" };
  if (status === "repair") return { column: "yes", label: "×" };
  return { column: null, label: "" };
}

function getInspectionTemplateSlot(index) {
  const rowsPerSide = REPORT_TEMPLATE_LAYOUT.inspections.rowsPerSide;
  return {
    side: index < rowsPerSide ? "left" : "right",
    rowIndex: index % rowsPerSide
  };
}

function getInspectionRowCenterY(rowIndex) {
  const layout = REPORT_TEMPLATE_LAYOUT.inspections;
  return layout.firstRowCenterY + rowIndex * layout.rowHeight;
}

function getInspectionRowMemos(inspections) {
  const rowsPerSide = REPORT_TEMPLATE_LAYOUT.inspections.rowsPerSide;
  return Array.from({ length: rowsPerSide }, (_, rowIndex) => {
    const left = inspections[rowIndex];
    const right = inspections[rowIndex + rowsPerSide];
    return [formatInspectionMemo(left), formatInspectionMemo(right)].filter(Boolean).join(" / ");
  });
}

function formatInspectionMemo(row) {
  const memo = String(row?.memo || "").trim();
  if (!memo) return "";
  return `${row.place} ${row.item}: ${memo}`;
}

function formatJapaneseDate(value) {
  if (!value) return "";
  const [year, month, day] = String(value).split("-");
  if (!year || !month || !day) return String(value);
  return `${Number(year)}年${Number(month)}月${Number(day)}日`;
}

async function createFloorPlanPdfCanvas() {
  const image = await loadImage(state.floorPlan.src);
  const canvas = document.createElement("canvas");
  canvas.width = 2480;
  canvas.height = 1754;
  const context = canvas.getContext("2d");
  const pageWidth = canvas.width;
  const pageHeight = canvas.height;
  const imageAspect = image.naturalWidth / image.naturalHeight;
  const pageAspect = pageWidth / pageHeight;
  const drawWidth = imageAspect >= pageAspect ? pageWidth : pageHeight * imageAspect;
  const drawHeight = imageAspect >= pageAspect ? pageWidth / imageAspect : pageHeight;
  const drawX = (pageWidth - drawWidth) / 2;
  const drawY = (pageHeight - drawHeight) / 2;

  context.fillStyle = "#fff";
  context.fillRect(0, 0, pageWidth, pageHeight);
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  drawPlanMarkersForPdf(context, drawX, drawY, drawWidth, drawHeight);
  drawPlanLegendForPdf(context, pageWidth, pageHeight);
  drawPlanDateForPdf(context, getPrintDateText(getFormData().inspectionDate), pageWidth);

  return { canvas };
}

async function createPhotoPdfCanvas({ title, dateText, photos, pageIndex, kind, address = "", captionPrefix = "是正箇所" }) {
  const pageWidth = 1588;
  const pageHeight = 2246;
  const mm = pageWidth / 210;
  const margin = 10 * mm;
  const headerHeight = 12 * mm;
  const canvas = document.createElement("canvas");
  canvas.width = pageWidth;
  canvas.height = pageHeight;
  const context = canvas.getContext("2d", { alpha: false });

  context.fillStyle = "#fff";
  context.fillRect(0, 0, pageWidth, pageHeight);
  context.strokeStyle = "#d4ddd8";
  context.lineWidth = 2;
  context.strokeRect(1, 1, pageWidth - 2, pageHeight - 2);

  drawPdfPageHeader(context, {
    title,
    dateText,
    x: margin,
    y: margin,
    width: pageWidth - margin * 2,
    height: headerHeight
  });

  let gridTop = margin + headerHeight + 24;
  if (kind === "correction" && address) {
    drawAddressBox(context, margin, gridTop, pageWidth - margin * 2, 42, address);
    gridTop += 60;
  }

  const gap = (kind === "correction" ? 4 : 5) * mm;
  const gridHeight = pageHeight - gridTop - margin;
  const gridWidth = pageWidth - margin * 2;
  const cellWidth = (gridWidth - gap * 2) / 3;
  const cellHeight = (gridHeight - gap * 2) / 3;
  const figureGap = 1.5 * mm;
  const captionHeight = (kind === "correction" ? 13 : 5) * mm;
  const frameHeight = cellHeight - figureGap - captionHeight;

  for (let index = 0; index < 9; index += 1) {
    const row = Math.floor(index / 3);
    const column = index % 3;
    const x = margin + column * (cellWidth + gap);
    const y = gridTop + row * (cellHeight + gap);
    const photo = photos[index];
    const serial = pageIndex * 9 + index + 1;

    await drawPhotoSlot(context, {
      photo,
      serial,
      x,
      y,
      width: cellWidth,
      frameHeight,
      captionY: y + frameHeight + figureGap,
      captionHeight,
      kind,
      captionPrefix
    });
  }

  return canvas;
}

function drawPdfPageHeader(context, { title, dateText, x, y, width, height }) {
  context.fillStyle = "#fff";
  context.fillRect(x, y, width, height);
  context.strokeStyle = "#9fb4ac";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);

  context.fillStyle = "#0b4f43";
  context.fillRect(x, y, 12, height);

  context.fillStyle = "#111816";
  context.font = "700 34px system-ui, -apple-system, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "middle";
  context.fillText(title, x + 32, y + height / 2);

  const label = dateText || "確認日";
  const datePaddingX = 18;
  const dateBoxHeight = height - 26;
  context.font = "700 18px system-ui, -apple-system, sans-serif";
  const dateBoxWidth = Math.min(300, Math.max(170, context.measureText(label).width + datePaddingX * 2));
  const dateX = x + width - dateBoxWidth - 22;
  const dateY = y + (height - dateBoxHeight) / 2;
  context.fillStyle = "#f7faf8";
  context.fillRect(dateX, dateY, dateBoxWidth, dateBoxHeight);
  context.strokeStyle = "#c9d4ce";
  context.strokeRect(dateX, dateY, dateBoxWidth, dateBoxHeight);
  context.fillStyle = "#111816";
  context.textAlign = "center";
  context.fillText(label, dateX + dateBoxWidth / 2, y + height / 2);
}

function drawPlanDateForPdf(context, dateText, pageWidth) {
  if (!dateText) return;
  const paddingX = 18;
  const boxHeight = 44;
  context.font = "700 24px system-ui, -apple-system, sans-serif";
  const boxWidth = context.measureText(dateText).width + paddingX * 2;
  const x = pageWidth - boxWidth - 32;
  const y = 28;
  context.fillStyle = "rgba(255, 255, 255, 0.92)";
  context.fillRect(x, y, boxWidth, boxHeight);
  context.strokeStyle = "rgba(34, 34, 34, 0.35)";
  context.lineWidth = 2;
  context.strokeRect(x, y, boxWidth, boxHeight);
  context.fillStyle = "#111";
  context.textAlign = "right";
  context.textBaseline = "middle";
  context.fillText(dateText, x + boxWidth - paddingX, y + boxHeight / 2);
}

function drawAddressBox(context, x, y, width, height, address) {
  const labelWidth = 18 * (1588 / 210);
  context.fillStyle = "#fbfdfc";
  context.fillRect(x, y, width, height);
  context.strokeStyle = "#9fb4ac";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, height);
  context.fillStyle = "#edf4f1";
  context.fillRect(x, y, labelWidth, height);
  context.beginPath();
  context.moveTo(x + labelWidth, y);
  context.lineTo(x + labelWidth, y + height);
  context.stroke();
  context.fillStyle = "#0b4f43";
  context.font = "700 20px system-ui, -apple-system, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText("住所", x + labelWidth / 2, y + height / 2);
  context.fillStyle = "#111";
  context.font = "700 20px system-ui, -apple-system, sans-serif";
  context.textAlign = "left";
  context.fillText(address, x + labelWidth + 14, y + height / 2);
}

async function drawPhotoSlot(context, options) {
  const { photo, serial, x, y, width, frameHeight, captionY, captionHeight, kind, captionPrefix = "是正箇所" } = options;
  context.fillStyle = "#fafcfb";
  context.fillRect(x, y, width, frameHeight);
  context.strokeStyle = "#b8c8c0";
  context.lineWidth = 2;
  context.strokeRect(x, y, width, frameHeight);

  if (photo?.src) {
    try {
      const image = await getPhotoImage(photo);
      drawCoverImage(context, image, x + 1, y + 1, width - 2, frameHeight - 2);
    } catch (error) {
      drawMissingPhoto(context, x, y, width, frameHeight);
    }
  }

  if (kind === "correction") {
    if (!photo) {
      context.fillStyle = "#111";
      context.font = "18px system-ui, -apple-system, sans-serif";
      context.textAlign = "center";
      context.textBaseline = "top";
      context.fillText(String(serial), x + width / 2, captionY + 4);
      return;
    }

    context.fillStyle = "#fbfdfc";
    context.fillRect(x, captionY, width, captionHeight);
    context.strokeStyle = "#9fb4ac";
    context.lineWidth = 2;
    context.strokeRect(x, captionY, width, captionHeight);
    drawWrappedText(context, photo?.comment || `${captionPrefix} ${serial}`, x + 10, captionY + 12, width - 20, captionHeight - 18, {
      font: "700 18px system-ui, -apple-system, sans-serif",
      lineHeight: 23,
      align: "center"
    });
    return;
  }

  context.fillStyle = "#111";
  context.font = "700 18px system-ui, -apple-system, sans-serif";
  context.textAlign = "center";
  context.textBaseline = "top";
  context.fillText(String(serial), x + width / 2, captionY + 4);
}

function drawCoverImage(context, image, x, y, width, height) {
  const imageWidth = image.naturalWidth || image.width;
  const imageHeight = image.naturalHeight || image.height;
  const scale = Math.max(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;
  context.save();
  context.beginPath();
  context.rect(x, y, width, height);
  context.clip();
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  context.restore();
}

function drawMissingPhoto(context, x, y, width, height) {
  context.fillStyle = "#fff";
  context.fillRect(x + 1, y + 1, width - 2, height - 2);
}

function drawWrappedText(context, text, x, y, width, height, options) {
  const chars = Array.from(String(text || ""));
  const lines = [];
  let line = "";
  context.font = options.font;
  for (const char of chars) {
    const test = line + char;
    if (context.measureText(test).width > width && line) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const lineHeight = options.lineHeight;
  const visibleLines = lines.slice(0, Math.max(1, Math.floor(height / lineHeight)));
  context.fillStyle = "#111";
  context.textBaseline = "top";
  context.textAlign = options.align || "left";
  const textX = options.align === "center" ? x + width / 2 : x;
  const startY = y + Math.max(0, (height - visibleLines.length * lineHeight) / 2);
  visibleLines.forEach((item, index) => {
    context.fillText(item, textX, startY + index * lineHeight);
  });
}

async function cachePhotoImage(photo) {
  if (!photo?.src) return null;
  try {
    const image = await loadImage(photo.src);
    setPhotoImageElement(photo, image);
    return image;
  } catch (error) {
    return null;
  }
}

async function getPhotoImage(photo) {
  if (photo?.imageElement) return photo.imageElement;
  const image = await loadImage(photo.src);
  setPhotoImageElement(photo, image);
  return image;
}

function setPhotoImageElement(photo, image) {
  Object.defineProperty(photo, "imageElement", {
    value: image,
    enumerable: false,
    configurable: true
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawPlanMarkersForPdf(context, drawX, drawY, drawWidth, drawHeight) {
  const size = 34;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = "700 19px system-ui, -apple-system, sans-serif";
  state.planMarkers.forEach((marker) => {
    const x = drawX + (drawWidth * marker.x) / 100;
    const y = drawY + (drawHeight * marker.y) / 100;
    context.beginPath();
    context.arc(x, y, size / 2, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 255, 255, 0.92)";
    context.fill();
    context.lineWidth = 3;
    context.strokeStyle = "#111";
    context.stroke();
    context.fillStyle = "#111";
    context.fillText(marker.symbol, x, y + 1);
  });
}

function drawPlanLegendForPdf(context, pageWidth, pageHeight) {
  const legend = [
    ["1", "建具（窓・扉）不具合"],
    ["2", "建具（網戸・雨戸）不具合"],
    ["3", "クレセント / 取手不具合"],
    ["4", "電気不具合"],
    ["5", "水漏れ"],
    ["6", "木部腐食"],
    ["7", "シロアリ跡あり"],
    ["8", "外壁不具合"],
    ["●", "雨漏れ跡"],
    ["○", "床鳴り"]
  ];
  const margin = 26;
  const boxHeight = 58;
  const boxY = pageHeight - boxHeight - 18;
  const columns = 5;
  const columnWidth = (pageWidth - margin * 2) / columns;

  context.fillStyle = "rgba(255, 255, 255, 0.94)";
  context.fillRect(margin, boxY, pageWidth - margin * 2, boxHeight);
  context.strokeStyle = "#111";
  context.lineWidth = 2;
  context.strokeRect(margin, boxY, pageWidth - margin * 2, boxHeight);
  context.fillStyle = "#111";
  context.font = "700 12px system-ui, -apple-system, sans-serif";
  context.textAlign = "left";
  context.textBaseline = "top";

  legend.forEach(([symbol, label], index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = margin + column * columnWidth + 10;
    const y = boxY + 9 + row * 23;
    context.fillText(`${symbol} ${label}`, x, y);
  });
}

function canvasToJpegBytes(canvas) {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      blob.arrayBuffer().then((buffer) => resolve(new Uint8Array(buffer)));
    }, "image/jpeg", 0.92);
  });
}

function canvasToBlob(canvas, type, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("画像圧縮に失敗しました"));
    }, type, quality);
  });
}

async function renderPrintPageToCanvas(pageElement) {
  const width = 794;
  const height = 1123;
  const scale = 2;
  const clone = pageElement.cloneNode(true);
  clone.style.width = `${width}px`;
  clone.style.height = `${height}px`;
  clone.style.minHeight = `${height}px`;
  clone.style.margin = "0";
  clone.style.border = "0";
  clone.style.boxShadow = "none";
  clone.style.boxSizing = "border-box";
  await inlineCloneImages(clone);

  const css = getSerializableStyles();
  const html = new XMLSerializer().serializeToString(clone);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <foreignObject width="100%" height="100%">
        <div xmlns="http://www.w3.org/1999/xhtml">
          <style>
            ${css}
            .print-page { margin: 0 !important; border: 0 !important; box-shadow: none !important; }
          </style>
          ${html}
        </div>
      </foreignObject>
    </svg>
  `;
  const image = await loadImage(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const context = canvas.getContext("2d");
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas;
}

async function inlineCloneImages(root) {
  const images = [...root.querySelectorAll("img")];
  await Promise.all(images.map(async (image) => {
    if (!image.src || image.src.startsWith("data:")) return;
    try {
      const blob = await fetch(image.src).then((response) => response.blob());
      image.src = await blobToDataUrl(blob);
    } catch (error) {
      image.removeAttribute("src");
    }
  }));
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function getSerializableStyles() {
  return [...document.styleSheets].map((sheet) => {
    try {
      return [...sheet.cssRules].map((rule) => rule.cssText).join("\n");
    } catch (error) {
      return "";
    }
  }).join("\n");
}

function createImagePdf(pages) {
  const encoder = new TextEncoder();
  const chunks = [];
  const offsets = [0];
  let offset = 0;

  const addBytes = (bytes) => {
    chunks.push(bytes);
    offset += bytes.length;
  };
  const addText = (text) => addBytes(encoder.encode(text));
  const startObject = (number) => {
    offsets[number] = offset;
    addText(`${number} 0 obj\n`);
  };
  const endObject = () => addText("\nendobj\n");

  addText("%PDF-1.4\n");
  startObject(1);
  addText("<< /Type /Catalog /Pages 2 0 R >>");
  endObject();
  startObject(2);
  addText(`<< /Type /Pages /Kids [${pages.map((_, index) => `${3 + index * 3} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  endObject();

  pages.forEach((page, index) => {
    const pageObject = 3 + index * 3;
    const imageObject = pageObject + 1;
    const contentObject = pageObject + 2;
    startObject(pageObject);
    addText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${page.pageWidth} ${page.pageHeight}] /Resources << /XObject << /Im${index} ${imageObject} 0 R >> >> /Contents ${contentObject} 0 R >>`);
    endObject();
    startObject(imageObject);
    addText(`<< /Type /XObject /Subtype /Image /Width ${page.imageWidth} /Height ${page.imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${page.imageBytes.length} >>\nstream\n`);
    addBytes(page.imageBytes);
    addText("\nendstream");
    endObject();
    startObject(contentObject);
    const content = `q ${page.pageWidth} 0 0 ${page.pageHeight} 0 0 cm /Im${index} Do Q`;
    addText(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    endObject();
  });

  const xrefOffset = offset;
  const objectCount = 2 + pages.length * 3;
  addText(`xref\n0 ${objectCount + 1}\n0000000000 65535 f \n`);
  for (let index = 1; index <= objectCount; index += 1) {
    addText(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  addText(`trailer\n<< /Size ${objectCount + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

  const result = new Uint8Array(offset);
  let cursor = 0;
  chunks.forEach((chunk) => {
    result.set(chunk, cursor);
    cursor += chunk.length;
  });
  return result;
}

function downloadBlob(blob, filename) {
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

function updateCorrectionPhoto(id, field, value) {
  const photo = state.correctionPhotos.find((item) => item.id === id);
  if (!photo) return;

  photo[field] = value;
  saveDraft();
}

function chunk(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function splitIntoColumns(items, columnCount) {
  const size = Math.ceil(items.length / columnCount);
  return Array.from({ length: columnCount }, (_, index) => {
    const start = index * size;
    return items.slice(start, start + size);
  });
}

function getSelectedOutputs() {
  return [...outputInputs]
    .filter((input) => input.checked)
    .map((input) => input.value);
}

function setOutputSelection(values) {
  outputInputs.forEach((input) => {
    input.checked = values.includes(input.value);
  });
  saveDraft();
}

function previewSelectedOutputs() {
  if (!buildPreview()) return;
  previewDialog.showModal();
}

function previewOnly(outputType) {
  setOutputSelection([outputType]);
  showPage("output");
  previewSelectedOutputs();
}

function selectPlanSymbol(symbol) {
  selectedPlanSymbol = PLAN_SYMBOLS.includes(symbol) ? symbol : PLAN_SYMBOLS[0];
  symbolChips.forEach((chip) => {
    chip.classList.toggle("is-active", chip.dataset.symbol === selectedPlanSymbol);
  });
}

function addPlanMarker(symbol, clientX, clientY) {
  if (!state.floorPlan?.src) {
    saveStatus.textContent = "図面を追加";
    return;
  }

  const position = getPlanPosition(clientX, clientY);
  if (!position) return;

  state.planMarkers.push({
    id: createId(),
    symbol,
    ...position
  });
  renderFloorPlan();
  saveDraft();
}

function movePlanMarker(id, clientX, clientY, shouldSave = true) {
  const marker = state.planMarkers.find((item) => item.id === id);
  const position = getPlanPosition(clientX, clientY);
  if (!marker || !position) return;

  marker.x = position.x;
  marker.y = position.y;
  const markerElement = floorPlanBoard.querySelector(`[data-marker-id="${id}"]`);
  if (markerElement) {
    markerElement.style.left = `${marker.x}%`;
    markerElement.style.top = `${marker.y}%`;
  } else {
    renderFloorPlan();
  }
  if (shouldSave) saveDraft();
}

function getPlanPosition(clientX, clientY) {
  const canvas = floorPlanBoard.querySelector(".plan-canvas");
  if (!canvas) return null;

  const rect = canvas.getBoundingClientRect();
  const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
  const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
  return {
    x: Number(x.toFixed(2)),
    y: Number(y.toFixed(2))
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function clearPlanMarkers() {
  state.planMarkers = [];
  renderFloorPlan();
  saveDraft();
}

function undoPlanMarker() {
  state.planMarkers.pop();
  renderFloorPlan();
  saveDraft();
}

function setPlanZoom(nextZoom) {
  state.planView.zoom = clamp(nextZoom, 1, 4);
  constrainPlanPan();
  applyPlanView();
  if (state.planView.zoom === 1) floorPlanBoard.scrollTo({ left: 0, top: 0 });
  saveDraft();
}

function resetPlanView() {
  state.planView = {
    zoom: 1,
    panX: 0,
    panY: 0
  };
  applyPlanView();
  floorPlanBoard.scrollTo({ left: 0, top: 0 });
  saveDraft();
}

function applyPlanView() {
  const canvas = floorPlanBoard.querySelector(".plan-canvas");
  if (canvas) canvas.style.cssText = getPlanCanvasStyle();
  floorPlanBoard.classList.toggle("is-zoomed", state.planView.zoom > 1);
}

function panPlan(deltaX, deltaY) {
  if (state.planView.zoom <= 1) return;
  state.planView.panX += deltaX;
  state.planView.panY += deltaY;
  constrainPlanPan();
  applyPlanView();
}

function constrainPlanPan() {
  const board = floorPlanBoard.getBoundingClientRect();
  const canvas = floorPlanBoard.querySelector(".plan-canvas");
  if (!canvas) return;
  const maxX = (board.width * (state.planView.zoom - 1)) / 2;
  const maxY = (board.height * (state.planView.zoom - 1)) / 2;
  state.planView.panX = clamp(state.planView.panX, -maxX, maxX);
  state.planView.panY = clamp(state.planView.panY, -maxY, maxY);
}

function createId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `photo-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function nextFrame() {
  return new Promise((resolve) => requestAnimationFrame(() => resolve()));
}

function revokePhotoUrl(photo) {
  if (photo?.src?.startsWith("blob:")) URL.revokeObjectURL(photo.src);
}

function getOutputFileName() {
  const data = getFormData();
  const name = String(data.propertyName || "").trim();
  return sanitizeFileName(name) || "完工報告書";
}

function sanitizeFileName(value) {
  return value
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, 80)
    .trim();
}

function setPrintDocumentTitle() {
  document.title = getOutputFileName();
  setPrintPageSizeHint();
}

function restoreDocumentTitle() {
  document.title = DEFAULT_DOCUMENT_TITLE;
  printPageStyle.textContent = "";
  document.body.classList.remove("force-plan-rotate");
}

function setPrintPageSizeHint() {
  const selectedOutputs = getSelectedOutputs();
  if (selectedOutputs.length === 1 && selectedOutputs[0] === "plan" && state.floorPlan?.src) {
    document.body.classList.remove("force-plan-rotate");
    printPageStyle.textContent = `
      @media print {
        @page {
          size: A4 ${getPlanOrientation(state.floorPlan)};
          margin: 0;
        }
      }
    `;
    return;
  }

  document.body.classList.toggle(
    "force-plan-rotate",
    selectedOutputs.includes("plan") && selectedOutputs.length > 1 && isIosPrintBrowser()
  );
  printPageStyle.textContent = "";
}

function isIosPrintBrowser() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
    || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function statusLabel(value) {
  return {
    none: "なし",
    check: "あり",
    repair: "是正",
    unknown: "-"
  }[value] || "-";
}

function inspectionLabel(value) {
  return {
    ok: "○",
    check: "△",
    repair: "×",
    unknown: "-"
  }[value] || "-";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

initApp();

form.addEventListener("input", saveDraft);
form.addEventListener("change", saveDraft);

correctionReportTypeInputs.forEach((input) => {
  input.addEventListener("change", () => {
    updateCorrectionModeView();
    renderCorrectionPhotos();
  });
});

completionInput.addEventListener("change", async (event) => {
  const files = [...event.target.files];
  event.target.value = "";
  await appendPhotos(files, state.completionPhotos, renderCompletionPhotos);
});

correctionInput.addEventListener("change", async (event) => {
  const files = [...event.target.files];
  event.target.value = "";
  await appendPhotos(files, state.correctionPhotos, renderCorrectionPhotos, (photo) => ({
    ...photo,
    comment: ""
  }));
});

floorPlanInput.addEventListener("change", async (event) => {
  const file = [...event.target.files].find((item) => item.type.startsWith("image/"));
  event.target.value = "";
  if (!file) return;

  revokePhotoUrl(state.floorPlan);
  state.floorPlan = await readPlanFile(file);
  state.planMarkers = [];
  state.planView = {
    zoom: 1,
    panX: 0,
    panY: 0
  };
  renderFloorPlan();
  saveDraft();
  await persistDraftAssets(activeDraftId);
});

completionPreview.addEventListener("click", (event) => {
  const id = event.target.dataset.removeCompletion;
  if (!id) return;
  const photo = state.completionPhotos.find((item) => item.id === id);
  revokePhotoUrl(photo);
  state.completionPhotos = state.completionPhotos.filter((photo) => photo.id !== id);
  renderCompletionPhotos();
  saveDraft();
});

correctionList.addEventListener("click", (event) => {
  const id = event.target.dataset.removeCorrection;
  if (!id) return;
  const photo = state.correctionPhotos.find((item) => item.id === id);
  revokePhotoUrl(photo);
  state.correctionPhotos = state.correctionPhotos.filter((photo) => photo.id !== id);
  renderCorrectionPhotos();
  saveDraft();
});

correctionList.addEventListener("input", (event) => {
  const card = event.target.closest("[data-correction-id]");
  const field = event.target.dataset.correctionField;
  if (!card || !field) return;
  updateCorrectionPhoto(card.dataset.correctionId, field, event.target.value);
});

correctionList.addEventListener("change", (event) => {
  const card = event.target.closest("[data-correction-id]");
  const field = event.target.dataset.correctionField;
  if (!card || !field) return;
  updateCorrectionPhoto(card.dataset.correctionId, field, event.target.value);
});

document.querySelector("#previewButton").addEventListener("click", () => {
  previewSelectedOutputs();
});

document.querySelector("#closePreviewButton").addEventListener("click", () => {
  previewDialog.close();
});

document.querySelector("#printButton").addEventListener("click", async () => {
  try {
    await exportSelectedPdfDirect();
  } catch (error) {
    saveStatus.textContent = "PDF作成エラー";
  }
});

window.addEventListener("beforeprint", () => {
  if (!buildPreview()) return;
  setPrintDocumentTitle();
  document.body.classList.add("is-printing");
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("is-printing");
  restoreDocumentTitle();
  restoreOutputSnapshotIfNeeded();
});

window.addEventListener("pagehide", () => {
  saveOutputSnapshot();
  saveDraft();
  persistDraftAssets(activeDraftId);
});

window.addEventListener("pageshow", () => {
  restoreOutputSnapshotIfNeeded();
});

document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") {
    saveOutputSnapshot();
    saveDraft();
    persistDraftAssets(activeDraftId);
    return;
  }
  restoreOutputSnapshotIfNeeded();
});

document.querySelector("#exportJsonButton").addEventListener("click", exportJson);

draftSelect.addEventListener("input", handleDraftSelectChange);
draftSelect.addEventListener("change", handleDraftSelectChange);

homeDraftGrid.addEventListener("click", async (event) => {
  const deleteButton = event.target.closest("[data-delete-draft]");
  if (deleteButton) {
    event.preventDefault();
    event.stopPropagation();
    await deleteDraft(deleteButton.dataset.deleteDraft);
    showHome();
    return;
  }

  const card = event.target.closest("[data-open-draft]");
  if (!card) return;
  await openDraft(card.dataset.openDraft);
});

homeNewDraftButton.addEventListener("click", createNewDraft);

backHomeButton.addEventListener("click", async () => {
  saveDraft();
  cancelScheduledAssetPersist();
  await persistDraftAssets(activeDraftId);
  showHome();
});

deleteDraftButton.addEventListener("click", async () => {
  const deleted = await deleteDraft(activeDraftId);
  if (deleted) showHome();
});

document.querySelector("#resetButton").addEventListener("click", () => {
  if (!confirm("入力内容をリセットしますか？")) return;
  activeDraftId = createId();
  localStorage.setItem(ACTIVE_DRAFT_STORAGE_KEY, activeDraftId);
  resetCurrentForm();
  saveDraft();
  showPage("report");
  saveStatus.textContent = "新規下書き";
});

pageTabs.forEach((tab) => {
  tab.addEventListener("click", () => showPage(tab.dataset.pageTab));
});

document.querySelectorAll("[data-output-only]").forEach((button) => {
  button.addEventListener("click", () => previewOnly(button.dataset.outputOnly));
});

symbolChips.forEach((chip) => {
  chip.addEventListener("click", () => selectPlanSymbol(chip.dataset.symbol));
  chip.addEventListener("dragstart", (event) => {
    selectPlanSymbol(chip.dataset.symbol);
    event.dataTransfer.setData("text/plain", chip.dataset.symbol);
  });
});

floorPlanBoard.addEventListener("dragstart", (event) => {
  const marker = event.target.closest("[data-marker-id]");
  if (!marker) return;
  draggedMarkerId = marker.dataset.markerId;
  event.dataTransfer.setData("text/plain", marker.textContent.trim());
});

floorPlanBoard.addEventListener("dragover", (event) => {
  if (!state.floorPlan?.src) return;
  event.preventDefault();
});

floorPlanBoard.addEventListener("drop", (event) => {
  event.preventDefault();
  const symbol = event.dataTransfer.getData("text/plain") || selectedPlanSymbol;
  if (draggedMarkerId) {
    movePlanMarker(draggedMarkerId, event.clientX, event.clientY);
    draggedMarkerId = null;
    return;
  }
  addPlanMarker(symbol, event.clientX, event.clientY);
});

floorPlanBoard.addEventListener("click", (event) => {
  if (event.target.closest("[data-marker-id]")) return;
  if (planPointerMoved) {
    planPointerMoved = false;
    return;
  }
  addPlanMarker(selectedPlanSymbol, event.clientX, event.clientY);
});

floorPlanBoard.addEventListener("pointerdown", (event) => {
  const marker = event.target.closest("[data-marker-id]");
  lastPlanPointerStart = Date.now();
  planPointerMoved = false;
  if (marker) {
    event.preventDefault();
    floorPlanBoard.setPointerCapture(event.pointerId);
    draggedMarkerId = marker.dataset.markerId;
  }
});

floorPlanBoard.addEventListener("pointermove", (event) => {
  if (draggedMarkerId) {
    planPointerMoved = true;
    movePlanMarker(draggedMarkerId, event.clientX, event.clientY, false);
  }
});

floorPlanBoard.addEventListener("pointerup", () => {
  if (draggedMarkerId || isPanningPlan) saveDraft();
  draggedMarkerId = null;
  isPanningPlan = false;
  planPanStart = null;
});

window.addEventListener("pointerup", () => {
  if (draggedMarkerId || isPanningPlan) saveDraft();
  draggedMarkerId = null;
  isPanningPlan = false;
  planPanStart = null;
});

floorPlanBoard.addEventListener("mousedown", (event) => {
  if (Date.now() - lastPlanPointerStart < 500) return;
  if (event.button !== 0) return;
  const marker = event.target.closest("[data-marker-id]");
  planPointerMoved = false;
  if (marker) {
    event.preventDefault();
    draggedMarkerId = marker.dataset.markerId;
  }
});

window.addEventListener("mousemove", (event) => {
  if (draggedMarkerId) {
    planPointerMoved = true;
    movePlanMarker(draggedMarkerId, event.clientX, event.clientY, false);
  }
});

window.addEventListener("mouseup", () => {
  if (draggedMarkerId || isPanningPlan) saveDraft();
  draggedMarkerId = null;
  isPanningPlan = false;
  planPanStart = null;
});

document.querySelector("#undoPlanMarker").addEventListener("click", undoPlanMarker);
document.querySelector("#clearPlanMarkers").addEventListener("click", clearPlanMarkers);
document.querySelector("#zoomInPlan").addEventListener("click", () => setPlanZoom(state.planView.zoom + 0.5));
document.querySelector("#zoomOutPlan").addEventListener("click", () => setPlanZoom(state.planView.zoom - 0.5));
document.querySelector("#resetPlanView").addEventListener("click", resetPlanView);

floorPlanBoard.addEventListener("wheel", (event) => {
  if (!state.floorPlan?.src) return;
  event.preventDefault();
  const direction = event.deltaY > 0 ? -0.25 : 0.25;
  setPlanZoom(state.planView.zoom + direction);
}, { passive: false });
