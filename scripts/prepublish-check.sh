#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

node --check app.js >/dev/null

test -f assets/templates/completion-report-format.png
test -f assets/templates/completion-report-format.pdf

version="$(sed -n 's/^const APP_VERSION = "\([^"]*\)";$/\1/p' app.js)"
if [ -z "$version" ]; then
  echo "APP_VERSION が app.js に見つかりません。" >&2
  exit 1
fi

grep -q "app.js?v=$version" index.html
grep -q "styles.css?v=$version" index.html
grep -q "service-worker.js?v=$version" app.js
grep -q "app.js?v=$version" service-worker.js
grep -q "styles.css?v=$version" service-worker.js
grep -q "completion-report-format.png?v=$version" service-worker.js

echo "公開前チェック OK: v$version"

