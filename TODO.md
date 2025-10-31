# TODO: Fix Vercel Deployment Issues

## Issues Identified

- File system writes fail in Vercel's serverless environment (read-only).
- App structured as traditional server, but Vercel expects serverless functions (no exports found).

## Plan

- Convert to Vercel serverless functions in an 'api/' directory.
- Use Vercel KV for persistent storage.
- Keep server.js for local development.

## Steps

- [x] Create api/ directory.
- [x] Add @vercel/kv dependency to package.json.
- [x] Create api/waitlist.js serverless function for POST /api/waitlist.
- [x] Create api/waitlist/count.js for GET /api/waitlist/count.
- [x] Create api/waitlist/all.js for GET /api/waitlist/all.
- [x] Modify server.js to use KV instead of file system for local dev.
- [x] Ensure .env is in .gitignore to avoid deployment.
- [ ] Test locally and redeploy to Vercel.
