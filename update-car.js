const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
  const {rows} = await pool.query("SELECT id, description FROM moving_sale_items WHERE id = 32");
  const item = rows[0];
  console.log('Current desc:', item.description);
  
  // Update description to highlight low kms
  await pool.query("UPDATE moving_sale_items SET description = $1 WHERE id = 32", [
    item.description.replace(/\.$/, '') + '. Super low kms for a 2006 model — only 127,369 km on the clock!'
  ]);
  console.log('Updated with low mileage mention');
  await pool.end();
})();
