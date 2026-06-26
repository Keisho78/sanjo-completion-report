# 完工報告書スマホアプリ

このフォルダはPWA対応済みです。HTTPSで配信すると、スマホのホーム画面に追加して単体アプリのように起動できます。

## 使い方

1. `smartphone-report-form` フォルダをHTTPSで公開します。
2. スマホのブラウザで公開URLを開きます。
3. iPhoneはSafariの共有メニューから「ホーム画面に追加」を選びます。
4. AndroidはChromeのメニューから「アプリをインストール」または「ホーム画面に追加」を選びます。

初回読み込み後は、フォーム本体、CSS、JavaScript、アイコンが端末にキャッシュされます。

## フォルダ構成

- `index.html` 入力画面
- `app.js` 下書き保存、写真処理、PDF出力
- `styles.css` 画面表示と印刷プレビュー
- `assets/templates/` 完工報告書PDF出力で使う固定フォーマット
- `icons/` PWAアイコン
- `service-worker.js` オフラインキャッシュ

完工報告書の1ページ目は `assets/templates/completion-report-format.png` を背景として固定描画し、入力値だけを上に重ねてPDF化します。元PDFは `assets/templates/completion-report-format.pdf` に保管しています。

## 注意

PWAのインストールとオフラインキャッシュには、原則としてHTTPS配信が必要です。Macの `http://192.168...` から開く方法は動作確認には使えますが、スマホ単体で安定して使う本番運用には向きません。

写真を大量に添付すると、ブラウザの保存容量上限に達する可能性があります。本番化する場合は、写真をクラウドまたは社内サーバーへ保存する構成にしてください。
