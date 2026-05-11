#!/usr/bin/env bash
set -euo pipefail

LOG_FILE="/tmp/anjungan-next-upload-dev.log"
PID_FILE="/tmp/anjungan-next-upload-dev.pid"
PNG_FILE="/tmp/anjungan-upload-smoke.png"

# 1x1 transparent png
base64 -d > "$PNG_FILE" <<'B64'
iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO6pU9QAAAAASUVORK5CYII=
B64

npm run dev > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
sleep 5

STATUS=$(curl -s -o /tmp/anjungan-upload-response.json -w "%{http_code}" -X POST \
  -F "file=@${PNG_FILE};type=image/png;filename=smoke.png" \
  -F "folder=uploads" \
  http://127.0.0.1:3000/api/upload)

kill "$(cat "$PID_FILE")" || true

if [[ "$STATUS" != "201" ]]; then
  echo "Upload smoke failed. Status: $STATUS"
  cat /tmp/anjungan-upload-response.json || true
  exit 1
fi

echo "Upload smoke status: $STATUS"
cat /tmp/anjungan-upload-response.json || true
