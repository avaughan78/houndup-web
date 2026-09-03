# houndup-web

Static marketing/legal site for [Hound-Up](https://houndup.atomlabs.dev), a
native iOS app for solo UK dog walkers. This repo is just the public-facing
pages — the app itself lives in a separate repo.

## What it does

- `index.html` — a minimal landing/index page linking to the legal pages.
- `privacy.html` — the app's privacy policy: what data stays on-device,
  what the optional iCloud sync does, what the invoice-email, support-message,
  booking-parsing, and calendar-feed features send to which third party, and
  the sub-processor list (Supabase, Resend, Microsoft Azure OpenAI, Apple
  iCloud/CloudKit).
- `terms.html` — terms of service.
- `support.html` — support contact info and FAQ (offline behavior, no
  accounts, where data goes).

Styling (`style.css`) mirrors the native app's own design tokens (color
values are copied from `DesignSystem/Sources/DesignSystem/Colors/ColorTokens.swift`
in the app repo) and supports both light/dark via `prefers-color-scheme` and
a `data-theme` override.

## Architecture

Plain static HTML/CSS — no framework, no build step, no `package.json`.
Hosted on GitHub Pages under a custom domain (`houndup.atomlabs.dev`, via the
`CNAME` file) and deployed automatically by the GitHub Actions workflow at
`.github/workflows/static.yml`: every push to `main` uploads the entire repo
as a Pages artifact and deploys it, no build/compile step involved.

## Tech stack

| Category | Tech |
|---|---|
| Markup / styling | Plain HTML5 + CSS (no framework, no build tooling) |
| Hosting | GitHub Pages, custom domain via `CNAME` |
| Deployment | GitHub Actions (`.github/workflows/static.yml`) — auto-deploys on push to `main` |

## Local development

No build step — open any `.html` file directly in a browser, or serve the
directory with any static file server (e.g. `python3 -m http.server`).
