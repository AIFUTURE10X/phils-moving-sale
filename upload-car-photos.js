const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const pool = new Pool({connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require'});

(async()=>{
  // Find car item
  const {rows} = await pool.query("SELECT id, name FROM moving_sale_items WHERE name ILIKE '%honda%' OR name ILIKE '%car%' OR category = 'Car' ORDER BY id");
  console.log('Car items found:', rows);
  
  if (rows.length === 0) {
    console.log('No car item found!');
    await pool.end();
    return;
  }
  
  const itemId = rows[0].id;
  console.log('Using item ID:', itemId);
  
  const photoDir = 'C:\\Users\\philg\\Desktop\\moving-sale\\photos\\honda-accord';
  const files = fs.readdirSync(photoDir).filter(f => f.endsWith('.jpg'));
  
  // Order: front, rear, interior, engine, etc.
  const ordered = ['front.jpg','rear.jpg','interior-driver.jpg','interior-wide.jpg','backseat.jpg','dash-nav.jpg','door-panel.jpg','engine.jpg','boot.jpg','odometer.jpg','11.jpg','12.jpg'];
  const finalOrder = ordered.filter(f => files.includes(f));
  // Add any remaining files not in ordered list
  files.forEach(f => { if (!finalOrder.includes(f)) finalOrder.push(f); });
  
  for (const file of finalOrder) {
    const filePath = path.join(photoDir, file);
    const data = fs.readFileSync(filePath);
    const base64 = 'data:image/jpeg;base64,' + data.toString('base64');
    
    const maxOrder = await pool.query('SELECT COALESCE(MAX(sort_order),0)+1 as n FROM moving_sale_photos WHERE item_id=$1', [itemId]);
    await pool.query('INSERT INTO moving_sale_photos (item_id, photo_url, sort_order) VALUES ($1, $2, $3)', [itemId, base64, maxOrder.rows[0].n]);
    console.log('Uploaded:', file);
  }
  
  console.log('Done! All photos uploaded for item', itemId);
  await pool.end();
})();
