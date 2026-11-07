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
| `index.html` | Screen 1, `docs/pa1/01-customer-services-chat.png` | The customer follows the shoot story, sees the packages, and sends a chat message | Chat form → `quan-ly.html`; menu → `lich-chup.html` |
| `quan-ly.html` | Screen 2, `docs/pa1/02-admin-scheduling.png`, `02b`, `02c` | The studio searches the conversations, sees the conflict at 09:00, picks 14:00, sends the quote, simulates Linh's answer, and creates booking GS-1024 | "Tạo booking mới" → `lich-chup.html`; menu → `index.html` |
| `lich-chup.html` | Screen 3, `docs/pa1/03-customer-appointment.png` | Linh checks the agreed schedule and the deposit, then opens the simulated 30% payment dialog | Menu → `index.html`; "Xem đường đi" opens a map search |

## Changed since PA#1

Decided so far. Add each new difference when it is made.

| Difference | Why |
|---|---|
| New visual design: colours, type, components and layout | The lecturer lets each team decide the design |
| The landing page tells a shoot as a first-person story in 3D, from the classroom to the schoolyard | Customers see the process and possible frames before asking. The steps and angles are examples, not the studio's real process |
| Packages and sample photos sit inside the story's scenes | They replace separate sections, so the page reads as one journey |
| Stacked steps on phones, without 3D or reduced motion | A 3D scene does not suit 360 px or Slow 4G |
| Separate layouts for customer and management pages | The lecturer's remark in class |
| The Màn 1, 2 and 3 demo switcher and the reset-demo button are removed | Pages link through the main flow instead |
| The deposit payment is a dialog marked "Mô phỏng thanh toán" | PA#2 has no payment service, and the page must not imply a real transaction |
| The management chat can add a quote and simulate Linh's answer | The PA#1 screen recorded her answer by hand; the prototype shows the same decision in the flow |
| The resource schedule is a list at every width, not a horizontal 880 px timeline | Full labels and no sideways scroll at 360 px; the design system allows a list at that width |
| Every status badge keeps text, its own symbol and a distinct border style | Readable in greyscale and at 4.5:1 on its own background |
| Our own photos replace the ones in PA#1 | Those belong to the PA#1 team's references |

## Not wired yet

Add each control that leads outside the three pages.

| Control | Page | Left for |
|---|---|---|
| "Xem đường đi" | `lich-chup.html` | A real map and directions; it currently opens a Google Maps search for GradStudio |

## CSS

- Plain CSS with custom properties, no framework.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64 px.
- Breakpoints, mobile first: `min-width: 768px` and `min-width: 1280px`.
