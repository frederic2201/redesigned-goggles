// ══════════════════════════════════
// STOCK / PRODUITS
// ══════════════════════════════════
let _stockData = [];

async function loadStock() {
  const cat    = document.getElementById('stock-cat-filter')?.value || '';
  const low    = document.getElementById('stock-low-filter')?.checked;
  let url      = '/stock';
  const params = [];
  if (cat) params.push('category=' + encodeURIComponent(cat));
  if (low) params.push('low_stock=1');
  if (params.length) url += '?' + params.join('&');
  const el = document.getElementById('stock-list');
  if (el) el.innerHTML = '<div class="loading">Chargement...</div>';
  const data = await api('GET', url);
  if (!data) return;
  _stockData = data.products || data.stock || [];
  renderStockList(_stockData);
  renderStockCategories(_stockData);
}

function renderStockCategories(products) {
  const sel = document.getElementById('stock-cat-filter');
  if (!sel) return;
  const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
  const cur  = sel.value;
  sel.innerHTML = '<option value="">Toutes catégories</option>'
    + cats.map(c => '<option value="' + c + '"' + (cur === c ? ' selected' : '') + '>' + c + '</option>').join('');
}

function renderStockList(products) {
  const el = document.getElementById('stock-list');
  if (!el) return;
  if (!products.length) { el.innerHTML = '<div class="empty">Aucun produit en stock</div>'; return; }
  el.innerHTML = '<table style="width:100%;border-collapse:collapse;"><thead><tr>'
    + '<th style="padding:8px 12px;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--or-d);text-align:left;border-bottom:1px solid var(--border);">Produit</th>'
    + '<th style="padding:8px 12px;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--or-d);text-align:left;border-bottom:1px solid var(--border);">Catégorie</th>'
    + '<th style="padding:8px 12px;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--or-d);text-align:right;border-bottom:1px solid var(--border);">Stock</th>'
    + '<th style="padding:8px 12px;font-size:.58rem;letter-spacing:.12em;text-transform:uppercase;color:var(--or-d);text-align:right;border-bottom:1px solid var(--border);">Prix</th>'
    + '<th style="padding:8px 12px;border-bottom:1px solid var(--border);"></th>'
    + '</tr></thead><tbody>'
    + products.map(p => {
        const isLow = p.stock_qty <= (p.low_stock_threshold || 5);
        const stockColor = isLow ? '#E74C3C' : p.stock_qty === 0 ? '#E74C3C' : '#2ECC71';
        return '<tr style="border-bottom:1px solid rgba(255,255,255,.03);">'
          + '<td style="padding:10px 12px;"><div style="font-size:.78rem;color:var(--blanc);">' + p.name + '</div>'
          + (p.sku ? '<div style="font-size:.62rem;color:var(--blanc-d);font-family:JetBrains Mono,monospace;">' + p.sku + '</div>' : '') + '</td>'
          + '<td style="padding:10px 12px;font-size:.72rem;color:var(--blanc-d);">' + (p.category || '—') + '</td>'
          + '<td style="padding:10px 12px;text-align:right;"><span style="font-family:JetBrains Mono,monospace;font-size:.8rem;color:' + stockColor + ';">' + p.stock_qty + '</span>'
          + (isLow ? '<div style="font-size:.58rem;color:#E74C3C;">Stock faible</div>' : '') + '</td>'
          + '<td style="padding:10px 12px;text-align:right;font-family:Cormorant Garamond,serif;font-size:1rem;color:var(--or);">' + parseFloat(p.price || 0).toFixed(2) + '€</td>'
          + '<td style="padding:6px 10px;text-align:center;"><button onclick="openStockForm(' + JSON.stringify(p.id) + ')" style="padding:4px 9px;background:rgba(201,168,76,.1);border:1px solid var(--border);color:var(--or);border-radius:4px;font-size:.65rem;cursor:pointer;">Modifier</button></td>'
          + '</tr>';
      }).join('') + '</tbody></table>';
}

let _editStockId = null;

function openStockForm(id) {
  _editStockId = id || null;
  const titleEl = document.getElementById('stock-modal-title');
  if (titleEl) titleEl.textContent = id ? 'Modifier le produit' : 'Nouveau produit';
  ['stock-name', 'stock-sku', 'stock-category', 'stock-price', 'stock-qty', 'stock-threshold'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  if (id) {
    const p = _stockData.find(x => x.id === id);
    if (p) {
      const f = (i, v) => { const el = document.getElementById(i); if (el) el.value = v || ''; };
      f('stock-name', p.name); f('stock-sku', p.sku); f('stock-category', p.category);
      f('stock-price', p.price); f('stock-qty', p.stock_qty); f('stock-threshold', p.low_stock_threshold);
    }
  }
  openModal('new-stock');
}

async function saveStock() {
  const name = document.getElementById('stock-name')?.value?.trim();
  const price = document.getElementById('stock-price')?.value;
  const stock_qty = document.getElementById('stock-qty')?.value;
  if (!name) { showToast('⚠️ Nom requis'); return; }
  const body = {
    name, sku: document.getElementById('stock-sku')?.value?.trim() || null,
    category: document.getElementById('stock-category')?.value?.trim() || null,
    price: parseFloat(price) || 0, stock_qty: parseInt(stock_qty) || 0,
    low_stock_threshold: parseInt(document.getElementById('stock-threshold')?.value) || 5,
  };
  const r = _editStockId ? await api('PUT', '/stock/' + _editStockId, body) : await api('POST', '/stock', body);
  if (r && (r.ok || r.product)) { closeModal('new-stock'); showToast(_editStockId ? '✅ Produit mis à jour' : '✅ Produit créé'); loadStock(); }
}

async function deleteStock(id) {
  if (!confirm('Supprimer ce produit ?')) return;
  const r = await api('DELETE', '/stock/' + id);
  if (r && r.ok) { showToast('Produit supprimé'); loadStock(); }
}

function filterStockSearch(q) {
  const filtered = q ? _stockData.filter(p => p.name.toLowerCase().includes(q.toLowerCase())) : _stockData;
  renderStockList(filtered);
}

// ══════════════════════════════════
// CARTES CADEAU
// ══════════════════════════════════
let _gcData = [];

async function loadGiftCards() {
  const status = document.getElementById('gc-status-filter')?.value || '';
  let url = '/gift-cards';
  if (status) url += '?status=' + encodeURIComponent(status);
  const el = document.getElementById('gc-list');
  if (el) el.innerHTML = '<div class="loading">Chargement...</div>';
  const data = await api('GET', url);
  if (!data) return;
  _gcData = data.gift_cards || [];
  renderGiftCards(_gcData);
}

function filterGC(q) {
  const filtered = q ? _gcData.filter(gc => (gc.code + (gc.recipient_name || '')).toLowerCase().includes(q.toLowerCase())) : _gcData;
  renderGiftCards(filtered);
}

function renderGiftCards(cards) {
  const el = document.getElementById('gc-list');
  if (!el) return;
  if (!cards.length) { el.innerHTML = '<div class="empty">Aucune carte cadeau</div>'; return; }
  el.innerHTML = cards.map(gc => {
    const rem     = parseFloat(gc.remaining_value ?? gc.initial_value);
    const total   = parseFloat(gc.initial_value);
    const pct     = total > 0 ? Math.round(rem / total * 100) : 0;
    const expired = gc.expires_at && new Date(gc.expires_at) < new Date();
    const isUsed  = rem <= 0;
    const isActive = gc.is_active && !isUsed && !expired;
    const statusColor = isActive ? '#2ECC71' : isUsed ? 'var(--blanc-d)' : '#E74C3C';
    const statusLabel = expired ? 'Expirée' : isUsed ? 'Utilisée' : isActive ? 'Active' : 'Inactive';
    return '<div class="card" style="margin-bottom:10px;' + (expired ? 'opacity:.6;' : '') + '">'
      + '<div style="display:flex;align-items:center;gap:12px;"><div style="flex:1;">'
      + '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">'
      + '<span style="font-family:JetBrains Mono,monospace;font-size:.78rem;color:var(--or);">' + gc.code + '</span>'
      + '<span style="font-size:.6rem;padding:2px 7px;border-radius:36x;background:rgba(46,204,113,.1);color:' + statusColor + ';">' + statusLabel + '</span>'
      + '</div>'
      + (gc.recipient_name ? '<div style="font-size:.7rem;color:var(--blanc);margin-bottom:2px;">Pour : ' + gc.recipient_name + '</div>' : '')
      + (gc.purchaser_email ? '<div style="font-size:.62rem;color:var(--blanc-d);">' + gc.purchaser_email + '</div>' : '')
      + '<div style="display:flex;align-items:center;gap:8px;margin-top:6px;">'
      + '<div style="flex:1;background:var(--noir-d);border-radius:3px;height:6px;overflow:hidden;"><div style="height:100%;background:var(--or);width:' + pct + '%;"></div></div>'
      + '<span style="font-family:JetBrains Mono,monospace;font-size:.7rem;color:var(--or);">' + rem.toFixed(2) + '€ / ' + total.toFixed(2) + '€</span>'
      + '</div>'
      + (gc.expires_at ? '<div style="font-size:.6rem;color:' + (expired ? '#E74C3C' : 'var(--blanc-d)') + ';margin-top:4px;">Exp. ' + new Date(gc.expires_at).toLocaleDateString('fr-FR') + '</div>' : '')
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;">'
      + '<button onclick="sendGCByEmail(' + JSON.stringify(gc.id) + ')" style="padding:4px 10px;background:var(--or-g);border:1px solid var(--border-h);color:var(--or);border-radius:4px;font-size:.62rem;cursor:pointer;">📧 Envoyer</button>'
      + '</div></div></div>';
  }).join('');
}

let _editGCId = null;

function openGCForm(id) {
  _editGCId = id || null;
  const titleEl = document.getElementById('gc-modal-title');
  if (titleEl) titleEl.textContent = id ? 'Modifier la carte' : 'Nouvelle carte cadeau';
  ['gc-amount', 'gc-purchaser-name', 'gc-recipient-name', 'gc-recipient-email', 'gc-message', 'gc-expiry'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  if (id) {
    const gc = _gcData.find(x => x.id === id);
    if (gc) {
      const f = (i, v) => { const el = document.getElementById(i); if (el) el.value = v || ''; };
      f('gc-amount', gc.initial_value); f('gc-purchaser-name', gc.purchaser_name);
      f('gc-recipient-name', gc.recipient_name); f('gc-recipient-email', gc.purchaser_email);
      f('gc-message', gc.message); f('gc-expiry', gc.expires_at ? gc.expires_at.slice(0, 10) : '');
    }
  }
  openModal('new-gc');
}

async function saveGiftCard() {
  const amount = document.getElementById('gc-amount')?.value;
  if (!amount || parseFloat(amount) <= 0) { showToast('⚠️ Montant requis'); return; }
  const body = {
    initial_value:   parseFloat(amount),
    purchaser_name:  document.getElementById('gc-purchaser-name')?.value?.trim() || null,
    recipient_name:  document.getElementById('gc-recipient-name')?.value?.trim() || null,
    purchaser_email: document.getElementById('gc-recipient-email')?.value?.trim() || null,
    message:         document.getElementById('gc-message')?.value?.trim() || null,
    expires_at:      document.getElementById('gc-expiry')?.value || null,
  };
  const r = _editGCId ? await api('PUT', '/gift-cards/' + _editGCId, body) : await api('POST', '/gift-cards', body);
  if (r && (r.ok || r.gift_card)) {
    closeModal('new-gc');
    showToast(_editGCId ? '✅ Carte mise à jour' : '✅ Carte cadeau créée — code : ' + (r.gift_card?.code || ''));
    loadGiftCards();
  }
}

let _sendGCId = null;

function sendGCByEmail(id) {
  _sendGCId = id;
  const gc = _gcData.find(x => x.id === id);
  if (!gc) return;
  const amount = parseFloat(gc.initial_value).toFixed(2);
  const expiry = gc.expires_at ? new Date(gc.expires_at).toLocaleDateString('fr-FR') : null;

  const buildPreview = (senderName) => {
    const previewEl = document.getElementById('send-gc-preview');
    if (!previewEl) return;
    previewEl.innerHTML =
      '<div style="background:var(--noir-d);border:2px solid var(--or);border-radius:10px;padding:18px;text-align:center;">'
      + '<div style="font-size:.6rem;letter-spacing:.15em;text-transform:uppercase;color:var(--or-d);margin-bottom:6px;">Carte cadeau</div>'
      + '<div style="font-family:Cormorant Garamond,serif;font-size:2rem;color:var(--or);">' + amount + '€</div>'
      + '<div style="font-family:JetBrains Mono,monospace;font-size:.85rem;color:var(--blanc);margin:8px 0;padding:6px 14px;background:rgba(255,255,255,.05);border-radius:5px;display:inline-block;">' + gc.code + '</div>'
      + (senderName ? '<div style="font-size:.72rem;color:var(--blanc-d);margin-top:6px;">De la part de : <strong style="color:var(--or);">' + senderName + '</strong></div>' : '')
      + (gc.recipient_name ? '<div style="font-size:.72rem;color:var(--blanc-d);margin-top:4px;">Pour : <strong style="color:var(--blanc);">' + gc.recipient_name + '</strong></div>' : '')
      + (expiry ? '<div style="font-size:.62rem;color:var(--blanc-d);margin-top:4px;">Expire le ' + expiry + '</div>' : '')
      + (gc.message ? '<div style="font-size:.7rem;font-style:italic;color:var(--blanc-d);margin-top:8px;padding-top:8px;border-top:1px solid var(--border);">"' + gc.message + '"</div>' : '')
      + '</div>'
      + (!gc.purchaser_email
        ? '<div style="margin-top:10px;padding:8px;background:rgba(231,76,60,.1);border:1px solid rgba(231,76,60,.3);border-radius:6px;font-size:.7rem;color:#E74C3C;">⚠️ Aucun email renseigné — modifie la carte pour en ajouter un.</div>'
        : '<div style="margin-top:8px;font-size:.68rem;color:var(--blanc-d);">Envoi vers : <strong style="color:var(--blanc);">' + gc.purchaser_email + '</strong></div>');
  };

  const purchaserEl = document.getElementById('send-gc-purchaser');
  const initialSender = gc.purchaser_name || '';
  if (purchaserEl) {
    purchaserEl.value = initialSender;
    purchaserEl.placeholder = 'Prénom ou nom de la personne qui offre';
    purchaserEl.oninput = () => buildPreview(purchaserEl.value.trim());
    const labelEl = purchaserEl.previousElementSibling;
    if (labelEl && labelEl.tagName === 'LABEL') labelEl.textContent = 'De la part de (expéditeur)';
  }
  buildPreview(initialSender);
  openModal('send-gc');
}

async function confirmSendGC() {
  if (!_sendGCId) return;
  const gc = _gcData.find(x => x.id === _sendGCId);
  if (!gc?.purchaser_email) { showToast('⚠️ Aucun email renseigné sur cette carte'); return; }
  const purchaser_name = document.getElementById('send-gc-purchaser')?.value?.trim() || null;
  const r = await api('POST', '/gift-cards/' + _sendGCId + '/send-email', { purchaser_name });
  if (r && r.ok) { closeModal('send-gc'); showToast('✅ Carte cadeau envoyée par email !'); loadGiftCards(); }
  else showToast('❌ ' + (r?.error || 'Erreur envoi email'));
}

// ══════════════════════════════════
// REMISES & PROMOS
// ══════════════════════════════════
let _discData = [];

async function loadDiscounts() {
  const el = document.getElementById('disc-list');
  if (el) el.innerHTML = '<div class="loading">Chargement...</div>';
  const data = await api('GET', '/discounts');
  if (!data) return;
  _discData = data.discounts || [];
  renderDiscounts(_discData);
}

function filterDiscounts(q) {
  const filtered = q ? _discData.filter(d => d.code.toLowerCase().includes(q.toLowerCase())) : _discData;
  renderDiscounts(filtered);
}

function renderDiscounts(discounts) {
  const el = document.getElementById('disc-list');
  if (!el) return;
  if (!discounts.length) { el.innerHTML = '<div class="empty">Aucune remise créée</div>'; return; }
  el.innerHTML = discounts.map(d => {
    const valTxt = d.type === 'percent' ? d.value + '%' : parseFloat(d.value).toFixed(2) + '€';
    const expired = d.expires_at && new Date(d.expires_at) < new Date();
    const isActive = d.is_active && !expired;
    const statusTxt = !d.is_active ? 'Désactivée' : expired ? 'Expirée' : 'Active';
    const statusColor = isActive ? '#2ECC71' : '#E74C3C';
    const usageTxt = d.max_uses ? (d.used_count || 0) + ' / ' + d.max_uses + ' utilisations' : (d.used_count || 0) + ' utilisation(s)';
    return '<div class="card" style="margin-bottom:10px;' + (!isActive ? 'opacity:.6;' : '') + '">'
      + '<div style="display:flex;align-items:center;gap:12px;">'
      + '<div style="min-width:60px;text-align:center;"><div style="font-family:Cormorant Garamond,serif;font-size:1.4rem;color:var(--or);">' + valTxt + '</div>'
      + '<div style="font-size:.6rem;color:var(--blanc-d);">' + (d.type === 'percent' ? 'pourcentage' : 'montant fixe') + '</div></div>'
      + '<div style="flex:1;"><div style="display:flex;align-items:center;gap:8px;margin-bottom:3px;">'
      + '<span style="font-family:JetBrains Mono,monospace;font-size:.78rem;color:var(--or);">' + d.code + '</span>'
      + '<span style="font-size:.6rem;padding:2px 7px;border-radius:3px;background:rgba(46,204,113,.1);color:' + statusColor + ';">' + statusTxt + '</span>'
      + '</div>'
      + (d.label ? '<div style="font-size:.72rem;color:var(--blanc);margin-bottom:2px;">' + d.label + '</div>' : '')
      + '<div style="font-size:.62rem;color:var(--blanc-d);">' + usageTxt + '</div>'
      + (d.expires_at ? '<div style="font-size:.6rem;color:' + (expired ? '#E74C3C' : 'var(--blanc-d)') + ';margin-top:2px;">Exp. ' + new Date(d.expires_at).toLocaleDateString('fr-FR') + '</div>' : '')
      + (d.min_amount ? '<div style="font-size:.6rem;color:var(--blanc-d);">Min. commande : ' + parseFloat(d.min_amount).toFixed(2) + '€</div>' : '')
      + '</div>'
      + '<div style="display:flex;flex-direction:column;gap:6px;">'
      + '<button onclick="openDiscForm(' + JSON.stringify(d.id) + ')" style="padding:4px 10px;background:var(--or-g);border:1px solid var(--border-h);color:var(--or);border-radius:4px;font-size:.62rem;cursor:pointer;">Modifier</button>'
      + '<button onclick="toggleDiscount(' + JSON.stringify(d.id) + ',' + !d.is_active + ')" style="padding:4px 10px;background:none;border:1px solid var(--border);color:var(--blanc-d);border-radius:4px;font-size:.62rem;cursor:pointer;">' + (d.is_active ? 'Désactiver' : 'Activer') + '</button>'
      + '</div></div></div>';
  }).join('');
}

let _editDiscId = null;

function openDiscForm(id) {
  _editDiscId = id || null;
  const titleEl = document.getElementById('disc-modal-title');
  if (titleEl) titleEl.textContent = id ? 'Modifier la remise' : 'Nouvelle remise / promo';
  ['disc-code', 'disc-label', 'disc-value', 'disc-min-amount', 'disc-max-uses', 'disc-expiry'].forEach(i => {
    const el = document.getElementById(i); if (el) el.value = '';
  });
  const typeEl = document.getElementById('disc-type');
  if (typeEl) typeEl.value = 'percent';
  if (id) {
    const d = _discData.find(x => x.id === id);
    if (d) {
      const f = (i, v) => { const el = document.getElementById(i); if (el) el.value = v || ''; };
      f('disc-code', d.code); f('disc-label', d.label); f('disc-value', d.value);
      f('disc-min-amount', d.min_amount); f('disc-max-uses', d.max_uses);
      f('disc-expiry', d.expires_at ? d.expires_at.slice(0, 10) : '');
      if (typeEl) typeEl.value = d.type || 'percent';
    }
  }
  openModal('new-disc');
}

async function saveDiscount() {
  const code = document.getElementById('disc-code')?.value?.trim().toUpperCase();
  const value = document.getElementById('disc-value')?.value;
  if (!code || !value) { showToast('⚠️ Code et valeur requis'); return; }
  const body = {
    code, type: document.getElementById('disc-type')?.value || 'percent', value: parseFloat(value),
    label: document.getElementById('disc-label')?.value?.trim() || null,
    min_amount: parseFloat(document.getElementById('disc-min-amount')?.value) || null,
    max_uses: parseInt(document.getElementById('disc-max-uses')?.value) || null,
    expires_at: document.getElementById('disc-expiry')?.value || null,
  };
  const r = _editDiscId ? await api('PUT', '/discounts/' + _editDiscId, body) : await api('POST', '/discounts', body);
  if (r && (r.ok || r.discount)) { closeModal('new-disc'); showToast(_editDiscId ? '✅ Remise mise à jour' : '✅ Remise créée — code : ' + code); loadDiscounts(); }
}

async function toggleDiscount(id, active) {
  const r = await api('PATCH', '/discounts/' + id, { is_active: active });
  if (r && r.ok) { showToast(active ? '✅ Remise activée' : 'Remise désactivée'); loadDiscounts(); }
}

// ══════════════════════════════════
// FORFAITS
// ══════════════════════════════════
let _pkgData = [], _cpkgData = [], _editPkgId = null;

async function loadPackages() {
  const pkgRes = await api('GET', '/packages');
  _pkgData = pkgRes?.packages || [];
  renderPkgList();
  const cpkgRes = await api('GET', '/packages/active-all');
  _cpkgData = cpkgRes?.client_packages || [];
  renderClientPkgs(_cpkgData);
}

function renderPkgList() {
  const el = document.getElementById('pkg-list');
  if (!el) return;
  const active = _pkgData.filter(p => p.is_active);
  if (!active.length) { el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--blanc-d);font-size:.8rem;">Aucun forfait créé</div>'; return; }
  el.innerHTML = active.map(p => {
    const perSvc = (parseFloat(p.price) / p.quantity).toFixed(2);
    return '<div class="pkg-card"><div class="pkg-badge-sessions">' + p.quantity + '<br><span style="font-size:.5rem;font-weight:400;">séances</span></div>'
      + '<div style="flex:1;"><div style="font-size:.78rem;color:var(--blanc);font-weight:500;">' + p.name + '</div>'
      + (p.service_name ? '<div style="font-size:.64rem;color:var(--blanc-d);">' + p.service_name + '</div>' : '')
      + '<div style="font-size:.64rem;color:var(--blanc-d);margin-top:2px;">' + parseFloat(p.price).toFixed(2) + '€ · ' + perSvc + '€/séance · ' + p.validity_days + 'j de validité</div></div>'
      + '<button onclick="openPkgForm(' + p.id + ')" style="padding:5px 10px;background:var(--noir-d);border:1px solid var(--border);color:var(--blanc-d);border-radius:5px;font-size:.65rem;cursor:pointer;">Modifier</button></div>';
  }).join('');
}

function filterClientPkgs() {
  const q = (document.getElementById('cpkg-search')?.value || '').toLowerCase();
  renderClientPkgs(q ? _cpkgData.filter(p => p.first_name.toLowerCase().includes(q)) : _cpkgData);
}

function renderClientPkgs(list) {
  const el = document.getElementById('cpkg-list');
  if (!el) return;
  if (!list.length) { el.innerHTML = '<div style="text-align:center;padding:20px;color:var(--blanc-d);font-size:.8rem;">Aucun forfait client actif</div>'; return; }
  el.innerHTML = list.map(p => {
    const pct = Math.round((p.sessions_remaining / p.sessions_total) * 100);
    const expired = p.expires_at && new Date(p.expires_at) < new Date();
    return '<div class="pkg-card" style="' + (expired ? 'opacity:.5;' : '') + '">'
      + '<div style="text-align:center;min-width:44px;"><div style="font-size:1.1rem;font-weight:700;color:' + (p.sessions_remaining > 0 ? 'var(--or)' : '#E74C3C') + ';">' + p.sessions_remaining + '</div>'
      + '<div style="font-size:.52rem;color:var(--blanc-d);">/ ' + p.sessions_total + '</div>'
      + '<div class="pkg-sessions-bar" style="width:44px;"><div class="pkg-sessions-fill" style="width:' + pct + '%;' + (p.sessions_remaining === 0 ? 'background:#E74C3C;' : '') + '"></div></div></div>'
      + '<div style="flex:1;"><div style="font-size:.76rem;color:var(--blanc);font-weight:500;">' + p.first_name + '</div>'
      + '<div style="font-size:.64rem;color:var(--blanc-d);">' + p.package_name + (p.service_name ? ' · ' + p.service_name : '') + '</div>'
      + (p.expires_at ? '<div style="font-size:.62rem;color:' + (expired ? '#E74C3C' : 'var(--blanc-d)') + ';">Exp. ' + new Date(p.expires_at).toLocaleDateString('fr-FR') + '</div>' : '')
      + '</div></div>';
  }).join('');
}

function openPkgForm(id) {
  _editPkgId = id || null;
  const titleEl = document.getElementById('pkg-modal-title');
  if (titleEl) titleEl.textContent = id ? 'Modifier le forfait' : 'Nouveau forfait';
  ['pkg-name', 'pkg-svc'].forEach(i => { const el = document.getElementById(i); if (el) el.value = ''; });
  const qtyEl = document.getElementById('pkg-qty'), prEl = document.getElementById('pkg-price'), valEl = document.getElementById('pkg-validity');
  if (qtyEl) qtyEl.value = 10; if (prEl) prEl.value = ''; if (valEl) valEl.value = 365;
  if (id) {
    const p = _pkgData.find(x => x.id === id);
    if (p) {
      const f = (i, v) => { const el = document.getElementById(i); if (el) el.value = v || ''; };
      f('pkg-name', p.name); f('pkg-svc', p.service_name); f('pkg-qty', p.quantity); f('pkg-price', p.price); f('pkg-validity', p.validity_days);
    }
  }
  openModal('new-pkg');
}

async function savePkg() {
  const name = document.getElementById('pkg-name')?.value?.trim();
  const qty = document.getElementById('pkg-qty')?.value;
  const price = document.getElementById('pkg-price')?.value;
  if (!name || !qty || !price) { showToast('⚠️ Nom, séances et prix requis'); return; }
  const body = { name, quantity: qty, price, service_name: document.getElementById('pkg-svc')?.value || null, validity_days: document.getElementById('pkg-validity')?.value || 365 };
  const r = _editPkgId ? await api('PUT', '/packages/' + _editPkgId, body) : await api('POST', '/packages', body);
  if (r && (r.ok || r.package)) { closeModal('new-pkg'); showToast(_editPkgId ? '✅ Forfait mis à jour' : '✅ Forfait créé'); loadPackages(); }
}

async function openAssignPkg() {
  document.getElementById('assign-client-search').value = '';
  document.getElementById('assign-client-id').value = '';
  document.getElementById('assign-client-selected').style.display = 'none';
  document.getElementById('assign-client-results').style.display = 'none';
  document.getElementById('assign-notes').value = '';
  const sel = document.getElementById('assign-pkg-id');
  sel.innerHTML = _pkgData.filter(p => p.is_active).map(p => '<option value="' + p.id + '">' + p.name + ' (' + p.quantity + ' séances · ' + parseFloat(p.price).toFixed(2) + '€)</option>').join('');
  openModal('assign-pkg');
}

async function searchAssignClient() {
  const q = document.getElementById('assign-client-search')?.value?.trim();
  if (q.length < 2) { document.getElementById('assign-client-results').style.display = 'none'; return; }
  const data = await api('GET', '/clients?search=' + encodeURIComponent(q));
  const clients = (data?.clients || []).slice(0, 6);
  const res = document.getElementById('assign-client-results');
  if (!clients.length) { res.style.display = 'none'; return; }
  res.innerHTML = clients.map(c => '<div onclick="selectAssignClient(' + JSON.stringify(c.id) + ',' + JSON.stringify(c.first_name) + ')" style="padding:8px 12px;font-size:.72rem;color:var(--blanc);cursor:pointer;border-bottom:1px solid var(--border);">' + c.first_name + (c.phone ? ' · ' + c.phone : '') + '</div>').join('');
  res.style.display = 'block';
}

function selectAssignClient(id, name) {
  document.getElementById('assign-client-id').value = id;
  document.getElementById('assign-client-search').value = name;
  document.getElementById('assign-client-selected').textContent = '✅ ' + name;
  document.getElementById('assign-client-selected').style.display = 'block';
  document.getElementById('assign-client-results').style.display = 'none';
}

async function saveAssignPkg() {
  const clientId = document.getElementById('assign-client-id')?.value;
  const pkgId = document.getElementById('assign-pkg-id')?.value;
  if (!clientId) { showToast('⚠️ Sélectionnez un client'); return; }
  const r = await api('POST', '/packages/assign', { client_id: clientId, package_id: pkgId, notes: document.getElementById('assign-notes')?.value });
  if (r && r.client_package) { closeModal('assign-pkg'); showToast('✅ Forfait assigné !'); loadPackages(); }
}
