# Lysander Clemark Fernandes — blog

An Editorial-style blog built with [Astro](https://astro.build) and deployed to GitHub Pages.

## Write a post

```bash
npm run new "My post title"
```

This creates a draft in `src/content/posts/`. Write in Markdown, then set `draft: false` in the frontmatter when it's ready. Drafts appear in `npm run dev` but not on the live site.

| Frontmatter   | Purpose                                  |
| ------------- | ---------------------------------------- |
| `title`       | Headline                                 |
| `description` | Standfirst under the headline, and SEO   |
| `date`        | Publish date, `YYYY-MM-DD`               |
| `tags`        | Optional list, e.g. `[ai, automation]`   |
| `draft`       | `true` hides the post from the live site |

## Preview locally

```bash
npm install
npm run dev
```

## Publish

Push to `main`. The workflow in `.github/workflows/deploy.yml` builds the site and deploys it.

One-time setup: in the GitHub repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Customise

- Name, description and menu links: `src/site.config.ts`
- Colours and typography: `src/styles/global.css`
- About page: `src/pages/about.astro`
- Custom domain: add it under **Settings → Pages**, then point your DNS at GitHub Pages.
