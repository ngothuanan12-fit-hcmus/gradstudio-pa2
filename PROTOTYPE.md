# PROTOTYPE — GradStudio (PA#2)

**Status: draft, updated as we work.** Remove this line before handing in, and make every row match the final pages.

## Team

- Ngô Thuận An, 23120206
- Nguyễn Hữu Khánh, 24120340

## How to open it

Built with React, so it needs a local server and JavaScript on. It does not need a network connection once dependencies are installed.

```bash
npm install
npm run build
npm run preview
```

Paths, relative to the server root of `dist/`:

- `index.html`
- `quan-ly.html`
- `lich-chup.html`

## Screens

| File | PA#1 screen | What the user does there | Links open |
|---|---|---|---|
| `index.html` | Screen 1, `docs/pa1/01-customer-services-chat.png` | The customer follows the classroom story, sees the three packages, asks about one, and sends a chat message | Chat form → `quan-ly.html`; menu → `lich-chup.html`; "Xem gói chụp" and "Chat với studio" move within the page |
| `quan-ly.html` | Screen 2, `docs/pa1/02-admin-scheduling.png`, `02b`, `02c` | The studio sees the conflict at 09:00, picks 14:00, records Linh's agreement and creates booking GS-1024 | "Tạo booking" → `lich-chup.html` |
| `lich-chup.html` | Screen 3, `docs/pa1/03-customer-appointment.png` | Linh checks the agreed schedule and the deposit | Menu → `index.html` |

## Changed since PA#1

Decided so far. Add each new difference when it is made.

| Difference | Why |
|---|---|
| New visual design: colours, type, components and layout | The lecturer lets each team decide the design |
| The first screen is a 3D walk into a classroom, where one photo per package is pinned on the board | The page shows the services as one journey. The classroom is an illustration, not the studio's premises |
| Package cards, process and chat follow the story as normal sections, in every version | So every feature works with a keyboard and without 3D |
| A plain first screen on phones, without WebGL or with reduced motion | A 3D scene does not suit 360 px or Slow 4G. The 3D code is not downloaded there |
| The chat is a section, not a corner box; sending a message opens `quan-ly.html` | It carries the main flow to the next page |
| The photo gallery, the drag-a-photo block and the customer logos are removed | The package photos show the style. Listed here so the difference is on record |
| Separate layouts for customer and management pages | The lecturer's remark in class |
| The Màn 1, 2 and 3 demo switcher is removed | Pages link through the main flow instead |
| Different stock photos replace the ones in PA#1 | Sources are in `docs/IMAGE_SOURCES.md` |

## Image sources

Licensed stock photos, named here as the GradStudio brief asks. Full details and our changes: `docs/IMAGE_SOURCES.md`.

| Photo | Author | Source | Licence |
|---|---|---|---|
| Empty classroom (first screen without 3D) | Phú Lucas | [Unsplash rOIMcn2i2-M](https://unsplash.com/photos/rOIMcn2i2-M) | Unsplash License |
| Kỷ yếu lớp | Nguyễn Tiến Thịnh | [Pexels 36985960](https://www.pexels.com/photo/36985960/) | Pexels License |
| Tốt nghiệp | Hưng Nguyễn | [Unsplash ILJfgW9YbcI](https://unsplash.com/photos/ILJfgW9YbcI) | Unsplash License |
| Chân dung / CV | Darion Dewhirst | [Unsplash KDF7-23mAU8](https://unsplash.com/photos/KDF7-23mAU8) | Unsplash License |

## Not wired yet

Add each control that leads outside the three pages.

| Control | Page | Left for |
|---|---|---|

## CSS

- Plain CSS with custom properties, no framework.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Breakpoints, mobile first: `min-width: 768px` and `min-width: 1280px`.
