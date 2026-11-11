# PROTOTYPE — GradStudio (PA#2)

**Status: draft, updated as we work.** Remove this line before handing in, and make every row match the final pages.

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
| `quan-ly.html` | Screen 2, Advice and clash handling (Admin) | Admin Thảo opens the moment after Linh agrees: 14:00 chosen, the conversation *Đã chốt lịch*, *Tạo booking* enabled, and a note that 09:00 clashed because Mai is busy 08:00–12:00. Search and the status filter work; choosing 09:00 brings the clash back | "Khách hàng: mở lịch chụp GS-1024" → `lich-chup.html` |
| `lich-chup.html` | Screen 3, Review the appointment and pay the deposit (customer) | Linh opens GS-1024 waiting for the 30% deposit: the week 19–25/10 with the old 09:00 request struck out, make-up 13:00–14:00 and shoot 14:00–16:00, the booking details and the 540.000đ deposit left to pay | Menu → `index.html`; the deposit button is disabled with a note |

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
