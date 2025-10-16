import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { testimonialService, Testimonial } from '@/services/testimonialService';

interface TestimonialContextType {
  testimonials: Testimonial[];
  featuredTestimonials: Testimonial[];
  loading: boolean;
  error: string | null;
  refreshTestimonials: () => Promise<void>;
  refreshFeaturedTestimonials: () => Promise<void>;
}

const TestimonialContext = createContext<TestimonialContextType | undefined>(undefined);

export const useTestimonials = () => {
  const context = useContext(TestimonialContext);
  if (context === undefined) {
    throw new Error('useTestimonials must be used within a TestimonialProvider');
  }
  return context;
};

interface TestimonialProviderProps {
  children: ReactNode;
}

export const TestimonialProvider: React.FC<TestimonialProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [featuredTestimonials, setFeaturedTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTestimonials = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await testimonialService.getAllTestimonials({ limit: 100 });
      setTestimonials(response.data.testimonials);
    } catch (err: any) {
      console.error('Error fetching testimonials:', err);
      setError(err.message || 'Failed to fetch testimonials');
    } finally {
      setLoading(false);
    }
  };

  const refreshFeaturedTestimonials = async () => {
    try {
      setError(null);
      console.log('🔄 Fetching featured testimonials...');
      const response = await testimonialService.getFeaturedTestimonials(10);
      console.log('✅ Featured testimonials response:', response);
      setFeaturedTestimonials(response.data.testimonials);
      console.log('✅ Set featured testimonials:', response.data.testimonials);
    } catch (err: any) {
      console.error('❌ Error fetching featured testimonials:', err);
      setError(err.message || 'Failed to fetch featured testimonials');
    }
  };

  useEffect(() => {
    // Always fetch featured testimonials (public)
    refreshFeaturedTestimonials();

    // Only fetch all testimonials if user is authenticated (admin)
    if (user) {
      refreshTestimonials();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Set up real-time updates (polling every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshFeaturedTestimonials();
      if (user) {
        refreshTestimonials();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user]);

  const value: TestimonialContextType = {
    testimonials,
    featuredTestimonials,
    loading,
    error,
    refreshTestimonials,
    refreshFeaturedTestimonials,
  };

  return (
    <TestimonialContext.Provider value={value}>
      {children}
    </TestimonialContext.Provider>
  );
};
