/* ─────────────────────────────────────────────────────────────────────
   DATA & CONSTANTS
───────────────────────────────────────────────────────────────────── */
const CAT_COLORS = {
  'Garden':'#5DADE2','Gifts':'#A188A6','Home Decor':'#01386A',
  'Kitchen':'#E07B54','Seasonal':'#F2C94C','Stationery':'#48C9B0',
  'Textiles':'#BEEF9E','Toys':'#EC407A'
};

const CAT_IMG = {
  'Garden':     'img/garden_rec.webp',
  'Gifts':      'img/gifts_rec.JPG',
  'Home Decor': 'img/home_decor_rec.jpg',
  'Kitchen':    'img/kitchen_rec.jpg',
  'Seasonal':   'img/seasonal_rec.jpg',
  'Stationery': 'img/stationery_rec.webp',
  'Textiles':   'img/textiles_rec.jpg',
  'Toys':       'img/toys_rec.jpg',
};

const ALL_PRODUCTS = [{"sku":"21433","name":"BIRD FEEDER","category":"Garden","price":10.95},{"sku":"21332","name":"GARDEN KNEELER","category":"Garden","price":9.5},{"sku":"21026","name":"GARDEN TROWEL","category":"Garden","price":6.5},{"sku":"21585","name":"GARDENING GLOVES","category":"Garden","price":5.95},{"sku":"21395","name":"HANGING BASKET","category":"Garden","price":7.25},{"sku":"21500","name":"OUTDOOR LANTERN","category":"Garden","price":15.5},{"sku":"20945","name":"PLANT POT TERRACOTTA","category":"Garden","price":3.95},{"sku":"21061","name":"SEED PACKETS BUNDLE","category":"Garden","price":4.25},{"sku":"21154","name":"WATERING CAN","category":"Garden","price":12.75},{"sku":"21253","name":"WIND CHIME","category":"Garden","price":8.95},{"sku":"22229","name":"BATH BOMB SET","category":"Gifts","price":14.5},{"sku":"22174","name":"CANDLE GIFT SET","category":"Gifts","price":18.95},{"sku":"22073","name":"GIFT BAG LARGE","category":"Gifts","price":2.5},{"sku":"22370","name":"LUXURY NOTEBOOK","category":"Gifts","price":15.95},{"sku":"22413","name":"PERSONALISED MUG","category":"Gifts","price":9.95},{"sku":"22428","name":"PHOTO ALBUM","category":"Gifts","price":13.5},{"sku":"22094","name":"RIBBON SPOOL","category":"Gifts","price":1.95},{"sku":"22283","name":"SOAP SET","category":"Gifts","price":12.75},{"sku":"22152","name":"TISSUE PAPER PACK","category":"Gifts","price":2.25},{"sku":"22496","name":"TRINKET BOX","category":"Gifts","price":8.25},{"sku":"20091","name":"CANDLE HOLDER SET","category":"Home Decor","price":4.95},{"sku":"20173","name":"CERAMIC VASE","category":"Home Decor","price":8.25},{"sku":"20252","name":"CUSHION COVER","category":"Home Decor","price":5.5},{"sku":"20214","name":"DECORATIVE LANTERN","category":"Home Decor","price":9.75},{"sku":"20398","name":"DOOR WREATH","category":"Home Decor","price":14.5},{"sku":"20115","name":"METAL WALL CLOCK","category":"Home Decor","price":12.5},{"sku":"20128","name":"PHOTO FRAME SET","category":"Home Decor","price":7.95},{"sku":"20477","name":"STORAGE BASKET","category":"Home Decor","price":8.75},{"sku":"20279","name":"TABLE RUNNER","category":"Home Decor","price":6.95},{"sku":"20302","name":"WALL HANGING","category":"Home Decor","price":11.0},{"sku":"20932","name":"BAKING MAT","category":"Kitchen","price":6.75},{"sku":"20845","name":"CAKE TIN SET","category":"Kitchen","price":11.25},{"sku":"20647","name":"CERAMIC MUG SET","category":"Kitchen","price":12.95},{"sku":"20771","name":"COLANDER","category":"Kitchen","price":7.95},{"sku":"20498","name":"GLASS STORAGE JAR","category":"Kitchen","price":3.75},{"sku":"20661","name":"KITCHEN TOWEL SET","category":"Kitchen","price":5.25},{"sku":"20695","name":"OVEN MITT PAIR","category":"Kitchen","price":4.5},{"sku":"20732","name":"SALAD BOWL SET","category":"Kitchen","price":16.5},{"sku":"20674","name":"SPICE RACK","category":"Kitchen","price":14.95},{"sku":"20583","name":"WOODEN CUTTING BOARD","category":"Kitchen","price":9.95},{"sku":"22599","name":"ADVENT CALENDAR","category":"Seasonal","price":19.95},{"sku":"23122","name":"AUTUMN WREATH","category":"Seasonal","price":16.95},{"sku":"22804","name":"BIRTHDAY BANNER","category":"Seasonal","price":3.95},{"sku":"22574","name":"CHRISTMAS BAUBLE SET","category":"Seasonal","price":7.95},{"sku":"22677","name":"EASTER EGG BASKET","category":"Seasonal","price":8.75},{"sku":"22657","name":"FAIRY LIGHTS","category":"Seasonal","price":12.5},{"sku":"22757","name":"HALLOWEEN DECORATION","category":"Seasonal","price":6.5},{"sku":"22894","name":"NEW YEAR CONFETTI","category":"Seasonal","price":2.75},{"sku":"23039","name":"SUMMER BUNTING","category":"Seasonal","price":9.25},{"sku":"22983","name":"VALENTINES CARD SET","category":"Seasonal","price":5.5},{"sku":"22050","name":"BOOKMARK SET","category":"Stationery","price":3.5},{"sku":"21886","name":"CALENDAR PLANNER","category":"Stationery","price":9.95},{"sku":"21670","name":"DESK ORGANISER","category":"Stationery","price":11.95},{"sku":"21960","name":"ENVELOPE PACK","category":"Stationery","price":4.25},{"sku":"21997","name":"GIFT WRAP SHEET","category":"Stationery","price":2.95},{"sku":"21630","name":"NOTEBOOK SET","category":"Stationery","price":6.95},{"sku":"21640","name":"PEN SET LUXURY","category":"Stationery","price":8.5},{"sku":"21931","name":"STAMP SET","category":"Stationery","price":7.5},{"sku":"21769","name":"STICKY NOTES BUNDLE","category":"Stationery","price":3.25},{"sku":"21833","name":"WASHI TAPE SET","category":"Stationery","price":5.75},{"sku":"23768","name":"APRON","category":"Textiles","price":9.75},{"sku":"23621","name":"BED RUNNER","category":"Textiles","price":18.5},{"sku":"23946","name":"CURTAIN TIEBACK","category":"Textiles","price":6.5},{"sku":"24041","name":"FABRIC BUNDLE","category":"Textiles","price":14.25},{"sku":"23855","name":"NAPKIN SET","category":"Textiles","price":7.25},{"sku":"23798","name":"OVEN GLOVE SET","category":"Textiles","price":8.5},{"sku":"23910","name":"PLACEMATS SET","category":"Textiles","price":11.95},{"sku":"24085","name":"QUILTED BAG","category":"Textiles","price":19.95},{"sku":"23553","name":"THROW BLANKET","category":"Textiles","price":24.95},{"sku":"23712","name":"TOWEL SET","category":"Textiles","price":21.95},{"sku":"23450","name":"BUILDING BLOCKS","category":"Toys","price":15.95},{"sku":"23322","name":"CARD GAME","category":"Toys","price":9.5},{"sku":"23189","name":"COLOURING BOOK SET","category":"Toys","price":6.75},{"sku":"23174","name":"CRAFT KIT KIDS","category":"Toys","price":11.5},{"sku":"23508","name":"FINGER PUPPET SET","category":"Toys","price":5.25},{"sku":"23369","name":"JIGSAW 500PC","category":"Toys","price":12.95},{"sku":"23428","name":"PAINT SET","category":"Toys","price":13.75},{"sku":"23283","name":"PLAY DOUGH SET","category":"Toys","price":7.25},{"sku":"23389","name":"STICKER BOOK","category":"Toys","price":4.5},{"sku":"23156","name":"WOODEN PUZZLE","category":"Toys","price":8.95}];

// top-3 fallback by price (placeholder for popular)
const TOP3 = ALL_PRODUCTS.slice().sort((a,b) => b.price - a.price).slice(0,3);

const SHIPPING_THRESHOLD = 50;
let qty = 1;
let basket = {};   // { sku: { product, qty } }

/* ─────────────────────────────────────────────────────────────────────
   LOAD PRODUCT
───────────────────────────────────────────────────────────────────── */
// Read product from sessionStorage (set by index.html) or use default
let product = JSON.parse(sessionStorage.getItem('selectedProduct') || 'null')
           || ALL_PRODUCTS.find(p => p.name === 'CANDLE GIFT SET')
           || ALL_PRODUCTS[0];
product.img = CAT_IMG[product.category] || product.img || '';

function toTitle(s) { return s.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()); }
function fmt(n)     { return '£' + n.toFixed(2); }

function mountProduct(p) {
  document.title = `Wren & Co. — ${toTitle(p.name)}`;
  const color = CAT_COLORS[p.category] || '#01386A';
  const image = p.img || '';

  document.getElementById('bc-cat').textContent      = p.category;
  document.getElementById('bc-name').textContent     = toTitle(p.name);
  document.getElementById('img-initial').textContent  = p.name[0];
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

mountProduct(product);

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
      sessionStorage.setItem('selectedProduct', JSON.stringify(p));
      window.location.href = 'product.html';
    };
    grid.appendChild(card);
  });
}

initCatalogue();

/* ─────────────────────────────────────────────────────────────────────
   QTY CONTROLS
───────────────────────────────────────────────────────────────────── */
function changeQty(delta) {
  qty = Math.max(1, qty + delta);
  document.getElementById('qty-display').textContent = qty;
}

/* ─────────────────────────────────────────────────────────────────────
   BASKET
───────────────────────────────────────────────────────────────────── */
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

function addToBasket() {
  const sku = product.sku;
  if (basket[sku]) {
    basket[sku].qty += qty;
  } else {
    basket[sku] = { product, qty };
  }
  qty = 1;
  document.getElementById('qty-display').textContent = 1;
  renderBasket();
  showToast(`${toTitle(product.name)} added to basket`);
}

function removeFromBasket() {
  const sku = product.sku;
  if (basket[sku]) {
    delete basket[sku];
    renderBasket();
    showToast(`${toTitle(product.name)} removed`);
  }
}

function removeItem(sku) {
  delete basket[sku];
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

  // shipping bar
  const progress = Math.min(100, (total / SHIPPING_THRESHOLD) * 100);
  document.getElementById('shipping-fill').style.width = progress + '%';
  const remaining = Math.max(0, SHIPPING_THRESHOLD - total);
  document.getElementById('shipping-label').textContent = remaining > 0
    ? `Add ${fmt(remaining)} more for free shipping`
    : '🎉 Free shipping unlocked!';

  // item list
  const el = document.getElementById('basket-items');
  el.innerHTML = '';
  items.forEach(({ product: p, qty: q }) => {
    const row = document.createElement('div');
    row.className = 'basket-item';
    row.innerHTML = `
      <div class="basket-item-thumb">${p.name[0]}</div>
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

/* ─────────────────────────────────────────────────────────────────────
   RECOMMENDATIONS
───────────────────────────────────────────────────────────────────── */
function findProductByName(name) {
  return ALL_PRODUCTS.find(p => p.name === name);
}

async function loadRecs() {
  const API = 'http://127.0.0.1:8000/recommend';
  const CUSTOMER_ID = 10042;   // demo customer

  try {
    const resp = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customer_id: CUSTOMER_ID, product_clicked: product.name })
    });
    if (!resp.ok) throw new Error('API error');
    const data = await resp.json();
    renderRecs(data.recommendations, false);
  } catch {
    // API not running — use top-3 fallback
    const fallback = TOP3
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
        <span class="rec-initial">${p.name[0]}</span>
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
      sessionStorage.setItem('selectedProduct', JSON.stringify(p));
      location.reload();
    };
    grid.appendChild(card);
  });
}

loadRecs();

// CHECKOUT
document.getElementById("checkout-alert").addEventListener("click", function() {
  alert("Thanks for try!")
});