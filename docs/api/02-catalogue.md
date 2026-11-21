# Catalogue

What a visitor sees before signing in (step G1): the services with their packages and prices, the extras, sample photos and reviews. All four endpoints are open to visitors and only read.

Prices follow the brief: Kỷ yếu lớp from 350.000đ per person, Tốt nghiệp from 1.800.000đ, Chân dung/CV from 690.000đ; Gói Tốt nghiệp Premium is 1.800.000đ for 2 hours and 30 edited photos. Until the product owners answer (`FRONTEND.md`, section 5), the team assumes: each package lists the extras it already includes, which then cost 0đ in a booking; an extra outside the package is added to the total; make-up is priced per person and per artist slot; costumes have models and sizes, and their stock is checked by model, size and date. A value nobody has given yet is `null`.

**Sample data.** The costume models and sizes (Áo cử nhân S–XL, Áo dài trắng S–L) and the reviews (names, ratings, texts, dates) in the examples below are sample data written by the team to fill the story, not facts from the brief; `mock/data/README.md` marks each value's source.

## Objects

**Service**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `ky-yeu`, `tot-nghiep`, `chan-dung` |
| `name` | string | Shown on screen |
| `summary` | string | One line inviting the reader, saying who the service is for |
| `priceFrom` | integer | The lowest package price, in đồng |
| `priceUnit` | string or `null` | `"người"` when the price is per person, otherwise `null` |
| `packages` | list of packages | At least one |

**Package**

| Field | Type | Notes |
|---|---|---|
| `id` | string | e.g. `tot-nghiep-premium` |
| `name` | string | e.g. "Gói Tốt nghiệp Premium" |
| `price` | integer | In đồng |
| `priceUnit` | string or `null` | As in the service |
| `durationMinutes` | integer or `null` | `120` for Premium; `null` where the brief gives none |
| `editedPhotos` | integer or `null` | How many photos the customer may choose to have edited: `30` for Premium |
| `includes` | list of strings | Ids of the extras already in the package (cost 0đ in a booking) |

**Extra**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `makeup`, `trang-phuc` |
| `name` | string | Shown on screen |
| `kind` | string | `makeup` or `costume` |
| `price` | integer or `null` | In đồng, when the extra is not included; `null` while the price waits for the product owners |
| `priceUnit` | string | `"người"` for make-up, `"bộ"` for a costume |
| `note` | string | How it is charged, in Vietnamese |
| `models` | list | For a costume: `{ "id", "name", "sizes" }` with `sizes` a list of strings; empty for make-up. The models in the examples are *sample* |

**Photo**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `p-…` |
| `serviceId` | string | The service the photo shows |
| `src` | string | The large file, a path served by the client: `/photos/<name>-<width>.webp` |
| `srcSmall` | string | The small file, for phones |
| `width`, `height` | integer | Of the large file, so the page keeps its place while the photo loads |
| `smallWidth` | integer | The width of the small file, so the client can offer both files to the browser (`srcset`) |
| `alt` | string | What the photo shows, in Vietnamese |
| `credit` | object | `author`, `source`, `url`, `licence`: every photo is licensed and its source named (brief, *Fix these*) |

**Review**

| Field | Type | Notes |
|---|---|---|
| `id` | string | `rv-…` |
| `customerName` | string | As the customer chose to show it |
| `serviceId` | string | The service reviewed |
| `rating` | integer | 1 to 5 |
| `text` | string | In Vietnamese |
| `date` | string | `YYYY-MM-DD` |

## GET /api/services

Who: anyone. The services, each with its packages, in the order the home page shows them.

Success: `200` with a list of services. In the mock's `empty` mode the list is `[]`.

Errors: none besides `500`.

```http
GET /api/services
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "ky-yeu", "name": "Kỷ yếu lớp", "summary": "Đặt lịch cho cả lớp ngay để lưu lại những khoảnh khắc đáng nhớ cùng nhau.", "priceFrom": 350000, "priceUnit": "người", "packages": [{"id": "ky-yeu-lop", "name": "Gói Kỷ yếu lớp", "price": 350000, "priceUnit": "người", "durationMinutes": null, "editedPhotos": null, "includes": []}]}, {"id": "tot-nghiep", "name": "Tốt nghiệp", "summary": "Chụp ảnh tốt nghiệp cho riêng bạn hoặc nhóm bạn thân, để nhớ mãi ngày ra trường.", "priceFrom": 1800000, "priceUnit": null, "packages": [{"id": "tot-nghiep-premium", "name": "Gói Tốt nghiệp Premium", "price": 1800000, "priceUnit": null, "durationMinutes": 120, "editedPhotos": 30, "includes": ["makeup"]}]}, {"id": "chan-dung", "name": "Chân dung/CV", "summary": "Đặt lịch chụp chân dung chỉn chu cho CV và hồ sơ xin việc của bạn.", "priceFrom": 690000, "priceUnit": null, "packages": [{"id": "chan-dung-cv", "name": "Gói Chân dung/CV", "price": 690000, "priceUnit": null, "durationMinutes": null, "editedPhotos": null, "includes": []}]}]
```

## GET /api/extras

Who: anyone. The extras a customer may add to a booking request (step G3).

Success: `200` with a list of extras.

Errors: none besides `500`.

```http
GET /api/extras
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "makeup", "name": "Makeup", "kind": "makeup", "price": null, "priceUnit": "người", "note": "Tính theo người và theo suất của thợ makeup. Đã gồm trong Gói Tốt nghiệp Premium.", "models": []}, {"id": "trang-phuc", "name": "Thuê trang phục", "kind": "costume", "price": null, "priceUnit": "bộ", "note": "Chọn mẫu và size; studio kiểm tra còn trang phục vào ngày chụp.", "models": [{"id": "ao-cu-nhan", "name": "Áo cử nhân", "sizes": ["S", "M", "L", "XL"]}, {"id": "ao-dai-trang", "name": "Áo dài trắng", "sizes": ["S", "M", "L"]}]}]
```

## GET /api/photos

Who: anyone. Sample photos, all or those of one service.

Query:

| Parameter | Type | Required | Limits |
|---|---|---|---|
| `serviceId` | string | no | one of the services' ids |

Success: `200` with a list of photos.

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | `serviceId` is not a service | `serviceId`: "Không có dịch vụ này." |

All photos:

```http
GET /api/photos
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "p-ky-yeu", "serviceId": "ky-yeu", "src": "/photos/ky-yeu-1350.webp", "srcSmall": "/photos/ky-yeu-640.webp", "smallWidth": 640, "width": 1350, "height": 900, "alt": "Cả lớp áo trắng giơ máy bay giấy trước bàn trong phòng học treo bóng bay", "credit": {"author": "Nguyễn Tiến Thịnh", "source": "Pexels", "url": "https://www.pexels.com/photo/36985960/", "licence": "Pexels License"}}, …]
```

The photos of one service:

```http
GET /api/photos?serviceId=tot-nghiep
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "p-tot-nghiep", "serviceId": "tot-nghiep", "src": "/photos/tot-nghiep-900.webp", "srcSmall": "/photos/tot-nghiep-480.webp", "smallWidth": 480, "width": 900, "height": 1350, "alt": "Nữ sinh mặc áo cử nhân ôm bó hoa trước bậc thềm sân trường", "credit": {"author": "Hưng Nguyễn", "source": "Unsplash", "url": "https://unsplash.com/photos/ILJfgW9YbcI", "licence": "Unsplash License"}}]
```

A service that does not exist:

```http
GET /api/photos?serviceId=dam-cuoi
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"serviceId": "Không có dịch vụ này."}}}
```

## GET /api/reviews

Who: anyone. Reviews by earlier customers, newest first. The reviews in the example and in the mock are *sample* data.

Success: `200` with a list of reviews.

Errors: none besides `500`.

```http
GET /api/reviews
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

[{"id": "rv-1", "customerName": "Lê Gia Bảo", "serviceId": "tot-nghiep", "rating": 5, "text": "Ảnh chỉnh kỹ, nhận file đúng hẹn. Studio báo lịch rõ ràng từ đầu.", "date": "2026-10-16"}, …]
```

## Changes

- 2026-11-20 — First version. No client code calls these endpoints yet.
- 2026-11-20 — Sample values marked as such (costume models and sizes, reviews); the one-line summaries rewritten as invitations. No client code calls these endpoints yet.
- 2026-11-21 — Photos gain `smallWidth`, the width of the small file, so the client can give the browser both files in `srcset`. No client code calls these endpoints yet.
