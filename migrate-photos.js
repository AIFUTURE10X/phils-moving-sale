// Migrate local photos to Neon DB
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

// Item list must match index.html exactly
const items = [
  {name:"Kitchen Table + Chairs"},
  {name:"Ant Dinner Table + 3 Chairs"},
  {name:"Coffee Table + China Cabinet"},
  {name:"TV Stand"},
  {name:"Lounge Chairs"},
  {name:"Beds"},
  {name:"Chest of Drawers + Side Table"},
  {name:"2nd Chest of Drawers"},
  {name:"Antique Chair"},
  {name:"Work Desk + Chair"},
  {name:"Samsung 500L Twin Cooling Plus Fridge"},
  {name:"Microwave"},
  {name:"Washing Machine"},
  {name:"Dryer"},
  {name:"Iron + Ironing Board"},
  {name:"Heater"},
  {name:"Toaster"},
  {name:"Kettle"},
  {name:"Blender"},
  {name:"Vacuum Cleaner"},
  {name:"Pots & Pans"},
  {name:"Cutlery Set"},
  {name:"Dinner Set (Plates/Bowls)"},
  {name:"Glasses & Mugs"},
  {name:"Baking Trays & Dishes"},
  {name:"Chopping Boards"},
  {name:"Utensils"},
  {name:"Food Storage Containers"},
  {name:"TV"},
  {name:"Monitors"},
  {name:"Car"},
  {name:"Marble-Look Side Table"},
  {name:"Marri Bedside Table"},
  {name:"Marri Sideboard"},
];

const folderToItem = {
  'ant-dinner-table': 'Ant Dinner Table + 3 Chairs',
  'double-bed': 'Beds',
  'dryer': 'Dryer',
  'fridge': 'Samsung 500L Twin Cooling Plus Fridge',
  'honda-accord': 'Car',
  'marble-tables': 'Marble-Look Side Table',
  'marri-bedside-table': 'Marri Bedside Table',
  'marri-sideboard': 'Marri Sideboard',
  'microwave': 'Microwave',
  'recliners': 'Lounge Chairs',
  'tv-stand': 'TV Stand',
  'washing-machine': 'Washing Machine',
};

async function migrate() {
  // Create table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS moving_sale_photos (
      id SERIAL PRIMARY KEY,
      item_index INTEGER NOT NULL,
      photo_url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  console.log('Table ready');

  // Clear existing
  await pool.query('DELETE FROM moving_sale_photos');
  console.log('Cleared existing photos');

  const photosDir = path.join(__dirname, 'photos');
  const folders = fs.readdirSync(photosDir).filter(f => fs.statSync(path.join(photosDir, f)).isDirectory());

  let total = 0;
  for (const folder of folders) {
    const itemName = folderToItem[folder];
    if (!itemName) { console.log(`⚠️  Skipping: ${folder}`); continue; }
    const itemIdx = items.findIndex(i => i.name === itemName);
    if (itemIdx === -1) { console.log(`⚠️  Item not found: ${itemName}`); continue; }

    const files = fs.readdirSync(path.join(photosDir, folder))
      .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
      .sort();

    for (let order = 0; order < files.length; order++) {
      const filePath = path.join(photosDir, folder, files[order]);
      const data = fs.readFileSync(filePath);
      const ext = path.extname(files[order]).toLowerCase().replace('.', '');
      const mime = ext === 'jpg' ? 'jpeg' : ext;
      const base64 = `data:image/${mime};base64,${data.toString('base64')}`;

      await pool.query(
        'INSERT INTO moving_sale_photos (item_index, photo_url, sort_order) VALUES ($1, $2, $3)',
        [itemIdx, base64, order]
      );
      total++;
    }
    console.log(`✅ ${itemName} (idx ${itemIdx}): ${files.length} photos`);
  }

  console.log(`\n✅ Migrated ${total} photos to DB`);
  await pool.end();
}

migrate().catch(e => { console.error(e); process.exit(1); });
