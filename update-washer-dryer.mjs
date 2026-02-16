import { neon } from '@neondatabase/serverless';
const sql = neon('postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require');

// Update Washing Machine (idx 12) to be the combined listing
await sql`INSERT INTO moving_sale_edits (item_index, name, price, "desc", cat)
  VALUES (12, 
    ${'Washing Machine + Dryer Bundle'}, 
    ${'$400 for both ONO'},
    ${'Selling as a pair — washing machine and dryer, both fully functional and in good working order. Perfect for a household setup without the hassle of buying separately. Moving overseas so they must go — grab a bargain! Will consider selling individually if needed.'},
    ${'Appliances'})
  ON CONFLICT (item_index) DO UPDATE SET 
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    "desc" = EXCLUDED."desc",
    cat = EXCLUDED.cat,
    updated_at = NOW()`;

// Update Dryer (idx 13) to reference the bundle
await sql`INSERT INTO moving_sale_edits (item_index, name, price, "desc", cat)
  VALUES (13,
    ${'Dryer (part of Washer + Dryer bundle)'},
    ${'See Washer + Dryer Bundle'},
    ${'Clothes dryer, fully functional. Selling as part of the Washing Machine + Dryer bundle for $400 — or make an offer individually.'},
    ${'Appliances'})
  ON CONFLICT (item_index) DO UPDATE SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    "desc" = EXCLUDED."desc",
    cat = EXCLUDED.cat,
    updated_at = NOW()`;

console.log('Done! Updated washing machine + dryer listings.');
