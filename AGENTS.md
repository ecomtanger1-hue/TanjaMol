# Project Editing Rules

- Start every task by checking `PROJECT_MAP.md` for the relevant files, data flow, and common debugging path.
- Start by locating the smallest set of files that can satisfy the request. Do not refactor nearby code unless the task requires it.
- Before editing, inspect the relevant code path and identify whether the issue is display, save/load, database, or deployment related.
- Prefer one or two focused patches over broad rewrites. If a change starts expanding, pause and re-check the simpler path.
- For UI/copy fixes, avoid touching unrelated JSX blocks. Patch exact lines or small components only.
- Run fast checks early after risky edits, not only at the end. For this project that usually means `npm.cmd run encoding:check`, then `npm.cmd run build` before publishing.
- If a tool or patch fails twice because of encoding or matching issues, stop using that approach and switch to a safer narrow edit. Do not keep retrying broad replacements.
- Review `git diff --stat` and the focused diff before committing. A small request should not produce a surprisingly large diff.
- Leave unrelated untracked files alone unless the user explicitly asks to include them.
- Preserve Arabic text as UTF-8. Arabic encoding corruption is a release blocker.
- Do not use broad PowerShell `Set-Content` rewrites on files containing Arabic text.
- Prefer `apply_patch` for manual edits. If scripted edits are necessary, use UTF-8-safe Node scripts and keep them narrowly scoped.
- Run `npm.cmd run encoding:check` before committing or publishing UI/copy changes.
- If Arabic text must be inserted by script, prefer Unicode escapes or verify the exact diff before build.
