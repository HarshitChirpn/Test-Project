import { api } from '@/lib/api';

export interface Purchase {
  _id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  stripeSessionId: string;
  stripeCustomerId?: string;
  stripeProductId: string;
  stripePriceId?: string;
  stripePaymentIntentId: string;
  productName: string;
  productDescription?: string;
  category: string;
  serviceType: string;
  serviceId?: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  status: string;
  paymentStatus: 'paid' | 'pending' | 'failed';
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  metadata?: Record<string, any>;
}

export interface PurchaseFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PurchaseStats {
  totalPurchases: number;
  totalRevenue: number;
  paidPurchases: number;
  pendingPurchases: number;
  failedPurchases: number;
  averageOrderValue: number;
  topCategories: Array<{
    category: string;
    count: number;
    revenue: number;
  }>;
  recentPurchases: Purchase[];
}

export interface PurchaseResponse {
  purchases: Purchase[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const purchaseService = {
  async getAllPurchases(filters: PurchaseFilters = {}): Promise<PurchaseResponse> {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const result = await api.get<{ data: PurchaseResponse }>(`/purchases?${params.toString()}`);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch purchases');
    }
    return result.data;
  },

  async getPurchaseById(id: string): Promise<Purchase> {
    const result = await api.get<{ data: { purchase: Purchase } }>(`/purchases/${id}`);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch purchase');
    }
    return result.data.purchase;
  },

  async getUserPurchases(userId: string): Promise<Purchase[]> {
    const result = await api.get<{ data: { purchases: Purchase[] } }>(`/purchases/user/${userId}`);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to fetch user purchases');
    }
    return result.data.purchases;
  },

  async createPurchase(purchaseData: Partial<Purchase>): Promise<Purchase> {
    const result = await api.post<{ data: { purchase: Purchase } }>('/purchases', purchaseData);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to create purchase');
    }
    return result.data.purchase;
  },

  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<Purchase> {
    const result = await api.put<{ data: { purchase: Purchase } }>(`/purchases/${id}`, updates);
    if (!result.success || !result.data) {
      throw new Error(result.message || 'Failed to update purchase');
    }
    return result.data.purchase;
  },

  async deletePurchase(id: string): Promise<void> {
    const result = await api.delete(`/purchases/${id}`);
    if (!result.success) {
      throw new Error(result.message || 'Failed to delete purchase');
    }
  },

  async getPurchaseStats(): Promise<PurchaseStats> {
    // This would need to be implemented in the backend
    // For now, we'll calculate stats from the purchases data
    const allPurchases = await this.getAllPurchases({ limit: 1000 });
    
    const purchases = allPurchases.purchases;
    const totalPurchases = purchases.length;
    const totalRevenue = purchases
      .filter(p => p.paymentStatus === 'paid')
      .reduce((sum, p) => sum + p.totalAmount, 0);
    
    const paidPurchases = purchases.filter(p => p.paymentStatus === 'paid').length;
    const pendingPurchases = purchases.filter(p => p.paymentStatus === 'pending').length;
    const failedPurchases = purchases.filter(p => p.paymentStatus === 'failed').length;
    
    const averageOrderValue = paidPurchases > 0 ? totalRevenue / paidPurchases : 0;
    
    // Calculate top categories
    const categoryStats = purchases
      .filter(p => p.paymentStatus === 'paid')
      .reduce((acc, p) => {
        if (!acc[p.category]) {
          acc[p.category] = { count: 0, revenue: 0 };
        }
        acc[p.category].count++;
        acc[p.category].revenue += p.totalAmount;
        return acc;
      }, {} as Record<string, { count: number; revenue: number }>);
    
    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({ category, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    const recentPurchases = purchases
      .sort((a, b) => new Date(b.purchasedAt).getTime() - new Date(a.purchasedAt).getTime())
      .slice(0, 10);

    return {
      totalPurchases,
      totalRevenue,
      paidPurchases,
      pendingPurchases,
      failedPurchases,
      averageOrderValue,
      topCategories,
      recentPurchases
    };
  },

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  },

  getPaymentStatusColor(status: string): string {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
};
