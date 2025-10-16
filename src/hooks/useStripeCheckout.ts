import { useState } from 'react';
import { toast } from 'sonner';
import { handleStripeCheckout } from '@/utils/stripe';

export const useStripeCheckout = () => {
  const [loading, setLoading] = useState(false);

  const createCheckout = async (priceId: string, productName: string) => {
    setLoading(true);
    
    try {
      const success = await handleStripeCheckout(priceId, productName);
      
      if (!success) {
        throw new Error('Failed to redirect to checkout');
      }
      
      // Show success message before redirect
      toast.success(`Redirecting to checkout for ${productName}...`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout process. Please try again.');
      setLoading(false);
    }
    // Note: Don't set loading to false on success since we're redirecting
  };

  return {
    createCheckout,
    loading,
  };
};