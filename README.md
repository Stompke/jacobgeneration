# jacobgeneration

Website for jacobgeneration.com. The homepage is the Washington Prayer hour signup.

Visitors request one of 24 daily hours. A password-protected admin page approves, denies, or releases each request. Google Sheets is the roster.

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Until the variables in `.env.local` are set, the page still renders. Submit and the admin page explain what is missing.

| Variable | Purpose |
| --- | --- |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Service account client email |
| `GOOGLE_PRIVATE_KEY` | Service account private key, with newlines kept as `\n` |
| `GOOGLE_SHEET_ID` | The id in the sheet URL |
| `ADMIN_PASSWORD` | Shared password for `/admin` |

## Google Sheet

1. Create a spreadsheet and rename the first tab to `Signups`.
2. In Google Cloud, create a project, enable the Google Sheets API, and create a service account.
3. Create a JSON key for that account. Copy `client_email` into `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `private_key` into `GOOGLE_PRIVATE_KEY`.
4. Share the spreadsheet with the service account email as Editor.
5. Copy the spreadsheet id from the URL (`https://docs.google.com/spreadsheets/d/<id>/edit`) into `GOOGLE_SHEET_ID`.

The app writes this header if the tab is empty:

`id`, `hour`, `name`, `email`, `phone`, `note`, `status`, `created_at`, `updated_at`

`hour` is 0–23 in Pacific Time. `status` is `pending`, `approved`, `denied`, or `released`. Denied and released rows stay as history and do not block the hour.

Do not commit the JSON key or `.env.local`.

## Netlify

Connect the repo and leave the Next.js runtime in place. Do not publish the site as a static export. Set the same four environment variables in the Netlify site settings. The build command is `npm run build`.

Replace `public/hero.jpg` to change the hero photo.
