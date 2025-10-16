import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import { api } from "@/lib/api";

export interface Testimonial {
  id: string;
  portfolioId: string;
  quote: string;
  author: string;
  position: string;
  company: string;
  avatar: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: "Web App" | "Mobile App" | "SaaS Platform";
  description: string;
  image: string;
  client: string;
  timeline: string;
  teamSize: string;
  technologies: string[];
  metrics: {
    userGrowth?: string;
    funding?: string;
    timeToMarket?: string;
    revenue?: string;
    userRating?: string;
  };
  testimonial: Testimonial;
  process: Array<{
    phase: string;
    description: string;
    duration: string;
  }>;
  mockups: Array<{
    device: "laptop" | "mobile" | "tablet";
    image: string;
    alt: string;
  }>;
  results: string[];
  featured: boolean;
  published: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePortfolioItem {
  title: string;
  category: "Web App" | "Mobile App" | "SaaS Platform";
  description: string;
  image: string;
  client: string;
  timeline: string;
  teamSize: string;
  technologies: string[];
  metrics: {
    userGrowth?: string;
    funding?: string;
    timeToMarket?: string;
    revenue?: string;
    userRating?: string;
  };
  testimonial: Testimonial;
  process: Array<{
    phase: string;
    description: string;
    duration: string;
  }>;
  mockups: Array<{
    device: "laptop" | "mobile" | "tablet";
    image: string;
    alt: string;
  }>;
  results: string[];
  featured: boolean;
  published: boolean;
  slug: string;
}

interface PortfolioContextType {
  portfolioItems: PortfolioItem[];
  portfolios: PortfolioItem[];
  portfolioLoading: boolean;
  portfoliosLoading: boolean;
  createPortfolioItem: (item: CreatePortfolioItem) => Promise<{ success: boolean; error?: string }>;
  updatePortfolioItem: (id: string, updates: Partial<CreatePortfolioItem>) => Promise<{ success: boolean; error?: string }>;
  deletePortfolioItem: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshPortfolio: () => Promise<void>;
  getPortfolioBySlug: (slug: string) => Promise<PortfolioItem | null>;
}

const PortfolioContext = createContext<PortfolioContextType | undefined>(undefined);

export function usePortfolio() {
  const context = useContext(PortfolioContext);
  if (context === undefined) {
    throw new Error("usePortfolio must be used within a PortfolioProvider");
  }
  return context;
}

interface PortfolioProviderProps {
  children: ReactNode;
}

export function PortfolioProvider({ children }: PortfolioProviderProps) {
  const { user } = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [portfolioLoading, setPortfolioLoading] = useState(true);

  // Load portfolio items on mount
  useEffect(() => {
    refreshPortfolio();
  }, []);

  const refreshPortfolio = async () => {
    try {
      setPortfolioLoading(true);
      console.log('🔍 Fetching portfolio from API...');
      const result = await api.get('/portfolio');
      console.log('✅ Portfolio API Response:', result);

      if (result.success && result.data?.portfolios) {
        console.log(`📊 Found ${result.data.portfolios.length} portfolio items`);
        const formattedItems: PortfolioItem[] = result.data.portfolios.map((item: any) => ({
          id: item._id,
          title: item.title,
          category: item.category,
          description: item.description,
          image: item.image || '',
          client: item.client || '',
          timeline: item.timeline || '',
          teamSize: item.teamSize || '',
          technologies: item.technologies || [],
          metrics: item.metrics || {},
          testimonial: item.testimonial || {
            id: '',
            portfolioId: item._id,
            quote: '',
            author: '',
            position: '',
            company: '',
            avatar: ''
          },
          process: item.process || [],
          mockups: item.mockups || [],
          results: item.results || [],
          featured: item.featured,
          published: item.published,
          slug: item.slug,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt
        }));

        setPortfolioItems(formattedItems);
        console.log('✅ Portfolio items set in state:', formattedItems.length);
      } else {
        console.warn('⚠️ No portfolio data in response:', result);
      }
    } catch (error) {
      console.error("❌ Error loading portfolio:", error);
    } finally {
      setPortfolioLoading(false);
    }
  };

  const createPortfolioItem = async (item: CreatePortfolioItem) => {
    try {
      const result = await api.post('/portfolio', {
        title: item.title,
        category: item.category,
        description: item.description,
        image: item.image,
        client: item.client,
        timeline: item.timeline,
        teamSize: item.teamSize,
        technologies: item.technologies,
        metrics: item.metrics,
        testimonial: item.testimonial,
        process: item.process,
        mockups: item.mockups,
        results: item.results,
        featured: item.featured,
        published: item.published,
        slug: item.slug
      });

      await refreshPortfolio();
      return { success: result.success };
    } catch (error: any) {
      console.error("Error creating portfolio item:", error);
      return { success: false, error: error.message };
    }
  };

  const updatePortfolioItem = async (id: string, updates: Partial<CreatePortfolioItem>) => {
    try {
      const result = await api.put(`/portfolio/${id}`, updates);

      await refreshPortfolio();
      return { success: result.success };
    } catch (error: any) {
      console.error("Error updating portfolio item:", error);
      return { success: false, error: error.message };
    }
  };

  const deletePortfolioItem = async (id: string) => {
    try {
      const result = await api.delete(`/portfolio/${id}`);

      await refreshPortfolio();
      return { success: result.success };
    } catch (error: any) {
      console.error("Error deleting portfolio item:", error);
      return { success: false, error: error.message };
    }
  };

  const getPortfolioBySlug = async (slug: string): Promise<PortfolioItem | null> => {
    try {
      console.log('🔍 Fetching portfolio by slug:', slug);
      const result = await api.get(`/portfolio/slug/${slug}`);
      console.log('✅ Portfolio by slug API Response:', result);

      if (result.success && result.data?.portfolio) {
        const item = result.data.portfolio;
        const formattedItem: PortfolioItem = {
          id: item._id,
          title: item.title,
          category: item.category,
          description: item.description,
          image: item.image || '',
          client: item.client || '',
          timeline: item.timeline || '',
          teamSize: item.teamSize || '',
          technologies: item.technologies || [],
          metrics: item.metrics || {},
          testimonial: item.testimonial || {
            id: '',
            portfolioId: item._id,
            quote: '',
            author: '',
            position: '',
            company: '',
            avatar: ''
          },
          process: item.process || [],
          mockups: item.mockups || [],
          results: item.results || [],
          featured: item.featured,
          published: item.published,
          slug: item.slug,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        };
        return formattedItem;
      }

      return null;
    } catch (error) {
      console.error("❌ Error fetching portfolio by slug:", error);
      return null;
    }
  };

  const value: PortfolioContextType = {
    portfolioItems,
    portfolios: portfolioItems, // Alias for compatibility
    portfolioLoading,
    portfoliosLoading: portfolioLoading, // Alias for compatibility
    createPortfolioItem,
    updatePortfolioItem,
    deletePortfolioItem,
    refreshPortfolio,
    getPortfolioBySlug,
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
}