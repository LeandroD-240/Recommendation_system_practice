const CAT_COLORS = {
  'Garden':     '#5DADE2',
  'Gifts':      '#A188A6',
  'Home Decor': '#01386A',
  'Kitchen':    '#E07B54',
  'Seasonal':   '#F2C94C',
  'Stationery': '#48C9B0',
  'Textiles':   '#BEEF9E',
  'Toys':       '#EC407A',
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

let PRODUCTS = [];

async function loadProducts() {
  try {
    const resp = await fetch('/api/products');
    if (!resp.ok) throw new Error('Unable to fetch products');
    PRODUCTS = await resp.json();
    PRODUCTS.forEach(p => p.img = CAT_IMG[p.category] || '');
    renderGrid();
  } catch (err) {
    console.error(err);
    const grid = document.getElementById('grid');
    if (grid) {
      grid.innerHTML = '<div class="empty">Unable to load products</div>';
    }
  }
}

let activeFilter = 'All';

const categories = ['All', ...Object.keys(CAT_COLORS)];
const filtersEl  = document.getElementById('filters');

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

function toTitle(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

function renderGrid() {
  const grid   = document.getElementById('grid');
  const label  = document.getElementById('count-label');
  const list   = activeFilter === 'All' ? PRODUCTS : PRODUCTS.filter(p => p.category === activeFilter);

  label.textContent = list.length + ' item' + (list.length !== 1 ? 's' : '');
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = '<div class="empty">No products found</div>';
    return;
  }

  list.forEach(p => {
    const color = CAT_COLORS[p.category] || '#01386A';
    const image = CAT_IMG[p.category] || '';
    const card  = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-img" style="background-image:${image ? `url('${image}')` : 'none'};">
        <div class="cat-dot" style="background:${color}"></div>
        <span class="product-initial">${p.name[0]}</span>
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

loadProducts();