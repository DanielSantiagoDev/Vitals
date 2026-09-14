// Servidor estático mínimo (sin dependencias) para visor-dietas.html.
// Sirve el visor desde herramientas/ y los planes .html de datos/dieta/planes/, y expone
// /api/planes con el listado de planes disponibles, para que el visor pueda descubrirlos
// sin depender de una lista hardcodeada.
// Uso: node herramientas/servir-visor-dietas.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5174;
const VISOR = 'visor-dietas.html';
const VISOR_PATH = path.join(__dirname, VISOR);
const PLANES_DIR = path.resolve(__dirname, '..', 'datos', 'dieta', 'planes');
const URL = `http://localhost:${PORT}/${VISOR}`;

if (!fs.existsSync(PLANES_DIR)) {
  console.error(`No existe ${PLANES_DIR}.`);
  console.error('Crea tus datos primero con la skill "inicio" (o copia plantillas/ a datos/).');
  process.exit(1);
}

function jsonResponse(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

function listarPlanes() {
  return fs.readdirSync(PLANES_DIR)
    .filter(f => /\.html$/i.test(f))
    .map(f => ({ archivo: f, mtimeMs: fs.statSync(path.join(PLANES_DIR, f)).mtimeMs }));
}

function servirArchivo(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);

  if (pathname === '/api/planes') {
    try {
      return jsonResponse(res, 200, { planes: listarPlanes() });
    } catch (e) {
      return jsonResponse(res, 500, { error: e.message });
    }
  }

  if (pathname === '/' || pathname === `/${VISOR}`) {
    return servirArchivo(res, VISOR_PATH);
  }

  // Solo planes .html dentro de datos/dieta/planes/: nunca salir de esa carpeta.
  const filePath = path.resolve(PLANES_DIR, '.' + path.sep + path.normalize(pathname));
  if (!filePath.startsWith(PLANES_DIR + path.sep) || !/\.html$/i.test(filePath)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  servirArchivo(res, filePath);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Visor de dietas: ${URL}`);
  console.log(`Leyendo: ${PLANES_DIR}`);
  console.log('Deja esta ventana abierta mientras uses el visor. Ctrl+C para parar.');

  if (process.env.VITALS_NO_ABRIR) return;
  const opener = process.platform === 'win32' ? `start "" "${URL}"`
    : process.platform === 'darwin' ? `open "${URL}"`
    : `xdg-open "${URL}"`;
  exec(opener, err => { if (err) console.error('No se pudo abrir el navegador automáticamente:', err.message); });
});
