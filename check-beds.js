const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
  const {rows} = await pool.query("SELECT id, name, category FROM moving_sale_items WHERE name ILIKE '%bed%' OR name ILIKE '%mattress%' OR name ILIKE '%topper%' ORDER BY id");
  rows.forEach(r => console.log(r.id, '|', r.name, '|', r.category));
  console.log('\nTotal items:');
  const all = await pool.query("SELECT count(*) as c FROM moving_sale_items");
  console.log(all.rows[0].c);
  await pool.end();
})();
