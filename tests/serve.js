import { createServer } from 'node:http';
import { createReadStream } from 'node:fs';
import { resolve } from 'node:path';

const files = new Map([
  ['/', ['index.html', 'text/html']],
  ['/index.html', ['index.html', 'text/html']],
  ['/app.js', ['app.js', 'text/javascript']],
  ['/schedule.js', ['schedule.js', 'text/javascript']],
  ['/style.css', ['style.css', 'text/css']],
  ['/sw.js', ['sw.js', 'text/javascript']],
  ['/manifest.webmanifest', ['manifest.webmanifest', 'application/manifest+json']],
  ['/icon.svg', ['icon.svg', 'image/svg+xml']]
]);
createServer((request, response) => {
  const file = files.get(new URL(request.url, 'http://localhost').pathname);
  if (!file) { response.writeHead(404).end(); return; }
  response.writeHead(200, { 'Content-Type': file[1] });
  createReadStream(resolve(file[0])).pipe(response);
}).listen(4173, '127.0.0.1');
