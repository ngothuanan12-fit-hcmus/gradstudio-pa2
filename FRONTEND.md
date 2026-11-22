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
| `/quan-ly` | admin (protected) | G4–G6 (still the PA#2 page, not yet on the API) | `GET /api/auth/me` on load |
| `/cong-viec` | staff (protected) | G8, not built yet: says so plainly | `GET /api/auth/me` on load |
| `/quan-tri` | Superadmin (protected) | G11 | `GET /api/admins`, `POST /api/admins`, `GET /api/settings`, `PUT /api/settings` |
| any other path | anyone | not-found screen | — |

A protected route opened while signed out goes to `/dang-nhap` (step G2) and back after sign-in; opened with another role it is turned away with a link to that role's home. Homes: customer `/lich-chup`, admin `/quan-ly`, staff `/cong-viec`, Superadmin `/quan-tri`; until step G8 is built, `/cong-viec` shows a message that the screen is not ready, not the general not-found screen.

**Agreed for the screens not built yet (An and Khánh, 2026-11-22).** Each moves into the table above when its screen is built. Booking and payment ids sit in the path, never in the query (CLAUDE.md, NEVER 4).

| Path | Role | Steps |
|---|---|---|
| `/quan-ly` | admin | G4, conversation list (the Admin's home) |
| `/quan-ly/hoi-thoai/:id` | admin | G4–G6, conversation, clash check, proposal, *Tạo booking* |
| `/quan-ly/booking` | admin | G10, bookings with payment status |
| `/quan-ly/booking/:id` | admin | G10, change, cancel, final file link |
| `/lich-chup` | customer | G7, my bookings and reminders (the customer's home) |
| `/thanh-toan/:paymentId` | customer | G7, G9, the test payment gateway |
| `/thanh-toan/:paymentId/ket-qua` | customer | G7, G9, the payment's result |
| `/cong-viec` | staff | G8, assigned jobs, job status, preview upload |
| `/lich-chup/:id/anh` | customer | G9, photo choice, the remaining 70%, *Nhận ảnh* |

## 5. Product owner decisions

Questions posted under *GradStudio — questions for the product owners* (course Facebook group, #WAD2431). The product owners answered on 2026-11-22 ([answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798)); what they left open stays an assumption, marked as such in the contract.

| Question | Post | Decision |
|---|---|---|
| What a customer sees when a payment fails, and whether they can try again | [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798) | The booking keeps its status (*Chờ cọc 30%*, or still waiting for the 70%); a clear message such as "Thanh toán không thành công, booking vẫn chờ cọc", with a retry button; no limit on tries. An amount already paid cannot be paid again (`409`) |
| The status name of a cancelled booking | [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798) | *Đã hủy*, seen by the Admin and the customer |
| Who may cancel or change a booking, and whether the deposit is refunded | [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798) | Only the Admin cancels, from *Chờ cọc 30%* or *Đã đặt lịch*; *Hoàn thành* cannot be cancelled (`409`). The customer asks in the chat. Cancelling frees the people and the room and sends no reminder. No refund tracking: the booking still shows what was paid, and the studio refunds outside the system. Rescheduling: the Admin changes the time with the clash check at the new time, without the customer agreeing again; the status stays, the reminder is recomputed from the new earliest milestone, the jobs follow |
| What a reminder says and where it shows in the customer's account | [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798) (in part) | A cancelled booking gets no reminder; a rescheduled one is recomputed. Where it shows comes from the brief (G7: *Lịch chụp của tôi*, with its time, channels and e-mail status). **Still open:** the text. Team assumption: booking code, date, make-up and shoot times, staff and room |
| What happens after the customer declines a proposed time | — | **Still open.** Team assumption: the conversation goes back to *Đang tư vấn* and the studio may propose another time |
| The prices of the extras (make-up, costume rental); how a costume is chosen and whether its stock is checked | [answer](https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798) | Extras have no price of their own: a booking costs its package's price, computed by the server (GS-1024: 1.800.000đ, make-up included). The Admin may not change or discount a price. Extras are recorded only so the Admin can plan people and costumes. The clash check covers people and rooms only; costume stock is not checked. **Still open:** whether every package may record make-up or a costume (team assumption: yes) |
| Class yearbook: does the representative give the number of people (350.000đ/người)? | — | **Still open.** Team assumption: the representative enters an estimated head count; the Admin confirms the head count and the server computes the price from it (no price typed by hand). One representative account with a link to the class's shared gallery; accounts for each classmate come later |

Also answered in the same post: the Superadmin views and creates Admin accounts (locking is optional, no editing or deleting); a job's statuses are *Chưa bắt đầu*, *Đang làm*, *Hoàn thành*, and a job never changes its booking; a conversation becomes *Hoàn thành* by itself when its booking does (after *Nhận ảnh*); when a second customer's deposit arrives for a time already held, the amount is recorded as received, the booking stays *Chờ cọc 30%* with the reason, and the Admin refunds outside the system or cancels it; the photo choice may be changed, within the package's count, until the 70% is paid, then it is locked (`409`). Whether the studio's opening hours limit a proposed time is not said; the team keeps that check.

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

Built on the API: G1, G2, G3, G6 (the customer's side) and G11. Not built yet: G4, G5, G6 (the Admin's side), G7, G8, G10 (Khánh's, contract files 04–08 not written yet) and G9 (`09-gallery.md` waits for 05 and 06). `/lich-chup` and `/quan-ly` are still the PA#2 pages.
