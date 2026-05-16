#!/bin/bash

echo ""
echo "  Starting development environment..."
echo ""

# Kill any process already using port 8000
lsof -ti:8000 | xargs kill -9 2>/dev/null

# Resolve script directory (handles spaces in path)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Build + watch in background
"$SCRIPT_DIR/node_modules/.bin/esbuild" src/index.js \
  --bundle \
  --outfile=dist/main.js \
  --format=iife \
  --target=es2020 \
  --watch=forever &
ESBUILD_PID=$!

sleep 1

# Start HTTP server in background
python3 -u dev-server.py &
SERVER_PID=$!

sleep 1

echo "  Creating public tunnel via Cloudflare..."
echo "----------------------------------------------------"
echo ""

# Create tunnel via Cloudflare
npx cloudflared tunnel --url http://localhost:8000 2>&1 | while IFS= read -r line; do
    if [[ $line == *"trycloudflare.com"* ]]; then
        URL=$(echo "$line" | grep -oE 'https://[^ ]+trycloudflare\.com')
        if [[ ! -z "$URL" ]]; then
            echo "----------------------------------------------------"
            echo "  TUNNEL READY"
            echo "----------------------------------------------------"
            echo ""
            echo "  Webflow script tag:"
            echo ""
            echo "  <script src=\"$URL/main.js\"></script>"
            echo ""
            echo "----------------------------------------------------"
            echo ""
            echo "  Workflow:"
            echo "    1. Edit src/index.js"
            echo "    2. Save (esbuild rebuilds automatically)"
            echo "    3. Reload Webflow page"
            echo ""
            echo "  Keep this terminal open."
            echo "  Press Ctrl+C to stop."
            echo ""
        fi
    fi
done

# Cleanup
kill $ESBUILD_PID 2>/dev/null
kill $SERVER_PID 2>/dev/null
