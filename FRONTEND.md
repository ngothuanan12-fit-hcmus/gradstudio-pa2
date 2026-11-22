# FRONTEND — GradStudio (PA#3)

The React front end of GradStudio, in `client/`, on the contract in `docs/api/` and the mock in `mock/server.mjs`. Sections follow the PA#3 rubric. Rows are added as each step is built; *Not done* lists what does not work yet.

## 1. Team

- Ngô Thuận An, 23120206
- Nguyễn Hữu Khánh, 24120340

## 2. How to run it

Node 22. From the repository root:

```sh
# terminal 1: the mock API on port 3001 (MOCK_MODE: normal, slow, error, empty)
node mock/server.mjs

# terminal 2: the client
cd client
npm ci
npm run dev
```

Preview the build: in `client/`, `npm run build`, then `npx vite preview` (port 4173). Both forward `/api` to the mock on port 3001.

The gates, from the root after `npm ci`: `npm run format:check`, `npm run lint`, `npm test`, `npm run build`.

## 3. Demo accounts

| Name in examples | Role | E-mail | Password |
|---|---|---|---|
| `linh` | customer | `linh@gradstudio.test` | `linh-demo` |
| `customer2` | customer | `customer2@gradstudio.test` | `customer2-demo` |
| `thao` | admin | `thao@gradstudio.test` | `thao-demo` |
| `mai` | staff | `mai@gradstudio.test` | `mai-demo` |
| `tuan` | staff | `tuan@gradstudio.test` | `tuan-demo` |
| `staff3` | staff | `staff3@gradstudio.test` | `staff3-demo` |
| `superadmin` | superadmin | `superadmin@gradstudio.test` | `superadmin-demo` |

Linh is the customer of the brief's example. `customer2` has a booking and a conversation of their own; `staff3` is not assigned to GS-1024. Display names are in `docs/api/01-auth.md`.

## 4. Routes

One row per route, as the browser shows it (`BrowserRouter`). A route that exists only after a step of the flow says so (`after G6`); opened earlier, it shows a message, not a blank screen.

| Path | Role | Steps | Endpoints |
|---|---|---|---|
| `/` | visitor (anyone) | G1 | `GET /api/services`, `GET /api/extras`, `GET /api/photos`, `GET /api/reviews` |
| `/dang-nhap` | anyone; a signed-in user is sent to their home | G2 | `POST /api/auth/login` |
| `/tu-van` | customer (protected) | G3 | `GET /api/conversations`, `GET /api/services`, `GET /api/extras`, `POST /api/conversations` |
| `/tu-van/:id` (e.g. `/tu-van/c-anh` as `customer2`; `/tu-van/c-linh` after G3) | customer (protected) | G3, G6 | `GET /api/conversations/:id`, `POST /api/conversations/:id/messages`, `POST /api/conversations/:id/proposals/:proposalId/answer` |
| `/lich-chup` | customer (protected) | G7 (still the PA#2 page, not yet on the API) | `GET /api/auth/me` on load |
| `/quan-ly` | admin (protected) | G4–G6 | `GET /api/conversations`, `GET /api/conversations/:id`, `GET /api/services`, `GET /api/extras`, `GET /api/staff`, `GET /api/rooms`, `GET /api/schedule`, `POST /api/schedule/check`, `GET /api/bookings`, `GET /api/bookings/:id`, `GET /api/payments`, `POST /api/conversations/:id/messages`, `POST /api/conversations/:id/proposals`, `POST /api/bookings` |
| `/quan-ly/hoi-thoai/:id` | admin (protected) | G4–G6 | `GET /api/conversations`, `GET /api/conversations/:id`, `GET /api/services`, `GET /api/extras`, `GET /api/staff`, `GET /api/rooms`, `GET /api/schedule`, `POST /api/schedule/check`, `GET /api/bookings`, `GET /api/bookings/:id`, `GET /api/payments`, `POST /api/conversations/:id/messages`, `POST /api/conversations/:id/proposals`, `POST /api/bookings` |
| `/cong-viec` | staff (protected) | G8, not built yet: says so plainly | `GET /api/auth/me` on load |
| `/quan-tri` | Superadmin (protected) | G11 | `GET /api/admins`, `POST /api/admins`, `GET /api/settings`, `PUT /api/settings` |
| any other path | anyone | not-found screen | — |

A protected route opened while signed out goes to `/dang-nhap` (step G2) and back after sign-in; opened with another role it is turned away with a link to that role's home. Homes: customer `/lich-chup`, admin `/quan-ly`, staff `/cong-viec`, Superadmin `/quan-tri`; until step G8 is built, `/cong-viec` shows a message that the screen is not ready, not the general not-found screen.

**Agreed for the screens not built yet (An and Khánh, 2026-11-22).** Each moves into the table above when its screen is built. Booking and payment ids sit in the path, never in the query (CLAUDE.md, NEVER 4).

| Path | Role | Steps |
|---|---|---|
| `/quan-ly/booking` | admin | G10, bookings with payment status |
| `/quan-ly/booking/:id` | admin | G10, change, cancel, final file link |
| `/lich-chup` | customer | G7, my bookings and reminders (the customer's home) |
| `/thanh-toan/:paymentId` | customer | G7, G9, the test payment gateway |
| `/thanh-toan/:paymentId/ket-qua` | customer | G7, G9, the payment's result |
| `/cong-viec` | staff | G8, assigned jobs, job status, preview upload |
| `/lich-chup/:id/anh` | customer | G9, photo choice, the remaining 70%, *Nhận ảnh* |

## 5. Product owner decisions

Questions posted under *GradStudio — questions for the product owners* (course Facebook group, #WAD2431). Until an answer arrives, the contract marks the behaviour as an assumption.

| Question | Post | Decision |
|---|---|---|
| What a customer sees when the deposit payment fails, and whether they can try again | | waiting |
| The status name of a cancelled booking | | waiting |
| Who may cancel or change a booking, and whether the deposit is refunded | | waiting |
| What a reminder says and where it shows in the customer's account | | waiting |
| What happens after the customer declines a proposed time | | waiting |
| The prices of the extras (make-up, costume rental); how a costume is chosen and whether its stock is checked | | waiting. **Team assumption until then (An, 2026-11-20):** each package lists what it already includes (make-up, costume); an included item shows 0đ in the booking, an item outside the package is added to the total. Make-up is priced per person and per artist slot. Costumes are checked for stock by model, size and date |
| Class yearbook: does the representative give the number of people (350.000đ/người)? | | waiting. **Team assumption until then (An, 2026-11-20):** the representative enters an estimated head count; the Admin confirms it and adjusts the price. The first version has one representative account with a link to the class's shared gallery; accounts for each classmate come later |

## 6. Libraries

| Library | Where | Why |
|---|---|---|
| React, React DOM | `client/` | The course's front-end stack |
| Vite | `client/` | Build and dev server, with the `/api` proxy |
| React Router 8 | `client/` | One route per screen (`BrowserRouter`), router links, protected routes. Needs React 19.2.7 or newer; the lock file has 19.3.1 |
| three | `client/` | The home page's 3D story only, loaded with a dynamic `import()` at 768 px and wider |
| ESLint and its React plugins | `client/` | The lint gate |
| Prettier | root | The format gate |

No CSS framework (plain CSS with the tokens in `client/src/styles/tokens.css`) and no form library (forms by hand with one shared helper).

## 7. Not done

Built on the API: G1, G2, G3, G4, G5, G6 (customer and Admin sides) and G11. Not built yet: G7, G8, G10 (Khánh's screens, contracts `04`–`08` ready) and G9 (An's, `09-gallery.md`). `/lich-chup` is still the PA#2 page.
