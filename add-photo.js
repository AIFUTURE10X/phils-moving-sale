const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const pool = new Pool({ connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' });

async function run() {
  const filePath = process.argv[2];
  const itemIndex = parseInt(process.argv[3]);
  const data = fs.readFileSync(filePath);
  const base64 = `data:image/jpeg;base64,${data.toString('base64')}`;
  const { rows } = await pool.query('SELECT COALESCE(MAX(sort_order),0)+1 as next FROM moving_sale_photos WHERE item_index=$1', [itemIndex]);
  await pool.query('INSERT INTO moving_sale_photos (item_index, photo_url, sort_order) VALUES ($1, $2, $3)', [itemIndex, base64, rows[0].next]);
  console.log(`✅ Added photo to item ${itemIndex}, order ${rows[0].next}`);
  await pool.end();
}
run().catch(e => { console.error(e); process.exit(1); });
