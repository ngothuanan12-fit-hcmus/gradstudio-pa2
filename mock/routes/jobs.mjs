// docs/api/08-jobs.md: staff jobs, job status updates, multipart preview uploads, and preview file serving.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { currentUser, fail, forbidden, invalid, notFound, ok, unauthenticated } from '../lib.mjs';
import { bookingOut } from './bookings.mjs';
import { roomName, userName } from './schedule.mjs';

const PHOTOS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/public/photos');
const JOB_STATUSES = ['Chưa bắt đầu', 'Đang làm', 'Hoàn thành'];
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ROLE_LABEL = { makeup: 'Makeup', shoot: 'Chụp', edit: 'Chỉnh ảnh' };

const previewBytes = new Map();
let nextPreview = 1;
let minutes = 0;

function previewOut(preview) {
  return {
    id: preview.id,
    bookingId: preview.bookingId,
    filename: preview.filename,
    mimeType: preview.mimeType,
    size: preview.size,
    url: preview.url,
    uploadedBy: preview.uploadedBy,
    uploadedAt: preview.uploadedAt,
  };
}

function readSeedPhoto(seedFile) {
  if (!seedFile) return null;
  const fullPath = path.resolve(PHOTOS_DIR, path.basename(seedFile));
  if (!fullPath.startsWith(PHOTOS_DIR + path.sep) || !fs.existsSync(fullPath)) return null;
  return fs.readFileSync(fullPath);
}

function now() {
  const t = 11 * 60 + minutes++;
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return `2026-10-24T${hh}:${mm}:00+07:00`;
}

function caller(req, db, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  return { user };
}

function jobOut(db, job) {
  const view = bookingOut(
    db,
    db.bookings.find((b) => b.id === job.bookingId),
  );
  return {
    id: job.id,
    bookingId: job.bookingId,
    staffId: job.staffId,
    staffName: userName(db, job.staffId),
    role: job.role,
    title: `${ROLE_LABEL[job.role] || job.role} · ${view.packageName}`,
    customerName: view.customer.name,
    serviceName: view.serviceName,
    packageName: view.packageName,
    date: job.date,
    from: job.from,
    to: job.to,
    roomName: job.roomName,
    people: view.people,
    extras: view.extras,
    status: job.status,
  };
}

export function syncJobsForBooking(db, booking) {
  if (!Array.isArray(db.jobs)) return;
  if (booking.status === 'Đã hủy') {
    db.jobs = db.jobs.filter((j) => j.bookingId !== booking.id);
    return;
  }
  if (booking.status !== 'Đã đặt lịch') return;

  const upsert = (role, slot, room) => {
    const id = `job-${booking.id.toLowerCase()}-${role}`;
    const existing = db.jobs.find((j) => j.id === id);
    if (existing) {
      existing.staffId = slot.staffId;
      existing.date = booking.date;
      existing.from = slot.from;
      existing.to = slot.to;
      existing.roomName = room;
    } else {
      db.jobs.push({
        id,
        bookingId: booking.id,
        staffId: slot.staffId,
        role,
        date: booking.date,
        from: slot.from,
        to: slot.to,
        roomName: room,
        status: 'Chưa bắt đầu',
      });
    }
  };

  if (booking.makeup) {
    upsert('makeup', booking.makeup, null);
  } else {
    const makeupId = `job-${booking.id.toLowerCase()}-makeup`;
    db.jobs = db.jobs.filter((j) => j.id !== makeupId);
  }
  upsert('shoot', booking.shoot, roomName(db, booking.shoot.roomId));
}

// Read multipart/form-data from req using Node built-ins only, draining excess bytes safely to avoid ECONNRESET.
function readMultipartFile(req) {
  return new Promise((resolve) => {
    const contentType = req.headers['content-type'] || '';
    const match = contentType.match(/boundary=(?:"([^"]+)"|([^;\s]+))/i);
    if (!match) {
      req.resume();
      return resolve({ invalidType: true });
    }
    const boundary = match[1] || match[2];
    const cap = MAX_UPLOAD_BYTES + 64 * 1024;
    const chunks = [];
    let total = 0;
    let overCap = false;

    req.on('data', (chunk) => {
      total += chunk.length;
      if (total <= cap) chunks.push(chunk);
      else overCap = true;
    });
    req.on('end', () => {
      if (overCap) return resolve({ tooLarge: true });
      const buf = Buffer.concat(chunks);
      const delim = Buffer.from(`--${boundary}`);
      const headerSep = Buffer.from('\r\n\r\n');
      let pos = buf.indexOf(delim);
      while (pos >= 0) {
        const start = pos + delim.length;
        if (buf.subarray(start, start + 2).toString() === '--') break;
        const partStart = buf[start] === 0x0d && buf[start + 1] === 0x0a ? start + 2 : start;
        const next = buf.indexOf(delim, partStart);
        if (next < 0) break;
        const partEnd = buf[next - 2] === 0x0d && buf[next - 1] === 0x0a ? next - 2 : next;
        const part = buf.subarray(partStart, partEnd);
        const sepIdx = part.indexOf(headerSep);
        if (sepIdx >= 0) {
          const headersText = part.subarray(0, sepIdx).toString('utf8');
          const data = part.subarray(sepIdx + 4);
          const nameMatch = headersText.match(/name="([^"]+)"/i);
          const fileMatch = headersText.match(/filename="([^"]*)"/i);
          const typeMatch = headersText.match(/content-type:\s*([^\r\n;]+)/i);
          if (nameMatch?.[1] === 'file' && fileMatch) {
            return resolve({
              file: {
                filename: fileMatch[1] || 'preview.png',
                mimeType: (typeMatch?.[1] || '').trim().toLowerCase(),
                data,
              },
            });
          }
        }
        pos = next;
      }
      resolve({ missing: true });
    });
  });
}

// --- handlers

function list({ req, db, query }) {
  const { user, error } = caller(req, db, ['staff', 'admin']);
  if (error) return error;
  const status = query.get('status');
  if (status !== null && !JOB_STATUSES.includes(status)) {
    return invalid({ status: 'Trạng thái công việc không hợp lệ.' });
  }
  const bookingId = query.get('bookingId');
  const items = db.jobs
    .filter((j) => user.role === 'admin' || j.staffId === user.id)
    .filter((j) => status === null || j.status === status)
    .filter((j) => bookingId === null || j.bookingId === bookingId)
    .slice()
    .sort(
      (a, b) => b.date.localeCompare(a.date) || b.bookingId.localeCompare(a.bookingId) || a.from.localeCompare(b.from),
    )
    .map((j) => jobOut(db, j));
  return ok(items);
}

function updateStatus({ req, db, params, body }) {
  const { user, error } = caller(req, db, ['staff', 'admin']);
  if (error) return error;
  const job = db.jobs.find((j) => j.id === params.id);
  if (!job) return notFound();
  if (user.role === 'staff' && job.staffId !== user.id) return forbidden();
  const status = body?.status;
  if (!JOB_STATUSES.includes(status)) {
    return invalid({ status: 'Trạng thái công việc không hợp lệ.' });
  }
  job.status = status;
  return ok(jobOut(db, job));
}

async function uploadPreview({ req, db, params }) {
  const parsed = await readMultipartFile(req);
  const { user, error } = caller(req, db, ['staff', 'admin']);
  if (error) return error;
  const booking = db.bookings.find((b) => b.id === params.id);
  if (!booking) return notFound();
  if (user.role === 'staff' && !db.jobs.some((j) => j.bookingId === booking.id && j.staffId === user.id)) {
    return forbidden();
  }
  if (booking.status !== 'Đã đặt lịch') {
    return fail(409, 'CONFLICT', 'Chỉ tải ảnh xem trước cho booking đã đặt lịch.');
  }
  if (parsed.tooLarge || (parsed.file && parsed.file.data.length > MAX_UPLOAD_BYTES)) {
    return fail(413, 'PAYLOAD_TOO_LARGE', 'Ảnh xem trước tối đa 5 MB.');
  }
  if (parsed.invalidType || parsed.missing || !parsed.file || parsed.file.data.length === 0) {
    return invalid({ file: 'Chọn ảnh xem trước.' });
  }
  if (!ALLOWED_MIME.has(parsed.file.mimeType)) {
    return invalid({ file: 'Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP.' });
  }

  const id = `prv-${nextPreview++}`;
  previewBytes.set(id, parsed.file.data);
  const preview = {
    id,
    bookingId: booking.id,
    filename: parsed.file.filename,
    mimeType: parsed.file.mimeType,
    size: parsed.file.data.length,
    url: `/api/previews/${id}`,
    uploadedBy: { id: user.id, name: user.name },
    uploadedAt: now(),
  };
  db.previews.push(preview);
  return ok(previewOut(preview), 201);
}

function readPreview({ req, db, params }) {
  const { user, error } = caller(req, db, ['customer', 'staff', 'admin']);
  if (error) return error;
  const preview = db.previews.find((p) => p.id === params.id);
  if (!preview) return notFound();
  const booking = db.bookings.find((b) => b.id === preview.bookingId);
  if (!booking) return notFound();
  if (user.role === 'customer' && booking.customerId !== user.id) return notFound();
  if (user.role === 'staff' && !db.jobs.some((j) => j.bookingId === booking.id && j.staffId === user.id)) {
    return forbidden();
  }
  const raw = previewBytes.get(preview.id) || readSeedPhoto(preview.seedFile);
  if (!raw) return notFound();
  return { status: 200, contentType: preview.mimeType, raw };
}

export default [
  { method: 'GET', path: '/api/jobs', handler: list },
  { method: 'PATCH', path: '/api/jobs/:id', handler: updateStatus },
  { method: 'POST', path: '/api/bookings/:id/previews', handler: uploadPreview },
  { method: 'GET', path: '/api/previews/:id', handler: readPreview },
];
