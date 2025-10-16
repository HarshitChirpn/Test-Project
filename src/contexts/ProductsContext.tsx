import React, { createContext, useContext, ReactNode } from 'react';

export interface StripeProduct {
  id: string;
  name: string;
  description?: string;
  images: string[];
  metadata: Record<string, string>;
  default_price: string;
  active: boolean;
}

export interface StripePrice {
  id: string;
  product: string;
  unit_amount: number;
  currency: string;
  type: 'one_time' | 'recurring';
  recurring?: {
    interval: 'month' | 'year' | 'week' | 'day';
    interval_count: number;
  };
}

interface ProductsContextType {
  products: StripeProduct[];
  prices: StripePrice[];
  loading: boolean;
  error: string | null;
  getProductPrice: (productId: string) => StripePrice | undefined;
  formatPrice: (amount: number, currency: string) => string;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Updated Products and Services (Created Sep 10, 2025)
  const products: StripeProduct[] = [
    // House Keeping Services with Fixed Pricing
    {
      id: "prod_T1yazVuOTnf2go",
      name: "Annual Delaware Registered Agent Service",
      description: "Annual registered agent service for Delaware corporations",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ue3P2s2dC5AUyRbUlXbZA",
      active: true
    },
    {
      id: "prod_T1yaveYkrqq6If",
      name: "Annual Reporting + DE Franchise Taxes Filing",
      description: "Annual reporting and Delaware franchise tax filing service",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ue3P2s2dC5AUyO88hfh5K",
      active: true
    },
    {
      id: "prod_T1yauxH2TyXmao",
      name: "Basic Book Keeping using Xero (upto 60 transactions/month)",
      description: "Monthly bookkeeping service using Xero for up to 60 transactions per month",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ue4P2s2dC5AUyUjxjeUqs",
      active: true
    },
    {
      id: "prod_T1yayiVQuKALG2",
      name: "Book Keeping using Xero (60+ transactions/month)",
      description: "Monthly bookkeeping service using Xero for over 60 transactions per month",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ue4P2s2dC5AUysgiwkv1m",
      active: true
    },
    {
      id: "prod_T1ya4NZFRQK5I8",
      name: "Annual Catch up book keeping (upto 1000 transactions)",
      description: "One-time annual catch up bookkeeping service for up to 1000 transactions",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ue5P2s2dC5AUyl48cEcL9",
      active: true
    },
    {
      id: "prod_T1ybyyOow57eGr",
      name: "Annual Federal Tax Return",
      description: "Annual federal tax return preparation service",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ueBP2s2dC5AUygO6pYYum",
      active: true
    },
    {
      id: "prod_T1ybYoRbifpzGC",
      name: "Virtual Mailing address + Mail Box service",
      description: "Monthly virtual mailing address and mailbox service",
      images: [],
      metadata: { category: "house-keeping", service_type: "getmvp" },
      default_price: "price_1S5ueBP2s2dC5AUyVbPZY8wy",
      active: true
    },
    // Service Products (Contact for Pricing)
    {
      id: "prod_T1ybgKWYX2xAdU",
      name: "GetMVP Development Service",
      description: "Custom development services - Contact us for pricing",
      images: [],
      metadata: { category: "development", service_type: "getmvp" },
      default_price: "",
      active: true
    },
    {
      id: "prod_T1ybHYbDAdYfMw",
      name: "GetMVP Design Service",
      description: "Custom design services - Contact us for pricing",
      images: [],
      metadata: { category: "design", service_type: "getmvp" },
      default_price: "",
      active: true
    },
    {
      id: "prod_T1yeHyWAJ65fWS",
      name: "Marketing Services",
      description: "SEO, keyword research, on-page optimization, link building, and content creation services - Contact us for pricing",
      images: [],
      metadata: { category: "marketing", service_type: "getmvp" },
      default_price: "",
      active: true
    },
    {
      id: "prod_T1yekuxIKTLtlj",
      name: "Corporate Formation Services",
      description: "Company formation and incorporation services - Contact us for pricing",
      images: [],
      metadata: { category: "consulting", service_type: "getmvp" },
      default_price: "",
      active: true
    },
    // Service Products with Fixed Pricing
    {
      id: "prod_T1yeClYNHUuYj5",
      name: "Social Media Services",
      description: "Social media management and promotional services",
      images: [],
      metadata: { category: "social-media", service_type: "getmvp" },
      default_price: "price_1S5uvNP2s2dC5AUyy6ydk3uw",
      active: true
    },
    {
      id: "prod_T1ymOxyeht80b0",
      name: "OpenVC Annual Membership Access",
      description: "Annual membership access to OpenVC platform and services",
      images: [],
      metadata: { category: "perks", service_type: "openvc" },
      default_price: "price_1S5upBP2s2dC5AUySJx4tZVl",
      active: true
    }
  ];

  const prices: StripePrice[] = [
    // House Keeping Services Prices
    {
      id: "price_1S5ue3P2s2dC5AUyRbUlXbZA",
      product: "prod_T1yazVuOTnf2go",
      unit_amount: 5000, // $50.00/year
      currency: "usd",
      type: "recurring",
      recurring: { interval: "year", interval_count: 1 }
    },
    {
      id: "price_1S5ue3P2s2dC5AUyO88hfh5K",
      product: "prod_T1yaveYkrqq6If",
      unit_amount: 5000, // $50.00/year
      currency: "usd",
      type: "recurring",
      recurring: { interval: "year", interval_count: 1 }
    },
    {
      id: "price_1S5ue4P2s2dC5AUyUjxjeUqs",
      product: "prod_T1yauxH2TyXmao",
      unit_amount: 7500, // $75.00/month
      currency: "usd",
      type: "recurring",
      recurring: { interval: "month", interval_count: 1 }
    },
    {
      id: "price_1S5ue4P2s2dC5AUysgiwkv1m",
      product: "prod_T1yayiVQuKALG2",
      unit_amount: 12500, // $125.00/month
      currency: "usd",
      type: "recurring",
      recurring: { interval: "month", interval_count: 1 }
    },
    {
      id: "price_1S5ue5P2s2dC5AUyl48cEcL9",
      product: "prod_T1ya4NZFRQK5I8",
      unit_amount: 50000, // $500.00 one-time
      currency: "usd",
      type: "one_time"
    },
    {
      id: "price_1S5ueBP2s2dC5AUygO6pYYum",
      product: "prod_T1ybyyOow57eGr",
      unit_amount: 45000, // $450.00/year
      currency: "usd",
      type: "recurring",
      recurring: { interval: "year", interval_count: 1 }
    },
    {
      id: "price_1S5ueBP2s2dC5AUyVbPZY8wy",
      product: "prod_T1ybYoRbifpzGC",
      unit_amount: 1000, // $10.00/month
      currency: "usd",
      type: "recurring",
      recurring: { interval: "month", interval_count: 1 }
    },
    // Service Products Prices
    {
      id: "price_1S5uvNP2s2dC5AUyy6ydk3uw",
      product: "prod_T1yeClYNHUuYj5",
      unit_amount: 35000, // $350.00 one-time
      currency: "usd",
      type: "one_time"
    },
    {
      id: "price_1S5upBP2s2dC5AUySJx4tZVl",
      product: "prod_T1ymOxyeht80b0",
      unit_amount: 25000, // $250.00/year
      currency: "usd",
      type: "recurring",
      recurring: { interval: "year", interval_count: 1 }
    }
  ];

  const getProductPrice = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return undefined;
    return prices.find(price => price.id === product.default_price);
  };

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100); // Stripe amounts are in cents
  };

  const value = {
    products,
    prices,
    loading: false,
    error: null,
    getProductPrice,
    formatPrice,
  };

  return (
    <ProductsContext.Provider value={value}>
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
};