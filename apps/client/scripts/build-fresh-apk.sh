#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "[1/4] Building static web assets for mobile..."
MOBILE_BUILD=true bun run build

echo "[2/4] Syncing Capacitor Android project..."
bun run cap:sync:android

echo "[3/4] Cleaning previous Android build outputs..."
cd android
./gradlew clean

echo "[4/4] Building fresh debug APK..."
./gradlew assembleDebug

APK_PATH="$ROOT_DIR/android/app/build/outputs/apk/debug/app-debug.apk"
echo "APK ready: $APK_PATH"
