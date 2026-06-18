const commonItems = [
  "建具（窓・扉）不具合",
  "建具（網戸・雨戸）不具合",
  "クレセント / 取手不具合",
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
  ["雨漏り跡", "天井 / 内壁", "シミ・浮き・カビの確認"],
  ["雨漏り跡", "その他不具合", "開口部・外壁側の確認"],
  ["腐食", "木部・鉄部", "腐食・サビ・欠損の確認"],
  ["躯体", "内外木部 / 基礎", "ひび・欠損の確認"],
  ["バルコニー", "防水層", "浮き・破れ・排水の確認"],
  ["外壁", "仕上げ材浮き", "浮き・剥がれ・割れの確認"],
  ["外壁", "クラック", "ひび割れ幅・範囲の確認"],
  ["外壁", "シーリング", "破断・隙間・劣化の確認"],
  ["基礎", "クラック", "幅・深さ・範囲の確認"],
  ["外構", "その他不具合", "門扉・塀・土間の確認"],
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
const PHOTO_STATUS_BATCH_SIZE = 50;
const PLAN_SYMBOLS = ["1", "2", "3", "4", "5", "6", "7", "8", "●", "○"];

const form = document.querySelector("#reportForm");
const saveStatus = document.querySelector("#saveStatus");
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
const pageTabs = document.querySelectorAll("[data-page-tab]");
const pagePanels = document.querySelectorAll("[data-page-panel]");
const outputInputs = document.querySelectorAll("[name^='output_']");
const symbolChips = document.querySelectorAll("[data-symbol]");
let selectedPlanSymbol = PLAN_SYMBOLS[0];
let draggedMarkerId = null;
let isPanningPlan = false;
let planPanStart = null;
let planPointerMoved = false;
let lastPlanPointerStart = 0;

document.head.append(printPageStyle);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js?v=28").catch(() => {
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
  commonChecks.innerHTML = commonItems.map((item, index) => `
    <div class="common-row">
      <div class="check-title">${index + 1}. ${item}</div>
      ${makeSegmented(`common_${index}`, [
        { label: "なし", value: "none" },
        { label: "確認", value: "check" },
        { label: "是正", value: "repair" },
        { label: "-", value: "unknown" }
      ])}
    </div>
  `).join("");

  inspectionChecks.innerHTML = inspectionItems.map(([place, item, hint], index) => `
    <div class="inspection-row">
      <div class="inspection-meta">
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

async function appendPhotos(files, collection, render, decoratePhoto) {
  const list = [...files].filter((file) => file.type.startsWith("image/"));
  if (!list.length) return;

  setPhotoInputsDisabled(true);
  try {
    const addedPhotos = [];
    for (let index = 0; index < list.length; index += 1) {
      try {
        const photo = readPhotoFile(list[index]);
        addedPhotos.push(decoratePhoto ? decoratePhoto(photo) : photo);
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
  } finally {
    setPhotoInputsDisabled(false);
  }
}

function readPhotoFile(file) {
  return {
    id: createId(),
    name: file.name,
    src: URL.createObjectURL(file)
  };
}

function readPlanFile(file) {
  const src = URL.createObjectURL(file);
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      resolve({
        id: createId(),
        name: file.name,
        src,
        width: image.naturalWidth || image.width,
        height: image.naturalHeight || image.height
      });
    };
    image.onerror = () => {
      resolve({
        id: createId(),
        name: file.name,
        src
      });
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
  completionPreview.innerHTML = state.completionPhotos.length
    ? state.completionPhotos.map((photo) => `
      <div class="photo-tile">
        <img src="${photo.src}" alt="${escapeHtml(photo.name)}" loading="lazy" decoding="async">
        <button type="button" data-remove-completion="${photo.id}" aria-label="写真を削除">×</button>
      </div>
    `).join("")
    : `<p class="empty-state">完工写真はまだ追加されていません。</p>`;
}

function renderCorrectionPhotos() {
  correctionList.innerHTML = state.correctionPhotos.length
    ? state.correctionPhotos.map((photo) => `
        <article class="correction-card" data-correction-id="${photo.id}">
          <img src="${photo.src}" alt="${escapeHtml(photo.name)}" loading="lazy" decoding="async">
          <button class="remove-photo" type="button" data-remove-correction="${photo.id}" aria-label="写真を削除">×</button>
          <label class="field">
            <span>是正依頼文</span>
            <textarea data-correction-field="comment" rows="2" placeholder="是正依頼文を入力">${escapeHtml(photo.comment || "")}</textarea>
          </label>
        </article>
      `).join("")
    : `<p class="empty-state">是正写真はまだ追加されていません。</p>`;
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
  data.completionPhotos = state.completionPhotos;
  data.correctionPhotos = state.correctionPhotos;
  data.floorPlan = state.floorPlan;
  data.planMarkers = state.planMarkers;
  data.planView = state.planView;
  return data;
}

function saveDraft() {
  try {
    localStorage.setItem("sanjo_completion_report_draft", JSON.stringify(getDraftDataForStorage()));
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
  return {
    ...data,
    completionPhotos: data.completionPhotos.map(({ id, name }) => ({ id, name })),
    correctionPhotos: data.correctionPhotos.map(({ id, name, comment }) => ({
      id,
      name,
      comment
    })),
    floorPlan: data.floorPlan ? {
      id: data.floorPlan.id,
      name: data.floorPlan.name,
      width: data.floorPlan.width,
      height: data.floorPlan.height
    } : null,
    planMarkers: data.planMarkers,
    planView: data.planView
  };
}

function loadDraft() {
  let data;
  try {
    const raw = localStorage.getItem("sanjo_completion_report_draft");
    if (!raw) return;
    data = JSON.parse(raw);
  } catch (error) {
    localStorage.removeItem("sanjo_completion_report_draft");
    return;
  }

  Object.entries(data).forEach(([key, value]) => {
    const field = form.elements[key];
    if (field && typeof value === "string") field.value = value;
  });

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

  state.completionPhotos = (data.completionPhotos || []).filter((photo) => photo.src);
  state.correctionPhotos = (data.correctionPhotos || []).filter((photo) => photo.src);
  state.planMarkers = Array.isArray(data.planMarkers) ? data.planMarkers : [];
  if (data.planView) {
    state.planView = {
      zoom: data.planView.zoom || 1,
      panX: data.planView.panX || 0,
      panY: data.planView.panY || 0
    };
  }
}

function buildPreview() {
  const data = getFormData();
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
  const planPage = includePlan && data.floorPlan?.src ? renderPlanPrintPage(data) : "";

  const html = `
    ${includeReport ? `
    <section class="print-page report-page">
      <h2>完工報告書</h2>
      <div class="report-meta">
        <div><strong>物件名</strong><span>${escapeHtml(data.propertyName || "")}</span></div>
        <div><strong>担当</strong><span>${escapeHtml(data.staffName || "")}</span></div>
        <div><strong>確認日</strong><span>${escapeHtml(data.inspectionDate || "")}</span></div>
        <div><strong>写真枚数</strong><span>${data.completionPhotos.length + data.correctionPhotos.length}枚</span></div>
      </div>
      <div class="report-top-grid">
        <section class="print-section compact-section">
          <h3>全物件共通</h3>
          <div class="common-columns">
            ${splitIntoColumns(data.common, 2).map((rows) => `
              <table class="print-table common-print-table">
                <tbody>
                  ${rows.map((row) => `
                    <tr>
                      <td>${escapeHtml(row.item)}</td>
                      <td>${statusLabel(row.status)}</td>
                    </tr>
                  `).join("")}
                </tbody>
              </table>
            `).join("")}
          </div>
        </section>
        <section class="print-section compact-section">
          <h3>メモ</h3>
          <div class="print-box">${escapeHtml(data.generalMemo || "")}</div>
        </section>
      </div>
      <section class="print-section compact-section">
        <h3>建物状況調査</h3>
        <div class="inspection-columns">
          ${splitIntoColumns(data.inspections, 2).map((rows) => `
            <table class="print-table inspection-print-table">
              <thead>
                <tr><th>箇所</th><th>確認事項</th><th>判定</th><th>メモ</th></tr>
              </thead>
              <tbody>
                ${rows.map((row) => `
                  <tr>
                    <td>${escapeHtml(row.place)}</td>
                    <td>${escapeHtml(row.item)}</td>
                    <td>${inspectionLabel(row.status)}</td>
                    <td>${escapeHtml(row.memo)}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          `).join("")}
        </div>
      </section>
      <div class="report-note">
        <section>
          <h3>・劣化事象等の記号について</h3>
          <div>「〇」直ちに補修すべき箇所は見当たらない</div>
          <div>「△」詳細調査した方が良い</div>
          <div>「×」明らかな不具合と判断される</div>
          <div>「ー」未確認箇所</div>
        </section>
        <section>
          <h3>・注意事項</h3>
          <div>本確認は瑕疵がないことを保証するものではありません。</div>
          <div>確認時点から時間経過による変化がないことを保証するものではありません。</div>
          <div>本確認は建築基準関係法令等への整合性を判定するものではありません。</div>
          <div>点検口があった場合のみの確認で、進入調査までは行いません。</div>
        </section>
      </div>
    </section>
    ` : ""}
    ${planPage}
    ${correctionPages.map((photos, pageIndex) => `
      <section class="print-page correction-page">
        <h2>是正箇所${correctionPages.length > 1 ? ` ${pageIndex + 1}` : ""}</h2>
        ${pageIndex === 0 ? `<div class="correction-address"><strong>住所</strong><span>${escapeHtml(data.propertyName || "")}</span></div>` : ""}
        <div class="print-photo-grid correction-grid ${pageIndex === 0 ? "has-correction-address" : ""}">
          ${renderNinePhotoSlots(photos, pageIndex, (photo, serial) => `
            <figure class="print-photo correction-print">
              <div class="photo-frame"><img src="${photo.src}" alt=""></div>
              <figcaption class="correction-caption">${escapeHtml(photo.comment || `是正箇所 ${serial}`)}</figcaption>
            </figure>
          `).join("")}
        </div>
      </section>
    `).join("")}
    ${completionPages.map((photos, pageIndex) => `
      <section class="print-page photo-page">
        <h2>完工写真${completionPages.length > 1 ? ` ${pageIndex + 1}` : ""}</h2>
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

function photoPages(photos) {
  return photos.length ? chunk(photos, 9) : [];
}

function renderPlanPrintPage(data) {
  const frameStyle = getPlanPrintFrameStyle(data.floorPlan);
  const orientation = getPlanOrientation(data.floorPlan);
  return `
    <section class="print-page plan-page is-${orientation}-plan">
      <h2>間取図面</h2>
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

  const jpegBytes = await canvasToJpegBytes(canvas);
  const pdfBytes = createSingleImagePdf(jpegBytes, canvas.width, canvas.height, 841.89, 595.28);
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  downloadBlob(blob, `${getOutputFileName()}_間取図.pdf`);
  saveStatus.textContent = "PDF保存";
  return true;
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

function createSingleImagePdf(imageBytes, imageWidth, imageHeight, pageWidth, pageHeight) {
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
  addText("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  endObject();
  startObject(3);
  addText(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  endObject();
  startObject(4);
  addText(`<< /Type /XObject /Subtype /Image /Width ${imageWidth} /Height ${imageHeight} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`);
  addBytes(imageBytes);
  addText("\nendstream");
  endObject();
  startObject(5);
  const content = `q ${pageWidth} 0 0 ${pageHeight} 0 0 cm /Im0 Do Q`;
  addText(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  endObject();

  const xrefOffset = offset;
  addText(`xref\n0 6\n0000000000 65535 f \n`);
  for (let index = 1; index <= 5; index += 1) {
    addText(`${String(offsets[index]).padStart(10, "0")} 00000 n \n`);
  }
  addText(`trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);

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
}

function setPrintPageSizeHint() {
  const selectedOutputs = getSelectedOutputs();
  if (selectedOutputs.length === 1 && selectedOutputs[0] === "plan" && state.floorPlan?.src) {
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

  printPageStyle.textContent = "";
}

function statusLabel(value) {
  return {
    none: "なし",
    check: "確認",
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

renderChecks();
loadDraft();
renderCompletionPhotos();
renderCorrectionPhotos();
renderFloorPlan();

form.addEventListener("input", saveDraft);
form.addEventListener("change", saveDraft);

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
  const selectedOutputs = getSelectedOutputs();
  if (selectedOutputs.length === 1 && selectedOutputs[0] === "plan") {
    await exportFloorPlanPdf();
    return;
  }
  if (!buildPreview()) return;
  setPrintDocumentTitle();
  document.body.classList.add("is-printing");
  requestAnimationFrame(() => {
    setTimeout(() => window.print(), 120);
  });
});

window.addEventListener("beforeprint", () => {
  if (!buildPreview()) return;
  setPrintDocumentTitle();
  document.body.classList.add("is-printing");
});

window.addEventListener("afterprint", () => {
  document.body.classList.remove("is-printing");
  restoreDocumentTitle();
});

document.querySelector("#exportJsonButton").addEventListener("click", exportJson);

document.querySelector("#resetButton").addEventListener("click", () => {
  if (!confirm("入力内容をリセットしますか？")) return;
  localStorage.removeItem("sanjo_completion_report_draft");
  form.reset();
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
  setOutputSelection(["report", "plan", "correction", "completion"]);
  showPage("report");
  saveStatus.textContent = "未保存";
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
