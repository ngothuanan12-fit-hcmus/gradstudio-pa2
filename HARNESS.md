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
| Format | Code style of JS, JSX, CSS, HTML, JSON, YAML (Markdown left out: the log keeps its wording) | Prettier 3.10.1 | `npm run format:check` | local, CI | `c74cbb4` | Locally on 35 files at `c74cbb4`, before `1ce8ae8` formatted them (AI-LOG 2026-11-19). Not yet in CI |
| Lint | React and JavaScript rules, 0 warnings allowed | ESLint 9 (`client/eslint.config.js`) | `npm run lint` | local, CI | `b5b8362` (client); root script `c74cbb4` | Not yet recorded |
| Tests | The mock answers as the contract says (to come) | `node --test` | `npm test` | local, CI | `c74cbb4` | Cannot fail yet: 0 tests until the mock's tests exist |
| Build | The client builds | Vite | `npm run build` | local, CI | root script `c74cbb4` | Not yet |
| CI | All four, on every push and pull request, Node 22 | GitHub Actions, `.github/workflows/ci.yml` | — | GitHub | `5b4f37d` | First run green: [44462292455](https://github.com/ngothuanan12-fit-hcmus/gradstudio-pa2/actions/runs/44462292455) |

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

## 5. Self-review: what the harness caught

| # | Milestone | What the assistant produced | Check that caught it | Fix | Rule afterwards |
|---|---|---|---|---|---|
| 1 | PA#2 | The booking card's fields kept their `name`, so submitting carried the booking into the address (`lich-chup.html?customer=…&start=14:00…`) | The Playwright flow check printed the URL after *Tạo booking* | `099e406` | NEVER 4 in `CLAUDE.md` (`cb7f34f`) |
| 2 | PA#2 | The day timelines set `left` and `width` in inline `style` | A search of `src/` against the NEVER list | `8a74ea3` | NEVER 7 in `CLAUDE.md` (`cb7f34f`) |
| 3 | PA#2 | The filter tabs slid sideways from 768 px, where the list spans the screen, so tabs stuck out past the right edge | The rubric's overflow line in our check script: FAILURES: 1 at 768 px | `64119d9` (sliding from 1280 px only; the first try was never committed) | None needed: the overflow rule already existed |
| 4 | PA#3 | Prettier added with its default LF line endings while Git on Windows checks out CRLF: a Windows clone would fail the format check on every file | Git's own warnings during the commit, then a check of the files' line endings | `56b88ca` | None: `.gitattributes` now enforces it |

At least one incident caught by an automated gate (format, lint, tests, CI) is still to come; add it here with the run's link.

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
