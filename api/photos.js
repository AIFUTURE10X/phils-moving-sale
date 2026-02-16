const { Pool } = require('@neondatabase/serverless');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_SPkbfJUQ1Rg4@ep-square-meadow-ahq9x6bc-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require',
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      // Get all photos grouped by item_id
      const { rows } = await pool.query(`
        SELECT p.id, p.item_id, p.photo_url, p.sort_order, i.name as item_name
        FROM moving_sale_photos p
        JOIN moving_sale_items i ON p.item_id = i.id
        ORDER BY p.item_id, p.sort_order ASC
      `);
      
      // Group photos by item_id for easy access
      const grouped = {};
      rows.forEach(r => {
        if (!grouped[r.item_id]) grouped[r.item_id] = [];
        grouped[r.item_id].push({ 
          id: r.id, 
          url: r.photo_url, 
          sort_order: r.sort_order,
          item_name: r.item_name 
        });
      });
      
      return res.json(grouped);
    }

    if (req.method === 'POST') {
      // Add new photo to an item
      const { item_id, photo, order } = req.body;
      
      if (!item_id || !photo) {
        return res.status(400).json({ error: 'item_id and photo are required' });
      }
      
      // If no order specified, get the next available order for this item
      let sortOrder = order;
      if (sortOrder === undefined || sortOrder === null) {
        const maxOrderResult = await pool.query(
          'SELECT COALESCE(MAX(sort_order), -1) + 1 as next_order FROM moving_sale_photos WHERE item_id = $1',
          [item_id]
        );
        sortOrder = maxOrderResult.rows[0].next_order;
      }
      
      const { rows } = await pool.query(`
        INSERT INTO moving_sale_photos (item_id, photo_url, sort_order) 
        VALUES ($1, $2, $3) 
        RETURNING id, item_id, photo_url, sort_order
      `, [item_id, photo, sortOrder]);
      
      return res.json(rows[0]);
    }

    if (req.method === 'PUT') {
      // Reorder photos or update photo details
      const { item_id, photoIds } = req.body;
      
      if (photoIds && Array.isArray(photoIds)) {
        // Reorder photos based on provided array of IDs
        for (let i = 0; i < photoIds.length; i++) {
          await pool.query(
            'UPDATE moving_sale_photos SET sort_order = $1 WHERE id = $2',
            [i, photoIds[i]]
          );
        }
        return res.json({ success: true });
      }
      
      res.status(400).json({ error: 'photoIds array is required for reordering' });
    }

    if (req.method === 'DELETE') {
      // Delete a photo by ID
      const { id } = req.body;
      
      if (!id) {
        return res.status(400).json({ error: 'Photo ID is required' });
      }
      
      await pool.query('DELETE FROM moving_sale_photos WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Photos API error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
};