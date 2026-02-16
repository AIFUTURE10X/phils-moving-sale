const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
  const updates = [
    [51, 'Double Bed #1 — Complete Set', 'Double bed base with backboard + mattress + mattress topper. Sell as complete set or each piece separately — see individual listings below. Pickup Chinderah.'],
    [52, 'Double Bed Base #1 (with Backboard)', 'Double bed base/frame with backboard/headboard. Good condition. Pickup Chinderah.'],
    [55, 'Double Bed #2 — Complete Set', 'Double bed base with backboard + mattress + mattress topper. Sell as complete set or each piece separately — see individual listings below. Pickup Chinderah.'],
    [56, 'Double Bed Base #2 (with Backboard)', 'Double bed base/frame with backboard/headboard. Good condition. Pickup Chinderah.'],
    [59, '🔥 2x Double Beds Bundle Deal', 'Take both complete double beds! 2x bases with backboards, 2x mattresses, 2x toppers. Big discount for taking the lot. Moving overseas — everything must go! Pickup Chinderah.'],
  ];
  for (const [id, name, desc] of updates) {
    await pool.query('UPDATE moving_sale_items SET name=$1, description=$2 WHERE id=$3', [name, desc, id]);
    console.log('Updated:', id, name);
  }
  await pool.end();
})();
