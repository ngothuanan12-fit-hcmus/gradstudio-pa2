# GradStudio — team rules (CSC13008, PA#2 onward)

Applies to every team member and every assistant working in this repository.
Tags say where a rule comes from: `PA2` rubric and the lecturer's 2026-11-06 announcement, `S6` session 6 React starter, `IA2` session 4 catalogue, `IA3` session 5 three answers, `FB` lecturer feedback.

## Stack

- React 19 with Vite, as in session 6. The built `dist/` folder is handed in and opened through a local server with JavaScript on. `PA2` `S6`
- Three pages, built by Vite as three HTML files, `index.html`, `quan-ly.html` and `lich-chup.html`, joined by relative `<a href>`. No router, so every screen has a real path. List these paths in `PROTOTYPE.md`. `PA2`
- `base: './'` in `vite.config.js`, so `dist/` still loads when it is not served from the root.
- Customer pages and the studio's management page have separate layouts in one project: `CustomerLayout` and `AdminLayout`. This saves building user roles for now, but it is not protection: anyone can open a page by its path. Once real customer data exists, the server must require a login for the management side. Lecturer's remark in class `FB`
- Data lives in `src/data.js`. There is no API in PA#2, and the session 6 fake API runs only on the dev server, not in `dist/`. `S6`
- Plain CSS with custom properties. One framework at most for the semester, and we use none. `PA2`
- Spacing scale: `--space-1` to `--space-8` = 4, 8, 12, 16, 24, 32, 48, 64 px.
- Mobile first. Breakpoints: `min-width: 768px` and `min-width: 1280px`.
- Fonts: Newsreader for large titles, Be Vietnam Pro for everything else. Keep the font files in the repository as `woff2`. A font must have all 134 Vietnamese letters in its file; a test string alone is not enough, because browsers hide gaps with fallback fonts.
- Colours, type sizes and component behaviour: `design-system/`, generated with Claude Design. It is a reference: pages use `design-system/tokens.css` values and components rewritten in `src/components/`. They never load `bundle.js`, `bundle.css` or a CDN script.
- Colours and layout are the team's own choice. `PA2`
- Check `node --version` on each machine: `npm create vite@latest` needs Node 20.19 or newer. `S6`

## NEVER

1. **NEVER** add a dependency beyond React, Vite, the session 6 lint tools and `three`: no router, axios, UI, state or icon library, no CDN script. `three` is for the landing page's 3D scene only, loaded with a dynamic `import()` after the page shows, at 768 px or wider. Without WebGL, on phones or with reduced motion, the page shows the stacked steps instead. `S6` `PA2`
2. **NEVER** navigate with `onClick` or `location.href`. Going to another page is `<a href="lich-chup.html">` or a form with `action`. `PA2`
3. **NEVER** use an absolute path (`/page.html`) or a folder as a link. `PA2`
4. **NEVER** use `dangerouslySetInnerHTML`. Data is rendered as text. `S6`
5. **NEVER** use an array index as `key`. Use the item's `id`. `S6`
6. **NEVER** keep in `useState` what can be computed: totals, counts, filtered lists. `S6`
7. **NEVER** call `fetch` in PA#2, and never inside a card component in any milestone. `S6`
8. **NEVER** carry main-flow data between pages with `localStorage` or the URL. Each page reads what it needs from `src/data.js`. `PA2`
9. **NEVER** use a fixed `width` that can overflow, `overflow-x: hidden` to hide overflow, or `!important`. `PA2`
10. **NEVER** use a `<div>` as a button, or an input without a visible `<label>`. Each page has one `<h1>` and no skipped heading level. `PA2`
11. **NEVER** leave a control that does nothing. A control leading outside the three pages goes under *Not wired yet* in `PROTOTYPE.md`. `PA2`
12. **NEVER** write inline `style=""` for appearance. Appearance stays in the CSS file. `IA2`
13. **NEVER** add `eslint-disable`, or change a check, a rule or `docs/pa1/`, to make a result pass. Fix the page. `S6` `IA2` `IA3`

## How to write it

- One component per file in `src/components/`. Pass data and actions through props. `S6`
- State lives in the lowest component that needs it: whether one card is open lives in that card, shared data lives above it. `S6`
- Use `useEffect` only to sync with something outside React, with a cleanup. Do not use it to compute values. `S6`
- An action is a `<button type="button">`, reachable with Tab and operated with Enter. A toggle also sets `aria-expanded`. `IA2` `S6`
- Status text goes in one `role="status"` element. `IA2` `S6`
- Format money as `price.toLocaleString('vi-VN') + ' đ'`. Convert strings with `Number()` before calculating. `IA2` `S6`
- Each HTML file has `<meta name="viewport">`, a `<title>`, and a `<noscript>` message. `PA2`
- The page must stay smooth on Slow 4G. Lecturer's remark in class `FB`
  - Keep images in the repository, compressed, in WebP, sized for their slot, with `srcset` where phone and laptop differ.
  - Every image has `width` and `height` or an `aspect-ratio`, so nothing jumps when it loads. Images below the first screen use `loading="lazy"`; the main image does not.
  - Each HTML file has a small shell inside `#root` (page name and a loading line), so a slow connection never shows a blank page.
  - Load only the font weights in use, with `font-display: swap`, so text shows before the font arrives.
- Buttons and standalone links have `min-height: 44px` at 360 px. At least one long item, such as a long Vietnamese name, must wrap. `PA2`

## When a page talks to a server (PA#3 onward)

- `fetch` only rejects when there is no response. Check `res.ok` and throw on a 500. `IA3`
- Cancel the old request in the effect's cleanup with `AbortController`, so the latest request wins. An aborted request is not an error. `S6`
- Set a real timeout: `AbortSignal.timeout(5000)`. `fetch` ignores `{ timeout: 5000 }`. `IA3`
- Show every state: loading, empty, error, and a Retry that clears the previous run. Old items stay on screen while loading. `IA3` `S6`
- Parallel requests use `await Promise.all(items.map(…))`, never `forEach(async …)`. `IA3`
- `await` inside `try`, so nothing ends as `Uncaught (in promise)`. `IA3`

## Done means

Run these yourself. "The assistant says it works" is not a check. `IA2` `IA3` `S6`

| # | Do this | You should see |
|---|---|---|
| 1 | `npm run lint` | No output, no `eslint-disable` anywhere |
| 2 | `npm run build`, then `npm run preview` | `dist/` builds and opens with no 404 in the Network tab |
| 3 | Each path at 360, 768 and 1280 px | All content visible; every main-flow link opens the right page, also after a reload |
| 4 | The rubric's Console lines at each width | `false`, then `[]`; `document.documentElement.clientWidth` equals the width set |
| 5 | Console, while using each control | No `Uncaught …`, nothing red |
| 6 | Tab through the page, press Enter on each control | Focus is visible; the control works |
| 7 | W3C checker and DevTools Accessibility pane | 0 errors; landmarks, one `<h1>`, labels, `alt`. How to check rendered React pages is still to be confirmed with the lecturer |
| 8 | DevTools colour picker | Body text 16 px or larger; text and buttons at 4.5:1 or better |
| 9 | Read `src/` against the NEVER list | `key={item.id}`, no `dangerouslySetInnerHTML`, totals computed |
| 10 | `npm run preview`, Network tab, tick *Disable cache*, choose *Slow 4G*, reload each path. Do not measure on `npm run dev` | Page name shows at once, never blank; no layout jump as images load; controls work; no failed request. Team target: usable within 3 seconds |
| 11 | `git diff --stat` before each commit | Only the files this step meant to change |

## Team process (from lecturer feedback)

- **Small commits, one meaningful step each.** A first commit with this file, then at least one per page and one for the responsive pass. `FB` `PA2`
- **Commit messages carry no `Co-Authored-By` or "Generated with" line.** Assistant use is recorded in `AI-LOG.md`. Same for pull requests.
- **Commit the assistant's output first, then your fix separately**, so *Changed* points at a real diff. `FB`
- **Write `AI-LOG.md` right after each step**, with the commit hash. Name what the assistant got wrong, the check that caught it, and what you told it. Never backdate an entry. `FB` `PA2`
- **`brief.md` holds the prompts actually given**, pasted in order. `PA2`
- **Commit under your own name:** set `git config user.name` and `user.email` on each machine. `PA2`
- In Windows PowerShell, use `git commit -F <file>` for messages containing `"`. `IA2`
- Make any repository you link public, and open the link in an incognito window before handing in. `FB`
- Tests, if any, assert the error type, never the exact message text. `FB`
- Use one numbering for steps across the progress bar, headings and buttons. Check exports and screenshots are complete. `FB`
- Keep facts to what the GradStudio proposal gives. Do not invent prices, times or policies; record anything removed in `AI-LOG.md`. `FB`
- Reference sites inform layout only. Do not copy their images, text or code. No ready-made template. `PA2`
- Self-score level by level against the rubric, with evidence on every row. When unsure, score a little lower. `FB`
- Rules file, brief, `PROTOTYPE.md`, `AI-LOG.md` and the self-assessment must say the same thing.
