document.addEventListener('DOMContentLoaded', () => {

  const DEFAULT_STOCK = 100;
  const INVENTORY_KEY = 'prakas_inventory';
  const CART_KEY = 'prakas_cart';
  const THEME_KEY = 'prakas_theme';

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

  // LocalStorage helpers
  function getStorage(key, defaultValue) {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : defaultValue;
  }
  function setStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Theme
  const body = document.body;
  let theme = getStorage(THEME_KEY, 'dark');
  body.classList.toggle('light', theme === 'light');

  document.querySelector('.theme-toggle').addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    body.classList.toggle('light', theme === 'light');
    setStorage(THEME_KEY, theme);
  });

  // Inventory & Cart
  let inventory = getStorage(INVENTORY_KEY, MENU.map(item => ({ ...item, stock: DEFAULT_STOCK })));
  let cart = getStorage(CART_KEY, []);

  function saveCart() { setStorage(CART_KEY, cart); }
  function saveInventory() { setStorage(INVENTORY_KEY, inventory); }

  // Expose functions globally for inline handlers
  window.addToCart = addToCart;
  window.removeFromCart = removeFromCart;
  window.changeQty = changeQty;

  function addToCart(name) {
    const item = cart.find(i => i.name === name);
    const stockItem = inventory.find(i => i.name === name);
    if (!stockItem || stockItem.stock <= 0) return alert('Out of stock!');
    if (item) item.qty++;
    else cart.push({ name, price: stockItem.price, qty: 1 });
    stockItem.stock--;
    saveCart(); saveInventory();
    renderCart(); renderMenu();
  }

  function removeFromCart(name) {
    const index = cart.findIndex(i => i.name === name);
    if (index > -1) {
      const stockItem = inventory.find(i => i.name === name);
      stockItem.stock += cart[index].qty;
      cart.splice(index, 1);
      saveCart(); saveInventory();
      renderCart(); renderMenu();
    }
  }

  function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    const stockItem = inventory.find(i => i.name === name);
    if (!item || !stockItem) return;
    if (delta > 0 && stockItem.stock <= 0) return alert('Out of stock!');
    item.qty += delta;
    stockItem.stock -= delta;
    if (item.qty <= 0) removeFromCart(name);
    saveCart(); saveInventory(); renderCart(); renderMenu();
  }

  function renderCart() {
    const list = document.getElementById('cart-items');
    if (!list) return;
    list.innerHTML = '';
    if (cart.length === 0) {
      list.innerHTML = '<p class="no-results">Cart is empty</p>';
      document.getElementById('cart-total').textContent = '₱0';
      document.getElementById('cart-count').textContent = '0 items';
      return;
    }
    cart.forEach(i => {
      const row = document.createElement('div');
      row.classList.add('cart-item');
      row.innerHTML = `
        <div>${i.name}</div>
        <div class="qty-controls">
          <button onclick="changeQty('${i.name}', -1)">-</button>
          <span>${i.qty}</span>
          <button onclick="changeQty('${i.name}', 1)">+</button>
        </div>
        <div>₱${i.price * i.qty}</div>
        <button onclick="removeFromCart('${i.name}')" class="btn small ghost">x</button>
      `;
      list.appendChild(row);
    });
    const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    document.getElementById('cart-total').textContent = '₱' + total;
    document.getElementById('cart-count').textContent = `${cart.reduce((acc, i) => acc + i.qty, 0)} items`;
  }

  function renderMenu(filter = '') {
    const container = document.getElementById('menu-grid');
    if (!container) return;
    container.innerHTML = '';
    inventory.forEach(item => {
      if (item.name.toLowerCase().includes(filter.toLowerCase())) {
        const card = document.createElement('div');
        card.className = 'menu-card' + (item.stock <= 0 ? ' out-of-stock' : '');
        card.innerHTML = `
          <div class="title">${item.name}</div>
          <div class="price">₱${item.price}</div>
          <div class="stock">Stock: ${item.stock}</div>
        `;
        card.onclick = () => addToCart(item.name);
        container.appendChild(card);
      }
    });
  }

  // Search
  const searchInput = document.querySelector('#menu-search');
  if (searchInput) searchInput.addEventListener('input', e => renderMenu(e.target.value));

  // Checkout
  document.getElementById('checkout').addEventListener('click', () => {
    if (cart.length === 0) return alert('Cart is empty!');
    const total = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    alert(`Checked out ₱${total}`);
    cart = [];
    saveCart();
    renderCart();
  });

  // Clear Cart
  document.getElementById('clear-cart').addEventListener('click', () => {
    cart.forEach(i => {
      const stockItem = inventory.find(inv => inv.name === i.name);
      stockItem.stock += i.qty;
    });
    cart = [];
    saveCart(); saveInventory();
    renderCart(); renderMenu();
  });

  // Init
  renderCart();
  renderMenu();

});
