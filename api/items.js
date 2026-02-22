const pool = require('./db');
const { requireAdmin } = require('./auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'GET') {
      const { rows } = await pool.query(`
        SELECT id, name, category, description, price, status, sort_order, created_at
        FROM moving_sale_items
        ORDER BY sort_order ASC, created_at ASC
      `);
      return res.json(rows);
    }

    if (req.method === 'POST') {
      if (!requireAdmin(req, res)) return;
      const { name, category, description, price } = req.body;

      const maxOrderResult = await pool.query('SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM moving_sale_items');
      const nextOrder = maxOrderResult.rows[0].next_order;

      const { rows } = await pool.query(`
        INSERT INTO moving_sale_items (name, category, description, price, sort_order)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, category, description, price, status, sort_order, created_at
      `, [name, category, description || 'No description yet.', price || 'Contact for price', nextOrder]);

      return res.json(rows[0]);
    }

    if (req.method === 'PUT') {
      if (!requireAdmin(req, res)) return;
      const { id, name, category, description, price, status } = req.body;

      const { rows } = await pool.query(`
        UPDATE moving_sale_items
        SET name = $1, category = $2, description = $3, price = $4, status = $5
        WHERE id = $6
        RETURNING id, name, category, description, price, status, sort_order, created_at
      `, [name, category, description, price, status, id]);

      return res.json(rows[0]);
    }

    if (req.method === 'DELETE') {
      if (!requireAdmin(req, res)) return;
      const { id } = req.body;
      await pool.query('DELETE FROM moving_sale_items WHERE id = $1', [id]);
      return res.json({ success: true });
    }

    res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Items API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
