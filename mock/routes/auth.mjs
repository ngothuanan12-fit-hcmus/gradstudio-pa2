// docs/api/01-auth.md: POST /api/auth/login, GET /api/auth/me.
import { currentUser, fail, invalid, ok, publicUser, tokenFor, unauthenticated } from '../lib.mjs';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function login({ body, db }) {
  const fields = {};
  const { email, password } = body || {};
  if (typeof email !== 'string' || email.trim() === '') fields.email = 'Nhập e-mail.';
  else if (email.length > 254 || !EMAIL.test(email)) fields.email = 'E-mail chưa đúng định dạng.';
  if (typeof password !== 'string' || password === '' || password.length > 128) fields.password = 'Nhập mật khẩu.';
  if (Object.keys(fields).length) return invalid(fields);

  // Compared as plain strings: a value such as ' OR '1'='1 is just a wrong password.
  const user = db.users.find((u) => u.email === email && u.password !== null && u.password === password);
  if (!user) return fail(401, 'UNAUTHENTICATED', 'E-mail hoặc mật khẩu không đúng.');
  return ok({ token: tokenFor(user), user: publicUser(user) });
}

function me({ req, db }) {
  const user = currentUser(req, db);
  return user ? ok(publicUser(user)) : unauthenticated();
}

export default [
  { method: 'POST', path: '/api/auth/login', handler: login, signIn: true },
  { method: 'GET', path: '/api/auth/me', handler: me },
];
