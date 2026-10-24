# Brief checklist

The at-a-glance version of the eight gates. The authoritative definitions live in
`.claude/agents/brief-reviewer.md`. The pipeline that runs them lives in
`.claude/skills/weekly-brief/SKILL.md`.

The reviewer decides whether a gate passes. Do not mark one yourself.

## Before writing

- [ ] Window fixed: start date, end date, stated in the document
- [ ] Sources listed, with how each one is reached
- [ ] Output decided: reply, artifact, or repo post
- [ ] Manifest file started — every item gets title, date, author, source, URL, extraction path

## Before review

- [ ] Counts reconcile: published items − duplicates = unique stories
- [ ] Conflict section written and placed near the top
- [ ] Each merged entry tagged with every contributing source
- [ ] Each technical term defined at first use
- [ ] Vendor announcements separated and labelled as marketing
- [ ] One quotation per source maximum, each under 15 words

## The eight gates

| # | Gate | Fails when |
|---|---|---|
| 1 | Coverage | A manifest item has no entry. Stated counts do not reconcile. |
| 2 | Deduplication | The same event appears twice. A merged entry omits a contributing source. |
| 3 | Attribution | A claim has no source. A quotation runs over 15 words or repeats from one source. A link is broken. |
| 4 | Conflicts | A contested number is stated as settled. Figures from two studies are combined. |
| 5 | Fabrication | A specific cannot be found in any source. The draft is more precise than its source. |
| 6 | Language | Sentence over 20 words (instruction) or 25 (descriptive). Passive voice. Undefined term. Inconsistent terminology. |
| 7 | Build | Schema violation, build failure, or wrong draft flag. |
| 8 | Priority | An *Act now* entry with no available action. An *Awareness* entry describing active exploitation. |

## The loop

1. Write the draft to a file.
2. Run `brief-reviewer` with the draft path, manifest path, window and pass number.
3. PASS → deliver. FAIL → fix every BLOCKER and MAJOR.
4. Re-run with the pass number incremented. The reviewer re-reads the whole draft.
5. Stop at pass 3. A BLOCKER that survives three passes goes to the user, not to main.

Severity: **BLOCKER** stops the commit. **MAJOR** stops publication but a draft commit is fine. **MINOR** is recorded.

## Before commit

- [ ] Reviewer returned `VERDICT: PASS`
- [ ] `npm run build` clean
- [ ] `draft:` flag matches what the user asked for
- [ ] Commit message states the window, the counts, and the draft state
