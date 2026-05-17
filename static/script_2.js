/* ─────────────────────────────────────────────────────────────────────
   DATA & CONSTANTS
───────────────────────────────────────────────────────────────────── */
const CAT_COLORS = {
  'Garden':'#5DADE2','Gifts':'#A188A6','Home Decor':'#01386A',
  'Kitchen':'#E07B54','Seasonal':'#F2C94C','Stationery':'#48C9B0',
  'Textiles':'#BEEF9E','Toys':'#EC407A'
};

const CAT_IMG = {
  "Garden":     "/static/img/garden_rec.webp",
  "Gifts":      "/static/img/gifts_rec.JPG",
  "Home Decor": "/static/img/home_decor_rec.jpg",
  "Kitchen":    "/static/img/kitchen_rec.jpg",
  "Seasonal":   "/static/img/seasonal_rec.jpg",
  "Stationery": "/static/img/stationery_rec.webp",
  "Textiles":   "/static/img/textiles_rec.jpg",
  "Toys":       "/static/img/toys_rec.jpg",
};

let ALL_PRODUCTS = [];

function popularFallback() {
  return ALL_PRODUCTS.slice().sort((a,b) => b.price - a.price).slice(0,3);
}

const SHIPPING_THRESHOLD = 50;
let qty = 1;
let basket = {};   // { sku: { product, qty } }
let product = null;

/* ─────────────────────────────────────────────────────────────────────
   DATA LOADING
───────────────────────────────────────────────────────────────────── */
async function loadProducts() {
  try {
    const resp = await fetch('/api/products');
    if (!resp.ok) throw new Error('Unable to fetch products');
    ALL_PRODUCTS = await resp.json();
    ALL_PRODUCTS.forEach(p => p.img = CAT_IMG[p.category] || '');
  } catch (err) {
    console.error('Product load failed', err);
    ALL_PRODUCTS = [];
  }
}

async function loadSelectedProduct() {
  const selectedSku = sessionStorage.getItem('selectedProductSku');

  if (selectedSku) {
    try {
      const resp = await fetch(`/api/products/${encodeURIComponent(selectedSku)}`);
      if (resp.ok) {
        product = await resp.json();
      }
    } catch (err) {
      console.error('Selected product load failed', err);
    }
  }

  if (!product && ALL_PRODUCTS.length > 0) {
    product = ALL_PRODUCTS.find(p => p.name === 'CANDLE GIFT SET') || ALL_PRODUCTS[0];
  }

  if (!product) {
    product = { sku: '', name: 'Unknown product', category: 'Gifts', price: 0 };
  }

  product.img = CAT_IMG[product.category] || product.img || '';
}

function loadBasket() {
  const raw = sessionStorage.getItem('basket');
  if (!raw) return;

  try {
    const items = JSON.parse(raw);
    if (!Array.isArray(items)) return;

    items.forEach(({ sku, qty }) => {
      const productData = ALL_PRODUCTS.find(p => p.sku === sku);
      if (productData) {
        basket[sku] = { product: productData, qty: Number(qty) || 1 };
      }
    });
  } catch (err) {
    console.error('Basket load failed', err);
  }
}

function saveBasket() {
  const items = Object.values(basket).map(({ product, qty }) => ({ sku: product.sku, qty }));
  sessionStorage.setItem('basket', JSON.stringify(items));
}

function toTitle(s) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
function fmt(n)     { return '£' + n.toFixed(2); }

function mountProduct(p) {
  document.title = `Wren & Co. — ${toTitle(p.name)}`;
  const color = CAT_COLORS[p.category] || '#01386A';
  const image = p.img || '';

  document.getElementById('bc-cat').textContent      = p.category;
  document.getElementById('bc-name').textContent     = toTitle(p.name);
  document.getElementById('img-initial').textContent  = p.name[0] || '';
  document.getElementById('img-sku').textContent      = 'SKU ' + p.sku;
  document.querySelector('.img-frame').style.backgroundImage = image ? `url('${image}')` : 'none';
  document.getElementById('cat-dot-badge').style.background = color;
  document.getElementById('cat-badge-label').textContent    = p.category;
  document.getElementById('info-cat').textContent    = p.category;
  document.getElementById('info-title').textContent  = toTitle(p.name);
  document.getElementById('info-price').textContent  = fmt(p.price);
  document.getElementById('detail-sku').textContent  = p.sku;
  document.getElementById('detail-cat').textContent  = p.category;
  document.getElementById('detail-price').textContent = fmt(p.price);
}

let activeFilter = 'All';

function initCatalogue() {
  const filtersEl = document.getElementById('filters');
  const gridEl = document.getElementById('grid');
  if (!filtersEl || !gridEl) return;

  const categories = ['All', ...Object.keys(CAT_COLORS)];
  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat === 'All' ? ' active' : '');
    btn.textContent = cat;
    btn.onclick = () => {
      activeFilter = cat;
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderGrid();
    };
    filtersEl.appendChild(btn);
  });

  renderGrid();
}

function renderGrid() {
  const grid = document.getElementById('grid');
  if (!grid) return;

  const list = activeFilter === 'All' ? ALL_PRODUCTS : ALL_PRODUCTS.filter(p => p.category === activeFilter);
  const label = document.getElementById('count-label');
  if (label) {
    label.textContent = list.length + ' item' + (list.length !== 1 ? 's' : '');
  }

  grid.innerHTML = '';
  if (!list.length) {
    grid.innerHTML = '<div class="empty">No products found</div>';
    return;
  }

  list.forEach(p => {
    const color = CAT_COLORS[p.category] || '#01386A';
    const image = CAT_IMG[p.category] || '';
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img" style="background-image:${image ? `url('${image}')` : 'none'};">
        <div class="cat-dot" style="background:${color}"></div>
        <span class="product-initial">${p.name[0] || ''}</span>
      </div>
      <div class="product-body">
        <div class="product-cat">${p.category}</div>
        <div class="product-name">${toTitle(p.name)}</div>
        <div class="product-foot">
          <span class="product-price">£${p.price.toFixed(2)}</span>
          <span class="product-btn">→</span>
        </div>
      </div>`;
    card.onclick = () => {
      sessionStorage.setItem('selectedProductSku', p.sku);
      window.location.href = '/product';
    };
    grid.appendChild(card);
  });
}

function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById('qty-display').textContent = qty;
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function addToBasket() {
  const sku = product.sku;
  if (!sku) return;
  if (basket[sku]) {
    basket[sku].qty += qty;
  } else {
    basket[sku] = { product, qty };
  }
  saveBasket();
  qty = 1;
  document.getElementById('qty-display').textContent = 1;
  renderBasket();
  showToast(`${toTitle(product.name)} added to basket`);
  loadRecs();
}

function removeFromBasket() {
  const sku = product.sku;
  if (basket[sku]) {
    delete basket[sku];
    saveBasket();
    renderBasket();
    showToast(`${toTitle(product.name)} removed`);
  }
}

function removeItem(sku) {
  delete basket[sku];
  saveBasket();
  renderBasket();
}

function renderBasket() {
  const items   = Object.values(basket);
  const isEmpty = items.length === 0;
  const total   = items.reduce((s, i) => s + i.product.price * i.qty, 0);
  const count   = items.reduce((s, i) => s + i.qty, 0);

  document.getElementById('basket-empty').style.display  = isEmpty ? 'flex'   : 'none';
  document.getElementById('basket-items').style.display  = isEmpty ? 'none'   : 'block';
  document.getElementById('basket-footer').style.display = isEmpty ? 'none'   : 'block';
  document.getElementById('basket-count').textContent    = count + (count === 1 ? ' item' : ' items');
  document.getElementById('basket-total').textContent    = fmt(total);

  const progress = Math.min(100, (total / SHIPPING_THRESHOLD) * 100);
  document.getElementById('shipping-fill').style.width = progress + '%';
  const remaining = Math.max(0, SHIPPING_THRESHOLD - total);
  document.getElementById('shipping-label').textContent = remaining > 0
    ? `Add ${fmt(remaining)} more for free shipping`
    : '🎉 Free shipping unlocked!';

  const el = document.getElementById('basket-items');
  el.innerHTML = '';
  items.forEach(({ product: p, qty: q }) => {
    const row = document.createElement('div');
    row.className = 'basket-item';
    row.innerHTML = `
      <div class="basket-item-thumb">${p.name[0] || ''}</div>
      <div class="basket-item-info">
        <div class="basket-item-name">${toTitle(p.name)}</div>
        <div class="basket-item-meta">qty ${q} · ${p.category}</div>
      </div>
      <div class="basket-item-right">
        <span class="basket-item-price">${fmt(p.price * q)}</span>
        <button class="basket-item-remove" onclick="removeItem('${p.sku}')">Remove</button>
      </div>`;
    el.appendChild(row);
  });
}

function findProductByName(name) {
  return ALL_PRODUCTS.find(p => p.name === name);
}

async function loadRecs() {
  const API = '/recommend';
  try {
    const resp = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        basket_items: Object.values(basket).map(item => item.product.name)
      })
    });
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    renderRecs(data.recommendations, false);
  } catch {
    const fallback = popularFallback()
      .filter(p => p.sku !== product.sku)
      .slice(0, 3)
      .map(p => ({ stock_code: p.sku, description: p.name, source: 'popular' }));
    renderRecs(fallback, true);
  }
}

function renderRecs(recs, isFallback) {
  const grid = document.getElementById('recs-grid');
  const tag  = document.getElementById('recs-source-tag');

  tag.textContent = isFallback ? 'Popular products' : 'Personalised for you';
  grid.innerHTML  = '';

  recs.forEach((rec, i) => {
    const p     = findProductByName(rec.description) || { name: rec.description, category: '—', price: 0, sku: rec.stock_code };
    const color = CAT_COLORS[p.category] || '#01386A';
    const image = CAT_IMG[p.category] || '';
    const card  = document.createElement('div');
    card.className = 'rec-card fade-up';
    card.style.animationDelay = (i * 80) + 'ms';
    card.innerHTML = `
      <div class="rec-img" style="background-image:${image ? `url('${image}')` : 'none'};">
        <div class="rec-dot" style="background:${color}"></div>
        <span class="rec-source-tag">${rec.source === 'rules' ? 'Match' : 'Popular'}</span>
        <span class="rec-initial">${p.name[0] || ''}</span>
      </div>
      <div class="rec-body">
        <div class="rec-cat">${p.category}</div>
        <div class="rec-name">${toTitle(p.name)}</div>
        <div class="rec-footer">
          <span class="rec-price">${p.price > 0 ? fmt(p.price) : '—'}</span>
          <span class="rec-btn">→</span>
        </div>
      </div>`;
    card.onclick = () => {
      sessionStorage.setItem('selectedProductSku', p.sku);
      location.reload();
    };
    grid.appendChild(card);
  });
}

async function initializePage() {
  await loadProducts();
  await loadSelectedProduct();
  loadBasket();

  if (!Object.keys(basket).length && product && product.sku) {
    basket[product.sku] = { product, qty: 1 };
    saveBasket();
  }

  if (product) {
    mountProduct(product);
  }

  initCatalogue();
  renderBasket();
  loadRecs();
}

initializePage();

document.getElementById("checkout-alert").addEventListener("click", function() {
  alert("Thanks for try!")
});
