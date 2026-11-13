'use strict';

/* ============================================================
   1. КОНСТАНТЫ И ДАННЫЕ МЕНЮ
   ============================================================ */

const CART_KEY = 'my-coffee-cart';

const coffees = [
  {
    name: 'Эспрессо',
    type: 'hot',
    variants: [
      { size: 'маленький', price: 150, image: 'images/espresso.jpg' },
      { size: 'большой', price: 220, image: 'images/espressoBig.jpg' },
    ],
  },
  {
    name: 'Капучино',
    type: 'hot',
    variants: [
      { size: 'маленький', price: 200, image: 'images/kapuch.jpg' },
      { size: 'средний', price: 240, image: 'images/kapuchmedl.jpg' },
      { size: 'большой', price: 280, image: 'images/kapuchbig.jpg' },
    ],
  },
  {
    name: 'Латте',
    type: 'hot',
    variants: [
      { size: 'маленький', price: 220, image: 'images/latte.jpg' },
      { size: 'большой', price: 300, image: 'images/latteBig.jpg' },
    ],
  },
  {
    name: 'Айс Латте',
    type: 'iced',
    variants: [{ size: 'средний', price: 270, image: 'images/latteIce.jpg' }],
  },
  {
    name: 'Айс Капучино',
    type: 'iced',
    variants: [{ size: 'средний', price: 280, image: 'images/kapuchIce.jpg' }],
  },
];

let currentFilter = 'all';

/* ============================================================
   2. ХРАНИЛИЩЕ КОРЗИНЫ (localStorage)
   ============================================================ */

function loadCart() {
  try {
    const saved = localStorage.getItem(CART_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Ошибка чтения корзины:', e);
    localStorage.removeItem(CART_KEY);
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (e) {
    console.error('Ошибка сохранения корзины:', e);
  }
}

let cart = loadCart();

/* ============================================================
   3. ЛОГИКА КОРЗИНЫ (изменение данных)
   ============================================================ */

function getQty(item) {
  return item.quantity || 1;
}

function getTotalCount() {
  return cart.reduce((sum, item) => sum + getQty(item), 0);
}

function getTotalPrice() {
  return cart.reduce((sum, item) => sum + item.price * getQty(item), 0);
}

function addToCart(coffee, variant) {
  const existing = cart.find(
    (item) => item.name === coffee.name && item.size === variant.size
  );
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      name: coffee.name,
      size: variant.size,
      price: variant.price,
      image: variant.image,
      quantity: 1,
    });
  }
  saveCart();
  updateCartUI();
}

function changeQuantity(index, delta) {
  const item = cart[index];
  if (!item) return;

  const newQty = getQty(item) + delta;
  if (newQty < 1) {
    cart.splice(index, 1);
  } else if (newQty > 10) {
    return;
  } else {
    item.quantity = newQty;
  }
  saveCart();
  updateCartUI();
}

function removeItem(index) {
  cart.splice(index, 1);
  saveCart();
  updateCartUI();
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

/* ============================================================
   4. ОТРИСОВКА КОРЗИНЫ
   ============================================================ */

function createCartRow(item, index) {
  const row = document.createElement('div');
  row.className = 'cart-item-row';

  const img = document.createElement('img');
  img.className = 'cart-item-img';
  img.src = item.image;
  img.alt = item.name;

  const info = document.createElement('div');
  info.className = 'cart-item-info';
  info.textContent = `${item.name} (${item.size}) — ${item.price} ₽`;

  const qtyBlock = document.createElement('div');
  qtyBlock.className = 'qty-block';

  const minusBtn = document.createElement('button');
  minusBtn.className = 'qty-btn qty-minus';
  minusBtn.textContent = '−';
  minusBtn.addEventListener('click', () => changeQuantity(index, -1));

  const qtyDisplay = document.createElement('span');
  qtyDisplay.className = 'qty-display';
  qtyDisplay.textContent = getQty(item);

  const plusBtn = document.createElement('button');
  plusBtn.className = 'qty-btn qty-plus';
  plusBtn.textContent = '+';
  plusBtn.addEventListener('click', () => changeQuantity(index, +1));

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Удалить';
  deleteBtn.addEventListener('click', () => removeItem(index));

  qtyBlock.append(minusBtn, qtyDisplay, plusBtn);
  row.append(img, info, qtyBlock, deleteBtn);
  return row;
}

function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  const totalEl = document.getElementById('cart-total');
  const modalTotalEl = document.getElementById('cart-total-modal');
  const itemsList = document.getElementById('cart-items-list');

  const totalCount = getTotalCount();
  const totalPrice = getTotalPrice();

  if (countEl) countEl.textContent = totalCount;
  if (totalEl) totalEl.textContent = `${totalPrice} ₽`;
  if (modalTotalEl) modalTotalEl.textContent = `${totalPrice} ₽`;

  if (!itemsList) return;

  itemsList.innerHTML = '';

  // Показываем «Пусто», если корзина пуста
  if (totalCount === 0) {
    itemsList.style.display = 'flex';
    itemsList.style.justifyContent = 'center';
    itemsList.style.alignItems = 'center';
    itemsList.style.padding = '2rem';
    itemsList.textContent = 'Корзина пуста';
    return;
  }

  itemsList.style.display = 'block';

  cart.forEach((item, index) => {
    itemsList.appendChild(createCartRow(item, index));
  });
}

/* ============================================================
   5. ОФОРМЛЕНИЕ ЗАКАЗА
   ============================================================ */

function handleOrderSubmit() {
  if (cart.length === 0) return;

  let orderText = 'Заказ из кофейни:\n';
  cart.forEach((item) => {
    orderText += `${item.name} (${item.size}) × ${getQty(item)} — ${item.price * getQty(item)} ₽\n`;
  });
  orderText += `Итого: ${getTotalPrice()} ₽`;

  const messageField = document.getElementById('entry.1581823704');
  if (!messageField) {
    console.error('Не найдено поле entry.1581823704 — проверь HTML');
    return;
  }
  messageField.value = orderText;

  clearCart();

  closeCartModal(); // ✅ Важно: были скобки, теперь точно вызов

  const contactsSection = document.getElementById('contacts');
  if (contactsSection) contactsSection.scrollIntoView({ behavior: 'smooth' });

  const nameField = document.getElementById('entry.1905007139');
  if (nameField) setTimeout(() => nameField.focus(), 500);
}

function closeCartModal() {
  if (!cartModal) return;
  cartModal.classList.remove('open');
  document.body.style.overflow = '';
}

function openCartModal() {
  if (!cartModal) return;
  cartModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}
/* ============================================================
   6. МЕНЮ И ФИЛЬТРЫ
   ============================================================ */

function slug(name) {
  return name.replace(/\s+/g, '-').toLowerCase();
}

function createCoffeeCard(coffee) {
  const card = document.createElement('div');
  card.className = 'coffee-card';

  if (coffee.type === 'iced') {
    const badge = document.createElement('div');
    badge.className = 'iced-badge';
    badge.textContent = '❄️ Холодный';
    card.appendChild(badge);
  }

  const img = document.createElement('img');
  img.className = 'coffee-img';
  img.src = coffee.variants[0].image;
  img.alt = coffee.name;
  img.loading = 'lazy';
  img.id = `img-${slug(coffee.name)}`;
  card.appendChild(img);

  const info = document.createElement('div');
  info.className = 'coffee-info';

  const title = document.createElement('h3');
  title.className = 'coffee-title';
  title.textContent = coffee.name;

  const sizeSelect = document.createElement('select');
  sizeSelect.className = 'size-select';
  coffee.variants.forEach((v, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `${v.size} (${v.price} ₽)`;
    if (idx === 0) option.selected = true;
    sizeSelect.appendChild(option);
  });

  const priceDisplay = document.createElement('span');
  priceDisplay.className = 'price';
  priceDisplay.textContent = `${coffee.variants[0].price} ₽`;

  const addBtn = document.createElement('button');
  addBtn.className = 'add-to-cart-btn';
  addBtn.textContent = 'В корзину';
  addBtn.addEventListener('click', () => {
    const variant = coffee.variants[sizeSelect.value];
    addToCart(coffee, variant);

    card.classList.add('added-to-cart');
    setTimeout(() => card.classList.remove('added-to-cart'), 400);
  });

  sizeSelect.addEventListener('change', () => {
    const v = coffee.variants[sizeSelect.value];
    const imgEl = document.getElementById(`img-${slug(coffee.name)}`);
    if (imgEl) imgEl.src = v.image;
    priceDisplay.textContent = `${v.price} ₽`;
  });

  info.append(title, sizeSelect, priceDisplay, addBtn);
  card.appendChild(info);
  return card;
}

function applyFilter() {
  const list = document.getElementById('coffee-list');
  if (!list) return;

  list.innerHTML = '';
  coffees
    .filter((coffee) => currentFilter === 'all' || coffee.type === currentFilter)
    .forEach((coffee) => {
      const li = document.createElement('li');
      li.appendChild(createCoffeeCard(coffee));
      list.appendChild(li);
    });
}

const FILTER_BUTTONS = {
  'filter-all': 'all',
  'filter-hot': 'hot',
  'filter-iced': 'iced',
};

Object.entries(FILTER_BUTTONS).forEach(([btnId, filter]) => {
  const btn = document.getElementById(btnId);
  if (!btn) return;
  btn.addEventListener('click', () => {
    currentFilter = filter;
    document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter();
  });
});

/* ============================================================
   7. МОДАЛКА КОРЗИНЫ И ЗАПУСК
   ============================================================ */

let cartModal = null;

function initCartModal() {
  cartModal = document.getElementById('cart-modal');
  if (!cartModal) return;

  cartModal.querySelector('.close-cart-btn')
    ?.addEventListener('click', closeCartModal);

  document.querySelector('.cart-open-btn')
    ?.addEventListener('click', openCartModal);

  document.getElementById('checkout-btn')
    ?.addEventListener('click', handleOrderSubmit);

  const clearCartBtn = document.getElementById('clear-cart-btn');
  clearCartBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;
    if (confirm('Вы уверены, что хотите очистить корзину?')) clearCart();
  });

  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) closeCartModal();
  });
}

// Переключатель темы
const themeToggle = document.getElementById('theme-toggle');
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('coffee-theme', isDark ? 'dark' : 'light');
    themeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

// Восстановление темы при загрузке
const savedTheme = localStorage.getItem('coffee-theme');
if (savedTheme === 'dark') {
  document.body.classList.add('dark-mode');
  if (themeToggle) themeToggle.textContent = '☀️';
}

function validateForm() {
  const name = document.getElementById('entry.1905007139');
  const email = document.getElementById('entry.434212773');
  const message = document.getElementById('entry.1581823704');

  const errorName = document.getElementById('error-name');
  const errorEmail = document.getElementById('error-email');
  const errorMessage = document.getElementById('error-message');
  const submitBtn = document.querySelector('.submit-btn');

  if (!name || !email || !message || !submitBtn) {
    console.error('Ошибка: не найдены элементы формы. Проверьте HTML.');
    return false;
  }

  let isValid = true;

  [errorName, errorEmail, errorMessage].forEach(el => {
    if (el) el.textContent = '';
  });

  const nameValue = name.value.trim();
  if (!nameValue || nameValue.length < 2) {
    if (errorName) errorName.textContent = 'Имя должно быть не короче 2 символов';
    isValid = false;
  }

  const emailValue = email.value.trim();
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(emailValue)) {
    if (errorEmail) errorEmail.textContent = 'Введите корректный email';
    isValid = false;
  }

  const messageValue = message.value.trim();
  if (!messageValue) {
    if (errorMessage) errorMessage.textContent = 'Напишите сообщение';
    isValid = false;
  }

  if (submitBtn) {
    submitBtn.disabled = !isValid;
  }

  return isValid;
}


// Вешаем на форму
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    console.log('Форма валидна, отправляем данные...');

    // Здесь будет отправка, пока просто показываем успех
    const successMsg = document.querySelector('.form-success');
    if (successMsg) {
      successMsg.style.display = 'block';
      setTimeout(() => {
        successMsg.style.display = 'none';
      }, 5000);
    }

    contactForm.reset();
    validateForm(); // сбросить ошибки
  });
} else {
  console.warn('Форма #contact-form не найдена в HTML.');
}



// Точка входа: один раз собираем страницу
applyFilter();
updateCartUI(); // корзина из localStorage появится сразу после перезагрузки
initCartModal();
