# Project Editing Rules

- Preserve Arabic text as UTF-8. Arabic encoding corruption is a release blocker.
- Do not use broad PowerShell `Set-Content` rewrites on files containing Arabic text.
- Prefer `apply_patch` for manual edits. If scripted edits are necessary, use UTF-8-safe Node scripts and keep them narrowly scoped.
- Run `npm.cmd run encoding:check` before committing or publishing UI/copy changes.
- If Arabic text must be inserted by script, prefer Unicode escapes or verify the exact diff before build.
