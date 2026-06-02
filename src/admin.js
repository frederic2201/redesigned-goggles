const express = require('express');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '24c6fbbcf23b3e90f104237faaaf01f27dd8de67767221a6a859a0cbcf9eae3d';
const JS_DIR = '/var/www/cizo/public/js';

function auth(req, res, next) {
  const header = req.headers['authorization'] || '';
  if (header !== 'Bearer ' + ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
}

// PM2 restart
router.post('/pm2/restart', auth, (req, res) => {
  try {
    const out = execSync('pm2 restart cizo && pm2 jlist', { encoding: 'utf8' });
    const list = JSON.parse(out);
    const proc = list.find(p => p.name === 'cizo');
    res.json({ ok: true, status: proc ? proc.pm2_env.status : 'unknown' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PM2 logs
router.get('/pm2/logs', auth, (req, res) => {
  try {
    const lines = parseInt(req.query.lines) || 50;
    const out = execSync(`pm2 logs cizo --lines ${lines} --nostream 2>&1`, { encoding: 'utf8' });
    res.json({ ok: true, logs: out });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// PM2 status
router.get('/pm2/status', auth, (req, res) => {
  try {
    const out = execSync('pm2 jlist', { encoding: 'utf8' });
    const list = JSON.parse(out);
    const proc = list.find(p => p.name === 'cizo');
    res.json({ ok: true, proc: proc ? { status: proc.pm2_env.status, pid: proc.pid, memory: proc.monit.memory, restarts: proc.pm2_env.restart_time } : null });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Write JS file (stock.js, nav.js, api.js only)
router.post('/file/write', auth, (req, res) => {
  const { filename, content } = req.body;
  const allowed = ['stock.js', 'nav.js', 'api.js'];
  if (!allowed.includes(filename)) {
    return res.status(400).json({ ok: false, error: 'File not allowed' });
  }
  try {
    const filepath = path.join(JS_DIR, filename);
    fs.writeFileSync(filepath, content, 'utf8');
    res.json({ ok: true, written: filepath, size: content.length });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Read JS file
router.get('/file/read', auth, (req, res) => {
  const { filename } = req.query;
  const allowed = ['stock.js', 'nav.js', 'api.js'];
  if (!allowed.includes(filename)) {
    return res.status(400).json({ ok: false, error: 'File not allowed' });
  }
  try {
    const content = fs.readFileSync(path.join(JS_DIR, filename), 'utf8');
    res.json({ ok: true, content });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Read backend file
router.get('/backend/read', auth, (req, res) => {
  const { filepath } = req.query;
  const base = '/var/www/cizo/src/';
  const resolved = path.resolve(base, filepath);
  if (!resolved.startsWith(base)) {
    return res.status(400).json({ ok: false, error: 'Path not allowed' });
  }
  try {
    const content = fs.readFileSync(resolved, 'utf8');
    res.json({ ok: true, content });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

module.exports = router;
