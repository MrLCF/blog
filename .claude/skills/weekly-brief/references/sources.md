# Source recipes

Exact endpoints, queries and parameters for each source. Phase 2 of the skill reads this.

Dates below are UTC unless stated. The user's timezone is Asia/Calcutta (UTC+05:30), so an item
timestamped late on one UTC day may be the next day locally. Filter on the published date in the
feed, not on when the email arrived.

---

## 1. Dark Reading

**Reach:** public RSS. No account needed.

```
https://www.darkreading.com/rss.xml
```

The feed holds 50 items, roughly two weeks. Items are headline-only: `description` runs
90–310 characters and there is no `content:encoded`. The feed gives you the list; the article
pages give you the substance.

**Listing.** Fetch the feed with Firecrawl (`formats: ["rawHtml"]`, `maxAge: 0`), parse the XML,
filter `pubDate` to the window. Expect 25–30 items in a full week, 4–5 per weekday.

If the Firecrawl result is too large for one tool response, it is written to a file. Parse that
file with a script rather than reading it whole.

**Extraction.** One Firecrawl call per article, `formats: ["json"]`, with this schema:

```json
{"type":"object","properties":{
  "title":{"type":"string"},
  "author":{"type":"string"},
  "date":{"type":"string"},
  "article_type":{"type":"string","description":"news, vendor press release, opinion/commentary, interview"},
  "summary":{"type":"string","description":"5-7 sentences, factual, in your own words"},
  "key_facts":{"type":"array","items":{"type":"string"}},
  "jargon_to_explain":{"type":"array","items":{"type":"string"}},
  "recommended_actions":{"type":"array","items":{"type":"string"}}}}
```

JSON mode costs 5 credits per page against 1 for markdown, and is worth it: markdown returns the
full page chrome and floods the context.

**Known quirks.**
- Vendor press releases sit in the same feed as reporting. `article_type` separates them. Expect
  3–5 per week. They belong in the marketing section.
- The feed sometimes carries the same story twice in different languages, days apart. Treat as one
  story and record the duplication.

---

## 2. CISO Series — Cybersecurity Headlines

**Reach:** Gmail. It arrives relayed through LinkedIn, **not** from a CISO Series domain. Searching
by publication name finds nothing.

```
from:newsletters-noreply@linkedin.com newer_than:14d
```

Then filter to the ones whose body starts `Cybersecurity Headlines / By CISO Series`. A search for
`"CISO Series"` also works and catches the relay.

**Reading.** `get_thread` with `messageFormat: "PLAIN_TEXT"`. The snippet is useless; the whole
issue is in the body. Each issue carries 7–9 stories as one run of prose with no separators, plus
sponsor lines and a podcast promotion to discard.

**Cadence.** One issue per weekday, but the LinkedIn relay batches: expect 5 issues for a week,
sometimes two arriving on the same day and none on another. Do not treat a missing calendar day as
a missing issue. Count issues, not days.

**Parallel stream.** `updates-noreply@linkedin.com` sends "CISO Series just posted new content"
notifications. These are not issues. Skip them. Some are auto-filed to Trash while the real issue
goes to Inbox, so pass `includeTrash: true` when auditing what arrived.

**Why it matters.** This is the widest sweep of the three and routinely carries vulnerabilities the
other two miss. It is usually the only source for edge-device and vendor zero-days.

---

## 3. RockCyber Musings

**Reach:** Substack on a custom domain. `rockcyber.substack.com` 302s to:

```
https://www.rockcybermusings.com
```

The Gmail sender is `rockcyber@substack.com`.

**Listing.** Use the archive API, not the rendered page:

```
https://www.rockcybermusings.com/api/v1/archive?sort=new&limit=10
```

Returns JSON with `title`, `post_date`, `canonical_url`, `slug`, `wordcount`, `audience` and
`postTags`. Filter `post_date` to the window. All posts are `audience: "everyone"` — nothing is
paywalled, so no sign-in is needed.

**Cadence.** Twice weekly, Tuesday and Friday. Expect exactly 2 posts in a full week.

- **Friday** — "Weekly Musings Top 10 AI Security Wrapup", a numbered issue covering the *previous*
  Friday-to-Thursday window. A Friday issue therefore reports stories that predate your window by up
  to a week. Keep them if the underlying event falls in your window; drop them if it does not.
- **Tuesday** — a single-topic opinion piece.

**Extraction.** Firecrawl `formats: ["json"]`. For the Friday wrapup use the Dark Reading schema
above. For the Tuesday opinion piece use:

```json
{"type":"object","properties":{
  "title":{"type":"string"},"date":{"type":"string"},
  "thesis":{"type":"string","description":"central argument in 3-5 sentences"},
  "evidence":{"type":"array","items":{"type":"string"}},
  "framework_proposed":{"type":"array","items":{"type":"string"}},
  "jargon_to_explain":{"type":"array","items":{"type":"string"}},
  "recommended_actions":{"type":"array","items":{"type":"string"}}}}
```

**Known quirks.**
- Issue numbers are not reliable. They jump from 54 to 57; the author has said this was a
  copy-and-paste error carried forward. Count posts, never issue numbers.
- The wrapup's own item count in the subtitle ("Eleven verified stories") can differ from the number
  of numbered sections. Count the sections.

**Why it matters.** The only source of the three for AI agent governance research — monitoring
coverage audits, agent evaluation papers, agency incident guidance. If a week's brief has a thin
agent-governance section, check this source was read properly before concluding the week was quiet.

---

## Adding a source

Give it a section with: how it is reached, how to list the window, how to extract, its cadence,
its quirks, and what it uniquely covers. The last one decides whether it earns a place — a source
that only repeats the others adds review cost and no information.
