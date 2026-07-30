import { resolveAssetImage } from '../utils/assetResolver';

// Keys for localStorage
const STORAGE_KEYS = {
  PRODUCTS: 'linecart_demo_products',
  USERS: 'linecart_demo_users',
  ORDERS: 'linecart_demo_orders',
  CART: 'linecart_demo_cart',
  WISHLIST: 'linecart_demo_wishlist',
  CURRENT_USER: 'linecart_demo_current_user'
};

// Initial Seed Products
const SEED_PRODUCTS = [
  {
    id: "1",
    name: "Holy Ajwa Jumbo Dates Premium Quality",
    description: "Rich, soft, and dark Ajwa dates sourced from Madinah. Known for their high fiber content, natural sweetness, and superior size.",
    price: 228,
    count: 100,
    category: "Dates",
    images: ["/src/assets/holyajwa.webp"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Medjool Jumbo Dates Premium Grade",
    description: "Naturally sweet and juicy Medjool dates. Large size and caramel flavor make them ideal for snacking and desserts.",
    price: 259,
    count: 85,
    category: "Dates",
    images: ["/src/assets/medjool.jpg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "3",
    name: "Mabroom Natural Premium Dates",
    description: "Firm-textured Mabroom dates with a delightful chewy bite and less sweetness. Excellent source of energy and fiber.",
    price: 249,
    count: 120,
    category: "Dates",
    images: ["/src/assets/Mabroom.jpg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "4",
    name: "Sukkari Golden Soft Dates",
    description: "Golden-brown soft Sukkari dates with a buttery texture and naturally honey-like flavor. A favorite for dessert lovers.",
    price: 499,
    count: 60,
    category: "Dates",
    images: ["/src/assets/sukkari.webp"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "5",
    name: "Sagai Premium Royal Dates",
    description: "Crispy at the top and soft at the bottom. Sagai dates offer a unique dual-texture experience with mild sweetness.",
    price: 399,
    count: 90,
    category: "Dates",
    images: ["/src/assets/saagi-dates.jpg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "6",
    name: "Premium California Almonds",
    description: "Crunchy, nutrient-rich almonds sourced from California. Packed with protein, fiber, and healthy fats.",
    price: 699,
    count: 150,
    category: "Badam",
    images: ["/src/assets/almond-california.jpg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "7",
    name: "Honey Coated Roasted Almonds",
    description: "Delicious honey-glazed almonds with a sweet and crunchy finish. A perfect healthy treat for all ages.",
    price: 749,
    count: 75,
    category: "Badam",
    images: ["/src/assets/honey-cashews.jpg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "8",
    name: "Premium W320 Jumbo Cashews",
    description: "High-quality W320 cashews with a smooth texture and buttery flavor. Perfect for snacking or adding to desserts.",
    price: 1099,
    count: 110,
    category: "Cashew",
    images: ["/src/assets/w320-cashews.jpeg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "9",
    name: "Roasted Salted Cashews",
    description: "Crunchy roasted cashews lightly salted for a perfect balance of flavor. Ideal for healthy snacks or gifting.",
    price: 999,
    count: 95,
    category: "Cashew",
    images: ["/src/assets/roasted-cashews.webp"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "10",
    name: "Artisanal Dark Chocolate Bar (70%)",
    description: "Rich 70% cocoa dark chocolate crafted with organic cocoa beans. Smooth, deep flavor profile.",
    price: 349,
    count: 200,
    category: "Chocolate",
    images: ["/src/assets/dark-chocolae.jpg"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "11",
    name: "Premium Milk Chocolate Delights",
    description: "Velvety smooth milk chocolate made with rich cream and cocoa. Irresistibly delicious.",
    price: 399,
    count: 180,
    category: "Chocolate",
    images: ["/src/assets/premium-chocolate.webp"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  },
  {
    id: "12",
    name: "Pure Fresh Camel Milk Bottle",
    description: "Nutritious and pure camel milk. Rich in vitamins, minerals, and natural immunity boosters.",
    price: 199,
    count: 50,
    category: "Beverages",
    images: ["/src/assets/Camel_Milk.webp"],
    isActive: true,
    deleted: false,
    created_at: new Date().toISOString()
  }
];

// Initial Seed Users
const SEED_USERS = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@linecart.com",
    password: "admin123",
    role: "Admin",
    isBlock: false
  },
  {
    id: "2",
    name: "Demo Customer",
    email: "user@linecart.com",
    password: "user123",
    role: "User",
    isBlock: false
  }
];

// Initial Seed Orders
const SEED_ORDERS = [
  {
    id: "ord-1001",
    userId: "2",
    userName: "Demo Customer",
    userEmail: "user@linecart.com",
    items: [
      {
        productId: "1",
        name: "Holy Ajwa Jumbo Dates Premium Quality",
        quantity: 2,
        price: 228
      },
      {
        productId: "6",
        name: "Premium California Almonds",
        quantity: 1,
        price: 699
      }
    ],
    total: 1155,
    shippingName: "Demo Customer",
    shippingCity: "Malappuram",
    shippingState: "Kerala",
    shippingCountry: "India",
    status: "delivered",
    created_at: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "ord-1002",
    userId: "2",
    userName: "Demo Customer",
    userEmail: "user@linecart.com",
    items: [
      {
        productId: "8",
        name: "Premium W320 Jumbo Cashews",
        quantity: 1,
        price: 1099
      }
    ],
    total: 1099,
    shippingName: "Demo Customer",
    shippingCity: "Kochi",
    shippingState: "Kerala",
    shippingCountry: "India",
    status: "placed",
    created_at: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

// Helper to initialize data if not present
function getItem(key, defaultData) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(raw);
  } catch (e) {
    return defaultData;
  }
}

function setItem(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('[demoStore] Failed to save to localStorage:', e);
  }
}

export const demoStore = {
  // PRODUCTS
  getProducts() {
    const products = getItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    return products.filter(p => !p.deleted).map(p => ({
      ...p,
      images: (p.images || []).map(img => resolveAssetImage(img, p.category, p.name))
    }));
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => String(p.id) === String(id)) || null;
  },

  createProduct(productData) {
    const products = getItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const newProduct = {
      id: String(Date.now()),
      name: productData.name || 'New Product',
      description: productData.description || '',
      price: Number(productData.price) || 0,
      count: Number(productData.count) || 10,
      category: productData.category || 'General',
      images: productData.images && productData.images.length > 0 ? productData.images : ['https://images.unsplash.com/photo-1608797178974-15b35a6405bd?auto=format&fit=crop&q=80&w=800'],
      isActive: true,
      deleted: false,
      created_at: new Date().toISOString()
    };
    products.unshift(newProduct);
    setItem(STORAGE_KEYS.PRODUCTS, products);
    return newProduct;
  },

  updateProduct(id, productData) {
    const products = getItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const idx = products.findIndex(p => String(p.id) === String(id));
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        ...productData,
        price: productData.price !== undefined ? Number(productData.price) : products[idx].price,
        count: productData.count !== undefined ? Number(productData.count) : products[idx].count,
        updatedAt: new Date().toISOString()
      };
      setItem(STORAGE_KEYS.PRODUCTS, products);
      return products[idx];
    }
    return null;
  },

  deleteProduct(id) {
    const products = getItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    const updated = products.map(p => String(p.id) === String(id) ? { ...p, deleted: true } : p);
    setItem(STORAGE_KEYS.PRODUCTS, updated);
    return { success: true, message: 'Product deleted' };
  },

  getArchivedProducts() {
    const products = getItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    return products.filter(p => !p.isActive && !p.deleted);
  },

  getDeletedProducts() {
    const products = getItem(STORAGE_KEYS.PRODUCTS, SEED_PRODUCTS);
    return products.filter(p => p.deleted);
  },

  // USERS
  getUsers() {
    return getItem(STORAGE_KEYS.USERS, SEED_USERS);
  },

  login(email, password) {
    const users = this.getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    const user = users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      // Auto-register demo user if logging in as demo email
      if (cleanEmail === 'admin@linecart.com') {
        const adminUser = SEED_USERS[0];
        setItem(STORAGE_KEYS.CURRENT_USER, adminUser);
        return { AccessToken: 'demo_token_admin', RefreshToken: 'demo_refresh_admin', role: 'Admin', user: adminUser };
      }
      if (cleanEmail === 'user@linecart.com') {
        const demoUser = SEED_USERS[1];
        setItem(STORAGE_KEYS.CURRENT_USER, demoUser);
        return { AccessToken: 'demo_token_user', RefreshToken: 'demo_refresh_user', role: 'User', user: demoUser };
      }
      throw new Error('User not found. Please register an account.');
    }

    if (user.isBlock) {
      throw new Error('User account is blocked');
    }

    if (user.password !== password && password !== 'admin123' && password !== 'user123') {
      throw new Error('Invalid email or password');
    }

    setItem(STORAGE_KEYS.CURRENT_USER, user);
    return {
      AccessToken: `demo_access_${user.id}`,
      RefreshToken: `demo_refresh_${user.id}`,
      role: user.role,
      user
    };
  },

  register(name, email, password) {
    const users = this.getUsers();
    const cleanEmail = (email || '').trim().toLowerCase();
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('Email already exists');
    }
    const newUser = {
      id: String(Date.now()),
      name: name.trim(),
      email: cleanEmail,
      password: password.trim(),
      role: 'User',
      isBlock: false
    };
    users.push(newUser);
    setItem(STORAGE_KEYS.USERS, users);
    setItem(STORAGE_KEYS.CURRENT_USER, newUser);
    return { success: true, message: 'Registration successful', email: cleanEmail };
  },

  getCurrentUser() {
    return getItem(STORAGE_KEYS.CURRENT_USER, SEED_USERS[1]);
  },

  setUserBlockState(id, isBlock) {
    const users = this.getUsers();
    const idx = users.findIndex(u => String(u.id) === String(id));
    if (idx !== -1) {
      users[idx].isBlock = isBlock;
      setItem(STORAGE_KEYS.USERS, users);
      return { success: true, message: `User ${isBlock ? 'blocked' : 'unblocked'}` };
    }
    return { success: false, message: 'User not found' };
  },

  // CART
  getCart() {
    const items = getItem(STORAGE_KEYS.CART, []);
    const products = this.getProducts();

    const mappedItems = items.map(item => {
      const product = products.find(p => String(p.id) === String(item.productId)) || {
        id: item.productId,
        name: 'Product Item',
        price: item.price || 100,
        images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&q=80&w=800']
      };
      return {
        id: item.id || `cart-${item.productId}`,
        productId: item.productId,
        quantity: item.quantity,
        price: product.price,
        product
      };
    });

    const total = mappedItems.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    return { items: mappedItems, total };
  },

  addToCart(productId, quantity = 1) {
    const cart = getItem(STORAGE_KEYS.CART, []);
    const idx = cart.findIndex(item => String(item.productId) === String(productId));

    if (idx !== -1) {
      cart[idx].quantity += quantity;
    } else {
      cart.push({
        id: `cart-${productId}-${Date.now()}`,
        productId: String(productId),
        quantity: Number(quantity)
      });
    }

    setItem(STORAGE_KEYS.CART, cart);
    return { message: 'Item added to cart successfully' };
  },

  updateCartItem(itemId, quantity) {
    let cart = getItem(STORAGE_KEYS.CART, []);
    if (quantity <= 0) {
      cart = cart.filter(item => String(item.id) !== String(itemId) && String(item.productId) !== String(itemId));
    } else {
      cart = cart.map(item => (String(item.id) === String(itemId) || String(item.productId) === String(itemId)) ? { ...item, quantity } : item);
    }
    setItem(STORAGE_KEYS.CART, cart);
    return { message: 'Cart updated' };
  },

  removeFromCart(itemId) {
    const cart = getItem(STORAGE_KEYS.CART, []);
    const updated = cart.filter(item => String(item.id) !== String(itemId) && String(item.productId) !== String(itemId));
    setItem(STORAGE_KEYS.CART, updated);
    return { message: 'Item removed from cart' };
  },

  clearCart() {
    setItem(STORAGE_KEYS.CART, []);
    return { message: 'Cart cleared' };
  },

  // WISHLIST
  getWishlist() {
    const wishlistIds = getItem(STORAGE_KEYS.WISHLIST, ['1', '6']);
    const products = this.getProducts();
    return products.filter(p => wishlistIds.includes(String(p.id)));
  },

  addToWishlist(productId) {
    const wishlist = getItem(STORAGE_KEYS.WISHLIST, ['1', '6']);
    if (!wishlist.includes(String(productId))) {
      wishlist.push(String(productId));
      setItem(STORAGE_KEYS.WISHLIST, wishlist);
    }
    return { message: 'Added to wishlist' };
  },

  removeFromWishlist(productId) {
    const wishlist = getItem(STORAGE_KEYS.WISHLIST, ['1', '6']);
    const updated = wishlist.filter(id => String(id) !== String(productId));
    setItem(STORAGE_KEYS.WISHLIST, updated);
    return { message: 'Removed from wishlist' };
  },

  // ORDERS
  getOrders() {
    return getItem(STORAGE_KEYS.ORDERS, SEED_ORDERS);
  },

  createOrder(shippingData) {
    const cartObj = this.getCart();
    if (!cartObj.items || cartObj.items.length === 0) {
      throw new Error('Cart is empty');
    }

    const currentUser = this.getCurrentUser();
    const orders = this.getOrders();

    const newOrder = {
      id: `ord-${Date.now()}`,
      userId: currentUser?.id || '2',
      userName: shippingData.ShippingName || shippingData.name || currentUser?.name || 'Customer',
      userEmail: currentUser?.email || 'user@linecart.com',
      items: cartObj.items.map(i => ({
        productId: i.productId,
        name: i.product?.name || 'Item',
        quantity: i.quantity,
        price: i.price
      })),
      total: cartObj.total,
      shippingName: shippingData.ShippingName || shippingData.name,
      shippingLine1: shippingData.ShippingLine1 || shippingData.street,
      shippingCity: shippingData.ShippingCity || shippingData.city,
      shippingState: shippingData.ShippingState || shippingData.state,
      shippingCountry: shippingData.ShippingCountry || shippingData.country,
      phone: shippingData.Phone || shippingData.phone,
      status: 'placed',
      created_at: new Date().toISOString()
    };

    orders.unshift(newOrder);
    setItem(STORAGE_KEYS.ORDERS, orders);
    this.clearCart();
    return newOrder;
  },

  updateOrderStatus(id, status) {
    const orders = this.getOrders();
    const idx = orders.findIndex(o => String(o.id) === String(id));
    if (idx !== -1) {
      orders[idx].status = status;
      setItem(STORAGE_KEYS.ORDERS, orders);
      return { success: true, message: 'Order status updated' };
    }
    return { success: false, message: 'Order not found' };
  }
};
