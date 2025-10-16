import { api } from '@/lib/api';

export interface CartItem {
  _id?: string;
  serviceId: string;
  title: string;
  description: string;
  price: number;
  amount: string;
  icon: string;
  category: string;
  serviceType: 'individual' | 'package';
  paymentLink?: string;
  quantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  _id: string;
  userId: string;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  lastUpdated: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartSummary {
  itemCount: number;
  totalAmount: number;
}

export interface AddToCartData {
  serviceId: string;
  title: string;
  description: string;
  price: number;
  amount: string;
  icon: string;
  category: string;
  serviceType: 'individual' | 'package';
  paymentLink?: string;
  quantity?: number;
}

class CartService {
  // Get user's cart
  async getCart(): Promise<Cart> {
    try {
      const response = await api.get('/cart');
      if (response.success && response.data?.cart) {
        return response.data.cart;
      }
      throw new Error('Failed to fetch cart');
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  // Get cart summary (for navigation badge)
  async getCartSummary(): Promise<CartSummary> {
    try {
      const response = await api.get('/cart/summary');
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error('Failed to fetch cart summary');
    } catch (error) {
      console.error('Error fetching cart summary:', error);
      throw error;
    }
  }

  // Add item to cart
  async addToCart(itemData: AddToCartData): Promise<Cart> {
    try {
      const response = await api.post('/cart', itemData);
      if (response.success && response.data?.cart) {
        return response.data.cart;
      }
      throw new Error('Failed to add item to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  // Remove item from cart
  async removeFromCart(serviceId: string): Promise<Cart> {
    try {
      const response = await api.delete(`/cart/${serviceId}`);
      if (response.success && response.data?.cart) {
        return response.data.cart;
      }
      throw new Error('Failed to remove item from cart');
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  // Update item quantity
  async updateItemQuantity(serviceId: string, quantity: number): Promise<Cart> {
    try {
      const response = await api.put(`/cart/${serviceId}`, { quantity });
      if (response.success && response.data?.cart) {
        return response.data.cart;
      }
      throw new Error('Failed to update item quantity');
    } catch (error) {
      console.error('Error updating item quantity:', error);
      throw error;
    }
  }

  // Clear entire cart
  async clearCart(): Promise<Cart> {
    try {
      const response = await api.delete('/cart/clear');
      if (response.success && response.data?.cart) {
        return response.data.cart;
      }
      throw new Error('Failed to clear cart');
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // Check if item is in cart (client-side helper)
  isItemInCart(cart: Cart | null, serviceId: string): boolean {
    if (!cart || !cart.items) return false;
    return cart.items.some(item => item.serviceId === serviceId);
  }

  // Get item from cart (client-side helper)
  getCartItem(cart: Cart | null, serviceId: string): CartItem | null {
    if (!cart || !cart.items) return null;
    return cart.items.find(item => item.serviceId === serviceId) || null;
  }

  // Format price for display
  formatPrice(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }
}

export const cartService = new CartService();
