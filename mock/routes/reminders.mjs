// docs/api/07-reminders.md: reminders scheduled automatically when a booking moves to Đã đặt lịch (R4).
import { currentUser, forbidden, notFound, ok, unauthenticated } from '../lib.mjs';
import { roomName, userName, vnDate } from './schedule.mjs';

function caller(req, db, roles) {
  const user = currentUser(req, db);
  if (!user) return { error: unauthenticated() };
  if (!roles.includes(user.role)) return { error: forbidden() };
  return { user };
}

function computeDueAt(date, time, hoursBefore) {
  const ms = Date.parse(`${date}T${time}:00Z`) - hoursBefore * 3600_000;
  return `${new Date(ms).toISOString().slice(0, 19)}+07:00`;
}

function reminderMessage(db, booking) {
  const parts = [
    booking.makeup
      ? `makeup ${booking.makeup.from}–${booking.makeup.to} với ${userName(db, booking.makeup.staffId)}`
      : null,
    `chụp ${booking.shoot.from}–${booking.shoot.to} với ${userName(db, booking.shoot.staffId)} tại ${roomName(db, booking.shoot.roomId)}`,
  ].filter(Boolean);
  return `Nhắc lịch ${booking.id} ngày ${vnDate(booking.date)}: ${parts.join(', ')}.`;
}

export function syncReminderForBooking(db, booking) {
  if (!Array.isArray(db.reminders)) return;
  if (booking.status !== 'Đã đặt lịch') {
    db.reminders = db.reminders.filter((r) => r.bookingId !== booking.id);
    return;
  }
  const existing = db.reminders.find((r) => r.bookingId === booking.id);
  const hoursBefore = existing ? existing.hoursBefore : db.settings.reminderHoursBefore;
  const earliest = booking.makeup ? booking.makeup.from : booking.shoot.from;
  const dueAt = computeDueAt(booking.date, earliest, hoursBefore);
  const message = reminderMessage(db, booking);
  if (existing) {
    existing.dueAt = dueAt;
    existing.message = message;
    return;
  }
  db.reminders.push({
    id: `rem-${booking.id.toLowerCase()}`,
    bookingId: booking.id,
    customerId: booking.customerId,
    dueAt,
    hoursBefore,
    channels: ['inApp', 'email'],
    emailStatus: 'pending',
    emailSentAt: null,
    message,
  });
}

function list({ req, db, query }) {
  const { user, error } = caller(req, db, ['customer', 'admin']);
  if (error) return error;
  const bookingId = query.get('bookingId');
  if (bookingId !== null) {
    const booking = db.bookings.find((b) => b.id === bookingId);
    if (!booking || (user.role === 'customer' && booking.customerId !== user.id)) return notFound();
  }
  const items = db.reminders
    .filter((r) => user.role === 'admin' || r.customerId === user.id)
    .filter((r) => bookingId === null || r.bookingId === bookingId)
    .slice()
    .sort((a, b) => b.dueAt.localeCompare(a.dueAt));
  return ok(items);
}

export default [{ method: 'GET', path: '/api/reminders', handler: list }];
