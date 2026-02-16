import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

const photos = await sql`SELECT id, item_index, sort_order, LENGTH(photo_url) as size FROM moving_sale_photos ORDER BY item_index, sort_order`;
console.log('Photos:');
photos.forEach(p => console.log(`  id=${p.id} idx=${p.item_index} order=${p.sort_order} size=${p.size}`));

const edits = await sql`SELECT * FROM moving_sale_edits ORDER BY item_index`;
console.log('\nEdits:');
edits.forEach(e => console.log(`  idx=${e.item_index} field=${e.field_name} val=${(e.field_value||'').substring(0,60)}`));

// Show columns
const cols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='moving_sale_photos'`;
console.log('\nPhoto columns:', cols.map(c=>c.column_name).join(', '));
const ecols = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='moving_sale_edits'`;
console.log('Edit columns:', ecols.map(c=>c.column_name).join(', '));
