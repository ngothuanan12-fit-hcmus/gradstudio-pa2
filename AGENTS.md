# Rules for assistants

Read `CLAUDE.md` first. It is the team's rules file and applies to every assistant, whichever tool you are.

- Design tokens and component behaviour: `design-system/`. Start with `design-system/README.md`.
- Code analysis: use CodeGraph (`codegraph_explore` / `codegraph explore`) for semantic symbols, callers, call paths, and impact; use `ast-grep` CLI for structural syntax evidence; reconcile both before broad edits.
- Commit messages and pull requests carry no `Co-Authored-By` or "Generated with" line.
