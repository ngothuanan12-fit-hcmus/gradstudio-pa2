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

    const reminders = await (await fetch(`${mock.base}/api/reminders?bookingId=GS-1023`, { headers })).json();
    assert.deepEqual(reminders, []);
    const jobs = await (await fetch(`${mock.base}/api/jobs?bookingId=GS-1023`, { headers })).json();
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].bookingStatus, 'Đã hủy');
    assert.equal(jobs[0].canUpdate, false);

    const patchCancelledJob = await fetch(`${mock.base}/api/jobs/${jobs[0].id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(patchCancelledJob.status, 409);

    const again = await fetch(`${mock.base}/api/bookings/GS-1023/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({}),
    });
    assert.equal(again.status, 409);

    // Cancelling a booking linked to a conversation (GS-1022 -> c-customer2) keeps the conversation in Đã chốt lịch.
    const cancelWithConv = await fetch(`${mock.base}/api/bookings/GS-1022/cancel`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ reason: 'Khách đổi kế hoạch' }),
    });
    assert.equal(cancelWithConv.status, 200);
    const convRes = await fetch(`${mock.base}/api/conversations/c-customer2`, { headers });
    assert.equal(convRes.status, 200);
    assert.equal((await convRes.json()).status, 'Đã chốt lịch');
  } finally {
    await mock.stop();
  }
});

test('PATCH /api/bookings/:id allows people edits while Chờ cọc 30% unpaid and locks people once deposit is paid', async () => {
  const mock = await startMock('normal', 3206);
  try {
    const headers = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const linhHeaders = { Authorization: 'Bearer token-u-linh', 'Content-Type': 'application/json' };

    const conv = await (
      await fetch(`${mock.base}/api/conversations`, {
        method: 'POST',
        headers: linhHeaders,
        body: JSON.stringify({
          text: 'Em hỏi kỷ yếu lớp 20 bạn',
          request: {
            serviceId: 'ky-yeu',
            packageId: 'ky-yeu-lop',
            date: '2026-10-28',
            time: '09:00',
            people: 20,
          },
        }),
      })
    ).json();
    const proposed = await (
      await fetch(`${mock.base}/api/conversations/${conv.id}/proposals`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          date: '2026-10-28',
          makeup: null,
          shoot: { from: '09:00', to: '13:00', staffId: 'u-tuan', roomId: 'r-b' },
        }),
      })
    ).json();
    const proposalId = proposed.messages[proposed.messages.length - 1].proposal.id;
    await fetch(`${mock.base}/api/conversations/${conv.id}/proposals/${proposalId}/answer`, {
      method: 'POST',
      headers: linhHeaders,
      body: JSON.stringify({ answer: 'agree' }),
    });
    const created = await (
      await fetch(`${mock.base}/api/bookings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          conversationId: conv.id,
          serviceId: 'ky-yeu',
          packageId: 'ky-yeu-lop',
          people: 20,
        }),
      })
    ).json();
    assert.equal(created.status, 'Chờ cọc 30%');

    // Unpaid Chờ cọc 30% allows updating people and recomputes total, deposit, remainder.
    const updated = await fetch(`${mock.base}/api/bookings/${created.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ people: 25 }),
    });
    assert.equal(updated.status, 200);
    const body = await updated.json();
    assert.equal(body.people, 25);
    assert.equal(body.pricing.total, 8750000);
    assert.equal(body.pricing.deposit, 2625000);
    assert.equal(body.pricing.remainder, 6125000);

    // Paying 30% deposit locks people edits.
    const pay = await (
      await fetch(`${mock.base}/api/payments`, {
        method: 'POST',
        headers: linhHeaders,
        body: JSON.stringify({ bookingId: created.id, kind: 'deposit' }),
      })
    ).json();
    const payOk = await fetch(`${mock.base}/api/payments/${pay.id}/result`, {
      method: 'POST',
      headers: linhHeaders,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(payOk.status, 200);

    const lockedCreated = await fetch(`${mock.base}/api/bookings/${created.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ people: 30 }),
    });
    assert.equal(lockedCreated.status, 409);
    assert.equal((await lockedCreated.json()).error.message, 'Chỉ sửa được số người khi booking còn Chờ cọc 30%.');

    const lockedSeed = await fetch(`${mock.base}/api/bookings/GS-1023`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ people: 22 }),
    });
    assert.equal(lockedSeed.status, 409);
    assert.equal((await lockedSeed.json()).error.message, 'Chỉ sửa được số người khi booking còn Chờ cọc 30%.');

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

test('concurrent second deposit is recorded as succeeded with reason while booking stays Chờ cọc 30%', async () => {
  const mock = await startMock('normal', 3209);
  try {
    const admin = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const linh = { Authorization: 'Bearer token-u-linh', 'Content-Type': 'application/json' };
    const minhAnh = { Authorization: 'Bearer token-u-customer2', 'Content-Type': 'application/json' };

    const createBooking = async (custHeaders, date) => {
      const conv = await (
        await fetch(`${mock.base}/api/conversations`, {
          method: 'POST',
          headers: custHeaders,
          body: JSON.stringify({
            text: `Đặt lịch ${date}`,
            request: {
              serviceId: 'tot-nghiep',
              packageId: 'tot-nghiep-premium',
              date,
              time: '10:00',
              people: 1,
            },
          }),
        })
      ).json();
      const proposed = await (
        await fetch(`${mock.base}/api/conversations/${conv.id}/proposals`, {
          method: 'POST',
          headers: admin,
          body: JSON.stringify({
            date,
            makeup: null,
            shoot: { from: '10:00', to: '12:00', staffId: 'u-tuan', roomId: 'r-b' },
          }),
        })
      ).json();
      const proposalId = proposed.messages[proposed.messages.length - 1].proposal.id;
      await fetch(`${mock.base}/api/conversations/${conv.id}/proposals/${proposalId}/answer`, {
        method: 'POST',
        headers: custHeaders,
        body: JSON.stringify({ answer: 'agree' }),
      });
      return (
        await fetch(`${mock.base}/api/bookings`, {
          method: 'POST',
          headers: admin,
          body: JSON.stringify({
            conversationId: conv.id,
            serviceId: 'tot-nghiep',
            packageId: 'tot-nghiep-premium',
            people: 1,
          }),
        })
      ).json();
    };

    const bookingA = await createBooking(linh, '2026-10-25');
    const bookingB = await createBooking(minhAnh, '2026-10-25');

    const payA = await (
      await fetch(`${mock.base}/api/payments`, {
        method: 'POST',
        headers: linh,
        body: JSON.stringify({ bookingId: bookingA.id, kind: 'deposit' }),
      })
    ).json();
    const payB = await (
      await fetch(`${mock.base}/api/payments`, {
        method: 'POST',
        headers: minhAnh,
        body: JSON.stringify({ bookingId: bookingB.id, kind: 'deposit' }),
      })
    ).json();

    const failA = await (
      await fetch(`${mock.base}/api/payments/${payA.id}/result`, {
        method: 'POST',
        headers: linh,
        body: JSON.stringify({ result: 'fail' }),
      })
    ).json();
    assert.equal(failA.payment.message, 'Thanh toán không thành công, booking vẫn chờ cọc.');
    assert.equal(failA.booking.status, 'Chờ cọc 30%');

    const retryA = await (
      await fetch(`${mock.base}/api/payments`, {
        method: 'POST',
        headers: linh,
        body: JSON.stringify({ bookingId: bookingA.id, kind: 'deposit' }),
      })
    ).json();
    const okA = await fetch(`${mock.base}/api/payments/${retryA.id}/result`, {
      method: 'POST',
      headers: linh,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(okA.status, 200);
    assert.equal((await okA.json()).booking.status, 'Đã đặt lịch');

    const secondRes = await fetch(`${mock.base}/api/payments/${payB.id}/result`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(secondRes.status, 200);
    const secondBody = await secondRes.json();
    assert.equal(secondBody.payment.status, 'succeeded');
    assert.match(secondBody.payment.message, /Chờ cọc 30%/);
    assert.equal(secondBody.booking.status, 'Chờ cọc 30%');
    assert.equal(secondBody.booking.payment.depositStatus, 'paid');
    assert.ok(secondBody.booking.payment.depositPaidAt);

    const dupDeposit = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ bookingId: bookingB.id, kind: 'deposit' }),
    });
    assert.equal(dupDeposit.status, 409);

    const noRemainder = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ bookingId: bookingB.id, kind: 'remainder' }),
    });
    assert.equal(noRemainder.status, 409);

    const sched = await (await fetch(`${mock.base}/api/schedule?date=2026-10-25`, { headers: admin })).json();
    assert.equal(sched.blocks.length, 1);
    assert.equal(sched.blocks[0].bookingId, bookingA.id);

    const cancelledB = await fetch(`${mock.base}/api/bookings/${bookingB.id}/cancel`, {
      method: 'POST',
      headers: admin,
      body: JSON.stringify({ reason: 'Hoàn cọc ngoài hệ thống do trùng lịch' }),
    });
    assert.equal(cancelledB.status, 200);
    const cancelledBody = await cancelledB.json();
    assert.equal(cancelledBody.status, 'Đã hủy');
    assert.equal(cancelledBody.payment.depositStatus, 'paid');
  } finally {
    await mock.stop();
  }
});

test('rescheduling a deposit-paid unheld booking to a free slot moves it to Đã đặt lịch and holds busy blocks', async () => {
  const mock = await startMock('normal', 3210);
  try {
    const admin = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const linh = { Authorization: 'Bearer token-u-linh', 'Content-Type': 'application/json' };
    const minhAnh = { Authorization: 'Bearer token-u-customer2', 'Content-Type': 'application/json' };

    const createBooking = async (custHeaders, date, time) => {
      const conv = await (
        await fetch(`${mock.base}/api/conversations`, {
          method: 'POST',
          headers: custHeaders,
          body: JSON.stringify({
            text: `Đặt lịch ${date} ${time}`,
            request: {
              serviceId: 'tot-nghiep',
              packageId: 'tot-nghiep-premium',
              date,
              time,
              people: 1,
            },
          }),
        })
      ).json();
      const proposed = await (
        await fetch(`${mock.base}/api/conversations/${conv.id}/proposals`, {
          method: 'POST',
          headers: admin,
          body: JSON.stringify({
            date,
            makeup: null,
            shoot: { from: time, to: '12:00', staffId: 'u-tuan', roomId: 'r-b' },
          }),
        })
      ).json();
      const proposalId = proposed.messages[proposed.messages.length - 1].proposal.id;
      await fetch(`${mock.base}/api/conversations/${conv.id}/proposals/${proposalId}/answer`, {
        method: 'POST',
        headers: custHeaders,
        body: JSON.stringify({ answer: 'agree' }),
      });
      return (
        await fetch(`${mock.base}/api/bookings`, {
          method: 'POST',
          headers: admin,
          body: JSON.stringify({
            conversationId: conv.id,
            serviceId: 'tot-nghiep',
            packageId: 'tot-nghiep-premium',
            people: 1,
          }),
        })
      ).json();
    };

    const bookingA = await createBooking(linh, '2026-10-25', '10:00');
    const bookingB = await createBooking(minhAnh, '2026-10-25', '10:00');
    const bookingUnpaid = await createBooking(linh, '2026-10-28', '10:00');

    const payAReq = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: linh,
      body: JSON.stringify({ bookingId: bookingA.id, kind: 'deposit' }),
    });
    assert.equal(payAReq.status, 201);
    const payA = await payAReq.json();

    const payBReq = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ bookingId: bookingB.id, kind: 'deposit' }),
    });
    assert.equal(payBReq.status, 201);
    const payB = await payBReq.json();

    const okAReq = await fetch(`${mock.base}/api/payments/${payA.id}/result`, {
      method: 'POST',
      headers: linh,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(okAReq.status, 200);

    const resBReq = await fetch(`${mock.base}/api/payments/${payB.id}/result`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(resBReq.status, 200);
    const resB = await resBReq.json();
    assert.equal(resB.booking.status, 'Chờ cọc 30%');
    assert.equal(resB.booking.payment.depositStatus, 'paid');

    // Still-clashing target slot is refused with 409 and keeps Chờ cọc 30%.
    const clashingMove = await fetch(`${mock.base}/api/bookings/${bookingB.id}`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({
        date: '2026-10-25',
        makeup: null,
        shoot: { from: '10:30', to: '12:30', staffId: 'u-tuan', roomId: 'r-b' },
      }),
    });
    assert.equal(clashingMove.status, 409);

    // Editing a non-slot field alone must not silently claim a clashing slot.
    const metaOnly = await fetch(`${mock.base}/api/bookings/${bookingB.id}`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ sessionType: 'Tốt nghiệp nhóm' }),
    });
    assert.equal(metaOnly.status, 200);
    assert.equal((await metaOnly.json()).status, 'Chờ cọc 30%');

    // Moving unpaid Chờ cọc 30% booking still keeps Chờ cọc 30% and adds no busy blocks.
    const unpaidMove = await fetch(`${mock.base}/api/bookings/${bookingUnpaid.id}`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({
        date: '2026-10-29',
        makeup: null,
        shoot: { from: '14:00', to: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      }),
    });
    assert.equal(unpaidMove.status, 200);
    assert.equal((await unpaidMove.json()).status, 'Chờ cọc 30%');
    const schedUnpaid = await (await fetch(`${mock.base}/api/schedule?date=2026-10-29`, { headers: admin })).json();
    assert.equal(schedUnpaid.blocks.length, 0);

    // Moving deposit-paid unheld bookingB to a free slot moves it to Đã đặt lịch and holds busy, reminder, jobs.
    const freeMove = await fetch(`${mock.base}/api/bookings/${bookingB.id}`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({
        date: '2026-10-26',
        makeup: null,
        shoot: { from: '14:00', to: '16:00', staffId: 'u-tuan', roomId: 'r-b' },
      }),
    });
    assert.equal(freeMove.status, 200);
    const movedBody = await freeMove.json();
    assert.equal(movedBody.status, 'Đã đặt lịch');
    assert.equal(movedBody.payment.depositStatus, 'paid');

    const schedMoved = await (await fetch(`${mock.base}/api/schedule?date=2026-10-26`, { headers: admin })).json();
    assert.equal(schedMoved.blocks.length, 1);
    assert.equal(schedMoved.blocks[0].bookingId, bookingB.id);

    const reminders = await (
      await fetch(`${mock.base}/api/reminders?bookingId=${bookingB.id}`, { headers: admin })
    ).json();
    assert.equal(reminders.length, 1);

    const jobs = await (await fetch(`${mock.base}/api/jobs?bookingId=${bookingB.id}`, { headers: admin })).json();
    assert.equal(jobs.length, 1);
    assert.equal(jobs[0].staffId, 'u-tuan');

    const remainderShootGuard = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ bookingId: bookingB.id, kind: 'remainder' }),
    });
    assert.equal(remainderShootGuard.status, 409);
    assert.equal(
      (await remainderShootGuard.json()).error.message,
      'Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại.',
    );

    const markShootDone = await fetch(`${mock.base}/api/jobs/${jobs[0].id}`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ status: 'Hoàn thành' }),
    });
    assert.equal(markShootDone.status, 200);

    const remainderGuard = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ bookingId: bookingB.id, kind: 'remainder' }),
    });
    assert.equal(remainderGuard.status, 409);
    const remainderBody = await remainderGuard.json();
    assert.equal(remainderBody.error.message, 'Cần chọn ảnh trước khi thanh toán 70% còn lại.');

    // Also verify POST /api/payments/:id/result refuses remainder success if shoot job is no longer Hoàn thành.
    const selRes = await fetch(`${mock.base}/api/bookings/GS-1020/selection`, {
      method: 'PUT',
      headers: minhAnh,
      body: JSON.stringify({ previewIds: ['prv-gs-1020-1'] }),
    });
    assert.equal(selRes.status, 200);
    const remStart = await fetch(`${mock.base}/api/payments`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ bookingId: 'GS-1020', kind: 'remainder' }),
    });
    assert.equal(remStart.status, 201);
    const remPay = await remStart.json();
    const revertShoot = await fetch(`${mock.base}/api/jobs/job-gs-1020-shoot`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(revertShoot.status, 200);
    const remConfirm = await fetch(`${mock.base}/api/payments/${remPay.id}/result`, {
      method: 'POST',
      headers: minhAnh,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(remConfirm.status, 409);
    assert.equal(
      (await remConfirm.json()).error.message,
      'Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại.',
    );
  } finally {
    await mock.stop();
  }
});

test('PATCH /api/jobs/:id allows free status transitions subject to booking, remainder, and fileLink locks', async () => {
  const mock = await startMock('normal', 3211);
  try {
    const admin = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const mai = { Authorization: 'Bearer token-u-mai', 'Content-Type': 'application/json' };
    const tuan = { Authorization: 'Bearer token-u-tuan', 'Content-Type': 'application/json' };
    const staff3 = { Authorization: 'Bearer token-u-staff3', 'Content-Type': 'application/json' };
    const customer2 = { Authorization: 'Bearer token-u-customer2', 'Content-Type': 'application/json' };

    // Free transitions including backwards on GS-1022 shoot while remainder is unpaid.
    const back = await fetch(`${mock.base}/api/jobs/job-gs-1022-shoot`, {
      method: 'PATCH',
      headers: tuan,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(back.status, 200);
    assert.equal((await back.json()).status, 'Đang làm');

    const doneAgain = await fetch(`${mock.base}/api/jobs/job-gs-1022-shoot`, {
      method: 'PATCH',
      headers: tuan,
      body: JSON.stringify({ status: 'Hoàn thành' }),
    });
    assert.equal(doneAgain.status, 200);

    // Edit job is locked before 70% remainder is paid.
    const earlyEdit = await fetch(`${mock.base}/api/jobs/job-gs-1022-edit`, {
      method: 'PATCH',
      headers: staff3,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(earlyEdit.status, 409);

    // Customer saves photo choice and pays 70% remainder for GS-1022.
    await fetch(`${mock.base}/api/bookings/GS-1022/selection`, {
      method: 'PUT',
      headers: customer2,
      body: JSON.stringify({ previewIds: ['prv-gs-1022-1'] }),
    });
    const pay = await (
      await fetch(`${mock.base}/api/payments`, {
        method: 'POST',
        headers: customer2,
        body: JSON.stringify({ bookingId: 'GS-1022', kind: 'remainder' }),
      })
    ).json();
    const paid = await fetch(`${mock.base}/api/payments/${pay.id}/result`, {
      method: 'POST',
      headers: customer2,
      body: JSON.stringify({ result: 'success' }),
    });
    assert.equal(paid.status, 200);

    // Makeup and shoot are now locked; edit is unlocked.
    const lockedMakeup = await fetch(`${mock.base}/api/jobs/job-gs-1022-makeup`, {
      method: 'PATCH',
      headers: mai,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(lockedMakeup.status, 409);

    const lockedShoot = await fetch(`${mock.base}/api/jobs/job-gs-1022-shoot`, {
      method: 'PATCH',
      headers: tuan,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(lockedShoot.status, 409);

    const editStart = await fetch(`${mock.base}/api/jobs/job-gs-1022-edit`, {
      method: 'PATCH',
      headers: staff3,
      body: JSON.stringify({ status: 'Hoàn thành' }),
    });
    assert.equal(editStart.status, 200);
    assert.equal((await editStart.json()).canUpdate, true);

    // Setting final fileLink locks edit job completely.
    const linkRes = await fetch(`${mock.base}/api/bookings/GS-1022/file-link`, {
      method: 'PUT',
      headers: admin,
      body: JSON.stringify({ fileLink: 'https://drive.gradstudio.test/gs-1022-final' }),
    });
    assert.equal(linkRes.status, 200);

    const lockedEdit = await fetch(`${mock.base}/api/jobs/job-gs-1022-edit`, {
      method: 'PATCH',
      headers: staff3,
      body: JSON.stringify({ status: 'Đang làm' }),
    });
    assert.equal(lockedEdit.status, 409);
  } finally {
    await mock.stop();
  }
});

test('PATCH /api/bookings/:id blocks rescheduling once shoot job is Đang làm or Hoàn thành', async () => {
  const mock = await startMock('normal', 3212);
  try {
    const admin = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const tuan = { Authorization: 'Bearer token-u-tuan', 'Content-Type': 'application/json' };

    const blockedDone = await fetch(`${mock.base}/api/bookings/GS-1022`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ date: '2026-10-19' }),
    });
    assert.equal(blockedDone.status, 409);
    assert.equal((await blockedDone.json()).error.message, 'Buổi chụp đã bắt đầu hoặc hoàn thành, không thể đổi giờ.');

    await fetch(`${mock.base}/api/jobs/job-gs-1022-shoot`, {
      method: 'PATCH',
      headers: tuan,
      body: JSON.stringify({ status: 'Đang làm' }),
    });

    const blockedInProgress = await fetch(`${mock.base}/api/bookings/GS-1022`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ date: '2026-10-19' }),
    });
    assert.equal(blockedInProgress.status, 409);

    // Non-slot edits still work while shoot job is Đang làm.
    const metaOk = await fetch(`${mock.base}/api/bookings/GS-1022`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ sessionType: 'Tốt nghiệp nhóm' }),
    });
    assert.equal(metaOk.status, 200);

    // Moving shoot job back to Chưa bắt đầu allows rescheduling.
    await fetch(`${mock.base}/api/jobs/job-gs-1022-shoot`, {
      method: 'PATCH',
      headers: tuan,
      body: JSON.stringify({ status: 'Chưa bắt đầu' }),
    });
    const moved = await fetch(`${mock.base}/api/bookings/GS-1022`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ date: '2026-10-19' }),
    });
    assert.equal(moved.status, 200);
    assert.equal((await moved.json()).date, '2026-10-19');
  } finally {
    await mock.stop();
  }
});

test('reminders: pending updates in place keeping hoursBefore; sent stays in history when rescheduled', async () => {
  const mock = await startMock('normal', 3213);
  try {
    const admin = { Authorization: 'Bearer token-u-thao', 'Content-Type': 'application/json' };
    const superadmin = { Authorization: 'Bearer token-u-superadmin', 'Content-Type': 'application/json' };
    const tuan = { Authorization: 'Bearer token-u-tuan', 'Content-Type': 'application/json' };

    // Change reminderHoursBefore to 12; existing pending rem-gs-1023 must keep its original hoursBefore (24).
    const setRes = await fetch(`${mock.base}/api/settings`, {
      method: 'PUT',
      headers: superadmin,
      body: JSON.stringify({
        openingHours: {
          weekday: { open: '08:00', close: '18:00' },
          weekend: { open: '08:00', close: '18:00' },
        },
        reminderHoursBefore: 12,
      }),
    });
    assert.equal(setRes.status, 200);

    const move1023 = await fetch(`${mock.base}/api/bookings/GS-1023`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ date: '2026-10-30' }),
    });
    assert.equal(move1023.status, 200);

    const rem1023 = await (await fetch(`${mock.base}/api/reminders?bookingId=GS-1023`, { headers: admin })).json();
    assert.equal(rem1023.length, 1);
    assert.equal(rem1023[0].id, 'rem-gs-1023');
    assert.equal(rem1023[0].hoursBefore, 24);
    assert.equal(rem1023[0].emailStatus, 'pending');
    assert.equal(rem1023[0].dueAt, '2026-10-29T08:00:00+07:00');
    assert.match(rem1023[0].message, /30\/10\/2026/);

    // Non-schedule edit on GS-1020 (which has a sent reminder) must NOT create a new reminder.
    const meta1020 = await fetch(`${mock.base}/api/bookings/GS-1020`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ sessionType: 'Tốt nghiệp nhóm' }),
    });
    assert.equal(meta1020.status, 200);
    const rem1020Before = await (
      await fetch(`${mock.base}/api/reminders?bookingId=GS-1020`, { headers: admin })
    ).json();
    assert.equal(rem1020Before.length, 1);
    assert.equal(rem1020Before[0].emailStatus, 'sent');

    // Rescheduling GS-1020 (after resetting shoot job to Chưa bắt đầu) keeps sent history and adds a new pending reminder with hoursBefore=12.
    await fetch(`${mock.base}/api/jobs/job-gs-1020-shoot`, {
      method: 'PATCH',
      headers: tuan,
      body: JSON.stringify({ status: 'Chưa bắt đầu' }),
    });
    const move1020 = await fetch(`${mock.base}/api/bookings/GS-1020`, {
      method: 'PATCH',
      headers: admin,
      body: JSON.stringify({ date: '2026-10-31' }),
    });
    assert.equal(move1020.status, 200);

    const rem1020After = await (await fetch(`${mock.base}/api/reminders?bookingId=GS-1020`, { headers: admin })).json();
    assert.equal(rem1020After.length, 2);
    const sentRec = rem1020After.find((r) => r.emailStatus === 'sent');
    const pendingRec = rem1020After.find((r) => r.emailStatus === 'pending');
    assert.ok(sentRec);
    assert.equal(sentRec.id, 'rem-gs-1020');
    assert.equal(sentRec.hoursBefore, 24);
    assert.ok(pendingRec);
    assert.equal(pendingRec.hoursBefore, 12);
    assert.equal(pendingRec.emailSentAt, null);
    assert.equal(pendingRec.dueAt, '2026-10-31T01:00:00+07:00');
    assert.match(pendingRec.message, /31\/10\/2026/);
  } finally {
    await mock.stop();
  }
});
