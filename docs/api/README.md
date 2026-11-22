# GradStudio API

The contract between the React client and the API. The mock (`mock/server.mjs`, PA#3) and the Express server (`server/`, PA#4) answer exactly as these files say. The client calls nothing that is not here.

## Base path and format

- Every endpoint is under `/api`. The client calls relative paths (`/api/bookings`); in development and preview Vite forwards `/api` to port 3001.
- Bodies are JSON (`Content-Type: application/json`), UTF-8, except the preview upload (`multipart/form-data`, see `08-jobs.md`).
- A list answers as a JSON array. An empty list is `[]`, never an error.

## Who is calling

- `POST /api/auth/login` answers with a token and the user. Every other request that needs a user sends `Authorization: Bearer <token>`.
- The role comes from the token, never from the body or the URL. Roles: `customer`, `admin`, `staff`, `superadmin`; a request with no token is a visitor.
- In examples, a token is written `Authorization: Bearer {{token:<name>}}` with a name from the demo accounts: `linh`, `customer2`, `thao`, `mai`, `tuan`, `staff3`, `superadmin`. Their e-mail is `<name>@gradstudio.test`; passwords are in `FRONTEND.md`.

## One error shape

Every error, from every endpoint, has this body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Thông tin chưa hợp lệ.",
    "fields": {
      "email": "Nhập e-mail.",
      "password": "Nhập mật khẩu."
    }
  }
}
```

- `code` and `message` are always there. `message` is Vietnamese, ready to show on screen.
- `fields` appears only with `400`: one message per field, keyed by the field's name in the request.
- `details` may appear with `409`, holding what the screen needs to explain the refusal (for a clash: who is busy, from when to when, and a free time).

## Status codes

| Status | `code` | When |
|---|---|---|
| `200` | — | Read, or change done |
| `201` | — | Created; the body is the new item |
| `400` | `VALIDATION_ERROR` | A body, path or query value is missing, of the wrong type or outside its limits |
| `401` | `UNAUTHENTICATED` | No token, or a token the API does not accept; also a failed sign-in |
| `403` | `FORBIDDEN` | Signed in, but this role may not do this |
| `404` | `NOT_FOUND` | No such item, or an item the caller may not see (another customer's booking answers `404`) |
| `409` | `CONFLICT` | The request is valid but the state refuses it: a booking before the customer agrees, a step out of order, a clash, a payment result already applied |
| `413` | `PAYLOAD_TOO_LARGE` | An upload over its size limit |
| `500` | `SERVER_ERROR` | Anything unexpected; never a stack trace |

## Data conventions

- Ids are strings: users `u-linh`, conversations `c-…`, bookings `GS-1024`, others with a short prefix named in their file.
- Dates are `YYYY-MM-DD`; times `HH:MM`; both in the studio's time (Asia/Ho_Chi_Minh). A moment (a message sent, a reminder due) is ISO 8601 with its offset: `2026-10-23T13:00:00+07:00`.
- Money is an integer number of đồng (`1800000`), computed by the API; the client formats it.
- Status values are the brief's Vietnamese names, exactly: conversations `Chưa trả lời`, `Đang tư vấn`, `Đã chốt lịch`, `Hoàn thành`; bookings `Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`, `Đã hủy` (`Đã hủy` is a team assumption until the product owners answer; see `05-bookings.md`).

## Files

Sent in this order to a freshly started mock: this file, then the others alphabetically. Examples that need an earlier state come after the examples that create it.

| File | Resource | Written by |
|---|---|---|
| `01-auth.md` | Sign-in, the signed-in user | An |
| `02-catalogue.md` | Services and packages, extras, sample photos, reviews | An |
| `03-conversations.md` | Conversations, messages, booking requests, proposed times and the customer's answer | An (Khánh reviews) |
| `04-schedule.md` | Staff, rooms, the clash check | Khánh |
| `05-bookings.md` | Bookings: create, read, change, cancel, file link | Khánh |
| `06-payments.md` | Deposit and remainder through the test gateway | Khánh |
| `07-reminders.md` | Reminders in the customer's account | Khánh |
| `08-jobs.md` | Staff jobs, job status, preview upload | Khánh |
| `09-gallery.md` | Previews, photo choice, *Nhận ảnh* | An |
| `10-admin.md` | Admin accounts, system settings | An |

## Endpoints

Every endpoint the client calls **and that has an example** in its file. contract-check reads this table: each row must have an example, and each example's endpoint must be a row. An endpoint moves here from *Planned* in the commit that adds its examples.

| Method | Path | Roles | File |
|---|---|---|---|
| `POST` | `/api/auth/login` | visitor | `01-auth.md` |
| `GET` | `/api/auth/me` | any signed in | `01-auth.md` |
| `GET` | `/api/services` | visitor | `02-catalogue.md` |
| `GET` | `/api/extras` | visitor | `02-catalogue.md` |
| `GET` | `/api/photos` | visitor | `02-catalogue.md` |
| `GET` | `/api/reviews` | visitor | `02-catalogue.md` |
| `GET` | `/api/conversations` | customer (own), admin | `03-conversations.md` |
| `POST` | `/api/conversations` | customer | `03-conversations.md` |
| `GET` | `/api/conversations/:id` | customer (own), admin | `03-conversations.md` |
| `POST` | `/api/conversations/:id/messages` | customer (own), admin | `03-conversations.md` |
| `POST` | `/api/conversations/:id/proposals` | admin | `03-conversations.md` |
| `POST` | `/api/conversations/:id/proposals/:proposalId/answer` | customer (own) | `03-conversations.md` |
| `GET` | `/api/staff` | admin | `04-schedule.md` |
| `GET` | `/api/rooms` | admin | `04-schedule.md` |
| `GET` | `/api/schedule` | admin | `04-schedule.md` |
| `POST` | `/api/schedule/check` | admin | `04-schedule.md` |
| `GET` | `/api/bookings` | customer (own), admin | `05-bookings.md` |
| `POST` | `/api/bookings` | admin | `05-bookings.md` |
| `GET` | `/api/bookings/:id` | customer (own), admin | `05-bookings.md` |
| `PATCH` | `/api/bookings/:id` | admin | `05-bookings.md` |
| `POST` | `/api/bookings/:id/cancel` | admin | `05-bookings.md` |
| `PUT` | `/api/bookings/:id/file-link` | admin | `05-bookings.md` |
| `GET` | `/api/payments` | customer (own), admin | `06-payments.md` |
| `POST` | `/api/payments` | customer (own) | `06-payments.md` |
| `GET` | `/api/payments/:id` | customer (own), admin | `06-payments.md` |
| `POST` | `/api/payments/:id/result` | customer (own) | `06-payments.md` |
| `GET` | `/api/reminders` | customer (own), admin | `07-reminders.md` |
| `GET` | `/api/jobs` | staff (own), admin | `08-jobs.md` |
| `PATCH` | `/api/jobs/:id` | staff (assigned), admin | `08-jobs.md` |
| `POST` | `/api/bookings/:id/previews` | staff (assigned), admin | `08-jobs.md` |
| `GET` | `/api/previews/:id` | customer (own), staff (assigned), admin | `08-jobs.md` |
| `GET` | `/api/admins` | superadmin | `10-admin.md` |
| `POST` | `/api/admins` | superadmin | `10-admin.md` |
| `GET` | `/api/settings` | superadmin | `10-admin.md` |
| `PUT` | `/api/settings` | superadmin | `10-admin.md` |

### Planned

Endpoints designed but not yet written up with examples, by file. Not a table, so contract-check does not read them yet. Only `09-gallery.md` remains planned; `01`–`08` and `10` are in the table above.

- GET /api/bookings/:id/previews · customer (own), staff (assigned), admin · `09-gallery.md`
- PUT /api/bookings/:id/selection · customer (own) · `09-gallery.md`
- POST /api/bookings/:id/receive · customer (own) · `09-gallery.md`

## Changes

Once client code calls an endpoint, every change to it gets a line here or in its file: the date, what changed, and why.

- 2026-11-19 — First version: base path, auth header, error shape, status codes, conventions, files, endpoints of `01`–`03` and `08`–`10`. No client code calls the API yet.
- 2026-11-20 — `08-jobs.md` moves to Khánh with step G8; its three rows leave this table until he writes the file. No client code calls the API yet.
- 2026-11-20 — The endpoint table lists only endpoints with examples; the others wait under *Planned* until their file is written, so contract-check can run in full in `npm test` at every step. No client code calls the API yet.
- 2026-11-20 — The four endpoints of `02-catalogue.md` move from *Planned* to the table with their examples.
- 2026-11-20 — The six endpoints of `03-conversations.md` move from *Planned* to the table with their examples.
- 2026-11-20 — The four endpoints of `10-admin.md` move from *Planned* to the table with their examples.
- 2026-11-21 — Add the four endpoints of `04-schedule.md` to the table. No client code calls them yet.
- 2026-11-21 — Add the six endpoints of `05-bookings.md` to the table. No client code calls them yet.
- 2026-11-21 — Add the four endpoints of `06-payments.md` to the table. No client code calls them yet.
- 2026-11-21 — Add the endpoint of `07-reminders.md` to the table. No client code calls it yet.
- 2026-11-21 — Add the three endpoints of `08-jobs.md` to the table. No client code calls them yet.
- 2026-11-22 — Update the booking status convention (*Đã hủy* as a team assumption) and the *Planned* note after `04`–`08` moved into the endpoint table (PR #5 review fix). No client code calls these endpoints yet.
- 2026-11-22 — Add `GET /api/previews/:id` to the endpoint table (`08-jobs.md`, agreed item 6). No client code calls it yet.
