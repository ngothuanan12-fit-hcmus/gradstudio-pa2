// Helpers shared by the mock's route modules. Node built-in modules only.

// An answer: the status and the JSON body. Route handlers return one of these.
export function ok(body, status = 200) {
  return { status, body };
}

// An error in the one shape of docs/api/README.md.
export function fail(status, code, message, extra = {}) {
  return { status, body: { error: { code, message, ...extra } } };
}

export const unauthenticated = () => fail(401, 'UNAUTHENTICATED', 'Bạn cần đăng nhập.');
export const forbidden = () => fail(403, 'FORBIDDEN', 'Bạn không có quyền làm việc này.');
export const notFound = () => fail(404, 'NOT_FOUND', 'Không tìm thấy.');

// A 400 with one message per field; `fields` is an object, e.g. { email: 'Nhập e-mail.' }.
export function invalid(fields) {
  return fail(400, 'VALIDATION_ERROR', 'Thông tin chưa hợp lệ.', { fields });
}

// The mock's token is `token-<user id>`, so it still works after the mock restarts (PA#3 rubric).
export function tokenFor(user) {
  return `token-${user.id}`;
}

// The signed-in user from `Authorization: Bearer <token>`, or null.
export function currentUser(req, db) {
  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer (token-[\w-]+)$/);
  if (!match) return null;
  return db.users.find((u) => tokenFor(u) === match[1] && u.password) || null;
}

// The user object of docs/api/01-auth.md: never the password.
export function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}
