#!/usr/bin/env python3
"""Local preview server that tells browsers not to cache anything.

Like `python3 -m http.server`, but every reload fetches the latest files, so
edits to site.js, styles.css or content.js show up straight away.

Usage:  python3 serve.py [folder] [port]
        python3 serve.py experiment03        # http://localhost:8000/
"""
import functools
import http.server
import sys

folder = sys.argv[1] if len(sys.argv) > 1 else "."
port = int(sys.argv[2]) if len(sys.argv) > 2 else 8000


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


handler = functools.partial(NoCacheHandler, directory=folder)
with http.server.ThreadingHTTPServer(("0.0.0.0", port), handler) as server:
    print(f"Serving {folder} at http://localhost:{port}/ (no caching)")
    server.serve_forever()
