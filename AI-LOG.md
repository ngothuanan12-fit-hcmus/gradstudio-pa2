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

## 2026-11-07 — matching photos to their sources
Commit: the commit that adds this entry, directly after 303e3ca. The photos are outside the repository for now.
Tool: Claude Code (Claude Opus 5.5).
Asked for: review eight photos An downloaded, and say which photo or source is uncertain.
Kept: a source list, for An to confirm. Five photos proposed for use, three as reserves.
Changed: the page descriptions for two corridors were nearly the same, so the assistant compared each photo with a small copy from its source page instead of guessing. All eight matched. The story's schoolyard caption about graduation gowns no longer fits the photos, so it needs rewording.
Rejected: the photo of adults in white áo dài, because it does not show the students we target. Photos with banners naming a real school need cropping.
By hand: An chose and downloaded the photos. The portrait has not been compared with its source page.

## 2026-11-07 — font check: Gambetta fails Vietnamese
Commit: the commit that adds this entry, directly after 0c7b0a5.
Tool: Claude Code (Claude Opus 5.5), with fontTools and Chrome.
Asked for: check whether the downloaded font is right.
Kept: the check itself. A comparison with Newsreader, Playfair Display and Lora, for An to choose.
Changed: Gambetta was chosen earlier, on An's test on Fontshare and the assistant's advice to use that test. The font file has only 38 of 134 Vietnamese letters, and no combining hook, horn or dot. In Chrome, letters such as ử, ổ, Ả and Ớ fell back to another font, heavier and upright. The assistant's earlier test string could not show this reliably. It had said "looks the same" was enough; reading the font file is the check that works.
Rejected: Gambetta, pending An's decision. Newsreader stands in for now, so `CLAUDE.md` still names Gambetta until An decides.
By hand: An downloaded the font and asked for the check. An also confirmed the portrait's source, and asked to leave the label for identifiable students undecided.

## 2026-11-07 — 3D classroom, part 1: the room only
Commit: the commit that adds this entry, directly after 0c7b0a5. The test page is outside the repository, and none of its code is in the project yet.
Tool: Claude Code (Claude Opus 5.5), with Playwright and software WebGL for the checks.
Asked for: build the classroom in small parts, stop for review after each. This part: lines turning into a room while scrolling in.
Kept: awaiting An's review. Anything An rejects will be recorded here.
Changed: two errors found in screenshots at six scroll positions: window glass and the door opening sat inside the wall and were cut into jagged shapes, and the ceiling was too dark. Both fixed and rendered again. No console errors, no sideways scroll at 390 px.
Rejected: nothing yet.
By hand: An set the way of working. Smoothness on a real graphics card has not been tested.

## 2026-11-07 — Newsreader chosen, and a more real room
Commit: the commit that adds this entry, directly after 34b604d. The test page is outside the repository.
Tool: Claude Code (Claude Opus 5.5), with fontTools and Playwright.
Asked for: use the assistant's suggested font and show test sentences to check; make the room look more real; remind An to remove extras before hand-in.
Kept: Newsreader for titles, in the project files. All five font files in the repository have 134 of 134 Vietnamese letters; An still has to read the test sentences on the page.
Changed: worn walls, wood grain, tile wear, a view outside the windows, sunlight, strip lights, a lectern and a classroom banner. All are drawn in code. The banner motto is the assistant's own addition, not from the photo or the proposal.
Rejected: Gambetta, for missing Vietnamese letters.
By hand: An approved part 1 with the request to make it more real. Part 2 has not started. Smoothness on a real graphics card is still untested.

## 2026-11-07 — 3D classroom, part 2: the class gathers
Commit: the commit that adds this entry, directly after 3b043d3. The test page is outside the repository, and none of its code is in the project yet.
Tool: Claude Code (Claude Opus 5.5), with Playwright and software WebGL for the checks.
Asked for: An read the font sentences, said the font is fine and approved part 1, banner included. Next small part, as the assistant proposed: people gathering in front of the board, without the hand or camera.
Kept: awaiting An's review. Anything An rejects will be recorded here. The 13 figures are invented, with no real person's likeness.
Changed: errors found in the assistant's own output, each by a check, all fixed. A path test over 200 scroll steps found people walking through each other: p1 with p7, p0 with p1, p7 with p8. It now reports none, closest pair 0.37 m. Screenshots at six positions showed a stiff lined-up group, striped shadows and stray triangles on the ao dai, heads covering the board text, and arms reaching into empty air at the ends of the group. Screenshots also showed the board text breaking into "yê´u" once the font test left the page: the code asked for the font without saying which letters, so the Vietnamese part was never loaded. The project must pass the text to `document.fonts.load` when it draws Vietnamese on a canvas. No console errors; no sideways scroll at 1280 or 390 px; 342 draw calls.
Rejected: nothing yet.
By hand: An approved the font and part 1. Smoothness on a real graphics card is still untested, and part 2 adds to the load.

## 2026-11-07 — part 2 rejected: real photos pinned on the board instead of people
Commit: the commit that adds this entry, directly after 06317e4. The test page is outside the repository, and none of its code is in the project yet.
Tool: Claude Code (Claude Opus 5.5), with Playwright and software WebGL for the checks.
Asked for: An's own idea: no human models. Zoom to the board, show real photos pinned on it, one per package, see them all together, then zoom into each.
Kept: awaiting An's review. Three photos for the three services on the PA#1 service cards: Kỷ yếu lớp, Tốt nghiệp, Chân dung/CV. Only the Premium package shows a price and details, as the proposal gives them; the other two say "Giá: studio báo khi chat", per the design system rule.
Changed: first render had dull photo borders, faint chalk, a portrait touching the top of the screen and an overview too tight to show the room. All fixed and rendered again. Photos load, no console errors, no sideways scroll at 1280 or 390 px. The Chân dung/CV photo is a crop of the Tốt nghiệp portrait, so the same person appears twice; the short lines under the package names are the assistant's wording. Both wait for An's decision.
Rejected: An rejected the assistant's part 2, 13 modelled people gathering at the board, and the assistant's proposed next part, hands and a camera. Removed from the page.
By hand: the concept is An's. Smoothness on a real graphics card is still untested.

## 2026-11-07 — board writing and zoom speed, after An's review
Commit: the commit that adds this entry, directly after 0c6c3f6. The test page is outside the repository, and none of its code is in the project yet.
Tool: Claude Code (Claude Opus 5.5), with Playwright and software WebGL for the checks.
Asked for: An's review found two errors in the assistant's board scene: writing was on the board before the photos, and the zoom into each photo was too fast and no longer smooth. An also asked whether Khánh can start from the repository now.
Kept: awaiting An's review. Each label now appears with its photo, and the heading with the first photo. The move between photos went from 0.04 to 0.10 of a longer scroll, about 32 % of a screen to 130 %.
Changed: the assistant had set the move too short, and none of its own checks measured speed, so An's review caught it. Other causes of jerky motion found by reading the code and fixed: shadows redrawn every frame during zooms, photos sent to the graphics card at first view, and a zoom that sped up as it neared the photo. New camera path check: no jumps. Screenshots at nine positions; no console errors; no sideways scroll at 1280 or 390 px. Software rendering cannot measure smoothness, so An has to judge it on a real machine.
Rejected: `docs/YEU-CAU-KHANH.md` removed at An's request, because An will brief Khánh by message. Earlier log entries that name it stay as written; the file remains in git history. Before removal, a fresh clone of the repository installed, passed lint and built. Khánh has not yet been invited to the repository.
By hand: An's review and decisions.

## 2026-11-07 — An's review: separate photos, real descriptions, words that follow the scene
Commit: the commit that adds this entry, directly after 04be424. The test page is outside the repository, and none of its code is in the project yet.
Tool: Claude Code (Claude Opus 5.5), with Playwright, web search and software WebGL for the checks.
Asked for: a different photo for each package, descriptions checked against real studio sites and the original team's site, and words that change with each scene as in Tracewood and the video. Record what An rejects or approves.
Kept: awaiting An's review. Approved by An so far: the idea of photos pinned on the board and each photo standing for one package. An has not yet judged smoothness on this version.
Changed: the descriptions, the three "from" prices and most scene lines now come from the original team's public prototype; two accent lines and the room title are the assistant's wording. The words now move between centre, top, bottom, right, left and upper left, and fade and drift with the scroll. In a close-up the other photos and chalk step back. The first render put orange text on the yellow wall, a fan ran through a title, a heading wrapped badly, and the dark backing hid the brand name and the opening line drawing; all seen in screenshots and fixed. New check at 1280, 1920 and 390 px: words stay on screen and do not cover the photo in focus. No console errors, no sideways scroll, no camera jump. The Chân dung/CV photo is the Unsplash image the original team used; its author is not yet identified.
Rejected: An rejected the same person on two packages, the assistant's descriptions, and the numbered story with its caption always on one side. An also found a factual error the assistant had made: it said only Premium has a price and showed "Giá: studio báo khi chat", but the assistant had never read the original site, which lists a price for all three. `design-system/README.md` carried the same claim and is corrected.
By hand: An's review and direction.

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

## 2026-11-08 — `quan-ly.html` and `lich-chup.html` built and checked (uncommitted)

Commit: 5b7b341 (build and docs). Written on 2026-11-08 after the owner's audit; the build prompt was sent on 2026-11-07.
Tool: OpenCode (DeepSeek V4.1 Flash Free), with Chrome DevTools for the rendered-page checks.
Asked for: the owner's prompt of 2026-11-07, now recorded verbatim in `brief.md` Part 3A. It asked for the management page (search and status filter, chat, BookingForm, makeup/photographer/room schedule, the 09:00 conflict, the 14:00 quote flow with a simulated Linh reply, and the create button) and the customer schedule page (status tabs with counts and empty states, week calendar on 24/10, the old 09:00 struck through, GS-1024 card, map, and the simulated 30% deposit). It also fixed the sample data, the status-badge rules and the documentation note for "Xem đường đi".
Kept:
- Nine components in `src/components/`: `StatusBadge`, `ConversationList`, `ChatPanel`, `BookingForm`, `ConflictAlert`, `ResourceSchedule`, `WeekCalendar`, `BookingSummary`, `DepositCard`.
- `src/data.js` now holds the conversations, free slots, resource schedule, week days, service names and the booking fields from the prompt: `Nguyễn Thùy Linh`, Admin `Thảo`, `Tốt nghiệp cá nhân`, `Có mặt sớm 10 phút`, `Gói Tốt nghiệp Premium · 2 giờ · 30 ảnh chỉnh`, 1.800.000đ, 540.000đ, 1.260.000đ, 24/10/2026, Mai, Tuấn and Phòng B.
- The main flow: 09:00 shows the Mai conflict; picking 14:00 adds the proposal to the chat and clears the error; "Gửi báo giá" adds the quote; "Chốt giờ này" adds "Dạ em chốt lịch 14:00 ạ." and enables "Tạo booking mới"; "Từ chối" leaves it disabled; the enabled button submits the form to `lich-chup.html`.
- The customer flow: tabs `Tất cả / Chờ cọc / Đã đặt lịch / Hoàn thành` with computed counts and an empty state; 24/10 selected; 09:00 struck through; makeup 13:00–14:00 and shoot 14:00–16:00; GS-1024 summary; map; simulated deposit dialogue. Cancel keeps the state, success moves the booking to `Đã đặt lịch`, changes the counts to `1/0/1/0` and shows `hẹn 13:00`.
Changed from the design-system port:
- `window.GradStudio` and React 18 became module imports and React 19.
- Index keys became id keys in `ChatPanel`, `ConflictAlert` and `WeekCalendar`; the booking tabs and week days use ids too.
- `preventDefault` was removed from `BookingForm`; it is a real form with `action="lich-chup.html"`. The chat still prevents the default only on the management page, where it adds a local message.
- The 880 px schedule timeline became a list at every width, so no block clips "Linh yêu cầu" or "Linh · makeup". This is also the design system's allowed 360 px fallback.
- Fonts come from `public/fonts.css`, not `@import`; the pages load no `bundle.js`, `bundle.css` or CDN React.
- The two names the original site does not have were removed from `design-system/components/bundle.js`.
- The deposit dialogue is native `<dialog>` and says "Mô phỏng thanh toán"; the confirmation button is secondary so each page keeps at most one primary button.
Errors found and fixed:
- The first CSS grid put `grid-area` on items outside the media query. At 360 px the result showed only the schedule panel and a large blank area. A full-page 360 px screenshot caught it; the area declarations were moved inside `min-width: 768px`.
- The `confirmed` badge first used the same 1 px solid border as `neutral`, so the four tones did not all differ by border style. A rendered check of all four tones caught it; it became 2 px solid.
- A range inside one `<time>` element was not a valid time value. The agenda now uses two `<time>` elements with `dateTime` for the start and end.
- Two additions were removed to stay inside the sample data: the invented Phòng B free block `09:00–12:00` and the `08:00–18:00` line above the schedule.
Checks run (evidence from the session, not a claim):
- `npm run lint` exited 0 with no output; no `eslint-disable` exists in `src/`.
- `npm run build` built `index.html`, `quan-ly.html` and `lich-chup.html`. `npm run preview` served them at `127.0.0.1:4173`; the Network list showed only 200 responses, no 404 or 500, and the Console list was empty during the flow.
- At 360, 768 and 1280 px on all three pages, `document.documentElement.scrollWidth > document.documentElement.clientWidth` printed `false` and the overflow list printed `[]`. On `quan-ly` and `lich-chup` at 1280 px in plain desktop mode `clientWidth` read 1265 because Chrome's vertical scrollbar took 15 px; `index` read 1280. A supplementary check with 1280 px mobile emulation read `clientWidth` 1280 on all three pages, so the rubric's "equals the width set" line passes in the device-emulation mode and there is no horizontal overflow in either mode.
- Lighthouse Accessibility scored 100 on both pages. The four badge tones measured `neutral` 5.29, `pending` 4.61, `confirmed` 5.57 and `conflict` 5.40:1 in `studio`, and 5.87, 6.96, 7.71 and 6.77:1 in `cinema`; their border styles were solid 1 px, dashed 1 px, solid 2 px and dotted 2 px.
- At 360 px "Chờ khách chọn ảnh" was 44 px high over two lines inside a 294 px row; the document stayed 360 px wide.
- Flow checks: empty chat submit added no message; search found only "Nguyễn Thị Hoàng Phương Uyên"; the conflict filter showed the empty-state text; picking 14:00 removed `aria-invalid`; accepting enabled the submit; declining kept it disabled; the submit reached `lich-chup.html`; clicking 25/10 showed "Không có lịch chụp ngày này."; the 09:00 element computed `text-decoration: line-through`; the deposit Cancel kept "Chờ cọc"; the confirm produced "Đã cọc", `aria-valuenow=30`, the "Đã đặt lịch" tab and the 13:00 note.
- Link check: the rendered pages listed only the relative internal links `index.html`, `quan-ly.html` and `lich-chup.html`; the form actions were `quan-ly.html` (home chat) and `lich-chup.html` (booking). `curl` returned 200 for all three internal paths. The only external link is "Xem đường đi", recorded under *Not wired yet*.
- Slow 4G with cache disabled: DOMContentLoaded 1666 ms, load 3334 ms, and the shell text was visible before React. The page was usable before the 3 s team target, though the full load event passed it.
- W3C online could not be reached: `validator.w3.org` returned a Cloudflare challenge. `html-validate` on the rendered DOM reported only style-convention findings (`crossorigin=""`, boolean attributes written with values, a preference for `<progress>`), not structural errors. This is the one Done-means row without a clean external check.
- There is no unit-test framework in the project, so no `test` command exists. The checks above are lint, build, browser and accessibility evidence.
Decisions and limits:
- The schedule is a list at every width rather than a desktop timeline; it keeps every label readable and avoids a second responsive layout.
- The payment is a native modal and a local state change only. No fetch, storage, URL data or real transaction exists.
- The form's GET submit leaves a trailing `?` in the address, but no field has a `name`, so no booking data travels in the URL.
- The build prints `./fonts.css doesn't exist at build time`; `public/fonts.css` is copied to `dist/`, and the preview requested it with a 200, so this is a build-time warning, not a missing file.
By hand: the owner supplied the feature spec and the sample data. No manual source edit was made during the run. The owner's audit caught the missing documentation; the next entry records that correction.

## 2026-11-08 — documentation compliance audit and gate (uncommitted)

Commit: the commit that adds this entry, directly after 5b7b341.
Tool: OpenCode (DeepSeek V4.1 Flash Free).
Asked for: the owner's audit directive of 2026-11-08, now recorded verbatim in `brief.md` Part 4. It asked for a read of `AGENTS.md`, `CLAUDE.md`, `AI-LOG.md`, `brief.md` and `PROTOTYPE.md`, a check of `git status`, `git diff` and the history, and a correction of any missing documentation without touching the page implementation or inventing commits.
Found:
- `AI-LOG.md` had no entry for the two-page build. The log stopped at the design-system hand-off.
- `brief.md` still marked Part 3 as `NOT YET SENT` and did not contain the prompt actually sent; the prepared Part 3 text was not the same prompt.
- `PROTOTYPE.md` already listed the built screens and "Xem đường đi" under *Not wired yet*, but it did not record the list-vs-timeline choice or the badge treatment.
- `CLAUDE.md` required the log and the brief, but had no explicit check before a commit or PR.
Changed:
- Added the build entry above and this audit entry. The build entry carries the real build commit `5b7b341`; this audit entry is the commit that adds this entry. No hash was invented.
- Added Part 3A (the actual build prompt) and Part 4 (this audit directive) to `brief.md`; marked Part 3 as a draft that was never sent; removed the stale "screens still to add" line.
- Added the resource-schedule and status-badge rows to `PROTOTYPE.md` *Changed since PA#1`.
- Added the Documentation gate to `CLAUDE.md`, before *Team process*: after every meaningful step, after every sent prompt, and before every commit or PR.
Not changed: no page component, style, data or build file was touched in this audit. The branch, commit and pull request were requested after the audit; this entry records the documentation work, not a source change.
Checks: reread the five named files, `git status --short`, `git diff --name-status`, `git log --oneline` and the recent file history. The source files were unchanged since the last `npm run lint` and `npm run build`, so the full build and flow suite was not repeated. One targeted check was added: enumerate every internal link and form action on the three rendered pages, confirm the three paths return 200, and read `clientWidth` at 1280 px with mobile emulation. This follows the owner's limit on unnecessary test runs.
Assistant's error: the first completion report said the two pages were ready before updating `AI-LOG.md` or `brief.md`, although both are mandatory in `CLAUDE.md`. The owner's audit caught it. This entry and the new gate are the correction, and the missing prompt is now in `brief.md` verbatim rather than reconstructed.
By hand: the owner wrote the audit directive and required the gate. No manual source edit.

## 2026-11-08 — develop branch and pull request #1 (pushed)

Commit: the commit that adds this entry, directly after 1a1e40b.
Tool: OpenCode (DeepSeek V4.1 Flash Free) and `gh` 2.46.0.
Asked for: the owner's prompt of 2026-11-08, recorded in `brief.md` Part 5: use the `gh` CLI to create `develop` from `main`, create a branch from the work, commit, push, and open a pull request into `develop` with a full comment.
Done:
- Created `develop` from `main` at `7e14731` and pushed it to `origin`.
- Created `feature/quan-ly-lich-chup` from `develop`.
- Committed `5b7b341` "Build the management and customer schedule pages" (17 files) and `1a1e40b` "Record the build and audit in AI-LOG" (1 file).
- Pushed the feature branch and opened PR #1 with base `develop` and head `feature/quan-ly-lich-chup`: https://github.com/ngothuanan12-fit-hcmus/gradstudio-pa2/pull/1
- Added a Done-means evidence comment to the PR: https://github.com/ngothuanan12-fit-hcmus/gradstudio-pa2/pull/1#issuecomment-6710871237
Checks: `gh pr view 1` reports `OPEN`, base `develop`, head `feature/quan-ly-lich-chup`; the branch carries `5b7b341` and `1a1e40b`, and this entry is the commit after them. `git status` leaves only the pre-existing `.gitignore` change; it is not part of the branch or the PR.
By hand: the owner requested the branch and the pull request. No source edit was made in this step.
