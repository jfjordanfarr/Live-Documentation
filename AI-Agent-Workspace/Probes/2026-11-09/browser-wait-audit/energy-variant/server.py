from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
BASE='/tmp/live-docs-20261108-defaults-gate5/explorer';OUT=Path('/tmp/live-docs-20261109-waits/energy-variant')
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=BASE,**kwargs)
 def do_GET(self):
  path=urlsplit(self.path).path
  if path.endswith('/static/index.js') or path.endswith('/static/index.js.map'):
   p=OUT/'diagnostic'/path.rsplit('/',1)[-1]
   if p.is_file():
    b=p.read_bytes();self.send_response(200);self.send_header('Content-Type','application/javascript' if p.suffix=='.js' else 'application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(b)));self.end_headers();self.wfile.write(b);return
  return super().do_GET()
 def log_message(self,*args):pass
ThreadingHTTPServer(('127.0.0.1',8911),Handler).serve_forever()
