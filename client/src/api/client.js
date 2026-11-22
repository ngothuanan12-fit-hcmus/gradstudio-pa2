// The only place the client talks to the API. It calls relative /api paths (Vite forwards them to port 3001), sends the
// signed-in user's token, and turns every failure into an ApiError carrying the contract's one error shape
// (docs/api/README.md): code, message ready for the screen, fields for a 400, details for a 409.

const TIMEOUT_MS = 10000;

export class ApiError extends Error {
  constructor(status, body) {
    const error = body?.error || {};
    super(error.message || 'Có lỗi xảy ra. Thử lại sau.');
    this.name = 'ApiError';
    this.status = status;
    this.code = error.code || 'UNKNOWN';
    this.fields = error.fields || {};
    this.details = error.details || null;
  }
}

// The auth context sets the token here when the user signs in or out, and says what to do when the API stops accepting
// it. Kept in this module, not in React state, so the very first request of a reload already carries it.
let token = null;
let onUnauthorized = () => {};
export function setApiToken(value) {
  token = value;
}
export function configureApi(options) {
  onUnauthorized = options.onUnauthorized;
}

// `body` is sent as JSON, or as it is when it is FormData (the preview upload). `signal` lets the caller abort.
// Answers the Response once it is a success; any failure becomes an ApiError.
async function send(path, { method = 'GET', body, signal } = {}) {
  const headers = {};
  const isForm = body instanceof FormData;
  if (body !== undefined && !isForm) headers['Content-Type'] = 'application/json';
  const sent = token;
  if (sent) headers.Authorization = `Bearer ${sent}`;
  const signals = [AbortSignal.timeout(TIMEOUT_MS), ...(signal ? [signal] : [])];

  let res;
  try {
    res = await fetch(`/api${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
      signal: AbortSignal.any(signals),
    });
  } catch (err) {
    if (signal?.aborted) throw err; // the caller gave up (the screen closed): not an error to show
    const message =
      err.name === 'TimeoutError'
        ? 'Máy chủ trả lời quá lâu. Thử lại sau.'
        : 'Không kết nối được máy chủ. Kiểm tra mạng rồi thử lại.';
    throw new ApiError(0, { error: { code: 'NETWORK', message } });
  }

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    if (res.status === 401 && sent) onUnauthorized();
    throw new ApiError(res.status, data);
  }
  return res;
}

// A JSON answer.
export async function api(path, options) {
  const res = await send(path, options);
  return res.json().catch(() => null);
}

// A file answer (a preview image, which needs the token, so a plain <img src> cannot load it).
export async function apiBlob(path, options) {
  const res = await send(path, options);
  return res.blob();
}
