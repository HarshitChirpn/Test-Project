// Stripe utility functions

// Map price IDs to their payment link URLs (Created Sep 10, 2025)
export const STRIPE_PAYMENT_LINKS: { [key: string]: string } = {
  // House Keeping Services with Fixed Pricing
  'price_1S5ue3P2s2dC5AUyRbUlXbZA': 'https://buy.stripe.com/9B6dRbd2n3vf2aD7165ZC08', // Annual Delaware Registered Agent Service ($50/year)
  'price_1S5ue3P2s2dC5AUyO88hfh5K': 'https://buy.stripe.com/aFa8wR0fB9TDeXpbhm5ZC09', // Annual Reporting + DE Franchise Taxes Filing ($50/year)
  'price_1S5ue4P2s2dC5AUyUjxjeUqs': 'https://buy.stripe.com/cNifZjfavgi102vety5ZC0a', // Basic Book Keeping using Xero ($75/month)
  'price_1S5ue4P2s2dC5AUysgiwkv1m': 'https://buy.stripe.com/14A00l9Qbc1LaH9dpu5ZC0b', // Book Keeping using Xero 60+ transactions ($125/month)
  'price_1S5ueBP2s2dC5AUygO6pYYum': 'https://buy.stripe.com/00w14p1jF1n77uX3OU5ZC0c', // Annual Federal Tax Return ($450/year)
  'price_1S5ueBP2s2dC5AUyVbPZY8wy': 'https://buy.stripe.com/7sY5kF7I3fdXdTl99e5ZC0g', // Virtual Mailing address + Mail Box service ($10/month)
  
  // Service Products
  'price_1S5uvNP2s2dC5AUyy6ydk3uw': 'https://buy.stripe.com/7sY8wR5zVaXHbLd2KQ5ZC0e', // Social Media Services ($350 one-time)
  'price_1S5upBP2s2dC5AUySJx4tZVl': 'https://buy.stripe.com/5kQ9AV5zV8PzbLdadi5ZC0d', // OpenVC Annual Membership Access ($250/year)
};

export const formatCurrency = (amount: number, currency: string = 'usd'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
};

export const handleStripeCheckout = async (priceId: string, productName: string) => {
  try {
    // Get the payment link URL for this price ID
    const paymentUrl = STRIPE_PAYMENT_LINKS[priceId];
    
    if (!paymentUrl) {
      console.error('No payment link found for price ID:', priceId);
      return false;
    }
    
    // Redirect to Stripe payment link
    window.location.href = paymentUrl;
    
    return true;
  } catch (error) {
    console.error('Checkout failed:', error);
    return false;
  }
};