const pool = require('./db');
const requireAdmin = require('./auth');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    if (!requireAdmin(req, res)) return;
    try {
      // Batch reorder: full drag-and-drop support
      if (req.body.ordered_ids && Array.isArray(req.body.ordered_ids)) {
        const { ordered_ids } = req.body;
        for (let i = 0; i < ordered_ids.length; i++) {
          await pool.query(
            'UPDATE moving_sale_items SET sort_order = $1 WHERE id = $2',
            [i, ordered_ids[i]]
          );
        }
        return res.json({ success: true });
      }

      // Single-step reorder (up/down arrow buttons)
      const { item_id, direction, steps = 1 } = req.body;

      if (!item_id || !direction) {
        return res.status(400).json({ error: 'item_id and direction are required' });
      }

      const numSteps = Math.max(1, Math.min(10, parseInt(steps) || 1));

      const currentResult = await pool.query(
        'SELECT sort_order FROM moving_sale_items WHERE id = $1',
        [item_id]
      );

      if (currentResult.rows.length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }

      let currentOrder = currentResult.rows[0].sort_order;
      let currentId = item_id;

      for (let i = 0; i < numSteps; i++) {
        if (direction === 'up') {
          const prevResult = await pool.query(
            'SELECT id, sort_order FROM moving_sale_items WHERE sort_order < $1 ORDER BY sort_order DESC LIMIT 1',
            [currentOrder]
          );
          if (prevResult.rows.length === 0) break;
          const prevItem = prevResult.rows[0];
          await pool.query('UPDATE moving_sale_items SET sort_order = $1 WHERE id = $2', [prevItem.sort_order, currentId]);
          await pool.query('UPDATE moving_sale_items SET sort_order = $1 WHERE id = $2', [currentOrder, prevItem.id]);
          currentOrder = prevItem.sort_order;
        } else if (direction === 'down') {
          const nextResult = await pool.query(
            'SELECT id, sort_order FROM moving_sale_items WHERE sort_order > $1 ORDER BY sort_order ASC LIMIT 1',
            [currentOrder]
          );
          if (nextResult.rows.length === 0) break;
          const nextItem = nextResult.rows[0];
          await pool.query('UPDATE moving_sale_items SET sort_order = $1 WHERE id = $2', [nextItem.sort_order, currentId]);
          await pool.query('UPDATE moving_sale_items SET sort_order = $1 WHERE id = $2', [currentOrder, nextItem.id]);
          currentOrder = nextItem.sort_order;
        }
      }

      return res.json({ success: true });

    } catch (error) {
      console.error('Reorder API error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
};
