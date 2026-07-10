---
description: Re-sync the Carbon design-system bundle and push changes to the Claude Design project
---

Run a full design-sync re-sync and, if there's anything to ship, push it to the Claude Design project (`.design-sync/config.json`'s `projectId`).

Follow `.ds-sync/storybook/SKILL.md` exactly — it's the maintained, authoritative procedure for this repo's sync shape. Do not improvise or paraphrase steps from memory; re-read the file now, since it may have changed since your training. In order:

1. Read `.design-sync/NOTES.md` first (its "Re-sync risks" section is the current watch-list).
2. Follow SKILL.md §7 ("Re-syncs — one command routes the work") end to end: fetch the anchor, run the driver (`make design-sync` runs the same `resync.mjs` invocation §7 step 3 describes — use it), and act on every field of the verdict per its table, including grading any `pendingGrade` sheets and confirming any `canary` spot-checks.
3. Run the conventions-header step called out in §7 step 5 before any upload.
4. Follow §6 ("Upload") for the actual `DesignSync` `finalize_plan` → `write_files`/`delete_files` sequence, including the sentinel-first / `_ds_sync.json`-last ordering and the "what stays local" exclusions. `finalize_plan` will surface a permission prompt — that's expected, not an error; if it's denied, stop and tell me rather than retrying.
5. If `upload.any` is false, just report that the project already matches the build — no push needed.
6. Finish with the handoff audit at the end of §6: `git status` the `.design-sync/` durable set, check whether NOTES.md needs updates, and offer to commit if anything changed. Don't commit without asking me.
