// docs/api/10-admin.md: Admin accounts and system settings, for the Superadmin only.
import { currentUser, fail, forbidden, invalid, ok, unauthenticated } from '../lib.mjs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

function superadmin(req, db) {
  const user = currentUser(req, db);
  if (!user) return unauthenticated();
  if (user.role !== 'superadmin') return forbidden();
  return null;
}

const adminOut = (u) => ({ id: u.id, name: u.name, email: u.email });

function listAdmins({ req, db }) {
  return superadmin(req, db) || ok(db.users.filter((u) => u.role === 'admin').map(adminOut));
}

function createAdmin({ req, db, body }) {
  const refused = superadmin(req, db);
  if (refused) return refused;
  const { name, email, password } = body && typeof body === 'object' ? body : {};
  const fields = {};
  if (typeof name !== 'string' || name.trim() === '') fields.name = 'Nhập họ tên.';
  else if (name.length > 100) fields.name = 'Họ tên tối đa 100 ký tự.';
  if (typeof email !== 'string' || email.trim() === '') fields.email = 'Nhập e-mail.';
  else if (email.length > 254 || !EMAIL.test(email)) fields.email = 'E-mail chưa đúng định dạng.';
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    fields.password = 'Mật khẩu từ 8 đến 128 ký tự.';
  }
  if (Object.keys(fields).length) return invalid(fields);
  if (db.users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return fail(409, 'CONFLICT', 'E-mail này đã có tài khoản.');
  }
  const short = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-');
  let id = `u-${short}`;
  for (let n = 2; db.users.some((u) => u.id === id); n++) id = `u-${short}-${n}`;
  const user = { id, name: name.trim(), email, password, role: 'admin' };
  db.users.push(user);
  return ok(adminOut(user), 201);
}

function readSettings({ req, db }) {
  return superadmin(req, db) || ok(db.settings);
}

function replaceSettings({ req, db, body }) {
  const refused = superadmin(req, db);
  if (refused) return refused;
  const b = body && typeof body === 'object' ? body : {};
  const hours = b.openingHours && typeof b.openingHours === 'object' ? b.openingHours : {};
  const fields = {};
  const openOk = typeof hours.open === 'string' && TIME.test(hours.open);
  if (!openOk) fields['openingHours.open'] = 'Giờ theo dạng HH:MM.';
  if (typeof hours.close !== 'string' || !TIME.test(hours.close)) fields['openingHours.close'] = 'Giờ theo dạng HH:MM.';
  else if (openOk && hours.close <= hours.open) fields['openingHours.close'] = 'Giờ đóng cửa phải sau giờ mở cửa.';
  const h = b.reminderHoursBefore;
  if (!Number.isInteger(h) || h < 1 || h > 168) fields.reminderHoursBefore = 'Số giờ từ 1 đến 168.';
  if (Object.keys(fields).length) return invalid(fields);
  db.settings = { openingHours: { open: hours.open, close: hours.close }, reminderHoursBefore: h };
  return ok(db.settings);
}

export default [
  { method: 'GET', path: '/api/admins', handler: listAdmins },
  { method: 'POST', path: '/api/admins', handler: createAdmin },
  { method: 'GET', path: '/api/settings', handler: readSettings },
  { method: 'PUT', path: '/api/settings', handler: replaceSettings },
];
