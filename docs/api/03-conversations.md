# Conversations

A customer asks the studio, by chat or with a booking request (step G3); the Admin sees every conversation with its status, opens one and replies (G4), proposes a time after the clash check (G5), and the customer agrees or declines it in the chat (G6, customer side). Creating the booking from an agreed conversation is in `05-bookings.md`.

## Statuses

The brief's names, exactly:

| Status | When |
|---|---|
| `Chưa trả lời` | The customer has written and the studio has not answered yet |
| `Đang tư vấn` | The studio has answered or proposed a time, and no time is agreed |
| `Đã chốt lịch` | The customer agreed to the latest proposed time |
| `Hoàn thành` | The booking made from it is *Hoàn thành* (`09-gallery.md`) |

Moves: a new conversation starts as *Chưa trả lời*; a studio message or proposal on it makes it *Đang tư vấn*; the customer agreeing makes it *Đã chốt lịch*; the customer declining brings it back to *Đang tư vấn*, so the studio can propose another time. The last move is the team's assumption until the product owners answer (`FRONTEND.md`, section 5).

## Objects

**Conversation in a list**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `c-…` |
| `customer` | object | `id`, `name` |
| `status` | string | One of the four statuses |
| `lastMessage` | object | `from` (`customer` or `studio`), `text`, `at` |
| `updatedAt` | string | The moment of the last message, ISO 8601 with offset |
| `bookingId` | string or `null` | The booking made from it, once there is one |

**Conversation** (one, with its messages): the fields above plus `messages`, a list of messages, oldest first.

**Message**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `m-…` |
| `from` | string | `customer` or `studio` |
| `authorName` | string | The customer's name, or the Admin's for the studio |
| `kind` | string | `text`, `request` (a booking request), `proposal` (a proposed time), `answer` (the customer's answer to a proposal) |
| `text` | string | What is shown in the chat |
| `at` | string | ISO 8601 with offset |
| `request` | object or `null` | With `kind` `request`: the booking request (below); otherwise `null` |
| `proposal` | object or `null` | With `kind` `proposal` or `answer`: the proposal (below), with its current status; otherwise `null` |

**Booking request**: `serviceId`, `serviceName`, `packageId` (or `null`), `packageName` (or `null`), `date` (`YYYY-MM-DD`), `time` (`HH:MM`), `people` (integer), `extras` (a list of `{ "extraId", "name", "modelId", "size" }`; `modelId` and `size` are `null` except for a costume).

**Proposal**: `id` (`pr-…`), `date`, `makeup` (`{ "from", "to", "staffId", "staffName" }` or `null`), `shoot` (`{ "from", "to", "staffId", "staffName", "roomId", "roomName" }`), `status` (`open`, `agreed`, `declined`, or `replaced` when a newer proposal is made on the same conversation).

## GET /api/conversations

Who: a customer (their own conversations) or the Admin (all). Newest first, by `updatedAt`.

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `status` | string | no | one of the four statuses |

Success: `200` with a list of conversations.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `status` is not one of the four | `status`: "Trạng thái không hợp lệ." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | staff or Superadmin | — |

The Admin's list:

```http
GET /api/conversations
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "c-anh", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Chưa trả lời", "lastMessage": {"from": "customer", "text": "Studio cho em hỏi giá gói chân dung CV ạ.", "at": "2026-10-20T07:50:00+07:00"}, "updatedAt": "2026-10-20T07:50:00+07:00", "bookingId": null}, {"id": "c-uyen", "customer": {"id": "u-uyen", "name": "Nguyễn Thị Hoàng Phương Uyên"}, "status": "Đang tư vấn", "lastMessage": {"from": "studio", "text": "Dạ studio xem lịch thợ makeup cho cả lớp rồi báo lại bạn nhé.", "at": "2026-10-19T08:20:00+07:00"}, "updatedAt": "2026-10-19T08:20:00+07:00", "bookingId": null}, {"id": "c-bao", "customer": {"id": "u-bao", "name": "Lê Gia Bảo"}, "status": "Hoàn thành", "lastMessage": {"from": "customer", "text": "Em nhận đủ ảnh rồi, cảm ơn studio ạ.", "at": "2026-10-16T10:00:00+07:00"}, "updatedAt": "2026-10-16T10:00:00+07:00", "bookingId": "GS-1021"}, {"id": "c-customer2", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Đã chốt lịch", "lastMessage": {"from": "customer", "text": "Đồng ý lịch đề xuất.", "at": "2026-10-12T15:00:00+07:00"}, "updatedAt": "2026-10-12T15:00:00+07:00", "bookingId": "GS-1022"}]
```

Only those not answered yet:

```http
GET /api/conversations?status=Ch%C6%B0a%20tr%E1%BA%A3%20l%E1%BB%9Di
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "c-anh", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Chưa trả lời", "lastMessage": {"from": "customer", "text": "Studio cho em hỏi giá gói chân dung CV ạ.", "at": "2026-10-20T07:50:00+07:00"}, "updatedAt": "2026-10-20T07:50:00+07:00", "bookingId": null}]
```

A status that does not exist:

```http
GET /api/conversations?status=Xong
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"status": "Trạng thái không hợp lệ."}}}
```

A staff member may not read conversations:

```http
GET /api/conversations
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

No token:

```http
GET /api/conversations
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

A customer sees only their own:

```http
GET /api/conversations
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "c-anh", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Chưa trả lời", "lastMessage": {"from": "customer", "text": "Studio cho em hỏi giá gói chân dung CV ạ.", "at": "2026-10-20T07:50:00+07:00"}, "updatedAt": "2026-10-20T07:50:00+07:00", "bookingId": null}, {"id": "c-customer2", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Đã chốt lịch", "lastMessage": {"from": "customer", "text": "Đồng ý lịch đề xuất.", "at": "2026-10-12T15:00:00+07:00"}, "updatedAt": "2026-10-12T15:00:00+07:00", "bookingId": "GS-1022"}]
```

## POST /api/conversations

Who: a customer. Starts a conversation with a message, a booking request, or both (step G3). The new conversation is *Chưa trả lời*; what was sent is its first message.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `text` | string | when there is no `request` | 1 to 1000 characters |
| `request` | object | when there is no `text` | below |
| `request.serviceId` | string | yes | a service's id |
| `request.packageId` | string | no | a package of that service |
| `request.date` | string | yes | `YYYY-MM-DD`, a real date |
| `request.time` | string | yes | `HH:MM` |
| `request.people` | integer | yes | 1 to 200; for a class yearbook the representative's estimate, confirmed later by the Admin |
| `request.extras` | list | no | each `{ "extraId" }`; for a costume also `modelId` and `size`, from that extra's models |

Success: `201` with the new conversation and its messages.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | nothing to send, or a field outside its limits | `text`: "Nhập tin nhắn hoặc gửi yêu cầu đặt lịch." or "Tin nhắn tối đa 1000 ký tự."; `request.serviceId`: "Không có dịch vụ này."; `request.packageId`: "Gói không thuộc dịch vụ này."; `request.date`: "Ngày theo dạng YYYY-MM-DD."; `request.time`: "Giờ theo dạng HH:MM."; `request.people`: "Số người từ 1 đến 200."; `request.extras`: "Dịch vụ thêm không hợp lệ." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not a customer | — |

Linh asks about 24/10 at 09:00, with make-up:

```http
POST /api/conversations
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"text": "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?", "request": {"serviceId": "tot-nghiep", "packageId": "tot-nghiep-premium", "date": "2026-10-24", "time": "09:00", "people": 1, "extras": [{"extraId": "makeup"}]}}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Chưa trả lời", "lastMessage": {"from": "customer", "text": "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?", "at": "2026-10-20T09:40:00+07:00"}, "updatedAt": "2026-10-20T09:40:00+07:00", "bookingId": null, "messages": [{"id": "m-1", "from": "customer", "authorName": "Nguyễn Thùy Linh", "kind": "request", "text": "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?", "at": "2026-10-20T09:40:00+07:00", "request": {"serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "date": "2026-10-24", "time": "09:00", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "size": null}]}, "proposal": null}]}
```

Nothing to send:

```http
POST /api/conversations
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"text": "Nhập tin nhắn hoặc gửi yêu cầu đặt lịch."}}}
```

A request with every field wrong:

```http
POST /api/conversations
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"request": {"serviceId": "dam-cuoi", "date": "24/10/2026", "time": "9h", "people": 0}}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"request.serviceId": "Không có dịch vụ này.", "request.date": "Ngày theo dạng YYYY-MM-DD.", "request.time": "Giờ theo dạng HH:MM.", "request.people": "Số người từ 1 đến 200."}}}
```

## GET /api/conversations/:id

Who: the conversation's customer, or the Admin. Another customer's conversation answers `404`, as if it did not exist.

Success: `200` with the conversation and its messages.

Errors: `401` without a token; `403` for staff or Superadmin; `404` for an unknown id or another customer's conversation.

```http
GET /api/conversations/c-linh
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Chưa trả lời", "lastMessage": {"from": "customer", "text": "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?", "at": "2026-10-20T09:40:00+07:00"}, "updatedAt": "2026-10-20T09:40:00+07:00", "bookingId": null, "messages": [{"id": "m-1", "from": "customer", "authorName": "Nguyễn Thùy Linh", "kind": "request", "text": "Gói tốt nghiệp có makeup còn lịch 24/10 lúc 09:00 không?", "at": "2026-10-20T09:40:00+07:00", "request": {"serviceId": "tot-nghiep", "serviceName": "Tốt nghiệp", "packageId": "tot-nghiep-premium", "packageName": "Gói Tốt nghiệp Premium", "date": "2026-10-24", "time": "09:00", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "size": null}]}, "proposal": null}]}
```

Another customer's conversation:

```http
GET /api/conversations/c-anh
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

## POST /api/conversations/:id/messages

Who: the conversation's customer, or the Admin. A studio message on a *Chưa trả lời* conversation makes it *Đang tư vấn*.

Body: `text`, string, required, 1 to 1000 characters.

Success: `201` with the whole conversation, the new message last.

Errors: `400` (`text`: "Nhập tin nhắn." or "Tin nhắn tối đa 1000 ký tự."); `401`; `403` for staff or Superadmin; `404` for an unknown id or another customer's conversation.

Thảo answers Linh:

```http
POST /api/conversations/c-linh/messages
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"text": "Dạ để studio kiểm tra lịch thợ makeup, thợ chụp và phòng rồi báo lại ạ."}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Đang tư vấn", "lastMessage": {"from": "studio", "text": "Dạ để studio kiểm tra lịch thợ makeup, thợ chụp và phòng rồi báo lại ạ.", "at": "2026-10-20T09:41:00+07:00"}, "updatedAt": "2026-10-20T09:41:00+07:00", "bookingId": null, "messages": […]}
```

An empty message:

```http
POST /api/conversations/c-linh/messages
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"text": ""}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"text": "Nhập tin nhắn."}}}
```

## POST /api/conversations/:id/proposals

Who: the Admin. Proposes a time in the chat (step G5). The API checks the people and the room at that time against bookings that hold a slot (*Đã đặt lịch*; a booking in *Chờ cọc 30%* does not, brief section 3). A clash is refused with `409`, saying who is busy and when, and which time is free instead. An accepted proposal becomes a message of kind `proposal`; an earlier open proposal on the same conversation becomes `replaced`; a *Chưa trả lời* conversation becomes *Đang tư vấn*.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `date` | string | yes | `YYYY-MM-DD` |
| `makeup` | object or `null` | no | `from`, `to` (`HH:MM`, `to` after `from`), `staffId` (a staff member) |
| `shoot` | object | yes | `from`, `to` (`HH:MM`, `to` after `from`), `staffId` (a staff member), `roomId` (a room) |

Success: `201` with the whole conversation, the proposal last.

Errors:

| Status | `code` | When | `fields` or `details` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | a field missing or outside its limits | `fields`, keyed `date`, `makeup.from`, `shoot.staffId`, …: "Ngày theo dạng YYYY-MM-DD.", "Giờ theo dạng HH:MM.", "Giờ kết thúc phải sau giờ bắt đầu.", "Không có nhân viên này.", "Không có phòng này." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not the Admin | — |
| `404` | `NOT_FOUND` | unknown conversation | — |
| `409` | `CONFLICT` | a person or the room is busy then | `details.conflicts`: a list of `{ "who", "kind" (`staff` or `room`), "date", "from", "to" }`; `details.freeTime`: `{ "makeup": { "from", "to" }, "shoot": { "from", "to" } }`, or `null` when the API has none to offer |

09:00, the time Linh asked for, clashes: Mai is busy 08:00–12:00:

```http
POST /api/conversations/c-linh/proposals
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "08:00", "to": "09:00", "staffId": "u-mai"}, "shoot": {"from": "09:00", "to": "11:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Mai (makeup) bận 08:00–12:00 ngày 24/10/2026. Giờ trống: makeup 13:00–14:00, chụp 14:00–16:00.", "details": {"conflicts": [{"who": "Mai", "kind": "staff", "date": "2026-10-24", "from": "08:00", "to": "12:00"}], "freeTime": {"makeup": {"from": "13:00", "to": "14:00"}, "shoot": {"from": "14:00", "to": "16:00"}}}}}
```

The free time, proposed:

```http
POST /api/conversations/c-linh/proposals
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": {"from": "13:00", "to": "14:00", "staffId": "u-mai"}, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Đang tư vấn", "lastMessage": {"from": "studio", "text": "Studio đề xuất ngày 24/10/2026: makeup 13:00–14:00 với Mai, chụp 14:00–16:00 với Tuấn tại Phòng B.", "at": "2026-10-20T09:42:00+07:00"}, "updatedAt": "2026-10-20T09:42:00+07:00", "bookingId": null, "messages": […]}
```

Only the Admin proposes:

```http
POST /api/conversations/c-linh/proposals
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"date": "2026-10-24", "makeup": null, "shoot": {"from": "14:00", "to": "16:00", "staffId": "u-tuan", "roomId": "r-b"}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

A proposal for Anh's portrait, without make-up (answered below):

```http
POST /api/conversations/c-anh/proposals
Authorization: Bearer {{token:thao}}
Content-Type: application/json

{"date": "2026-10-27", "makeup": null, "shoot": {"from": "09:00", "to": "10:00", "staffId": "u-staff3", "roomId": "r-b"}}
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "c-anh", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Đang tư vấn", "lastMessage": {"from": "studio", "text": "Studio đề xuất ngày 27/10/2026: chụp 09:00–10:00 với Hoàng Gia Huy tại Phòng B.", "at": "2026-10-20T09:43:00+07:00"}, "updatedAt": "2026-10-20T09:43:00+07:00", "bookingId": null, "messages": […]}
```

## POST /api/conversations/:id/proposals/:proposalId/answer

Who: the conversation's customer (step G6, customer side). Answers the open proposal: `agree` makes the conversation *Đã chốt lịch* (the Admin may then create the booking, `05-bookings.md`); `decline` brings it back to *Đang tư vấn*. The answer becomes a message of kind `answer`.

Body: `answer`, string, required: `agree` or `decline`.

Success: `200` with the whole conversation.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `answer` is not `agree` or `decline` | `answer`: "Chọn agree hoặc decline." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not a customer | — |
| `404` | `NOT_FOUND` | unknown conversation or proposal, or another customer's conversation | — |
| `409` | `CONFLICT` | the proposal is no longer open (already answered, or replaced) | — |

Anh declines; the conversation goes back to *Đang tư vấn*:

```http
POST /api/conversations/c-anh/proposals/pr-2/answer
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"answer": "decline"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "c-anh", "customer": {"id": "u-customer2", "name": "Trần Minh Anh"}, "status": "Đang tư vấn", "lastMessage": {"from": "customer", "text": "Chưa đồng ý lịch đề xuất.", "at": "2026-10-20T09:44:00+07:00"}, "updatedAt": "2026-10-20T09:44:00+07:00", "bookingId": null, "messages": […]}
```

Another customer may not answer Linh's proposal:

```http
POST /api/conversations/c-linh/proposals/pr-1/answer
Authorization: Bearer {{token:customer2}}
Content-Type: application/json

{"answer": "agree"}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

An answer that is neither:

```http
POST /api/conversations/c-linh/proposals/pr-1/answer
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"answer": "maybe"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"answer": "Chọn agree hoặc decline."}}}
```

Linh agrees; the conversation is *Đã chốt lịch*:

```http
POST /api/conversations/c-linh/proposals/pr-1/answer
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"answer": "agree"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "c-linh", "customer": {"id": "u-linh", "name": "Nguyễn Thùy Linh"}, "status": "Đã chốt lịch", "lastMessage": {"from": "customer", "text": "Đồng ý lịch đề xuất.", "at": "2026-10-20T09:45:00+07:00"}, "updatedAt": "2026-10-20T09:45:00+07:00", "bookingId": null, "messages": […]}
```

The same proposal answered twice:

```http
POST /api/conversations/c-linh/proposals/pr-1/answer
Authorization: Bearer {{token:linh}}
Content-Type: application/json

{"answer": "agree"}
```

```http
HTTP/1.1 409 Conflict
Content-Type: application/json

{"error": {"code": "CONFLICT", "message": "Đề xuất này đã được trả lời."}}
```

## Changes

- 2026-11-20 — First version. No client code calls these endpoints yet.
