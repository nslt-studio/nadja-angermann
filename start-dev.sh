#!/bin/bash

echo ""
echo "🚀 Starting development environment..."
echo ""

# Start Python server in background
python3 -u dev-server.py &
SERVER_PID=$!

# Wait for server to start
sleep 2

echo ""
echo "🔗 Creating public tunnel via serveo.net..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Create tunnel via serveo.net
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=60 -R 80:localhost:8000 serveo.net 2>&1 | while IFS= read -r line; do
    echo "$line"
    if [[ $line == *"Forwarding HTTP traffic from"* ]]; then
        # Extract URL from serveo output
        URL=$(echo "$line" | grep -oE 'https://[^ ]+')
        if [[ ! -z "$URL" ]]; then
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "✅ TUNNEL CRÉÉ !"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "📋 COPIEZ CETTE URL DANS WEBFLOW:"
            echo ""
            echo "   $URL/main.js"
            echo ""
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo ""
            echo "⚡ Workflow:"
            echo "   1. Modifiez main.js dans VS Code"
            echo "   2. Cmd+S pour sauvegarder"
            echo "   3. Rechargez votre page Webflow"
            echo "   4. Les changements sont instantanés !"
            echo ""
            echo "⚠️  Gardez ce terminal ouvert pendant le développement"
            echo "   Press Ctrl+C pour arrêter"
            echo ""
        fi
    fi
done

# Cleanup on exit
kill $SERVER_PID 2>/dev/null
