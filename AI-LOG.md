# AI-LOG — PA#2 (GradStudio)

Team: Ngô Thuận An (23120206), Nguyễn Hữu Khánh (24120340).
Started on 2026-11-07, with the first commit after the rules file. The two earlier entries are dated by when the work happened and were written on 2026-11-07.

## 2026-11-04 — team rules file (written up 2026-11-07)
Tool: Claude Code (Claude Opus 5.5).
Asked for: JavaScript rules based on the exercises in `BT/` and `theory/`, then also the lecturer's feedback stored in the `Web` folder.
Kept: the never list, the *Done means* table and the process rules taken from lecturer feedback (commit 798a111).
Changed: nothing by hand yet. To check the rule about opening from the folder, the assistant tested a page from `file://` in headless Chrome: a classic `defer` script ran, but `type="module"` and `fetch` failed, so both became never rules for static pages.
Rejected: the PA#1 feedback about the official-looking header, because GradStudio has no such header; CI rules, because the PA#2 rubric does not mark CI.
By hand: An asked for the rules and chose the sources. Rules not yet reviewed with Khánh.

## 2026-11-06 — lecturer's announcement: static or React (written up 2026-11-07)
Tool: Claude Code (Claude Opus 5.5).
Asked for: what the announcement changes in our plan, then which option to pick after reading the session 6 starter in `theory/`.
Kept: the list of what changes, the limits for a small React build (no API, no router, `base: './'`), and the questions for the lecturer.
Changed: the assistant recommended static pages first. After An said the goal is to learn React early and it read session 6, it agreed static is safer for marks but React serves that goal.
Rejected: static pages for PA#2. An chose React.
By hand: the decision. No new rubric is published, so we work from the 2026-11-02 rubric plus the announcement; the "Fix these" list is still missing.

## 2026-11-07 — rules rewritten for React
Tool: Claude Code (Claude Opus 5.5).
Asked for: update the rules to the React decision, and start this log now.
Kept: the rewritten Stack and NEVER sections, and the rules from session 6 (`key={id}`, computed totals, no `dangerouslySetInnerHTML`).
Changed: the old rule "React starts in PA#3" and the JavaScript-off rules no longer apply, so they were replaced; the diff against 798a111 shows this. An added: no `Co-Authored-By` or "Generated with" line in commits or pull requests. The assistant picked plain CSS, the spacing scale, the breakpoints and the page names as defaults, for the team to confirm.
Rejected: a router library, because it adds a dependency and three built HTML files give real paths without one (not yet tried in a build).
By hand: An's decisions on React and on commit messages.

## 2026-11-07 — slow network and separate customer and management pages
Tool: Claude Code (Claude Opus 5.5).
Asked for: whether two remarks from the lecturer in class change our technology: run smoothly on Slow 4G, and keep customer and management pages separate to avoid building permissions.
Kept: no change of technology; a Slow 4G row in *Done means*, image and loading-shell rules, and separate layouts in one project.
Changed: An's idea was that separate pages reduce permission work. The assistant agreed for roles, but added that a page without a link is still open by its path, so real customer data will need a login on the server. The 3-second target is the assistant's suggestion for the team, not a lecturer's number.
Rejected: server rendering and a second project, because neither is needed for three pages and both add work before the deadline.
By hand: An reported both remarks from class. Not yet measured, because no page exists.

## 2026-11-07 — text for the Claude Design set-up form
Tool: Claude Code (Claude Opus 5.5), writing the text; Claude Design will use it next.
Asked for: what to fill in the design system form, with a 3D landing page and the same font as our earlier project, Thủ Tục Dễ.
Kept: the name and blurb, the notes text, and which upload fields to leave empty.
Changed: our files name three fonts for Thủ Tục Dễ (Inter, Noto Sans, Be Vietnam Pro), and the final Claude Design font was never recorded, so the assistant could not confirm "the same font". It proposed Be Vietnam Pro until An checks. It also limited 3D to CSS for now, because our rules forbid a new dependency and the page must stay smooth on Slow 4G.
Rejected: linking the GradStudio repository in the form, because we are changing its interface and the course says not to put a classmate's work in prompts; the story and features go in as text from the assigned topic.
By hand: An chose a 3D landing page and has a reference video, which the assistant has not seen yet.

## 2026-11-07 — 3D idea for the landing page
Tool: Claude Code (Claude Opus 5.5).
Asked for: fit An's idea into the Claude Design notes. Scrolling moves through a class or school set, shows different camera angles, and labels each step, so customers see the process and the frames they may get. Audience widened to school and university students about to graduate.
Kept: the updated notes text and the plan for a simple CSS scene with real text for each step.
Changed: the assistant checked the idea against the rubric and found a risk: 3D parts that extend past the screen would appear in the second Console line, so the starting view must fit inside the screen. Phones get a lighter version. Marked the angles and steps as examples, because the proposal does not describe them.
Rejected: three.js and pre-rendered image sequences for now, because of added download size on Slow 4G. Not measured; nothing is built yet.
By hand: An's idea, inspired by a video of a house built while scrolling. The assistant has not seen the video.

## 2026-11-07 — studying the reference video
Tool: Claude Code (Claude Opus 5.5), with ffmpeg to pull frames from the 11-second video.
Asked for: study the video for style, text layout, components and effects, and fit them to our page.
Kept: the structure seen in the frames: full-screen scene, step counter, two-line title with one accent line, progress ring, angle map, summary card at the end.
Changed: the assistant replaced its earlier CSS miniature idea, because the frames show a glowing line drawing that turns into a real photo. New proposal: an SVG line drawing of the classroom, a camera move with CSS, and a real photo fading in at each step.
Rejected: copying the video's tiny monospace labels, because our body text must be at least 16 px; a scrubbed video, because no footage exists and it would be heavy on Slow 4G. Not yet built or measured.
By hand: An supplied the video and asked for it to be studied. The site in it (Pennwick) is a style reference only; no name, image or text is copied.

## 2026-11-07 — reference sites for the design
Tool: Claude Code (Claude Opus 5.5).
Asked for: foreign photo studio websites to compare before we choose a look.
Kept: six sites, with a screenshot of each taken in headless Chrome.
Changed: nothing yet; the team has not chosen.
Rejected: Grace Chuang, listed as a photographer in the Colorlib roundup, because the screenshot showed a creative director's site with no photos; Flytographer, because its CSS failed to load in the screenshot. Several URLs the assistant guessed or found failed to load, and none of those are listed.
By hand: none.
