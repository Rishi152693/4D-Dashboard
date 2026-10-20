# Project Dashboard Hub
Login (ID + password), roles (admin / viewer), project-wise access, per-project P6 + 3D dashboard.

- `api/` serverless functions (auth, users, projects, upload, file)
- `public/` login + gallery + admin (`index.html`), dashboard (`dashboard.html`, `dash/*.js`)
- Data lives in a PRIVATE Vercel Blob store. Environment variables required:
  `SESSION_SECRET` (long random), `ADMIN_ID`, `ADMIN_PASSWORD` (first-run only, must be changed at first login), `BLOB_READ_WRITE_TOKEN` (added by the Blob store).
