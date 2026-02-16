const { Pool } = require('@neondatabase/serverless');
const pool = new Pool({connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'});
(async()=>{
  const {rows} = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'moving_sale_photos' ORDER BY ordinal_position");
  rows.forEach(r => console.log(r.column_name, '-', r.data_type));
  await pool.end();
})();
