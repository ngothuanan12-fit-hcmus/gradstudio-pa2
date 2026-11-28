# Admin accounts and settings

What only the Superadmin does (step G11): list and create Admin accounts, and set the system-wide settings: the studio's opening hours and how long before a shoot reminders go out. Every endpoint here answers `403` to any other role, and `401` without a token.

**Sample data.** The brief sets reminders at 24 hours before the earliest milestone, so `reminderHoursBefore` starts at `24`. It gives no opening hours: `08:00`–`18:00` is a sample, the hours of the PA#2 schedule (Mai's day starts at 08:00). The new Admin in the examples (Phan Thị Ngọc) is a sample too.

## Objects

**Admin account**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `u-…` |
| `name` | string | Shown on screen |
| `email` | string | The sign-in e-mail |

The password is never in an answer.

**Settings**

| Field | Type | Notes |
|---|---|---|
| `openingHours` | object | `weekday` (Monday to Friday) and `weekend` (Saturday and Sunday), each `{ "open", "close" }` in `HH:MM`. Per the product owners ([part II, answer 4](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28855460470819417&reply_comment_id=28858450227187108)), a proposal, a new booking and a reschedule must sit inside the hours of their day (`04-schedule.md`); a customer's wished time is not checked, and changing the hours leaves existing bookings as they are. The sample values, `08:00`–`18:00` for both, are the team's |
| `reminderHoursBefore` | integer | How many hours before the earliest milestone of a booking its reminder goes out (R4) |

## GET /api/admins

Who: the Superadmin. Every Admin account, in the order they were created.

Success: `200` with a list of Admin accounts.

Errors: `401` without a token; `403` for any other role.

```http
GET /api/admins
Authorization: Bearer {{token:superadmin}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "u-thao", "name": "Thảo", "email": "thao@gradstudio.test"}]
```

No token:

```http
GET /api/admins
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## POST /api/admins

Who: the Superadmin. Creates an Admin account, who can then sign in with that e-mail and password.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `name` | string | yes | 1 to 100 characters |
| `email` | string | yes | an e-mail address, at most 254 characters, not used by any account |
| `password` | string | yes | 8 to 128 characters |

Success: `201` with the new Admin account.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | a field missing or outside its limits | `name`: "Nhập họ tên." or "Họ tên tối đa 100 ký tự."; `email`: "Nhập e-mail." or "E-mail chưa đúng định dạng."; `password`: "Mật khẩu từ 8 đến 128 ký tự." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Superadmin | — |
| `409` | `CONFLICT` | the e-mail already has an account | — |

A new Admin:

```http
POST /api/admins
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"name": "Phan Thị Ngọc", "email": "ngoc@gradstudio.test", "password": "ngoc-demo-2026"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "u-ngoc", "name": "Phan Thị Ngọc", "email": "ngoc@gradstudio.test"}
```

The same e-mail again:

```http
POST /api/admins
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"name": "Phan Thị Ngọc", "email": "ngoc@gradstudio.test", "password": "ngoc-demo-2026"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "E-mail này đã có tài khoản."}}
```

Fields left empty or too short:

```http
POST /api/admins
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"name": "", "email": "ngoc", "password": "123"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"name": "Nhập họ tên.", "email": "E-mail chưa đúng định dạng.", "password": "Mật khẩu từ 8 đến 128 ký tự."}}}
```

An Admin may not create Admins:

```http
POST /api/admins
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"name": "Lý Văn Tâm", "email": "tam@gradstudio.test", "password": "tam-demo-2026"}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## GET /api/settings

Who: the Superadmin.

Success: `200` with the settings.

Errors: `401` without a token; `403` for any other role.

```http
GET /api/settings
Authorization: Bearer {{token:superadmin}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"openingHours": {"weekday": {"open": "08:00", "close": "18:00"}, "weekend": {"open": "08:00", "close": "18:00"}}, "reminderHoursBefore": 24}
```

A customer may not read them:

```http
GET /api/settings
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## PUT /api/settings

Who: the Superadmin. Replaces the settings: every field is sent every time. A new `reminderHoursBefore` applies to reminders set after the change (R4).

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `openingHours.weekday.open` | string | yes | `HH:MM` |
| `openingHours.weekday.close` | string | yes | `HH:MM`, after `open` |
| `openingHours.weekend.open` | string | yes | `HH:MM` |
| `openingHours.weekend.close` | string | yes | `HH:MM`, after `open` |
| `reminderHoursBefore` | integer | yes | 1 to 168 (one week) |

Success: `200` with the new settings.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | a field missing or outside its limits | `openingHours.weekday.open`, `openingHours.weekend.open`: "Giờ theo dạng HH:MM."; `openingHours.weekday.close`, `openingHours.weekend.close`: "Giờ theo dạng HH:MM." or "Giờ đóng cửa phải sau giờ mở cửa."; `reminderHoursBefore`: "Số giờ từ 1 đến 168." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Superadmin | — |

Reminders two days ahead:

```http
PUT /api/settings
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"openingHours": {"weekday": {"open": "08:00", "close": "18:00"}, "weekend": {"open": "08:00", "close": "18:00"}}, "reminderHoursBefore": 48}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"openingHours": {"weekday": {"open": "08:00", "close": "18:00"}, "weekend": {"open": "08:00", "close": "18:00"}}, "reminderHoursBefore": 48}
```

Weekend closing before opening, and no reminder time:

```http
PUT /api/settings
Authorization: Bearer {{token:superadmin}}
Content-Type: application/json

{"openingHours": {"weekday": {"open": "08:00", "close": "18:00"}, "weekend": {"open": "18:00", "close": "08:00"}}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"openingHours.weekend.close": "Giờ đóng cửa phải sau giờ mở cửa.", "reminderHoursBefore": "Số giờ từ 1 đến 168."}}}
```

An Admin may not change them:

```http
PUT /api/settings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"openingHours": {"weekday": {"open": "07:00", "close": "18:00"}, "weekend": {"open": "07:00", "close": "18:00"}}, "reminderHoursBefore": 24}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## Changes

- 2026-11-20 — First version. No client code calls these endpoints yet.
- 2026-11-21 — Called by the client: `/quan-tri` (step G11). No change to the endpoints.
- 2026-11-28 — `openingHours` has `weekday` (Monday to Friday) and `weekend` (Saturday and Sunday) hours, each `open` and `close`, set by the Superadmin; `PUT /api/settings` checks the four times (`openingHours.weekday.open`, …). The product owners decided the hours bind proposals, new bookings and reschedules by the day of the week ([part II, answer 4](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28855460470819417&reply_comment_id=28858450227187108)). Sample values stay `08:00`–`18:00` for both (the team's; no time invented). Called by `/quan-tri` (step G11), updated after the mock.
