import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

const photos = await sql`SELECT id, item_index, sort_order, LENGTH(photo_data) as size FROM photos ORDER BY item_index, sort_order`;
console.log('Photos in DB:');
photos.forEach(p => console.log(`  id=${p.id} itemIndex=${p.item_index} order=${p.sort_order} size=${p.size}`));

// Check if there's an item_edits table
try {
  const edits = await sql`SELECT * FROM item_edits ORDER BY item_index`;
  console.log('\nItem edits:');
  edits.forEach(e => console.log(`  idx=${e.item_index} field=${e.field} val=${(e.value||'').substring(0,80)}`));
} catch(e) { console.log('No item_edits table'); }

// Show table structure
const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name='photos'`;
console.log('\nPhotos columns:', cols.map(c=>`${c.column_name}(${c.data_type})`).join(', '));
