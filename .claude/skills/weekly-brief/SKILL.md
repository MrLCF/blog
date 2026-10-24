---
name: weekly-brief
description: Build a deduplicated multi-source security brief for a date window and run it through a review loop before committing. Use when the user asks for a weekly brief, a news roundup across several sources, a merged report from newsletters and feeds, or asks what happened this week across their security sources. Also use when adding a post to this blog that is assembled from external reporting.
---

# Weekly multi-source brief

Produce one record of a week from several sources, with every story appearing once, and no claim that a source does not support.

The review loop is not optional. Content assembled from many sources fails in ways the author cannot see: a dropped item, a story entered twice under different headlines, a number carried across from the wrong campaign. A reviewer that has not seen the research catches those. The author does not.

## Phase 1 — Fix the window

Settle these before scraping. Write them into the manifest.

- **Window.** Start and end dates, inclusive. "This week" means Monday to the current day unless the user says otherwise. State the reading you took.
- **Sources.** Which publications, and how each is reached (RSS, email, API).
- **Output.** Conversation reply, HTML artifact, or a post in this repo. Ask only if the request leaves it genuinely open.

## Phase 2 — Collect, and build the manifest

Work source by source. For each source, list the items in the window **before** reading any of them.

- **RSS or API.** Fetch the feed, parse it, filter by date. Substack publications expose `/api/v1/archive?sort=new&limit=N`, which is more reliable than the rendered archive page.
- **Email newsletters.** Search the mailbox by sender and date. Read the full body, not the snippet. A newsletter relayed through LinkedIn arrives from `newsletters-noreply@linkedin.com`, not from the publication, so search by content as well as by sender.
- **Web pages.** Scrape with Firecrawl. Request structured JSON rather than markdown: ask for title, author, date, type, summary, key facts, jargon and recommended actions. The result is a fraction of the size of the full page and carries more signal.

Write every item to a manifest file as you go: title, date, author, source name, URL, and the path of the saved extraction. The reviewer needs this file. Without it, Gates 1 and 5 cannot run.

Reconcile the count before you move on. Published items, minus duplicates, equals unique stories. If it does not, you have lost something.

## Phase 3 — Deduplicate

Group by underlying event, not by headline. Two articles about the same CVE are one story.

For each merged story, write a single entry that carries the facts from every source, tagged with all of them. Prefer the most specific version of each fact, and name which source gave it.

Where sources disagree on a number, do not pick one. Record both, attribute both, and put the disagreement in a conflict section near the top of the document. Never combine figures from two different campaigns or studies into one claim.

## Phase 4 — Write

- Lead with the conflict section. A reader who quotes a contested number without knowing it is contested is the failure this document exists to prevent.
- Order sections by urgency, not by date.
- Give each story a priority label, and make *Act now* mean there is an action available this week.
- Define each technical term at its first use.
- Keep vendor announcements in their own section, marked as marketing material.
- Summarise. Never reproduce. One quotation per source at most, under 15 words.

## Phase 5 — The review loop

This is the part that makes the output trustworthy.

1. Write the draft to a file.
2. Spawn the `brief-reviewer` agent. Give it the draft path, the manifest path, the window, and the pass number. Run it in the foreground; the next step depends on its verdict.
3. Read the findings.
   - **PASS** — go to Phase 6.
   - **FAIL** — fix every BLOCKER and every MAJOR. Do not argue with a finding; if the reviewer is wrong, the draft was ambiguous enough to mislead a careful reader, which is its own defect.
4. Re-run the reviewer with the pass number incremented. It reviews the whole draft again, not the diff.
5. Stop at pass 3. If a BLOCKER survives three passes, do not commit. Report to the user which gate is failing and why the fix is not landing.

Never run the reviewer in the same context that wrote the draft. The whole value is that it has not seen the research and cannot fill a gap from memory.

Never mark a gate passed yourself. The reviewer decides.

## Phase 6 — Deliver

For a post in this repo:

- Markdown in `src/content/posts/<slug>.md`. Read `src/content.config.ts` for the schema; do not assume the fields.
- Commit with `draft: true` unless the user has said to publish. Drafts are excluded from the production build, so a push is safe and reversible.
- Run `npm run build` before committing. A schema violation fails the build.
- Tell the user the commit hash, the draft state, and the one change that publishes it.

For an HTML artifact: colour tokens for both themes, an explicit background on `body`, a 16px side gutter, and no horizontal scroll at 400px.

## Honesty about the output

A merged brief is a summary of other people's reporting. It is a working document. It is not original work, and it does not become original work by being well organised.

When the user wants to publish one under their own name, say so once, plainly, and then do what they ask. Say it once. Repeating it is nagging, and the decision is theirs.
