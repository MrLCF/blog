// Usage: npm run new "Post title"
// Creates src/content/posts/<slug>.md as a draft dated today.
import { existsSync, writeFileSync } from 'node:fs';

const title = process.argv.slice(2).join(' ').trim();
if (!title) {
  console.error('Give the post a title: npm run new "My post title"');
  process.exit(1);
}

const slug = title
  .toLowerCase()
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '');
const file = `src/content/posts/${slug}.md`;

if (existsSync(file)) {
  console.error(`${file} already exists.`);
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  file,
  `---
title: ${JSON.stringify(title)}
description: ""
date: ${today}
tags: []
draft: true
---

Start writing here.
`,
);
console.log(`Created ${file}. Set draft: false when it's ready to publish.`);
