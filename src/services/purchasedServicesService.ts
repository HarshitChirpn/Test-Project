import { api } from '@/lib/api';

export interface PurchasedService {
  id: string;
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
  metadata: Record<string, any>;
}

export interface ServiceConsumption {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  serviceType: string;
  purchaseId: string;
  stripeProductId: string;
  totalAmount: number;
  currency: string;
  status: 'purchased' | 'active' | 'completed' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  purchasedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  notes?: string;
}

export interface UserPurchasedServicesData {
  purchases: PurchasedService[];
  serviceConsumption: ServiceConsumption[];
  totalSpent: number;
  activeServices: number;
  completedServices: number;
}

export const purchasedServicesService = {
  // Get total spent by user
  async getTotalSpent(userId: string): Promise<number> {
    try {
      const result = await api.get(`/purchases/user/${userId}`);
      const purchases = result.data?.purchases || [];
      
      return purchases.reduce((sum: number, purchase: any) => {
        return sum + (purchase.paymentStatus === 'paid' ? purchase.totalAmount : 0);
      }, 0);
    } catch (error) {
      console.error('Error getting total spent:', error);
      return 0;
    }
  },

  // Get active services for user
  async getActiveServices(userId: string): Promise<ServiceConsumption[]> {
    try {
      const result = await api.get(`/contact/consumption/user/${userId}`);
      const userServiceConsumption = result.data?.consumptions || [];
      
      return userServiceConsumption
        .filter((service: any) => service.status === 'active')
        .map((consumption: any) => ({
          id: consumption._id,
          userId: consumption.userId || '',
          userEmail: consumption.userEmail,
          userName: consumption.userName || '',
          serviceId: consumption.serviceId || '',
          serviceName: consumption.serviceName,
          serviceCategory: consumption.serviceCategory,
          serviceType: consumption.serviceType,
          purchaseId: consumption.purchaseId,
          stripeProductId: consumption.stripeProductId,
          totalAmount: consumption.totalAmount,
          currency: consumption.currency,
          status: consumption.status,
          startDate: consumption.startDate,
          endDate: consumption.endDate,
          purchasedAt: consumption.purchasedAt,
          createdAt: consumption.createdAt,
          updatedAt: consumption.updatedAt,
          notes: consumption.notes
        }));
    } catch (error) {
      console.error('Error getting active services:', error);
      return [];
    }
  },

  // Get completed services for user
  async getCompletedServices(userId: string): Promise<ServiceConsumption[]> {
    try {
      const result = await api.get(`/contact/consumption/user/${userId}`);
      const userServiceConsumption = result.data?.consumptions || [];
      
      return userServiceConsumption
        .filter((service: any) => service.status === 'completed')
        .map((consumption: any) => ({
          id: consumption._id,
          userId: consumption.userId || '',
          userEmail: consumption.userEmail,
          userName: consumption.userName || '',
          serviceId: consumption.serviceId || '',
          serviceName: consumption.serviceName,
          serviceCategory: consumption.serviceCategory,
          serviceType: consumption.serviceType,
          purchaseId: consumption.purchaseId,
          stripeProductId: consumption.stripeProductId,
          totalAmount: consumption.totalAmount,
          currency: consumption.currency,
          status: consumption.status,
          startDate: consumption.startDate,
          endDate: consumption.endDate,
          purchasedAt: consumption.purchasedAt,
          createdAt: consumption.createdAt,
          updatedAt: consumption.updatedAt,
          notes: consumption.notes
        }));
    } catch (error) {
      console.error('Error getting completed services:', error);
      return [];
    }
  },

  // Get user's purchased services
  async getUserPurchasedServices(userId: string): Promise<UserPurchasedServicesData> {
    try {
      // Fetch purchases from backend API
      const purchasesResult = await api.get(`/purchases/user/${userId}`);
      const purchases = purchasesResult.data?.purchases || [];

      // Fetch service consumption from backend API
      const consumptionResult = await api.get(`/contact/consumption/user/${userId}`);
      const userServiceConsumption = consumptionResult.data?.consumptions || [];

      const totalSpent = purchases.reduce((sum: number, purchase: any) => {
        return sum + (purchase.paymentStatus === 'paid' ? purchase.totalAmount : 0);
      }, 0);

      const activeServices = userServiceConsumption.filter((service: any) =>
        service.status === 'active'
      ).length;

      const completedServices = userServiceConsumption.filter((service: any) =>
        service.status === 'completed'
      ).length;

      return {
        purchases: purchases.map((purchase: any) => ({
          id: purchase._id,
          productName: purchase.productName,
          productDescription: purchase.productDescription,
          category: purchase.category,
          serviceType: purchase.serviceType,
          serviceId: purchase.serviceId,
          quantity: purchase.quantity,
          unitPrice: purchase.unitPrice,
          totalAmount: purchase.totalAmount,
          currency: purchase.currency,
          status: purchase.status,
          paymentStatus: purchase.paymentStatus,
          purchasedAt: purchase.purchasedAt,
          createdAt: purchase.createdAt,
          updatedAt: purchase.updatedAt,
          paidAt: purchase.paidAt,
          metadata: purchase.metadata || {}
        })),
        serviceConsumption: userServiceConsumption.map((consumption: any) => ({
          id: consumption._id,
          userId: consumption.userId,
          userEmail: consumption.userEmail,
          userName: consumption.userName,
          serviceId: consumption.serviceId,
          serviceName: consumption.serviceName,
          serviceCategory: consumption.serviceCategory,
          serviceType: consumption.serviceType,
          purchaseId: consumption.purchaseId,
          stripeProductId: consumption.stripeProductId,
          totalAmount: consumption.totalAmount,
          currency: consumption.currency,
          status: consumption.status,
          startDate: consumption.startDate,
          endDate: consumption.endDate,
          purchasedAt: consumption.purchasedAt,
          createdAt: consumption.createdAt,
          updatedAt: consumption.updatedAt,
          notes: consumption.notes
        })),
        totalSpent,
        activeServices,
        completedServices
      };
    } catch (error) {
      console.error('Error fetching user purchased services:', error);
      return {
        purchases: [],
        serviceConsumption: [],
        totalSpent: 0,
        activeServices: 0,
        completedServices: 0
      };
    }
  },

  // Get all purchased services (admin only)
  async getAllPurchasedServices(): Promise<PurchasedService[]> {
    try {
      const result = await api.get('/purchases');
      const purchases = result.data?.purchases || [];

      return purchases.map((purchase: any) => ({
        id: purchase._id,
        productName: purchase.productName,
        productDescription: purchase.productDescription,
        category: purchase.category,
        serviceType: purchase.serviceType,
        serviceId: purchase.serviceId,
        quantity: purchase.quantity,
        unitPrice: purchase.unitPrice,
        totalAmount: purchase.totalAmount,
        currency: purchase.currency,
        status: purchase.status,
        paymentStatus: purchase.paymentStatus,
        purchasedAt: purchase.purchasedAt,
        createdAt: purchase.createdAt,
        updatedAt: purchase.updatedAt,
        paidAt: purchase.paidAt,
        metadata: purchase.metadata || {}
      }));
    } catch (error) {
      console.error('Error fetching all purchased services:', error);
      return [];
    }
  },

  // Get service consumption by user
  async getServiceConsumptionByUser(userId: string): Promise<ServiceConsumption[]> {
    try {
      const result = await api.get(`/contact/consumption/user/${userId}`);
      const userServiceConsumption = result.data?.consumptions || [];

      return userServiceConsumption.map((consumption: any) => ({
        id: consumption._id,
        userId: consumption.userId || '',
        userEmail: consumption.userEmail,
        userName: consumption.userName || '',
        serviceId: consumption.serviceId || '',
        serviceName: consumption.serviceName,
        serviceCategory: consumption.serviceCategory,
        serviceType: consumption.serviceType,
        purchaseId: consumption.purchaseId,
        stripeProductId: consumption.stripeProductId,
        totalAmount: consumption.totalAmount,
        currency: consumption.currency,
        status: consumption.status,
        startDate: consumption.startDate,
        endDate: consumption.endDate,
        purchasedAt: consumption.purchasedAt,
        createdAt: consumption.createdAt,
        updatedAt: consumption.updatedAt,
        notes: consumption.notes
      }));
    } catch (error) {
      console.error('Error fetching service consumption:', error);
      return [];
    }
  },

  // Get services by category
  async getServicesByCategory(category: string): Promise<ServiceConsumption[]> {
    try {
      const result = await api.get(`/contact/consumption/category/${category}`);
      const services = result.data?.services || [];

      return services.map((service: any) => ({
        id: service._id,
        userId: service.userId || '',
        userEmail: service.userEmail,
        userName: service.userName || '',
        serviceId: service.serviceId || '',
        serviceName: service.serviceName,
        serviceCategory: service.serviceCategory,
        serviceType: service.serviceType,
        purchaseId: service.purchaseId,
        stripeProductId: service.stripeProductId,
        totalAmount: service.totalAmount,
        currency: service.currency,
        status: service.status,
        startDate: service.startDate,
        endDate: service.endDate,
        purchasedAt: service.purchasedAt,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        notes: service.notes
      }));
    } catch (error) {
      console.error('Error fetching services by category:', error);
      return [];
    }
  },

  // Utility functions
  formatCurrency: (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  },

  getStatusBadgeVariant: (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'cancelled':
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  },

  getPaymentStatusBadgeVariant: (paymentStatus: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (paymentStatus.toLowerCase()) {
      case 'paid':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'failed':
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  }
};
