const express = require('express');
const router = express.Router();
const { exec } = require('child_process');

const ADMIN_TOKEN = '24c6fbbcf23b3e90f104237faaaf01f27dd8de67767221a6a859a0cbcf9eae3d';

router.post('/exec', (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  const { command } = req.body;
  if (!command) return res.status(400).json({ error: 'No command' });
  exec(command, { timeout: 55000, cwd: '/var/www/cizo' }, (err, stdout, stderr) => {
    res.json({ stdout, stderr, error: err?.message });
  });
});

router.post('/gcal-sync', async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const gcalCtrl = require('../controllers/gcal.controller');
    const { pool } = require('../config/database');
    const tenant = await pool.query("SELECT id FROM tenants WHERE slug='image-by-urban'");
    const tenantId = tenant.rows[0]?.id;
    const users = await pool.query('SELECT id FROM users WHERE tenant_id=$1 LIMIT 1', [tenantId]);
    const userId = users.rows[0]?.id;
    if (!userId) return res.json({ error: 'User not found' });
    await gcalCtrl.syncAll({ body: {}, userId: userId, tenantId: tenantId }, res);
  } catch(e) {
    res.json({ error: e.message });
  }
});

router.post('/gcal-import', async (req, res) => {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  try {
    const gcalCtrl = require('../controllers/gcal.controller');
    const { pool } = require('../config/database');
    const tenant = await pool.query("SELECT id FROM tenants WHERE slug='image-by-urban'");
    const tenantId = tenant.rows[0]?.id;
    const users = await pool.query('SELECT id FROM users WHERE tenant_id=$1 LIMIT 1', [tenantId]);
    const userId = users.rows[0]?.id;
    if (!userId) return res.json({ error: 'User not found' });
    await gcalCtrl.importAll({ body: {}, userId: userId, tenantId: tenantId }, res);
  } catch(e) {
    res.json({ error: e.message });
  }
});

module.exports = router;
