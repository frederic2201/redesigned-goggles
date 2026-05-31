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