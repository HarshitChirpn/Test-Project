// Browser-compatible MongoDB connection using REST API
// Note: MongoDB driver is not compatible with browsers, so we'll use a REST API approach

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const DATABASE_NAME = import.meta.env.VITE_MONGODB_DATABASE || 'idea2mvp';

// MongoDB Collections Types
export interface User {
  _id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  linkedin?: string;
  website?: string;
  role: 'user' | 'admin';
  isActive: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  createdViaAdmin?: boolean;
  syncedFromFirebaseAuth?: boolean;
  syncedAt?: Date;
  provider?: string;
  emailNotifications?: boolean;
  marketingEmails?: boolean;
  projectUpdates?: boolean;
  securityAlerts?: boolean;
  darkMode?: boolean;
}


export interface UserProgress {
  _id: string;
  userId: string;
  overall: number;
  phases: {
    discovery: number;
    design: number;
    development: number;
    testing: number;
    launch: number;
    support: number;
  };
  milestonesCompleted: number;
  totalMilestones: number;
  lastUpdated?: Date;
  currentStatus?: {
    currentPhase: string;
    currentSubstep: string;
    phaseProgress: number;
    substepProgress: number;
    updatedAt: Date;
    updatedBy?: string;
    notes?: string;
  };
}

export interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: "All" | "Web App" | "Mobile App" | "SaaS Platform";
  slug: string;
  image: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Portfolio {
  _id: string;
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
  testimonial: {
    quote: string;
    author: string;
    position: string;
    company: string;
    avatar: string;
  };
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

export interface Service {
  _id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  order: number;
  serviceDetails?: {
    title: string;
    leftSection: {
      title: string;
      services: Array<{
        icon: string;
        title: string;
        description: string;
        price?: string;
        amount?: string;
        paymentLink?: string;
      }>;
    };
    rightSection: {
      services: Array<{
        icon: string;
        title: string;
        description: string;
        price?: string;
        amount?: string;
        paymentLink?: string;
      }>;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Purchase {
  _id: string;
  userId?: string;
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
  metadata: Record<string, any>;
}

export interface ServiceConsumption {
  _id: string;
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

export interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  subject: string;
  message: string;
  type: 'general' | 'support' | 'partnership' | 'consultation';
  priority: 'low' | 'medium' | 'high';
  status: 'new' | 'in-progress' | 'resolved' | 'closed';
  userId?: string;
  source: 'contact-form' | 'dashboard' | 'website';
  createdAt: Date;
  updatedAt: Date;
  respondedAt?: Date;
}

// API Helper Functions
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}/api${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

// MongoDB Collections
export interface Collections {
  users: any;
  userProgress: any;
  blogs: any;
  portfolio: any;
  services: any;
  purchases: any;
  serviceConsumption: any;
  contactSubmissions: any;
}

// Connect to MongoDB (mock function for browser compatibility)
export async function connectToMongoDB(): Promise<any> {
  console.log('✅ Connected to MongoDB via API');
  return {};
}

// Get database instance (mock function for browser compatibility)
export async function getDatabase(): Promise<any> {
  return {};
}

// Get collections (mock function for browser compatibility)
export async function getCollections(): Promise<Collections> {
  return {
    users: {},
    userProgress: {},
    blogs: {},
    portfolio: {},
    services: {},
    purchases: {},
    serviceConsumption: {},
    contactSubmissions: {},
  };
}

// Close MongoDB connection (mock function for browser compatibility)
export async function closeMongoDBConnection(): Promise<void> {
  console.log('✅ MongoDB connection closed');
}

// Utility functions for MongoDB operations
export class MongoDBService {
  // User operations
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await apiRequest(`/users/${userId}`);
      return user;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await apiRequest(`/users/email/${email}`);
      return user;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  async createUser(userData: Omit<User, '_id'>): Promise<User> {
    try {
      const user = await apiRequest('/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
      return user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    try {
      await apiRequest(`/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await apiRequest('/users');
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async getUsersByRole(role: 'admin' | 'user'): Promise<User[]> {
    try {
      const users = await apiRequest(`/users/role/${role}`);
      return users;
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  }

  // Blog operations
  async getPublishedBlogs(): Promise<Blog[]> {
    try {
      const blogs = await apiRequest('/blogs/published');
      return blogs;
    } catch (error) {
      console.error('Error getting published blogs:', error);
      return [];
    }
  }

  async getAllBlogs(): Promise<Blog[]> {
    try {
      const blogs = await apiRequest('/blogs');
      return blogs;
    } catch (error) {
      console.error('Error getting all blogs:', error);
      return [];
    }
  }

  async getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
      const blog = await apiRequest(`/blogs/slug/${slug}`);
      return blog;
    } catch (error) {
      console.error('Error getting blog by slug:', error);
      return null;
    }
  }

  async createBlog(blogData: Omit<Blog, '_id'>): Promise<Blog> {
    try {
      const blog = await apiRequest('/blogs', {
        method: 'POST',
        body: JSON.stringify(blogData),
      });
      return blog;
    } catch (error) {
      console.error('Error creating blog:', error);
      throw error;
    }
  }

  async updateBlog(blogId: string, updates: Partial<Blog>): Promise<void> {
    try {
      await apiRequest(`/blogs/${blogId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating blog:', error);
      throw error;
    }
  }

  async deleteBlog(blogId: string): Promise<void> {
    try {
      await apiRequest(`/blogs/${blogId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting blog:', error);
      throw error;
    }
  }

  // Portfolio operations
  async getPublishedPortfolio(): Promise<Portfolio[]> {
    try {
      const portfolio = await apiRequest('/portfolio/published');
      return portfolio;
    } catch (error) {
      console.error('Error getting published portfolio:', error);
      return [];
    }
  }

  async getAllPortfolio(): Promise<Portfolio[]> {
    try {
      const portfolio = await apiRequest('/portfolio');
      return portfolio;
    } catch (error) {
      console.error('Error getting all portfolio:', error);
      return [];
    }
  }

  async getPortfolioBySlug(slug: string): Promise<Portfolio | null> {
    try {
      const portfolio = await apiRequest(`/portfolio/slug/${slug}`);
      return portfolio;
    } catch (error) {
      console.error('Error getting portfolio by slug:', error);
      return null;
    }
  }

  async createPortfolio(portfolioData: Omit<Portfolio, '_id'>): Promise<Portfolio> {
    try {
      const portfolio = await apiRequest('/portfolio', {
        method: 'POST',
        body: JSON.stringify(portfolioData),
      });
      return portfolio;
    } catch (error) {
      console.error('Error creating portfolio:', error);
      throw error;
    }
  }

  async updatePortfolio(portfolioId: string, updates: Partial<Portfolio>): Promise<void> {
    try {
      await apiRequest(`/portfolio/${portfolioId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating portfolio:', error);
      throw error;
    }
  }

  async deletePortfolio(portfolioId: string): Promise<void> {
    try {
      await apiRequest(`/portfolio/${portfolioId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      throw error;
    }
  }

  // Service operations
  async getAllServices(): Promise<Service[]> {
    try {
      const services = await apiRequest('/services');
      return services;
    } catch (error) {
      console.error('Error getting all services:', error);
      return [];
    }
  }

  async createService(serviceData: Omit<Service, '_id'>): Promise<Service> {
    try {
      const service = await apiRequest('/services', {
        method: 'POST',
        body: JSON.stringify(serviceData),
      });
      return service;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  async updateService(serviceId: string, updates: Partial<Service>): Promise<void> {
    try {
      await apiRequest(`/services/${serviceId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  }

  async deleteService(serviceId: string): Promise<void> {
    try {
      await apiRequest(`/services/${serviceId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }

  // Purchase operations
  async getUserPurchases(userId: string): Promise<Purchase[]> {
    try {
      const purchases = await apiRequest(`/purchases/user/${userId}`);
      return purchases;
    } catch (error) {
      console.error('Error getting user purchases:', error);
      return [];
    }
  }

  async getAllPurchases(): Promise<Purchase[]> {
    try {
      const purchases = await apiRequest('/purchases');
      return purchases;
    } catch (error) {
      console.error('Error getting all purchases:', error);
      return [];
    }
  }

  async createPurchase(purchaseData: Omit<Purchase, '_id'>): Promise<Purchase> {
    try {
      const purchase = await apiRequest('/purchases', {
        method: 'POST',
        body: JSON.stringify(purchaseData),
      });
      return purchase;
    } catch (error) {
      console.error('Error creating purchase:', error);
      throw error;
    }
  }

  // Contact submission operations
  async createContactSubmission(submissionData: Omit<ContactSubmission, '_id'>): Promise<ContactSubmission> {
    try {
      const submission = await apiRequest('/contact-submissions', {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
      return submission;
    } catch (error) {
      console.error('Error creating contact submission:', error);
      throw error;
    }
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const submissions = await apiRequest('/contact-submissions');
      return submissions;
    } catch (error) {
      console.error('Error getting all contact submissions:', error);
      return [];
    }
  }


  // User progress operations
  async getUserProgress(userId: string): Promise<UserProgress | null> {
    try {
      const progress = await apiRequest(`/user-progress/${userId}`);
      return progress;
    } catch (error) {
      console.error('Error getting user progress:', error);
      return null;
    }
  }

  async createUserProgress(progressData: Omit<UserProgress, '_id'>): Promise<UserProgress> {
    try {
      const progress = await apiRequest('/user-progress', {
        method: 'POST',
        body: JSON.stringify(progressData),
      });
      return progress;
    } catch (error) {
      console.error('Error creating user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(userId: string, updates: Partial<UserProgress>): Promise<void> {
    try {
      await apiRequest(`/user-progress/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }
}

// Initialize MongoDB service
export async function getMongoDBService(): Promise<MongoDBService> {
  return new MongoDBService();
}