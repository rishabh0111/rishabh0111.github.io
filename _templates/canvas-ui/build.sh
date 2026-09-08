#!/usr/bin/env bash
# Rebuild the vendored Canvas UI Bubble effect.
#
# Canvas UI (github.com/DavidHDev/canvas-ui) ships its effects as TypeScript
# source you copy into your project via the shadcn CLI. This site has no
# bundler, so instead we vendor ONE effect, compiled to a plain classic
# script, and check the output into assets/js/vendor/.
#
# Only the `Bubble` effect is used, and only its standalone WebGL fallback
# path (the "html-in-canvas" path needs an experimental browser flag). The
# hero name effect is NOT Canvas UI — see assets/js/home-fx.js.
#
# To update: bump the two source files below from a canvas-ui checkout,
# then run this. Needs Node + npx (esbuild is fetched on demand).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="$here/../../assets/js/vendor/canvas-ui-bubble.js"

# bubble.entry.ts = src/lib/rect-cache.ts + src/lib/Bubble/BubbleVanilla.ts
# with the import line removed. Keep it in sync when upgrading.
npx --yes esbuild@0.25.0 "$here/bubble.entry.ts" \
  --bundle --format=iife --global-name=CanvasUIBubble \
  --minify --target=es2019 \
  --banner:js="$(cat "$here/banner.txt")" \
  --outfile="$out"

echo "wrote $out ($(wc -c < "$out") bytes)"
