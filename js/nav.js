// ══════════════════════════════════
// NAVIGATION
// ══════════════════════════════════
const PAGE_CFG = {
  dash:       { title: 'Tableau de bord', action: '+ Nouveau client', fn: () => openModal('new-client') },
  clients:    { title: 'Clients',          action: '+ Nouveau client', fn: () => openModal('new-client') },
  agenda:     { title: 'Agenda',           action: '+ Nouveau RDV',    fn: () => openModal('new-rdv') },
  personnel:  { title: 'Personnel',        action: '+ Ajouter',        fn: () => openModal('new-staff') },
  fidelite:   { title: 'Fidélité',         action: '',                 fn: () => {} },
  services:   { title: 'Prestations',      action: '+ Ajouter',        fn: () => openModal('new-service') },
  caisse:     { title: 'Caisse',           action: '✏️ Personnaliser', fn: () => toggleEditMode(true) },
  parametres: { title: 'Paramètres',       action: '',                 fn: () => {} },
  stats:      { title: 'Statistiques',     action: '📥 Exporter',     fn: () => openExportModal() },
  'gift-cards': { title: 'Cartes cadeau',  action: '+ Créer',          fn: () => openGCForm() },
  discounts:  { title: 'Remises & promos', action: '+ Créer',          fn: () => openDiscForm() },
  packages:   { title: 'Forfaits',         action: '+ Nouveau',        fn: () => openPkgForm() },
  stock:      { title: 'Stocks',           action: '+ Nouveau produit', fn: () => openStockForm() },
};

function go(page) {
  document.querySelectorAll('.mov').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('[id^="modal-"]').forEach(m => m.classList.remove('open'));
  document.querySelectorAll('.page').forEach(p => p.classList.remove('on'));
  document.querySelectorAll('.ni').forEach(n => n.classList.remove('on'));
  const pageEl = document.getElementById('p-' + page);
  if (!pageEl) { console.warn('Page introuvable : p-' + page); return; }
  pageEl.classList.add('on');
  const ni = document.getElementById('n-' + page);
  if (ni) ni.classList.add('on');
  const cfg = PAGE_CFG[page] || {};
  document.getElementById('tb-title').textContent = cfg.title || page;
  document.getElementById('tb-action').textContent = cfg.action || '';
  document.getElementById('tb-action')._fn = cfg.fn;
  if (page === 'dash')       loadDashboard();
  if (page === 'clients')    loadClients();
  if (page === 'stats')      loadStats();
  if (page === 'parametres') loadSettings();
  if (page === 'caisse')     initCaisse();
  if (page === 'agenda')     loadAgenda();
  if (page === 'personnel')  loadPersonnel();
  if (page === 'fidelite')   loadFidelite();
  if (page === 'services')   loadServices();
  if (page === 'stock')      loadStock();
  if (page === 'gift-cards') loadGiftCards();
  if (page === 'discounts')  loadDiscounts();
  if (page === 'packages')   loadPackages();
}

function tbAction() {
  const fn = document.getElementById('tb-action')._fn;
  if (fn) fn();
}

document.getElementById('sb-salon').textContent = currentUser.tenant_name || 'Mon salon';
document.getElementById('sb-email').textContent = currentUser.email || '';
document.getElementById('sb-role').textContent  = currentUser.role === 'owner' ? 'Propriétaire' : 'Staff';
const _initials = (currentUser.email || 'U')[0].toUpperCase();
document.getElementById('sb-av').textContent = _initials;

const _now = new Date();
document.getElementById('greet-date').textContent = _now.toLocaleDateString('fr-FR', {
  weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
});
const _h = _now.getHours();
document.getElementById('greet-name').textContent = currentUser.tenant_name || 'vous';
