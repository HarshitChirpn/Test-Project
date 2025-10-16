import { api } from '@/lib/api';

export interface ServiceConsumption {
  _id: string;
  userId: string;
  userEmail: string;
  userName: string;
  serviceId: string;
  serviceName: string;
  serviceCategory: string;
  consumptionType: 'usage' | 'subscription' | 'one-time' | 'trial';
  quantity: number;
  duration: number; // in minutes or hours
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startDate: string;
  endDate?: string;
  notes?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceConsumptionFilters {
  page?: number;
  limit?: number;
  search?: string;
  userId?: string;
  serviceId?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ServiceConsumptionPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ServiceConsumptionStats {
  totalConsumptions: number;
  activeConsumptions: number;
  completedConsumptions: number;
  pausedConsumptions: number;
  consumptionByCategory: Array<{
    _id: string;
    count: number;
    totalQuantity: number;
  }>;
  recentConsumptions: ServiceConsumption[];
}

export interface ServiceConsumptionResponse {
  success: boolean;
  data: {
    consumptions: ServiceConsumption[];
    pagination: ServiceConsumptionPagination;
  };
}

export interface ServiceConsumptionStatsResponse {
  success: boolean;
  data: ServiceConsumptionStats;
}

export const serviceConsumptionService = {
  // Get all service consumptions with filters
  getAllServiceConsumptions: async (filters: ServiceConsumptionFilters = {}): Promise<ServiceConsumptionResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.serviceId) params.append('serviceId', filters.serviceId);
    if (filters.status) params.append('status', filters.status);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/service-consumption?${params.toString()}`);
    return response;
  },

  // Get service consumption by ID
  getServiceConsumptionById: async (id: string): Promise<{ success: boolean; data: { consumption: ServiceConsumption } }> => {
    const response = await api.get(`/service-consumption/${id}`);
    return response;
  },

  // Get user's service consumptions
  getUserServiceConsumptions: async (userId: string): Promise<{ success: boolean; data: { consumptions: ServiceConsumption[] } }> => {
    const response = await api.get(`/service-consumption/user/${userId}`);
    return response;
  },

  // Create new service consumption
  createServiceConsumption: async (consumptionData: Partial<ServiceConsumption>): Promise<{ success: boolean; data: { consumption: ServiceConsumption } }> => {
    const response = await api.post('/service-consumption', consumptionData);
    return response;
  },

  // Update service consumption
  updateServiceConsumption: async (id: string, updates: Partial<ServiceConsumption>): Promise<{ success: boolean; data: { consumption: ServiceConsumption } }> => {
    const response = await api.put(`/service-consumption/${id}`, updates);
    return response;
  },

  // Delete service consumption
  deleteServiceConsumption: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/service-consumption/${id}`);
    return response;
  },

  // Get service consumption statistics
  getServiceConsumptionStats: async (): Promise<ServiceConsumptionStatsResponse> => {
    const response = await api.get('/service-consumption/stats');
    return response;
  },

  // Utility functions
  formatDuration: (minutes: number): string => {
    if (minutes < 60) {
      return `${minutes}m`;
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    } else {
      const days = Math.floor(minutes / 1440);
      const remainingHours = Math.floor((minutes % 1440) / 60);
      return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
    }
  },

  getStatusColor: (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getConsumptionTypeColor: (type: string): string => {
    switch (type) {
      case 'usage':
        return 'bg-blue-100 text-blue-800';
      case 'subscription':
        return 'bg-purple-100 text-purple-800';
      case 'one-time':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
};
