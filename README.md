# Emaar India Business Centre — Website

A fast, SEO-friendly marketing website for Emaar India Business Centre with lead capture via serverless email, modern UI, responsive layout, and accessibility enhancements.

## Features

- Grade-A corporate project microsite with premium UI
- Responsive layout and optimized images (WebP)
- Accessible `<details>/<summary>` FAQs
- Lead capture forms (modal + footer) posting to `/api/enquiry`
- Serverless email via Nodemailer (Vercel function)
- Download helpers (if re-enabled) for plans/media

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Serverless: Vercel Functions (`api/enquiry.js`) with Nodemailer
- Tooling: JSZip CDN for on-the-fly zips (optional)

## Getting Started (Local)

1. Install Vercel CLI (recommended for serverless functions):
   ```bash
   npm i -g vercel
   ```
2. Copy environment template and fill values:
   ```bash
   # On Windows PowerShell
   Copy-Item vercel.env.example .env.local
   ```
3. Run local dev (enables `/api` functions):
   ```bash
   vercel dev
   ```
4. Open http://localhost:3000

Note: Static preview servers (e.g., Live Server) won’t run `/api` functions. Use `vercel dev` for form submissions.

## Environment Variables

Set in Vercel Project Settings or `.env.local` for `vercel dev`:

- `SMTP_HOST` — SMTP host (e.g., smtp.gmail.com)
- `SMTP_PORT` — SMTP port (e.g., 587)
- `SMTP_USER` — SMTP username
- `SMTP_PASS` — SMTP password or app password
- `MAIL_FROM` — From email (e.g., "Leads <no-reply@domain>")
- `MAIL_TO` — Destination email for leads

See `vercel.env.example` for a reference.

## Deployment

1. Push code to GitHub.
2. In Vercel, import the GitHub repo and set the environment variables.
3. Deploy. PRs automatically get Preview URLs; `main` gets Production.

CLI deploy (optional):
```bash
vercel
vercel --prod
```

## Project Structure

```
.
├─ api/
│  └─ enquiry.js          # Serverless function handling form submissions
├─ images/                 # Optimized WebP images (banner, gallery, plans)
├─ index.html              # Main site
├─ style.css               # Styles, including premium FAQ section
├─ script.js               # Modal, forms, and UI interactions
├─ form.php                # Legacy fallback (can be removed if JS-only)
├─ package.json            # Project metadata
├─ vercel.env.example      # Sample env vars
└─ README.md
```

## Forms

- Popup Form (`#enquiry-form`) and Footer Form (`#footer-form`) both POST to `/api/enquiry` via fetch in `script.js`.
- Default project label: "Emaar India Business Centre".
- If you want a no-JS fallback, set `action="/api/enquiry" method="post"` and ensure `api/enquiry.js` accepts `application/x-www-form-urlencoded` (recommended tweak below).

## Troubleshooting

- 405 Method Not Allowed on `/api/enquiry`:
  - Cause: Running on a static server; serverless functions aren’t available.
  - Fix: Use `vercel dev` locally or test on the deployed Vercel URL.

- Emails not sending:
  - Check SMTP credentials and allow SMTP/App Passwords.
  - Verify `MAIL_FROM` and `MAIL_TO` are valid.
  - Check Vercel function logs.

- Images not loading:
  - Confirm correct paths in `index.html` and that files exist in `images/`.

## License

Proprietary — All rights reserved.
