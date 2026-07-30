import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from './UserContext';
import { useNotification } from './NotificationContext';
import { getWishlist, getProducts, addToWishlistApi, removeFromWishlistApi } from '../api';

export const WishlistContext = createContext(null);

export const useWishlist = () => {
  return useContext(WishlistContext);
};

export const WishlistProvider = ({ children }) => {
  const { user } = useUser();
  const { showNotification } = useNotification();
  const [wishlist, setWishlist] = useState([]);
  const [wishlistProducts, setWishlistProducts] = useState([]);

  const refreshWishlist = async () => {
    if (!user) {
      setWishlist([]);
      setWishlistProducts([]);
      return;
    }
    try {
      console.log('[WishlistProvider] Fetching wishlist and products for merging...');
      const [wishlistData, productsData] = await Promise.all([
        getWishlist(),
        getProducts()
      ]);

      const remoteWishlistProducts = Array.isArray(wishlistData) ? wishlistData : [];
      const allProducts = Array.isArray(productsData) ? productsData : (productsData?.products || []);


      const mergedProducts = remoteWishlistProducts.map(p => {
        const fullProduct = allProducts.find(fp => String(fp.id) === String(p.id));
        return fullProduct ? { ...p, ...fullProduct } : p;
      });

      console.log('[WishlistProvider] Merged wishlist products:', mergedProducts);
      setWishlistProducts(mergedProducts);
      setWishlist(mergedProducts.map(p => p.id));
    } catch (err) {
      console.error('Failed to refresh wishlist', err);
    }
  };

  useEffect(() => {
    refreshWishlist();
  }, [user]);

  const addToWishlist = async (productId) => {
    if (!user) return;
    if (wishlist.includes(productId)) return;

    const newWishlist = [...wishlist, productId];
    setWishlist(newWishlist);
    try {
      await addToWishlistApi(productId);
      showNotification('Product added to wishlist!');
      await refreshWishlist();
    } catch (err) {
      console.error('Failed to update wishlist on server:', err);
      setWishlist(wishlist.filter(id => id !== productId));
    }
  };

  const removeFromWishlist = async (productId) => {
    if (!user) return;
    const newWishlist = wishlist.filter(id => id !== productId);
    setWishlist(newWishlist);
    try {
      await removeFromWishlistApi(productId);
      showNotification('Product removed from wishlist!');
      await refreshWishlist();
    } catch (err) {
      console.error('Failed to update wishlist on server:', err);
      setWishlist([...wishlist]);
    }
  };

  const toggleWishlist = async (productId) => {
    if (wishlist.includes(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{ wishlist, wishlistProducts, addToWishlist, removeFromWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};
