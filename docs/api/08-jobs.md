# Staff jobs and preview uploads

What assigned staff see and update (step G8): their assigned jobs (`when`, `where`, `what`), updating a job's status, uploading preview photos to the booking (`multipart/form-data`), and serving each preview image file through `GET /api/previews/:id` so JSON stays lightweight without embedding large base64 data URLs. Because `GET /api/previews/:id` requires `Authorization: Bearer <token>`, a bare `<img src="/api/previews/...">` does not carry the header and receives `401`; the client fetches each preview image with the token and renders it in `<img>` using an object URL. Reading the list and selecting previews is in `09-gallery.md`.

Jobs exist for bookings in *Đã đặt lịch* (created from the booking's make-up, shoot, or editing assignments once the 30% deposit succeeds; e.g. `Mai` and `Tuấn` on `GS-1024`, `Hoàng Gia Huy` on `GS-1022`).

**Product owner decision, assumption, and sample data.** Per the product owners' decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)), job statuses are *Chưa bắt đầu*, *Đang làm*, and *Hoàn thành*, and changing a job's status never alters the booking's status. Preview upload rules (accepting `image/jpeg`, `image/png`, and `image/webp` up to `5 MB` per file) stay a team assumption.

## Statuses

| Status | Meaning |
|---|---|
| `Chưa bắt đầu` | Assigned job has not started yet |
| `Đang làm` | Staff member is performing the work |
| `Hoàn thành` | Assigned job is finished |

## Objects

**Job**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `job-…`, e.g. `job-gs-1024-shoot` |
| `bookingId` | string | e.g. `GS-1024` |
| `staffId`, `staffName` | string | Assigned staff member (`u-mai`, `u-tuan`, `u-staff3`) |
| `role` | string | `makeup`, `shoot`, or `edit` |
| `title` | string | Vietnamese summary of what the job is |
| `customerName` | string | Customer's name |
| `serviceName`, `packageName` | string | Service and package |
| `date` | string | `YYYY-MM-DD` |
| `from`, `to` | string | `HH:MM` |
| `roomName` | string or `null` | `Phòng B` for shoots, `null` for make-up or editing |
| `people` | integer | Confirmed head count |
| `extras` | list | Booking extras (`{ "extraId", "name", "modelId", "modelName", "size", "quantity" }`) |
| `status` | string | One of the three statuses above |

**Preview**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `prv-…` |
| `bookingId` | string | e.g. `GS-1024` |
| `filename` | string | Uploaded file name |
| `mimeType` | string | `image/jpeg`, `image/png`, or `image/webp` |
| `size` | integer | File size in bytes |
| `url` | string | Path to fetch the image bytes with the Bearer token via `GET /api/previews/:id` (e.g. `"/api/previews/prv-1"`) |
| `uploadedBy` | object | `{ "id", "name" }` |
| `uploadedAt` | string | ISO 8601 with offset |

## GET /api/jobs

Who: `staff` (only jobs assigned to the signed-in staff member) or `admin` (all jobs). Ordered by `date` descending, then `from` ascending.

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `status` | string | no | one of the three job statuses |
| `bookingId` | string | no | filter by booking id |

Success: `200` with a list of job objects. In `empty` mode, returns `[]`.

Errors: `400` (`status`: `"Trạng thái công việc không hợp lệ."`), `401` without a token, `403` for customer or Superadmin.

Mai reads her assigned jobs (`GS-1024` make-up and `GS-1023` make-up):

```http
GET /api/jobs
Authorization: Bearer {{token:mai}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "job-gs-1024-makeup", "bookingId": "GS-1024", "staffId": "u-mai", "staffName": "Mai", "role": "makeup", "title": "Makeup · Gói Tốt nghiệp Premium", "customerName": "Nguyễn Thùy Linh", "serviceName": "Tốt nghiệp", "packageName": "Gói Tốt nghiệp Premium", "date": "2026-10-24", "from": "13:00", "to": "14:00", "roomName": …, "people": 1, "extras": …, "status": "Chưa bắt đầu"}, …]
```

Tuấn reads his assigned jobs (`GS-1024` shoot and `GS-1022` shoot):

```http
GET /api/jobs
Authorization: Bearer {{token:tuan}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "job-gs-1024-shoot", "bookingId": "GS-1024", "staffId": "u-tuan", "staffName": "Tuấn", "role": "shoot", "title": "Chụp · Gói Tốt nghiệp Premium", "customerName": "Nguyễn Thùy Linh", "serviceName": "Tốt nghiệp", "packageName": "Gói Tốt nghiệp Premium", "date": "2026-10-24", "from": "14:00", "to": "16:00", "roomName": "Phòng B", "people": 1, "extras": …, "status": "Chưa bắt đầu"}, …]
```

`staff3` (Hoàng Gia Huy) sees his editing job on GS-1022, not GS-1024:

```http
GET /api/jobs
Authorization: Bearer {{token:staff3}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "job-gs-1022-edit", "bookingId": "GS-1022", "staffId": "u-staff3", "staffName": "Hoàng Gia Huy", "role": "edit", "title": "Chỉnh ảnh · Gói Tốt nghiệp Premium", "customerName": "Trần Minh Anh", "serviceName": "Tốt nghiệp", "packageName": "Gói Tốt nghiệp Premium", "date": "2026-10-18", "from": "16:00", "to": "18:00", "roomName": null, "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "status": "Đang làm"}]
```

A customer cannot read staff jobs:

```http
GET /api/jobs
Authorization: Bearer {{token:linh}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

No token:

```http
GET /api/jobs
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## PATCH /api/jobs/:id

Who: the assigned `staff` member (or `admin`). Updates the job's status without changing the booking's status. Another staff member not assigned to this job answers `403`.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `status` | string | yes | `Chưa bắt đầu`, `Đang làm`, or `Hoàn thành` |

Success: `200` with the updated job object.

Errors: `400` (`status`: `"Trạng thái công việc không hợp lệ."`), `401`, `403` (wrong role or unassigned staff), `404` (unknown job id).

Tuấn updates his GS-1024 shoot job to *Đang làm*:

```http
PATCH /api/jobs/job-gs-1024-shoot
Authorization: Bearer {{token:tuan}}
Content-Type: application/json

{"status": "Đang làm"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "job-gs-1024-shoot", "bookingId": "GS-1024", "staffId": "u-tuan", "staffName": "Tuấn", "role": "shoot", "title": "Chụp · Gói Tốt nghiệp Premium", "customerName": "Nguyễn Thùy Linh", "serviceName": "Tốt nghiệp", "packageName": "Gói Tốt nghiệp Premium", "date": "2026-10-24", "from": "14:00", "to": "16:00", "roomName": "Phòng B", "people": 1, "extras": [{"extraId": "makeup", "name": "Makeup", "modelId": null, "modelName": null, "size": null, "quantity": 1}], "status": "Đang làm"}
```

`staff3` (not assigned to GS-1024) cannot update Tuấn's job:

```http
PATCH /api/jobs/job-gs-1024-shoot
Authorization: Bearer {{token:staff3}}
Content-Type: application/json

{"status": "Hoàn thành"}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Invalid job status:

```http
PATCH /api/jobs/job-gs-1024-shoot
Authorization: Bearer {{token:tuan}}
Content-Type: application/json

{"status": "Xong"}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"status": "Trạng thái công việc không hợp lệ."}}}
```

## POST /api/bookings/:id/previews

Who: a `staff` member assigned to this booking (or `admin`). Uploads one preview photo for a booking in *Đã đặt lịch* using `multipart/form-data` with field name `file`.

Request (`multipart/form-data`):

| Field | Type | Required | Limits |
|---|---|---|---|
| `file` | binary file | yes | `image/jpeg`, `image/png`, or `image/webp`; size `> 0` and at most `5 MB` (`5242880` bytes) |

Success: `201` with the created preview object.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | missing `file`, empty file, or unsupported MIME type | `file`: "Chọn ảnh xem trước." or "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP." |
| `401` | `UNAUTHENTICATED` | no token | — |
| `403` | `FORBIDDEN` | not `staff`/`admin`, or staff member not assigned to this booking | — |
| `404` | `NOT_FOUND` | unknown booking | — |
| `409` | `CONFLICT` | booking is *Chờ cọc 30%* or *Đã hủy* | — |
| `413` | `PAYLOAD_TOO_LARGE` | file over `5 MB` | — |

Tuấn uploads a preview photo to GS-1024:

```sh
curl -X POST /api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:gs-1024-1.png:100KB}};type=image/png"
```

```http
HTTP/1.1 201 Created
Content-Type: application/json

{"id": "prv-1", "bookingId": "GS-1024", "filename": "gs-1024-1.png", "mimeType": "image/png", "size": 102400, "url": "/api/previews/prv-1", "uploadedBy": {"id": "u-tuan", "name": "Tuấn"}, "uploadedAt": …}
```

`staff3` (not assigned to GS-1024) cannot upload a preview to GS-1024:

```sh
curl -X POST /api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:staff3}}" \
  -F "file=@{{file:gs-1024-2.png:100KB}};type=image/png"
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

Wrong file type (`text/plain`):

```sh
curl -X POST /api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:notes.txt:1KB}};type=text/plain"
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"file": "Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP."}}}
```

File over the 5 MB limit (`6 MB` -> `413`):

```sh
curl -X POST /api/bookings/GS-1024/previews \
  -H "Authorization: Bearer {{token:tuan}}" \
  -F "file=@{{file:huge.png:6MB}};type=image/png"
```

```http
HTTP/1.1 413 Payload Too Large
Content-Type: application/json

{"error": {"code": "PAYLOAD_TOO_LARGE", "message": "Ảnh xem trước tối đa 5 MB."}}
```

## GET /api/previews/:id

Who: the booking's `customer`, a `staff` member assigned to this booking, or `admin`. Returns the image file bytes directly so JSON responses do not embed up to 5 MB base64 data URLs. Because this endpoint requires `Authorization: Bearer <token>`, a bare `<img src>` omits the header and gets `401`; the client fetches the bytes with the token and renders an object URL in `<img>`. Seed previews serve existing sample photos from `client/public/photos/`.

Success: `200` with the binary image body and `Content-Type` matching the preview's `mimeType` (`image/jpeg`, `image/png`, or `image/webp`). Because `contract-check` parses JSON responses only, the `200` binary response is verified in `test/mock.test.mjs`, while the JSON error responses are tested below.

Errors: `401` without a token; `403` for unassigned staff or Superadmin; `404` for an unknown preview id or another customer's booking preview.

No token (`401`):

```http
GET /api/previews/prv-1
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

Unknown preview id (`404`):

```http
GET /api/previews/prv-999
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

Another customer cannot read GS-1024's preview (`customer2` vs `linh`, `404`):

```http
GET /api/previews/prv-1
Authorization: Bearer {{token:customer2}}
```

```http
HTTP/1.1 404 Not Found
Content-Type: application/json

{"error": {"code": "NOT_FOUND", "message": "Không tìm thấy."}}
```

Unassigned staff cannot read GS-1024's preview (`staff3`, `403`):

```http
GET /api/previews/prv-1
Authorization: Bearer {{token:staff3}}
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json

{"error": {"code": "FORBIDDEN", "message": "Bạn không có quyền làm việc này."}}
```

## Changes

- 2026-11-21 — First version. No client code calls these endpoints yet.
- 2026-11-22 — Replace base64 preview `url` values with `GET /api/previews/:id` serving the binary image file directly (JSON `401`/`403`/`404` examples here, `200` binary verified in `test/mock.test.mjs`; seed previews may use sample photos in `client/public/photos/`). No client code calls these endpoints yet.
- 2026-11-22 — Rename job status *Đang thực hiện* to *Đang làm* and state that job status never alters booking status per the product owners' decision ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)); fix the preview-loading explanation (`GET /api/previews/:id` requires a Bearer token, so browsers fetch it with the header into an object URL for `<img>` instead of `<img src>`). Client: `PreviewImage` (`client/src/components/PreviewImage.jsx`, step G9) already fetches previews with the token.
