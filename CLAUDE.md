# GradStudio — team rules (CSC13008)

For every member and assistant. A rubric wins over this file. `IN` marks a line added after an incident in `AI-LOG.md`. What each screen must do is in `brief.md`.

## Stack

- `client/`: React 19, Vite, React Router (`BrowserRouter`), plain CSS with the tokens in `client/src/styles/tokens.css` (spacing 4–64 px, breakpoints 768 and 1280 px). Forms by hand. `three` only for the home page's 3D story, with a plain fallback.
- `mock/server.mjs`: Node built-ins only, port `PORT` (3001), `MOCK_MODE` = `normal`, `slow`, `error`, `empty`, data from `mock/data/`.
- `docs/api/`: the contract: `README.md`, then one numbered file per resource, examples fenced as `http`, a `## Changes` section.
- `server/`: Express on the same port and contract, from PA#4.

## Commands (repository root)

| What | Command |
|---|---|
| Mock | `node mock/server.mjs` |
| Client | `cd client`, `npm ci`, `npm run dev` / `npm run build`, `npx vite preview` |
| Format check | `npm run format:check` |
| Lint | `npm run lint` |
| Tests | `npm test` |

CI runs the same commands on every push.

## How we work

1. Contract first: an endpoint is committed in `docs/api/` before code calls it; later changes get a dated line in `## Changes`.
2. Commit before each request to the assistant; afterwards read `git diff -- docs/api mock` and reject what was not asked.
3. One commit per part, under your own name, on a branch; the other member reviews the pull request.
4. After each step, an `AI-LOG.md` entry (commit, what went wrong, which check caught it); prompts into `brief.md` as given. Old entries are never rewritten.
5. Facts follow the brief's example (Linh, GS-1024). Where it is silent, ask the product owners and cite the post.

## NEVER

1. Call an endpoint missing from `docs/api/`: stop and say so.
2. Edit `docs/api/` or `mock/` unless asked.
3. Write main-flow data into a component, or call `http://localhost:3001` instead of `/api`.
4. Put booking data in the URL query or browser storage; only the auth context stores the token. `IN 2026-11-11, 099e406`
5. Navigate with `location.href` or `onClick`; use a router link or a form.
6. Use `dangerouslySetInnerHTML`, an index as `key`, or `useEffect` without a cleanup.
7. Use an overflowing fixed width, `overflow-x: hidden`, `!important`, or inline style for appearance. `IN 2026-11-11, 8a74ea3`
8. Use a `<div>` as a button, or an input without a visible label.
9. Add `eslint-disable`, skip or loosen a test, or change a gate to go green.
10. Add a dependency without asking.
11. Invent a price, time or policy.
12. Copy code, images or text from other teams, the authors' prototype or reference sites. `IN 2026-11-11`
13. Commit `.env`, secrets or `node_modules/`, or a `Co-Authored-By` or "Generated with" line.
14. Stop a process you did not start; look at its parent process first. `IN 2026-11-20, HARNESS 8`
15. Test a commit inside the shared working tree; test a `git archive` copy of it, on its own ports. `IN 2026-11-20, HARNESS 9`
