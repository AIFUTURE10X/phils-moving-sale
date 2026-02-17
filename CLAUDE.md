# Phil's Moving Sale

## Project Info
- **Repo**: https://github.com/AIFUTURE10X/phils-moving-sale
- **Local Path**: `C:\Projects\phils-moving-sale`
- **Deployed on**: Vercel (auto-deploys from `master` branch)
- **Stack**: Vanilla HTML/CSS/JS + Vercel Serverless Functions + Neon PostgreSQL
- **Database**: Shared Neon DB (`neondb`) — same as AskConciergeAI

## Architecture
- `index.html` — Single-page admin dashboard (all HTML, CSS, JS in one file)
- `api/db.js` — Shared database connection pool
- `api/items.js` — CRUD for sale items
- `api/photos.js` — Photo upload/delete/reorder (stored as base64 in DB)
- `api/reorder.js` — Item reordering (single-step arrows + batch drag-and-drop)
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

## Security Note
Database credentials are still hardcoded as a fallback in `api/db.js`. To fix:
1. Set `DATABASE_URL` environment variable in Vercel
2. Remove the fallback connection string from `api/db.js`

## Recent Changes (Feb 2026)
1. **Card drag-and-drop** — Added drag handles, batch reorder API, touch support
2. **Shared DB module** — Extracted `api/db.js`, removed duplicated Pool in each API file
3. **Category always-visible dropdown** — Replaced click-to-edit text with `<select>` on every card
4. **Drag freeze fix** — Cards no longer shift/hover during drag operations
5. **Cleanup** — Removed debug console.logs, stopped leaking error.message to clients
