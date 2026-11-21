# HARNESS — GradStudio

How our assistant works inside a harness: the rules file it reads, the gates that run without us, and the log. Started on 2026-11-19 and kept up to date as the project goes (PA#5 hands it in with the final build). Every commit and run named here exists; `git show <hash>` shows it.

## 1. Team

| Member | Student ID | Parts of GradStudio |
|---|---|---|
| Ngô Thuận An | 23120206 | PA#2: rules file, landing page with the 3D story, the rebuilt `quan-ly` and `lich-chup` pages, checks and hand-in. PA#3: rules file and brief, `client/` move, gates and CI, contract README, FRONTEND.md, contract-check in the tests, the mock's seed and skeleton, auth, catalogue, conversations (customer side), gallery, Superadmin |
| Nguyễn Hữu Khánh | 24120340 | PA#2: first versions of `quan-ly` and `lich-chup` (PR #1–#3). PA#3: conversations (Admin side), clash check, booking creation, *Lịch chụp của tôi* with the test payment and reminders, staff jobs and preview upload, booking management |

## 2. The gates

| Gate | What it checks | Tool | Command (root) | Where it runs | Added in | Went red |
|---|---|---|---|---|---|---|
| Format | Code style of JS, JSX, CSS, HTML, JSON, YAML (Markdown left out: the log keeps its wording) | Prettier 3.10.1 | `npm run format:check` | local, CI | `c74cbb4` | Locally on 35 files at `c74cbb4`, before `1ce8ae8` formatted them (AI-LOG 2026-11-19); locally on `mock/server.mjs` at `99fa53d` (incident 5). Not yet in CI |
| Lint | React and JavaScript rules in `client/`; JavaScript rules for the Node code at the root (`mock/`, `server/` from PA#4); 0 warnings allowed | ESLint 9 (`client/eslint.config.js`, root `eslint.config.js`) | `npm run lint` | local, CI | `b5b8362` (client); root script `c74cbb4`; extended to `mock/` in the commit after `51a32ac` | Not yet recorded; a probe with an unused variable failed as it should (AI-LOG 2026-11-20) |
| Tests | `test/mock.test.mjs`: every example in `docs/api/` gets its answer from a fresh mock (the course's `tools/contract-check.mjs`, run in full); error mode; slow mode; the token after a restart | `node --test` | `npm test` | local, CI | script `c74cbb4`; tests in the commit after `b816479` | Not yet in a real run; a probe with one example changed from `200` to `201` (a copy of `docs/api/`, outside the repository) made contract-check exit 1 (AI-LOG 2026-11-20) |
| Build | The client builds | Vite | `npm run build` | local, CI | root script `c74cbb4` | Not yet |
| CI | All four, on every push and pull request, Node 22 | GitHub Actions, `.github/workflows/ci.yml` | — | GitHub | `5b4f37d` | First run green: [44462292455](https://github.com/ngothuanan12-fit-hcmus/gradstudio-pa2/actions/runs/44462292455) |

Gate changes: 2026-11-20, the README's endpoint table lists only endpoints that have examples, the rest under *Planned*, so contract-check runs in full and goes red only on a real mismatch (instead of red on every push until the contract is complete). 2026-11-20, the lint gate was extended to the root's Node code (stricter, not weaker), so the mock is checked too. `tools/contract-check.mjs` comes from the course and is left out of lint, never edited.

Line endings: `.gitattributes` (`56b88ca`) keeps LF on every checkout, so the format check gives the same answer on Windows and in CI.

## 3. How to run them

From a fresh copy:

```sh
npm ci
cd client && npm ci && cd ..
npm run format:check
npm run lint
npm test
npm run build
```

Actions page: <https://github.com/ngothuanan12-fit-hcmus/gradstudio-pa2/actions>

## 4. Rules file timeline

`CLAUDE.md`, from its first commit. `git log --follow -p -- CLAUDE.md` shows each change.

| Date | Commit | Change | What made us change it |
|---|---|---|---|
| 2026-11-07 | `798a111` | Created: rules for static pages, from the exercises and the lecturer's feedback | Start of PA#2 |
| 2026-11-07 | `0eebd2b` | Rewritten for React | The lecturer's announcement allowed React for PA#2 |
| 2026-11-07 | `6e0a811` | Added: Slow 4G rules; separate customer and management layouts | The lecturer's remarks in class |
| 2026-11-07 | `242169a` | Added: the title and body fonts | Team decision (AI-LOG 2026-11-07, choosing fonts) |
| 2026-11-07 | `8c5529c` | Added: `AGENTS.md` and the requirements for Khánh's pages | Team decision |
| 2026-11-07 | `ab53af3` | Changed: the management page named `quan-ly.html` | Team decision |
| 2026-11-07 | `0d1384e` | Added: `three` allowed for the landing page only, with a fallback | Team decision on the 3D story |
| 2026-11-07 | `3b043d3` | Changed: Gambetta replaced by Newsreader; a font must contain all 134 Vietnamese letters, a test string is not enough | Incident: Gambetta lacked Vietnamese letters, hidden by browser fallback fonts |
| 2026-11-08 | `4e1c2b2` | Rewritten for the updated PA#2 rubric and the GradStudio brief | The updated rubric |
| 2026-11-08 | `57c3c58` | Added: seven writing rules for the pages | Team decision after reading seven studio sites |
| 2026-11-08 | `fe5663b` | Added: review before merge; shared files listed in pull requests | Team decision while reviewing PR #2 |
| 2026-11-18 | `cb7f34f` | Rewritten for PA#3: `client/`, contract first, mock modes, gates; NEVER 4, 7 and 12 tagged with PA#2 incidents | The PA#3–PA#5 rubrics |
| 2026-11-18 | `ca218e1` | Cut to 464 words; screen rules moved to `brief.md` | The PA#5 rubric asks for a two-minute read |
| 2026-11-21 | the commit after `22148ff` | Added NEVER 14 (stop only a process you started, after checking its parent) and NEVER 15 (test a commit on a `git archive` copy with its own ports) | Incidents 8 and 9 in section 5; proposed by the G2 review, approved by An |

## 5. Self-review: what the harness caught

| # | Milestone | What the assistant produced | Check that caught it | Fix | Rule afterwards |
|---|---|---|---|---|---|
| 1 | PA#2 | The booking card's fields kept their `name`, so submitting carried the booking into the address (`lich-chup.html?customer=…&start=14:00…`) | The Playwright flow check printed the URL after *Tạo booking* | `099e406` | NEVER 4 in `CLAUDE.md` (`cb7f34f`) |
| 2 | PA#2 | The day timelines set `left` and `width` in inline `style` | A search of `src/` against the NEVER list | `8a74ea3` | NEVER 7 in `CLAUDE.md` (`cb7f34f`) |
| 3 | PA#2 | The filter tabs slid sideways from 768 px, where the list spans the screen, so tabs stuck out past the right edge | The rubric's overflow line in our check script: FAILURES: 1 at 768 px | `64119d9` (sliding from 1280 px only; the first try was never committed) | None needed: the overflow rule already existed |
| 4 | PA#3 | Prettier added with its default LF line endings while Git on Windows checks out CRLF: a Windows clone would fail the format check on every file | Git's own warnings during the commit, then a check of the files' line endings | `56b88ca` | None: `.gitattributes` now enforces it |
| 5 | PA#3 | `mock/server.mjs` committed in `99fa53d` with a line over Prettier's 120 characters (the assistant's test run, which included the format check, had been refused, and the commit went ahead without it) | The format gate, `npm run format:check`, run locally before pushing: `mock/server.mjs` failed. `99fa53d` was never pushed, so CI did not see it | the commit after `99fa53d` | None new: *Done means* in the brief already asks for the gates before a push; the miss was skipping them |
| 6 | PA#3 | *Đăng xuất* moved to the home page with `navigate('/')` inside an `onClick` | Reading the new code against `CLAUDE.md`'s NEVER list (NEVER 5) before committing | `7ae3f89` (a router link that also signs out; the first try was never committed) | None new: NEVER 5 already said it |
| 7 | PA#3 | Signing out on a protected screen landed on `/dang-nhap` instead of `/`: the screen saw "signed out" before the link moved | The Playwright run on the built client (`check_auth`) | `7ae3f89` (the sign-out runs in a transition with the router's navigation) | None: a behaviour bug, now covered by the sign-out check |
| 8 | PA#3 | While checking G2, the assistant stopped a node process on port 3001 (PID 17852), taking it for a leftover of its own run, without checking its parent process. It was An's mock, started by hand | An was told in the session; recorded in AI-LOG 2026-11-20, step G2 | No code change. The check script now goes on only when its own mock prints that it is listening, and stops only the mocks it started (AI-LOG, step G2) | NEVER 14 in `CLAUDE.md` (2026-11-21) |
| 9 | PA#3 | Two assistant sessions worked in the same working tree. One rebuilt `client/dist` from uncommitted sign-in work while the other was testing `7ae3f89` from that folder | `git status` and the file times after the run (AI-LOG 2026-11-20, the front-end base tested by hand) | No code change. The run was repeated on a `git archive` copy of the commit, with its own ports (4180, 3101); the G2 review used the same method | NEVER 15 in `CLAUDE.md` (2026-11-21) |


## 6. Human gates

Steps not handed to the assistant, and who ran them:

| Step | Who | Recorded in |
|---|---|---|
| Merging a pull request (never your own; PR #4 was a recorded exception) | An, Khánh | GitHub pull requests; AI-LOG 2026-11-11 |
| Making the repository public, tagging `pa2-submitted`, pushing tags | An | AI-LOG 2026-11-11 and 2026-11-18 |
| Pasting each rendered page into the W3C checker | An | `checks/`; AI-LOG 2026-11-11 |
| Approving each UI change and every rule change | An | AI-LOG, *Kept* and *Rejected* lines |
| Handing in the zip | An | Classroom |

## 7. What we would change

To be written at the end of the project.
