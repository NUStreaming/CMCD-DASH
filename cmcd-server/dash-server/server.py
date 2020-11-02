from threading import Thread
from socketserver import ThreadingMixIn
from http.server import HTTPServer, BaseHTTPRequestHandler
from http import HTTPStatus

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(HTTPStatus.OK)
        # self.send_header("X-Accel-Limit-Rate", 100)  # Alternative method for nginx rate control
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        print(self.path)
        with open(self.path[1:], 'rb') as file: 
            self.wfile.write(file.read()) # Read the file and send the contents 

class ThreadingHTTPServer(ThreadingMixIn, HTTPServer):
    daemon_threads = True

def serve_on_port(port):
    server = ThreadingHTTPServer(("localhost", port), Handler)
    server.serve_forever()

# Thread(target=serve_on_port, args=[8082]).start()
serve_on_port(8081)