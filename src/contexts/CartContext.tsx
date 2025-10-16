import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { cartService, Cart, CartItem, AddToCartData } from "@/services/cartService";

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  error: string | null;
  addToCart: (item: AddToCartData) => Promise<void>;
  removeFromCart: (serviceId: string) => Promise<void>;
  updateItemQuantity: (serviceId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  getTotalPrice: () => number;
  getItemCount: () => number;
  isInCart: (serviceId: string) => boolean;
  getCartItem: (serviceId: string) => CartItem | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load cart when user changes
  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setCart(null);
      setError(null);
    }
  }, [user]);

  const refreshCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const cartData = await cartService.getCart();
      setCart(cartData);
    } catch (err) {
      console.error('Error refreshing cart:', err);
      setError(err instanceof Error ? err.message : 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (itemData: AddToCartData) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.addToCart(itemData);
      setCart(updatedCart);
      toast({
        title: "Added to Cart",
        description: `${itemData.title} has been added to your cart.`,
        variant: "default",
      });
    } catch (err) {
      console.error('Error adding to cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to cart';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (serviceId: string) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.removeFromCart(serviceId);
      setCart(updatedCart);
      
      const item = cart?.items.find(item => item.serviceId === serviceId);
      if (item) {
        toast({
          title: "Removed from Cart",
          description: `${item.title} has been removed from your cart.`,
          variant: "default",
        });
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from cart';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateItemQuantity = async (serviceId: string, quantity: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.updateItemQuantity(serviceId, quantity);
      setCart(updatedCart);
    } catch (err) {
      console.error('Error updating item quantity:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update item quantity';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const updatedCart = await cartService.clearCart();
      setCart(updatedCart);
      toast({
        title: "Cart Cleared",
        description: "All items have been removed from your cart.",
        variant: "default",
      });
    } catch (err) {
      console.error('Error clearing cart:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to clear cart';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTotalPrice = () => {
    return cart?.totalAmount || 0;
  };

  const getItemCount = () => {
    return cart?.itemCount || 0;
  };

  const isInCart = (serviceId: string) => {
    return cartService.isItemInCart(cart, serviceId);
  };

  const getCartItem = (serviceId: string) => {
    return cartService.getCartItem(cart, serviceId);
  };

  const value: CartContextType = {
    cart,
    loading,
    error,
    addToCart,
    removeFromCart,
    updateItemQuantity,
    clearCart,
    refreshCart,
    getTotalPrice,
    getItemCount,
    isInCart,
    getCartItem,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
