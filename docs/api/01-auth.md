# Auth

Sign-in with a demo account, and the signed-in user. The client keeps the token from `POST /api/auth/login` and sends it as `Authorization: Bearer <token>` on every later request; signing out only forgets it on the client.

## The user object

| Field | Type | Notes |
|---|---|---|
| `id` | string | `u-<name>`, e.g. `u-linh` |
| `name` | string | Shown on screen |
| `email` | string | The sign-in e-mail |
| `role` | string | `customer`, `admin`, `staff` or `superadmin`. The client sends each role to its own home |

Demo accounts (password `<name>-demo`, e.g. `linh-demo`):

| Name in examples | E-mail | Role | `name` |
|---|---|---|---|
| `linh` | `linh@gradstudio.test` | `customer` | Nguyễn Thùy Linh |
| `customer2` | `customer2@gradstudio.test` | `customer` | Trần Minh Anh |
| `thao` | `thao@gradstudio.test` | `admin` | Thảo |
| `mai` | `mai@gradstudio.test` | `staff` | Mai |
| `tuan` | `tuan@gradstudio.test` | `staff` | Tuấn |
| `staff3` | `staff3@gradstudio.test` | `staff` | Hoàng Gia Huy |
| `superadmin` | `superadmin@gradstudio.test` | `superadmin` | Quản trị hệ thống |

## POST /api/auth/login

Who: anyone; no token needed. Works in every mock mode, `error` included.

Body:

| Field | Type | Required | Limits |
|---|---|---|---|
| `email` | string | yes | an e-mail address, at most 254 characters |
| `password` | string | yes | 1 to 128 characters |

Success: `200` with `token` (string) and `user` (the user object).

Errors:

| Status | `code` | When | `fields` |
|---|---|---|---|
| `400` | `VALIDATION_ERROR` | a field is missing, not a string, or outside its limits | `email`: "Nhập e-mail." or "E-mail chưa đúng định dạng."; `password`: "Nhập mật khẩu." |
| `401` | `UNAUTHENTICATED` | no account with this e-mail and password; the message does not say which one is wrong | — |

A sign-in as Linh:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh@gradstudio.test", "password": "linh-demo"}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"token": "…", "user": {"id": "u-linh", "name": "Nguyễn Thùy Linh", "email": "linh@gradstudio.test", "role": "customer"}}
```

A wrong password:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "linh@gradstudio.test", "password": "sai-mat-khau"}
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "E-mail hoặc mật khẩu không đúng."}}
```

Empty fields:

```http
POST /api/auth/login
Content-Type: application/json

{"email": "", "password": ""}
```

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{"error": {"code": "VALIDATION_ERROR", "message": "Thông tin chưa hợp lệ.", "fields": {"email": "Nhập e-mail.", "password": "Nhập mật khẩu."}}}
```

## GET /api/auth/me

Who: any signed-in user. The client calls it when the app starts with a stored token, to check that the token still works and to read the role.

Success: `200` with the user object.

Errors:

| Status | `code` | When |
|---|---|---|
| `401` | `UNAUTHENTICATED` | no token, or a token the API does not accept; the client forgets the token and shows sign-in |

The signed-in admin:

```http
GET /api/auth/me
Authorization: Bearer {{token:thao}}
```

```http
HTTP/1.1 200 OK
Content-Type: application/json

{"id": "u-thao", "name": "Thảo", "email": "thao@gradstudio.test", "role": "admin"}
```

No token:

```http
GET /api/auth/me
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json

{"error": {"code": "UNAUTHENTICATED", "message": "Bạn cần đăng nhập."}}
```

## Changes

- 2026-11-19 — First version. No client code calls these endpoints yet.
