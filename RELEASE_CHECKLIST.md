# 公開前チェックリスト

更新時は、公開前にこの順番で確認します。

## 1. 変更内容

- [ ] 何を変更したか説明できる
- [ ] `CHANGELOG.md` に日付と変更内容を書いた
- [ ] `app.js` の `APP_VERSION` を必要に応じて上げた
- [ ] `index.html` と `service-worker.js` の `?v=` が `APP_VERSION` と一致している

## 2. ローカル確認

- [ ] `bash scripts/prepublish-check.sh` が成功する
- [ ] 入力画面で新しい項目が表示される
- [ ] PDFプレビューで文字位置とチェック位置が崩れていない
- [ ] PDF保存ボタンでエラーが出ない

## 3. GitHub公開

- [ ] `git status --short` で公開対象の差分だけになっている
- [ ] `git commit` で変更ログを残した
- [ ] `git push origin main` でGitHubへ更新した
- [ ] GitHub Pages のビルドが成功した
- [ ] 公開URLで新しい `app.js?v=` と `styles.css?v=` が読み込まれている

公開URL: https://keisho78.github.io/sanjo-completion-report/

