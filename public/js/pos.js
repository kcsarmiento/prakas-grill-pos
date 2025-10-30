/* ========= Constants ========= */
const DEFAULT_STOCK = 100;
const MAX_STOCK_ALLOWED = 10000;
const INVENTORY_KEY = 'prakas_inventory';
const SALES_KEY = 'prakas_sales';
const CART_KEY = 'prakas_cart';

const MENU = [
  { name: 'Pork BBQ', price: 10 },
  { name: 'Chicken BBQ', price: 35 },
  { name: 'Isaw', price: 5 },
  { name: 'Liempo', price: 180 },
  { name: 'Pusit', price: 120 },
  { name: 'Bangus', price: 150 },
  { name: 'Dugo', price: 5 },
  { name: 'Chicken Skin', price: 10 },
  { name: 'Hungarian', price: 80 },
  { name: 'Puso', price: 10 },
  { name: 'Rice', price: 10 },
];

/* ========= Init inventory ========= */
function initInventory() {
  let stored = {};
  try {
    stored = JSON.parse(localStorage.getItem(INVENTORY_KEY)) || {};
  } catch(e) {
    console.warn('Failed to parse inventory from localStorage', e);
    stored = {};
  }

  MENU.forEach(item => {
    if (!stored[item.name]) {
      stored[item.name] = { price: item.price, stock: DEFAULT_STOCK };
    }
  });

  localStorage.setItem(INVENTORY_KEY, JSON.stringify(stored));
  return stored;
}

let inventory = initInventory();
let sales = JSON.parse(localStorage.getItem(SALES_KEY) || '[]');
let cart = [];

/* ========= Restore cart ========= */
try {
  const saved = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
  if (Array.isArray(saved)) {
    cart = saved.map(item => {
      if (!inventory[item.name]) return null;
      const qty = Math.max(0, Math.min(parseInt(item.qty) || 0, inventory[item.name].stock));
      return qty > 0 ? { name: item.name, qty, price: inventory[item.name].price } : null;
    }).filter(Boolean);
  }
} catch(e) {
  cart = [];
}

/* ========= DOM references ========= */
const menuGrid = document.getElementById('menu-grid');
const menuSearch = document.getElementById('menu-search');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const inventoryTableBody = document.querySelector('#inventory-table tbody');
const reportTableBody = document.querySelector('#report-table tbody');
const reportSummary = document.getElementById('report-summary');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');
const fillDefaultsBtn = document.getElementById('fill-defaults');
const saveInventoryBtn = document.getElementById('save-inventory');
const clearSalesBtn = document.getElementById('clear-sales');
const receiptModal = document.getElementById('receipt-modal');
const receiptEl = document.getElementById('receipt');
const printReceiptBtn = document.getElementById('print-receipt');
const closeReceiptBtn = document.getElementById('close-receipt');
const toastEl = document.getElementById('toast');

/* ========= Helpers ========= */
function saveInventory(){ localStorage.setItem(INVENTORY_KEY, JSON.stringify(inventory)); }
function saveSales(){ localStorage.setItem(SALES_KEY, JSON.stringify(sales)); }
function saveCart(){ try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch(e){ console.warn('save cart', e); } }
function formatCurrency(n){ return `₱${Number(n).toLocaleString('en-PH')}`; }

/* ========= Toast ========= */
let toastTimer = null;
function showToast(msg, duration=2000){
  if(!toastEl) return alert(msg);
  toastEl.textContent = msg;
  toastEl.classList.remove('hidden');
  toastEl.classList.add('show');
  if(toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{
    toastEl.classList.remove('show');
    toastEl.classList.add('hidden');
  }, duration);
}

/* ========= Render menu ========= */
function renderMenu() {
  const q = (menuSearch?.value || '').trim().toLowerCase();
  menuGrid.innerHTML = '';
  let matched = 0;

  MENU.forEach(item => {
    const name = item.name;
    const inv = inventory[name] || { price: item.price, stock: DEFAULT_STOCK };
    if (q && !name.toLowerCase().includes(q)) return;

    const outTag = inv.stock === 0 ? `<div class="badge">Out of stock</div>` : '';
    const card = document.createElement('div');
    card.className = 'menu-card';
    if(inv.stock <= 5) card.classList.add('low-stock-card');
    if(inv.stock === 0) card.classList.add('out-of-stock');

    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:flex-start">
        <div class="title">${name}</div>
        ${outTag}
      </div>
      <div class="price">${formatCurrency(inv.price)}</div>
      <div class="stock muted">Stock: ${inv.stock}</div>
    `;

    if(inv.stock > 0) card.addEventListener('click', () => addToCart(name));
    menuGrid.appendChild(card);
    matched++;
  });

  if(q && matched === 0){
    const msg = document.createElement('div');
    msg.className = 'no-results muted';
    msg.textContent = 'No menu items match your search.';
    menuGrid.appendChild(msg);
  }
}

/* ========= Cart operations ========= */
function addToCart(name){
  const inv = inventory[name];
  if(!inv){ showToast('Item not found'); return; }
  if(inv.stock <= 0){ showToast(`${name} out of stock`); return; }

  const existing = cart.find(c=>c.name===name);
  const currentQty = existing ? existing.qty : 0;
  if(currentQty+1 > inv.stock){ showToast(`Only ${inv.stock} left of ${name}`); return; }

  if(existing) existing.qty++;
  else cart.push({name, qty:1, price:inv.price});
  renderCart();
}
function decreaseCartItem(name){ const idx = cart.findIndex(i=>i.name===name); if(idx===-1) return; cart[idx].qty--; if(cart[idx].qty<=0) cart.splice(idx,1); renderCart(); }
function increaseCartItem(name){ const idx = cart.findIndex(i=>i.name===name); if(idx===-1) return; if(inventory[name].stock < cart[idx].qty+1){ showToast('Insufficient stock'); return; } cart[idx].qty++; renderCart(); }
function removeCartItem(name){ cart = cart.filter(i=>i.name!==name); renderCart(); }
function renderCart(){
  cartItemsEl.innerHTML='';
  let total=0;
  cart.forEach(item=>{
    total+=item.qty*item.price;
    const row = document.createElement('div');
    row.className='cart-item';
    row.innerHTML=`
      <div style="flex:1">
        <div style="font-weight:700">${item.name}</div>
        <div class="muted small">${formatCurrency(item.price)} each</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <div class="qty-controls">
          <button class="qty-dec">−</button>
          <span style="padding:0 8px">${item.qty}</span>
          <button class="qty-inc">＋</button>
        </div>
        <div style="min-width:70px;text-align:right;font-weight:700">${formatCurrency(item.qty*item.price)}</div>
      </div>
    `;
    row.querySelector('.qty-dec').addEventListener('click', ()=> decreaseCartItem(item.name));
    row.querySelector('.qty-inc').addEventListener('click', ()=> increaseCartItem(item.name));
    row.addEventListener('dblclick', ()=> { if(confirm(`Remove ${item.name} from cart?`)) removeCartItem(item.name); });
    cartItemsEl.appendChild(row);
  });
  cartTotalEl.textContent=formatCurrency(total);
  cartCountEl.textContent=`${cart.reduce((a,b)=>a+b.qty,0)} items`;
  saveCart();
}

/* ========= Checkout ========= */
function performCheckout(){
  if(!cart.length){ showToast('Cart is empty'); return; }

  for(const ci of cart){
    if(!inventory[ci.name]){ showToast(`${ci.name} not in inventory`); return; }
    if(ci.qty > inventory[ci.name].stock){ showToast(`${ci.name} has only ${inventory[ci.name].stock} in stock`); return; }
  }

  cart.forEach(ci=>{ inventory[ci.name].stock -= ci.qty; if(inventory[ci.name].stock < 0) inventory[ci.name].stock = 0; });
  saveInventory();

  const now = new Date();
  const sale = {
    id: Math.random().toString(36).slice(2,9),
    timestamp: now.toISOString(),
    datetime_display: now.toLocaleString(),
    items: cart.map(c=>({ name:c.name, qty:c.qty, price:c.price })),
    total: cart.reduce((s,c)=> s + c.qty*c.price, 0)
  };

  sales.push(sale);
  saveSales();
  renderReportTable();
  showReceipt(sale);

  cart.forEach(ci => { if(inventory[ci.name].stock===0) setTimeout(()=>showToast(`${ci.name} is now OUT OF STOCK`),200); });

  cart=[];
  renderCart();
  renderMenu();
  renderInventoryTable();
  showToast('Checkout successful');
}

/* ========= Receipt & print ========= */
function showReceipt(sale){
  let html = `
    <div class="receipt-header" style="text-align:center; font-weight:800; margin-bottom:8px;">PRAKAS GRILL</div>
    <div class="receipt-date" style="text-align:center; font-size:12px; color:#555;">${new Date(sale.timestamp).toLocaleString()}</div>
    <hr style="border:none; border-top:1px dashed #333; margin:8px 0;">
    <div class="receipt-items">
  `;

  sale.items.forEach(it=>{
    html += `<div style="display:flex; justify-content:space-between; margin:2px 0;"><div>${it.name} x${it.qty}</div><div>${formatCurrency(it.qty*it.price)}</div></div>`;
  });

  html += `
    </div>
    <hr style="border:none; border-top:1px dashed #333; margin:8px 0;">
    <div style="display:flex; justify-content:space-between; font-weight:700; margin-top:4px;">
      <div>Total</div>
      <div>${formatCurrency(sale.total)}</div>
    </div>
    <div style="text-align:center; font-size:12px; color:#555; margin-top:8px;">Thank you! Come again.</div>
  `;

  receiptEl.innerHTML = `<div class="receipt-content" style="padding:10px;">${html}</div>`;
  receiptModal.classList.remove('hidden');
  receiptModal.setAttribute('aria-hidden','false');

  printReceiptBtn.onclick = () => {
    const w = window.open('','_blank','width=480,height=640');
    const doc = w.document;
    doc.write('<!doctype html><html><head><title>Receipt</title>');
    doc.write('<style>body{font-family:sans-serif;padding:14px;color:#000}.receipt-header{font-weight:800;text-align:center;margin-bottom:6px}</style>');
    doc.write('</head><body>');
    doc.write(receiptEl.innerHTML);
    doc.write('</body></html>');
    doc.close();
    w.focus();
    setTimeout(()=>{ w.print(); w.close(); }, 300);
  };
}

closeReceiptBtn?.addEventListener('click', () => {
  receiptModal.classList.add('hidden');
  receiptModal.setAttribute('aria-hidden','true');
});

/* ========= Inventory UI ========= */
function renderInventoryTable(){
  inventoryTableBody.innerHTML='';
  MENU.forEach(item=>{
    const name = item.name;
    const it = inventory[name] || { price: item.price, stock: DEFAULT_STOCK };
    const tr = document.createElement('tr');
    if(it.stock <= 5) tr.classList.add('low-row');
    tr.innerHTML = `
      <td style="width:45%">${name}</td>
      <td style="width:15%">${it.price}</td>
      <td style="width:20%"><input class="input-number" type="number" min="0" max="${MAX_STOCK_ALLOWED}" value="${it.stock}" data-name="${name}"></td>
      <td style="width:20%"><button class="btn ghost small" data-name="${name}">Set to 0</button></td>
    `;
    tr.querySelector('button').addEventListener('click',()=>{ if(confirm(`Set stock of ${name} to 0?`)) tr.querySelector('input').value=0; });
    inventoryTableBody.appendChild(tr);
  });
}

/* ========= Sales Report UI ========= */
function renderReportTable(){
  reportTableBody.innerHTML='';
  let totalAll = 0;
  sales.forEach(sale=>{
    const tr = document.createElement('tr');
    const itemsSold = sale.items.map(i=>`${i.name} x${i.qty}`).join(', ');
    tr.innerHTML = `<td>${new Date(sale.timestamp).toLocaleDateString()}</td><td>${itemsSold}</td><td>${formatCurrency(sale.total)}</td>`;
    reportTableBody.appendChild(tr);
    totalAll += sale.total;
  });
  reportSummary.textContent = `Total sales: ${formatCurrency(totalAll)}`;
}

/* ========= Event bindings ========= */
checkoutBtn?.addEventListener('click', performCheckout);
clearCartBtn?.addEventListener('click', ()=> { cart=[]; renderCart(); showToast('Cart cleared'); });

fillDefaultsBtn?.addEventListener('click', ()=>{
  MENU.forEach(item => inventory[item.name].stock = DEFAULT_STOCK);
  saveInventory();
  renderInventoryTable();
  renderMenu();
});

saveInventoryBtn?.addEventListener('click', () => {
  const inputs = document.querySelectorAll('#inventory-table tbody input.input-number');
  inputs.forEach(input => {
    const name = input.dataset.name;
    let val = parseInt(input.value);
    if(isNaN(val) || val < 0) val = 0;
    if(val > MAX_STOCK_ALLOWED) val = MAX_STOCK_ALLOWED;
    inventory[name].stock = val;
  });
  saveInventory();
  renderMenu();
  renderInventoryTable();
  showToast('Inventory saved');
});

clearSalesBtn?.addEventListener('click', () => {
  if(confirm('Are you sure you want to clear all sales? This cannot be undone.')){
    sales = [];
    saveSales();
    renderReportTable();
    showToast('All sales cleared');
  }
});

menuSearch?.addEventListener('input', renderMenu);

/* ========= Initial render ========= */
renderMenu();
renderCart();
renderInventoryTable();
renderReportTable();