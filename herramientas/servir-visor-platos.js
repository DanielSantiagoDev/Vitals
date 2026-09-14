// Servidor estático + API mínima de escritura (sin dependencias) para visor-platos.html.
// Sirve el visor desde herramientas/ y lee/edita datos/dieta/platos.yaml, tocando solo
// las líneas del plato afectado y dejando el resto del archivo intacto.
// Uso: node herramientas/servir-visor-platos.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 5173;
const VISOR = 'visor-platos.html';
const VISOR_PATH = path.join(__dirname, VISOR);
const PLATOS_PATH = path.resolve(__dirname, '..', 'datos', 'dieta', 'platos.yaml');
const URL = `http://localhost:${PORT}/${VISOR}`;

const ESTADOS_VALIDOS = ['me_gusta', 'por_probar'];

if (!fs.existsSync(PLATOS_PATH)) {
  console.error(`No existe ${PLATOS_PATH}.`);
  console.error('Crea tus datos primero con la skill "inicio" (o copia plantillas/ a datos/).');
  process.exit(1);
}

function sanitizeTag(tag) {
  return String(tag)
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_\-áéíóúñ]/gi, '');
}

// Localiza las líneas [inicio, fin) del bloque de un plato dentro del YAML, buscando
// la línea exacta `  - nombre: "X"` y cortando en la siguiente entrada o fin de archivo.
function encontrarBloque(lines, nombre) {
  const inicio = lines.findIndex(l => l.trim() === `- nombre: "${nombre}"`);
  if (inicio === -1) return null;
  let fin = lines.length;
  for (let i = inicio + 1; i < lines.length; i++) {
    if (/^\s*-\s+nombre:/.test(lines[i])) { fin = i; break; }
  }
  return { inicio, fin };
}

function reemplazarCampo(lines, inicio, fin, campo, nuevoValor) {
  for (let i = inicio; i < fin; i++) {
    const m = lines[i].match(new RegExp(`^(\\s+${campo}:\\s*).*$`));
    if (m) {
      lines[i] = m[1] + nuevoValor;
      return true;
    }
  }
  return false;
}

function actualizarPlato(nombre, campo, nuevoValor) {
  const raw = fs.readFileSync(PLATOS_PATH, 'utf8');
  const eol = raw.includes('\r\n') ? '\r\n' : '\n';
  const lines = raw.split(/\r?\n/);
  const bloque = encontrarBloque(lines, nombre);
  if (!bloque) throw new Error(`Plato no encontrado: ${nombre}`);
  const ok = reemplazarCampo(lines, bloque.inicio, bloque.fin, campo, nuevoValor);
  if (!ok) throw new Error(`Campo "${campo}" no encontrado en el plato: ${nombre}`);
  fs.writeFileSync(PLATOS_PATH, lines.join(eol));
}

function leerBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
      if (data.length > 1e6) req.destroy(); // límite generoso, evita payloads absurdos
    });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (e) { reject(new Error('JSON inválido')); }
    });
    req.on('error', reject);
  });
}

function jsonResponse(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

async function manejarApi(req, res, pathname) {
  if (req.method !== 'POST') return jsonResponse(res, 405, { error: 'Método no permitido' });

  let body;
  try { body = await leerBody(req); }
  catch (e) { return jsonResponse(res, 400, { error: e.message }); }

  const nombre = body.nombre;
  if (!nombre || typeof nombre !== 'string') {
    return jsonResponse(res, 400, { error: 'Falta "nombre"' });
  }

  try {
    if (pathname === '/api/estado') {
      const { estado } = body;
      if (!ESTADOS_VALIDOS.includes(estado)) {
        return jsonResponse(res, 400, { error: `estado inválido, usa: ${ESTADOS_VALIDOS.join('|')}` });
      }
      actualizarPlato(nombre, 'estado', estado);
      return jsonResponse(res, 200, { ok: true });
    }

    if (pathname === '/api/tags') {
      if (!Array.isArray(body.tags)) return jsonResponse(res, 400, { error: '"tags" debe ser un array' });
      const tags = [...new Set(body.tags.map(sanitizeTag).filter(Boolean))];
      actualizarPlato(nombre, 'tags', `[${tags.join(', ')}]`);
      return jsonResponse(res, 200, { ok: true, tags });
    }

    return jsonResponse(res, 404, { error: 'Ruta no encontrada' });
  } catch (e) {
    return jsonResponse(res, 500, { error: e.message });
  }
}

function servirArchivo(res, filePath, contentType) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('No encontrado');
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

// Solo dos archivos servibles: el visor y platos.yaml. Nada más de datos/ sale por HTTP.
const server = http.createServer((req, res) => {
  const pathname = decodeURIComponent(req.url.split('?')[0]);

  if (pathname.startsWith('/api/')) {
    manejarApi(req, res, pathname);
    return;
  }
  if (pathname === '/' || pathname === `/${VISOR}`) {
    return servirArchivo(res, VISOR_PATH, 'text/html; charset=utf-8');
  }
  if (pathname === '/platos.yaml') {
    return servirArchivo(res, PLATOS_PATH, 'text/plain; charset=utf-8');
  }
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('No encontrado: ' + pathname);
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Visor de platos: ${URL}`);
  console.log(`Leyendo: ${PLATOS_PATH}`);
  console.log('Deja esta ventana abierta mientras uses el visor. Ctrl+C para parar.');

  if (process.env.VITALS_NO_ABRIR) return;
  const opener = process.platform === 'win32' ? `start "" "${URL}"`
    : process.platform === 'darwin' ? `open "${URL}"`
    : `xdg-open "${URL}"`;
  exec(opener, err => { if (err) console.error('No se pudo abrir el navegador automáticamente:', err.message); });
});
