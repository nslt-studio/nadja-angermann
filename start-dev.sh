#!/bin/bash

echo ""
echo "  Starting development environment..."
echo ""

# Build + watch in background
npx esbuild src/index.js \
  --bundle \
  --outfile=dist/main.js \
  --format=iife \
  --target=es2020 \
  --watch &
ESBUILD_PID=$!

sleep 1

# Start HTTP server in background
python3 -u dev-server.py &
SERVER_PID=$!

sleep 1

echo ""
echo "  Creating public tunnel via serveo.net..."
echo "----------------------------------------------------"
echo ""

# Create tunnel via serveo.net
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:8000 serveo.net 2>&1 | while IFS= read -r line; do
    echo "$line"
    if [[ $line == *"Forwarding HTTP traffic from"* ]]; then
        URL=$(echo "$line" | grep -oE 'https://[^ ]+')
        if [[ ! -z "$URL" ]]; then
            echo ""
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
