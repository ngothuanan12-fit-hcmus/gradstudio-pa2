# PROTOTYPE — GradStudio (PA#2)

## Team

- Ngô Thuận An, 23120206
- Nguyễn Hữu Khánh, 24120340

## How to open it

Built with React and Vite. The built `dist/` folder is in this zip, so open it through a local static server with JavaScript on. No network connection is needed: fonts, styles, the 3D code and the photos are all inside `dist/`.

```bash
npm ci
npx vite preview
```

Then open each path directly. They are relative to the root of `dist/`:

- `index.html`
- `quan-ly.html`
- `lich-chup.html`

To build `dist/` again after a change: `npm ci`, then `npm run build`.

## Screens

Each page opens straight into its own state, as the GradStudio brief asks.

| Path | GradStudio screen | What the user does there | Links open |
|---|---|---|---|
| `index.html` | Screen 1, Services and chat (customer) | Linh walks into the classroom story, sees the three services and their prices, asks about one (on its card or with the quick choice beside the chat), and reads the process and the chat | "Nhân viên studio: mở cuộc trò chuyện này", in a strip above the footer → `quan-ly.html`; menu → `lich-chup.html`; "Xem gói chụp" and "Chat với studio" move within the page |
| `quan-ly.html` | Screen 2, Advice and clash handling (Admin) | Admin Thảo opens the moment after Linh agrees: the conversation *Đã chốt lịch*, and in the chat a booking card with 14:00 chosen, *Tạo booking* enabled and a note that 09:00 clashed because Mai is busy 08:00–12:00. Search and the status filter work; the card can fold to one line; choosing 09:00 brings the clash back and moves Linh's blocks on the resource calendar, where the suggested 14:00 sets it right again | "Tạo booking GS-1024 · Khách hàng: mở lịch chụp" → `lich-chup.html`; header links "Hội thoại", "Booking mới", "Lịch tài nguyên" move within the page |
| `lich-chup.html` | Screen 3, Review the appointment and pay the deposit (customer) | Linh opens GS-1024 waiting for the 30% deposit: the booking card and the deposit (540.000đ, 1.260.000đ left), the week 19–25/10 with Saturday 24/10 marked, and the day with the 09:00 first asked for struck through, make-up 13:00–14:00 with Mai and the shoot 14:00–16:00 with Tuấn in Phòng B | Menu → `index.html`; the deposit button is disabled with a note |

## Changed since PA#1

Compared with the PA#1 screens in `docs/pa1/` (the class baseline, made by another team). Reasons: the GradStudio brief and its *Fix these* list, the PA#2 rubric, the lecturer's remarks, and what fits at 360 px.

| Screen | In PA#1 | In our pages | Why |
|---|---|---|---|
| All | *Màn 1 / Màn 2 / Màn 3* buttons and *Đặt lại demo* | Removed. Pages are joined by real links that say who continues | The brief forbids demo controls; PA#2 moves along the flow by `<a href>` or a form `action` |
| All | One light theme | Dark theme on the customer pages, light on the management page | Our own design; both pass 4.5:1, and the colour tells whose side of the flow a page is on |
| All | Signed-in avatar ("Linh", "Thảo") in the header | No avatar; the management header names the role, "Quản lý studio · Thảo" | PA#2 has no sign-in, so an avatar would suggest an account that does not exist |
| 1 | Full-screen photo of students, title "Lưu lại ngày ra trường theo cách của bạn" | From 768 px a 3D walk into a classroom whose board holds the three services; on phones a plain classroom photo; title "Lưu lại ngày ra trường" | Shows the services as one journey; a 3D scene does not suit 360 px or a slow connection. We do not reuse PA#1's photos |
| 1 | Chat in a box floating in the corner, which can shrink | A chat section of the page, always open, with quick package choices and "Nên kể cho studio" beside it | A floating box covers content at 360 px (*Fix these*); the page must show Linh's question when it opens |
| 1 | Service cards side by side | A turntable that shows one package at a time, with "‹ Gói trước" and "Gói sau ›" buttons and the arrow keys | The packages serve different needs, so they are not compared side by side; one large card reads better at 360 px |
| 1 | Studio replies "Để mình kiểm tra lịch cho bạn nhé"; the send button works in the demo | "Dạ để studio kiểm tra lịch thợ makeup, thợ chụp và phòng rồi báo lại ạ."; *Gửi* is disabled with a note | Our writing rule 5 (the studio is "studio", not "mình"); sending has no next page in PA#2 |
| 1 | No process section in the first view | Five steps, ending with the deposit that holds the slot | The brief's main flow; the slot is never promised early |
| 2 | Three columns, each with its own scrolling | Conversations and chat side by side from 1280 px, the resource calendar below; one page scroll, no inner scrolling column | The brief asks the chat and the whole form to be readable by scrolling the page at every width |
| 2 | Opens before Linh agrees: 09:00 clashes, *Tạo booking* disabled | Opens just after Linh agrees: 14:00 chosen, *Đã chốt lịch*, *Tạo booking* enabled, a note that 09:00 clashed because Mai is busy 08:00–12:00 | The brief's state for this page; choosing 09:00 in the card still shows the clash |
| 2 | *Booking mới* form below the chat | A booking card inside the chat, right after Linh agrees; it can fold to one line | The manager fills it in where the details were agreed |
| 2 | Resource grid with hatching; Phòng A, a second photographer; suggested 14:00, 15:00 and 25/10 09:00 | A day timeline from 768 px plus a readable list at every width, with an icon and a word for each kind; only Mai, Tuấn and Phòng B; one suggested time, 14:00 | The brief asks every booking to be readable at every width and a clash never shown by colour or hatching alone; the other people, rooms and times are not in the brief |
| 2 | Customer's email and phone in the chat header; header links *Booking, Lịch, Tài nguyên, Nhân sự* and a bell | No contact details; the header links move within the page | The brief gives no contact details; those links led outside the three pages |
| 2 | Status shown as small coloured labels | An icon plus the status name, exactly as the brief names them | Never colour alone |
| 3 | Tabs *Tất cả, Chờ cọc, Đã đặt lịch, Hoàn thành* | One booking, GS-1024, with no tabs | Only one booking exists in the story, so the tabs would be empty |
| 3 | Month calendar and a map card with the studio's address | A week strip with Saturday 24/10 marked, a day timeline and an agenda with the 09:00 first asked for struck through; no map | The brief gives no address; the day view shows the agreed times plainly |
| 3 | *Thanh toán cọc 30%* active | Disabled, with a note that the slot is held only after the deposit succeeds and the studio checks again | PA#2 has no payment gateway; the slot is never promised early |

## Your design choices

| Choice | Why |
|---|---|
| Our own colours, type, components and layout | The lecturer lets each team decide the design |
| The first screen is a 3D walk into a classroom, where one photo per service is pinned on the board | It shows the services as one journey. The classroom is an illustration, not the studio's premises |
| A plain first screen on phones, without WebGL or with reduced motion | A 3D scene does not suit 360 px or a slow connection. The 3D code is not even downloaded there |
| Service cards, process and chat follow the story as normal sections, in every version | So every feature works with a keyboard and without 3D |
| The process has five steps and says the slot is held only after the 30% deposit | The brief's main flow; the authors' screen promised it too early |
| The chat is a section of the page that looks like a chat window and is always open, not a box floating in a corner | A floating box covers content at 360 px, a problem on the brief's *Fix these* list; the page must show Linh's question when it opens |
| Beside the chat: a quick choice of package and a short list of what to tell the studio. No opening hours, address, phone or reviews | The brief gives none of these, so they would be invented |
| The link to the management page sits in a strip above the footer, marked as the prototype's next screen | A real customer site would not have it, but PA#2 moves along the flow by a real link that says who continues |
| No separate photo gallery or reviews on `index.html` | The brief's Screen 1 asks for the studio, the three services and the chat; the service photos show the style |
| Separate layouts for customer and management pages | The lecturer's remark in class. It is not access control |
| The customer pages use the dark theme, the management page the light one | Both pass contrast; the colour says at a glance whose side of the flow a page is on, and the management page is long reading |
| On `quan-ly.html` the *Booking mới* form is a card inside the chat, right after Linh agrees; open on arrival, it can fold to a line that keeps the time, the clash note and the submit | The manager fills it in where the details were agreed; folded or not, the brief's opening state and the main flow stay on screen |
| The resource calendar has a day timeline from 768 px for the overview and a list that is the readable record at every width; below 1280 px a one-hour block shows only its icon | The brief asks every booking to be readable at every width; the authors' timeline cut its labels |
| A conversation's status is an icon on the avatar (empty circle, clock, tick, tick in a circle) plus its name on the row's last line; the filters are tabs with the same icons, sliding sideways in the 1280 px column | Quick to scan by shape and word, never colour alone; the long name keeps its own line |
| Status and calendar icons are small SVG drawings next to their words, not symbol characters | Symbol characters change with the system font and can turn into colour emoji |
| No demo switcher between screens | Pages link along the main flow instead |

## Image sources

Licensed stock photos, named here as the GradStudio brief asks. Full details and our changes: `docs/IMAGE_SOURCES.md`.

| Photo | Author | Source | Licence |
|---|---|---|---|
| Empty classroom (first screen without 3D) | Phú Lucas | [Unsplash rOIMcn2i2-M](https://unsplash.com/photos/rOIMcn2i2-M) | Unsplash License |
| Kỷ yếu lớp | Nguyễn Tiến Thịnh | [Pexels 36985960](https://www.pexels.com/photo/36985960/) | Pexels License |
| Tốt nghiệp | Hưng Nguyễn | [Unsplash ILJfgW9YbcI](https://unsplash.com/photos/ILJfgW9YbcI) | Unsplash License |
| Chân dung / CV | Darion Dewhirst | [Unsplash KDF7-23mAU8](https://unsplash.com/photos/KDF7-23mAU8) | Unsplash License |

## Not wired yet

Controls that lead outside the three pages, or actions with no next page in PA#2.

| Control | Page | Left for |
|---|---|---|
| "Gửi" in the customer chat | `index.html` | PA#2 has no server, so the send button is disabled with a note |
| "Gửi" in the management chat | `quan-ly.html` | PA#2 has no server, so the send button is disabled with a note |
| "Thanh toán cọc 30%" | `lich-chup.html` | PA#2 has no payment gateway, so the button is disabled with a note |

## CSS

- Plain CSS with custom properties, no framework.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Breakpoints, mobile first: `min-width: 768px` and `min-width: 1280px`.
