# -*- coding: utf-8 -*-
"""Servidor de prueba: sirve un PNG a cualquier ruta y registra lo que pide el televisor."""
import http.server, socketserver, os, sys

AQUI = os.path.dirname(os.path.abspath(__file__))
LOG = os.path.join(AQUI, "peticiones_logo.txt")
PNG = bytes.fromhex(
 "89504e470d0a1a0a0000000d49484452000000100000001008060000001ff3ff610000001c49444154"
 "789c63fcffff3f0313301a0000ff0f0301c0a1b0ed0000000049454e44ae426082")

class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        with open(LOG, "a", encoding="utf-8") as f:
            f.write("%s  %s\n" % (self.client_address[0], self.path))
        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(PNG)))
        self.end_headers()
        self.wfile.write(PNG)
    def log_message(self, *a):
        pass

if __name__ == "__main__":
    puerto = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    with socketserver.TCPServer(("0.0.0.0", puerto), H) as httpd:
        print("sirviendo en el puerto %d, log en %s" % (puerto, LOG))
        httpd.serve_forever()