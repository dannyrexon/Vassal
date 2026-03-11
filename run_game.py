import http.server
import socketserver
import webbrowser
import socket
import os
import sys

# -------------------------------
# Find a free port automatically
# -------------------------------
def find_free_port():
    s = socket.socket()
    s.bind(('', 0))
    port = s.getsockname()[1]
    s.close()
    return port

PORT = find_free_port()

# -------------------------------
# Ensure index.html exists
# -------------------------------
if not os.path.exists("index.html"):
    print("ERROR: index.html not found in this folder.")
    print("Make sure run_game.py is inside your project directory.")
    sys.exit(1)

# -------------------------------
# Start server
# -------------------------------
Handler = http.server.SimpleHTTPRequestHandler

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:

        url = f"http://localhost:{PORT}/index.html"

        print("\nColonization Clone Local Server")
        print("--------------------------------")
        print(f"Serving folder: {os.getcwd()}")
        print(f"Game URL: {url}")
        print("\nPress CTRL+C to stop the server.\n")

        # open browser automatically
        webbrowser.open(url)

        httpd.serve_forever()

except KeyboardInterrupt:
    print("\nServer stopped.")
