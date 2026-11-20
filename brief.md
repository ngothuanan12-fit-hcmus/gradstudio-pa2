# brief.md — PA#3, GradStudio front end on a contract and a mock

Team: Ngô Thuận An (23120206), Nguyễn Hữu Khánh (24120340).

This file replaces the PA#2 brief, which stays in the history (tag `pa2-submitted`). Part 1 is the hand-over every PA#3 request starts from: the assistant reads it with `CLAUDE.md` and follows `docs/api/`. Part 2 holds the prompts as given, in order, in the language they were sent; notes in English were added by the team.

## Part 1 — the hand-over

### The task

Build the whole main flow of GradStudio as a React app in `client/`, for the four roles, against our own contract in `docs/api/` and our mock in `mock/server.mjs`. The PA#2 pages are the starting point for the look; the PA#3 rubric gives 0–7 for re-rendering them, so every screen must work on API data.

| Step | Who | What must work |
|---|---|---|
| G1 | Visitor | Home and catalogue: services, packages and prices, extras, sample photos, reviews. No sign-in |
| G2 | Everyone | Sign in with a demo account, land on that role's home, sign out |
| G3 | Customer | Chat, or send a booking request (shoot type, preferred date and time, extras such as make-up or costume rental); what was sent appears in the conversation |
| G4 | Admin | Conversation list with *Chưa trả lời, Đang tư vấn, Đã chốt lịch, Hoàn thành*; open one and reply |
| G5 | Admin | Clash check for a time, the people and the room: clash or not, why (Mai busy 08:00–12:00, so 09:00 clashes), which time is free, in words; propose a time in the chat |
| G6 | Customer, then Admin | The customer agrees or declines in the chat; until then *Tạo booking* is disabled and says why; after agreement the booking is created, linked to the conversation, in *Chờ cọc 30%* |
| G7 | Customer | *Lịch chụp của tôi*: bookings, status, package, agreed times, price, deposit, remainder; the deposit through the test gateway route: success → *Đã đặt lịch*, failure → still *Chờ cọc 30%* with a message; reminders with their time, channels and e-mail status |
| G8 | Staff | Assigned work: when, where, what; update a job's status; add preview photos to the booking |
| G9 | Customer | Gallery: choose photos, no more than 30; pay the remaining 70%; once the file link is there, *Nhận ảnh* → *Hoàn thành* |
| G10 | Admin | Bookings with payment status; change or cancel with the clash check at the new time; add the final file link |
| G11 | Superadmin | Admin accounts (list, create); settings: opening hours, how long before a shoot reminders go out |

### Facts

- One story: Linh, Saturday 24/10/2026; 09:00 clashes because make-up artist Mai is busy 08:00–12:00; make-up 13:00–14:00 with Mai, shoot 14:00–16:00 with Tuấn in Phòng B; Admin Thảo; GS-1024, Gói Tốt nghiệp Premium (2 hours, 30 photos), Tốt nghiệp cá nhân, 1.800.000đ, deposit 540.000đ, remainder 1.260.000đ. Services: Kỷ yếu lớp từ 350.000đ/người, Tốt nghiệp từ 1.800.000đ, Chân dung/CV từ 690.000đ.
- Status names exactly as above; bookings *Chờ cọc 30%* (may read *Đã thống nhất lịch · Chờ cọc 30%*), *Đã đặt lịch*, *Hoàn thành*.
- The slot is held only after the deposit succeeds and the resources are checked again.
- Demo accounts: `linh`, `customer2` (another customer), `thao`, `mai`, `tuan`, `staff3` (not on GS-1024), `superadmin`.
- The test payment is a route of the app, labelled plainly as a test, offering success and failure; it returns to `/thanh-toan/ket-qua`, as a real gateway will in PA#4.
- Money is an integer number of đồng, computed by the API, shown as `value.toLocaleString('vi-VN') + 'đ'`.
- Where the brief is silent, the product owners decide. Do not invent a price, a time or a policy; until they answer, mark the behaviour as an assumption.

### Constraints

1. **Follow `docs/api/`.** Call only the endpoints in the contract. If a screen needs one that is missing, stop and say so; the team adds it to the contract first.
2. **Do not edit `docs/api/` or `mock/`** unless the request says so.
3. **Relative `/api` paths only**, through `client/src/api/`; never `http://localhost:3001`. `client/vite.config.js` forwards `/api` to port 3001 in `server.proxy` and `preview.proxy`.
4. **No data written into components**: packages, conversations, bookings, staff and photos come from the API.
5. **Every screen that loads data** shows loading, an error with *Retry* that reloads without a page reload, and an empty message. One request per thing loaded.
6. **Routing and sign-in**: React Router with `BrowserRouter`; every route opens directly and after a reload; unknown paths show a not-found screen; signed out → sign-in → back to the route; another role's route is turned away. The user and token live in one auth context read with a hook; the token alone is kept under one storage key; sign-out clears it; every request after sign-in sends `Authorization: Bearer`. After an action the screen updates from the API's answer, without a page reload.
7. **Forms**, written by hand with one shared helper: a visible `<label>` on every input; checked against the contract before sending; after the first try one message per field next to it, linked with `aria-describedby`; a `400`'s field messages shown on their fields; typed values kept after an error; the submit cannot send twice; the preview upload refuses a wrong type or size before sending.
8. **Choices made**: React Router; plain CSS with the tokens; forms by hand; `three` only for the home page's 3D story (dynamic `import()`, 768 px and wider, plain fallback); Prettier as the formatter. **No other dependency without asking.**
9. **From PA#2**: usable at 360, 768 and 1280 px with no sideways scroll; tap targets 44 px at 360 px; landmarks, one `<h1>` per screen, no skipped heading level; `<button>` for actions, links for moving; a visible label on every input; body text 16 px or more, contrast 4.5:1; spacing from the tokens; no fixed widths that overflow, no `overflow-x: hidden`, no `!important`, no inline style for appearance; no `dangerouslySetInnerHTML`, no index as `key`, no `useState` for what can be computed, `useEffect` only to sync with the outside, with a cleanup that aborts.
10. **Fix these, as read in PA#3**: no demo controls (changing role is signing out and in); every main-flow action works, and a button is disabled only where the flow disables it, with the reason on screen; each screen shows the current state from the API; nothing covers the page at 360 px; no cut-off labels; a clash never shown by colour alone; no early promise of the slot; nothing that leads nowhere; photos licensed with their source named.

### How done is checked

- Each step G1–G11 walked through the app's own links and buttons with the demo accounts, in order, with the brief's data; a payment that succeeds and one that fails.
- The mock restarted in `normal`, `slow`, `error` and `empty`: every data screen shows loading, the error with *Retry*, and the empty message; the mock's log shows no repeated requests.
- Every route in `FRONTEND.md` opened directly, signed in as its role, at 360, 768 and 1280 px; the two Console lines of PA#2; 0 W3C errors on the rendered HTML.
- Every example in `docs/api/` sent to a freshly started mock gives the answer it shows (`contract-check.mjs`).
- `npm run format:check`, `npm run lint`, `npm test`, `npm run build` pass; `git diff -- docs/api mock` shows only what was asked.

## Part 2 — prompts as given

### 2.1 Preparing before the rubric (2026-11-17)

These went to Claude Code before the PA#3 rubric was out. The work they produced lives in a separate lab folder, outside this repository; nothing from it is copied here.

> phần tiếp theo của project là làm toàn bộ frontend, mình chưa có yêu cầu cụ thể của phần đó nhưng mình muốn làm trước để có nhiều thời gian tỉnh chỉnh từng component, lựa chọn ux/ui cho phù hợp thì mình nên làm gì vì khi có yêu cầu đề cụ thể ở phần tiếp theo thì mình cần phải vừa làm vừa ghi AI LOG như những lần trước và lần tiếp theo là làm bằng web thật nên việc scroll có lẻ cũng sẽ khác nhưng mình vẫn muốn chuẩn bị trước

> phần chuẩn bị có thể làm cả ở ngoài repo luôn không, để khi cần thì có thể chụp hoặc lấy từ phần chuẩn bị đó nhưng vẫn nêu các để làm ra phần giao diện đó chứ không copy code theo quy định

> về mặt stack hay luồng thì nó vẫn sẽ bám đúng các chức năng như mô tả của gradstudio có thể trên repo sẽ đầy đủ chức năng

> duyệt

> mình muốn làn trước các trang đã có sẵn ở PA#2 được không

> làm vùng cuộn riêng cho chat khi làm phần này, mình cần sửa quan ly và lich chup, bạn chỉ cần lấy mã nguồn, không cần dựng lại, push lên không có co author hay generate with để  khánh pull về và làm luôn hai trang đã sửa đó

> ý mình là bạn không sửa hai trang đó, chỉ lấy mã nguồn thôi nha

### 2.2 The rubrics arrive; constraints and decisions (2026-11-18)

An pasted the lecturer's announcement of the six milestones (PA#1–PA#6, dates and weights); the overview and the PA#3–PA#6 rubrics were read from their PDFs.

> đã có các PA
> bạn xem để chuẩn bị sẵn các ràng buộc thật kỹ và đúng theo đề để project các điểm tối đa theo các yêu cầu
> chuẩn bị để chia các trang cần làm cho Khánh

> 1 tạm theo cách chia trên nhưng mình sẽ gửi tin nhắn cho Khánh
> từ 2 đến 5 mình cần hiểu nên bạn giải thích và để mình xem xét và quyết định từng câu

> 2 thêm prettier, 3 viết tay, 4 giữ nguyên,phần hỏi nhớ hỏi lại để nhắc mình gửi câu trả lời khi có đáp án
> […] mình sẽ nhắn riêng cho Khánh các công việc nên soạn cho mình một đoạn tin nhắn

The part left out (`[…]`) is about how An manages the team's planning, not about the product.

### 2.3 Tag and rules file (2026-11-18)

> bắt đầu gắn tag và viết lại CLAUDE.md

> đọc trong 2 phút là sao, phần này là nêu của cái gì

> rút gọn, tách thành commit riêng

> push rồi viết brief.md cho PA#3

### 2.4 The app into `client/`, then Prettier (2026-11-19)

> thêm Prettier trong một commit riêng.

Asked whether Prettier should come before or after the move into `client/`, An chose: move into `client/` first.

> push rồi làm CI

### 2.5 HARNESS.md and the contract README (2026-11-19)

> tạo HARNESS.md rồi viết docs/api/README.md

> push rồi viết 01-auth.md
> hiện tại có làm theo trình tự front end trước không

### 2.6 The PA#3 assignment and contract-check (2026-11-20)

An pasted the PA#3 assignment text from Classroom (the whole main flow G1–G11 for four roles; the contract in `docs/api/` and `mock/server.mjs` with four modes before the screens; `contract-check.mjs` and its README attached; hand-in by 2 December 22:00).

> hãy xem và có cần phân việc lại không
> mình để trong PA3

> chuyển  G8 sang Khánh
> đồng ý 4 việc chung
> push commit

> push rồi làm dữ liệu khởi đầu

> mình chưa hiểu hai câu hỏi

> push rồi làm khung mock

> 1 sửa thông báo, nếu mở rộng sang mock thì có ảnh hưởng gì không, xem kỹ lại quy định
> push
> với hai câu hỏi 6, 7 thì tạm thời làm theo ý dưới đây, vẫn giữ lại trong bộ danh sách câu hỏi
> Gói có danh sách “đã gồm” (makeup, trang phục). Mục nào đã gồm thì hiện 0đ trong booking, mục ngoài gói cộng thêm vào tổng.
> Makeup tính theo người và theo suất của thợ. Trang phục kiểm tra tồn kho theo (mẫu, size, ngày).
> Kỷ yếu lớp: đại diện nhập sĩ số ước lượng, admin xác nhận và điều chỉnh giá. Bản đầu chỉ cần một tài khoản đại diện kèm link thư viện ảnh chung. Tài khoản riêng từng bạn để làm sau.

> 1 đồng ý thêm, 2 nếu để đổ do chưa đủ thì có ảnh hưởng gì, được ghi vào HARNESS không

> bổ sung lưu ý ảnh hưởng tới phần Khánh vào đoạn tin nhắn gửi Khánh

> push rồi dùng danh sách Planned

> viết 02-catalogue.md

> làm cách 1, viết mock catalogue rồi push
> Trong 02-catalogue.md, các ví dụ có Áo cử nhân, Áo dài trắng, size S–XL và review của Lê Gia Bảo nhưng không ghi gì là mẫu
> mô tả ngắn nên tự viết kiểu Đặt lịch cho cả lớp ngay để lưu lại những khoảnh khắc đáng nhớ cùng nhau

> viết 03-conversations.md hội thoại quay về đang tư vấn

> viết 10-admin.md

> làm phần nền front end trước

> làm G2 màn đăng nhập

> chờ phiên kia xong rồi chạy lại đủ A–I

> mình thử test tay nên lỡ mở thêm cổng mà quên tắt, chạy lại A–I

Prompts of a review session that ran beside the ones above on 2026-11-20, in the order sent. The first was sent after `viết 02-catalogue.md`; the third and later ones were sent after `làm phần nền front end trước`.

> xem cho mình
> Giá trị brief không có thì để null, không tự đặt số: giá dịch vụ thêm, thời lượng và số ảnh của gói Kỷ yếu và gói Chân dung.
> Mô tả ngắn của từng dịch vụ là câu nhóm tự viết, không chép chữ từ prototype của nhóm tác giả.
> Các mẫu áo (Áo cử nhân, Áo dài trắng) và nội dung đánh giá là dữ liệu mẫu, đã đánh dấu sample.

> 1. Viết module mock cho catalogue trước, rồi push cả hai commit cùng lúc. CI xanh.
> 2. Push contract ngay, rồi mới viết mock. CI sẽ đỏ một lượt, sau đó xanh lại khi có mock. Lượt đỏ này là thật và đúng thứ tự rubric (contract trước, mock sau), nhưng là đỏ mà mình biết trước.
> cách nào đúng quy định hơn trong hai cách trên

> các trạng thái hiện tại của đoạn chat là gì

> cho mình hướng dẫn để test các trang với 3 commit d3dca41, a49b9ea, 7ae3f89

> chạy thử các bước test này giúp mình

> kiểm tra G2 đăng nhập trên nhiều tiêu chí và đúng quy định

> commit cho đúng quy định ghi ai log, không sửa gì

> xem file nào cần ghi đúng file lúc commit nữa thì chuẩn bị ghi

> push
> sửa lại
> Đăng nhập sai xong, focus rơi về <body> vì nút bị khóa trong lúc chờ. Người dùng bàn phím phải Tab lại từ đầu trang
> Mai, Tuấn, staff3 và superadmin đăng nhập xong rơi vào not-found chung "Địa chỉ này không có trong GradStudio". FRONTEND.md mục 4 lại yêu cầu route chưa làm phải hiện một thông báo riêng
> Form co theo nội dung: chỉ rộng khoảng 220 px ở màn 360 px, và rộng ra khi hiện lỗi 401, làm layout nhảy. Nguyên nhân là margin-inline: auto trong grid .page-main
