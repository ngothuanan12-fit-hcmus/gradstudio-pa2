// docs/api/06-payments.md: deposit (30%) and remainder (70%) through the test gateway.
import { currentUser, fail, forbidden, invalid, notFound, ok, unauthenticated } from '../lib.mjs';
import { bookingOut, syncBookingBusy } from './bookings.mjs';
import { syncJobsForBooking } from './jobs.mjs';
import { syncReminderForBooking } from './reminders.mjs';
import { checkSchedule } from './schedule.mjs';

let nextPayment = 1;
let minutes = 0;

function now() {
  const t = 10 * 60 + minutes++;
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return `2026-10-20T${hh}:${mm}:00+07:00`;
}

function caller(req, db, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  return { user };
}

function checkBookingResources(db, booking) {
  return checkSchedule(db, {
    date: booking.date,
    makeup: booking.makeup,
    shoot: booking.shoot,
    excludeBookingId: booking.id,
  });
}

function hasChosenItems(entry) {
  if (!entry) return false;
  if (Array.isArray(entry)) return entry.length > 0;
  if (typeof entry === 'object') {
    return Object.values(entry).some((v) => Array.isArray(v) && v.length > 0);
  }
  return Boolean(entry);
}

function hasPhotoSelection(db, bookingId) {
  const sel = db.selections;
  if (!sel) return false;
  if (Array.isArray(sel)) return sel.some((item) => item && item.bookingId === bookingId && hasChosenItems(item));
  if (typeof sel === 'object') return hasChosenItems(sel[bookingId]);
  return false;
}

function isShootDone(db, bookingId) {
  return (
    Array.isArray(db.jobs) &&
    db.jobs.some((j) => j.bookingId === bookingId && j.role === 'shoot' && j.status === 'Hoàn thành')
  );
}

// --- handlers

function list({ req, db, query }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const bookingId = query.get('bookingId');
  if (bookingId !== null) {
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking || (user.role === 'customer' && booking.customerId !== user.id)) return notFound();
  }
  const items = db.payments
    .filter((p) => user.role === 'admin' || p.customerId === user.id)
    .filter((p) => bookingId === null || p.bookingId === bookingId)
    .slice()
    .reverse();
  return ok(items);
}

function start({ req, db, body }) {
  const { user, error } = caller(req, db, ['customer']);
  if (error) return error;
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const fields = {};
  if (typeof b.bookingId !== 'string' || b.bookingId.trim() === '') fields.bookingId = 'Chọn booking.';
  if (b.kind !== 'deposit' && b.kind !== 'remainder') {
    fields.kind = 'Chọn thanh toán cọc hoặc phần còn lại.';
  }
  if (Object.keys(fields).length) return invalid(fields);

  const booking = db.bookings.find((x) => x.id === b.bookingId);
  if (!booking || booking.customerId !== user.id) return notFound();
  if (booking.status === 'Đã hủy' || booking.status === 'Hoàn thành') {
    return fail(409, 'CONFLICT', 'Booking không ở trạng thái thanh toán.');
  }

  if (b.kind === 'deposit') {
    if (booking.payment.depositStatus === 'paid') {
      return fail(409, 'CONFLICT', 'Booking này đã thanh toán cọc 30%.');
    }
    const check = checkBookingResources(db, booking);
    if (!check.available) {
      return fail(409, 'CONFLICT', check.message, {
        details: { conflicts: check.conflicts, freeTime: check.freeTime },
      });
    }
  } else {
    if (booking.payment.depositStatus !== 'paid') {
      return fail(409, 'CONFLICT', 'Cần thanh toán cọc 30% trước khi thanh toán phần còn lại.');
    }
    if (booking.status !== 'Đã đặt lịch') {
      return fail(409, 'CONFLICT', 'Booking chưa giữ lịch thành công, không thể thanh toán phần còn lại.');
    }
    if (booking.payment.remainderStatus === 'paid') {
      return fail(409, 'CONFLICT', 'Booking này đã thanh toán phần còn lại.');
    }
    if (!isShootDone(db, booking.id)) {
      return fail(409, 'CONFLICT', 'Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại.');
    }
    if (!hasPhotoSelection(db, booking.id)) {
      return fail(409, 'CONFLICT', 'Cần chọn ảnh trước khi thanh toán 70% còn lại.');
    }
  }

  const pricing = bookingOut(db, booking).pricing;
  const amount = b.kind === 'deposit' ? pricing.deposit : pricing.remainder;
  if (typeof amount !== 'number') {
    return fail(409, 'CONFLICT', 'Chưa xác định số tiền thanh toán.');
  }

  const payment = {
    id: `pay-${nextPayment++}`,
    bookingId: booking.id,
    customerId: user.id,
    kind: b.kind,
    amount,
    status: 'pending',
    message: null,
    createdAt: now(),
    completedAt: null,
  };
  db.payments.push(payment);
  return ok(payment, 201);
}

function readOne({ req, db, params }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const payment = db.payments.find((p) => p.id === params.id);
  if (!payment || (user.role === 'customer' && payment.customerId !== user.id)) return notFound();
  return ok(payment);
}

function applyResult({ req, db, params, body }) {
  const { user, error } = caller(req, db, ['customer']);
  if (error) return error;
  const payment = db.payments.find((p) => p.id === params.id);
  if (!payment || payment.customerId !== user.id) return notFound();
  const result = body?.result;
  if (result !== 'success' && result !== 'fail') {
    return invalid({ result: 'Chọn thành công hoặc thất bại.' });
  }
  if (payment.status !== 'pending') {
    return fail(409, 'CONFLICT', 'Kết quả thanh toán này đã được ghi nhận.');
  }

  const booking = db.bookings.find((b) => b.id === payment.bookingId);
  if (!booking) return notFound();

  const at = now();
  if (result === 'fail') {
    payment.status = 'failed';
    payment.completedAt = at;
    payment.message =
      payment.kind === 'deposit'
        ? 'Thanh toán không thành công, booking vẫn chờ cọc.'
        : 'Thanh toán không thành công, booking vẫn chờ thanh toán 70% còn lại.';
    return ok({ payment, booking: bookingOut(db, booking) });
  }

  if (booking.status === 'Đã hủy' || booking.status === 'Hoàn thành') {
    return fail(409, 'CONFLICT', 'Booking không ở trạng thái thanh toán.');
  }

  if (payment.kind === 'deposit') {
    if (booking.payment.depositStatus === 'paid') {
      return fail(409, 'CONFLICT', 'Booking này đã thanh toán cọc 30%.');
    }
    const check = checkBookingResources(db, booking);
    if (!check.available) {
      // Product owners (2026-11-22): record second concurrent customer's deposit as received while keeping booking Chờ cọc 30%.
      booking.paidDeposit = payment.amount;
      booking.payment.depositStatus = 'paid';
      booking.payment.depositPaidAt = at;
      payment.status = 'succeeded';
      payment.completedAt = at;
      payment.message = `Đã nhận tiền cọc 30%, nhưng ${check.message} Booking vẫn ở trạng thái Chờ cọc 30%; studio sẽ hoàn tiền ngoài hệ thống hoặc hỗ trợ đổi lịch/hủy.`;
      return ok({ payment, booking: bookingOut(db, booking) });
    }
    booking.status = 'Đã đặt lịch';
    booking.paidDeposit = payment.amount;
    booking.payment.depositStatus = 'paid';
    booking.payment.depositPaidAt = at;
    // R1: slot is held once the deposit succeeds, so add the booking's blocks to db.busy.
    syncBookingBusy(db, booking);
    syncReminderForBooking(db, booking);
    syncJobsForBooking(db, booking);
    payment.status = 'succeeded';
    payment.completedAt = at;
    payment.message = 'Thanh toán cọc 30% thành công. Lịch chụp đã được giữ.';
    return ok({ payment, booking: bookingOut(db, booking) });
  }

  if (booking.payment.depositStatus !== 'paid') {
    return fail(409, 'CONFLICT', 'Cần thanh toán cọc 30% trước khi thanh toán phần còn lại.');
  }
  if (booking.status !== 'Đã đặt lịch') {
    return fail(409, 'CONFLICT', 'Booking chưa giữ lịch thành công, không thể thanh toán phần còn lại.');
  }
  if (booking.payment.remainderStatus === 'paid') {
    return fail(409, 'CONFLICT', 'Booking này đã thanh toán phần còn lại.');
  }
  if (!isShootDone(db, booking.id)) {
    return fail(409, 'CONFLICT', 'Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại.');
  }
  if (!hasPhotoSelection(db, booking.id)) {
    return fail(409, 'CONFLICT', 'Cần chọn ảnh trước khi thanh toán 70% còn lại.');
  }
  booking.payment.remainderStatus = 'paid';
  booking.payment.remainderPaidAt = at;
  payment.status = 'succeeded';
  payment.completedAt = at;
  payment.message = 'Thanh toán 70% còn lại thành công.';
  return ok({ payment, booking: bookingOut(db, booking) });
}

export default [
  { method: 'GET', path: '/api/payments', handler: list },
  { method: 'POST', path: '/api/payments', handler: start },
  { method: 'GET', path: '/api/payments/:id', handler: readOne },
  { method: 'POST', path: '/api/payments/:id/result', handler: applyResult },
];
