// The test gate: the mock answers as docs/api/ says. Each test starts its own mock as a child process on its own port,
// then stops that child only. Run with `npm test` (node --test), locally and in CI.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Starts `node mock/server.mjs` and resolves once it prints that it is listening.
function startMock(mode, port) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ['mock/server.mjs'], {
      cwd: ROOT,
      env: { ...process.env, MOCK_MODE: mode, PORT: String(port) },
    });
    let out = '';
    const timer = setTimeout(() => reject(new Error(`mock did not start:\n${out}`)), 5000);
    child.stdout.on('data', (d) => {
      out += d;
      if (out.includes('GradStudio mock on')) {
        clearTimeout(timer);
        resolve({
          base: `http://localhost:${port}`,
          // Resolves once the child has exited, so its port is free again.
          stop: () => new Promise((done) => child.once('exit', done) && child.kill()),
        });
      }
    });
    child.stderr.on('data', (d) => (out += d));
  });
}

// Runs a Node script and resolves with its exit code and output.
function run(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { cwd: ROOT });
    let out = '';
    child.stdout.on('data', (d) => (out += d));
    child.stderr.on('data', (d) => (out += d));
    child.on('close', (code) => resolve({ code, out }));
  });
}

test('every example in docs/api/ gets the answer it shows from a fresh mock (contract-check)', async () => {
  const mock = await startMock('normal', 3201);
  try {
    const { code, out } = await run(['tools/contract-check.mjs', '--repo', '.', '--base', mock.base]);
    assert.equal(code, 0, `contract-check failed:\n${out}`);
  } finally {
    await mock.stop();
  }
});

test('error mode: sign-in still works, every other request answers 500 in the error shape', async () => {
  const mock = await startMock('error', 3202);
  try {
    const login = await fetch(`${mock.base}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'linh@gradstudio.test', password: 'linh-demo' }),
    });
    assert.equal(login.status, 200);
    const { token } = await login.json();
    const me = await fetch(`${mock.base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(me.status, 500);
    const body = await me.json();
    assert.equal(body.error.code, 'SERVER_ERROR');
    assert.equal(typeof body.error.message, 'string');
  } finally {
    await mock.stop();
  }
});

test('slow mode answers after about 2 seconds', async () => {
  const mock = await startMock('slow', 3203);
  try {
    const started = Date.now();
    const res = await fetch(`${mock.base}/api/auth/me`, { headers: { Authorization: 'Bearer token-u-linh' } });
    assert.equal(res.status, 200);
    assert.ok(Date.now() - started >= 1900, 'the answer came too early');
  } finally {
    await mock.stop();
  }
});

test('the token survives a restart of the mock', async () => {
  let mock = await startMock('normal', 3204);
  const login = await fetch(`${mock.base}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'thao@gradstudio.test', password: 'thao-demo' }),
  });
  const { token } = await login.json();
  await mock.stop();
  mock = await startMock('normal', 3204);
  try {
    const me = await fetch(`${mock.base}/api/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(me.status, 200);
    assert.equal((await me.json()).role, 'admin');
  } finally {
    await mock.stop();
  }
});
