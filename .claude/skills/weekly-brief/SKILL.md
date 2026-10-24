---
name: weekly-brief
description: Build, review and publish a deduplicated security brief for a requested week. Pulls Dark Reading, CISO Series and RockCyber Musings for the window, merges them into one record, runs the brief-reviewer loop until it passes, then commits and pushes to this repo and cleans up. Use when the user asks for a weekly security brief, asks what happened this week or last week across their sources, names a week or a date range and asks for the brief, or says to run the brief. Also use for any post in this repo assembled from external reporting.
---

# Weekly security brief

One command, one week, one record. Collect from three sources, merge, review until it passes, push.

The review loop is not optional and you do not run it yourself. Content assembled from many sources fails in ways its author cannot see: a dropped item, one story entered twice under different headlines, a figure carried over from the wrong campaign. Only a reviewer that has not seen the research catches those.

`references/sources.md` holds the exact endpoints and queries. Read it in Phase 2.

---

## Phase 0 — Resolve the week

The user gives you a week in one of several forms. Resolve it to two dates before anything else.

| They say | You take |
|---|---|
| "this week" | Monday of the current week to today |
| "last week" | Monday to Sunday of the previous week |
| "week 43" | ISO week 43 of the current year, Monday to Sunday |
| "19–24 October" | Exactly those dates, inclusive |
| nothing | Monday of the current week to today |

Call `mcp__claude_ai__current_time` first. Do not infer today's date from anything else.

State the resolved window in one line before you start. Then stop asking and work.

Derive the slug now: `week-<NN>-security-brief`, where NN is the ISO week number. Everything downstream uses it.

---

## Phase 1 — Set up

```
mkdir -p "$SCRATCH/brief-<NN>/raw"
```

Use the session scratchpad, not the repo, for raw scrapes. Only the manifest and the post get committed.

If `.claude/manifests/week-<NN>-<YYYY>.json` already exists, this week has been built before. Tell the user, and ask whether to rebuild or to stop. Do not silently overwrite.

---

## Phase 2 — Collect

Read `references/sources.md` now. It has the endpoints, the Gmail queries and the Firecrawl parameters.

Work one source at a time. For each, **list the items in the window before reading any of them**. The list is what Gate 1 checks against.

Save every extraction to `$SCRATCH/brief-<NN>/raw/<source>-<n>.json`. The reviewer reads these.

Order matters only in that a source that fails should not stop the others. If a source returns nothing for the window, record that it returned nothing. An empty source is a finding, not an error — a newsletter that stopped arriving is worth telling the user about.

Build the manifest as you go. One object per item:

```json
{
  "source": "Dark Reading",
  "title": "...",
  "author": "...",
  "date": "2026-10-21",
  "url": "https://...",
  "extraction": "raw/dr-14.json",
  "type": "news | opinion | vendor"
}
```

Write it to `.claude/manifests/week-<NN>-<YYYY>.json` with a header carrying the window, the resolved dates, the source list and the per-source counts.

**Reconcile before moving on.** Published items, minus merged duplicates, equals unique stories. If the arithmetic does not close, you have lost something. Find it now; Gate 1 will fail otherwise and you will have wasted a review pass.

---

## Phase 3 — Deduplicate

Group by underlying event, never by headline. Two articles about the same CVE are one story. The same breach reported by three sources is one story.

For each merged story, write one entry carrying the facts from every source, tagged with all of them. Prefer the most specific version of each fact and name which source supplied it.

Where sources disagree on a number, **do not pick one**. Record both figures, attribute both, and put the disagreement in a conflict section near the top. Never combine figures from two different campaigns or studies into a single claim.

---

## Phase 4 — Write

- Open with the conflict section. A reader who quotes a contested number without knowing it is contested is the failure this document exists to prevent.
- Order sections by urgency, not by date.
- Label every story: *Act now*, *Monitor*, *Awareness*. *Act now* means an action is available this week.
- Define each technical term at its first use.
- Keep vendor announcements in their own section, marked as marketing material.
- Summarise; never reproduce. One quotation per source at most, under 15 words.
- Write in ASD-STE100 Simplified Technical English: short sentences, active voice, one idea per sentence, one term per concept.

Write to `src/content/posts/<slug>.md`. Read `src/content.config.ts` for the frontmatter schema; do not assume the fields. Set `draft: true`.

---

## Phase 5 — The review loop

```
pass = 1
while pass <= 3:
    run brief-reviewer (foreground) with:
        draft path, manifest path, window, pass number
    if VERDICT == PASS: break
    fix every BLOCKER and every MAJOR
    pass += 1
```

Spawn the `brief-reviewer` agent with the Agent tool, `subagent_type: "brief-reviewer"`, `run_in_background: false`. The next step depends on the verdict, so it runs in the foreground.

Rules for the loop:

- Fix findings. Do not argue with them. If the reviewer misread something, the draft was ambiguous enough to mislead a careful reader, which is its own defect.
- The reviewer re-reads the whole draft each pass, not the diff. A fix in one section breaks coverage in another.
- Never mark a gate passed yourself. The reviewer decides.
- Never run the reviewer in this context. Its value is that it has not seen the research and cannot fill a gap from memory.

**At pass 3 with a BLOCKER still open: stop.** Do not commit. Report to the user which gate is failing, what the finding says, and why the fix is not landing. A brief that cannot pass its own checks does not go to the repo.

MAJORs may remain open only if the user has said to commit as a draft anyway. BLOCKERs never may.

---

## Phase 6 — Build, commit, push

Only after `VERDICT: PASS`.

```bash
npm run build                    # schema violations fail here
git add src/content/posts/<slug>.md .claude/manifests/week-<NN>-<YYYY>.json
git commit                       # message format below
git fetch origin main
git push origin HEAD:main
```

Commit message:

```
Add week <NN> security brief (draft)

<window>. <N> published items from <S> sources, <M> unique
stories, <D> duplicates merged.

Reviewer: PASS on pass <p>. <b> blockers and <m> majors fixed.

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: <session url>
```

`draft: true` keeps the post out of the production build, so the push is safe and reversible. Publishing is the user's decision, not a step in this skill. Do not set `draft: false` unless they have said so in this conversation.

---

## Phase 7 — Clean up

```bash
rm -rf "$SCRATCH/brief-<NN>/raw"     # raw scrapes, superseded by the manifest
rm -rf dist                          # build output
git status --short                   # must be empty
```

Keep the manifest. It is the audit trail, and it is what lets the reviewer run again later against the same draft.

Confirm `git status --short` returns nothing. A stray file means something was written to the repo that nobody decided to commit. Find it rather than ignoring it.

---

## Phase 8 — Report

Tell the user, in this order and nothing more:

1. The window, and the counts: published items, unique stories, duplicates merged.
2. The reviewer verdict and which pass it passed on. Name the blockers that were fixed; those are the interesting part.
3. The commit hash and the draft state.
4. The one change that publishes it: `draft: false`.
5. Anything a source did that is worth knowing — a newsletter that stopped arriving, a feed that duplicated a story, an issue-number gap.

Do not recap the brief's content. The user can open it.

---

## Honesty about the output

A merged brief is a summary of other people's reporting. It is a working document. It does not become original work by being well organised.

When the user wants to publish one under their own name, say so once, plainly, then do what they ask. Say it once. Repeating it is nagging, and the decision is theirs.
