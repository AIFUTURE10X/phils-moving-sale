# Phil's Moving Sale

## Project Info
- **Repo**: https://github.com/AIFUTURE10X/phils-moving-sale
- **Local Path**: `C:\Projects\phils-moving-sale`
- **Deployed on**: Vercel (auto-deploys from `master` branch)
- **Stack**: Vanilla HTML/CSS/JS + Vercel Serverless Functions + Neon PostgreSQL
- **Database**: Shared Neon DB (`neondb`) — same as AskConciergeAI

## Architecture
- `index.html` — Admin dashboard (password-protected editing)
- `all-items.html` — Public read-only view (no editing, shared with buyers)
- `api/auth.js` — Admin password check (validates `x-admin-key` header against `ADMIN_PASSWORD` env var)
- `api/db.js` — Shared database connection pool
- `api/items.js` — CRUD for sale items (GET=public, POST/PUT/DELETE=admin)
- `api/photos.js` — Photo upload/delete/reorder (GET=public, POST/PUT/DELETE=admin)
- `api/reorder.js` — Item reordering (POST=admin only)
- `items.js` — Static item definitions (legacy, pre-database reference file)

## Key Features
- Grid/list view with category filtering
- Inline editing (click name/price/description to edit)
- Category dropdown on every card (always visible `<select>`)
- Photo carousel with lightbox, upload, delete, and drag reorder
- **Card drag-and-drop** — grab the "Drag" handle at top of card to reorder
  - Desktop: HTML5 Drag and Drop API (handle-gated via mousedown)
  - Mobile: Touch drag with floating ghost clone
  - Grid frozen during drag (no hover shifts) via `.is-dragging` class
  - Batch reorder API: `POST /api/reorder` with `{ ordered_ids: [...] }`
- D-pad arrow buttons for fine-grained reordering (still works alongside drag)
- Bulk photo upload/download (ZIP via JSZip)
- Deposit popup + sticky banner for late-pickup items (24 Mar / 28 Mar)

## Database Tables
```sql
moving_sale_items (id, name, category, description, price, status, sort_order, created_at)
moving_sale_photos (id, item_id, photo_url, sort_order, created_at)
```

## Security
- **Admin auth**: All write APIs require `x-admin-key` header matching `ADMIN_PASSWORD` env var
- Admin page (`index.html`) prompts for password on load, stores in sessionStorage
- Public page (`all-items.html`) only calls GET endpoints — no auth needed
- Database credentials are still hardcoded as a fallback in `api/db.js`. To fix:
  1. Set `DATABASE_URL` environment variable in Vercel
  2. Remove the fallback connection string from `api/db.js`

## Recent Changes (Feb 2026)
1. **Public view** — Added `all-items.html` read-only page for sharing with buyers
2. **Admin auth** — Password protection on all write APIs via `ADMIN_PASSWORD` env var
3. **Card drag-and-drop** — Added drag handles, batch reorder API, touch support
4. **Shared DB module** — Extracted `api/db.js`, removed duplicated Pool in each API file
5. **Category always-visible dropdown** — Replaced click-to-edit text with `<select>` on every card
6. **Drag freeze fix** — Cards no longer shift/hover during drag operations
7. **Cleanup** — Removed debug console.logs, stopped leaking error.message to clients
