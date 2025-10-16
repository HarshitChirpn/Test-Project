import { api } from '@/lib/api';

export interface Testimonial {
  _id: string;
  name: string;
  designation: string;
  company: string;
  quote: string;
  avatar: string;
  rating: number;
  projectType: string;
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface TestimonialFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  featured?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface TestimonialPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface TestimonialStats {
  totalTestimonials: number;
  publishedTestimonials: number;
  draftTestimonials: number;
  featuredTestimonials: number;
  testimonialsByProjectType: Array<{
    _id: string;
    count: number;
    avgRating: number;
  }>;
  recentTestimonials: Testimonial[];
}

export interface TestimonialResponse {
  success: boolean;
  data: {
    testimonials: Testimonial[];
    pagination: TestimonialPagination;
  };
}

export interface TestimonialStatsResponse {
  success: boolean;
  data: TestimonialStats;
}

export const testimonialService = {
  // Get all testimonials with filters (admin only)
  getAllTestimonials: async (filters: TestimonialFilters = {}): Promise<TestimonialResponse> => {
    const params = new URLSearchParams();
    
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.limit) params.append('limit', filters.limit.toString());
    if (filters.search) params.append('search', filters.search);
    if (filters.status) params.append('status', filters.status);
    if (filters.featured !== undefined) params.append('featured', filters.featured.toString());
    if (filters.sortBy) params.append('sortBy', filters.sortBy);
    if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);

    const response = await api.get(`/testimonials?${params.toString()}`);
    return response;
  },

  // Get featured testimonials (public)
  getFeaturedTestimonials: async (limit: number = 10): Promise<{ success: boolean; data: { testimonials: Testimonial[] } }> => {
    const response = await api.get(`/testimonials/featured?limit=${limit}`);
    return response;
  },

  // Get testimonial by ID
  getTestimonialById: async (id: string): Promise<{ success: boolean; data: { testimonial: Testimonial } }> => {
    const response = await api.get(`/testimonials/${id}`);
    return response;
  },

  // Create new testimonial
  createTestimonial: async (testimonialData: Partial<Testimonial>): Promise<{ success: boolean; data: { testimonial: Testimonial } }> => {
    const response = await api.post('/testimonials', testimonialData);
    return response;
  },

  // Update testimonial
  updateTestimonial: async (id: string, updates: Partial<Testimonial>): Promise<{ success: boolean; data: { testimonial: Testimonial } }> => {
    const response = await api.put(`/testimonials/${id}`, updates);
    return response;
  },

  // Delete testimonial
  deleteTestimonial: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/testimonials/${id}`);
    return response;
  },

  // Get testimonial statistics
  getTestimonialStats: async (): Promise<TestimonialStatsResponse> => {
    const response = await api.get('/testimonials/stats');
    return response;
  },

  // Utility functions
  getStatusColor: (status: string): string => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  getProjectTypeColor: (projectType: string): string => {
    switch (projectType.toLowerCase()) {
      case 'web app':
        return 'bg-blue-100 text-blue-800';
      case 'mobile app':
        return 'bg-purple-100 text-purple-800';
      case 'saas platform':
        return 'bg-green-100 text-green-800';
      case 'ecommerce':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  formatRating: (rating: number): string => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }
};
