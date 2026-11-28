# Payments

Deposit (30%, step G7) and remainder (70%, step G9) payments through the app's test gateway. A payment starts as `pending`, the customer chooses success or failure on the test gateway route (`/thanh-toan/:paymentId`, returning to `/thanh-toan/:paymentId/ket-qua`, matching `FRONTEND.md` section 4), and the result is recorded once through `POST /api/payments/:id/result`.

**Rules (R1, brief section 3, product owners' decisions, and team reading of G9):**
1. A booking's time, staff, and room are held **only after the 30% deposit succeeds** and the resources are checked again against already-booked slots (*Đã đặt lịch*). Costume stock is not checked ([product owners](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)).
2. When a deposit succeeds on a free slot, the booking moves from *Chờ cọc 30%* to *Đã đặt lịch*, and its make-up and shoot blocks are added to `busy` so the clash check (`03-conversations.md`, `04-schedule.md`, `05-bookings.md`) sees them.
3. **Concurrent second-customer deposit ([product owners](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)):** if two bookings in *Chờ cọc 30%* reach checkout together for overlapping resources and the first customer pays first, when the second customer's deposit finishes (`POST /api/payments/:id/result` with `result: "success"`), the payment is still recorded as **`succeeded`** (never `failed`) and `booking.payment.depositStatus` becomes **`paid`** (preventing paying twice, `409`), while the booking **keeps status *Chờ cọc 30%*** (no blocks added to `busy`) and `payment.message` explains that the slot is already held by another customer. No auto-refund happens: the Admin refunds outside the system, cancels the booking, or — **team assumption (follow-up question for the product owners)** — agrees on a new free time with the customer and moves the booking via `PATCH /api/bookings/:id` (`05-bookings.md`), which transitions the booking to *Đã đặt lịch*, adds its blocks to `busy`, and unlocks the remaining 70% payment (`GS-1025` illustrative example in `05-bookings.md`; verified end to end on its own fresh mock process in `test/mock.test.mjs`).
4. **Failed payments & retries ([product owners](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)):** when `result: "fail"` is recorded, the booking keeps its status (*Chờ cọc 30%* or *Đã đặt lịch* waiting for 70%), with message `"Thanh toán không thành công, booking vẫn chờ cọc."` (deposit) or `"Thanh toán không thành công, booking vẫn chờ thanh toán 70% còn lại."` (remainder), and unlimited retries via `POST /api/payments`. An amount already `paid` answers `409`.
5. **Team reading of step G9 in the brief & product owners' 2026-11-27 decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28852226657809465&reply_comment_id=28852825087749622)):** the remaining 70% follows the order *chọn ảnh → trả 70% → Nhận ảnh*. Paying `remainder` (`POST /api/payments` and `POST /api/payments/:id/result` with `result: "success"`) requires: (1) booking in *Đã đặt lịch* with `depositStatus === "paid"`, (2) the booking's `shoot` job (`role === "shoot"` in `08-jobs.md`) has status *Hoàn thành*, and (3) a saved photo selection (`09-gallery.md`) with `remainderStatus !== "paid"`. If the `shoot` job is not *Hoàn thành*, the API answers `409` (`"Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại."`); if no photo selection is saved yet, the API answers `409` (`"Cần chọn ảnh trước khi thanh toán 70% còn lại."`). When a remainder payment succeeds, `payment.remainderStatus` becomes `paid`; the booking stays *Đã đặt lịch* until *Nhận ảnh* (`09-gallery.md`).

**Team assumption.** For PA#3, because there is no external payment provider, the signed-in customer records the test gateway outcome directly via `POST /api/payments/:id/result`.

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
| `400` | `VALIDATION_ERROR` | missing `bookingId` or invalid `kind` | `bookingId`: "Chọn booking."; `kind`: "Chọn thanh toán cọc hoặc phần còn lại." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not a customer | — |
| `404` | `NOT_FOUND` | unknown booking or another customer's booking | — |
| `409` | `CONFLICT` | booking is *Đã hủy* or *Hoàn thành*; `deposit` already `paid`; `remainder` requested before *Đã đặt lịch* (`deposit` unpaid or concurrent clash left slot unheld), while `shoot` job (`08-jobs.md`) is not *Hoàn thành*, before a photo selection is saved, or already `paid`; `amount` is `null`; or resources now clash on `deposit` before opening checkout | `details` (`conflicts`, `freeTime`) on a pre-checkout clash |

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

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"kind": "Chọn thanh toán cọc hoặc phần còn lại."}}}
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

Who: the payment's customer. Records the outcome chosen on the test gateway (`success` or `fail`). An already-finished payment answers `409`. When `result` is `success` for a `deposit`, resources are checked again: if free, the booking moves to *Đã đặt lịch* and adds its time blocks to `busy`; if another customer's deposit has already taken those resources, `payment.status` is still recorded as `succeeded` (received, with `booking.payment.depositStatus` set to `paid`) while `booking.status` remains *Chờ cọc 30%* and `payment.message` carries the reason.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `result` | string | yes | `success` or `fail` |

Success: `200` with `{ "payment", "booking" }`.

Errors: `400` (`result`: `"Chọn thành công hoặc thất bại."`), `401`, `403`, `404`, `409` (payment result already applied, amount already paid, `shoot` job not *Hoàn thành*, missing photo selection, or booking not *Đã đặt lịch* for `remainder`).

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

{"payment": {"id": "pay-1", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "failed", "message": "Thanh toán không thành công, booking vẫn chờ cọc.", "createdAt": …, "completedAt": …}, "booking": {"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Chờ cọc 30%", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "unpaid", "depositPaidAt": null, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}}
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

Invalid result choice:

```http
POST /api/payments/pay-1/result
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"result": "done"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"result": "Chọn thành công hoặc thất bại."}}}
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

{"payment": {"id": "pay-2", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "succeeded", "message": "Thanh toán cọc 30% thành công. Lịch chụp đã được giữ.", "createdAt": …, "completedAt": …}, "booking": {"id": "GS-1024", "conversationId": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "admin": {"id": "u-thao", "name": "Thảo"}, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": "Tốt nghiệp cá nhân", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai", "staffName": "Mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "staffName": "Tuấn", "roomId": "r-b", "roomName": "Phòng B"}, "status": "Đã đặt lịch", "pricing": {"items": [{"label": "Gói Tốt nghiệp Premium", "amount": 1800000}], "total": 1800000, "deposit": 540000, "remainder": 1260000}, "payment": {"depositStatus": "paid", "depositPaidAt": …, "remainderStatus": "unpaid", "remainderPaidAt": null}, "fileLink": null}}
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

Refused when trying to pay the remaining 70% while GS-1024's `shoot` job (`08-jobs.md`) is not *Hoàn thành* yet:

```http
POST /api/payments
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"bookingId": "GS-1024", "kind": "remainder"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại."}}
```

Refused when trying to pay the remaining 70% before saving a photo selection (`GS-1022` has paid the deposit, no photo selection saved yet — team reading of step G9; `09-gallery.md` continues `GS-1022` through photo selection → 70% remainder → *Nhận ảnh*):

```http
POST /api/payments
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"bookingId": "GS-1022", "kind": "remainder"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Cần chọn ảnh trước khi thanh toán 70% còn lại."}}
```

Linh lists her payments for GS-1024 (newest first):

```http
GET /api/payments?bookingId=GS-1024
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "pay-2", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "succeeded", "message": "Thanh toán cọc 30% thành công. Lịch chụp đã được giữ.", "createdAt": …, "completedAt": …}, {"id": "pay-1", "bookingId": "GS-1024", "customerId": "u-linh", "kind": "deposit", "amount": 540000, "status": "failed", "message": "Thanh toán không thành công, booking vẫn chờ cọc.", "createdAt": …, "completedAt": …}]
```

## Changes

- 2026-11-21 — First version. No client code calls these endpoints yet.
- 2026-11-22 — Require a saved photo selection (`selections` from `09-gallery.md`) before paying the remaining 70% under the team's reading of G9 (replacing GS-1022's remainder-success example with the `409` refusal before selection), align test gateway route names to `/thanh-toan/:paymentId` and `/thanh-toan/:paymentId/ket-qua` (`FRONTEND.md` section 4), state the browser gateway-result assumption explicitly, and replace mixed-English validation messages (`fields.kind` and `fields.result`) with Vietnamese (PR #5 review & agreed items 5, 7). No client code calls these endpoints yet.
- 2026-11-22 — Adopt the product owners' answers ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)): drop costume stock re-checking, update failed payment messages (`"Thanh toán không thành công, booking vẫn chờ cọc."` / still waiting for 70%), record a second concurrent customer's clashing deposit as `succeeded` (`depositStatus: "paid"`, `409` on retry) while keeping booking status *Chờ cọc 30%* with the conflict reason in `payment.message`, and align GS-1024's `pricing` example to the updated `05-bookings.md` shape. No client code calls these endpoints yet.
- 2026-11-23 — Clarify under Rule 3 (team assumption, follow-up question for product owners) that moving a deposit-paid unheld booking to a free slot via `PATCH /api/bookings/:id` (`05-bookings.md`) promotes it to *Đã đặt lịch*, adds `busy` blocks, and unlocks the 70% remainder payment (PR #6 review follow-up). No client code calls `remainder` recovery yet (`G7`/`G9`/`G10`).
- 2026-11-28 — Require the booking's `shoot` job (`08-jobs.md`) to have status *Hoàn thành* on both `POST /api/payments` (`kind: "remainder"`) and `POST /api/payments/:id/result` (`result: "success"` for `remainder`), returning `409 CONFLICT` (`"Buổi chụp chưa hoàn thành, chưa thể thanh toán 70% còn lại."`) otherwise per the product owners' 2026-11-27 decision; add a `409` example on `GS-1024`.
