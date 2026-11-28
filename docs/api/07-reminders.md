# Reminders

What a customer sees in their account (`Lịch chụp của tôi`, step G7): reminders scheduled automatically once a booking's 30% deposit succeeds (`06-payments.md`, *Đã đặt lịch*). No endpoint creates or edits reminders directly; this file only reads them.

**Rules (R4 and `10-admin.md`):**
1. When a booking moves to *Đã đặt lịch*, one reminder is created with `dueAt` set `settings.reminderHoursBefore` hours (`24` at start) before the booking's earliest milestone (`makeup.from` if present, otherwise `shoot.from`). For `GS-1024` (`24/10/2026`, make-up starting at `13:00`), `dueAt` is `2026-10-23T13:00:00+07:00`.
2. Changing `reminderHoursBefore` in `10-admin.md` applies only to reminders created after the change (R4).
3. Non-schedule booking edits (`people`, `sessionType`, `extras`) leave reminders unchanged. When rescheduling (`date`, `makeup`, `shoot`) a booking in *Đã đặt lịch*:
   - If an unsent reminder (`emailStatus === "pending"`) exists, its `dueAt` and `message` update in place using that pending reminder's `hoursBefore`.
   - If its previous reminder(s) already have `emailStatus === "sent"` or `"failed"`, those historical records stay untouched and a new `"pending"` reminder (`emailSentAt: null`, `hoursBefore` taken from the current `settings.reminderHoursBefore`) is created for the new slot.
4. Cancelling a booking removes its reminders.

**Team assumption.** Until the product owners answer (`FRONTEND.md`, section 5), reminders appear on `/lich-chup` with their due time, delivery channels (`inApp`, `email`), e-mail status (`pending`, `sent`, or `failed`), and a Vietnamese summary naming the booking code, milestone times, assigned staff, and room.

## Objects

**Reminder**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `rem-…`, e.g. `rem-gs-1024` |
| `bookingId` | string | e.g. `GS-1024` |
| `customerId` | string | Owner of the booking |
| `dueAt` | string | ISO 8601 with offset (`+07:00`) |
| `hoursBefore` | integer | Snapshot of `reminderHoursBefore` when created |
| `channels` | list of strings | `["inApp", "email"]` |
| `emailStatus` | string | `pending` (*Chờ gửi*), `sent` (*Đã gửi*), or `failed` (*Gửi lỗi*) |
| `emailSentAt` | string or `null` | ISO 8601 with offset when `sent`, otherwise `null` |
| `message` | string | Vietnamese reminder text shown in the customer's account |

## GET /api/reminders

Who: a customer (their own reminders) or the Admin (all reminders). Ordered by `dueAt` descending (newest/upcoming first).

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `bookingId` | string | no | filter to one booking (`404` if unknown or another customer's booking) |

Success: `200` with a list of reminder objects. In `empty` mode, returns `[]`.

Errors: `401` without a token; `403` for staff or Superadmin; `404` when `bookingId` is unknown or belongs to another customer.

Linh reads her reminders (GS-1024 was booked in `06-payments.md`, earliest milestone 13:00 on 24/10):

```http
GET /api/reminders
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "rem-gs-1024", "bookingId": "GS-1024", "customerId": "u-linh", "dueAt": "2026-10-23T13:00:00+07:00", "hoursBefore": 24, "channels": ["inApp", "email"], "emailStatus": "pending", "emailSentAt": null, "message": "Nhắc lịch GS-1024 ngày 24/10/2026: makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B."}]
```

Thảo filters reminders by booking (`GS-1024`):

```http
GET /api/reminders?bookingId=GS-1024
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "rem-gs-1024", "bookingId": "GS-1024", "customerId": "u-linh", "dueAt": "2026-10-23T13:00:00+07:00", "hoursBefore": 24, "channels": ["inApp", "email"], "emailStatus": "pending", "emailSentAt": null, "message": "Nhắc lịch GS-1024 ngày 24/10/2026: makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B."}]
```

Thảo lists all reminders across booked sessions:

```http
GET /api/reminders
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "rem-gs-1024", "bookingId": "GS-1024", "customerId": "u-linh", "dueAt": "2026-10-23T13:00:00+07:00", "hoursBefore": 24, "channels": ["inApp", "email"], "emailStatus": "pending", "emailSentAt": …, "message": "Nhắc lịch GS-1024 ngày 24/10/2026: makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B."}, …]
```

Another customer's booking answers `404` (`linh` asking for `GS-1022`):

```http
GET /api/reminders?bookingId=GS-1022
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

Staff cannot read customer reminders through this endpoint:

```http
GET /api/reminders
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

No token:

```http
GET /api/reminders
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## Changes

- 2026-11-21 — First version. No client code calls this endpoint yet.
- 2026-11-28 — Add `emailStatus: "failed"` (*Gửi lỗi*) alongside `pending` and `sent`, clarify that non-schedule `PATCH` edits leave reminders untouched, and specify reschedule history rules: `pending` reminders update in place keeping their `hoursBefore`, while `sent` or `failed` reminders stay in history and a new `pending` reminder is created using the current `reminderHoursBefore`.
