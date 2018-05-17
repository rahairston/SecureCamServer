from BaseHTTPServer import BaseHTTPRequestHandler, HTTPServer
import SocketServer
import json
import urlparse
import os

from datetime import datetime

dt = datetime.today()

class S(BaseHTTPRequestHandler):
  
    def _set_headers(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, HEAD, POST, OPTIONS')
        self.end_headers()

    def do_GET(self):
        self._set_headers()
        parsed_path = urlparse.urlparse(self.path)
        request_id = parsed_path.path
        #if there is a pid file, then we are on
        if os.path.isfile('/home/pi/Documents/Projects/file.txt') :
            f = open('index2.html')
            response = f.read()
            self.wfile.write(response)
        else :
            f = open('index.html')
            response = f.read()
            self.wfile.write(response)

    def do_OPTIONS(self) :
        self._set_headers()

    def do_POST(self):
        self._set_headers()
        parsed_path = urlparse.urlparse(self.path)
        request_id = parsed_path.path
        content_len = int(self.headers.getheader('content-length', 0))
        post_body = self.rfile.read(content_len)
        response = self.security(post_body, request_id)
        self.wfile.write(json.dumps(response))

    def do_HEAD(self):
        self._set_headers()

    def security(self, password, request_id) :
        if password == 'Champ' :
            if request_id == '/on' :
                print 'Turning Security On'
                directory = '/home/pi/Pictures/camera/' + dt.strftime("%y%m%d%I%M%p") + '/'
                os.system("mkdir " + directory + "&& python /home/pi/Documents/Projects/sensor.py " + directory + " &")
            else :
                print 'Turning Security Off'
                f = open('/home/pi/Documents/Projects/file.txt', 'r')
                pid = f.read()
                f.close()
                os.system('kill ' + pid + ' && rm /home/pi/Documents/Projects/file.txt && bash /home/pi/Documents/Projects/mailAll.sh')
                print 'Pictures sent!'
            return 'ok'
        return 'wrong'

def run(server_class=HTTPServer, handler_class=S, port=8000):
    server_address = ('', port)
    httpd = server_class(server_address, handler_class)
    print 'Starting httpd...'
    httpd.serve_forever()

if __name__ == "__main__":
    from sys import argv

    directory = '/home/pi/Pictures/camera/' + dt.strftime("%y%m%d")

    if not os.path.isdir(directory) :
        print 'No current directory, making one'
        os.mkdir(directory)

    if len(argv) == 2:
        run(port=int(argv[1]))
    else:
        run(port=7000)
