---
name: weekly-brief
description: Build, review and publish a deduplicated security brief for a requested week. Pulls Dark Reading, CISO Series and RockCyber Musings for the window, merges them so no item repeats, runs the brief-reviewer loop until it passes, then commits, pushes and verifies the deploy. Use when the user asks for a weekly security brief, asks what happened this week or last week across their sources, names a week or a date range and asks for the brief, or says to run the brief. Also use for any post in this repo assembled from external reporting.
---

# Weekly security brief

One week, three sources, one record. Nothing said twice. Nothing claimed that a source does not support.

This skill was rewritten after the week 43 run, which took seven commits to land. Every rule below with a **Why** note exists because its absence cost a rework. Follow them and the brief lands in one pass.

`references/sources.md` holds the endpoints, queries and per-source quirks. Read it in Phase 2.

---

## Phase 0 — Resolve the week

Call `mcp__claude_ai__current_time` first. Never infer today's date from anything else.

| They say | You take |
|---|---|
| "this week" | Monday of the current week to today |
| "last week" | Monday to Sunday of the previous week |
| "week 43" | ISO week 43 of the current year, Monday to Sunday |
| "19–24 October" | Exactly those dates, inclusive |
| nothing | Monday of the current week to today |

State the resolved window in one line. Then work. Derive the slug now — `week-<NN>-security-brief` — and use it everywhere downstream.

If `.claude/manifests/week-<NN>-<YYYY>.json` exists, this week was built before. Say so and ask whether to rebuild. Never silently overwrite.

---

## Phase 1 — Set up

```bash
mkdir -p "$SCRATCH/brief-<NN>/raw"
```

Raw scrapes go to the scratchpad. Only the manifest and the post reach the repo.

---

## Phase 2 — Collect

Read `references/sources.md` now.

For each source, **list the items in the window before reading any of them**. That list is what Gate 1 checks against.

### Save every extraction to a file. This is not optional.

Write each Firecrawl or email extraction to `$SCRATCH/brief-<NN>/raw/<source>-<n>.json` **as you receive it**, before moving to the next item.

> **Why.** On the week 43 run the raw files were skipped and the manifest was written from memory with compressed `facts` fields. The reviewer then returned 13 blockers, of which **8 were false positives** — claims that were correct and sourced, but unprovable from a lossy manifest. That is a wasted review pass and an hour of triage. The reviewer can only check what is on disk.

### Fidelity rule

A manifest `facts` field must carry **every specific** in the extraction: each named company, person, CVE, version, percentage, count, date and quoted statement. Do not summarise it. If the extraction says "SharkNinja says only a product-support information site was affected", that sentence goes in. A fact you compress out is a fact the reviewer will call fabricated.

If a source returns nothing for the window, record that it returned nothing. An empty source is a finding worth reporting, not an error.

---

## Phase 3 — Build the manifest and reconcile

### Granularity is the story, not the published item

A newsletter issue is **one published item** carrying **eight or nine stories**. Dark Reading articles are one story each. Give every story its own manifest entry with its own id.

Write to `.claude/manifests/week-<NN>-<YYYY>.json`:

```json
{
  "window": { "iso_week": 43, "year": 2026, "start": "...", "end": "...", "resolved_at": "..." },
  "counts": {
    "published_items": 36,
    "stories": 82,
    "by_source": { "Dark Reading": 29, "CISO Series": 41, "RockCyber Musings": 12 }
  },
  "stories": [
    { "id": "dr-01", "source": "...", "date": "...", "author": "...", "type": "news|opinion|vendor",
      "title": "...", "url": "...", "extraction": "raw/dr-01.json", "facts": "..." }
  ]
}
```

### The reconciliation identity

```
stories − merged_records = unique_entries
```

**Never** `published_items − duplicates = unique`. Those two counts are on different scales and the subtraction is meaningless.

> **Why.** The week 43 draft claimed "36 published items and 62 unique stories". 36 − D = 62 has no solution. The real chain was 82 stories, 20 of which merged into 11 shared entries, leaving 62. Gate 1 failed on the arithmetic alone.

Mark two things in the manifest as you build it, because the reviewer checks for them:

- `CONFLICT:` on any figure where two sources disagree, naming both figures and both sources.
- `DUPLICATE of <id>` where one source ran the same story twice.

---

## Phase 4 — Deduplicate

Group by underlying event, never by headline. Two articles about the same CVE are one story. The same technique in two incidents is one topic.

For each merged story write **one** entry carrying facts from every contributing source, tagged with all of them. Prefer the most specific version of each fact and name which source gave it.

Where sources disagree, record both figures with both attributions. Never pick one silently. Never combine figures from two different campaigns into one claim.

---

## Phase 5 — Write

### Say it once

Each fact appears in exactly one place in the document. The week 43 draft passed story-level deduplication and still repeated itself across layers. All four of these are banned:

- **No conflict block at the top.** Put each contested figure inside its own entry, marked `**Contested.**`, beside the facts that give it context. A top block states every contested number twice.
- **No source scorecard that re-lists stories.** Give counts and one line of character per source. Readers see unique coverage from the tags: a single tag means only that source carried it.
- **No closing scope note that restates the intro counts.** State counts once, in the intro.
- **No topic split across sections.** One technique is one entry. ClickFix delivered by a Windows utility and ClickFix delivered by a signed vendor binary are two variants of one entry, not two entries in two sections.

### Synthesise actions, do not mirror them

Write "What to do" from all contributing sources combined and in your own order. Do not reproduce one source's action list bullet for bullet in its own sequence. Rewording into Simplified Technical English does not make a reproduced list original.

> **Why.** Gate 3 flagged systematic bullet-for-bullet tracking across seven entries, which contradicted the brief's own claim to give summaries rather than reproductions. The claim had to be deleted.

### Structure

- Order sections by urgency, not by date.
- Label every story *Act now*, *Monitor* or *Awareness*. *Act now* requires an available repair, active exploitation, or a deadline, **and** at least one concrete action. Active exploitation of equipment the reader may run is never *Awareness*.
- Define each technical term at its first use. Check the ones that slip through: Graph permissions, DLL, PyPI, API, SSO, RAT, VPN.
- One term per concept. If the heading says "patch", the body says "patch", not "repair".
- Keep vendor announcements in their own section, labelled as marketing.
- Summarise, never reproduce. One quotation per source at most, under 15 words.
- ASD-STE100: 20 words for an instruction, 25 for a descriptive sentence, active voice, six sentences per paragraph.

Write to `src/content/posts/<slug>.md`. Read `src/content.config.ts` for the schema. Set `draft: true`, and tags including `News`.

---

## Phase 6 — The review loop

```
pass = 1
while pass <= 3:
    run brief-reviewer with draft path, manifest path, window, pass
    if VERDICT == PASS: break
    triage findings, apply fixes
    pass += 1
```

Spawn with the Agent tool, `subagent_type: "brief-reviewer"`, `run_in_background: false`.

If that agent type is not found, the repo was attached after the session began and its `.claude/agents` were not loaded. Fall back to `subagent_type: "claude"`, tell it to read `.claude/agents/brief-reviewer.md` and follow it exactly, and **withhold edit authority in the prompt**. Say in your report that the read-only guarantee came from instruction rather than from the tool list.

### Triage: two classes of finding

Not every finding is a draft defect. Sort each one before fixing:

| Class | Test | Fix |
|---|---|---|
| **Draft defect** | The draft is wrong, or says more than any source supports | Fix the draft |
| **Manifest defect** | The draft is right and the source says so, but the manifest does not carry the evidence | Fix the **manifest**, not the draft. Record it as a manifest defect in your report |

A manifest defect is still a failure — of Phase 2, not of the writing. Do not let it masquerade as a clean result, and do not change correct prose to match an incomplete manifest.

Everything else: fix the finding, do not argue with it. If the reviewer misread something, the draft was ambiguous enough to mislead a careful reader.

The reviewer re-reads the whole draft each pass, not the diff. Never mark a gate passed yourself.

**At pass 3 with a BLOCKER open: stop.** Do not publish. Report which gate is failing and why the fix is not landing.

---

## Phase 7 — Publish

Only after `VERDICT: PASS`, unless the user has explicitly asked for it live sooner. If they have, fix every draft-defect blocker first and say plainly in your report that the gate was not re-passed.

```bash
npm run build        # page count rises by one when draft is false
git add src/content/posts/<slug>.md .claude/manifests/week-<NN>-<YYYY>.json
git commit
git fetch origin main
git push origin HEAD:main
```

Commit message:

```
Add week <NN> security brief

<window>. <N> published items carrying <S> story records; <D>
merge into <E> shared entries, leaving <U> unique stories.

Reviewer: PASS on pass <p>. <b> draft defects and <m> manifest
defects fixed.
```

### Verify the deploy, do not assume it

```bash
gh run list --limit 1 --json status,conclusion,headSha
```

Poll until `completed success` on your commit SHA. The Pages site is usually **not on the session network allowlist**, so `curl` and WebFetch against it fail with a proxy 403 that means nothing about the deploy. Verify from the workflow conclusion and the local build page count instead, and say so rather than claiming you loaded the page.

---

## Phase 8 — Clean up

```bash
rm -rf "$SCRATCH/brief-<NN>/raw"
rm -rf dist
git status --short        # must be empty
```

Keep the manifest. It is the audit trail and the input to any later re-review.

A stop hook in this environment fails the turn on untracked files. Commit or remove everything before you finish.

---

## Phase 9 — Report

In this order, nothing more:

1. Window, and the count chain: published items → story records → merges → unique entries.
2. Reviewer verdict and the pass it passed on. Separate **draft defects fixed** from **manifest defects fixed**; the split is the interesting part.
3. Commit hash, draft state, deploy conclusion.
4. Anything a source did worth knowing: a newsletter that stopped arriving, a story run twice, an issue-number gap.

Do not recap the brief's content. The user can open it.

---

## Honesty about the output

A merged brief summarises other people's reporting. It is a working document. Being well organised does not make it original work.

When the user wants to publish one under their own name, say so once, plainly, then do what they ask. Once. Repeating it is nagging, and the decision is theirs.
