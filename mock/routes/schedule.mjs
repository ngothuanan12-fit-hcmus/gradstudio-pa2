// docs/api/04-schedule.md: staff, rooms, day schedule, and the clash check (shared with bookings and payments).
import { currentUser, forbidden, invalid, ok, unauthenticated } from '../lib.mjs';

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const SPECIALTIES = ['makeup', 'photographer'];

export function isDate(v) {
  if (typeof v !== 'string' || !DATE.test(v)) return false;
  const [y, m, d] = v.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export const isTime = (v) => typeof v === 'string' && TIME.test(v);
export const vnDate = (d) => d.split('-').reverse().join('/');
export const userName = (db, id) => db.users.find((u) => u.id === id)?.name || null;
export const roomName = (db, id) => db.rooms.find((r) => r.id === id)?.name || null;
export const isStaff = (db, id) => db.users.some((u) => u.id === id && u.role === 'staff');

function caller(req, db, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  return { user };
}

function costumeModels(db) {
  return db.extras.find((e) => e.kind === 'costume')?.models || [];
}

function costumeAvailability(db, date, excludeBookingId = null) {
  const models = costumeModels(db);
  const heldBookings = (db.bookings || []).filter(
    (b) => b.status === 'Đã đặt lịch' && b.date === date && b.id !== excludeBookingId,
  );
  return db.costumes.map((stock) => {
    const model = models.find((m) => m.id === stock.modelId);
    const used = heldBookings.reduce((sum, b) => {
      const match = (b.extras || [])
        .filter((x) => x.extraId === 'trang-phuc' && x.modelId === stock.modelId && x.size === stock.size)
        .reduce((acc, x) => acc + (x.quantity || 1), 0);
      return sum + match;
    }, 0);
    return {
      modelId: stock.modelId,
      modelName: model ? model.name : stock.modelId,
      size: stock.size,
      total: stock.total,
      used,
      available: Math.max(0, stock.total - used),
    };
  });
}

function freeTimeFor(db, date) {
  const candidate = db.freeTimes[date] || null;
  if (!candidate) return null;
  const overlapsBusy = (slot) => slot && db.busy.some((b) => b.date === date && b.from < slot.to && slot.from < b.to);
  if (overlapsBusy(candidate.makeup) || overlapsBusy(candidate.shoot)) return null;
  return candidate;
}

export function validateScheduleInput(db, input) {
  const b = input && typeof input === 'object' && !Array.isArray(input) ? input : {};
  const fields = {};
  if (!isDate(b.date)) fields.date = 'Ngày theo dạng YYYY-MM-DD.';

  let makeup = null;
  if (b.makeup != null) {
    const m = typeof b.makeup === 'object' && !Array.isArray(b.makeup) ? b.makeup : {};
    if (!isTime(m.from)) fields['makeup.from'] = 'Giờ theo dạng HH:MM.';
    if (!isTime(m.to)) fields['makeup.to'] = 'Giờ theo dạng HH:MM.';
    else if (isTime(m.from) && m.to <= m.from) fields['makeup.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
    if (!isStaff(db, m.staffId)) fields['makeup.staffId'] = 'Không có nhân viên này.';
    makeup = { from: m.from, to: m.to, staffId: m.staffId };
  }

  const s = b.shoot && typeof b.shoot === 'object' && !Array.isArray(b.shoot) ? b.shoot : {};
  if (!isTime(s.from)) fields['shoot.from'] = 'Giờ theo dạng HH:MM.';
  if (!isTime(s.to)) fields['shoot.to'] = 'Giờ theo dạng HH:MM.';
  else if (isTime(s.from) && s.to <= s.from) fields['shoot.to'] = 'Giờ kết thúc phải sau giờ bắt đầu.';
  if (!isStaff(db, s.staffId)) fields['shoot.staffId'] = 'Không có nhân viên này.';
  if (!db.rooms.some((r) => r.id === s.roomId)) fields['shoot.roomId'] = 'Không có phòng này.';
  const shoot = { from: s.from, to: s.to, staffId: s.staffId, roomId: s.roomId };

  const models = costumeModels(db);
  const costumes = [];
  if (b.costumes !== undefined) {
    const fine =
      Array.isArray(b.costumes) &&
      b.costumes.every((item) => {
        if (!item || typeof item !== 'object') return false;
        const model = models.find((m) => m.id === item.modelId);
        if (!model || !model.sizes.includes(item.size)) return false;
        const qty = item.quantity === undefined ? 1 : item.quantity;
        if (!Number.isInteger(qty) || qty < 1 || qty > 200) return false;
        costumes.push({ modelId: model.id, size: item.size, quantity: qty });
        return true;
      });
    if (!fine) fields.costumes = 'Trang phục không hợp lệ.';
  }

  let excludeBookingId = null;
  if (b.excludeBookingId != null) {
    if (typeof b.excludeBookingId !== 'string' || b.excludeBookingId.trim() === '') {
      fields.excludeBookingId = 'Mã booking không hợp lệ.';
    } else {
      excludeBookingId = b.excludeBookingId;
    }
  }

  return { fields, parsed: { date: b.date, makeup, shoot, costumes, excludeBookingId } };
}

function slotClashes(db, date, part, slot, label, excludeBookingId) {
  const found = [];
  const overlaps = (blk) =>
    blk.date === date && blk.bookingId !== excludeBookingId && blk.from < slot.to && slot.from < blk.to;
  for (const blk of db.busy.filter(overlaps)) {
    if (blk.staffId === slot.staffId) {
      found.push({ who: userName(db, blk.staffId), kind: 'staff', date, from: blk.from, to: blk.to, part: label });
    }
    if (part === 'shoot' && blk.roomId && blk.roomId === slot.roomId) {
      found.push({ who: roomName(db, blk.roomId), kind: 'room', date, from: blk.from, to: blk.to, part: null });
    }
  }
  return found;
}

export function checkSchedule(db, { date, makeup, shoot, costumes = [], excludeBookingId = null }) {
  const conflicts = [
    ...(makeup ? slotClashes(db, date, 'makeup', makeup, 'makeup', excludeBookingId) : []),
    ...slotClashes(db, date, 'shoot', shoot, 'chụp', excludeBookingId),
  ];

  const { open, close } = db.settings.openingHours;
  const outOfHours = [makeup, shoot].filter(Boolean).some((slot) => slot.from < open || slot.to > close);
  if (outOfHours) {
    conflicts.push({ who: 'Giờ mở cửa studio', kind: 'hours', date, from: open, to: close });
  }

  if (costumes.length) {
    const stock = costumeAvailability(db, date, excludeBookingId);
    const requested = new Map();
    for (const c of costumes) {
      const key = `${c.modelId}:${c.size}`;
      requested.set(key, (requested.get(key) || 0) + c.quantity);
    }
    for (const [key, qty] of requested.entries()) {
      const [modelId, size] = key.split(':');
      const entry = stock.find((x) => x.modelId === modelId && x.size === size);
      const avail = entry ? entry.available : 0;
      if (qty > avail) {
        const label = entry ? `${entry.modelName} (size ${size})` : `${modelId} (size ${size})`;
        conflicts.push({ who: label, kind: 'costume', date, from: null, to: null, available: avail });
      }
    }
  }

  if (!conflicts.length) {
    const parts = [
      makeup ? `makeup ${makeup.from}–${makeup.to} với ${userName(db, makeup.staffId)}` : null,
      `chụp ${shoot.from}–${shoot.to} với ${userName(db, shoot.staffId)} tại ${roomName(db, shoot.roomId)}`,
    ].filter(Boolean);
    return {
      available: true,
      message: `Lịch trống: ${parts.join(', ')}.`,
      conflicts: [],
      freeTime: null,
    };
  }

  const onlyTimeConflicts = conflicts.every((c) => c.kind === 'staff' || c.kind === 'room');
  const freeTime = onlyTimeConflicts ? freeTimeFor(db, date) : null;
  const why = conflicts.map((c) => {
    if (c.kind === 'hours') return `Ngoài giờ mở cửa studio (${c.from}–${c.to})`;
    if (c.kind === 'costume') return `${c.who} chỉ còn ${c.available} bộ ngày ${vnDate(c.date)}`;
    return `${c.who}${c.part ? ` (${c.part})` : ''} bận ${c.from}–${c.to} ngày ${vnDate(c.date)}`;
  });
  const offer = freeTime
    ? ` Giờ trống: makeup ${freeTime.makeup.from}–${freeTime.makeup.to}, chụp ${freeTime.shoot.from}–${freeTime.shoot.to}.`
    : '';
  return {
    available: false,
    message: `${why.join('; ')}.${offer}`,
    conflicts: conflicts.map(({ who, kind, date: d, from, to }) => ({ who, kind, date: d, from, to })),
    freeTime,
  };
}

// --- handlers

function listStaff({ req, db, query }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  const specialty = query.get('specialty');
  if (specialty !== null && !SPECIALTIES.includes(specialty)) {
    return invalid({ specialty: 'Chuyên môn không hợp lệ.' });
  }
  const items = db.staff
    .filter((s) => specialty === null || s.specialty === specialty)
    .map((s) => ({ id: s.id, name: userName(db, s.id), specialty: s.specialty }));
  return ok(items);
}

function listRooms({ req, db }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  return ok(db.rooms);
}

function readSchedule({ req, db, query }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  const date = query.get('date');
  if (!isDate(date)) return invalid({ date: 'Ngày theo dạng YYYY-MM-DD.' });
  const blocks = db.busy
    .filter((b) => b.date === date)
    .map((b) => ({
      bookingId: b.bookingId,
      date: b.date,
      from: b.from,
      to: b.to,
      staffId: b.staffId,
      staffName: userName(db, b.staffId),
      roomId: b.roomId,
      roomName: b.roomId ? roomName(db, b.roomId) : null,
    }));
  return ok({
    date,
    openingHours: db.settings.openingHours,
    blocks,
    costumes: costumeAvailability(db, date),
    freeTime: freeTimeFor(db, date),
  });
}

function runCheck({ req, db, body }) {
  const { error } = caller(req, db, ['admin']);
  if (error) return error;
  const { fields, parsed } = validateScheduleInput(db, body);
  if (Object.keys(fields).length) return invalid(fields);
  return ok(checkSchedule(db, parsed));
}

export default [
  { method: 'GET', path: '/api/staff', handler: listStaff },
  { method: 'GET', path: '/api/rooms', handler: listRooms },
  { method: 'GET', path: '/api/schedule', handler: readSchedule },
  { method: 'POST', path: '/api/schedule/check', handler: runCheck },
];
