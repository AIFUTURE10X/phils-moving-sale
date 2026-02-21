// Simple admin password check for write operations.
// Set ADMIN_PASSWORD in Vercel environment variables.
function requireAdmin(req, res) {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return true; // no password configured = allow (dev mode)

  const provided = req.headers['x-admin-key'];
  if (provided === password) return true;

  res.status(401).json({ error: 'Unauthorized' });
  return false;
}

module.exports = requireAdmin;
