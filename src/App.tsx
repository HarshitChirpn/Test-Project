import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { BlogProvider } from "@/contexts/BlogContext";
import { PortfolioProvider } from "@/contexts/PortfolioContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { StripeProvider } from "@/contexts/StripeContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { CartProvider } from "@/contexts/CartContext";
import { TestimonialProvider } from "@/contexts/TestimonialContext";
import ScrollToTop from "@/components/ScrollToTop";
import ProjectDebug from "@/pages/ProjectDebug";
import Index from "./pages/Index";
import GetMVP from "./pages/GetMVP";
import About from "./pages/About";
import ServicesPage from "./pages/Services";
import Perks from "./pages/Perks";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import PortfolioDetail from "./pages/PortfolioDetail";
import Contact from "./pages/Contact";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Milestones from "./pages/Milestones";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import Cart from "./pages/Cart";
import AdminDashboard from "./pages/AdminDashboard";
import AdminSetup from "./pages/AdminSetup";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsCondition from "./pages/TermsCondition";
import NotFound from "./pages/NotFound";
import TestAuth from "./pages/TestAuth";
import ApiTest from "./pages/ApiTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <StripeProvider>
      <ProductsProvider>
        <AuthProvider>
          <AdminProvider>
            <BlogProvider>
              <PortfolioProvider>
                <ServicesProvider>
                  <ProjectProvider>
                    <CartProvider>
                      <TestimonialProvider>
                      <TooltipProvider>
                        <Toaster />
                        <Sonner />
                        <BrowserRouter>
                          <AuthModalProvider>
                            <ScrollToTop />
                            <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/getmvp" element={<GetMVP />} />
                      <Route path="/getmvp/about" element={<About />} />
                      <Route path="/getmvp/services" element={<ServicesPage />} />
                      <Route path="/getmvp/services/:serviceSlug" element={<ServiceDetail />} />
                      <Route path="/getmvp/cart" element={<Cart />} />
                      <Route path="/getmvp/perks" element={<Perks />} />
                      <Route path="/getmvp/blog" element={<Blog />} />
                      <Route path="/getmvp/blog/:slug" element={<BlogPost />} />
                      <Route
                        path="/getmvp/portfolio/:slug"
                        element={<PortfolioDetail />}
                      />
                      <Route path="/getmvp/admin" element={<AdminDashboard />} />
                      <Route
                        path="/getmvp/admin-setup"
                        element={<AdminSetup />}
                      />
                      <Route path="/getmvp/settings" element={<Settings />} />
                      <Route path="/getmvp/profile" element={<Profile />} />
                      <Route path="/getmvp/contact" element={<Contact />} />
                      <Route path="/getmvp/register" element={<Register />} />
                      <Route path="/getmvp/login" element={<Login />} />
                      <Route path="/getmvp/dashboard" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/projects" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/journey" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/learn" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/milestones" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/timeline" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/documents" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/team" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/analytics" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/services" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/notifications" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/settings" element={<Dashboard />} />
                      <Route path="/getmvp/dashboard/help" element={<Dashboard />} />
                      <Route
                        path="/getmvp/privacy-policy"
                        element={<PrivacyPolicy />}
                      />
                      <Route
                        path="/getmvp/terms-condition"
                        element={<TermsCondition />}
                      />
                      <Route path="/test-auth" element={<TestAuth />} />
                      <Route path="/api-test" element={<ApiTest />} />
                      <Route path="/project-debug" element={<ProjectDebug />} />
                      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                          </AuthModalProvider>
                        </BrowserRouter>
                      </TooltipProvider>
                      </TestimonialProvider>
                    </CartProvider>
                  </ProjectProvider>
                </ServicesProvider>
              </PortfolioProvider>
            </BlogProvider>
          </AdminProvider>
        </AuthProvider>
      </ProductsProvider>
    </StripeProvider>
  </QueryClientProvider>
);

export default App;
