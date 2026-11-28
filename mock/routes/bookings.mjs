// docs/api/05-bookings.md: bookings (create from agreed conversation, read, change with clash check, file link, cancel).
import { currentUser, fail, forbidden, invalid, notFound, ok, unauthenticated } from '../lib.mjs';
import { syncJobsForBooking } from './jobs.mjs';
import { syncReminderForBooking } from './reminders.mjs';
import { checkSchedule, roomName, userName, validateScheduleInput } from './schedule.mjs';

const BOOKING_STATUSES = ['Chờ cọc 30%', 'Đã đặt lịch', 'Hoàn thành', 'Đã hủy'];

function caller(req, db, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  return { user };
}

function findServiceAndPackage(db, serviceId, packageId) {
  const service = db.services.find((s) => s.id === serviceId) || null;
  const pack = service?.packages.find((p) => p.id === packageId) || null;
  return { service, pack };
}

function parseExtras(db, rawExtras, fields, key = 'extras') {
  if (rawExtras === undefined) return [];
  const parsed = [];
  const fine =
    Array.isArray(rawExtras) &&
    rawExtras.every((item) => {
      if (!item || typeof item !== 'object') return false;
      const extra = db.extras.find((e) => e.id === item.extraId);
      if (!extra) return false;
      const qty = item.quantity === undefined ? 1 : item.quantity;
      if (!Number.isInteger(qty) || qty < 1 || qty > 200) return false;
      if (extra.kind !== 'costume') {
        parsed.push({ extraId: extra.id, modelId: null, size: null, quantity: qty });
        return true;
      }
      const model = extra.models.find((m) => m.id === item.modelId);
      if (!model || !model.sizes.includes(item.size)) return false;
      parsed.push({ extraId: extra.id, modelId: model.id, size: item.size, quantity: qty });
      return true;
    });
  if (!fine) fields[key] = 'Dịch vụ thêm không hợp lệ.';
  return parsed;
}

function extrasOut(db, extras) {
  return extras.map((x) => {
    const def = db.extras.find((e) => e.id === x.extraId);
    const model = def?.models.find((m) => m.id === x.modelId);
    return {
      extraId: x.extraId,
      name: def ? def.name : x.extraId,
      modelId: x.modelId,
      modelName: model ? model.name : null,
      size: x.size,
      quantity: x.quantity || 1,
    };
  });
}

function paidDepositAmount(db, booking) {
  if (typeof booking.paidDeposit === 'number') return booking.paidDeposit;
  return db.payments?.find((p) => p.bookingId === booking.id && p.kind === 'deposit' && p.status === 'succeeded')
    ?.amount;
}

function computePricing(db, booking) {
  const { pack } = findServiceAndPackage(db, booking.serviceId, booking.packageId);
  const baseLabel = pack.priceUnit === 'người' ? `${pack.name} (${booking.people} người)` : pack.name;
  const total = pack.priceUnit === 'người' ? pack.price * booking.people : pack.price;
  const items = [{ label: baseLabel, amount: total }];
  const lockedDeposit = booking.payment.depositStatus === 'paid' ? paidDepositAmount(db, booking) : undefined;
  const deposit = typeof lockedDeposit === 'number' ? lockedDeposit : Math.round(total * 0.3);
  const remainder = total - deposit;
  return { items, total, deposit, remainder };
}

export function bookingOut(db, booking) {
  const { service, pack } = findServiceAndPackage(db, booking.serviceId, booking.packageId);
  return {
    id: booking.id,
    conversationId: booking.conversationId,
    customer: { id: booking.customerId, name: userName(db, booking.customerId) },
    admin: { id: booking.adminId, name: userName(db, booking.adminId) },
    serviceId: service.id,
    serviceName: service.name,
    packageId: pack.id,
    packageName: pack.name,
    durationMinutes: pack.durationMinutes,
    editedPhotos: pack.editedPhotos,
    sessionType: booking.sessionType,
    people: booking.people,
    extras: extrasOut(db, booking.extras),
    date: booking.date,
    makeup: booking.makeup
      ? {
          from: booking.makeup.from,
          to: booking.makeup.to,
          staffId: booking.makeup.staffId,
          staffName: userName(db, booking.makeup.staffId),
        }
      : null,
    shoot: {
      from: booking.shoot.from,
      to: booking.shoot.to,
      staffId: booking.shoot.staffId,
      staffName: userName(db, booking.shoot.staffId),
      roomId: booking.shoot.roomId,
      roomName: roomName(db, booking.shoot.roomId),
    },
    status: booking.status,
    pricing: computePricing(db, booking),
    payment: { ...booking.payment },
    fileLink: booking.fileLink,
  };
}

export function syncBookingBusy(db, booking) {
  db.busy = db.busy.filter((blk) => blk.bookingId !== booking.id);
  if (booking.status !== 'Đã đặt lịch') return;
  if (booking.makeup) {
    db.busy.push({
      bookingId: booking.id,
      date: booking.date,
      from: booking.makeup.from,
      to: booking.makeup.to,
      staffId: booking.makeup.staffId,
      roomId: null,
    });
  }
  db.busy.push({
    bookingId: booking.id,
    date: booking.date,
    from: booking.shoot.from,
    to: booking.shoot.to,
    staffId: booking.shoot.staffId,
    roomId: booking.shoot.roomId,
  });
}

function nextBookingId(db) {
  const max = db.bookings.reduce((m, b) => Math.max(m, Number(b.id.split('-')[1]) || 0), 1019);
  return `GS-${max + 1}`;
}

function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 500 || !/^https?:\/\//i.test(trimmed)) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// --- handlers

function create({ req, db, body }) {
  const { user, error } = caller(req, db, ['admin']);
  if (error) return error;
  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const fields = {};

  if (typeof b.conversationId !== 'string' || b.conversationId.trim() === '') {
    fields.conversationId = 'Chọn hội thoại.';
  }
  const { service, pack } = findServiceAndPackage(db, b.serviceId, b.packageId);
  if (!service) fields.serviceId = 'Không có dịch vụ này.';
  if (!pack) fields.packageId = 'Gói không thuộc dịch vụ này.';
  if (!Number.isInteger(b.people) || b.people < 1 || b.people > 200) {
    fields.people = 'Số người từ 1 đến 200.';
  }
  if (
    b.sessionType !== undefined &&
    (typeof b.sessionType !== 'string' || b.sessionType.trim() === '' || b.sessionType.length > 100)
  ) {
    fields.sessionType = 'Loại buổi chụp từ 1 đến 100 ký tự.';
  }
  const extras = parseExtras(db, b.extras, fields);
  if (Object.keys(fields).length) return invalid(fields);

  const conv = db.conversations.find((c) => c.id === b.conversationId);
  if (!conv) return notFound();
  if (conv.bookingId !== null) return fail(409, 'CONFLICT', `Hội thoại này đã có booking ${conv.bookingId}.`);
  const proposal = db.proposals.find((p) => p.conversationId === conv.id && p.status === 'agreed');
  if (conv.status !== 'Đã chốt lịch' || !proposal) {
    return fail(409, 'CONFLICT', 'Khách chưa đồng ý lịch đề xuất.');
  }

  const check = checkSchedule(db, {
    date: proposal.date,
    makeup: proposal.makeup
      ? { from: proposal.makeup.from, to: proposal.makeup.to, staffId: proposal.makeup.staffId }
      : null,
    shoot: {
      from: proposal.shoot.from,
      to: proposal.shoot.to,
      staffId: proposal.shoot.staffId,
      roomId: proposal.shoot.roomId,
    },
  });
  if (!check.available) {
    return fail(409, 'CONFLICT', check.message, {
      details: { conflicts: check.conflicts, freeTime: check.freeTime },
    });
  }

  const booking = {
    id: nextBookingId(db),
    conversationId: conv.id,
    customerId: conv.customerId,
    adminId: user.id,
    serviceId: service.id,
    packageId: pack.id,
    sessionType: b.sessionType !== undefined ? b.sessionType.trim() : service.name,
    people: b.people,
    extras,
    date: proposal.date,
    makeup: proposal.makeup
      ? { from: proposal.makeup.from, to: proposal.makeup.to, staffId: proposal.makeup.staffId }
      : null,
    shoot: {
      from: proposal.shoot.from,
      to: proposal.shoot.to,
      staffId: proposal.shoot.staffId,
      roomId: proposal.shoot.roomId,
    },
    status: 'Chờ cọc 30%',
    payment: { depositStatus: 'unpaid', depositPaidAt: null, remainderStatus: 'unpaid', remainderPaidAt: null },
    fileLink: null,
  };
  db.bookings.push(booking);
  conv.bookingId = booking.id;
  return ok(bookingOut(db, booking), 201);
}

function list({ req, db, query }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const status = query.get('status');
  if (status !== null && !BOOKING_STATUSES.includes(status)) return invalid({ status: 'Trạng thái không hợp lệ.' });
  const items = db.bookings
    .filter((b) => user.role === 'admin' || b.customerId === user.id)
    .filter((b) => status === null || b.status === status)
    .sort((a, b) => Number(b.id.split('-')[1]) - Number(a.id.split('-')[1]))
    .map((b) => bookingOut(db, b));
  return ok(items);
}

function readOne({ req, db, params }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const booking = db.bookings.find((b) => b.id === params.id);
  if (!booking || (user.role === 'customer' && booking.customerId !== user.id)) return notFound();
  return ok(bookingOut(db, booking));
}

function update({ req, db, params, body }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  const booking = db.bookings.find((b) => b.id === params.id);
  if (!booking) return notFound();
  if (booking.status === 'Hoàn thành' || booking.status === 'Đã hủy') {
    return fail(409, 'CONFLICT', 'Booking đã hoàn thành hoặc đã hủy, không thể thay đổi.');
  }

  const b = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const allowedKeys = ['date', 'makeup', 'shoot', 'people', 'sessionType', 'extras'];
  if (!allowedKeys.some((k) => b[k] !== undefined)) {
    return invalid({}, 'Chọn thông tin cần thay đổi.');
  }

  const fields = {};
  if (b.people !== undefined && (!Number.isInteger(b.people) || b.people < 1 || b.people > 200)) {
    fields.people = 'Số người từ 1 đến 200.';
  }
  if (
    b.sessionType !== undefined &&
    (typeof b.sessionType !== 'string' || b.sessionType.trim() === '' || b.sessionType.length > 100)
  ) {
    fields.sessionType = 'Loại buổi chụp từ 1 đến 100 ký tự.';
  }
  const nextExtras = b.extras !== undefined ? parseExtras(db, b.extras, fields) : booking.extras;

  const nextSchedule = {
    date: b.date !== undefined ? b.date : booking.date,
    makeup: b.makeup !== undefined ? b.makeup : booking.makeup,
    shoot: b.shoot !== undefined ? b.shoot : booking.shoot,
    excludeBookingId: booking.id,
  };
  const { fields: schedFields, parsed } = validateScheduleInput(db, nextSchedule);
  Object.assign(fields, schedFields);
  if (Object.keys(fields).length) return invalid(fields);

  if (b.people !== undefined && (booking.status !== 'Chờ cọc 30%' || booking.payment.depositStatus !== 'unpaid')) {
    return fail(409, 'CONFLICT', 'Chỉ sửa được số người khi booking còn Chờ cọc 30%.');
  }

  const touchesSlot = b.date !== undefined || b.makeup !== undefined || b.shoot !== undefined;
  if (touchesSlot) {
    const check = checkSchedule(db, {
      date: parsed.date,
      makeup: parsed.makeup,
      shoot: parsed.shoot,
      excludeBookingId: booking.id,
    });
    if (!check.available) {
      return fail(409, 'CONFLICT', check.message, {
        details: { conflicts: check.conflicts, freeTime: check.freeTime },
      });
    }
  }

  booking.date = parsed.date;
  booking.makeup = parsed.makeup;
  booking.shoot = parsed.shoot;
  if (b.people !== undefined) booking.people = b.people;
  if (b.sessionType !== undefined) booking.sessionType = b.sessionType.trim();
  if (b.extras !== undefined) booking.extras = nextExtras;
  if (touchesSlot && booking.status === 'Chờ cọc 30%' && booking.payment.depositStatus === 'paid') {
    // Team assumption (follow-up question for product owners): moving a deposit-paid unheld booking to a free slot locks its slot.
    booking.status = 'Đã đặt lịch';
  }

  syncBookingBusy(db, booking);
  syncReminderForBooking(db, booking);
  syncJobsForBooking(db, booking);
  return ok(bookingOut(db, booking));
}

function setFileLink({ req, db, params, body }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  const booking = db.bookings.find((b) => b.id === params.id);
  if (!booking) return notFound();
  const link = body?.fileLink;
  if (!isHttpUrl(link)) {
    return invalid({ fileLink: 'Nhập đường dẫn file hợp lệ (http:// hoặc https://).' });
  }
  if (booking.status !== 'Đã đặt lịch') {
    return fail(409, 'CONFLICT', 'Chỉ gắn link file ảnh cho booking đã đặt lịch.');
  }
  booking.fileLink = link.trim();
  return ok(bookingOut(db, booking));
}

function cancel({ req, db, params, body }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  const booking = db.bookings.find((b) => b.id === params.id);
  if (!booking) return notFound();
  if (body?.reason !== undefined && (typeof body.reason !== 'string' || body.reason.length > 500)) {
    return invalid({ reason: 'Lý do hủy tối đa 500 ký tự.' });
  }
  if (booking.status === 'Hoàn thành' || booking.status === 'Đã hủy') {
    return fail(409, 'CONFLICT', 'Không thể hủy booking ở trạng thái này.');
  }
  booking.status = 'Đã hủy';
  syncBookingBusy(db, booking);
  syncJobsForBooking(db, booking);
  if (Array.isArray(db.reminders)) {
    db.reminders = db.reminders.filter((r) => r.bookingId !== booking.id);
  }
  return ok(bookingOut(db, booking));
}

export default [
  { method: 'GET', path: '/api/bookings', handler: list },
  { method: 'POST', path: '/api/bookings', handler: create },
  { method: 'GET', path: '/api/bookings/:id', handler: readOne },
  { method: 'PATCH', path: '/api/bookings/:id', handler: update },
  { method: 'PUT', path: '/api/bookings/:id/file-link', handler: setFileLink },
  { method: 'POST', path: '/api/bookings/:id/cancel', handler: cancel },
];
