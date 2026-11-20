// docs/api/03-conversations.md: conversations, messages, booking requests, proposed times and the customer's answer.
import { currentUser, fail, forbidden, invalid, notFound, ok, unauthenticated } from '../lib.mjs';

const STATUSES = ['Chưa trả lời', 'Đang tư vấn', 'Đã chốt lịch', 'Hoàn thành'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

// The mock's clock for new messages: the story's morning of 20/10/2026, one minute per message, so answers repeat.
let minutes = 0;
function now() {
  const t = 9 * 60 + 40 + minutes++;
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return `2026-10-20T${hh}:${mm}:00+07:00`;
}
let nextMessage = 1;
let nextProposal = 1;

const isDate = (v) => typeof v === 'string' && DATE.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`));
const isTime = (v) => typeof v === 'string' && TIME.test(v);
const vnDate = (d) => d.split('-').reverse().join('/');
const name = (db, userId) => db.users.find((u) => u.id === userId)?.name;
const isStaff = (db, id) => db.users.some((u) => u.id === id && u.role === 'staff');

// --- shapes of docs/api/03-conversations.md

function proposalOut(db, id) {
  const p = db.proposals.find((x) => x.id === id);
  return { id: p.id, date: p.date, makeup: p.makeup, shoot: p.shoot, status: p.status };
}

function messageOut(db, m) {
  return { ...m, proposal: m.proposal ? proposalOut(db, m.proposal) : null };
}

function listItem(db, c) {
  const last = c.messages[c.messages.length - 1];
  return {
    id: c.id,
    customer: { id: c.customerId, name: name(db, c.customerId) },
    status: c.status,
    lastMessage: { from: last.from, text: last.text, at: last.at },
    updatedAt: last.at,
    bookingId: c.bookingId,
  };
}

const full = (db, c) => ({ ...listItem(db, c), messages: c.messages.map((m) => messageOut(db, m)) });

// --- who may see what

function caller(req, db, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  return { user };
}

// A customer's own conversation, or any for the Admin; another customer's answers 404, as if it did not exist.
function findFor(db, user, id) {
  const c = db.conversations.find((x) => x.id === id);
  if (!c || (user.role === 'customer' && c.customerId !== user.id)) return null;
  return c;
}

function addMessage(c, message) {
  const m = { id: `m-${nextMessage++}`, at: now(), request: null, proposal: null, ...message };
  c.messages.push(m);
  return m;
}

// --- handlers

function list({ req, db, query }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const status = query.get('status');
  if (status !== null && !STATUSES.includes(status)) return invalid({ status: 'Trạng thái không hợp lệ.' });
  const items = db.conversations
    .filter((c) => user.role === 'admin' || c.customerId === user.id)
    .filter((c) => status === null || c.status === status)
    .map((c) => listItem(db, c))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  return ok(items);
}

function checkRequest(db, r, fields) {
  if (!r || typeof r !== 'object' || Array.isArray(r)) {
    fields['request.serviceId'] = 'Không có dịch vụ này.';
    return null;
  }
  const service = db.services.find((s) => s.id === r.serviceId);
  if (!service) fields['request.serviceId'] = 'Không có dịch vụ này.';
  const pack = r.packageId == null ? null : service?.packages.find((p) => p.id === r.packageId);
  if (service && r.packageId != null && !pack) fields['request.packageId'] = 'Gói không thuộc dịch vụ này.';
  if (!isDate(r.date)) fields['request.date'] = 'Ngày theo dạng YYYY-MM-DD.';
  if (!isTime(r.time)) fields['request.time'] = 'Giờ theo dạng HH:MM.';
  if (!Number.isInteger(r.people) || r.people < 1 || r.people > 200)
    fields['request.people'] = 'Số người từ 1 đến 200.';
  const extras = [];
  if (r.extras !== undefined) {
    const fine =
      Array.isArray(r.extras) &&
      r.extras.every((x) => {
        const extra = db.extras.find((e) => e.id === x?.extraId);
        if (!extra) return false;
        if (extra.kind !== 'costume') {
          extras.push({ extraId: extra.id, name: extra.name, modelId: null, size: null });
          return true;
        }
        const model = extra.models.find((m) => m.id === x.modelId);
        if (!model || !model.sizes.includes(x.size)) return false;
        extras.push({ extraId: extra.id, name: extra.name, modelId: model.id, size: x.size });
        return true;
      });
    if (!fine) fields['request.extras'] = 'Dịch vụ thêm không hợp lệ.';
  }
  if (!service) return null;
  return {
    serviceId: service.id,
    serviceName: service.name,
    packageId: pack ? pack.id : null,
    packageName: pack ? pack.name : null,
    date: r.date,
    time: r.time,
    people: r.people,
    extras,
  };
}

function checkText(text, fields, emptyMessage) {
  if (typeof text !== 'string' || text.trim() === '') fields.text = emptyMessage;
  else if (text.length > 1000) fields.text = 'Tin nhắn tối đa 1000 ký tự.';
}

function start({ req, db, body }) {
  const { user, error } = caller(req, db, ['customer']);
  if (error) return error;
  const b = body && typeof body === 'object' ? body : {};
  const fields = {};
  const hasText = b.text !== undefined;
  const hasRequest = b.request !== undefined;
  if (!hasText && !hasRequest) return invalid({ text: 'Nhập tin nhắn hoặc gửi yêu cầu đặt lịch.' });
  if (hasText) checkText(b.text, fields, 'Nhập tin nhắn hoặc gửi yêu cầu đặt lịch.');
  const request = hasRequest ? checkRequest(db, b.request, fields) : null;
  if (Object.keys(fields).length) return invalid(fields);

  const short = user.id.replace(/^u-/, '');
  let id = `c-${short}`;
  for (let n = 2; db.conversations.some((c) => c.id === id); n++) id = `c-${short}-${n}`;
  const c = { id, customerId: user.id, status: 'Chưa trả lời', bookingId: null, messages: [] };
  const text = hasText
    ? b.text
    : `Yêu cầu đặt lịch: ${request.serviceName}, ${vnDate(request.date)} lúc ${request.time}, ${request.people} người.`;
  addMessage(c, { from: 'customer', authorName: user.name, kind: request ? 'request' : 'text', text, request });
  db.conversations.push(c);
  return ok(full(db, c), 201);
}

function readOne({ req, db, params }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const c = findFor(db, user, params.id);
  return c ? ok(full(db, c)) : notFound();
}

function reply({ req, db, params, body }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const c = findFor(db, user, params.id);
  if (!c) return notFound();
  const fields = {};
  checkText(body?.text, fields, 'Nhập tin nhắn.');
  if (Object.keys(fields).length) return invalid(fields);
  const fromStudio = user.role === 'admin';
  addMessage(c, { from: fromStudio ? 'studio' : 'customer', authorName: user.name, kind: 'text', text: body.text });
  if (fromStudio && c.status === 'Chưa trả lời') c.status = 'Đang tư vấn';
  return ok(full(db, c), 201);
}

function checkSlot(db, slot, key, fields, needRoom) {
  const s = slot && typeof slot === 'object' ? slot : {};
  if (!isTime(s.from)) fields[`${key}.from`] = 'Giờ theo dạng HH:MM.';
  if (!isTime(s.to)) fields[`${key}.to`] = 'Giờ theo dạng HH:MM.';
  else if (isTime(s.from) && s.to <= s.from) fields[`${key}.to`] = 'Giờ kết thúc phải sau giờ bắt đầu.';
  if (!isStaff(db, s.staffId)) fields[`${key}.staffId`] = 'Không có nhân viên này.';
  if (needRoom && !db.rooms.some((r) => r.id === s.roomId)) fields[`${key}.roomId`] = 'Không có phòng này.';
  return s;
}

// R1: a person or the room is busy if a booking that holds a slot (Đã đặt lịch) covers part of the time.
function clashes(db, date, part, slot, label) {
  const found = [];
  const overlaps = (b) => b.date === date && b.from < slot.to && slot.from < b.to;
  for (const b of db.busy.filter(overlaps)) {
    if (b.staffId === slot.staffId) {
      found.push({ who: name(db, b.staffId), kind: 'staff', date, from: b.from, to: b.to, part: label });
    }
    if (part === 'shoot' && b.roomId && b.roomId === slot.roomId) {
      const room = db.rooms.find((r) => r.id === b.roomId).name;
      found.push({ who: room, kind: 'room', date, from: b.from, to: b.to, part: null });
    }
  }
  return found;
}

function propose({ req, db, params, body }) {
  const { user, error } = caller(req, db, ['admin']);
  if (error) return error;
  const c = db.conversations.find((x) => x.id === params.id);
  if (!c) return notFound();
  const b = body && typeof body === 'object' ? body : {};
  const fields = {};
  if (!isDate(b.date)) fields.date = 'Ngày theo dạng YYYY-MM-DD.';
  const makeup = b.makeup == null ? null : checkSlot(db, b.makeup, 'makeup', fields, false);
  const shoot = checkSlot(db, b.shoot, 'shoot', fields, true);
  if (Object.keys(fields).length) return invalid(fields);

  const conflicts = [
    ...(makeup ? clashes(db, b.date, 'makeup', makeup, 'makeup') : []),
    ...clashes(db, b.date, 'shoot', shoot, 'chụp'),
  ];
  if (conflicts.length) {
    const freeTime = db.freeTimes[b.date] || null;
    const why = conflicts
      .map((x) => `${x.who}${x.part ? ` (${x.part})` : ''} bận ${x.from}–${x.to} ngày ${vnDate(x.date)}`)
      .join('; ');
    const offer = freeTime
      ? ` Giờ trống: makeup ${freeTime.makeup.from}–${freeTime.makeup.to}, chụp ${freeTime.shoot.from}–${freeTime.shoot.to}.`
      : '';
    return fail(409, 'CONFLICT', `${why}.${offer}`, {
      details: {
        conflicts: conflicts.map(({ who, kind, date, from, to }) => ({ who, kind, date, from, to })),
        freeTime,
      },
    });
  }

  for (const p of db.proposals) if (p.conversationId === c.id && p.status === 'open') p.status = 'replaced';
  const room = db.rooms.find((r) => r.id === shoot.roomId);
  const proposal = {
    id: `pr-${nextProposal++}`,
    conversationId: c.id,
    date: b.date,
    makeup: makeup && {
      from: makeup.from,
      to: makeup.to,
      staffId: makeup.staffId,
      staffName: name(db, makeup.staffId),
    },
    shoot: {
      from: shoot.from,
      to: shoot.to,
      staffId: shoot.staffId,
      staffName: name(db, shoot.staffId),
      roomId: room.id,
      roomName: room.name,
    },
    status: 'open',
  };
  db.proposals.push(proposal);
  const parts = [
    makeup ? `makeup ${makeup.from}–${makeup.to} với ${proposal.makeup.staffName}` : null,
    `chụp ${shoot.from}–${shoot.to} với ${proposal.shoot.staffName} tại ${room.name}`,
  ].filter(Boolean);
  const text = `Studio đề xuất ngày ${vnDate(b.date)}: ${parts.join(', ')}.`;
  addMessage(c, { from: 'studio', authorName: user.name, kind: 'proposal', text, proposal: proposal.id });
  if (c.status === 'Chưa trả lời') c.status = 'Đang tư vấn';
  return ok(full(db, c), 201);
}

function answer({ req, db, params, body }) {
  const { user, error } = caller(req, db, ['customer']);
  if (error) return error;
  const c = findFor(db, user, params.id);
  if (!c) return notFound();
  const choice = body?.answer;
  if (choice !== 'agree' && choice !== 'decline') return invalid({ answer: 'Chọn agree hoặc decline.' });
  const p = db.proposals.find((x) => x.id === params.proposalId && x.conversationId === c.id);
  if (!p) return notFound();
  if (p.status !== 'open') return fail(409, 'CONFLICT', 'Đề xuất này đã được trả lời.');
  p.status = choice === 'agree' ? 'agreed' : 'declined';
  c.status = choice === 'agree' ? 'Đã chốt lịch' : 'Đang tư vấn';
  const text = choice === 'agree' ? 'Đồng ý lịch đề xuất.' : 'Chưa đồng ý lịch đề xuất.';
  addMessage(c, { from: 'customer', authorName: user.name, kind: 'answer', text, proposal: p.id });
  return ok(full(db, c));
}

export default [
  { method: 'GET', path: '/api/conversations', handler: list },
  { method: 'POST', path: '/api/conversations', handler: start },
  { method: 'GET', path: '/api/conversations/:id', handler: readOne },
  { method: 'POST', path: '/api/conversations/:id/messages', handler: reply },
  { method: 'POST', path: '/api/conversations/:id/proposals', handler: propose },
  { method: 'POST', path: '/api/conversations/:id/proposals/:proposalId/answer', handler: answer },
];
