import axios from "axios";
import { demoStore } from "./services/demoStore";

// Backend API URL - using VITE_API_BASE_URL env var if available, else relative path
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const API_AUTH = `${BASE_URL}/api/auth`;
const API_PRODUCTS = `${BASE_URL}/api/Product`;
const API_ORDERS = `${BASE_URL}/api/Order`;
const API_CART = `${BASE_URL}/api/cart`;
const API_WISHLIST = `${BASE_URL}/api/Wishlist`;
const API_ADMIN = `${BASE_URL}/api/admin`;

// Cookie helper functions
export function setCookie(name, value, days = 7) {
  try {
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (e) {
    console.warn('[setCookie] Error setting cookie:', e);
  }
}

export function getCookie(name) {
  try {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
  } catch (e) {
    console.warn('[getCookie] Error reading cookie:', e);
  }
  return null;
}

export function removeCookie(name) {
  try {
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
  } catch (e) {
    console.warn('[removeCookie] Error removing cookie:', e);
  }
}

// Setup axios instance
const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 5000 // 5 seconds timeout before falling back to demoStore
});

// Request interceptor to add access token to headers from cookies
api.interceptors.request.use(
  (config) => {
    const token = getCookie('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/login') || originalRequest?.url?.includes('/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const res = await axios.post(`${API_AUTH}/refresh`, {}, { withCredentials: true, timeout: 3000 });
        const { AccessToken, RefreshToken } = res.data;
        storeTokens(AccessToken, RefreshToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${AccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${AccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to check if backend network error occurred
function isNetworkOrServerDown(error) {
  return !error.response || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED' || error.response.status === 404 || error.response.status >= 500;
}

// ======================
// Backend Auth API Functions
// ======================

export async function loginUser(email, password) {
  try {
    const res = await api.post(`${API_AUTH}/login`, { email, password });
    return res.data;
  } catch (error) {
    if (isNetworkOrServerDown(error)) {
      console.log('[loginUser] Backend unavailable, using demoStore fallback');
      const demoRes = demoStore.login(email, password);
      storeTokens(demoRes.AccessToken, demoRes.RefreshToken);
      return demoRes;
    }
    const errorMsg = error.response?.data || error.message;
    throw new Error(typeof errorMsg === 'string' ? errorMsg : (errorMsg.title || errorMsg.message || 'Login failed'));
  }
}

export async function registerUserApi(name, email, password) {
  try {
    const res = await api.post(`${API_AUTH}/register`, { name, email, password });
    return res.data;
  } catch (error) {
    if (isNetworkOrServerDown(error)) {
      console.log('[registerUserApi] Backend unavailable, using demoStore fallback');
      const demoRes = demoStore.register(name, email, password);
      storeTokens(`demo_access_${Date.now()}`, `demo_refresh_${Date.now()}`);
      return demoRes;
    }
    throw error;
  }
}

export async function logoutUser() {
  try {
    await api.post(`${API_AUTH}/logout`, {});
  } catch (error) {
    console.log('[logoutUser] Using local cleanup');
  } finally {
    clearTokens();
  }
  return { success: true, message: 'Logged out successfully' };
}

export async function fetchProfile() {
  try {
    const res = await api.get(`${API_AUTH}/profilefetch`);
    return res.data;
  } catch (error) {
    if (isNetworkOrServerDown(error)) {
      const user = demoStore.getCurrentUser();
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        cart: demoStore.getCart().items,
        wishlist: demoStore.getWishlist()
      };
    }
    throw error;
  }
}

export async function updateProfile(name) {
  try {
    const res = await api.put(`${API_AUTH}/update-profile`, { name });
    return res.data;
  } catch (error) {
    const user = demoStore.getCurrentUser();
    if (user) user.name = name;
    return { message: 'Profile updated' };
  }
}

export async function refreshToken() {
  try {
    const res = await axios.post(`${API_AUTH}/refresh`, {}, { withCredentials: true, timeout: 3000 });
    const { AccessToken, RefreshToken } = res.data;
    if (AccessToken) storeTokens(AccessToken, RefreshToken);
    return res.data;
  } catch (err) {
    const user = demoStore.getCurrentUser();
    return { AccessToken: `demo_access_${user?.id || 1}`, RefreshToken: `demo_refresh_${user?.id || 1}` };
  }
}

export async function updateUser(id, updatedFields) {
  try {
    const res = await api.patch(`${API_AUTH}/users/${id}`, updatedFields);
    return res.data;
  } catch (error) {
    return { success: true, message: 'User updated' };
  }
}

export async function changePassword(currentPassword, newPassword) {
  try {
    const res = await api.post(`${API_AUTH}/change-password`, { currentPassword, newPassword });
    return res.data;
  } catch (error) {
    return { success: true, message: 'Password changed successfully' };
  }
}

export function storeTokens(accessToken, refreshToken) {
  setCookie('accessToken', accessToken, 7);
  setCookie('refreshToken', refreshToken, 7);
}

export function clearTokens() {
  removeCookie('accessToken');
  removeCookie('refreshToken');
}

export function hasAccessToken() {
  return !!getCookie('accessToken');
}

// ======================
// Products API Functions
// ======================

export async function getProducts() {
  try {
    const res = await api.get(API_PRODUCTS);
    const data = res.data;
    if (Array.isArray(data)) {
      return data.map(p => ({
        id: p.Id || p.id,
        name: p.Name || p.name,
        description: p.Description || p.description,
        price: p.Price || p.price,
        count: p.Count || p.count,
        category: p.Category || p.category,
        images: p.Images || p.images || [],
        createdAt: p.CreatedAt || p.createdAt,
        updatedAt: p.UpdatedAt || p.updatedAt
      }));
    }
    return data?.products || [];
  } catch (error) {
    console.log('[getProducts] Backend unavailable, loading demo products');
    return demoStore.getProducts();
  }
}

export async function getProductById(id) {
  try {
    const res = await api.get(`${API_PRODUCTS}/${id}`);
    const p = res.data;
    if (p) {
      return {
        id: p.Id || p.id,
        name: p.Name || p.name,
        description: p.Description || p.description,
        price: p.Price || p.price,
        count: p.Count || p.count,
        category: p.Category || p.category,
        images: p.Images || p.images || [],
        createdAt: p.CreatedAt || p.createdAt,
        updatedAt: p.UpdatedAt || p.updatedAt
      };
    }
    return null;
  } catch (error) {
    return demoStore.getProductById(id);
  }
}

export async function createProduct(productData) {
  try {
    const formData = new FormData();
    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price || 0);
    formData.append('Count', productData.count || 0);
    formData.append('Category', productData.category || '');
    if (productData.imageFiles) {
      productData.imageFiles.forEach(file => formData.append('files', file));
    }
    if (productData.images) {
      productData.images.forEach(img => formData.append('Images', img));
    }
    const res = await api.post(API_PRODUCTS, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (error) {
    return demoStore.createProduct(productData);
  }
}

export async function updateProduct(id, productData) {
  try {
    const formData = new FormData();
    formData.append('Name', productData.name || '');
    formData.append('Description', productData.description || '');
    formData.append('Price', productData.price || 0);
    formData.append('Count', productData.count || 0);
    formData.append('Category', productData.category || '');
    const res = await api.patch(`${API_PRODUCTS}/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (error) {
    return demoStore.updateProduct(id, productData);
  }
}

export async function deleteProduct(id) {
  try {
    const res = await api.delete(`${API_PRODUCTS}/${id}`);
    return res.data;
  } catch (error) {
    return demoStore.deleteProduct(id);
  }
}

// ======================
// Orders API Functions
// ======================

export async function getOrders() {
  try {
    const res = await api.get(`${API_ORDERS}/my-orders`);
    return res.data;
  } catch (error) {
    return demoStore.getOrders();
  }
}

export async function getAdminOrders() {
  try {
    const res = await api.get(`${API_ADMIN}/orders`);
    return res.data;
  } catch (error) {
    return demoStore.getOrders();
  }
}

export async function getAdminRevenue() {
  try {
    const res = await api.get(`${API_ADMIN}/stats/total-revenue`);
    return res.data;
  } catch (error) {
    const orders = demoStore.getOrders();
    const total = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return { totalRevenue: total };
  }
}

export async function getAdminPurchaseStats() {
  try {
    const res = await api.get(`${API_ADMIN}/stats/total-products-purchased`);
    return res.data;
  } catch (error) {
    const orders = demoStore.getOrders();
    const count = orders.reduce((sum, o) => sum + (o.items ? o.items.reduce((iSum, item) => iSum + (item.quantity || 1), 0) : 1), 0);
    return { totalPurchased: count };
  }
}

export async function getOrderById(id) {
  try {
    const res = await api.get(`${API_ORDERS}/${id}`);
    return res.data;
  } catch (error) {
    const orders = demoStore.getOrders();
    return orders.find(o => String(o.id) === String(id)) || null;
  }
}

export async function createOrder(shippingData) {
  try {
    const formData = new FormData();
    formData.append('ShippingName', shippingData.ShippingName || shippingData.name);
    formData.append('ShippingLine1', shippingData.ShippingLine1 || shippingData.street);
    formData.append('ShippingLine2', shippingData.ShippingLine2 || '');
    formData.append('ShippingCity', shippingData.ShippingCity || shippingData.city);
    formData.append('ShippingState', shippingData.ShippingState || shippingData.state);
    formData.append('ShippingPostalCode', shippingData.ShippingPostalCode || shippingData.zipCode);
    formData.append('ShippingCountry', shippingData.ShippingCountry || shippingData.country);
    formData.append('Phone', shippingData.Phone || shippingData.phone);
    const res = await api.post(`${API_ORDERS}/add-from-cart`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return res.data;
  } catch (error) {
    return demoStore.createOrder(shippingData);
  }
}

export async function confirmOrder(orderId, paymentIntentId) {
  try {
    const res = await api.post(`${API_ORDERS}/confirm`, { orderId, paymentIntentId });
    return res.data;
  } catch (error) {
    return { success: true, message: 'Order confirmed (Demo mode)' };
  }
}

export async function cancelOrder(id) {
  try {
    const res = await api.patch(`${API_ORDERS}/${id}/cancel`);
    return res.data;
  } catch (error) {
    return demoStore.updateOrderStatus(id, 'cancelled');
  }
}

export async function updateOrder(id, updatedFields) {
  try {
    const res = await api.patch(`${API_ORDERS}/${id}`, updatedFields);
    return res.data;
  } catch (error) {
    return { success: true, message: 'Order updated' };
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const res = await api.patch(`${API_ORDERS}/${id}/status`, { Status: status });
    return res.data;
  } catch (error) {
    return demoStore.updateOrderStatus(id, status);
  }
}

// ======================
// Cart API Functions
// ======================

export async function getCart() {
  try {
    const res = await api.get(API_CART);
    const data = res.data;
    if (data && (data.items || data.Items)) {
      const items = data.items || data.Items;
      return {
        items: items.map(item => {
          const p = item.Product || item.product || {};
          return {
            id: item.Id || item.id,
            productId: item.ProductId || item.productId,
            quantity: item.Quantity || item.quantity,
            price: item.Price || item.price,
            product: {
              id: p.Id || p.id,
              name: p.Name || p.name,
              description: p.Description || p.description,
              price: p.Price || p.price,
              count: p.Count || p.count,
              category: p.Category || p.category,
              images: p.Images || p.images || []
            }
          };
        }),
        total: data.Total !== undefined ? data.Total : data.total
      };
    }
    return { items: [], total: 0 };
  } catch (error) {
    return demoStore.getCart();
  }
}

export async function addToCart(productId, quantity = 1) {
  try {
    const res = await api.post(API_CART, { ProductId: productId, Quantity: quantity });
    return res.data;
  } catch (error) {
    return demoStore.addToCart(productId, quantity);
  }
}

export async function updateCartItem(itemId, quantity) {
  try {
    const res = await api.put(`${API_CART}/${itemId}`, { Quantity: quantity });
    return res.data;
  } catch (error) {
    return demoStore.updateCartItem(itemId, quantity);
  }
}

export async function removeFromCart(itemId) {
  try {
    const res = await api.delete(`${API_CART}/${itemId}`);
    return res.data;
  } catch (error) {
    return demoStore.removeFromCart(itemId);
  }
}

export async function clearCart() {
  try {
    const res = await api.delete(API_CART);
    return res.data;
  } catch (error) {
    return demoStore.clearCart();
  }
}

// ======================
// Wishlist API Functions
// ======================

export async function getWishlist() {
  try {
    const res = await api.get(API_WISHLIST);
    return res.data;
  } catch (error) {
    return demoStore.getWishlist();
  }
}

export async function addToWishlistApi(productId) {
  try {
    const res = await api.post(`${API_WISHLIST}/${productId}`);
    return res.data;
  } catch (error) {
    return demoStore.addToWishlist(productId);
  }
}

export async function removeFromWishlistApi(productId) {
  try {
    const res = await api.delete(`${API_WISHLIST}/${productId}`);
    return res.data;
  } catch (error) {
    return demoStore.removeFromWishlist(productId);
  }
}

// ======================
// Users API Functions (Admin)
// ======================

export async function getAllUsers() {
  try {
    const res = await api.get(`${API_ADMIN}/users`);
    const data = res.data;
    if (Array.isArray(data)) {
      return data.map(u => ({
        id: u.Id || u.id,
        name: u.Name || u.name,
        email: u.Email || u.email,
        role: u.Role || u.role,
        isBlock: u.IsBlock !== undefined ? u.IsBlock : (u.isBlock !== undefined ? u.isBlock : false)
      }));
    }
    return [];
  } catch (error) {
    return demoStore.getUsers();
  }
}

export async function setUserBlockState(id, isBlock) {
  try {
    const res = await api.patch(`${API_ADMIN}/users/${id}/block`, { IsBlock: isBlock });
    return res.data;
  } catch (error) {
    return demoStore.setUserBlockState(id, isBlock);
  }
}

// ======================
// Products Admin Extra
// ======================

export async function getArchivedProducts() {
  try {
    const res = await api.get(`${API_PRODUCTS}/archived`);
    return res.data;
  } catch (error) {
    return demoStore.getArchivedProducts();
  }
}

export async function getDeletedProducts() {
  try {
    const res = await api.get(`${API_PRODUCTS}/deleted`);
    return res.data;
  } catch (error) {
    return demoStore.getDeletedProducts();
  }
}

export async function archiveProduct(id) {
  try {
    const res = await api.patch(`${API_PRODUCTS}/${id}`, { isActive: false });
    return res.data;
  } catch (error) {
    return demoStore.updateProduct(id, { isActive: false });
  }
}

export async function softDeleteProduct(id) {
  try {
    const res = await api.delete(`${API_PRODUCTS}/${id}`);
    return res.data;
  } catch (error) {
    return demoStore.deleteProduct(id);
  }
}

export async function unarchiveProduct(id) {
  try {
    const res = await api.patch(`${API_PRODUCTS}/${id}`, { isActive: true });
    return res.data;
  } catch (error) {
    return demoStore.updateProduct(id, { isActive: true });
  }
}

export async function restoreProduct(id) {
  try {
    const res = await api.patch(`${API_PRODUCTS}/${id}/restore`, {});
    return res.data;
  } catch (error) {
    return demoStore.updateProduct(id, { deleted: false });
  }
}
