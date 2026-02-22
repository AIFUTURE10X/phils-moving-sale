// Simple admin password check for write operations.
// Set ADMIN_PASSWORD in Vercel environment variables.
//
// Also serves as an endpoint: POST /api/auth to verify password.

function requireAdmin(req, res) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return true; // no password configured = allow (dev mode)

  const provided = req.headers['x-admin-key'];
  if (provided === password) return true;

  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

// When called as an endpoint (POST /api/auth), verify the password
module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    const password = process.env.ADMIN_PASSWORD;
    if (!password) return res.json({ ok: true }); // dev mode
    const provided = req.headers['x-admin-key'];
    if (provided === password) return res.json({ ok: true });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  res.status(405).json({ error: 'Method not allowed' });
};

// Export requireAdmin as a named property so other API files can still use it
module.exports.requireAdmin = requireAdmin;
