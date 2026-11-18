# GradStudio — team rules (CSC13008)

For every member and every assistant. Where a rubric says otherwise, the rubric wins. Tags: `PA3`–`PA5` rubrics, `BR` the GradStudio brief, `IN` an incident recorded in `AI-LOG.md` (date).

## Stack

- `client/` — React 19 and Vite, React Router with `BrowserRouter`, plain CSS with the tokens in `client/src/styles/tokens.css` (spacing 4–64 px, breakpoints `min-width` 768 and 1280 px). Forms by hand with one shared helper. `three` only for the home page's 3D story: dynamic `import()`, 768 px and wider, plain fallback without WebGL or with reduced motion.
- `mock/server.mjs` — Node built-in modules only. Port `PORT` (3001); `MOCK_MODE` = `normal`, `slow`, `error`, `empty`; data from `mock/data/`, kept in memory. `PA3`
- `docs/api/` — the contract: `README.md` (base `/api`, `Authorization: Bearer`, one error shape, every endpoint), then one numbered file per resource with examples fenced as `http` and a `## Changes` section. `PA3`
- `server/` — Express on the same port and contract, from PA#4.
- Gates: Prettier, ESLint, tests, and GitHub Actions running the same commands on every push. `PA5`

## Commands (repository root)

| What | Command |
|---|---|
| Mock | `node mock/server.mjs` (`MOCK_MODE=slow node mock/server.mjs`) |
| Client | `cd client`, `npm ci`, `npm run dev`; `npm run build`, `npx vite preview` |
| Format check | `npm run format:check` |
| Lint | `npm run lint` |
| Tests | `npm test` |

## How we work

1. **Contract first.** An endpoint is committed in `docs/api/` before any code that calls it. Once code calls it, every change gets a dated line in that file's `## Changes`. `PA3`
2. **A commit before each request to the assistant**, so each answer is its own diff. After it, read `git diff -- docs/api mock`; a change there that was not asked for is rejected. `PA3`
3. One commit per part, under your own name. Work on a branch; the other member reviews the pull request; nobody merges their own.
4. Right after each step: an `AI-LOG.md` entry under the milestone's heading, with the commit, what the assistant got wrong, the check that caught it, and what we said. Prompts go into `brief.md` as given. Never rewrite an old entry; correct with a new dated line. `PA5`
5. Where the brief is silent, ask the product owners; cite the post in `FRONTEND.md`. Until they answer, mark the behaviour as an assumption.
6. Documents in English; screen text in Vietnamese: the reader is "bạn", the studio "studio", buttons a short verb and object.

## Product facts `BR`

- One story: Linh, Saturday 24/10/2026; 09:00 clashes because make-up artist Mai is busy 08:00–12:00; make-up 13:00–14:00 with Mai, shoot 14:00–16:00 with Tuấn in Phòng B; Admin Thảo; GS-1024, Gói Tốt nghiệp Premium (2 hours, 30 photos), 1.800.000đ, deposit 540.000đ, remainder 1.260.000đ.
- Status names exactly: conversations *Chưa trả lời, Đang tư vấn, Đã chốt lịch, Hoàn thành*; bookings *Chờ cọc 30%, Đã đặt lịch, Hoàn thành*.
- The slot is held only after the deposit succeeds and the resources are checked again.
- Demo accounts: `linh`, `customer2`, `thao`, `mai`, `tuan`, `staff3`, `superadmin`. The test payment returns to `/thanh-toan/ket-qua`.
- Money is an integer number of đồng, computed by the API, shown as `value.toLocaleString('vi-VN') + 'đ'`.

## Every screen `PA3`

- Data only from the API, through `client/src/api/`, on relative `/api` paths. The token and user live in one auth context read with a hook; sign-out clears them.
- Loading, an error with *Retry* (no page reload), and an empty message on every screen that loads data; one request per thing loaded.
- Every route opens directly and after a reload; unknown paths show a not-found screen; signed out → sign-in → back; another role is turned away. After an action the screen updates from the API's answer.
- Forms: a visible `<label>` on every input; checked against the contract before sending; one message per field next to it (`aria-describedby`); a `400`'s field messages on their fields; typed values kept; no double submit; uploads checked for type and size first.
- 360, 768 and 1280 px with no sideways scroll; tap targets 44 px at 360 px; landmarks, one `<h1>` per screen, no skipped heading; body text 16 px or more, contrast 4.5:1; 0 W3C errors on the rendered HTML.
- *Fix these*: no demo controls (changing role is signing out and in); a disabled button only where the flow disables it, with the reason on screen; nothing covers the page at 360 px; no cut-off labels; a clash never shown by colour alone; nothing that leads nowhere; photos licensed, source named.

## NEVER

1. Call an endpoint that is not in `docs/api/`: stop and say it is missing. `PA3`
2. Edit `docs/api/` or `mock/` when the request did not ask for it. `PA3`
3. Write main-flow data into a component, or call `http://localhost:3001` instead of `/api`. `PA3`
4. Carry booking data in the URL's query or in browser storage. The only thing stored is the token, under one key, by the auth context. `IN 2026-11-11` (the booking fields rode in the address, fixed in `099e406`)
5. Navigate with `location.href` or an `onClick`; use a router link or a form submit.
6. Use `dangerouslySetInnerHTML`, an array index as `key`, `useState` for what can be computed, or `useEffect` for anything but syncing with the outside (with a cleanup that aborts the request).
7. Use a fixed width that can overflow, `overflow-x: hidden`, `!important`, or an inline `style` for appearance; data for CSS goes in custom properties. `IN 2026-11-11` (`8a74ea3`)
8. Use a `<div>` as a button, or an input without a visible label.
9. Add `eslint-disable`, skip or loosen a test, or change a gate or a check to go green. If a gate must change, give the reason in the commit and in `HARNESS.md`. `PA5`
10. Add a dependency without asking. Now: React, React Router, `three`, Vite, the ESLint tools, Prettier.
11. Invent a price, a time or a policy: facts follow the brief and the product owners.
12. Copy code, images or text from another team, the authors' prototype or a reference site. `IN 2026-11-11` (a branch built on the authors' prototype code was not merged)
13. Commit `.env`, a secret or `node_modules/`; add a `Co-Authored-By` or "Generated with" line.

## Done means

Before a pull request: `npm run format:check`, `npm run lint`, `npm test` and `npm run build` pass; each screen you touched works in all four mock modes and opened directly at 360, 768 and 1280 px; `git diff -- docs/api mock` shows only what was asked.
