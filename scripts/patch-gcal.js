const fs = require('fs');
const FILE = '/var/www/cizo/src/controllers/gcal.controller.js';
const content = fs.readFileSync(FILE, 'utf8');

const OLD = `  // 1. Chercher le staff par couleur Google Calendar de l'événement
  let staffId = null;
  const eventColorId = ev.colorId || null;
  if (eventColorId) {
    const colorRow = await pool.query(
      'SELECT id FROM staff WHERE tenant_id=$1 AND gcal_color_id=$2 AND is_active=true LIMIT 1',
      [tenantId, eventColorId]
    );
    if (colorRow.rows.length) staffId = colorRow.rows[0].id;
  }
  // 2. Fallback: staff préféré du compte Google connecté
  if (!staffId) staffId = preferredStaffId || null;
  // 3. Fallback: premier staff actif
  if (!staffId) {
    const staffRow = await pool.query(
      'SELECT id FROM staff WHERE tenant_id=$1 AND is_active=true ORDER BY created_at ASC LIMIT 1',
      [tenantId]
    );
    if (staffRow.rows.length) staffId = staffRow.rows[0].id;
  }`;

const NEW = `  // Couleur = identifiant du coiffeur. Sans correspondance exacte → événement ignoré.
  let staffId = null;
  const eventColorId = ev.colorId || null;
  const hasColorConfig = await pool.query(
    'SELECT 1 FROM staff WHERE tenant_id=$1 AND gcal_color_id IS NOT NULL AND is_active=true LIMIT 1',
    [tenantId]
  );
  if (hasColorConfig.rows.length) {
    if (!eventColorId) {
      console.log('[GCal] Skipped (no color):', ev.summary);
      return null;
    }
    const colorRow = await pool.query(
      'SELECT id FROM staff WHERE tenant_id=$1 AND gcal_color_id=$2 AND is_active=true LIMIT 1',
      [tenantId, eventColorId]
    );
    if (!colorRow.rows.length) {
      console.log('[GCal] Skipped (color not matched):', eventColorId, ev.summary);
      return null;
    }
    staffId = colorRow.rows[0].id;
  } else {
    if (eventColorId) {
      const colorRow = await pool.query(
        'SELECT id FROM staff WHERE tenant_id=$1 AND gcal_color_id=$2 AND is_active=true LIMIT 1',
        [tenantId, eventColorId]
      );
      if (colorRow.rows.length) staffId = colorRow.rows[0].id;
    }
    if (!staffId) staffId = preferredStaffId || null;
    if (!staffId) {
      const staffRow = await pool.query(
        'SELECT id FROM staff WHERE tenant_id=$1 AND is_active=true ORDER BY created_at ASC LIMIT 1',
        [tenantId]
      );
      if (staffRow.rows.length) staffId = staffRow.rows[0].id;
    }
  }`;

if (!content.includes(OLD)) {
  console.error('PATCH FAILED: section not found in file');
  process.exit(1);
}
fs.writeFileSync(FILE, content.replace(OLD, NEW));
console.log('PATCH OK - gcal.controller.js updated');
