## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Project conventions

This repo holds two kinds of site in one Astro project:

1. **Pands Media** (the agency site) at `/`, `/porto`, and other top-level
   routes. Uses `src/layouts/PandsLayout.astro` and `data-brand="pands"`.
2. **Portfolio demos** under `/porto/<slug>/`. Each demo is a mockup of a
   different fictional business with its own branding. Uses
   `src/layouts/DemoLayout.astro`.

### Adding a demo

1. Add a markdown entry in `src/content/demos/`. The schema lives in
   `src/content.config.ts`. Set `status: siap` once the demo is viewable.
2. Add a brand token block in `src/styles/brands.css`, keyed on
   `[data-brand='<token>']`.
3. Add pages under `src/pages/porto/<slug>/`, passing `brandToken` to
   `DemoLayout`.
4. Put demo-only components in `src/components/demos/<slug>/`.

No navigation arrays need editing — the catalogue reads the content
collection.

### Theming

Tailwind v4, CSS-first. Semantic tokens are declared in `@theme` in
`src/styles/global.css` and overridden per brand in `src/styles/brands.css`.
Write `bg-brand`, `text-ink-muted`, `rounded-card` — never raw hex values or
palette classes like `bg-red-500` in demo components, or brand switching
breaks.

### Demo data

Demos are frontend-only. No backend, no database. Interactive demos (kasir,
inventory, e-commerce cart) hold state in React islands and reset on reload;
that is intentional. Mock data lives in `src/data/`.

Demo pages are `noindex` and excluded from the sitemap — they portray
fictional businesses and must not be indexed as real ones.

### Photos

Demo photos live in `src/assets/<demo>/` and are rendered through
`astro:assets` (`<Image>`), never a plain `<img>` or a remote URL. Keep source
files under ~500 KB; Astro generates the responsive WebP variants at build.

Kencana Print's photos came from Unsplash (free licence, no attribution
required). Alt text is kept in `fotoAlt` in `src/data/kencana-print.ts`, not
inline, so it stays with the data.

Never use a photo that shows a real company's logo or branding — the demos
portray fictional businesses and must not look like they belong to a real one.
