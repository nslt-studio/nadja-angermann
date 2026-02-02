#!/usr/bin/env python3
import http.server
import socketserver
import threading
import time
import os

PORT = 8000
DIST_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dist")

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIST_DIR, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        self.send_header("Access-Control-Allow-Origin", "*")
        super().end_headers()

    def log_message(self, format, *args):
        pass

def start_server():
    os.makedirs(DIST_DIR, exist_ok=True)

    httpd = socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler)
    server_thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    server_thread.start()

    print(f"\n  Dev server running on http://localhost:{PORT}/main.js\n", flush=True)

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n  Shutting down...", flush=True)
        httpd.shutdown()

if __name__ == "__main__":
    start_server()
