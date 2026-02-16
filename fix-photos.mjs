import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

// Photos at these indexes are from the OLD migration and map to items that 
// no longer exist at those positions in the current item list:
//   idx 30: 12 old Car photos (Stereo is now at idx 30)
//   idx 31: 3 old Marble table photos (Car/Electronics is now at idx 31)  
//   idx 33: 1 old Marri Sideboard photo (Bedding is now at idx 33)
//
// idx 48 has 11 Honda Accord photos uploaded correctly via browser — KEEP
// All other indexes (1,3,4,5,6,10,11,12,13) match correctly — KEEP

console.log('Deleting mismatched photos from old migration...');

const del30 = await sql`DELETE FROM moving_sale_photos WHERE item_index = 30 RETURNING id`;
console.log(`  Deleted ${del30.length} photos from idx 30 (old Car photos on Stereo)`);

const del31 = await sql`DELETE FROM moving_sale_photos WHERE item_index = 31 RETURNING id`;
console.log(`  Deleted ${del31.length} photos from idx 31 (old Marble photos on Car)`);

const del33 = await sql`DELETE FROM moving_sale_photos WHERE item_index = 33 RETURNING id`;
console.log(`  Deleted ${del33.length} photos from idx 33 (old Marri photo on Bedding)`);

// Verify remaining photos
const remaining = await sql`SELECT item_index, COUNT(*) as count FROM moving_sale_photos GROUP BY item_index ORDER BY item_index`;
console.log('\nRemaining photos:');
const names = {1:'Ant Dinner Table',3:'TV Stand',4:'Lounge Chairs',5:'Beds',6:'Chest of Drawers',10:'Fridge',11:'Microwave',12:'Washing Machine',13:'Dryer',48:'Honda Accord'};
for (const r of remaining) {
  console.log(`  idx ${r.item_index}: ${r.count} photos → ${names[r.item_index]||'?'}`);
}

console.log('\nDone! Refresh the moving sale site to see correct photos.');
