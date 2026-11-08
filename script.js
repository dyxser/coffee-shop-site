// --- 1. Работа с корзиной ---
function loadCart() {
  try {
    const saved = localStorage.getItem('my-coffee-cart');
    if (!saved) return [];
    return JSON.parse(saved);
  } catch (e) {
    console.error('Ошибка чтения корзины:', e);
    alert('Данные корзины повреждены. Она будет очищена.');
    localStorage.removeItem('my-coffee-cart');
    return [];
  }
}

function saveCart() {
  try {
    localStorage.setItem('my-coffee-cart', JSON.stringify(cart));
  } catch (e) {
    console.error('Ошибка сохранения корзины:', e);
  }
}

// --- 2. Данные о кофе ---
const coffees = [
  {
    name: "Эспрессо",
    type: "hot",
    variants: [
      { size: "маленький", price: 150, image: "images/espresso.jpg" },
      { size: "большой", price: 220, image: "images/espressoBig.jpg" }
    ]
  },
  {
    name: "Капучино",
    type: "hot",
    variants: [
      { size: "маленький", price: 200, image: "images/kapuch.jpg" },
      { size: "средний", price: 240, image: "images/kapuchmedl.jpg" },
      { size: "большой", price: 280, image: "images/kapuchbig.jpg" }
    ]
  },
  {
    name: "Латте",
    type: "hot",
    variants: [
      { size: "маленький", price: 220, image: "images/latte.jpg" },
      { size: "большой", price: 300, image: "images/latteBig.jpg" }
    ]
  },
  {
    name: "Айс Латте",
    type: "iced",
    variants: [
      { size: "средний", price: 270, image: "images/latteIce.jpg" }
    ]
  },
  {
    name: "Айс Капучино",
    type: "iced",
    variants: [
      { size: "средний", price: 280, image: "images/kapuchIce.jpg" }
    ]
  }
];

// --- 3. Инициализация ---
let cart = loadCart();
console.log('Корзина при старте:', cart);

// --- Новая функция: изменить количество товара ---
function changeQuantity(index, delta) {
  const item = cart[index];
  if (!item) return;

  const newQty = (item.quantity || 1) + delta;

  if (newQty < 1) {
    cart.splice(index, 1);
  } else if (newQty > 10) {
    return; 
  }else {
    item.quantity = newQty;
  }

  saveCart();
  updateCartUI();
}

// --- Обновлённая отрисовка корзины (с кнопками +/-) ---
function updateCartUI() {
  const countEl = document.getElementById('cart-count');
  const totalEl = document.getElementById('cart-total');
  const itemsList = document.getElementById('cart-items-list');
  const modalTotalEl = document.getElementById('cart-total-modal');


  const totalCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const totalPrice = cart.reduce((sum, item) => {
    const qty = item.quantity || 1;
    return sum + (item.price * qty);
  }, 0);

  if (countEl) countEl.textContent = totalCount;
  if (totalEl) totalEl.textContent = `${totalPrice} ₽`;
  if (modalTotalEl) modalTotalEl.textContent = `${totalPrice} ₽`;

  if (!itemsList) return;
  itemsList.innerHTML = '';

  if (totalCount === 0) {
    itemsList.style.display = 'none';
    return;
  } else {
    itemsList.style.display = 'block';
  }

  cart.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'cart-item-row';
   

    const img = document.createElement('img');
    img.src = item.image || 'https://via.placeholder.com/40';
    img.alt = item.name;
    Object.assign(img.style, {
      width: '40px',
      height: '40px',
      objectFit: 'cover',
      borderRadius: '4px',
      marginRight: '0.75rem'
    });

    const info = document.createElement('div');
    Object.assign(info.style, { flex: '1', minWidth: '0' });

    // Текст с названием и ценой
    const text = document.createTextNode(`${item.name} — ${item.price} ₽`);
    info.appendChild(text);

    // Блок с количеством и кнопками
    const qtyBlock = document.createElement('div');
    qtyBlock.style.display = 'flex';
    qtyBlock.style.alignItems = 'center';
    qtyBlock.style.gap = '0.5rem';
    qtyBlock.style.marginLeft = 'auto'; // прижимаем вправо

    const minusBtn = document.createElement('button');
    minusBtn.textContent = '−';
    minusBtn.className = 'qty-btn';
    minusBtn.style.cssText = 'width:24px; height:24px; background:#f3f4f6; border:1px solid #e5e7eb; color:#333; border-radius:4px; cursor:pointer; font-size:1rem; line-height:1;';
    minusBtn.addEventListener('click', () => changeQuantity(index, -1));

    const qtyDisplay = document.createElement('span');
    qtyDisplay.textContent = item.quantity || 1;
    qtyDisplay.style.fontWeight = '600';

    const plusBtn = document.createElement('button');

     qtyBlock.appendChild(minusBtn);
    qtyBlock.appendChild(qtyDisplay);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Удалить';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => {
      cart.splice(index, 1);
      saveCart();
      updateCartUI();
    });

    

    plusBtn.textContent = '+';
    plusBtn.className = 'qty-btn';
    plusBtn.style.cssText = 'width:24px; height:24px; background:#10b981; border:none; color:#fff; border-radius:4px; cursor:pointer; font-size:1rem; line-height:1;';
    plusBtn.addEventListener('click', () => changeQuantity(index, +1));

    qtyBlock.appendChild(minusBtn);
    qtyBlock.appendChild(plusBtn);

    row.appendChild(img);
    row.appendChild(info);
    row.appendChild(qtyBlock);
    row.appendChild(deleteBtn);

    itemsList.appendChild(row);
  });
}

function handleOrderSubmit() {
  if (cart.length === 0) return;

  // 1. Собираем текст заказа
  let orderText = 'Заказ из кофейни:\n';
  cart.forEach(item => {
    const qty = item.quantity || 1;
    orderText += `${item.name} × ${qty} — ${item.price * qty} ₽\n`;
  });

  const totalPrice = cart.reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  orderText += `Итого: ${totalPrice} ₽`;

  // 2. Сразу пишем в поле «Сообщение»
  const messageField = document.getElementById('entry.1581823704');
  if (messageField) {
    messageField.value = orderText;
  } else {
    console.error('Не найдено поле entry.1581823704 — проверь ID в HTML');
    return; // не продолжаем, если поля нет
  }

  // 3. Очищаем корзину
  cart = [];
  saveCart();
  updateCartUI();


  // 4. Закрываем модалку
  if (cartModal) {
    cartModal.classList.remove('open');
  }

  // 5. Прокручиваем к форме и ставим фокус на имя
  const contactsSection = document.getElementById('contacts');
  if (contactsSection) {
    contactsSection.scrollIntoView({ behavior: 'smooth' });
  }

  const nameField = document.getElementById('entry.1905007139');
  if (nameField) {
    setTimeout(() => nameField.focus(), 500);
  }
}


// --- 5. Фильтры и отрисовка меню ---
let currentFilter = 'all'; // 'all', 'hot', 'iced'

function applyFilter() {
  const list = document.getElementById("coffee-list");
  if (!list) return;

  list.innerHTML = '';

  const filtered = coffees.filter(coffee => {
    if (currentFilter === 'all') return true;
    return coffee.type === currentFilter;
  });

  filtered.forEach(coffee => {
    const li = document.createElement("li");
    li.style.listStyle = 'none';
    li.style.padding = '0';


    const card = document.createElement("div");
    card.className = "coffee-card";
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = '1rem';
    card.style.border = '1px solid #eee';
    card.style.borderRadius = '12px';
    card.style.padding = '1rem';
    card.style.boxShadow = '0 2px 6px rgba(0,0,0,0.05)';

      if (coffee.type === 'iced') {
      const badge = document.createElement('div');
      badge.className = 'iced-badge';
      badge.textContent = '❄️ Холодный';
      card.appendChild(badge);
    };

    // При выборе размера картинка меняется
    const img = document.createElement("img");
    const firstVariant = coffee.variants[0];
    img.src = firstVariant.image || `https://via.placeholder.com/240x160?text=${encodeURIComponent(coffee.name)}`;
    img.alt = coffee.name;
    img.loading = "lazy";
    img.style.width = '100%';
    img.style.height = '180px';
    img.style.objectFit = 'cover';
    img.style.borderRadius = '8px';
    // Уникальный ID для смены картинки
    img.id = `img-${coffee.name.replace(/\s+/g, '-').toLowerCase()}`;

    // Заголовок
    const title = document.createElement("h3");
    title.style.margin = '0.5rem 0 0';
    title.textContent = coffee.name;

    // Список размеров
    const sizeSelect = document.createElement('select');
    sizeSelect.style.margin = '0.5rem 0';
    sizeSelect.style.padding = '0.4rem';
    sizeSelect.style.border = '1px solid #ccc';
    sizeSelect.style.borderRadius = '6px';

    coffee.variants.forEach((v, idx) => {
      const option = document.createElement('option');
      option.value = idx; // индекс варианта
      option.textContent = `${v.size} (${v.price} ₽)`;
      if (idx === 0) option.selected = true;
      sizeSelect.appendChild(option);
    });

    // Цена (динамическая)
    const priceDisplay = document.createElement('span');
    priceDisplay.className = 'price';
    priceDisplay.style.fontWeight = '700';
    priceDisplay.style.color = '#10b981';
    priceDisplay.textContent = `${firstVariant.price} ₽`;

    const addBtn = document.createElement('button');
    addBtn.textContent = 'В корзину';
    addBtn.className = 'add-to-cart-btn';
    addBtn.style.padding = '0.8rem 1rem';
    addBtn.style.background = '#10b981';
    addBtn.style.color = '#fff';
    addBtn.style.border = 'none';
    addBtn.style.borderRadius = '6px';
    addBtn.style.cursor = 'pointer';

    addBtn.addEventListener('click', () => {
      const selectedIndex = sizeSelect.value;
      const variant = coffee.variants[selectedIndex];

      const existingItem = cart.find(item => item.name === coffee.name && item.size === variant.size);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({
          name: coffee.name,
          size: variant.size,
          price: variant.price,
          image: variant.image,
          quantity: 1
        });
      }

      saveCart();
      updateCartUI();

      // Анимация «добавлено»
      const cardElement = addBtn.closest('.coffee-card');
      if (cardElement) {
        cardElement.classList.add('added-to-cart');
        setTimeout(() => cardElement.classList.remove('added-to-cart'), 400);
      }
    });

    // Логика смены картинки и цены при выборе размера
    sizeSelect.addEventListener('change', () => {
      const idx = sizeSelect.value;
      const v = coffee.variants[idx];

      const imgEl = document.getElementById(`img-${coffee.name.replace(/\s+/g, '-').toLowerCase()}`);
      if (imgEl) {
        imgEl.src = v.image || `https://via.placeholder.com/240x160?text=${encodeURIComponent(v.size)}`;
      }
      priceDisplay.textContent = `${v.price} ₽`;
    });

    const info = document.createElement('div');
    info.className = 'coffee-info';
    info.style.display = 'flex';
    info.style.flexDirection = 'column';
    info.style.gap = '0.5rem';

    info.appendChild(title);
    info.appendChild(sizeSelect);
    info.appendChild(priceDisplay);
    info.appendChild(addBtn);

    card.appendChild(img);
    card.appendChild(info);
    li.appendChild(card);
    list.appendChild(li); // ← именно li, а не addBtn!
  });
}

// Обработка фильтров
document.getElementById('filter-all').addEventListener('click', () => {
  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-all').classList.add('active');
  applyFilter();
});

document.getElementById('filter-hot').addEventListener('click', () => {
  currentFilter = 'hot';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-hot').classList.add('active');
  applyFilter();
});

document.getElementById('filter-iced').addEventListener('click', () => {
  currentFilter = 'iced';
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-iced').classList.add('active');
  applyFilter();
});

// Первый запуск отрисовки
applyFilter();





// --- 7. Управление модальным окном корзины ---
const cartModal = document.getElementById('cart-modal');
const openCartBtn = document.querySelector('.cart-widget button');
const checkoutBtn = document.getElementById('checkout-btn');
if (cartModal) {
  // Кнопка открытия
  if (openCartBtn) {
    openCartBtn.addEventListener('click', () => {
      cartModal.classList.add('open');
    });
  }

  // Крестик закрытия
  const closeCartBtn = cartModal.querySelector('button[style*="position:absolute"]');
  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartModal.classList.remove('open');
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', handleOrderSubmit);
  }

  // Закрытие по клику на фон
  cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
      cartModal.classList.remove('open');
    }
  });
}

const clearCartBtn = document.getElementById('clear-cart-btn');
if (clearCartBtn) {
  clearCartBtn.addEventListener('click', () => {
    if (confirm('Вы уверены, что хотите очистить корзину?')) {
      cart = [];
      saveCart();
      updateCartUI();
    }
  });
}
