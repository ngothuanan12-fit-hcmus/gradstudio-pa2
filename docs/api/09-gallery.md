# Gallery

What the customer does after the shoot (step G9): look at the preview photos, choose the ones to be edited, pay the remaining 70% (`06-payments.md`), and press *Nhận ảnh* once the studio has added the final file link (`05-bookings.md`, step G10). The staff upload the previews (`08-jobs.md`); the preview object and `GET /api/previews/:id`, which answers the image itself, are described there.

**Rules.**
1. The customer chooses from 1 to the package's `editedPhotos` (30 for Gói Tốt nghiệp Premium), on a booking in *Đã đặt lịch*. The choice may be changed until the remaining 70% is paid; after that it is locked and a change is refused with `409` (product owners, [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)).
2. The remaining 70% can be paid only once the booking's `shoot` job (`08-jobs.md`) has status *Hoàn thành* (`shootDone: true`) and a photo selection is saved (`06-payments.md` checks the saved choice): per the product owners' decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28852226657809465&reply_comment_id=28852825087749622)), "after the shoot" is determined by the shoot job's status, not the clock. Until `shootDone` is `true` and a choice is saved, screen G9 disables *Thanh toán 70%* with a visible reason; choosing and saving preview photos remains allowed before the shoot job finishes.
3. *Nhận ảnh* needs the booking in *Đã đặt lịch*, the remaining 70% paid and the file link added. It moves the booking to *Hoàn thành*, and the conversation the booking came from to *Hoàn thành* too (product owners, [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)).

**Sample data.** The previews of GS-1020 (40) and GS-1022 (5) reuse the licensed sample photos of the home page (`client/public/photos/`): their count and files are *sample*, not photos of these shoots.

## Objects

**Gallery** (one booking)

| Field | Type | Notes |
|---|---|---|
| `bookingId` | string | e.g. `GS-1022` |
| `limit` | integer or `null` | The package's `editedPhotos`: how many photos may be chosen; `null` only if a package ever gave no number (every package in `02-catalogue.md` has one since 2026-11-27), and then no choice can be saved |
| `locked` | boolean | `true` once the remaining 70% is paid: the choice can no longer change |
| `shootDone` | boolean | `true` when the booking's `shoot` job (`08-jobs.md`) has status *Hoàn thành*; `false` otherwise (including when the booking has no `shoot` job yet) |
| `selected` | list of strings | The chosen previews' ids, in the order sent; empty before a choice |
| `savedAt` | string or `null` | When the choice was last saved, ISO 8601 with offset |
| `previews` | list | Preview objects (`08-jobs.md`), oldest first |

## GET /api/bookings/:id/previews

Who: the booking's customer, a staff member assigned to it, or the Admin. Another customer's booking answers `404`.

Success: `200` with the gallery.

Errors: `401` without a token; `403` for a staff member not assigned to the booking, or the Superadmin; `404` for an unknown booking or another customer's.

Minh Anh opens the 40 previews of GS-1020, nothing chosen yet:

```http
GET /api/bookings/GS-1020/previews
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"bookingId": "GS-1020", "limit": 30, "locked": false, "shootDone": true, "selected": [], "savedAt": null, "previews": [{"id": "prv-gs-1020-1", "bookingId": "GS-1020", "filename": "tot-nghiep-480.webp", "mimeType": "image/webp", "size": 19768, "url": "/api/previews/prv-gs-1020-1", "uploadedBy": {"id": "u-tuan", "name": "Tuấn"}, "uploadedAt": "2026-10-18T10:00:00+07:00"}, …]}
```

Linh opens the preview uploaded for GS-1024 while Tuấn's `shoot` job (`job-gs-1024-shoot`, `08-jobs.md`) is still *Đang làm* (`shootDone` is `false`, so G9 allows choosing photos but cannot pay 70% yet):

```http
GET /api/bookings/GS-1024/previews
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"bookingId": "GS-1024", "limit": 30, "locked": false, "shootDone": false, "selected": [], "savedAt": null, "previews": [{"id": "prv-1", "bookingId": "GS-1024", "filename": "gs-1024-1.png", "mimeType": "image/png", "size": 102400, "url": "/api/previews/prv-1", "uploadedBy": {"id": "u-tuan", "name": "Tuấn"}, "uploadedAt": …}]}
```

`staff3` is not assigned to GS-1020:

```http
GET /api/bookings/GS-1020/previews
Authorization: Bearer {{token:staff3}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Linh cannot open Minh Anh's booking:

```http
GET /api/bookings/GS-1022/previews
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

No token:

```http
GET /api/bookings/GS-1022/previews
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## PUT /api/bookings/:id/selection

Who: the booking's customer. Replaces the choice with the previews sent.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `previewIds` | list of strings | yes | 1 to the gallery's `limit` ids, each a preview of this booking, none twice |

Success: `200` with the gallery.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | too few or too many photos, a photo of another booking, or one photo twice | `previewIds`: "Chọn từ 1 đến 30 ảnh." (with the booking's `limit`), "Có ảnh không thuộc booking này." or "Mỗi ảnh chỉ chọn một lần." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not a customer | — |
| `404` | `NOT_FOUND` | unknown booking, or another customer's | — |
| `409` | `CONFLICT` | the booking is not in *Đã đặt lịch* ("Chỉ chọn ảnh khi booking đã đặt lịch."), the remaining 70% is paid ("Đã thanh toán 70%, ảnh đã chọn không đổi được nữa."), or the package gives no number of photos yet ("Gói này chưa có số ảnh chỉnh, studio sẽ báo lại.") | — |

31 photos on a package of 30:

```http
PUT /api/bookings/GS-1020/selection
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"previewIds": ["prv-gs-1020-1", "prv-gs-1020-2", "prv-gs-1020-3", "prv-gs-1020-4", "prv-gs-1020-5", "prv-gs-1020-6", "prv-gs-1020-7", "prv-gs-1020-8", "prv-gs-1020-9", "prv-gs-1020-10", "prv-gs-1020-11", "prv-gs-1020-12", "prv-gs-1020-13", "prv-gs-1020-14", "prv-gs-1020-15", "prv-gs-1020-16", "prv-gs-1020-17", "prv-gs-1020-18", "prv-gs-1020-19", "prv-gs-1020-20", "prv-gs-1020-21", "prv-gs-1020-22", "prv-gs-1020-23", "prv-gs-1020-24", "prv-gs-1020-25", "prv-gs-1020-26", "prv-gs-1020-27", "prv-gs-1020-28", "prv-gs-1020-29", "prv-gs-1020-30", "prv-gs-1020-31"]}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"previewIds": "Chọn từ 1 đến 30 ảnh."}}}
```

30 photos are accepted:

```http
PUT /api/bookings/GS-1020/selection
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"previewIds": ["prv-gs-1020-1", "prv-gs-1020-2", "prv-gs-1020-3", "prv-gs-1020-4", "prv-gs-1020-5", "prv-gs-1020-6", "prv-gs-1020-7", "prv-gs-1020-8", "prv-gs-1020-9", "prv-gs-1020-10", "prv-gs-1020-11", "prv-gs-1020-12", "prv-gs-1020-13", "prv-gs-1020-14", "prv-gs-1020-15", "prv-gs-1020-16", "prv-gs-1020-17", "prv-gs-1020-18", "prv-gs-1020-19", "prv-gs-1020-20", "prv-gs-1020-21", "prv-gs-1020-22", "prv-gs-1020-23", "prv-gs-1020-24", "prv-gs-1020-25", "prv-gs-1020-26", "prv-gs-1020-27", "prv-gs-1020-28", "prv-gs-1020-29", "prv-gs-1020-30"]}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"bookingId": "GS-1020", "limit": 30, "locked": false, "shootDone": true, "selected": ["prv-gs-1020-1", "prv-gs-1020-2", "prv-gs-1020-3", "prv-gs-1020-4", "prv-gs-1020-5", "prv-gs-1020-6", "prv-gs-1020-7", "prv-gs-1020-8", "prv-gs-1020-9", "prv-gs-1020-10", "prv-gs-1020-11", "prv-gs-1020-12", "prv-gs-1020-13", "prv-gs-1020-14", "prv-gs-1020-15", "prv-gs-1020-16", "prv-gs-1020-17", "prv-gs-1020-18", "prv-gs-1020-19", "prv-gs-1020-20", "prv-gs-1020-21", "prv-gs-1020-22", "prv-gs-1020-23", "prv-gs-1020-24", "prv-gs-1020-25", "prv-gs-1020-26", "prv-gs-1020-27", "prv-gs-1020-28", "prv-gs-1020-29", "prv-gs-1020-30"], "savedAt": …, "previews": […]}
```

A photo of another booking:

```http
PUT /api/bookings/GS-1022/selection
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"previewIds": ["prv-gs-1022-1", "prv-gs-1020-1"]}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"previewIds": "Có ảnh không thuộc booking này."}}}
```

Only the customer chooses:

```http
PUT /api/bookings/GS-1022/selection
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"previewIds": ["prv-gs-1022-1"]}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Minh Anh chooses three photos of GS-1022, then changes her choice before paying:

```http
PUT /api/bookings/GS-1022/selection
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"previewIds": ["prv-gs-1022-1", "prv-gs-1022-2", "prv-gs-1022-3"]}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"bookingId": "GS-1022", "limit": 30, "locked": false, "shootDone": true, "selected": ["prv-gs-1022-1", "prv-gs-1022-2", "prv-gs-1022-3"], "savedAt": …, "previews": [{"id": "prv-gs-1022-1", "bookingId": "GS-1022", "filename": "tot-nghiep-900.webp", "mimeType": "image/webp", "size": 46776, "url": "/api/previews/prv-gs-1022-1", "uploadedBy": {"id": "u-tuan", "name": "Tuấn"}, "uploadedAt": "2026-10-19T10:00:00+07:00"}, …]}
```

```http
PUT /api/bookings/GS-1022/selection
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"previewIds": ["prv-gs-1022-1", "prv-gs-1022-2", "prv-gs-1022-4", "prv-gs-1022-5"]}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"bookingId": "GS-1022", "limit": 30, "locked": false, "shootDone": true, "selected": ["prv-gs-1022-1", "prv-gs-1022-2", "prv-gs-1022-4", "prv-gs-1022-5"], "savedAt": …, "previews": […]}
```

## POST /api/bookings/:id/receive

Who: the booking's customer (*Nhận ảnh*). No body.

Success: `200` with the booking (`05-bookings.md`), now *Hoàn thành*.

Errors: `401` without a token; `403` for any role but customer; `404` for an unknown booking or another customer's; `409` when the remaining 70% is not paid ("Cần thanh toán 70% còn lại trước khi nhận ảnh."), when the studio has not added the file link ("Studio chưa gửi link ảnh."), or when the booking is not in *Đã đặt lịch* ("Booking này không nhận ảnh được nữa.").

*Nhận ảnh* before the remaining 70% is paid:

```http
POST /api/bookings/GS-1022/receive
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Cần thanh toán 70% còn lại trước khi nhận ảnh."}}
```

With a choice saved, Minh Anh pays the remaining 70% (`06-payments.md`), and the choice locks:

```http
POST /api/payments
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"bookingId": "GS-1022", "kind": "remainder"}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "pay-3", "bookingId": "GS-1022", "customerId": "u-customer2", "kind": "remainder", "amount": 1260000, "status": "pending", "message": …, "createdAt": …, "completedAt": null}
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

{"payment": {"id": "pay-3", "bookingId": "GS-1022", "customerId": "u-customer2", "kind": "remainder", "amount": 1260000, "status": "succeeded", "message": …, "createdAt": …, "completedAt": …}, "booking": …}
```

```http
PUT /api/bookings/GS-1022/selection
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"previewIds": ["prv-gs-1022-3"]}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Đã thanh toán 70%, ảnh đã chọn không đổi được nữa."}}
```

```http
GET /api/bookings/GS-1022/previews
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"bookingId": "GS-1022", "limit": 30, "locked": true, "shootDone": true, "selected": ["prv-gs-1022-1", "prv-gs-1022-2", "prv-gs-1022-4", "prv-gs-1022-5"], "savedAt": …, "previews": […]}
```

The file link is there (added in `05-bookings.md`), so *Nhận ảnh* completes the booking:

```http
POST /api/bookings/GS-1022/receive
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "GS-1022", "conversationId": "c-customer2", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "admin": …, "serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "durationMinutes": 120, "editedPhotos": 30, "sessionType": …, "people": 1, "extras": …, "date": "2026-10-18", "makeup": …, "shoot": …, "status": "Hoàn thành", "pricing": …, "payment": {"depositStatus": "paid", "depositPaidAt": …, "remainderStatus": "paid", "remainderPaidAt": …}, "fileLink": "https://drive.gradstudio.test/gs-1022-final"}
```

Its conversation is *Hoàn thành* too:

```http
GET /api/conversations/c-customer2
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "c-customer2", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Hoàn thành", "lastMessage": …, "updatedAt": …, "bookingId": "GS-1022", "messages": […]}
```

Pressing it again:

```http
POST /api/bookings/GS-1022/receive
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Booking này không nhận ảnh được nữa."}}
```

Linh's conversation `c-linh` now has `GS-1024`, and she has no conversation without a booking. A plain message sent without choosing a conversation joins `c-linh`, her newest conversation that is not *Hoàn thành* (`03-conversations.md`, `200`):

```http
POST /api/conversations
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"text": "Chị ơi khi nào em chọn ảnh được ạ?"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Đã chốt lịch", "lastMessage": {"from": "customer", "text": "Chị ơi khi nào em chọn ảnh được ạ?", "at": …}, "updatedAt": …, "bookingId": "GS-1024", "messages": […]}
```

A new booking request opens a new conversation (`201`):

```http
POST /api/conversations
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"request": {"serviceId": "chan-dung", "packageId": "chan-dung-cv", "date": "2026-11-07", "time": "09:00", "people": 1}}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "c-linh-2", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Chưa trả lời", "lastMessage": {"from": "customer", "text": "Yêu cầu đặt lịch: Chân dung/CV, 07/11/2026 lúc 09:00, 1 người.", "at": …}, "updatedAt": …, "bookingId": null, "messages": […]}
```

## Changes

- 2026-11-22 — First version. No client code calls these endpoints yet.
- 2026-11-22 — `limit` may be `null` (a package with no number of edited photos yet), and a choice is then refused with `409`. Found while writing the mock, before it. No client code calls these endpoints yet.
- 2026-11-27 — Added the `POST /api/conversations` example after `GS-1022` / `c-customer2` moves to *Hoàn thành*, verifying that a customer's new message opens a new conversation (`201`) when their latest conversation by newest message is *Hoàn thành*, per the product owners' answers ([answer 5](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28852226657809465&reply_comment_id=28852825087749622), [follow-up answer 2](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28852226657809465&reply_comment_id=28854602184238579)). Client G3 updated after mock.
- 2026-11-27 — Gallery gains boolean `shootDone` (`true` when the booking's `shoot` job in `08-jobs.md` has status *Hoàn thành*, `false` otherwise), so screen G9 disables *Thanh toán 70%* with a visible reason until the shoot job is *Hoàn thành* and a photo choice is saved, per the product owners' decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28852226657809465&reply_comment_id=28852825087749622)). Added `shootDone` to every Gallery response example and added a read-only `GS-1024` (`shootDone: false`) example. Client G9 updated after mock.
- 2026-11-28 — The `limit` row no longer says Kỷ yếu lớp and Chân dung/CV are *waiting*: every package has `editedPhotos` since `02-catalogue.md` changed on 2026-11-27 (PR #8 review). No example changes.
- 2026-11-28 — The `POST /api/conversations` example at the end follows the product owners' rule of [part II, answer 6](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28855460470819417&reply_comment_id=28858450227187108): Minh Anh's message would now join `c-anh`, so the end of the file shows Linh instead, whose only conversation has a booking: plain text joins `c-linh` (`200`) and a booking request opens `c-linh-2` (`201`).
