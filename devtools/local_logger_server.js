/**
 * Local Logger Server (no deps)
 * - Accepts POST /ingest with JSON payload of { errors:[], warnings:[], logs:[], ts }
 * - Appends to devtools/logs/console-YYYY-MM-DD.json as JSON Lines (one object per line)
 * - CORS enabled; GET /health returns { ok: true }
 * - GET /logs/latest?limit=100 returns last N lines from today
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const { spawn } = require('child_process');
const ROOT = process.cwd();
const LOG_DIR = path.join(ROOT, 'devtools', 'logs');
const TEST_RUNS_DIR = path.join(ROOT, 'devtools', 'test_runs');

ensureDir(LOG_DIR);
ensureDir(TEST_RUNS_DIR);

let lastRun = { id: null, status: 'idle', startedAt: null, finishedAt: null, ok: null, logFile: null };
let running = false;

function playwrightBin() {
  const bin = process.platform === 'win32' ? 'playwright.cmd' : 'playwright';
  return path.join(ROOT, 'node_modules', '.bin', bin);
}

function startTestRun() {
  if (running) return { error: 'already_running' };
  const id = 'run_' + Date.now();
  const logFile = path.join(TEST_RUNS_DIR, `${id}.log`);

  lastRun = { id, status: 'running', startedAt: new Date().toISOString(), finishedAt: null, ok: null, logFile };
  running = true;

  const out = fs.createWriteStream(logFile, { flags: 'a' });
  // Use npx to invoke Playwright reliably across platforms
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const args = ['playwright', 'test', 'tests/e2e/devtools.spec.js', '--reporter=line'];

  try {
    const child = spawn(npx, args, { cwd: ROOT, shell: true });
    child.stdout.on('data', (d) => out.write(d));
    child.stderr.on('data', (d) => out.write(d));
    child.on('close', (code) => {
      running = false;
      lastRun.status = 'finished';
      lastRun.finishedAt = new Date().toISOString();
      lastRun.ok = code === 0;
      out.end();
    });
  } catch (e) {
    running = false;
    lastRun.status = 'error';
    lastRun.finishedAt = new Date().toISOString();
    lastRun.ok = false;
    fs.appendFileSync(logFile, `\nERROR: ${String(e?.message || e)}\n`);
  }

  return { id, logFile };
}

const PORT = process.env.PORT ? Number(process.env.PORT) : (process.env.LOG_SERVER_PORT ? Number(process.env.LOG_SERVER_PORT) : 3002);

// Ensure directories exist
function ensureDir(p) {
  if (!fs.existsSync(p)) {
    fs.mkdirSync(p, { recursive: true });
  }
}


function todayFilePath() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return path.join(LOG_DIR, `console-${yyyy}-${mm}-${dd}.jsonl`);
}

function writeJsonLine(obj) {
  const line = JSON.stringify(obj) + '\n';
  fs.appendFile(todayFilePath(), line, (err) => {
    if (err) console.error('Failed to append log:', err);
  });
}

function send(res, status, data, headers = {}) {
  const body = typeof data === 'string' ? data : JSON.stringify(data);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    ...headers,
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}


function tailFile(filePath, limit = 100) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split('\n');
    const last = lines.slice(-limit);
    return last.map((l) => JSON.parse(l));
  } catch (_) {
    return [];
  }
}

const server = http.createServer(async (req, res) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return send(res, 204, '');
  }

  if (req.url === '/health' && req.method === 'GET') {
    return send(res, 200, { ok: true, ts: new Date().toISOString() });
  }

  if (req.url.startsWith('/logs/latest') && req.method === 'GET') {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const limit = Number(url.searchParams.get('limit') || '100');
    return send(res, 200, { entries: tailFile(todayFilePath(), limit) });
  }
  if (req.url === '/run-tests' && (req.method === 'POST' || req.method === 'GET')) {
    if (running) return send(res, 409, { ok: false, error: 'Tests already running', lastRun });
    const started = startTestRun();
    if (started.error) return send(res, 400, { ok: false, error: started.error });
    return send(res, 202, { ok: true, run: started });
  }

  if (req.url === '/test-runs/latest' && req.method === 'GET') {
    let tail = [];
    try {
      if (lastRun.logFile && fs.existsSync(lastRun.logFile)) {
        const content = fs.readFileSync(lastRun.logFile, 'utf8');
        const lines = content.trim().split('\n');
        tail = lines.slice(-100);
      }
    } catch (_) {}
    return send(res, 200, { ok: true, lastRun, tail });
  }


  if (req.url === '/ingest' && req.method === 'POST') {
    try {
      const raw = await readBody(req);
      const payload = raw ? JSON.parse(raw) : {};
      const { errors = [], warnings = [], logs = [], ts = new Date().toISOString() } = payload;

      // Write a single line entry with batches to keep IOPS low
      writeJsonLine({ ts, counts: { errors: errors.length, warnings: warnings.length, logs: logs.length } });

      // Also write individual entries as separate lines (optional; can be commented out if too chatty)
      const meta = { receivedAt: new Date().toISOString() };
      errors.forEach((e) => writeJsonLine({ type: 'error', ...e, ...meta }));
      warnings.forEach((w) => writeJsonLine({ type: 'warning', ...w, ...meta }));
      logs.forEach((l) => writeJsonLine({ type: 'log', ...l, ...meta }));

      return send(res, 200, { ok: true, stored: { errors: errors.length, warnings: warnings.length, logs: logs.length } });
    } catch (err) {
      console.error('Ingest error:', err);

      return send(res, 400, { ok: false, error: String(err?.message || err) });
    }
  }

  // Fallback
  return send(res, 404, { ok: false, error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`📝 Local Logger Server running on http://localhost:${PORT}`);
  console.log(`    Writing logs to: ${todayFilePath()}`);
});

