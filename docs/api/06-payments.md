# Payments

Deposit (30%, step G7) and remainder (70%, step G9) payments through the app's test gateway. A payment starts as `pending`, the customer chooses success or failure on the test gateway route (`/thanh-toan/...`, returning to `/thanh-toan/ket-qua`), and the result is recorded once through `POST /api/payments/:id/result`.

**Rules (R1 and brief section 3):**
1. A booking's time, staff, room, and costume stock are held **only after the 30% deposit succeeds** and the resources are checked again against already-booked slots (*Đã đặt lịch*).
2. When a deposit succeeds, the booking moves from *Chờ cọc 30%* to *Đã đặt lịch*, and its make-up and shoot blocks are added to `busy` so the clash check (`03-conversations.md`, `04-schedule.md`, `05-bookings.md`) sees them.
3. When a remainder payment succeeds (after the 30% deposit is already `paid`), `payment.remainderStatus` becomes `paid`; the booking stays *Đã đặt lịch* until the customer presses *Nhận ảnh* (`09-gallery.md`).

**Team assumption.** Until the product owners answer (`FRONTEND.md`, section 5): when a deposit attempt fails, the booking stays *Chờ cọc 30%* with a Vietnamese failure message, no slot is held, and the customer may start a new payment attempt to try again.

## Objects

**Payment**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `pay-…` |
| `bookingId` | string | e.g. `GS-1024` |
| `customerId` | string | Owner of the booking |
| `kind` | string | `deposit` (30%) or `remainder` (70%) |
| `amount` | integer | Computed by the API from the booking's `pricing` (`540000` or `1260000` for `GS-1024`) |
| `status` | string | `pending`, `succeeded`, or `failed` |
| `message` | string or `null` | Vietnamese outcome message once `succeeded` or `failed` |
| `createdAt` | string | ISO 8601 with offset |
| `completedAt` | string or `null` | ISO 8601 with offset once finished |

**Payment result response**: `{ "payment": <Payment>, "booking": <Booking> }`.

## GET /api/payments

Who: a customer (their own payments) or the Admin (all payments). Newest first.

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `bookingId` | string | no | filter to one booking (`404` if another customer's booking) |

Success: `200` with a list of payment objects.

Errors: `401` without a token; `403` for staff or Superadmin; `404` if `bookingId` belongs to another customer or does not exist.

## POST /api/payments

Who: the booking's customer. Starts a new `pending` payment attempt (`deposit` or `remainder`) for a booking.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `bookingId` | string | yes | an existing booking owned by the caller |
| `kind` | string | yes | `deposit` or `remainder` |

Success: `201` with the new `pending` payment object.

Errors:

| Status | `code` | When | `fields` or `details` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | missing `bookingId` or invalid `kind` | `bookingId`: "Chọn booking."; `kind`: "Loại thanh toán là deposit hoặc remainder." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not a customer | — |
| `404` | `NOT_FOUND` | unknown booking or another customer's booking | — |
| `409` | `CONFLICT` | booking is *Đã hủy* or *Hoàn thành*; `deposit` already `paid`; `remainder` requested before `deposit` is `paid` or already `paid`; `amount` is `null`; or resources now clash on `deposit` | `details` (`conflicts`, `freeTime`) on a clash |

Another customer cannot pay for GS-1022 (`linh` vs `customer2`):

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1022", "kind": "remainder"}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

Only a customer initiates payment (`thao` is Admin):

```http
POST /api/payments
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "deposit"}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Invalid payment kind:

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "full"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"kind": "Loại thanh toán là deposit hoặc remainder."}}}
```

Cannot pay remainder before deposit (`GS-1024` is still *Chờ cọc 30%*):

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "remainder"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Cần thanh toán cọc 30% trước khi thanh toán phần còn lại."}}
```

Linh starts her first 30% deposit attempt for GS-1024 (`540.000đ`):

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "deposit"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "pay-1", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "pending", "message": null, "createdAt": …, "completedAt": null}
```

## GET /api/payments/:id

Who: the payment's customer, or the Admin. Another customer's payment answers `404`.

Success: `200` with the payment object.

Errors: `401` without a token; `403` for staff or Superadmin; `404` for an unknown id or another customer's payment.

Linh reads her pending payment on the test gateway route:

```http
GET /api/payments/pay-1
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "pay-1", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "pending", "message": null, "createdAt": …, "completedAt": null}
```

Another customer cannot read Linh's payment:

```http
GET /api/payments/pay-1
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

## POST /api/payments/:id/result

Who: the payment's customer. Records the outcome chosen on the test gateway (`success` or `fail`). An already-finished payment answers `409`. When `result` is `success` for a `deposit`, resources are checked again before moving the booking to *Đã đặt lịch* and adding its time blocks to `busy`.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `result` | string | yes | `success` or `fail` |

Success: `200` with `{ "payment", "booking" }`.

Errors: `400` (`result`: `"Chọn success hoặc fail."`), `401`, `403`, `404`, `409` (payment result already applied, or resources clashed on re-check with `details`).

First deposit attempt fails: GS-1024 stays *Chờ cọc 30%*:

```http
POST /api/payments/pay-1/result
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "fail"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"payment": {"id": "pay-1", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "failed", "message": "Thanh toán cọc chưa thành công. Bạn có thể thử lại.", "createdAt": …, "completedAt": …}, "booking": {"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}}
```

Applying a result to the same payment twice is refused with `409`:

```http
POST /api/payments/pay-1/result
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "success"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Kết quả thanh toán này đã được ghi nhận."}}
```

Linh retries the deposit and succeeds: GS-1024 becomes *Đã đặt lịch* and its blocks are added to `busy`:

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "deposit"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "pay-2", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "pending", "message": null, "createdAt": …, "completedAt": null}
```

```http
POST /api/payments/pay-2/result
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "success"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"payment": {"id": "pay-2", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "succeeded", "message": "Thanh toán cọc 30% thành công. Lịch chụp đã được giữ.", "createdAt": …, "completedAt": …}, "booking": {"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Đã đặt lịch", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "paid", "depositPaidAt": …, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}}
```

Starting another deposit after GS-1024 is already paid is refused with `409`:

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "deposit"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Booking này đã thanh toán cọc 30%."}}
```

Because GS-1024 is now *Đã đặt lịch*, the clash check sees its blocks (`13:00–14:00` Mai, `14:00–16:00` Tuấn and Phòng B):

```http
POST /api/schedule/check
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": null, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"available": false, "message": …, "conflicts": [{"who": "Tuấn", "kind": "staff", "date": "2026-10-24", "from": "14:00", "to": "16:00"}, {"who": "Phòng B", "kind": "room", "date": "2026-10-24", "from": "14:00", "to": "16:00"}], "freeTime": …}
```

Minh Anh pays the remaining 70% for GS-1022 (`1.260.000đ`), leaving it ready for *Nhận ảnh* in `09-gallery.md`:

```http
POST /api/payments
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"bookingId": "GS-1022", "kind": "remainder"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "pay-3", "bookingId": "GS-1022", "customerId": "u-customer2", "kind": "remainder", "amount": 1260000, "status": "pending", "message": null, "createdAt": …, "completedAt": null}
```

```http
POST /api/payments/pay-3/result
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"result": "success"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"payment": {"id": "pay-3", "bookingId": "GS-1022", "customerId": "u-customer2", "kind": "remainder", "amount": 1260000, "status": "succeeded", "message": "Thanh toán 70% còn lại thành công.", "createdAt": …, "completedAt": …}, "booking": {"id": "GS-1022", "conversationId": "c-customer2", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-18", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Đã đặt lịch", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000, "included": false}, {"label": "Makeup", "amount": 0, "included": true}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "paid", "depositPaidAt": …, "remainderStatus": "paid", "remainderPaidAt": …}, "fileLink": "https://drive.gradstudio.test/gs-1022-final"}}
```

Linh lists her payments for GS-1024 (newest first):

```http
GET /api/payments?bookingId=GS-1024
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "pay-2", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "succeeded", "message": "Thanh toán cọc 30% thành công. Lịch chụp đã được giữ.", "createdAt": …, "completedAt": …}, {"id": "pay-1", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "failed", "message": "Thanh toán cọc chưa thành công. Bạn có thể thử lại.", "createdAt": …, "completedAt": …}]
```

## Changes

- 2026-11-21 — First version. No client code calls these endpoints yet.
