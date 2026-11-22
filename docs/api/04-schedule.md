# Schedule

What the Admin uses to list staff and rooms, inspect a day's busy blocks, and run the clash check before proposing a time (`03-conversations.md`, step G5) or changing a booking (`05-bookings.md`, step G10). Every endpoint here answers `401` without a token and `403` to any role other than `admin`.

Only bookings that hold a slot (*Đã đặt lịch*) block staff and rooms (R1); a booking in *Chờ cọc 30%* holds nothing. Two windows `[aFrom, aTo)` and `[bFrom, bTo)` on the same date overlap when `aFrom < bTo` and `bFrom < aTo`, so back-to-back slots such as `13:00–14:00` make-up and `14:00–16:00` shoot do not clash. Every slot must also sit inside the studio's `openingHours` (`settings.json`).

**Product owner decision and sample data.** Per the product owners' decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)), costume stock is not checked and the clash check covers people and rooms only (studio opening hours remain a team rule). In the seed, `Phòng A` (`r-a`), `Hoàng Gia Huy` (`u-staff3`), and each staff member's specialty are *sample* values filling the story.

## Objects

**Staff**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `u-…` |
| `name` | string | Shown on screen |
| `specialty` | string | `makeup` or `photographer` |

**Room**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `r-…` |
| `name` | string | Shown on screen |

**Busy block**

| Field | Type | Notes |
|---|---|---|
| `bookingId` | string | The booking holding the block (*Đã đặt lịch*) |
| `date` | string | `YYYY-MM-DD` |
| `from`, `to` | string | `HH:MM` |
| `staffId`, `staffName` | string | The assigned staff member |
| `roomId`, `roomName` | string or `null` | `null` for a make-up-only block |

**Clash check result**

| Field | Type | Notes |
|---|---|---|
| `available` | boolean | `true` when there are no conflicts |
| `message` | string | Vietnamese summary ready for the screen |
| `conflicts` | list | Each `{ "who", "kind", "date", "from", "to" }`; `kind` is `staff`, `room`, or `hours` |
| `freeTime` | object or `null` | `{ "makeup": { "from", "to" }, "shoot": { "from", "to" } }` — the first candidate free window on that date whose slots do not overlap held `busy` blocks and sit inside `openingHours` when a time clash occurs (`staff`/`room` only), otherwise `null` |

## GET /api/staff

Who: the Admin. Every studio staff member, in seed order.

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `specialty` | string | no | `makeup` or `photographer` |

Success: `200` with a list of staff objects.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `specialty` is not `makeup` or `photographer` | `specialty`: "Chuyên môn không hợp lệ." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Admin | — |

All staff:

```http
GET /api/staff
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "u-mai", "name": "Mai", "specialty": "makeup"}, {"id": "u-tuan", "name": "Tuấn", "specialty": "photographer"}, {"id": "u-staff3", "name": "Hoàng Gia Huy", "specialty": "photographer"}]
```

Filter by make-up specialty:

```http
GET /api/staff?specialty=makeup
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "u-mai", "name": "Mai", "specialty": "makeup"}]
```

Invalid specialty:

```http
GET /api/staff?specialty=editor
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"specialty": "Chuyên môn không hợp lệ."}}}
```

A customer may not read staff:

```http
GET /api/staff
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

No token:

```http
GET /api/staff
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## GET /api/rooms

Who: the Admin. Every studio room.

Success: `200` with a list of room objects.

Errors: `401` without a token; `403` for any other role.

```http
GET /api/rooms
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "r-a", "name": "Phòng A"}, {"id": "r-b", "name": "Phòng B"}]
```

A staff member may not list all studio rooms through this admin endpoint:

```http
GET /api/rooms
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## GET /api/schedule

Who: the Admin. Returns the studio's opening hours, held busy blocks, and the first candidate free window on `date` that does not overlap held blocks (or `null` when none / when the day has no held bookings).

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `date` | string | yes | `YYYY-MM-DD`, a real date |

Success: `200` with `{ "date", "openingHours", "blocks", "freeTime" }`.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `date` is missing or not a real `YYYY-MM-DD` date | `date`: "Ngày theo dạng YYYY-MM-DD." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Admin | — |

Saturday 24/10/2026 (GS-1023 holds Mai and Phòng A from 08:00 to 12:00):

```http
GET /api/schedule?date=2026-10-24
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"date": "2026-10-24", "openingHours": {"open": "08:00", "close": "18:00"}, "blocks": [{"bookingId": "GS-1023", "date": "2026-10-24", "from": "08:00", "to": "12:00", "staffId": "u-mai", "staffName": "Mai", "roomId": "r-a", "roomName": "Phòng A"}], "freeTime": {"makeup": {"from": "13:00", "to": "14:00"}, "shoot": {"from": "14:00", "to": "16:00"}}}
```

A day with no held bookings (`2026-10-25`):

```http
GET /api/schedule?date=2026-10-25
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"date": "2026-10-25", "openingHours": {"open": "08:00", "close": "18:00"}, "blocks": [], "freeTime": null}
```

A date in the wrong format:

```http
GET /api/schedule?date=24-10-2026
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"date": "Ngày theo dạng YYYY-MM-DD."}}}
```

## POST /api/schedule/check

Who: the Admin. Checks whether a candidate time, make-up artist, photographer, and room clash with held bookings or studio opening hours on `date`. Never modifies state.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `date` | string | yes | `YYYY-MM-DD`, a real date |
| `makeup` | object or `null` | no | `from`, `to` (`HH:MM`, `to` after `from`), `staffId` (a staff member) |
| `shoot` | object | yes | `from`, `to` (`HH:MM`, `to` after `from`), `staffId` (a staff member), `roomId` (a room) |
| `excludeBookingId` | string | no | a booking id whose held blocks are ignored (used when rescheduling in `05-bookings.md`) |

Success: `200` with the clash check result (`available`, `message`, `conflicts`, `freeTime`).

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | a field is missing or outside its limits | `date`: "Ngày theo dạng YYYY-MM-DD."; `makeup.from` / `shoot.from`: "Giờ theo dạng HH:MM."; `makeup.to` / `shoot.to`: "Giờ theo dạng HH:MM." or "Giờ kết thúc phải sau giờ bắt đầu."; `makeup.staffId` / `shoot.staffId`: "Không có nhân viên này."; `shoot.roomId`: "Không có phòng này." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Admin | — |

Linh's requested 09:00 clashes with GS-1023 (Mai busy 08:00–12:00):

```http
POST /api/schedule/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "08:00", "to": "09:00", "staffId": "u-mai"}, "shoot": {"from": "09:00", "to": "11:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"available": false, "message": "Mai (makeup) bận 08:00–12:00 ngày 24/10/2026. Giờ trống: makeup 13:00–14:00, chụp 14:00–16:00.", "conflicts": [{"who": "Mai", "kind": "staff", "date": "2026-10-24", "from": "08:00", "to": "12:00"}], "freeTime": {"makeup": {"from": "13:00", "to": "14:00"}, "shoot": {"from": "14:00", "to": "16:00"}}}
```

The suggested 13:00–14:00 make-up and 14:00–16:00 shoot are free:

```http
POST /api/schedule/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"available": true, "message": "Lịch trống: makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B.", "conflicts": [], "freeTime": null}
```

Excluding GS-1023 itself ignores its held block (for rescheduling):

```http
POST /api/schedule/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": null, "shoot": {"from": "08:00", "to": "12:00", "staffId": "u-mai", "roomId": "r-a"}, "excludeBookingId": "GS-1023"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"available": true, "message": "Lịch trống: chụp 08:00–12:00 với Mai tại Phòng A.", "conflicts": [], "freeTime": null}
```

Outside the studio's opening hours (`08:00`–`18:00` in `settings.json`):

```http
POST /api/schedule/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-25", "makeup": null, "shoot": {"from": "17:00", "to": "19:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"available": false, "message": "Ngoài giờ mở cửa studio (08:00–18:00).", "conflicts": [{"who": "Giờ mở cửa studio", "kind": "hours", "date": "2026-10-25", "from": "08:00", "to": "18:00"}], "freeTime": null}
```

Invalid date, end time before start time, and unknown staff and room:

```http
POST /api/schedule/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "24/10/2026", "shoot": {"from": "16:00", "to": "14:00", "staffId": "u-nobody", "roomId": "r-z"}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"date": "Ngày theo dạng YYYY-MM-DD.", "shoot.to": "Giờ kết thúc phải sau giờ bắt đầu.", "shoot.staffId": "Không có nhân viên này.", "shoot.roomId": "Không có phòng này."}}}
```

Only the Admin may run the clash check:

```http
POST /api/schedule/check
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": null, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## Changes

- 2026-11-21 — First version. No client code calls these endpoints yet.
- 2026-11-22 — Remove costume stock checking (`schedule.costumes`, `costumes` field, `Costume stock` object, `costume` conflict kind) per the product owners' decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)); `checkSchedule` covers staff, rooms, and studio opening hours, and `freeTime` chooses the first candidate window for a date that does not clash with held `busy` blocks. No client code calls these endpoints yet.
