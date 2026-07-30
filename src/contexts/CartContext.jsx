import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { useNotification } from './NotificationContext';
import { getCart, getProducts, addToCart as addToCartApi, removeFromCart as removeFromCartApi, updateCartItem as updateCartItemApi, clearCart as clearCartApi } from '../api';

export const CartContext = createContext(null);

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const { user } = useUser();
    const { showNotification } = useNotification();
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCart = async () => {
        if (!user) {
            setCartItems([]);
            setLoading(false);
            return;
        }
        try {
            console.log('[CartProvider] Fetching cart and products for merging...');
            const [cartData, productsData] = await Promise.all([
                getCart(),
                getProducts()
            ]);

            const remoteCartItems = cartData?.items || [];
            const allProducts = Array.isArray(productsData) ? productsData : (productsData?.products || []);


            const mergedItems = remoteCartItems.map(item => {
                const fullProduct = allProducts.find(p => String(p.id) === String(item.productId));
                if (fullProduct) {
                    return {
                        ...item,
                        product: {
                            ...item.product,
                            ...fullProduct
                        }
                    };
                }
                return item;
            });

            console.log('[CartProvider] Merged cart items:', mergedItems);
            setCartItems(mergedItems);
        } catch (err) {
            console.error('[CartProvider] Failed to fetch cart:', err);
            setCartItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, [user]);

    const addToCart = async (productId, quantity = 1) => {
        if (!user) return false;
        try {
            await addToCartApi(productId, quantity);
            await fetchCart();
            showNotification('Product added to cart!');
            return true;
        } catch (err) {
            console.error('[CartProvider] Failed to add to cart:', err);
            showNotification(err.response?.data?.message || 'Failed to add to cart');
            return false;
        }
    };

    const removeFromCart = async (itemId) => {
        if (!user) return false;
        try {
            await removeFromCartApi(itemId);
            await fetchCart();
            showNotification('Product removed from cart!');
            return true;
        } catch (err) {
            console.error('[CartProvider] Failed to remove from cart:', err);
            showNotification('Failed to remove from cart');
            return false;
        }
    };

    const updateCartItem = async (itemId, quantity) => {
        if (!user) return false;
        try {
            await updateCartItemApi(itemId, quantity);
            await fetchCart();
            return true;
        } catch (err) {
            console.error('[CartProvider] Failed to update cart item:', err);
            showNotification(err.response?.data?.message || 'Failed to update quantity');
            return false;
        }
    };

    const clearCart = async () => {
        if (!user) return false;
        try {
            await clearCartApi();
        } catch (err) {
            console.error('[CartProvider] Failed to clear cart:', err);
        } finally {
           

            setCartItems([]);
            return true;
        }
    };

    const isInCart = (productId) => {
        return cartItems.some(item => String(item.productId) === String(productId));
    };

    const getCartItemId = (productId) => {
        const item = cartItems.find(i => String(i.productId) === String(productId));
        return item?.id;
    };

    const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const cartTotal = cartItems.reduce((sum, item) => sum + ((item.product?.price || 0) * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            cartItems,
            loading,
            fetchCart,
            addToCart,
            removeFromCart,
            updateCartItem,
            clearCart,
            isInCart,
            getCartItemId,
            cartCount,
            cartTotal
        }}>
            {children}
        </CartContext.Provider>
    );
};
