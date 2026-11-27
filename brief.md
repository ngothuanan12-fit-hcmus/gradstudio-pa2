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

> push, chuẩn bị các list công việc để mai làm tiếp, giờ nghỉ ngơi

### 2.7 G1, after checking the repository (2026-11-21)

> thực hiện tiếp G1, kiểm tra repo

In the question dialog An chose: fix the three remaining issues of the G2 review (4–6) before G1, and add both rules the review proposed (HARNESS incidents 8 and 9) to `CLAUDE.md`.

> làm G3 và G6 phía khách

### 2.8 G11, the Superadmin's screen (2026-11-21)

> làm G11

> mình cần tự kiểm các trang như thế nào

> commit luôn cho đúng quy định

> push

### 2.9 Contract 04-schedule (Khánh, 2026-11-21)

> Tạo nhánh mới để bắt đầu làm các task lead giao, cần nhắc lại về file brief.md và AI-LOG.md. Đó là brief.md bạn sẽ ghi vào những câu prompt khi bắt đầu làm (có thể sau khi tạo nhánh là bắt đầu làm nè), còn file AI-LOG.md bạn có thể tham khảo các viết của An - tức là khi tôi prompt và bạn chỉnh hết file theo yêu cầu đó và kết thúc phiên của câu hỏi đó thì bạn sẽ commit hết + ghi vào AI-LOG.md. Bạn hãy tạo nhánh đi + response lại tôi đã hiểu ý làm của 2 file đó chưa. Ngoài ra các rule khác vẫn cứ đọc codebase coi các yêu cầu của lead (An) để thực hiện không thiếu hành động nào

> Viêt docs/api/04-schedule.md (có thể tham khảo cách viết của lead), lần này có thể commit .gitignore + AGENTS.md.

### 2.10 Log rules from An and HARNESS update (Khánh, 2026-11-21)

> Trước khi viết tiếp các thì có thêm các rule từ lead như sau:
> Changed thì ghi sai chỗ nào và lần chạy nào bắt được (contract-check, lint, format…). Nếu không sai gì thì ghi "nothing". Kết quả các lần chạy kiểm tra thì tách thành một câu riêng.
> Rejected: chỉ ghi những gì đề xuất mà không đồng ý, kèm lý do. Nếu không đề xuất gì thì ghi "nothing".
> By hand: chỉ ghi phần chữ hoặc code tự viết hay tự sửa. 
> Việc tách .gitignore và AGENTS.md ra commit riêng là một quyết định, nên chuyển sang Kept.
> Ngoài AGENTS.md, nếu còn file quy tắc hay workflow nào thì commit luôn và ghi vào HARNESS. File cài đặt riêng trên máy (đường dẫn, token) thì cho vào .gitignore, không commit nha.
> Lỡ commit .gitignore lần này thì cứ để yên đó, lần sau thì không cần.

### 2.11 Contract 05-bookings (Khánh, 2026-11-21)

> Viết tiếp

### 2.12 Contract 06-payments (Khánh, 2026-11-21)

> Tiếp tục với contract 06

### 2.13 Contract 07-reminders (Khánh, 2026-11-21)

> Viết tiếp cho tôi

### 2.14 Contract 08-jobs (Khánh, 2026-11-21)

> Oke tiếp tục

### 2.15 Mock for 04-schedule (Khánh, 2026-11-21)

> Viết mock cho 04 cho tôi (nhớ phải tham khảo cách viết của lead)

### 2.16 Mock for 05-bookings (Khánh, 2026-11-21)

> Tiếp tục

### 2.17 Mocks for 06-payments, 07-reminders, and 08-jobs (Khánh, 2026-11-21)

> Oke tiếp tục viết mock 06-07-08 luôn (nhưng vẫn mỗi commit là 1 phần nha). Làm và kiểm tra kỹ

### 2.18 Merge main and PR for contracts 04–08 and mocks (Khánh, 2026-11-21)

> Tạo pull request vào main, và viết comment những gì đã thực hiện được sau đó request cho lead An review

### 2.9 Review of Khánh's PR #5, contracts and mocks 04–08 (2026-11-21)

> kiểm tra pr của repo

> đăng review lên PR #5

### 2.10 The two fixes to the proposal endpoint, found by Khánh (2026-11-22)

> hai vấn đề
> Đề xuất bị trùng lịch phải dùng chung checkSchedule của Khánh, để giờ trống được kiểm tra thật, và để tính cả giờ mở cửa lẫn tồn kho trang phục.
> Chặn tạo đề xuất mới khi hội thoại đã có booking. Việc này cần thêm một dòng có ngày vào ## Changes của 03-conversations.md.
> nên xử lý thế nào

> nếu ghi hội thoại này đã có booking  kèm mã thì có bấm vào thông báo hiện lên được không để dẫn tới nơi xảy ra xung đột
> việc 1 mình chưa hình dung được a và b cái nào trực quan và tiện lợi hơn, bạn nếu giống như vậy mình không nhớ rõ để review

> mình muốn cách b để đảm bảo chức năng chỉ không phải nhanh hay khi gặp trường hợp ngoại lệ lại xử lý phức tạp, ghi AI LOG cho phiên này có thay đổi
> kiểm tra các câu hỏi dưới đây do Khánh hỏi

Followed by Khánh's three questions, items 5 to 7 of the PR #5 review (when the remaining 70% may be paid; preview `url` as a base64 data URL; the route names of G4–G10).

> đồng ý cả ba, soạn tin nhắn trả lời Khánh

### 2.11 Refuse a proposal once the conversation has a booking (2026-11-22)

> làm việc chặn đề xuất khi đã có booking
> mình có sửa luôn 03-conversations không

### 2.19 Review fixes for PR #5 and agreed items (Khánh, 2026-11-22)

> Chốt mục 2 như sau:
> Câu 5: Trả 70% còn lại
> Chỉ được trả sau khi khách đã lưu lựa chọn ảnh, đúng thứ tự G9 của đề: chọn ảnh → trả 70% → Nhận ảnh.
> Trong 06-payments.md:
> Thêm luật này kèm lỗi 409, ghi rõ là cách nhóm đọc G9.
> Bỏ ví dụ trả 70% thành công cho GS-1022, thay bằng ví dụ bị từ chối vì chưa chọn ảnh.
> Mock 06 đọc lựa chọn ảnh từ db.selections (mock 09 của mình sẽ tạo). Chưa có thì coi như chưa chọn.
> Ví dụ gắn link file cho GS-1022 ở 05 giữ nguyên. Chuỗi chọn ảnh → trả 70% → Nhận ảnh của GS-1022 làm ở 09-gallery.md.
> Câu 6: Ảnh xem trước
> url không trả base64 nữa, mà trỏ tới một endpoint trong 08 trả về chính file ảnh, để trình duyệt tải qua `<img>`.
> Contract-check chỉ đọc được câu trả lời JSON, nên ví dụ của endpoint này chỉ viết các ca lỗi JSON (401, 404). Ca 200 thì mô tả bằng lời.
> Ảnh xem trước trong seed có thể dùng ảnh mẫu có sẵn trong client/public/photos.
> Câu 7: Route
> đã ghi danh sách route vào FRONTEND.md mục 4 (bảng "Agreed for the screens not built yet"). em xem có chỗ nào cần đổi thì nhắn mình trước khi dựng màn. Mã booking và mã thanh toán để trong đường dẫn, không để trong query.
> Sửa lại 06-payments.md cho khớp tên route /thanh-toan/:paymentId và /thanh-toan/:paymentId/ket-qua.
> Rồi tiến hành luôn các bước 1. 2. 3.

### 2.12 Second review of PR #5 (2026-11-22)

> push từng commit

> kiểm tra lại việc Khánh mới pr

> Đồng ý

### 2.13 The proposal uses the clash check of 04 (2026-11-22)

> đã merge PR #5, pull về rồi push

> làm việc 1 luôn

> push từng commit

> Có

### 2.14 The product-owner questions again, and a message to Khánh (2026-11-22)

> gửi lại cho mình 7 câu hỏi
> soạn đoạn tin nhắn cho Khánh

### 2.15 The product owners' answers (2026-11-22)

> (An's summary of the answers to the seven questions, then the post of ten questions and the product owners' answers, pasted)
> bạn xem có cần sửa gì trong các việc làm tiếp theo không

> đồng ý, làm bước 1 và soạn tin nhắn cho Khánh
> link bài trả lời https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28787637377601727&reply_comment_id=28808596665505798

> push

> giờ mình thiết lại những gì theo các thay đổi thì làm trước, cái nào cần chờ thì làm sau

> tiếp tục

### 2.20 PO decisions sync and review fixes on contracts & mocks 04, 05, 06, 08 (Khánh, 2026-11-22)

Applied Lead An's review fixes and the 2026-11-22 product owners' answers onto a fresh branch from `origin/main` (`5038348`), one commit per contract then mock:

> + pull main rồi làm trên nhánh mới. Mỗi file: contract trước, mock sau, mỗi thay đổi thêm một dòng có ngày vào ## Changes
> - 04-schedule.md + schedule.mjs + freeTimes.json: bỏ kiểm tra tồn kho trang phục (`costumes`, `costumeAvailability`, `kind: "costume"`); mỗi ngày trong `freeTimes.json` có vài khung giờ và `checkSchedule` chọn khung đầu tiên còn trống thật.
> - 05-bookings.md + bookings.mjs: dịch vụ thêm không tính tiền và Admin không sửa/giảm tổng tiền (`total` bỏ khỏi `PATCH /api/bookings/:id`, giá booking luôn là giá gói tính từ `people`), *Đã hủy* và không hoàn tiền trong hệ thống theo quyết định của khách hàng (kèm link), và thông báo `"Chọn thông tin cần thay đổi."` khi body rỗng của `PATCH` là lỗi chung cả form (`fields: {}`), không gắn vào `date`.
> - 06-payments.md + payments.mjs: thông báo thanh toán thất bại đúng mẫu `"Thanh toán không thành công, booking vẫn chờ cọc"` (và giữ chờ 70%); khi hai người đặt trùng giờ đều tới bước thanh toán và người sau trả tiền thành công thì ghi nhận đã nhận tiền (`succeeded`), booking vẫn giữ `Chờ cọc 30%` kèm lý do, không cho trả cọc lại (`409`), không hoàn tiền tự động.
> - 08-jobs.md + jobs.mjs + jobs.json: đổi `*Đang thực hiện*` thành `Đang làm`, làm rõ trạng thái việc không đổi trạng thái booking, và sửa câu `GET /api/previews/:id` đòi token nên client tải ảnh bằng token rồi đưa object URL vào `<img>`.

### 2.21 G4–G6 Admin conversations, clash check, and booking UI (Khánh, 2026-11-22)

Carried over from `feature/pa3-ui` (`4cf690d`) and synced with `main` (`5038348`) plus the PO-updated contracts (`04`, `05`, `06`, `08`).

> Tạo nhánh mới để chuẩn bị làm UI

> ## 0. Nguyên tắc bắt buộc (đọc trước khi làm)
> Trước khi viết bất kỳ dòng code nào, bắt buộc đọc: `CLAUDE.md`, `AGENTS.md`, `FRONTEND.md`, `brief.md`, `docs/api/{README,02-catalogue,03-conversations,04-schedule,05-bookings,06-payments}.md`, `client/src/{App.jsx,layouts/AdminLayout.jsx,styles/{tokens,base,ui}.css,api/client.js,hooks/useApi.js,forms/{useForm,useAction}.js}`. Không sửa `docs/api/`, `mock/`, `tools/contract-check.mjs`; giữ `<AccountBar />`, `<RequireRole roles={['admin']}>`, toàn bộ danh sách `NEVER`, 3 trạng thái dữ liệu (Loading, Error + Retry, Empty), và an toàn tiến trình/cổng test.
>
> ## 1. Đặc tả giao diện (theo ảnh mẫu) & toàn bộ chức năng ẩn
> Dựng giao diện `/quan-ly` và `/quan-ly/hoi-thoai/:id` với theme `studio`, bố cục 3 cột responsive `<768px` / `768–1279px` / `>=1280px`, thu/mở panel phải `[|]`, cột trái `Hội thoại` (`#conv-search`, 5 pill lọc trạng thái cuộn ngang nội bộ, `.conv-status-dot`), cột giữa chat Messenger gom nhóm `<4 phút`, mốc thời gian, `RequestCard`/`ProposalCard`/thẻ `Báo giá`, chip thao tác nhanh theo trạng thái, form nhập tin nhắn có validation; cột phải 4 màn hình theo trạng thái (`Tư vấn nhanh`, `Tư vấn & Báo giá` trượt ngang sang Form đề xuất giờ có kiểm tra trùng live & khóa `Tạo booking`, `BookingForm` với Custom `DatePicker` & Custom `Select` bàn phím + tạo `GS-1024` không reload, `InvoicePanel` xem & gửi hóa đơn); modal `ScheduleSheet` & `ResourceSchedule` 3 chế độ `Ngày`/`Tuần`/`Tháng`, 5 loại block, `EventPopover`, bẫy focus và trả focus khi nhấn `Escape`.
>
> ## 2. Điều phối 2 Worker & Vòng lặp đồng thuận (Consensus Loop)
> Worker 1 (Implementer & Gate Tester) + Worker 2 (Visual & E2E Verifier bằng Playwright + `web_tools` ở `1280×800`, `768×1024`, `360×800`, 4 `MOCK_MODE`, luồng Linh -> `GS-1024`, đối chiếu 4 ảnh mẫu); chỉ kết thúc khi cả 2 worker `ĐỒNG THUẬN KẾT THÚC`.

> Khi xong 1 câu hỏi và hoàn thành task dù tốt hay không vẫn phải commit hết + ghi AI-LOG.md và brief.md

> Khi hội thoại có bookingId thì ẩn form đề xuất, hiện link tới `/quan-ly/booking/:id`; bỏ tồn kho trang phục và bỏ giả định giá dịch vụ thêm theo quyết định PO.
> Tiếp tục (nhưng vừa rồi có vấn đề tràn ram nên đã crash chương trình) lần này làm kĩ lại

### 2.22 Single-spawn mock guard, PR #6 submission, and PR #6 review fixes (Khánh, 2026-11-22 – 2026-11-23)

Appended verbatim prompts after resolving the earlier inline-spawn OOM crash through opening PR #6 and addressing Lead An's review feedback (`74e9fba`–`7d5965b`):

> Nguyên nhân 2 lần crash trước KHÔNG phải do `npm test`, mà do lỗi fork bomb trong đoạn `node -e` bạn tự viết:
> - `out += d` giữ nguyên chuỗi `"GradStudio mock on"` mãi mãi, trong khi `mock/server.mjs` log mỗi HTTP request ra `stdout`.
> - Vì không có biến cờ `started`, mỗi chunk `stdout` sau đó đều làm `out.includes("GradStudio mock on")` đúng lại, spawn thêm hàng trăm tiến trình `tools/contract-check.mjs` chạy song song gây tràn RAM (13 GB) và bị OOM kill.
>
> Quy tắc bắt buộc từ giờ khi chạy `contract-check.mjs` với `mock/server.mjs`:
> 1. TUYỆT ĐỐI không gọi `spawn(...)` trực tiếp trong `stdout.on("data")` mà không có guard một lần (`if (started) return; started = true;`).
> 2. Dùng pattern an toàn (chỉ spawn đúng 1 lần, không tích lũy `out` sau khi đã start):
>    - Đặt `let started = false;`, khi `!started && out.includes("GradStudio mock on")` thì set `started = true; out = "";` rồi mới spawn `contract-check.mjs` một lần duy nhất (hoặc bọc bước chờ start trong `new Promise` giống `startMock` ở `test/mock.test.mjs`, rồi `await` xong mới `spawn`).
>
> Bây giờ hãy tiếp tục từ thay đổi đang dở ở `docs/api/06-payments.md`, dùng pattern an toàn ở trên nếu cần chạy `--strict-values`, rồi hoàn tất các bước tiếp theo.

> Push lên github + tạo pull request tới An và comment những gì đã làm được.

> Còn những trang UI nào cần phải làm

> Đã có comment phải hồi lại pull request, pull về và fix theo chỉ dẫn

> Hãy cập nhật vào brief.md, rồi push lên lại

### 2.23 PR #6 follow-ups and steps G7, G8, G10 on `feature/pa3-g7-g8-g10` (Khánh, 2026-11-23)

Merged PR #6 on `main` (`afbb30e`), branched `feature/pa3-g7-g8-g10`, compacted context before building the remaining PA#3 screens, and ran the dual-worker consensus loop across PR #6 follow-ups (`956857d`, `33efc6b`), step G7 (`285bad8`), step G8 (`6d4c05e`), and step G10 + `FRONTEND.md` (`1c60f85`):

> Đã merged vào main, quay lại main và pull hết code về

> Tạo 1 nhánh mới đề làm các màn hình còn lại

> Compact session này lại để chuẩn bị làm các màn hình kia và đặt biệt phải ghi lại các rule quan trọng

> /compact

> ## 0. Quy tắc chung & Những điểm kỹ thuật phải kiểm tra trước
> Trước khi sửa code, đọc kỹ:
> - `CLAUDE.md`, `FRONTEND.md`, `brief.md`, `AI-LOG.md` (dòng `2323–2380`)
> - `docs/api/04-schedule.md`, `05-bookings.md`, `06-payments.md`, `07-reminders.md`, `08-jobs.md`, `09-gallery.md`
> - `client/src/App.jsx`, `client/src/api/client.js`, `client/src/hooks/useApi.js`, `client/src/forms/useForm.js`, `client/src/forms/useAction.js`
> - `client/src/components/DataState.jsx`, `PreviewImage.jsx`, `StatusBadge.jsx`, `useMediaQuery.js`, `client/src/components/ui/*`, `client/src/utils/*`.
>
> Ràng buộc bắt buộc:
> 1. **Không chỉnh sửa `mock/` hay `tools/contract-check.mjs`**, và **chỉ sửa `docs/api/05-bookings.md` đúng điểm follow-up `"..."` -> `…` ở mục 1B**.
> 2. **Không hardcode dữ liệu vào component**, chỉ gọi `/api/...` qua `client/src/api/client.js` (`api`, `apiBlob`). Không lưu bookingId/paymentId vào URL query hay `localStorage`/`sessionStorage`.
> 3. **Tái sử dụng helper/component sẵn có** (`DataState`, `LoadingState`, `ErrorState`, `EmptyState`, `PreviewImage`, `StatusBadge`, `DatePicker`, `Select`, `PriceSummary`, `useApi`, `useForm`, `useAction`, `useMediaQuery`, `utils/date.js`, `utils/moment.js`, `utils/money.js`, `utils/status.js`, `utils/schedule.js`, `utils/pricing.js`).
> 4. **Danh sách `NEVER` của `CLAUDE.md`**:
>    - Không `dangerouslySetInnerHTML`, không index làm `key`, không `location.href` hay `onClick` điều hướng (dùng `<Link>` / `<NavLink>` hoặc `navigate()` trong submit/action), không link `#`.
>    - Không `overflow-x: hidden`, không `!important`, không `style=""` cho phần nhìn (chỉ dùng CSS custom properties mang dữ liệu tọa độ như `--at`, `--len` trong `.day-bar`/timeline).
>    - Mọi trang chỉ có đúng `1` `<h1>`, thứ tự heading không nhảy cóc (`h1 -> h2 -> h3`) và **thứ tự DOM phải khớp thứ tự nhìn thấy / Tab order (WCAG 2.4.3 / 1.3.2)**.
>    - Mọi input có `<label>` hiển thị (hoặc `.sr-only` đúng chỗ như ô search), nút/link ở `360px` cao `>= 44px`, dùng `aria-disabled="true"` (kèm giải thích lý do rõ trên màn hình) cho nút submit đang chờ hoặc bị khóa theo flow để không làm rớt focus bàn phím.
>    - Không `eslint-disable`, không thêm thư viện mới.
> 5. **An toàn tiến trình (NEVER 14 & 15)**: tự quản lý PID mock/preview/dev do mình mở trên port riêng, tuyệt đối không `pkill` tiến trình của người khác. Kiểm tra trên bản build preview (`npm run build` + `npx vite preview`) hoặc bản `git archive` / working tree sạch với mock riêng, dừng sạch tiến trình sau khi kiểm xong.
>
> ---
>
> ## 1. Chi tiết 4 phần việc cần thực hiện (theo đúng thứ tự nhỏ, tách từng phần)
>
> ### Việc 1 — Follow-up từ re-review PR #6 (`AI-LOG.md:2373-2380`)
> 1. **Sửa thứ tự DOM/Tab ở `360px` trên `/quan-ly/hoi-thoai/:id`**:
>    - Vấn đề hiện tại: commit `aadf87d` dùng CSS `order: 1 / 2 / 3` ở `@media (max-width: 767px)` để đẩy `.admin-chat` và `.admin-inspector` lên trên `.admin-convs`, nhưng thứ tự DOM vẫn là `AdminConversationList` -> `AdminChatWindow` -> `AdminInspector`. Khi nhấn Tab ở `360px`, focus nhảy từ header xuống tận `y≈1700` (danh sách), đi hết 10 điểm dừng rồi mới vòng ngược lên `chat-back-link` ở `y=239` (vi phạm WCAG 2.4.3 / 1.3.2).
>    - Cách sửa chuẩn:
>      - Trong `client/src/pages/QuanLy.jsx`, dùng `useMediaQuery('(max-width: 767px)')`. Khi đang ở mobile (`<= 767px`) **và** có `routeConvId` (`/quan-ly/hoi-thoai/:id`), render các cột theo **đúng thứ tự DOM thật**: `<AdminChatWindow>` → `<AdminInspector>` → `<AdminConversationList>`. Khi ở `/quan-ly` hoặc `>= 768px`, giữ nguyên DOM: `<AdminConversationList>` → `<AdminChatWindow>` → `<AdminInspector>`.
>      - Bỏ CSS `order: 1 / 2 / 3` trong `client/src/styles/admin.css` (giữ `max-height: 75dvh` cho `.admin-chat` khi cần và giữ `.chat-back-link` chỉ hiện `< 768px`).
>      - **Chú ý cực kỳ quan trọng về Heading**: Hiện tại `<h1>` (`Hội thoại`) nằm trong `AdminConversationList.jsx` còn `<h2>` nằm trong `AdminChatWindow.jsx`. Nếu đổi thứ tự DOM đưa `AdminChatWindow` lên trước mà vẫn giữ `<h2>` trước `<h1>` sẽ bị lỗi thứ tự heading (`<h2>` trước `<h1>`)! Do đó hãy truyền prop (ví dụ `isPrimaryHeading`) để khi `chatFirst` ở `360px`, tiêu đề đầu trang trong khối đầu tiên là `<h1>` duy nhất (ví dụ tên khách hàng ở `.chat-window-name` là `<h1>` và tiêu đề `Hội thoại` trong `AdminConversationList` chuyển thành `<h2>`), đảm bảo vừa đúng `1` `<h1>`, vừa không bao giờ có `<h2>` đứng trước `<h1>` ở mọi kích thước!
> 2. **Sửa ký hiệu `"..."` → `…` trong ví dụ `GS-1025` ở `docs/api/05-bookings.md`**:
>    - Tại dòng ~409 trong khối `json` minh họa `GS-1025` (`"depositPaidAt": "..."`), đổi `"..."` thành `…` (hoặc giữ nhất quán với quy ước của các file `docs/api/*.md`, kiểm tra `npm test` + `node tools/contract-check.mjs --strict-values` vẫn đạt `148/148`, `38/38`).
>
> ---
>
> ### Việc 2 — Bước G7 (Customer): `/lich-chup`, `/thanh-toan/:paymentId`, `/thanh-toan/:paymentId/ket-qua`
> Khớp ảnh chụp giao diện mẫu (theme tối `cinema` trong `CustomerLayout`) và nối toàn bộ lên API (`05-bookings.md`, `06-payments.md`, `07-reminders.md`):
>
> 1. **`/lich-chup` (`client/src/pages/LichChup.jsx`, bỏ hẳn `data.js`)**:
>    - Load song song 3 API (`1` request mỗi tài nguyên): `GET /api/bookings`, `GET /api/reminders`, `GET /api/payments`. Hỗ trợ đầy đủ Loading, Error + *Thử lại* không reload trang, và Empty state (khi khách chưa có booking nào như `linh` lúc đầu → hiện `EmptyState` + `<Link to="/tu-van">Hội thoại với studio</Link>`).
>    - **Chọn booking khi khách có nhiều booking** (ví dụ `customer2` có `GS-1022` và `GS-1020`): hiển thị bộ chọn booking (dùng `<button type="button" aria-pressed>` cao `>= 44px`, lưu lựa chọn trong React state, mặc định chọn booking đầu tiên/mới nhất `bookings[0]`). Không đưa `bookingId` lên URL query hay `localStorage`.
>    - **Bố cục 2 cột `.schedule-layout` như ảnh**:
>      - Cột trái `.schedule-main`:
>        - `WeekCalendar` tính **động hoàn toàn** từ `booking.date` (dùng `weekDates`, `vnPeriodTitle`, `vnWeekday`, `vnShortDate` từ `utils/date.js` — không hardcode `24/10` hay `GS-1024`): hiển thị tiêu đề tuần (`Tuần 19–25/10/2026`), dải 7 ngày `T2–CN` với ô ngày chụp highlight viền `--accent` + icon kim cương, dòng `Thứ ... DD/MM · Ngày chụp <id>`, thanh `.day-bar` (`08:00–18:00`) vẽ block makeup (nếu có) và shoot, cùng danh sách `.day-agenda` dễ đọc. (Nếu booking ở trạng thái `Đã hủy`, đánh dấu rõ bằng nhãn/icon, không dựa vào màu đơn thuần).
>        - **Khu vực Nhắc lịch (`ReminderList`)** ngay dưới lịch tuần từ `GET /api/reminders` (lọc theo `booking.id` đang xem): hiển thị thời điểm nhắc (`dueAt` qua `formatMoment`), mốc (`Trước <hoursBefore> giờ`), kênh (`Trong tài khoản`, `E-mail`), trạng thái e-mail (`Chờ gửi` / `Đã gửi` kèm `emailSentAt` nếu có), và nội dung `message`. Nếu booking chưa có nhắc lịch (vd `Chờ cọc 30%`, `Đã hủy`, `MOCK_MODE=empty`), hiển thị ghi chú rõ ràng.
>      - Cột phải `.schedule-side`:
>        - `BookingSummary`: tiêu đề `Buổi chụp <booking.id>`, `StatusBadge` phản ánh đúng 4 trạng thái (`Chờ cọc 30%` → `Đã thống nhất lịch · Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`, `Đã hủy`), đủ các dòng `Mã booking`, `Buổi chụp` (+ số người nếu cần), `Gói` (kèm thời lượng/số ảnh chỉnh nếu API trả non-null), `Dịch vụ thêm` (nếu có), `Ngày`, `Makeup` (ẩn/ghi rõ nếu `null`), `Chụp`, `Tổng gói`.
>        - `DepositCard` / Thẻ thanh toán: hiển thị `Cọc 30%` (chữ lớn `--font-display` `--accent`), `Còn lại sau cọc`, `Tổng gói` từ `booking.pricing`, lịch sử giao dịch của booking (từ `GET /api/payments`), và hành động tương ứng từng trạng thái:
>          - **`Chờ cọc 30%` + `depositStatus === 'unpaid'`**: nếu lần cọc trước bị `failed`, hiển thị nguyên nhân (`payment.message`); nếu có giao dịch `pending`, hiện link tiếp tục tới `/thanh-toan/:paymentId`; nút chính `Thanh toán cọc 30%` (hoặc `Thử thanh toán lại cọc 30%`) gọi `POST /api/payments` `{ bookingId: booking.id, kind: 'deposit' }` qua `useAction` rồi `navigate(\`/thanh-toan/${payment.id}\`)` (hiển thị lỗi inline nếu API trả `409`).
>          - **`Chờ cọc 30%` + `depositStatus === 'paid'`** (trường hợp 2 khách đặt trùng lịch đồng thời theo `06-payments.md` rule 3): khóa thanh toán lại, hiện cảnh báo rõ ràng lý do từ payment `succeeded` + link `<Link to="/tu-van">Nhắn với studio</Link>` để studio đổi lịch hoặc hoàn tiền ngoài hệ thống.
>          - **`Đã đặt lịch`**: hiện xác nhận đã cọc + thời điểm; nút/link chính sang **G9** `<Link className="btn btn-primary" to={/lich-chup/${booking.id}/anh}>` (`Chọn ảnh & thanh toán 70%` hoặc `Nhận ảnh buổi chụp` nếu đã trả 70%).
>          - **`Hoàn thành`**: xác nhận hoàn tất + link mở `booking.fileLink` (nếu có) + link xem lại `/lich-chup/${booking.id}/anh`.
>          - **`Đã hủy`**: thông báo đã hủy và giải phóng lịch.
>
> 2. **`/thanh-toan/:paymentId` (`PaymentGateway.jsx`) & `/thanh-toan/:paymentId/ket-qua` (`PaymentResult.jsx`)**:
>    - Gắn cả 2 route vào `client/src/App.jsx` bên trong `<RequireRole roles={['customer']}>` + `<CustomerLayout>` (thay `ComingSoon` ở `/thanh-toan/:paymentId`). Dùng chung cho **cả cọc 30% (G7) lẫn thanh toán 70% còn lại (G9 từ `Gallery.jsx`)**.
>    - `/thanh-toan/:paymentId`: load `GET /api/payments/${paymentId}` (và `GET /api/bookings/${payment.bookingId}`). Gắn nhãn thật rõ **"Cổng thanh toán thử nghiệm"** (không trừ tiền thật). Hiển thị mã giao dịch, booking, loại (`Cọc 30%` / `70% còn lại`), số tiền (`formatVND`).
>      - Nếu `payment.status === 'pending'`: có 2 nút dùng `useAction` (`aria-disabled` khi bận): **`Thanh toán thành công`** (`POST /api/payments/${paymentId}/result` `{ result: 'success' }`) và **`Mô phỏng thanh toán thất bại`** (`{ result: 'fail' }`) → chuyển hướng sang `/thanh-toan/${paymentId}/ket-qua`.
>      - Nếu `payment.status !== 'pending'` (mở lại link đã xử lý): không cho bấm gây `409`, dẫn sang `/thanh-toan/${paymentId}/ket-qua` và `/lich-chup`.
>    - `/thanh-toan/:paymentId/ket-qua`: **hoạt động độc lập khi mở trực tiếp hoặc F5 reload** (luôn fetch `GET /api/payments/${paymentId}` + `GET /api/bookings/${payment.bookingId}`):
>      - Thành công và giữ lịch (`succeeded` + `Đã đặt lịch` hoặc `remainder`): hộp thành công (`--free`), hiển thị `payment.message`, badge booking, link `<Link to="/lich-chup">Về Lịch chụp của tôi</Link>` (và nếu là `remainder`, nút chính `<Link to={/lich-chup/${payment.bookingId}/anh}>Quay lại để Nhận ảnh</Link>`).
>      - Thành công tiền cọc nhưng trùng lịch (`succeeded` + `deposit` + `booking.status === 'Chờ cọc 30%'`): hộp cảnh báo giữ trạng thái `Chờ cọc 30%`, in rõ `payment.message`, link về `/lich-chup` và `/tu-van`.
>      - Thất bại (`failed`): hộp lỗi (`--danger`), in `payment.message` (`"Thanh toán không thành công, booking vẫn chờ cọc."` hoặc 70%), xác nhận booking giữ nguyên trạng thái, nút **`Thử thanh toán lại`** gọi `POST /api/payments` `{ bookingId: payment.bookingId, kind: payment.kind }` → sang `/thanh-toan/${newPay.id}`, kèm link quay lại `/lich-chup` (hoặc `/lich-chup/${payment.bookingId}/anh` cho `remainder`).
>
> ---
>
> ### Việc 3 — Bước G8 (Staff): `/cong-viec` (`CongViec.jsx`)
> Thay `<ComingSoon title="Việc của tôi" step="G8" />` trong `client/src/App.jsx` bằng màn hình thật cho role `staff`, dùng `<AdminLayout>` (theme sáng `studio`, lưu ý **không** hiển thị link điều hướng của Admin như `/quan-ly` hoặc `/quan-ly/booking` cho role `staff`).
>
> 1. **Danh sách công việc (`GET /api/jobs`)**:
>    - Lưu ý hợp đồng `05-bookings.md` & `08-jobs.md`: **Staff KHÔNG có quyền gọi `GET /api/bookings/:id` (sẽ bị `403`)**! Mọi thông tin công việc lấy từ `GET /api/jobs`, còn ảnh xem trước của booking lấy từ `GET /api/bookings/:bookingId/previews` (endpoint này cho phép staff được gán).
>    - Hiển thị Loading / Error + Retry / Empty state (`"Bạn chưa có công việc nào được phân công."`).
>    - Hỗ trợ lọc nhanh theo trạng thái (`Tất cả`, `Chưa bắt đầu`, `Đang làm`, `Hoàn thành`) tính trực tiếp từ danh sách (không lưu danh sách lọc vào `useState`).
>    - Mỗi công việc hiển thị đủ **Khi nào / Ở đâu / Làm gì**:
>      - Ngày (`vnWeekdayAndDate(job.date)`), giờ (`job.from–job.to`, `tabular-nums`)
>      - Địa điểm (`job.roomName || 'Tại studio (không dùng phòng chụp)'`)
>      - Vai trò & gói (`job.title`, mã `job.bookingId`, khách hàng `job.customerName`, số người `job.people`, dịch vụ thêm `job.extras` kèm mẫu & size trang phục nếu có)
>      - `StatusBadge` trạng thái công việc (`Chưa bắt đầu`, `Đang làm`, `Hoàn thành`).
>
> 2. **Cập nhật trạng thái công việc (`PATCH /api/jobs/:id`)**:
>    - Cho phép chuyển giữa 3 trạng thái chính xác: `Chưa bắt đầu`, `Đang làm`, `Hoàn thành` (chỉ có 1 yêu cầu gửi tại một thời điểm trên mỗi job hoặc hành động, giữ focus bàn phím, cập nhật ngay từ response `200`, hiển thị thông báo `role="status"` và nêu rõ theo quyết định PO rằng đổi trạng thái công việc không tự đổi trạng thái booking).
>
> 3. **Xem trước & Tải ảnh xem trước lên booking (`GET /api/bookings/:id/previews`, `POST /api/bookings/:id/previews`, `GET /api/previews/:id`)**:
>    - Nhóm hoặc cung cấp khu vực "Ảnh xem trước" theo từng `bookingId` duy nhất mà nhân viên được phân công (tránh gọi trùng `GET /api/bookings/:id/previews` nhiều lần nếu nhân viên có > 1 job cùng booking).
>    - **Tải ảnh hiển thị bằng Bearer token**: tái sử dụng **`client/src/components/PreviewImage.jsx`** (đã dùng `apiBlob` + `URL.createObjectURL` + cleanup `revokeObjectURL` tránh `401` khi dùng `<img src>` trần).
>    - **Form upload ảnh (`multipart/form-data`, field name `file`)**:
>      - `<input type="file" accept="image/jpeg,image/png,image/webp">` có `<label>` rõ ràng.
>      - **Kiểm tra trước khi gửi (client-side validation)**:
>        - Chưa chọn file hoặc file rỗng (`size === 0`) → `"Chọn ảnh xem trước."`
>        - Sai MIME type (không thuộc `image/jpeg`, `image/png`, `image/webp`) → `"Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP."`
>        - Quá `5 MB` (`> 5 * 1024 * 1024` bytes) → `"Ảnh xem trước tối đa 5 MB."`
>      - Khi hợp lệ: gửi `FormData` (`formData.append('file', file)`) qua `api(\`/bookings/${bookingId}/previews\`, { method: 'POST', body: formData })`.
>      - Thành công (`201`): chèn ngay preview mới trả về vào danh sách đang hiển thị (không reload trang), reset input file, thông báo `role="status"`.
>      - Xử lý lỗi `400`, `403`, `409` (`Chỉ tải ảnh xem trước cho booking đã đặt lịch.`), `413` từ API hiển thị rõ dưới form.
>
> ---
>
> ### Việc 4 — Bước G10 (Admin): `/quan-ly/booking` và `/quan-ly/booking/:id`
> Thay 2 route `ComingSoon` ở `client/src/App.jsx` bằng 2 màn hình hoàn chỉnh cho role `admin`.
>
> 1. **Cập nhật thanh điều hướng Admin (`AdminLayout.jsx`)**:
>    - Sửa bug `isConvRoute = pathname.startsWith('/quan-ly')` (đang tô active nhầm mục `Hội thoại` khi vào `/quan-ly/booking*`): đổi thành chỉ active `Hội thoại` ở `/quan-ly` và `/quan-ly/hoi-thoai/*`.
>    - Thêm liên kết **`Booking`** (`/quan-ly/booking`) vào header của Admin (chỉ hiển thị cho role `admin`, không hiện trên `/cong-viec` của staff hay `/quan-tri` của superadmin) để chuyển qua lại mượt giữa `Hội thoại` (`/quan-ly`) và `Booking` (`/quan-ly/booking`), đồng thời ăn khớp với các `<Link to={/quan-ly/booking/${booking.id}}>` đã có sẵn trong `AdminBookingForm.jsx` và `InvoicePanel.jsx`!
>
> 2. **Màn hình danh sách `/quan-ly/booking` (`QuanLyBookings.jsx`)**:
>    - Gọi `GET /api/bookings`. Loading / Error + Retry / Empty state đầy đủ.
>    - Bộ lọc kết hợp (tính từ state/data, không lưu list lọc trong `useState`):
>      - Theo **trạng thái booking**: `Tất cả`, `Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`, `Đã hủy`.
>      - Theo **trạng thái thanh toán**: `Tất cả`, `Chưa cọc`, `Đã cọc · Chờ 70%`, `Đã thanh toán đủ`, `Cọc trùng lịch chờ xử lý` (`status === 'Chờ cọc 30%' && payment.depositStatus === 'paid'`).
>      - Ô tìm kiếm nhanh theo mã booking (`GS-...`) hoặc tên khách (có `<label>`).
>    - Mỗi booking hiển thị: mã `GS-...`, tên khách, dịch vụ & gói, ngày & giờ makeup/chụp + phòng, `StatusBadge` trạng thái booking, tóm tắt thanh toán (`formatVND(total)` / cọc 30% / 70% còn lại + badge trạng thái thanh toán), trạng thái `fileLink` (đã gắn / chưa gắn), và link `<Link to={/quan-ly/booking/${b.id}}>Chi tiết & quản lý</Link>`.
>
> 3. **Màn hình chi tiết `/quan-ly/booking/:id` (`QuanLyBookingDetail.jsx`)**:
>    - Load `GET /api/bookings/${id}`, `GET /api/staff`, `GET /api/rooms`, `GET /api/extras`, và `GET /api/payments?bookingId=${id}` (kèm link quay lại `<Link to="/quan-ly/booking">‹ Tất cả booking</Link>` và nếu `booking.conversationId` có giá trị thì thêm `<Link to={/quan-ly/hoi-thoai/${booking.conversationId}}>Mở hội thoại</Link>`).
>    - Hiển thị đầy đủ thông tin booking, bảng chi phí `PriceSummary`, và lịch sử thanh toán (kèm `payment.message` nếu có).
>    - **Banner đặc biệt cho case Recovery (`booking.status === 'Chờ cọc 30%' && booking.payment.depositStatus === 'paid'`)**:
>      - Giải thích rõ: khách đã thanh toán cọc 30%, nhưng slot cũ vừa bị giữ trước nên booking chưa giữ lịch; khi Admin đổi sang khung giờ trống mới và lưu (`PATCH /api/bookings/:id`), hệ thống sẽ tự chuyển booking sang **`Đã đặt lịch`**, giữ tài nguyên và tạo nhắc lịch + công việc nhân viên.
>    - **Form đổi lịch & cập nhật thông tin (`PATCH /api/bookings/:id` + `POST /api/schedule/check` với `excludeBookingId: booking.id`)**:
>      - Cho phép chỉnh: `date` (`DatePicker`), `makeup` (bật/tắt + `from`/`to`/`staffId`), `shoot` (`from`/`to`/`staffId`/`roomId`), `people` (`1–200`, gợi ý rõ với gói tính theo người như `Kỷ yếu lớp`), `sessionType` (`1–100` ký tự), `extras` (kèm mẫu & size nếu thuê trang phục).
>      - Nút **`Kiểm tra lịch trống`** gọi `POST /api/schedule/check` **có gửi `excludeBookingId: booking.id`** (để không tự đụng chính block của booking mình!), hiển thị banner xanh/đỏ + nút chọn nhanh giờ trống `freeTime` nếu API trả về.
>      - Nút **`Lưu thay đổi`** gọi `PATCH /api/bookings/:id`:
>        - Nếu không thay đổi gì hoặc gửi rỗng → hiển thị thông báo rõ (từ validate hoặc API `"Chọn thông tin cần thay đổi."`).
>        - Hiển thị đầy đủ lỗi `400` theo từng trường (`fields`) và lỗi `409` (trùng lịch kèm `freeTime`, `total < deposit`, hoặc đã thanh toán đủ 70% không thể đổi `people`).
>        - Cập nhật toàn bộ UI ngay từ response `200` (thấy ngay chuyển từ `Chờ cọc 30%` → `Đã đặt lịch` trong case recovery!).
>      - Khi booking là `Hoàn thành` hoặc `Đã hủy`: khóa form đổi lịch/cập nhật với thông báo giải thích rõ.
>    - **Form gắn link ảnh cuối (`PUT /api/bookings/:id/file-link`)**:
>      - Input URL có `<label>` rõ ràng, validate `http://` / `https://` (`1–500` ký tự, khớp thông báo `"Nhập đường dẫn file hợp lệ (http:// hoặc https://)."`).
>      - Chỉ hoạt động khi `booking.status === 'Đã đặt lịch'`; ở các trạng thái khác sử dụng `aria-disabled="true"` kèm ghi chú rõ `"Chỉ gắn link file ảnh cho booking đã đặt lịch."`.
>      - Lưu thành công (`200`) cập nhật `booking.fileLink` tại chỗ và báo `role="status"`.
>    - **Hủy booking (`POST /api/bookings/:id/cancel`)**:
>      - Chỉ khả dụng khi `booking.status === 'Chờ cọc 30%'` hoặc `'Đã đặt lịch'` (khóa bằng `aria-disabled` + ghi chú khi `Hoàn thành` hoặc `Đã hủy`).
>      - Có bước xác nhận 2 lần (mở hộp xác nhận nội tuyến, không hủy nhầm 1 click), ô nhập lý do hủy tùy chọn (`0–500` ký tự), và nếu `depositStatus === 'paid'` thì nhắc rõ tiền cọc đã thu vẫn được giữ lại trên hồ sơ để studio hoàn ngoài hệ thống.
>      - Lưu thành công (`200`) cập nhật trạng thái sang `Đã hủy` ngay tại chỗ.
>
> 5. **Cập nhật `FRONTEND.md`**:
>    - Chuyển toàn bộ các route G7 (`/lich-chup`, `/thanh-toan/:paymentId`, `/thanh-toan/:paymentId/ket-qua`), G8 (`/cong-viec`), G10 (`/quan-ly/booking`, `/quan-ly/booking/:id`) lên bảng route đã dựng ở mục 4 kèm đúng danh sách endpoints gọi thực tế, và cập nhật mục 7 (*Not done* — mọi bước G1–G11 đã hoàn thiện trên API).
>
> ---
>
> ## 2. Điều phối 2 Worker & Vòng lặp đồng thuận (Consensus Loop)
>
> Thực hiện theo đúng mô hình 2 worker độc lập phối hợp vòng lặp:
>
> ### Worker 1 — Implementer & Gate Tester
> 1. Làm lần lượt theo 4 phần việc (Việc 1 → Việc 2 → Việc 3 → Việc 4), chia component gọn gàng theo chuẩn codebase (`client/src/pages/`, `client/src/components/`, `client/src/styles/`).
> 2. Tự rà soát toàn bộ `CLAUDE.md` NEVER list, kiểm tra không có `staff` gọi `GET /api/bookings/:id`, không thiếu cleanup `useEffect`/objectURL, không inline style sai quy định.
> 3. Chạy đầy đủ 4 gates từ thư mục gốc `/gradstudio-pa2`:
>    - `npm run format:check`
>    - `npm run lint`
>    - `npm test`
>    - `npm run build`
>    - `node tools/contract-check.mjs --strict-values` (trên mock test riêng nếu cần)
> 4. Chỉ bàn giao cho Worker 2 khi tất cả gates trên đều PASS 100%, 0 warning.
>
> ### Worker 2 — Visual & E2E Verifier (bằng `web_tools` + Playwright)
> Khởi động mock + `npx vite preview` trên port riêng (quản lý PID chặt chẽ, tắt đúng PID tự mở khi xong). Chạy Playwright + `web_tools` kiểm tra ở cả **`1280×800`**, **`768×1024`**, **`360×800`** trên các checklist bắt buộc sau:
>
> 1. **Kiểm tra Việc 1 (Follow-up PR #6)**:
>    - Đăng nhập `thao`, mở `/quan-ly/hoi-thoai/c-uyen` ở **`360×800`**:
>      - Kiểm tra visual `.admin-chat` nằm trên `.admin-convs`.
>      - **Bắt buộc test chuỗi phím `Tab` thực tế**: xác nhận thứ tự tọa độ `y` của các phần tử nhận focus từ Header → `.chat-back-link` / vùng Chat → Inspector → danh sách Hội thoại **tăng dần tự nhiên theo thứ tự hiển thị, KHÔNG nhảy xuống `y≈1700` rồi quay ngược lên `y≈239`!**
>      - Kiểm tra `h1` có đúng 1 thẻ và không có `h2` nào xuất hiện trước `h1` trong DOM ở cả `360px`, `768px`, `1280px`.
>    - Kiểm tra `docs/api/05-bookings.md` chỗ `GS-1025` đã đổi `"..."` → `…`.
>
> 2. **Kiểm tra Việc 2 (G7 + đối chiếu ảnh mẫu + G9)**:
>    - `linh` khi chưa có booking: `/lich-chup` hiện `EmptyState`.
>    - Tạo `GS-1024` qua flow G3→G5→G6 (`linh` hỏi 24/10 `09:00` → `thao` đề xuất `14:00` → `linh` đồng ý → `thao` tạo booking).
>    - `linh` mở `/lich-chup`: **chụp screenshot ở 1280px, 768px, 360px và đối chiếu trực tiếp với ảnh mẫu đính kèm** (theme tối cinema, bố cục 2 cột desktop / 1 cột mobile, `Tuần 19–25/10/2026`, T7 `24` highlight + kim cương, thanh bar + agenda `13:00–14:00` & `14:00–16:00`, `Buổi chụp GS-1024`, `540.000đ` nổi bật, `1.260.000đ`, `1.800.000đ`, nút `Thanh toán cọc 30%` hoạt động).
>    - Bấm `Thanh toán cọc 30%` → `/thanh-toan/:paymentId` → test **Thất bại** → `/thanh-toan/:paymentId/ket-qua` → F5 reload giữ nguyên lỗi `"Thanh toán không thành công, booking vẫn chờ cọc."` → quay lại `/lich-chup` vẫn `Chờ cọc 30%` + hiện lịch sử thất bại.
>    - Bấm **Thử thanh toán lại** → test **Thành công** → `/ket-qua` báo giữ lịch thành công → quay lại `/lich-chup` xác nhận `GS-1024` chuyển `Đã đặt lịch`, có link sang `/lich-chup/GS-1024/anh`, và mục **Nhắc lịch** hiện `rem-gs-1024` (`13:00, 23/10/2026`, `Trong tài khoản` + `E-mail`, `Chờ gửi`, nội dung đầy đủ).
>    - `customer2` mở `/lich-chup`: đổi giữa `GS-1022` và `GS-1020`, xác nhận lịch tuần & thông tin đổi tương ứng; đi tiếp sang `/lich-chup/GS-1022/anh` chọn ảnh → bấm `Thanh toán 70%` → đi qua `/thanh-toan/:paymentId` (`1.260.000đ`) & `/ket-qua` → quay lại `/lich-chup/GS-1022/anh` (luồng G9 nối G7).
>
> 3. **Kiểm tra Việc 3 (G8 — `/cong-viec`)**:
>    - Đăng nhập `mai` (`mai-demo`), `tuan` (`tuan-demo`), `staff3` (`staff3-demo`) kiểm tra `/cong-viec`:
>      - `mai` thấy job `GS-1024` makeup (`13:00–14:00`) & `GS-1023`; `tuan` thấy `GS-1024` chụp (`14:00–16:00`, `Phòng B`) & `GS-1022`; `staff3` thấy `GS-1022` edit (`Đang làm`). Xác nhận không có request nào gọi `GET /api/bookings/:id` bị `403`.
>      - Cập nhật trạng thái job (`Chưa bắt đầu` → `Đang làm` → `Hoàn thành`), F5 reload kiểm tra dữ liệu lưu từ mock.
>      - Test upload preview trên `GS-1024` / `GS-1022`: thử file `.txt` (chặn client báo `"Chỉ chấp nhận ảnh JPEG, PNG hoặc WebP."`), thử file `> 5 MB` (chặn client báo `"Ảnh xem trước tối đa 5 MB."`), thử ảnh PNG/WebP hợp lệ → upload `201`, ảnh hiển thị ngay qua `<PreviewImage>` (tải `/api/previews/:id` với Bearer token -> `blob:` URL, `naturalWidth > 0`, 0 lỗi `401`).
>    - Đăng nhập `linh` kiểm tra `/cong-viec` bị chặn quyền đúng chuẩn.
>
> 4. **Kiểm tra Việc 4 (G10 — `/quan-ly/booking` & `/quan-ly/booking/:id`)**:
>    - Đăng nhập `thao`: điều hướng từ header `Hội thoại` ↔ `Booking` kiểm tra `aria-current="page"` sáng đúng từng trang.
>    - Tại `/quan-ly/booking`: lọc theo trạng thái booking (`Chờ cọc 30%`, `Đã đặt lịch`, `Hoàn thành`, `Đã hủy`), lọc theo thanh toán, tìm theo mã/tên.
>    - Tại `/quan-ly/booking/GS-1024`:
>      - Thử đổi giờ sang `08:00–12:00` ngày `2026-10-24` với `Mai` → `Kiểm tra lịch trống` (có `excludeBookingId: "GS-1024"`) báo trùng `GS-1023`, gợi ý `freeTime`; thử đổi sang khung trống khác (vd `2026-10-25` hoặc giờ trống) → `PATCH` thành công `200`, UI cập nhật ngay.
>      - Thử `PUT /file-link` URL sai `"khong-phai-link"` → báo lỗi validation; nhập `https://drive.gradstudio.test/gs-1024-final` → lưu thành công `200`.
>      - Kiểm tra **recovery booking `Chờ cọc 30%` + `depositStatus: "paid"`** (tạo 2 booking trùng nhau hoặc test qua kịch bản concurrent deposit của `06-payments.md`): mở chi tiết booking thua race, xác nhận hiện banner recovery, đổi sang giờ trống và lưu → booking tự chuyển sang **`Đã đặt lịch`**!
>      - Kiểm tra `POST /cancel` trên một booking có thể hủy (có hộp xác nhận 2 bước, nhập lý do) → chuyển sang **`Đã hủy`**, các form chỉnh sửa & gắn link bị khóa với lý do rõ ràng.
>      - Kiểm tra `GS-1021` (`Hoàn thành`) khóa sửa/hủy/gắn link đúng contract.
>    - Kiểm tra cả **G9 end-to-end sau G10**: với `GS-1022` (đã chọn ảnh + trả 70% + đã gắn `fileLink` ở G10), khách bấm `Nhận ảnh` → booking & hội thoại đều chuyển `Hoàn thành`.
>
> 5. **Kiểm tra 4 `MOCK_MODE` & Accessibility tổng thể**:
>    - Chạy `normal`, `slow`, `error`, `empty` trên `/lich-chup`, `/thanh-toan/:paymentId`, `/thanh-toan/:paymentId/ket-qua`, `/cong-viec`, `/quan-ly/booking`, `/quan-ly/booking/:id` (xác nhận Loading, Error + Retry không reload, Empty state).
>    - Ở cả 3 viewport `1280`, `768`, `360`: `scrollWidth <= clientWidth`, `0` console/page errors, `0` failed requests ở mode `normal`, tap target `>= 44px`, đúng `1` `<h1>`, nhãn đầy đủ, `:focus-visible` rõ ràng.
>
> 6. Trả về báo cáo `PASS / FAIL` chi tiết (kèm screenshot đối chiếu, vị trí DOM/Tab, lỗi console/API nếu có) cho Worker 1.
>
> ### Điều kiện kết thúc vòng lặp (Đồng thuận cả 2 Worker)
> - Mọi mục `FAIL` mà Worker 2 phát hiện (từ Thứ tự Tab 360px, đối chiếu ảnh G7, upload/Bearer preview G8, recovery & guard G10, cho tới slow/error/empty hay responsive 360px) phải được Worker 1 sửa dứt điểm, chạy lại đủ 4 gates (`format:check`, `lint`, `test`, `build`), và chuyển Worker 2 kiểm tra lại (bao gồm regression).
> - Vòng lặp **chỉ kết thúc khi CẢ Worker 1 VÀ Worker 2 cùng tuyên bố `ĐỒNG THUẬN KẾT THÚC`** với 0 lỗi tồn đọng.
>
> Khi đã đồng thuận kết thúc, tắt sạch các tiến trình mock/preview tự mở, **không tự ý `git commit`/`push` hay sửa `AI-LOG.md`/`brief.md`** nếu người dùng chưa yêu cầu, và xuất báo cáo cuối gồm:
> - Danh sách file thay đổi chia rõ theo từng bước (1. Follow-up PR #6, 2. G7, 3. G8, 4. G10, `FRONTEND.md`) để tiện tách từng commit nhỏ
> - Kết quả thực tế của `npm run format:check`, `npm run lint`, `npm test`, `npm run build` và `contract-check.mjs --strict-values`
> - Kết quả đối chiếu Playwright + `web_tools` (Tab order 360px, visual G7 khớp ảnh, E2E G7/G8/G10, recovery case, và 4 `MOCK_MODE`).

> Làm theo đúng flow bạn đề xuất


### 2.24 PR #7 screenshots and review fixes on `feature/pa3-g7-g8-g10` (Khánh, 2026-11-23 – 2026-11-24)

Captured full-page verification screenshots for steps G7, G8, and G10 from an isolated `git archive` copy of `5d362b0`, then addressed Lead An's `CHANGES_REQUESTED` review on PR #7 (`3b3005f`, `24895a2`):

> Sử dụng web_tools + playwright để mở web và screenshots các trang UI của G7, G8, G10 bỏ vào 1 folder cho tôi

> Đã có comment trong pull request trên, fix theo chỉ dẫn rồi comment lên

### 2.25 Reviews of PR #6 and PR #7, then the whole app checked the way the rubric runs it (2026-11-22 – 2026-11-23)

Numbered 2.25 because Khánh's PR #7 adds 2.23 and 2.24.

> check pr cho minfh

> đăng review lên PR #6

> trong review có nhắc việc push nhánh và nên có nhiều commit nhỏ chưa

> kiểm tra lại pr

> nhớ nhắc mình sửa sau, mình sẽ merge luôn

> đã merge PR #6, pull về rồi push

> kiểm tra việc trên repo mới nhất và việc cần làm hôm nay

> check pr #7 cho mình

> đăng review lên PR #7

> nếu chưa hỏi thì làm còn gì khác để làm trước không

> đồng ý, làm việc 1 trước, W3C dùng ngoại tuyến

> đổi user.name

> tiếp tục

### 2.26 Product owners' second round, re-review and merge of PR #7, prompts for another assistant (2026-11-27)

> (four links to the product owners' thread: comment 28852226657809465 and replies 28852825087749622, 28853607607671370, 28854602184238579)
> bạn xem các thông tin trên

> (the questions of team 24120248 - 24120274 - 24120280 and the product owners' two answers, pasted)

> đồng ý, review lại PR #7 trước

> đã merge PR #7, pull về rồi push

> nên chọn cái nào (screenshot of GitHub's merge options)

> đã merge PR #7, pull về rồi push

> cho mình prompt để agent khác với model khác làm, đảm bảo ghi đúng file và trả lời đúng nguyên tắc và rubric, quy định của đề, ghi đúng model commit đúng lượt, ...
> mỗi việc 1 prompt, làm xong mình sẽ báo bạn kiểm tra

### 2.27 Số liệu mọi gói chụp theo product owners (2026-11-27)

Sent to Antigravity (Gemini 4 Carbon (High)).

> Bạn làm việc trong repo nhóm GradStudio tại E:\S1Y4\Web\pj\PA2 (đồ án CSC13008, PA#3: React client trên contract docs/api/ và mock mock/server.mjs). Người giao việc là Ngô Thuận An (23120206), lead. Đây là việc 1 trong 3: số liệu cho mọi gói chụp, theo quyết định của product owners ngày 2026-11-27.
>
> Đọc trước khi làm (bắt buộc)
> CLAUDE.md (luật nhóm, danh sách NEVER), AGENTS.md, brief.md Phần 1, docs/api/README.md, docs/api/02-catalogue.md, FRONTEND.md mục 5.
> Rubric PA#3 chấm: contract commit trước code dùng nó; mock theo đúng contract; mọi thay đổi sau đó của docs/api/ hoặc mock/ có dòng ghi ngày trong ## Changes; AI-LOG.md ghi ngay trong bước, mỗi entry nêu tool và model, yêu cầu, và trong Changed/Rejected nêu lỗi của trợ lý cùng phép kiểm tra đã bắt được nó; lịch sử commit một commit cho mỗi phần, viết commit trước mỗi yêu cầu.
> Quyết định của product owners cần làm theo
> Nguồn (trích dẫn link này): https://www.facebook.com/groups/wad.fit.hcmus/posts/28572365245795609/?comment_id=28852226657809465&reply_comment_id=28852825087749622
>
> Brief chỉ cố định Gói Tốt nghiệp Premium (GS-1024: 2 giờ, 30 ảnh chỉnh, 1.800.000đ). Các gói còn lại nhóm tự đặt, miễn mỗi gói có tên, thời lượng, số ảnh chỉnh và giá, và mỗi dịch vụ có ít nhất một gói. Giá "từ …đ" là giá thấp nhất của dịch vụ. Với Kỷ yếu lớp (từ 350.000đ/người) … nhóm có thể tính giá booking bằng đơn giá mỗi người nhân số người … giá và cọc 30% phải do máy chủ tính (R3), và số ảnh khách được chọn là số ảnh chỉnh của gói (R5).
>
> Nhóm đã chọn (An duyệt): Gói Kỷ yếu lớp ky-yeu-lop: 240 phút, 60 ảnh chỉnh, 350.000đ/người, giá booking = đơn giá × số người (máy chủ đã tính như vậy). Gói Chân dung/CV chan-dung-cv: 60 phút, 10 ảnh chỉnh, 690.000đ. Gói Tốt nghiệp Premium giữ nguyên. Không bịa thêm gói, giá hay số liệu nào khác (NEVER 11).
>
> Việc cần làm, đúng thứ tự, mỗi phần một commit
> Bắt đầu: git status phải sạch, đang ở main đã pull. Tạo nhánh feature/po-2711 từ main. Kiểm tra git config user.name in ra Ngô Thuận An; không đổi cấu hình git. Không push, không mở pull request, không amend, không rebase.
>
> Commit 1 — contract. docs/api/02-catalogue.md: đối tượng Package ghi rõ durationMinutes và editedPhotos là số nguyên (không còn null), priceFrom của dịch vụ là giá thấp nhất trong các gói của nó; sửa các ví dụ cho khớp 2 gói mới; thêm dòng - 2026-11-27 — … vào ## Changes (nêu cái gì đổi, vì sao, kèm link product owners). Việc này làm đổi đúng 2 giá trị của booking GS-1023 trong các ví dụ của docs/api/05-bookings.md (file của Khánh): chỉ được sửa "durationMinutes" và "editedPhotos" của GS-1023 trong các ví dụ đó, và thêm một dòng ## Changes ghi rõ là do thay đổi ở 02-catalogue.md. Nếu thấy cần sửa bất kỳ chỗ nào khác trong file của Khánh (docs/api/04–08, mock/routes/schedule|bookings|payments|reminders|jobs.mjs, các màn G4–G8, G10), dừng lại và báo, không tự sửa. Thêm vào FRONTEND.md mục 5 một dòng cho quyết định này kèm link. Cùng commit này: thêm vào cuối brief.md một mục ### 2.<số kế tiếp sau mục cuối cùng> Số liệu mọi gói chụp theo product owners (2026-11-27), một dòng ghi tool và model đã nhận prompt, rồi toàn bộ prompt này nguyên văn trong blockquote; và một entry AI-LOG.md (mẫu bên dưới).
>
> Commit 2 — mock. mock/data/services.json theo đúng contract. Kèm entry AI-LOG.md.
>
> Commit 3 — client (chỉ khi cần). Tìm mọi chỗ trong client/src đọc durationMinutes / editedPhotos (ví dụ trang chủ G1, cảnh 3D, G9). Màn G1 phải hiện thời lượng và số ảnh chỉnh của cả 3 gói, không hiện null, rỗng hay chữ kiểu "chưa có". Câu dự phòng của G9 khi gói không có số ảnh (limit === null) giữ nguyên. Nếu không cần sửa client thì không tạo commit rỗng; ghi rõ điều đó trong entry của commit 2.
>
> Kiểm tra (NEVER 14, NEVER 15)
> Kiểm tra mỗi commit trên một bản git archive <commit> giải nén vào thư mục tạm riêng, không chạy trong thư mục làm việc chung. Trong bản copy: npm ci ở gốc và ở client/; npm run format:check, npm run lint, npm test, npm run build; mock riêng PORT=3110 node mock/server.mjs, rồi node tools/contract-check.mjs --repo . --base http://localhost:3110 --strict-values: phải 0 FAIL. Nếu cần xem giao diện: npx vite preview --port 4210 --strictPort với một file cấu hình chỉ cho bản copy, proxy /api sang 3110; mở / ở 360, 768 và 1280 px và ở 4 chế độ MOCK_MODE (normal, slow, error, empty). Chỉ dừng những tiến trình chính bạn đã khởi động (theo PID của bạn); không dùng pkill/taskkill theo tên. Không sửa tools/contract-check.mjs, không nới lỏng test hay gate, không thêm thư viện (NEVER 9, 10).
>
> Mẫu entry AI-LOG.md (thêm vào cuối file, không sửa entry cũ)
> ### 2026-11-27 — <bước>: <việc gì>
> Commit: the commit that adds this entry with <các file>.
> Tool: <tên sản phẩm> (<tên model chính xác của bạn>); <các lệnh/kiểm tra đã chạy>.
> Asked for: <yêu cầu, ngắn>.
> Kept: awaiting An's review. <cái gì đã làm, con số kiểm tra: số ví dụ, độ rộng, chế độ mock>.
> Changed: <lỗi của chính bạn và phép kiểm tra nào bắt được nó; nếu không có thì "nothing" kèm các kiểm tra đã chạy>.
> Rejected: <điều đã cân nhắc và bỏ, vì sao>.
> By hand: none.
>
> Ghi đúng tên tool và model của chính bạn; không ghi là model khác. Tài liệu trong repo viết tiếng Anh; chữ trên màn hình tiếng Việt. Commit message tiếng Anh, nói rõ đổi gì, không có dòng Co-Authored-By hay "Generated with" (NEVER 13).
>
> Khi xong
> Dừng lại và báo An: danh sách commit (hash, message), file đã đổi, kết quả từng kiểm tra kèm con số, những gì bạn làm sai và đã sửa, và mọi chỗ bạn phải dừng hoặc còn thắc mắc. Không làm sang việc 2.
