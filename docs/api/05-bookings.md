# Bookings

What the Admin and customer do with bookings: create a booking once the customer agrees in chat (`03-conversations.md`, step G6), read bookings and payment status (steps G7, G10), reschedule or cancel with the clash check at the new time, and add the final file link (step G10). Deposits and remainders are in `06-payments.md`; previews, photo selection, and *Nhận ảnh* are in `09-gallery.md`.

Only bookings in *Đã đặt lịch* hold staff, rooms, and costume stock (R1). Creating a booking starts it in *Chờ cọc 30%* and links it to the conversation (`bookingId`), without holding any slot yet; the slot is held only when the 30% deposit succeeds (`06-payments.md`).

**Team assumptions and sample data.** Until the product owners answer (`FRONTEND.md`, section 5):
1. A cancelled booking's status is *Đã hủy*; only the Admin may cancel or change a booking, and any deposit refund rule waits for the product owners.
2. Each package lists the extras it already includes (`includes` in `02-catalogue.md`); an included extra shows `0đ` in `pricing.items`, while an extra outside the package is added to the total (`null` while its price waits for the product owners).
3. For a class yearbook, the package price is multiplied by `people` (the Admin confirms the representative's estimated head count and may adjust the total).

## Statuses

| Status | When |
|---|---|
| `Chờ cọc 30%` | Created from an agreed conversation; slot is not held yet |
| `Đã đặt lịch` | 30% deposit succeeded (`06-payments.md`); slot is held |
| `Hoàn thành` | Customer received the final files via *Nhận ảnh* (`09-gallery.md`) |
| `Đã hủy` | Cancelled by the Admin (*team assumption*); any held slot is released |

## Objects

**Booking**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `GS-1024`, sequential from `GS-1020` in the seed |
| `conversationId` | string or `null` | Conversation that created it (`c-linh` for `GS-1024`) |
| `customer` | object | `{ "id", "name" }` |
| `admin` | object | `{ "id", "name" }`, the Admin handling it |
| `serviceId`, `serviceName` | string | From `02-catalogue.md` |
| `packageId`, `packageName` | string | From `02-catalogue.md` |
| `durationMinutes` | integer or `null` | From the package (`120` for Premium) |
| `editedPhotos` | integer or `null` | From the package (`30` for Premium) |
| `sessionType` | string | e.g. `"Tốt nghiệp cá nhân"` |
| `people` | integer | Confirmed head count (1 to 200) |
| `extras` | list | Each `{ "extraId", "name", "modelId", "modelName", "size", "quantity" }` (`modelId`, `modelName`, `size` are `null` except for a costume) |
| `date` | string | `YYYY-MM-DD` |
| `makeup` | object or `null` | `{ "from", "to", "staffId", "staffName" }` |
| `shoot` | object | `{ "from", "to", "staffId", "staffName", "roomId", "roomName" }` |
| `status` | string | One of the four statuses above |
| `pricing` | object | `{ "items": [{ "label", "amount", "included" }], "total", "deposit", "remainder" }` (amounts in integer đồng, computed by the API; `amount` is `null` if an unincluded extra's price is *waiting*) |
| `payment` | object | `{ "depositStatus", "depositPaidAt", "remainderStatus", "remainderPaidAt" }`; status is `unpaid` or `paid`, timestamps are ISO 8601 with offset or `null` |
| `fileLink` | string or `null` | Final delivery URL added by the Admin in step G10 |

## POST /api/bookings

Who: the Admin (step G6, Admin side). Creates a booking from a conversation whose latest proposal was agreed by the customer (*Đã chốt lịch*) and that does not have a booking yet. Checks for clashes (`04-schedule.md` rules) against currently held bookings before creating. Starts the booking in *Chờ cọc 30%* (`payment.depositStatus` = `unpaid`) and sets `conversation.bookingId`.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `conversationId` | string | yes | an existing conversation in *Đã chốt lịch* with `bookingId` `null` |
| `serviceId` | string | yes | a service's id |
| `packageId` | string | yes | a package of that service |
| `sessionType` | string | no | 1 to 100 characters; defaults to the service's `name` |
| `people` | integer | yes | 1 to 200 |
| `extras` | list | no | each `{ "extraId", "modelId", "size", "quantity" }`; `modelId` and `size` required for a costume; `quantity` integer 1 to 200 (default `1`) |

Success: `201` with the new booking object.

Errors:

| Status | `code` | When | `fields` or `details` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | missing or invalid fields | `conversationId`, `serviceId`, `packageId`, `sessionType`, `people`, `extras` |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Admin | — |
| `404` | `NOT_FOUND` | unknown conversation | — |
| `409` | `CONFLICT` | conversation is not *Đã chốt lịch*, already has a booking, or the agreed time/costume now clashes with held bookings | `details` (`conflicts`, `freeTime`) when a clash occurs |

Refused when the customer has not agreed to a proposed time yet (`c-uyen`, R2):

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"conversationId": "c-uyen", "serviceId": "ky-yeu", "packageId": "ky-yeu-lop", "people": 25}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Khách chưa đồng ý lịch đề xuất."}}
```

Refused when the conversation already has a booking (`c-customer2` -> `GS-1022`):

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"conversationId": "c-customer2", "serviceId": "tot-nghiep", "packageId": "tot-nghiep-premium", "people": 1}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Hội thoại này đã có booking GS-1022."}}
```

Invalid fields:

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"conversationId": "c-linh", "serviceId": "dam-cuoi", "packageId": "vip", "people": 0}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"serviceId": "Không có dịch vụ này.", "packageId": "Gói không thuộc dịch vụ này.", "people": "Số người từ 1 đến 200."}}}
```

Only the Admin may create a booking:

```http
POST /api/bookings
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"conversationId": "c-linh", "serviceId": "tot-nghiep", "packageId": "tot-nghiep-premium", "people": 1}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Thảo creates GS-1024 from Linh's agreed conversation (`c-linh`):

```http
POST /api/bookings
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"conversationId": "c-linh", "serviceId": "tot-nghiep", "packageId": "tot-nghiep-premium", "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup"}]}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}
```

## GET /api/bookings

Who: a customer (their own bookings, step G7) or the Admin (all bookings, step G10). Newest first.

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `status` | string | no | one of the four booking statuses |

Success: `200` with a list of booking objects.

Errors: `400` (`status`: `"Trạng thái không hợp lệ."`), `401` without a token, `403` for staff or Superadmin.

Linh reads her own bookings:

```http
GET /api/bookings
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}]
```

Thảo lists all bookings:

```http
GET /api/bookings
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "GS-1024", "conversationId": …, "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": …, "editedPhotos": …, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": …, "date": "2026-10-24", "makeup": …, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": …, "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": …, "remainderStatus": "unpaid", "remainderPaidAt": …}, "fileLink": …}, …]
```

Filter by status (`Chờ cọc 30%`):

```http
GET /api/bookings?status=Ch%E1%BB%9D%20c%E1%BB%8Dc%2030%25
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}]
```

Invalid status query:

```http
GET /api/bookings?status=Moi
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"status": "Trạng thái không hợp lệ."}}}
```

Staff cannot list bookings through the admin endpoint:

```http
GET /api/bookings
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

No token:

```http
GET /api/bookings
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## GET /api/bookings/:id

Who: the booking's customer, or the Admin. Another customer's booking answers `404`. Staff and Superadmin answer `403`.

Success: `200` with the booking object.

Errors: `401` without a token; `403` for staff or Superadmin; `404` for an unknown id or another customer's booking.

Linh reads GS-1024:

```http
GET /api/bookings/GS-1024
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}
```

Another customer cannot see Linh's booking:

```http
GET /api/bookings/GS-1024
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

Unknown booking id:

```http
GET /api/bookings/GS-9999
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

## PATCH /api/bookings/:id

Who: the Admin (step G10). Updates a booking's date, make-up/shoot slots, head count (`people`), confirmed `total` (for class yearbook adjustment), `sessionType`, or `extras`. Runs the clash check (`04-schedule.md` rules, excluding this booking's own blocks and costumes) before applying any time, staff, room, or costume change. If the booking is in *Đã đặt lịch*, its held blocks in `busy` are updated too.

**Deposit and remainder after price changes:**
- Before the 30% deposit is paid (`payment.depositStatus` = `unpaid`), `pricing.deposit` is `Math.round(total * 0.3)` and `pricing.remainder` is `total - deposit`.
- Once the deposit is already `paid`, **`pricing.deposit` stays locked at the deposit amount already paid** (it is never recomputed when `total`, `people`, or `extras` change), and `pricing.remainder` becomes `pricing.total - pricing.deposit`.
- Setting `total` below the already-paid deposit is refused with `409` (any refund rule waits for the product owners). Changing `total`, `people`, or `extras` after `payment.remainderStatus` is `paid` is also refused with `409`.

Body (all fields optional; at least one field must be sent):

| Field | Type | Limits |
|---|---|---|
| `date` | string | `YYYY-MM-DD`, a real date |
| `makeup` | object or `null` | `{ "from", "to", "staffId" }` |
| `shoot` | object | `{ "from", "to", "staffId", "roomId" }` |
| `people` | integer | 1 to 200 |
| `total` | integer | `>= 0` (Admin adjustment, e.g. for class yearbook confirmation) |
| `sessionType` | string | 1 to 100 characters |
| `extras` | list | same rules as `POST /api/bookings` |

Success: `200` with the updated booking object.

Errors:

| Status | `code` | When | `fields` or `details` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | empty body (none of the fields sent), or any sent field is invalid | empty body: `date`: `"Chọn thông tin cần thay đổi."`; `date`: `"Ngày theo dạng YYYY-MM-DD."`; `makeup.from` / `shoot.from`: `"Giờ theo dạng HH:MM."`; `makeup.to` / `shoot.to`: `"Giờ theo dạng HH:MM."` or `"Giờ kết thúc phải sau giờ bắt đầu."`; `makeup.staffId` / `shoot.staffId`: `"Không có nhân viên này."`; `shoot.roomId`: `"Không có phòng này."`; `people`: `"Số người từ 1 đến 200."`; `total`: `"Tổng tiền phải là số nguyên không âm."`; `sessionType`: `"Loại buổi chụp từ 1 đến 100 ký tự."`; `extras`: `"Dịch vụ thêm không hợp lệ."` |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Admin | — |
| `404` | `NOT_FOUND` | unknown booking | — |
| `409` | `CONFLICT` | booking is *Hoàn thành* or *Đã hủy*, requested slot/costume clashes with held bookings, `total` is below already-paid deposit, or price edited after remainder is `paid` | `details` (`conflicts`, `freeTime`) on a clash |

Refused when trying to move GS-1024 to 09:00 (Mai busy 08:00–12:00):

```http
PATCH /api/bookings/GS-1024
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "08:00", "to": "09:00", "staffId": "u-mai"}, "shoot": {"from": "09:00", "to": "11:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Mai (makeup) bận 08:00–12:00 ngày 24/10/2026. Giờ trống: makeup 13:00–14:00, chụp 14:00–16:00.", "details": {"conflicts": [{"who": "Mai", "kind": "staff", "date": "2026-10-24", "from": "08:00", "to": "12:00"}], "freeTime": {"makeup": {"from": "13:00", "to": "14:00"}, "shoot": {"from": "14:00", "to": "16:00"}}}}}
```

Moving GS-1024 to another free afternoon slot (`15:00–17:00`):

```http
PATCH /api/bookings/GS-1024
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "14:00", "to": "15:00", "staffId": "u-mai"}, "shoot": {"from": "15:00", "to": "17:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "14:00", "to": "15:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "15:00", "to": "17:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}
```

Restoring GS-1024 to the brief's agreed 13:00–14:00 and 14:00–16:00 slots (for `06-payments.md`–`08-jobs.md`):

```http
PATCH /api/bookings/GS-1024
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}
```

Cannot change a completed booking (`GS-1021`):

```http
PATCH /api/bookings/GS-1021
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"sessionType": "Tốt nghiệp"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Booking đã hoàn thành hoặc đã hủy, không thể thay đổi."}}
```

Confirming class yearbook head count after the 30% deposit is already `paid` (`GS-1023`: `deposit` stays `2100000`, `remainder` updates to `5600000`):

```http
PATCH /api/bookings/GS-1023
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"people": 22}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1023", "conversationId": null, "customer": {"id": "u-khoa", "name": "Võ Đăng Khoa"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "ky-yeu", "serviceName": "Kỷ yếu lớp", "packageId": "ky-yeu-lop", "packageName": "Gói Kỷ yếu lớp", "durationMinutes": null, "editedPhotos": null, "sessionType": "Kỷ yếu lớp", "people": 22, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "08:00", "to": "12:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "08:00", "to": "12:00", "staffId": "u-mai", "staffName": "Mai", "roomId": "r-a", "roomName": "Phòng A"}, "status": "Đã đặt lịch", "pricing": {"items": [{"label": "Gói Kỷ yếu lớp (22 người)", "amount": 7700000, "included": false}, {"label": "Makeup", "amount": null, "included": false}], "total": 7700000, "deposit": 2100000, "remainder": 5600000}, "payment": {"depositStatus": "paid", "depositPaidAt": "2026-10-14T09:00:00+07:00", "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}
```

Restoring GS-1023 to its seed head count (`20` people, `total` `7000000`, `deposit` `2100000`, `remainder` `4900000`):

```http
PATCH /api/bookings/GS-1023
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"people": 20}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1023", "conversationId": null, "customer": {"id": "u-khoa", "name": "Võ Đăng Khoa"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "ky-yeu", "serviceName": "Kỷ yếu lớp", "packageId": "ky-yeu-lop", "packageName": "Gói Kỷ yếu lớp", "durationMinutes": null, "editedPhotos": null, "sessionType": "Kỷ yếu lớp", "people": 20, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "08:00", "to": "12:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "08:00", "to": "12:00", "staffId": "u-mai", "staffName": "Mai", "roomId": "r-a", "roomName": "Phòng A"}, "status": "Đã đặt lịch", "pricing": {"items": [{"label": "Gói Kỷ yếu lớp (20 người)", "amount": 7000000, "included": false}, {"label": "Makeup", "amount": null, "included": false}], "total": 7000000, "deposit": 2100000, "remainder": 4900000}, "payment": {"depositStatus": "paid", "depositPaidAt": "2026-10-14T09:00:00+07:00", "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}
```

Refused when setting `total` below the already-paid deposit (`GS-1023` paid `2100000`):

```http
PATCH /api/bookings/GS-1023
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"total": 2000000}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Tổng tiền không được nhỏ hơn tiền cọc đã thanh toán."}}
```

Empty body on `PATCH`:

```http
PATCH /api/bookings/GS-1024
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"date": "Chọn thông tin cần thay đổi."}}}
```

Invalid fields on `PATCH`:

```http
PATCH /api/bookings/GS-1024
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"people": 0, "total": -1, "sessionType": ""}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"people": "Số người từ 1 đến 200.", "total": "Tổng tiền phải là số nguyên không âm.", "sessionType": "Loại buổi chụp từ 1 đến 100 ký tự."}}}
```

A customer cannot edit a booking directly:

```http
PATCH /api/bookings/GS-1024
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"people": 2}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## PUT /api/bookings/:id/file-link

Who: the Admin (step G10). Sets the final delivery file link on a booking that is in *Đã đặt lịch* (or updates it before *Hoàn thành*).

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `fileLink` | string | yes | `http://` or `https://` URL, 1 to 500 characters |

Success: `200` with the updated booking object.

Errors: `400` (`fileLink`: `"Nhập đường dẫn file hợp lệ (http:// hoặc https://)."`), `401`, `403`, `404`, `409` (booking is still *Chờ cọc 30%* or *Đã hủy* / *Hoàn thành*).

Thảo adds the final file link to GS-1022 (used by `09-gallery.md` for *Nhận ảnh*):

```http
PUT /api/bookings/GS-1022/file-link
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"fileLink": "https://drive.gradstudio.test/gs-1022-final"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1022", "conversationId": "c-customer2", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-18", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Đã đặt lịch", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "paid", "depositPaidAt": …, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": "https://drive.gradstudio.test/gs-1022-final"}
```

Refused while GS-1024 has not paid its deposit (*Chờ cọc 30%*):

```http
PUT /api/bookings/GS-1024/file-link
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"fileLink": "https://drive.gradstudio.test/gs-1024-final"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Chỉ gắn link file ảnh cho booking đã đặt lịch."}}
```

Invalid file link URL:

```http
PUT /api/bookings/GS-1022/file-link
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"fileLink": "khong-phai-link"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"fileLink": "Nhập đường dẫn file hợp lệ (http:// hoặc https://)."}}}
```

## POST /api/bookings/:id/cancel

Who: the Admin (team assumption until the product owners answer). Cancels a booking in *Chờ cọc 30%* or *Đã đặt lịch*, moves its status to *Đã hủy*, and releases any held blocks in `busy`. Refused with `409` if already *Hoàn thành* or *Đã hủy*.

Body: optional `{ "reason" }` (string, 0 to 500 characters).

Success: `200` with the cancelled booking object (`status: "Đã hủy"`).

Errors: `400` (`reason`: `"Lý do hủy tối đa 500 ký tự."`), `401`, `403`, `404`, `409`.

Note: `GS-1020`–`GS-1024` stay active for `06-payments.md`–`09-gallery.md`, so the examples below check the guard paths; `test/mock.test.mjs` verifies the `200` cancellation path and held-slot release on its own fresh mock process.

Refused when trying to cancel a completed booking (`GS-1021`):

```http
POST /api/bookings/GS-1021/cancel
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"reason": "Khách yêu cầu hủy."}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Không thể hủy booking ở trạng thái này."}}
```

A customer cannot cancel a booking directly:

```http
POST /api/bookings/GS-1024/cancel
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Unknown booking id:

```http
POST /api/bookings/GS-9999/cancel
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

## Changes

- 2026-11-21 — First version. No client code calls these endpoints yet.
- 2026-11-22 — Lock `pricing.deposit` once the deposit is `paid` when `total`, `people`, or `extras` change (refuse `total` below paid deposit or price changes after remainder is `paid`), document full per-field `400` validation errors with examples on `PATCH /api/bookings/:id`, and replace the untrue mock-test claim on `POST /api/bookings/:id/cancel` with an accurate reference to `test/mock.test.mjs` (PR #5 review fixes). No client code calls these endpoints yet.
