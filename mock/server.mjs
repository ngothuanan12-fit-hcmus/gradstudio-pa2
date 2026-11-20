// The GradStudio mock API: answers exactly as docs/api/ says. Node built-in modules only, so it runs with no npm install.
//   node mock/server.mjs                     port 3001, normal mode
//   PORT=3002 MOCK_MODE=slow node mock/server.mjs
// Modes: normal (about 150 ms), slow (2 s), error (500 for every request except sign-in),
// empty (every list in an answer is [], also inside objects; single objects still answer).
// Data starts from mock/data/*.json, changes stay in memory, and a restart starts over.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fail, notFound } from './lib.mjs';
import auth from './routes/auth.mjs';
import catalogue from './routes/catalogue.mjs';
import admin from './routes/admin.mjs';
import conversations from './routes/conversations.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 3001;
const MODE = process.env.MOCK_MODE || 'normal';
const DELAY = { normal: 150, slow: 2000, error: 150, empty: 150 };
const MAX_BODY = 1024 * 1024;

if (!(MODE in DELAY)) {
  console.error(`MOCK_MODE must be normal, slow, error or empty (got "${MODE}")`);
  process.exit(1);
}

// One module per resource, each a list of { method, path, handler }. Paths may hold :params.
const ROUTES = [...auth, ...catalogue, ...conversations, ...admin].map((route) => ({
  ...route,
  pattern: new RegExp(`^${route.path.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
}));

// Every mock/data/*.json file becomes db.<name>, read once at start.
function loadData() {
  const dir = path.join(HERE, 'data');
  const db = {};
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    db[path.basename(file, '.json')] = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
  }
  return db;
}

// In empty mode every array, at any depth, becomes [].
function emptyLists(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, emptyLists(v)]));
  }
  return value;
}

function readJson(req) {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size <= MAX_BODY) chunks.push(chunk);
    });
    req.on('end', () => {
      if (size > MAX_BODY) return resolve({ tooLarge: true });
      const text = Buffer.concat(chunks).toString('utf8');
      if (!text) return resolve({ body: null });
      try {
        resolve({ body: JSON.parse(text) });
      } catch {
        resolve({ badJson: true });
      }
    });
  });
}

const db = loadData();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let answer;
  const route = ROUTES.find((r) => r.method === req.method && r.pattern.test(url.pathname));

  if (!route) answer = notFound();
  else if (MODE === 'error' && !route.signIn) answer = fail(500, 'SERVER_ERROR', 'Máy chủ đang gặp lỗi. Thử lại sau.');
  else {
    const isJson = (req.headers['content-type'] || '').startsWith('application/json');
    const read = isJson ? await readJson(req) : { body: null };
    if (read.tooLarge) answer = fail(413, 'PAYLOAD_TOO_LARGE', 'Dữ liệu gửi lên quá lớn.');
    else if (read.badJson)
      answer = fail(400, 'VALIDATION_ERROR', 'Dữ liệu gửi lên không phải JSON hợp lệ.', { fields: {} });
    else {
      try {
        const params = url.pathname.match(route.pattern).groups || {};
        answer = await route.handler({ req, body: read.body, params, query: url.searchParams, db });
      } catch (err) {
        console.error(err);
        answer = fail(500, 'SERVER_ERROR', 'Máy chủ đang gặp lỗi. Thử lại sau.');
      }
    }
  }

  if (MODE === 'empty' && answer.status < 400) answer = { ...answer, body: emptyLists(answer.body) };

  setTimeout(() => {
    res.writeHead(answer.status, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify(answer.body));
    console.log(`${req.method} ${url.pathname}${url.search} ${answer.status}`);
  }, DELAY[MODE]);
});

server.listen(PORT, () => console.log(`GradStudio mock on http://localhost:${PORT} (MOCK_MODE=${MODE})`));
