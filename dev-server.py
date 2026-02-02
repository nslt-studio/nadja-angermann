#!/usr/bin/env python3
import http.server
import socketserver
import threading
import time
import sys
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

PORT = 8000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def log_message(self, format, *args):
        pass  # Suppress default logs

class FileChangeHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if event.src_path.endswith('main.js'):
            timestamp = time.strftime('%H:%M:%S')
            print(f'✅ [{timestamp}] main.js updated - changes live!', flush=True)

def start_server():
    # Start file watcher
    event_handler = FileChangeHandler()
    observer = Observer()
    observer.schedule(event_handler, path='.', recursive=False)
    observer.start()

    # Start HTTP server in background thread
    httpd = socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    print(f'\n🚀 Dev Server Started!\n', flush=True)
    print(f'📂 Local:  http://localhost:{PORT}/main.js\n', flush=True)
    print('━' * 50, flush=True)
    print('⚠️  NEXT STEP: Create public URL', flush=True)
    print('━' * 50, flush=True)
    print('\nOption 1 - Manual tunnel (dans un autre terminal):', flush=True)
    print(f'   ssh -R 80:localhost:{PORT} nokey@localhost.run\n', flush=True)
    print('Option 2 - Use ngrok (si vous avez un compte):', flush=True)
    print(f'   ngrok http {PORT}\n', flush=True)
    print('Option 3 - Test en local seulement:', flush=True)
    print(f'   http://localhost:{PORT}/main.js', flush=True)
    print('━' * 50, flush=True)
    print('\n👀 Watching for changes...\n', flush=True)
    print('Press Ctrl+C to stop\n', flush=True)

    try:
        # Keep running
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print('\n👋 Shutting down dev server...', flush=True)
        observer.stop()
        observer.join()
        httpd.shutdown()

if __name__ == '__main__':
    start_server()
