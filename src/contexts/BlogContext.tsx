import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "./AuthContext";

export interface BlogPost {
  id: string;
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

export interface CreateBlogPost {
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: "All" | "Web App" | "Mobile App" | "SaaS Platform";
  slug: string;
  image: string;
  featured: boolean;
  published: boolean;
}

interface BlogContextType {
  blogs: BlogPost[];
  blogsLoading: boolean;
  featuredBlog: BlogPost | null;
  recentBlogs: BlogPost[];
  createBlog: (blogData: CreateBlogPost) => Promise<{ success: boolean; error?: string }>;
  updateBlog: (id: string, updates: Partial<CreateBlogPost>) => Promise<{ success: boolean; error?: string }>;
  deleteBlog: (id: string) => Promise<{ success: boolean; error?: string }>;
  refreshBlogs: () => Promise<void>;
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (context === undefined) {
    throw new Error("useBlog must be used within a BlogProvider");
  }
  return context;
};

interface BlogProviderProps {
  children: ReactNode;
}

export const BlogProvider = ({ children }: BlogProviderProps) => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  // Load blogs on mount
  useEffect(() => {
    refreshBlogs();
  }, []);

  const refreshBlogs = async () => {
    try {
      setBlogsLoading(true);
      // Request a higher limit to get more blogs, similar to admin dashboard
      const result = await api.get('/blogs?limit=100');

      if (result.success && result.data?.blogs) {
        const formattedBlogs: BlogPost[] = result.data.blogs.map((blog: any) => ({
          id: blog._id,
          title: blog.title,
          excerpt: blog.excerpt,
          content: blog.content,
          author: blog.author,
          category: blog.category,
          slug: blog.slug,
          image: blog.image || '',
          featured: blog.featured,
          published: blog.published,
          createdAt: new Date(blog.createdAt),
          updatedAt: new Date(blog.updatedAt)
        }));

        setBlogs(formattedBlogs);
      }
    } catch (error) {
      console.error("Error loading blogs:", error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const createBlog = async (blogData: CreateBlogPost) => {
    try {
      const result = await api.post('/blogs', {
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content,
        author: blogData.author,
        category: blogData.category,
        slug: blogData.slug,
        image: blogData.image,
        featured: blogData.featured,
        published: blogData.published
      });

      await refreshBlogs();
      return { success: result.success };
    } catch (error: any) {
      console.error("Error creating blog:", error);
      return { success: false, error: error.message };
    }
  };

  const updateBlog = async (id: string, updates: Partial<CreateBlogPost>) => {
    try {
      const result = await api.put(`/blogs/${id}`, updates);

      await refreshBlogs();
      return { success: result.success };
    } catch (error: any) {
      console.error("Error updating blog:", error);
      return { success: false, error: error.message };
    }
  };

  const deleteBlog = async (id: string) => {
    try {
      const result = await api.delete(`/blogs/${id}`);

      await refreshBlogs();
      return { success: result.success };
    } catch (error: any) {
      console.error("Error deleting blog:", error);
      return { success: false, error: error.message };
    }
  };

  // Compute featured blog and recent blogs
  const featuredBlog = blogs.find(blog => blog.featured && blog.published) || null;
  const recentBlogs = blogs
    .filter(blog => blog.published && !blog.featured)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const value: BlogContextType = {
    blogs,
    blogsLoading,
    featuredBlog,
    recentBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    refreshBlogs,
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
};