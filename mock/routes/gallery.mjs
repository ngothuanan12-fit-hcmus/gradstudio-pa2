// docs/api/09-gallery.md: the previews of a booking, the customer's photo choice, and Nhận ảnh (step G9).
import { currentUser, fail, forbidden, invalid, notFound, ok, unauthenticated } from '../lib.mjs';
import { bookingOut } from './bookings.mjs';

// The mock's clock for saved choices: the story's 20/10/2026, from 11:00, one minute per save, so answers repeat.
let minutes = 0;
function now() {
  const t = 11 * 60 + minutes++;
  const hh = String(Math.floor(t / 60)).padStart(2, '0');
  const mm = String(t % 60).padStart(2, '0');
  return `2026-10-20T${hh}:${mm}:00+07:00`;
}

const previewOut = (p) => ({
  id: p.id,
  bookingId: p.bookingId,
  filename: p.filename,
  mimeType: p.mimeType,
  size: p.size,
  url: p.url,
  uploadedBy: p.uploadedBy,
  uploadedAt: p.uploadedAt,
});

function packageOf(db, booking) {
  const service = db.services.find((s) => s.id === booking.serviceId);
  return service?.packages.find((p) => p.id === booking.packageId) || null;
}

// Who may see a booking's gallery: its customer (another customer gets 404), a staff member with a job on it, the Admin.
function access(req, db, params, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  const booking = db.bookings.find((b) => b.id === params.id);
  if (!booking || (user.role === 'customer' && booking.customerId !== user.id)) return { error: notFound() };
  if (user.role === 'staff' && !db.jobs.some((j) => j.bookingId === booking.id && j.staffId === user.id)) {
    return { error: forbidden() };
  }
  return { user, booking };
}

function galleryOut(db, booking) {
  const choice = db.selections.find((s) => s.bookingId === booking.id);
  return {
    bookingId: booking.id,
    limit: packageOf(db, booking)?.editedPhotos ?? null,
    locked: booking.payment.remainderStatus === 'paid',
    selected: choice ? [...choice.previewIds] : [],
    savedAt: choice ? choice.savedAt : null,
    previews: db.previews.filter((p) => p.bookingId === booking.id).map(previewOut),
  };
}

function read({ req, db, params }) {
  const { error, booking } = access(req, db, params, ['customer', 'staff', 'admin']);
  if (error) return error;
  return ok(galleryOut(db, booking));
}

function choose({ req, db, params, body }) {
  const { error, booking } = access(req, db, params, ['customer']);
  if (error) return error;
  const limit = packageOf(db, booking)?.editedPhotos ?? null;
  const ids = body && typeof body === 'object' ? body.previewIds : undefined;
  const own = new Set(db.previews.filter((p) => p.bookingId === booking.id).map((p) => p.id));
  if (limit !== null) {
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > limit) {
      return invalid({ previewIds: `Chọn từ 1 đến ${limit} ảnh.` });
    }
    if (new Set(ids).size !== ids.length) return invalid({ previewIds: 'Mỗi ảnh chỉ chọn một lần.' });
    if (!ids.every((id) => own.has(id))) return invalid({ previewIds: 'Có ảnh không thuộc booking này.' });
  }
  if (booking.status !== 'Đã đặt lịch') return fail(409, 'CONFLICT', 'Chỉ chọn ảnh khi booking đã đặt lịch.');
  if (booking.payment.remainderStatus === 'paid') {
    return fail(409, 'CONFLICT', 'Đã thanh toán 70%, ảnh đã chọn không đổi được nữa.');
  }
  if (limit === null) return fail(409, 'CONFLICT', 'Gói này chưa có số ảnh chỉnh, studio sẽ báo lại.');

  const saved = { bookingId: booking.id, previewIds: [...ids], savedAt: now() };
  db.selections = [...db.selections.filter((s) => s.bookingId !== booking.id), saved];
  return ok(galleryOut(db, booking));
}

// Nhận ảnh: the booking, and the conversation it came from, become Hoàn thành (product owners, 2026-11-22).
function receive({ req, db, params }) {
  const { error, booking } = access(req, db, params, ['customer']);
  if (error) return error;
  if (booking.status !== 'Đã đặt lịch') return fail(409, 'CONFLICT', 'Booking này không nhận ảnh được nữa.');
  if (booking.payment.remainderStatus !== 'paid') {
    return fail(409, 'CONFLICT', 'Cần thanh toán 70% còn lại trước khi nhận ảnh.');
  }
  if (!booking.fileLink) return fail(409, 'CONFLICT', 'Studio chưa gửi link ảnh.');
  booking.status = 'Hoàn thành';
  const conversation = db.conversations.find((c) => c.id === booking.conversationId);
  if (conversation) conversation.status = 'Hoàn thành';
  return ok(bookingOut(db, booking));
}

export default [
  { method: 'GET', path: '/api/bookings/:id/previews', handler: read },
  { method: 'PUT', path: '/api/bookings/:id/selection', handler: choose },
  { method: 'POST', path: '/api/bookings/:id/receive', handler: receive },
];
