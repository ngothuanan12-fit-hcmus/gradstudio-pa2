// The test gate: the mock answers as docs/api/ says. Each test starts its own mock as a child process on its own port,
// then stops that child only. Run with `npm test` (node --test), locally and in CI.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
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

test('POST /api/bookings/:id/cancel cancels a booking and releases its held slot', async () => {
  const mock = await startMock('normal', 3205);
  try {
    const headers = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const before = await fetch(`${mock.base}/api/schedule/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        date: '2026-10-24',
        makeup: { from: '08:00', to: '09:00', staffId: 'u-mai' },
        shoot: { from: '09:00', to: '11:00', staffId: 'u-tuan', roomId: 'r-a' },
      }),
    });
    assert.equal(before.status, 200);
    assert.equal((await before.json()).available, false);

    const cancelled = await fetch(`${mock.base}/api/bookings/GS-1023/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason: 'Hủy theo yêu cầu' }),
    });
    assert.equal(cancelled.status, 200);
    assert.equal((await cancelled.json()).status, 'Đã hủy');

    const after = await fetch(`${mock.base}/api/schedule/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        date: '2026-10-24',
        makeup: { from: '08:00', to: '09:00', staffId: 'u-mai' },
        shoot: { from: '09:00', to: '11:00', staffId: 'u-tuan', roomId: 'r-a' },
      }),
    });
    assert.equal(after.status, 200);
    assert.equal((await after.json()).available, true);

    const reminders = await fetch(`${mock.base}/api/reminders?bookingId=GS-1023`, { headers });
    assert.deepEqual(await reminders.json(), []);
    const jobs = await fetch(`${mock.base}/api/jobs?bookingId=GS-1023`, { headers });
    assert.deepEqual(await jobs.json(), []);

    const again = await fetch(`${mock.base}/api/bookings/GS-1023/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    assert.equal(again.status, 409);
  } finally {
    await mock.stop();
  }
});

test('PATCH /api/bookings/:id locks deposit once depositStatus is paid', async () => {
  const mock = await startMock('normal', 3206);
  try {
    const headers = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const updated = await fetch(`${mock.base}/api/bookings/GS-1023`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ people: 22 }),
    });
    assert.equal(updated.status, 200);
    const body = await updated.json();
    assert.equal(body.pricing.total, 7700000);
    assert.equal(body.pricing.deposit, 2100000);
    assert.equal(body.pricing.remainder, 5600000);

    const tooLow = await fetch(`${mock.base}/api/bookings/GS-1023`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ people: 5 }),
    });
    assert.equal(tooLow.status, 409);

    const empty = await fetch(`${mock.base}/api/bookings/GS-1023`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({}),
    });
    assert.equal(empty.status, 400);
    const emptyBody = await empty.json();
    assert.equal(emptyBody.error.message, 'Chọn thông tin cần thay đổi.');
    assert.deepEqual(emptyBody.error.fields, {});
  } finally {
    await mock.stop();
  }
});

test('GET /api/previews/:id serves seed and uploaded image files', async () => {
  const mock = await startMock('normal', 3207);
  try {
    const expectedSeed = fs.readFileSync(path.join(ROOT, 'client/public/photos/tot-nghiep-900.webp'));
    const seedRes = await fetch(`${mock.base}/api/previews/prv-gs-1022-1`, {
      headers: { Authorization: 'Bearer token-u-customer2' },
    });
    assert.equal(seedRes.status, 200);
    assert.equal(seedRes.headers.get('content-type'), 'image/webp');
    assert.ok(Buffer.from(await seedRes.arrayBuffer()).equals(expectedSeed));

    const unassigned = await fetch(`${mock.base}/api/previews/prv-gs-1020-1`, {
      headers: { Authorization: 'Bearer token-u-staff3' },
    });
    assert.equal(unassigned.status, 403);

    const pngBytes = Buffer.from('\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR', 'latin1');
    const form = new FormData();
    form.append('file', new Blob([pngBytes], { type: 'image/png' }), 'test-preview.png');
    const up = await fetch(`${mock.base}/api/bookings/GS-1022/previews`, {
      method: 'POST',
      headers: { Authorization: 'Bearer token-u-tuan' },
      body: form,
    });
    assert.equal(up.status, 201);
    const created = await up.json();
    assert.ok(created.url.startsWith('/api/previews/'));

    const got = await fetch(`${mock.base}${created.url}`, {
      headers: { Authorization: 'Bearer token-u-customer2' },
    });
    assert.equal(got.status, 200);
    assert.equal(got.headers.get('content-type'), 'image/png');
    assert.ok(Buffer.from(await got.arrayBuffer()).equals(pngBytes));
  } finally {
    await mock.stop();
  }
});

test('checkSchedule picks the first candidate window still free after busy blocks fill earlier ones', async () => {
  const mock = await startMock('normal', 3208);
  try {
    const adminHeaders = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const linhHeaders = { Authorization: 'Bearer token-u-linh', 'Content-Type': 'application/json' };
    const convRes = await fetch(`${mock.base}/api/conversations`, {
      method: 'POST',
      headers: linhHeaders,
      body: JSON.stringify({
        text: 'Em hỏi lịch 24/10',
        request: {
          serviceId: 'tot-nghiep',
          packageId: 'tot-nghiep-premium',
          date: '2026-10-24',
          time: '09:00',
          people: 1,
          extras: [{ extraId: 'makeup' }],
        },
      }),
    });
    assert.equal(convRes.status, 201, await convRes.clone().text());
    const conv = await convRes.json();
    const propRes = await fetch(`${mock.base}/api/conversations/${conv.id}/proposals`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        date: '2026-10-24',
        makeup: { from: '13:00', to: '14:00', staffId: 'u-mai' },
        shoot: { from: '14:00', to: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      }),
    });
    assert.equal(propRes.status, 201, await propRes.clone().text());
    const ansRes = await fetch(`${mock.base}/api/conversations/${conv.id}/proposals/pr-1/answer`, {
      method: 'POST',
      headers: linhHeaders,
      body: JSON.stringify({ answer: 'agree' }),
    });
    assert.equal(ansRes.status, 200, await ansRes.clone().text());
    const bookRes = await fetch(`${mock.base}/api/bookings`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        conversationId: conv.id,
        serviceId: 'tot-nghiep',
        packageId: 'tot-nghiep-premium',
        people: 1,
      }),
    });
    assert.equal(bookRes.status, 201, await bookRes.clone().text());
    const booking = await bookRes.json();
    const payRes = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: linhHeaders,
      body: JSON.stringify({ bookingId: booking.id, kind: 'deposit' }),
    });
    assert.equal(payRes.status, 201, await payRes.clone().text());
    const pay = await payRes.json();
    const resRes = await fetch(`${mock.base}/api/payments/${pay.id}/result`, {
      method: 'POST',
      headers: linhHeaders,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(resRes.status, 200, await resRes.clone().text());

    const sched = await fetch(`${mock.base}/api/schedule?date=2026-10-24`, { headers: adminHeaders });
    const schedBody = await sched.json();
    assert.equal('costumes' in schedBody, false);
    assert.deepEqual(schedBody.freeTime, {
      makeup: { from: '16:00', to: '17:00' },
      shoot: { from: '17:00', to: '18:00' },
    });

    const clash = await fetch(`${mock.base}/api/schedule/check`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        date: '2026-10-24',
        makeup: null,
        shoot: { from: '14:00', to: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      }),
    });
    const clashBody = await clash.json();
    assert.equal(clashBody.available, false);
    assert.deepEqual(clashBody.freeTime, {
      makeup: { from: '16:00', to: '17:00' },
      shoot: { from: '17:00', to: '18:00' },
    });
  } finally {
    await mock.stop();
  }
});
