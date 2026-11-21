#!/usr/bin/env bash
# Copy the asset library into Remotion's public/ folder (Remotion serves only public/).
set -e
cd "$(dirname "$0")/.."
mkdir -p public/assets
cp -ru assets/images assets/videos assets/engine assets/blueprint assets/illustrations public/assets/
echo "public/assets synced"
