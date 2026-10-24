export const SITE = {
  title: 'Lysander Clemark Fernandes',
  description: 'Essays on AI, automation and enterprise architecture.',
  author: 'Lysander Clemark Fernandes',
  nav: [
    { label: 'Essays', href: '/' },
    { label: 'About', href: '/about/' },
  ],
};

// Prefix internal paths with the configured base so links work under a project repo.
export function url(path: string) {
  if (/^https?:\/\//.test(path)) return path;
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${path}`;
}
