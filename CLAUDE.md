# GradStudio — team rules (CSC13008, PA#2 onward)

Applies to every team member and every assistant working in this repository.
Tags say where a rule comes from: `PA2` rubric, `IA2` session 4 catalogue, `IA3` session 5 three answers, `FB` lecturer feedback.

## Stack

- Static HTML and CSS, opened straight from the folder. No build step to open a page. `PA2`
- CSS: not decided yet. Record the choice, the spacing scale and the breakpoints here before the first page.
- JavaScript: optional and plain, in small amounts. PA#2 is marked with JavaScript off, so it earns no marks there. `PA2`
- React starts in PA#3, not before. `PA2`

## JavaScript: NEVER in PA#2

1. **NEVER** make content depend on JavaScript. All content is written in the HTML and visible by default. Script may collapse it after load, but HTML or CSS must not hide it and wait for script to reveal it. `PA2`
2. **NEVER** navigate with JavaScript: no `onclick`, no `location.href`. Moving along the main flow is `<a href="next.html">` or a form with `action="next.html"`. `PA2`
3. **NEVER** call `preventDefault()` on a main-flow form or link. It must behave the same with JavaScript on and off. `PA2`
4. **NEVER** use `type="module"` or `fetch()`. Both failed when we opened a test page from `file://` in headless Chrome (2026-11-04), while `<script src="app.js" defer>` ran. `PA2` `IA3`
5. **NEVER** add a JavaScript framework, a library, a CDN script or `npm` dependencies. `PA2`
6. **NEVER** carry main-flow data between pages with script or `localStorage`. Each page holds its own data in its HTML. `PA2`
7. **NEVER** use `innerHTML` for anything typed by a user or received as data. Use `textContent`. `IA2` `IA3`
8. **NEVER** write inline handlers (`onclick=""`) or inline `style=""`. `IA2`
9. **NEVER** leave a control that does nothing with JavaScript off. A button that only script can operate starts with the `hidden` attribute, and script removes it. `PA2`
10. **NEVER** change a check, a rule or `docs/pa1/` to make a result pass. Fix the page. `IA2` `IA3`

## JavaScript: allowed in PA#2

Only small enhancements outside the main flow, for example:

- collapsing the menu on a phone;
- minimising the chat box;
- filtering the booking tabs on the schedule page.

With JavaScript off, the menu and chat stay open and every booking stays listed. Anything larger waits for PA#3.

## How to write it

- One file, `app.js`, loaded with `<script src="app.js" defer>`, so the page exists when it runs. `IA2`
- `app.js` runs on all three pages, so check every lookup: `const box = document.querySelector('#chat'); if (box) { … }`. A missing element must not throw a red error.
- One listener on the container, using `event.target.closest('…')`, not one per button. It keeps working for items added later. `IA2`
- Ignore clicks that are not on a control, and `disabled` controls. `IA2`
- Build new items by copying a `<template>` with `cloneNode(true)` and filling them with `textContent`. Use it only for added items, never for content the page needs with JavaScript off. `IA2`
- Script changes state through `hidden`, `disabled`, classes and ARIA attributes. Appearance stays in the CSS file. `IA2`
- Every action is a `<button type="button">`, reachable with Tab and operated with Enter. A toggle also updates `aria-expanded`. `IA2`
- `dataset` values are strings: convert with `Number()` before calculating. Format money as `total.toLocaleString('vi-VN') + ' đ'`. `IA2` `IA3`
- Status text goes in one `role="status"` element. `IA2` `IA3`
- Keep every `id`, `class` and `data-*` that CSS or script uses. `IA2`

## When a page talks to a server (PA#3 onward)

These apply as soon as a server exists. Run the page through it, not from `file://`. `IA3`

- `fetch` only rejects when there is no response. Check `res.ok` and throw on a 500. `IA3`
- Set a real timeout: `fetch(url, { signal: AbortSignal.timeout(5000) })`. `fetch` silently ignores options it does not know, such as `{ timeout: 5000 }`. `IA3`
- Show every state: loading, empty, error, and a Retry that clears the previous run. Use `replaceChildren`, so cards are not duplicated. `IA3`
- Requests that can run together use `await Promise.all(items.map(…))`. Never `forEach(async …)`, which does not wait, and never a sequential loop just to get the right total. `IA3`
- `await` every promise inside `try`, so nothing ends as `Uncaught (in promise)`. No `console.error` for failures the app expects. `IA3`
- When fixing a row, state what must not change, for example "keep the requests parallel". `IA3`

## Done means

Run these yourself in the browser. "The assistant says it works" is not a check. `IA2` `IA3`

| # | Do this | You should see |
|---|---|---|
| 1 | JavaScript off, each page at 360, 768 and 1280 px | All content visible; every main-flow link and form opens the right page |
| 2 | JavaScript on, the same pages and widths | The same content and links; the page's own controls work |
| 3 | Run the rubric's two Console lines, with JavaScript off and on | `false`, then `[]` |
| 4 | Console, while using each control | No `Uncaught …`, nothing red |
| 5 | Tab through the page, press Enter on each control | Focus is visible; the control works |
| 6 | In any box script reads, type `<img src=x onerror=alert(1)>` | No alert; if it is shown, it is shown as text |
| 7 | Add `// @ts-check` as the first line of `app.js`, with the folder open in VS Code and a `jsconfig.json` present | Nothing underlined in red. Remove the line afterwards |
| 8 | `git diff --stat` before each commit | Only the files this step meant to change |

Start each run from a clean address, with no `?q=` or `#` left over. `IA2`

## Team process (from lecturer feedback)

- **Small commits, one meaningful step each.** One commit per page and per JavaScript feature, so `AI-LOG.md` can be checked against the diff. `FB` `PA2`
- **Commit the assistant's output first, then your fix separately**, so *Changed* points at a real diff. `FB`
- **Write `AI-LOG.md` right after each step**, with the commit hash. Name what the assistant got wrong, the check that caught it, and what you told it. `FB` `PA2`
- **Commit under your own name:** set `git config user.name` and `user.email` on each machine. `PA2`
- In Windows PowerShell, use `git commit -F <file>` for messages containing `"`. `IA2`
- Make any repository you link public, and open the link in an incognito window before handing in. `FB`
- Tests, if any, assert the error type, never the exact message text. `FB`
- Use one numbering for steps across the progress bar, headings and buttons. Check exports and screenshots are complete. `FB`
- Keep facts to what `PROPOSAL.md` gives. Do not invent prices, times or policies; record anything removed in `AI-LOG.md`. `FB`
- Self-score level by level against the rubric, with evidence on every row. When unsure, score a little lower. `FB`
- Rules file, brief, `PROTOTYPE.md`, `AI-LOG.md` and the self-assessment must say the same thing.
