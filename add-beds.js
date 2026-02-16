const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'});

(async()=>{
  await pool.query('DELETE FROM moving_sale_items WHERE id BETWEEN 33 AND 39');
  console.log('Deleted IDs 33-39');

  const items = [
    ['Double Bed #1 — Complete Set', 'Bedroom/Bathroom', 'Double bed base + mattress + mattress topper. Sell as complete set or each piece separately — see individual listings below. Pickup Chinderah.', 'Contact for price'],
    ['Double Bed Base #1', 'Bedroom/Bathroom', 'Double bed base/frame. Good condition. Pickup Chinderah.', 'Contact for price'],
    ['Double Mattress #1', 'Bedroom/Bathroom', 'Double mattress. Comfortable, good condition. Pickup Chinderah.', 'Contact for price'],
    ['Mattress Topper #1', 'Bedroom/Bathroom', 'Double mattress topper. Extra comfort layer. Pickup Chinderah.', 'Contact for price'],
    ['Double Bed #2 — Complete Set', 'Bedroom/Bathroom', 'Double bed base + mattress + mattress topper. Sell as complete set or each piece separately — see individual listings below. Pickup Chinderah.', 'Contact for price'],
    ['Double Bed Base #2', 'Bedroom/Bathroom', 'Double bed base/frame. Good condition. Pickup Chinderah.', 'Contact for price'],
    ['Double Mattress #2', 'Bedroom/Bathroom', 'Double mattress. Comfortable, good condition. Pickup Chinderah.', 'Contact for price'],
    ['Mattress Topper #2', 'Bedroom/Bathroom', 'Double mattress topper. Extra comfort layer. Pickup Chinderah.', 'Contact for price'],
    ['🔥 2x Double Beds Bundle Deal', 'Bedroom/Bathroom', 'Take both complete double beds! 2x bases, 2x mattresses, 2x toppers. Big discount for taking the lot. Moving overseas — everything must go! Pickup Chinderah.', 'Contact for price']
  ];

  for (const [name, cat, desc, price] of items) {
    const max = await pool.query('SELECT COALESCE(MAX(sort_order),0)+1 as n FROM moving_sale_items');
    const r = await pool.query('INSERT INTO moving_sale_items (name, category, description, price, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING id, name', [name, cat, desc, price, max.rows[0].n]);
    console.log('Added:', r.rows[0].id, r.rows[0].name);
  }
  await pool.end();
})();
