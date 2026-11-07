# AI-LOG — PA#2 (GradStudio)

Team: Ngô Thuận An (23120206), Nguyễn Hữu Khánh (24120340).
Started on 2026-11-07, with the first commit after the rules file. The two earlier entries are dated by when the work happened and were written on 2026-11-07. On 2026-11-07 the entries were also put in time order and given commit hashes; `git log -p AI-LOG.md` shows the earlier versions.

## 2026-11-04 — team rules file (written up 2026-11-07)
Commits: 798a111 (rules file), 0eebd2b (log entry), 7f8b88a (log correction).
Tool: Claude Code (Claude Opus 5.5).
Asked for: JavaScript rules based on the exercises in `BT/` and `theory/`, then also the lecturer's feedback stored in the `Web` folder.
Kept: the never list, the *Done means* table and the process rules taken from lecturer feedback.
Changed: nothing by hand yet. To check the rule about opening from the folder, the assistant tested a page from `file://` in headless Chrome: a classic `defer` script ran, but `type="module"` and `fetch` failed, so both became never rules for static pages.
Rejected: the PA#1 feedback about the official-looking header, because GradStudio has no such header; CI rules, because the PA#2 rubric does not mark CI.
By hand: An asked for the rules and chose the sources. Rules not yet reviewed with Khánh.
Assistant's error: its first log entry said it had "first planned to allow `type="module"`". Nothing supported that. It caught this when rereading the log and corrected it in 7f8b88a.

## 2026-11-06 — lecturer's announcement: static or React (written up 2026-11-07)
Commit: 0eebd2b.
Tool: Claude Code (Claude Opus 5.5).
Asked for: what the announcement changes in our plan, then which option to pick after reading the session 6 starter in `theory/`.
Kept: the list of what changes, the limits for a small React build (no API, no router, `base: './'`), and the questions for the lecturer.
Changed: the assistant recommended static pages first. After An said the goal is to learn React early and it read session 6, it agreed static is safer for marks but React serves that goal.
Rejected: static pages for PA#2. An chose React.
By hand: the decision. No new rubric is published, so we work from the 2026-11-02 rubric plus the announcement; the "Fix these" list is still missing.

## 2026-11-07 — rules rewritten for React
Commit: 0eebd2b.
Tool: Claude Code (Claude Opus 5.5).
Asked for: update the rules to the React decision, and start this log now.
Kept: the rewritten Stack and NEVER sections, and the rules from session 6 (`key={id}`, computed totals, no `dangerouslySetInnerHTML`).
Changed: the old rule "React starts in PA#3" and the JavaScript-off rules no longer apply, so they were replaced; the diff against 798a111 shows this. An added: no `Co-Authored-By` or "Generated with" line in commits or pull requests. The assistant picked plain CSS, the spacing scale, the breakpoints and the page names as defaults, for the team to confirm.
Rejected: a router library, because it adds a dependency and three built HTML files give real paths without one (not yet tried in a build).
By hand: An's decisions on React and on commit messages.

## 2026-11-07 — camera screen view for the landing page
Commit: the commit that adds this entry, directly after 720992c.
Tool: Claude Code (Claude Opus 5.5).
Asked for: whether we can use photographer POV images. An then chose the view through the camera screen.
Kept: An's choice of the camera screen view.
Changed: stock POV photos of Vietnamese classrooms may be hard to find and would not match each other, so the assistant proposed drawing the camera in SVG and CSS and showing a normal photo on its screen. Waiting for An to confirm; not built yet.
Rejected: nothing yet.
By hand: An's choice. An's message was cut off, so the reason for it is not yet recorded.

## 2026-11-07 — the landing page as a photographer's story
Commit: the commit that adds this entry, directly after 0e725f2.
Tool: Claude Code (Claude Opus 5.5).
Asked for: fit An's fuller idea: first-person view of a photographer holding the camera, one hand directing the class to pose, taking the shot, then moving to the next angle and out to the schoolyard, like a real shoot.
Kept: the idea and its order of beats. The assistant's camera-only proposal from the entry above did not capture this story.
Changed: the assistant proposed drawing the scene, people, hand and camera as line art, with real photos appearing on the camera screen, and building the plain stacked version first. Waiting for An's decision; nothing built or measured.
Rejected: for this deadline, filming or generating a real walkthrough video, because of time, consent and download size on Slow 4G. An can still overrule this.
By hand: the story is An's.

## 2026-11-07 — one-scene test of the photographer's story
Commit: the commit that adds this entry, directly after 59744ac. The test page is outside the repository, and none of its code is in the project yet.
Tool: Claude Code (Claude Opus 5.5).
Asked for: a test of the "directing the class" scene, to judge whether line art looks good enough.
Kept: nothing yet; An decides after viewing it.
Changed: three things found in Chrome screenshots, then fixed in the test: the shutter finger floated above the camera, the settings text overlapped the live view on the camera screen, and lines showed through the caption. The first screenshots were wrong, because headless Chrome does not capture a scrolled sticky page and a resize event reset the scroll position; the check was changed to fix each moment directly.
Rejected: nothing yet.
By hand: none. Real scrolling smoothness and the phone layout have not been tested. The photo on the camera screen is a placeholder.

## 2026-11-07 — studying tracewood.aura.build
Commit: the commit that adds this entry, directly after 53bea7e.
Tool: Claude Code (Claude Opus 5.5), with Playwright to scroll the site and capture frames.
Asked for: how the site's approach would change the settings in our photographer's story.
Kept: its ideas, for An to decide: every scene starts as lines and dissolves into a real picture, content sits inside the scene (prints on a desk, sheets pinned to a board), and a section menu at the bottom.
Changed: the site runs live 3D with three.js and a loading screen, took 67 s to load in our headless Chrome (no graphics card, so not a fair speed test) and is titled as a template. So the assistant proposed building the ideas with SVG, CSS and photos, not its code or 3D.
Rejected: remixing or copying the template, because the rubric gives 0–4 for a ready-made template; three.js, for the dependency rule and Slow 4G.
By hand: An found the site.

## 2026-11-07 — React project skeleton
Commit: the commits that rename the page and add the skeleton, directly after 2564399.
Tool: Claude Code (Claude Opus 5.5), with Playwright to run the checks.
Asked for: name the management page `quan-ly.html`, and set up the project so Khánh can start.
Kept: Vite and React 19, three HTML files, layouts, `Button`, `ChatPanel`, `BookingSummary`, `src/data.js`, and placeholder pages joined by real forms. The fonts are in the repository.
Changed: three things found by checks. `BookingSummary` had a border inside a border, seen when reading the code. The first page load at 360 px logged a red 404 for the favicon, caught by listening for console errors, so a favicon was added. `dist/` was moved to `.gitignore`, which replaces the earlier note about keeping it in the repository: it goes in the zip, and tracking it would cause conflicts between two people.
Rejected: `@import` for fonts, because files in the repository load without an outside host.
Checks run on the built pages, through a local server: 360, 768 and 1280 px, no sideways scroll, nothing past the right edge, controls at least 44 px, one `h1`, four landmarks, labels, no console errors, the main flow with a reload on each page, and loading from a subfolder. Simulated Slow 4G at 360 px: loading line after about 0.6 s, page after about 2 s. The pages are placeholders, so this will change. The W3C checker has not been run yet.
By hand: An chose the name. Newsreader stands in until the Gambetta files are added.

## 2026-11-07 — real 3D with three.js
Commit: the commit that adds this entry, directly after b5b8362.
Tool: Claude Code (Claude Opus 5.5).
Asked for: An still wants 3D like Tracewood.
Kept: `three` allowed for the landing page only, with a fallback to stacked steps. Not installed yet.
Changed: the assistant had said the effect needs ready-made 3D models. That was wrong: the list of files Tracewood loads includes `RoundedBoxGeometry` and `RoomEnvironment`, which suggests its room is built in code. The assistant also measured `three` instead of guessing: a test bundle with the parts we expect to use is 532 KB, or 131 KB with gzip.
Rejected: Tracewood's post-processing effects, such as `GTAOPass`, to keep it light on weak machines. Not measured.
By hand: An's decision to use 3D.

## 2026-11-07 — which files must be kept up to date while working
Commit: the commit that adds this entry, directly after 0d1384e.
Tool: Claude Code (Claude Opus 5.5).
Asked for: check the rubric for other files that must be written alongside the work, like this log.
Kept: the answer: `brief.md` must be kept the same way.
Changed: rereading the rubric showed the assistant had let `brief.md` fall behind since the fonts step. It added the missing prompts, as sent, with dates. They were added afterwards, on the same day.
Rejected: nothing.
By hand: An's question caught this.

## 2026-11-07 — PROTOTYPE.md, docs/pa1 and a correction to Khánh's requirements
Commit: the commit that adds this entry, directly after 0cb3463.
Tool: Claude Code (Claude Opus 5.5).
Asked for: create `PROTOTYPE.md` and fetch the PA#1 screens. An chose the five-scene story, and told the assistant not to build the scenes until An has picked photos.
Kept: `docs/pa1/` with the original files and a source note, and a draft `PROTOTYPE.md` with what is decided so far.
Changed: reading the PA#1 team's `LINK.md` showed an error in the assistant's requirements for Khánh. It had said not to simulate the deposit and to leave it under *Not wired yet*, but the original Screen 3 has a labelled payment simulation, and the lecturer requires the pages to deliver those features. It also had no list of required features. Both were fixed in `docs/YEU-CAU-KHANH.md`.
Rejected: starting the 3D scene now, at An's request.
By hand: An's decisions. Khánh will be added to the repository by An.

## 2026-11-07 — checking An's photos
Commit: the commit that adds this entry, directly after 375d473. The photos are outside the repository for now.
Tool: Claude Code (Claude Opus 5.5).
Asked for: check whether a portrait and an Unsplash collection suit the page, and keep the sources.
Kept: the portrait (Hưng Nguyễn, Unsplash License), and the source file `nguon-anh.txt`.
Changed: the assistant could read the collection's text but not see its photos. Its scripted download got 401 from Unsplash, so it stopped and asked An to download them. Its advice on those 10 photos rests on their descriptions only.
Rejected: trying other ways past the refusal.
By hand: An chose the photos.

## 2026-11-07 — reference sites for the design
Commit: 0eebd2b. The comparison page itself is outside the repository.
Tool: Claude Code (Claude Opus 5.5).
Asked for: foreign photo studio websites to compare before we choose a look.
Kept: six sites, with a screenshot of each taken in headless Chrome.
Changed: nothing yet; the team has not chosen.
Rejected: Grace Chuang, listed as a photographer in the Colorlib roundup, because the screenshot showed a creative director's site with no photos; Flytographer, because its CSS failed to load in the screenshot. Several URLs the assistant guessed or found failed to load, and none of those are listed.
By hand: none.

## 2026-11-07 — slow network and separate customer and management pages
Commit: 6e0a811.
Tool: Claude Code (Claude Opus 5.5).
Asked for: whether two remarks from the lecturer in class change our technology: run smoothly on Slow 4G, and keep customer and management pages separate to avoid building permissions.
Kept: no change of technology; a Slow 4G row in *Done means*, image and loading-shell rules, and separate layouts in one project.
Changed: An's idea was that separate pages reduce permission work. The assistant agreed for roles, but added that a page without a link is still open by its path, so real customer data will need a login on the server. The 3-second target is the assistant's suggestion for the team, not a lecturer's number.
Rejected: server rendering and a second project, because neither is needed for three pages and both add work before the deadline.
By hand: An reported both remarks from class. Not yet measured, because no page exists.

## 2026-11-07 — text for the Claude Design set-up form
Commit: 0be9b99. The text An pasted is in `brief.md`.
Tool: Claude Code (Claude Opus 5.5), writing the text; Claude Design will use it next.
Asked for: what to fill in the design system form, with a 3D landing page and the same font as our earlier project, Thủ Tục Dễ.
Kept: the name and blurb, the notes text, and which upload fields to leave empty.
Changed: our files name three fonts for Thủ Tục Dễ (Inter, Noto Sans, Be Vietnam Pro), and the final Claude Design font was never recorded, so the assistant could not confirm "the same font". It proposed Be Vietnam Pro until An checks. It also limited 3D to CSS for now, because our rules forbid a new dependency and the page must stay smooth on Slow 4G.
Rejected: linking the GradStudio repository in the form, because we are changing its interface and the course says not to put a classmate's work in prompts; the story and features go in as text from the assigned topic.
By hand: An chose a 3D landing page and has a reference video, which the assistant has not seen yet.

## 2026-11-07 — 3D idea for the landing page
Commit: 5d700e4.
Tool: Claude Code (Claude Opus 5.5).
Asked for: fit An's idea into the Claude Design notes. Scrolling moves through a class or school set, shows different camera angles, and labels each step, so customers see the process and the frames they may get. Audience widened to school and university students about to graduate.
Kept: the updated notes text and the plan for a simple CSS scene with real text for each step.
Changed: the assistant checked the idea against the rubric and found a risk: 3D parts that extend past the screen would appear in the second Console line, so the starting view must fit inside the screen. Phones get a lighter version. Marked the angles and steps as examples, because the proposal does not describe them.
Rejected: three.js and pre-rendered image sequences for now, because of added download size on Slow 4G. Not measured; nothing is built yet.
By hand: An's idea, inspired by a video of a house built while scrolling. The assistant has not seen the video.

## 2026-11-07 — studying the reference video
Commit: 599ad47.
Tool: Claude Code (Claude Opus 5.5), with ffmpeg to pull frames from the 11-second video.
Asked for: study the video for style, text layout, components and effects, and fit them to our page.
Kept: the structure seen in the frames: full-screen scene, step counter, two-line title with one accent line, progress ring, angle map, summary card at the end.
Changed: the assistant replaced its earlier CSS miniature idea, because the frames show a glowing line drawing that turns into a real photo. New proposal: an SVG line drawing of the classroom, a camera move with CSS, and a real photo fading in at each step.
Rejected: copying the video's tiny monospace labels, because our body text must be at least 16 px; a scrubbed video, because no footage exists and it would be heavy on Slow 4G. Not yet built or measured.
By hand: An supplied the video and asked for it to be studied. The site in it (Pennwick) is a style reference only; no name, image or text is copied.

## 2026-11-07 — choosing fonts
Commit: 242169a.
Tool: Claude Code (Claude Opus 5.5).
Asked for: Fontshare fonts to try, then apply the ones without errors.
Kept: Gambetta for large titles and Be Vietnam Pro for other text. The "one font" rule became a rule about loading only the weights in use.
Changed: the assistant could not read Fontshare's language data (the pages returned an empty shell and the font server did not connect), so it gave a Vietnamese test string instead of claiming support.
Rejected: its other suggestions (Zodiak, Boska, Erode, General Sans, Satoshi, Switzer), because An's test found errors in the fonts tried; only Gambetta passed.
By hand: An ran the test on Fontshare. Be Vietnam Pro comes from what the assistant knows, and the font files have not been checked character by character yet.

## 2026-11-07 — brief.md and log tidy-up
Commit: the commits that add `brief.md` and this entry, directly after 242169a.
Tool: Claude Code (Claude Opus 5.5).
Asked for: add commit hashes to this log, put it in time order, and create `brief.md`.
Kept: the prompts and the Claude Design text as given.
Changed: while writing `brief.md`, the assistant found that the Claude Design text leaves out relative links, the semantic rules, no fixed widths and the W3C and Accessibility checks. They are in a separate prompt for building the pages, marked as not yet sent.
Rejected: adding those constraints to the Claude Design text afterwards, because the brief must show what was actually given.
By hand: An confirmed the pasted text matches what the assistant wrote. An pasted it into Claude Design; the result is logged in the next entry.

## 2026-11-07 — design system from Claude Design, and its review
Commit: the commit that adds this entry, directly after 4585cea. The design system itself is outside the repository.
Tool: Claude Design made the system (tokens, two themes, 15 components). Claude Code reviewed it.
Asked for: Claude Design: the text in `brief.md` Part 2. Claude Code: look at the result.
Kept: colours and spacing tokens, the type scale, the component list and the scroll structure. All 36 colour pairs we computed passed (4.5:1 for text, 3:1 for control borders). No `!important`.
Changed (to do when porting, nothing is built yet):
- The drawing is a flat floor plan, with no `rotate` or `perspective` in the CSS, so it is not the 3D effect we asked for. Caught by rendering it in Chrome and searching the CSS.
- At a 360 px wide container the schedule grid sticks out, from `min-width: 880px`. It scrolls inside its box, but the rubric only exempts a table's wrapper, so it needs a real table or a list at 360 px. Caught by the rubric's second Console line, adapted to 360 because headless Chrome would not open narrower than about 500 px.
- `dangerouslySetInnerHTML` for the drawing, and index keys in four lists, break our NEVER list. Caught by searching `bundle.js`.
- The chat form and booking form call `preventDefault`, which would stop their main-flow `action`.
- It is built for React 18 and global `window.GradStudio`, and loads fonts with `@import`; our rules use React 19, modules, and fonts in the repository.
Rejected: nothing yet.
By hand: An ran Claude Design. The canvas for the three screens is still empty, so the pages themselves have not been designed.

## 2026-11-07 — dividing the work
Commit: the commit that adds this entry, directly after b78e89a.
Tool: Claude Code (Claude Opus 5.5).
Asked for: a new division: An designs the landing page, Khánh designs and builds the later pages in detail, An reviews them the way the lecturer marks.
Kept: the division, the component requirements and the review steps, for the team to confirm.
Changed: An's request replaced the assistant's earlier split. The assistant also noticed that the design system has four badge tones while the GradStudio proposal has nine booking statuses, so the requirements include a mapping. It also flagged that "Tạo booking" starts disabled, which stops the main flow until a free time is chosen.
Rejected: nothing yet.
By hand: An decided the roles.

## 2026-11-07 — team repository on GitHub
Commit: the commit that adds this entry, directly after dd803ad, is the first one pushed.
Tool: Claude Code (Claude Opus 5.5).
Asked for: create the team repository.
Kept: private repository `gradstudio-pa2` under An's account, with the existing history pushed as it is.
Changed: nothing. The rubric PDF stays out through `.gitignore`.
Rejected: a public repository for now, because the hand-in is a zip. If we later share a link with the lecturer, it must be made public and checked in an incognito window.
By hand: An asked for it. Khánh still has to be added as a collaborator.

## 2026-11-07 — design system as files, requirements for Khánh
Commit: the two commits after c7bd762 (design system files; rules and requirements).
Tool: Claude Code (Claude Opus 5.5).
Asked for: whether renaming a page breaks a rule, and a way to share the design system without a link, because Khánh may use another agent.
Kept: `design-system/` copied from the Claude Design output, `AGENTS.md`, and `docs/YEU-CAU-KHANH.md`.
Changed: the assistant wrote `design-system/preview.html` to show the components in a browser, since the original previews only run inside Claude Design. The requirements override the design system where it breaks our rules, for example `DepositCard` pretending a payment was made.
Rejected: keeping only a link to the design system, because a different agent cannot open it.
Assistant's error: in its first `preview.html`, the heading of the dark section was dark on dark, because a `data-theme` section changes the tokens but keeps the inherited text colour. Caught by looking at a Chrome screenshot; fixed by setting `color: var(--ink)` on that section. The landing page's light final screen needs the same care. The screenshot also showed the schedule cutting off labels in one-hour blocks, now in Khánh's requirements.
By hand: An's request. The renaming is still An's decision; the rubric fixes only `index.html`, and the other names are free as long as `screenshots/`, `checks/` and `PROTOTYPE.md` match.
