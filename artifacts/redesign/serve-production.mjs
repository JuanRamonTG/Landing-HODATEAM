import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = resolve(fileURLToPath(new URL('../..', import.meta.url)));
const staticRoot = resolve(projectRoot, 'dist/hodateam/browser');
const port = Number(process.env.PORT ?? 4200);
const contentTypes = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webp', 'image/webp'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.svg', 'image/svg+xml'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

if (!existsSync(resolve(staticRoot, 'index.html'))) {
  throw new Error(`Production entry point not found under ${staticRoot}. Run npm run build first.`);
}

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const requestedPath = resolve(staticRoot, relativePath);

  if (requestedPath !== staticRoot && !requestedPath.startsWith(`${staticRoot}${sep}`)) {
    response.writeHead(403).end();
    return;
  }

  if (!existsSync(requestedPath) || !statSync(requestedPath).isFile()) {
    response.writeHead(404).end();
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes.get(extname(requestedPath)) ?? 'application/octet-stream',
    'Cache-Control': 'no-cache',
    'X-Content-Type-Options': 'nosniff',
  });
  createReadStream(requestedPath).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Serving optimized Angular output on http://127.0.0.1:${port}/`);
});
