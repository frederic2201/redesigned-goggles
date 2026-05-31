// ══════════════════════════════════
// CONFIG & AUTH
// ══════════════════════════════════
const API = '';
let token = localStorage.getItem('cizo_token');
let currentUser = JSON.parse(localStorage.getItem('cizo_user') || '{}');
let cart = [];
let selPm = 'card';
let searchTimer = null;

// Redirection si non connecté
if (!token) window.location.href = '/';

// ══════════════════════════════════
// API HELPER
// ══════════════════════════════════
async function api(method, path, body) {
  try {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(API + '/api' + path, opts);
    if (res.status === 401) { logout(); return null; }
    const text = await res.text();
    try { return JSON.parse(text); } catch(e) { console.error('api() parse error:', text); return null; }
  } catch(e) { console.error('api() fetch error:', e.message); return null; }
}

// ══════════════════════════════════
// TOAST
// ══════════════════════════════════
function showToast(msg) { return toast(msg); }
function toast(msg) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('on');
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove('on'), 2800);
}

// ══════════════════════════════════
// MODAL
// ══════════════════════════════════
function openModal(id) {
  document.getElementById('modal-' + id).classList.add('open');
  if (id === 'new-rdv') loadRDVSelects();
}
function closeModal(id) {
  document.getElementById('modal-' + id).classList.remove('open');
  const okEl  = document.getElementById('nc-ok');
  const errEl = document.getElementById('nc-err');
  if (okEl)  okEl.style.display  = 'none';
  if (errEl) errEl.style.display = 'none';
}

// ══════════════════════════════════
// AUTH
// ══════════════════════════════════
function logout() {
  localStorage.removeItem('cizo_token');
  localStorage.removeItem('cizo_user');
  window.location.href = '/';
}

function applyBranding(color, name) {
  try {
    if (color) document.documentElement.style.setProperty('--or', color);
  } catch(e) { console.warn('applyBranding:', e); }
}
