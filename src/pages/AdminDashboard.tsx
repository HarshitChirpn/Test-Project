import React, { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin, UserRole } from "@/contexts/AdminContext";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import PortfolioForm from "@/components/PortfolioForm";
import BlogForm from "@/components/BlogForm";
import UserForm from "@/components/UserForm";
import ProjectWorkflow from "@/components/admin/ProjectWorkflow";
import ProjectMilestoneViewer from "@/components/admin/ProjectMilestoneViewer";
import ContactInformationManagement from "@/components/admin/ContactInformationManagement";
import ServicesManagement from "@/components/ServicesManagement";
import PurchasesManagement from "@/components/admin/PurchasesManagement";
import ServiceConsumptionManagement from "@/components/admin/ServiceConsumptionManagement";
import TestimonialManagement from "@/components/admin/TestimonialManagement";
import {
  Users,
  DollarSign,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Download,
  RefreshCw,
  Trash2,
  Shield,
  Building,
  Folder,
  ShoppingCart,
  Package,
  MessageSquare,
  Briefcase,
  Wrench,
  File,
  Target,
  Flag,
  Phone
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuth();
  const { isAdmin, adminLoading, users, usersLoading, setUserRole, updateUserStatus, deleteUser, createNewUser, refreshUsers } = useAdmin();
  const { toast } = useToast();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    totalRegularUsers: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("projects");

  const [expandedSections, setExpandedSections] = useState({
    siteContent: true,
    userManagement: true,
    projectManagement: true,
    serviceConsumption: true
  });
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [portfoliosLoading, setPortfoliosLoading] = useState(false);
  const [showPortfolioForm, setShowPortfolioForm] = useState(false);
  const [editingPortfolio, setEditingPortfolio] = useState<any>(null);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [showBlogForm, setShowBlogForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const [showUserForm, setShowUserForm] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchStats();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin && activeSection === "portfolio") {
      fetchPortfolios();
    }
  }, [isAdmin, activeSection]);

  useEffect(() => {
    if (isAdmin && activeSection === "blogs") {
      fetchBlogs();
    }
  }, [isAdmin, activeSection]);

  const fetchStats = async () => {
    try {
      const usersResult = await api.get('/users?limit=100');
      const allUsers = usersResult.data?.users || [];

      const totalAdmins = allUsers.filter((u: any) => u.role === 'admin').length;
      const totalRegularUsers = allUsers.filter((u: any) => u.role === 'user').length;

      setStats({
        totalUsers: allUsers.length,
        totalAdmins,
        totalRegularUsers
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch dashboard statistics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPortfolios = async () => {
    try {
      setPortfoliosLoading(true);
      const result = await api.get('/portfolio');
      console.log('Fetched portfolios:', result.data?.portfolios);
      setPortfolios(result.data?.portfolios || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast({
        title: "Error",
        description: "Failed to fetch portfolio data",
        variant: "destructive",
      });
    } finally {
      setPortfoliosLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      // Request a higher limit to get more blogs, or all blogs
      const result = await api.get('/blogs?limit=100');
      console.log('Full API response:', result.data);
      console.log('Fetched blogs:', result.data?.blogs);
      console.log('Pagination info:', result.data?.pagination);
      setBlogs(result.data?.blogs || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: "Error",
        description: "Failed to fetch blog data",
        variant: "destructive",
      });
    } finally {
      setBlogsLoading(false);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await setUserRole(userId, newRole as "admin" | "user");
      toast({
        title: "Success",
        description: "User role updated successfully",
      });
      // Update stats after role change
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      await updateUserStatus(userId, isActive);
      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });
      // Update stats after status change
      fetchStats();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        console.log("Deleting user with ID:", userId);
        await deleteUser(userId);
        toast({
          title: "Success",
          description: "User deleted successfully",
        });
        // Update stats after deletion
        fetchStats();
      } catch (error) {
        console.error("Delete user error:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete user",
          variant: "destructive",
        });
      }
    }
  };

  const handleRefresh = () => {
    fetchStats();
    if (activeSection === "portfolio") {
      fetchPortfolios();
    }
    if (activeSection === "blogs") {
      fetchBlogs();
    }
    if (activeSection === "users") {
      refreshUsers();
    }
    // Services are managed by the ServicesManagement component's context
    toast({
      title: "Refreshed",
      description: "Data updated successfully",
    });
  };

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (window.confirm("Are you sure you want to delete this portfolio item?")) {
      try {
        await api.delete(`/portfolio/${portfolioId}`);
        toast({
          title: "Success",
          description: "Portfolio item deleted successfully",
        });
        fetchPortfolios();
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete portfolio item",
          variant: "destructive",
        });
      }
    }
  };

  const handleCreatePortfolio = () => {
    setEditingPortfolio(null);
    setShowPortfolioForm(true);
  };

  const handleEditPortfolio = (portfolio: any) => {
    console.log('Editing portfolio:', portfolio);
    setEditingPortfolio(portfolio);
    setShowPortfolioForm(true);
  };

  const handlePortfolioFormClose = () => {
    setShowPortfolioForm(false);
    setEditingPortfolio(null);
  };

  const handlePortfolioFormSuccess = () => {
    fetchPortfolios();
  };

  const handleCreateBlog = () => {
    setEditingBlog(null);
    setShowBlogForm(true);
  };

  const handleEditBlog = (blog: any) => {
    console.log('Editing blog:', blog);
    setEditingBlog(blog);
    setShowBlogForm(true);
  };

  const handleBlogFormClose = () => {
    setShowBlogForm(false);
    setEditingBlog(null);
  };

  const handleBlogFormSuccess = () => {
    fetchBlogs();
  };

  const handleCreateUser = () => {
    setShowUserForm(true);
  };

  const handleUserFormClose = () => {
    setShowUserForm(false);
  };

  const handleUserFormSuccess = () => {
    fetchStats();
    refreshUsers();
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (window.confirm("Are you sure you want to delete this blog post?")) {
      try {
        await api.delete(`/blogs/${blogId}`);
        toast({
          title: "Success",
          description: "Blog post deleted successfully",
        });
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        toast({
          title: "Error",
          description: "Failed to delete blog post",
          variant: "destructive",
        });
      }
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-100 border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Admin Dashboard</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {/* Site Content */}
          <Collapsible open={expandedSections.siteContent} onOpenChange={() => toggleSection('siteContent')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-200 rounded-md">
              <span className="font-medium text-gray-700">Site Content</span>
              {expandedSections.siteContent ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <button 
                onClick={() => setActiveSection("blogs")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "blogs" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <File className="h-4 w-4" />
                <span>Blogs</span>
              </button>
              <button 
                onClick={() => setActiveSection("portfolio")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "portfolio" ? "bg-yellow-100 text-yellow-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Briefcase className="h-4 w-4" />
                <span>Portfolio</span>
              </button>
              <button 
                onClick={() => setActiveSection("testimonials")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "testimonials" ? "bg-purple-100 text-purple-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                <span>Customer Testimonials</span>
              </button>
              <button 
                onClick={() => setActiveSection("services")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "services" ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Wrench className="h-4 w-4" />
                <span>Services Management</span>
              </button>
              <button 
                onClick={() => setActiveSection("contactInfo")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "contactInfo" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Phone className="h-4 w-4" />
                <span>Contact Information</span>
              </button>
            </CollapsibleContent>
          </Collapsible>

          {/* User Management */}
          <Collapsible open={expandedSections.userManagement} onOpenChange={() => toggleSection('userManagement')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-200 rounded-md">
              <span className="font-medium text-gray-700">User Management</span>
              {expandedSections.userManagement ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <button 
                onClick={() => setActiveSection("users")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "users" ? "bg-yellow-100 text-yellow-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Users className="h-4 w-4" />
                <span>All Users</span>
              </button>
              <div className="ml-6 space-y-1">
                <button className="flex items-center space-x-2 p-1 text-xs text-gray-500 hover:bg-gray-200 rounded-md w-full text-left">
                  <span>•</span>
                  <span>Founders</span>
                </button>
                <button className="flex items-center space-x-2 p-1 text-xs text-gray-500 hover:bg-gray-200 rounded-md w-full text-left">
                  <span>•</span>
                  <span>Incubators</span>
                </button>
                <button className="flex items-center space-x-2 p-1 text-xs text-gray-500 hover:bg-gray-200 rounded-md w-full text-left">
                  <span>•</span>
                  <span>Enterprise</span>
                </button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Project Management */}
          <Collapsible open={expandedSections.projectManagement} onOpenChange={() => toggleSection('projectManagement')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-200 rounded-md">
              <span className="font-medium text-gray-700">Project Management</span>
              {expandedSections.projectManagement ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <button 
                onClick={() => setActiveSection("projects")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "projects" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Folder className="h-4 w-4" />
                <span>All Projects</span>
              </button>
              <button 
                onClick={() => setActiveSection("milestones")}
                className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
                  activeSection === "milestones" ? "bg-green-100 text-green-800" : "text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Target className="h-4 w-4" />
                <span>Project Milestones</span>
              </button>
            </CollapsibleContent>
          </Collapsible>

          {/* Purchases & Sales */}
          <button 
            onClick={() => setActiveSection("purchases")}
            className={`flex items-center space-x-2 p-2 text-sm rounded-md w-full text-left ${
              activeSection === "purchases" ? "bg-blue-100 text-blue-800" : "text-gray-600 hover:bg-gray-200"
            }`}
          >
            <ShoppingCart className="h-4 w-4" />
            <span>Purchases & Sales</span>
          </button>

          {/* Project Management */}
          <Collapsible open={expandedSections.projectManagement} onOpenChange={() => toggleSection('projectManagement')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-200 rounded-md">
              <span className="font-medium text-gray-700">Project Management</span>
              {expandedSections.projectManagement ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <button 
                onClick={() => setActiveSection("projects")}
                className={`flex items-center space-x-2 p-1 text-xs rounded-md w-full text-left ${
                  activeSection === "projects" ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span>•</span>
                <span>Project Workflow</span>
              </button>
            </CollapsibleContent>
          </Collapsible>

          {/* Service Consumption */}
          <Collapsible open={expandedSections.serviceConsumption} onOpenChange={() => toggleSection('serviceConsumption')}>
            <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-left hover:bg-gray-200 rounded-md">
              <span className="font-medium text-gray-700">Service Consumption</span>
              {expandedSections.serviceConsumption ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="ml-4 space-y-1">
              <button 
                onClick={() => setActiveSection("serviceConsumption")}
                className={`flex items-center space-x-2 p-1 text-xs rounded-md w-full text-left ${
                  activeSection === "serviceConsumption" ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span>•</span>
                <span>Service Consumption</span>
              </button>
              <button 
                onClick={() => setActiveSection("services")}
                className={`flex items-center space-x-2 p-1 text-xs rounded-md w-full text-left ${
                  activeSection === "services" ? "bg-blue-100 text-blue-800" : "text-gray-500 hover:bg-gray-200"
                }`}
              >
                <span>•</span>
                <span>Services Management</span>
              </button>
            </CollapsibleContent>
          </Collapsible>
        </nav>
              </div>

        {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
                    <p className="text-sm text-gray-500">{stats.totalUsers} active users</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                  </div>
                </CardContent>
              </Card>

              <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Admins</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalAdmins}</p>
                    <p className="text-sm text-gray-500">{stats.totalAdmins} active admins</p>
                  </div>
                  <Shield className="h-8 w-8 text-gray-400" />
                </div>
                </CardContent>
              </Card>

              <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Regular Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalRegularUsers}</p>
                    <p className="text-sm text-gray-500">{stats.totalRegularUsers} active users</p>
                  </div>
                  <Users className="h-8 w-8 text-gray-400" />
                </div>
            </CardContent>
          </Card>
          </div>

          {/* User Management Section */}
          {activeSection === "users" && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>Manage user roles, status, and permissions</CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-white"
                    onClick={handleCreateUser}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Create User
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Sync Users
                  </Button>
                  <Button variant="outline" onClick={handleRefresh}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-700">User</th>
                        <th className="text-left p-4 font-medium text-gray-700">Role</th>
                        <th className="text-left p-4 font-medium text-gray-700">User Type</th>
                        <th className="text-left p-4 font-medium text-gray-700">Status</th>
                        <th className="text-left p-4 font-medium text-gray-700">Created</th>
                        <th className="text-left p-4 font-medium text-gray-700">Last Login</th>
                        <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.uid} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            <div>
                              <p className="font-medium text-gray-900">{user.displayName || user.email?.split('@')[0]}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </td>
                          <td className="p-4">
                            <Select 
                              value={user.role} 
                              onValueChange={(value) => handleRoleChange(user.uid, value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="user">User</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                              {user.userType || 'Founder'}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <Switch
                              checked={user.isActive !== false}
                              onCheckedChange={(checked) => handleStatusToggle(user.uid, checked)}
                              className="data-[state=checked]:bg-yellow-500"
                            />
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-sm text-gray-600">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                          </td>
                          <td className="p-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteUser(user.uid)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
                </CardContent>
              </Card>
          )}

          {/* Portfolio Management Section */}
          {activeSection === "portfolio" && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <CardTitle>Portfolio Management</CardTitle>
                      <CardDescription>Manage portfolio items and their status</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" onClick={handleCreatePortfolio}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Portfolio Item
                    </Button>
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {portfoliosLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading portfolios...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">All Portfolio Items ({portfolios.length})</h3>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-gray-700">Title</th>
                          <th className="text-left p-4 font-medium text-gray-700">Category</th>
                          <th className="text-left p-4 font-medium text-gray-700">Client</th>
                          <th className="text-left p-4 font-medium text-gray-700">Created</th>
                          <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolios.map((portfolio) => (
                          <tr key={portfolio._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-gray-900">{portfolio.title}</p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">{portfolio.description}</p>
                                </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                {portfolio.category}
                                </Badge>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-900">{portfolio.client}</p>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(portfolio.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditPortfolio(portfolio)}
                                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeletePortfolio(portfolio._id)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {portfolios.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No portfolio items found</p>
                              </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Blog Management Section */}
          {activeSection === "blogs" && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div>
                      <CardTitle>Blog Management</CardTitle>
                      <CardDescription>Manage blog posts and their content</CardDescription>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="bg-blue-500 hover:bg-blue-600 text-white" onClick={handleCreateBlog}>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Create Blog Post
                    </Button>
                    <Button variant="outline" onClick={handleRefresh}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {blogsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-600">Loading blogs...</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">All Blog Posts ({blogs.length})</h3>
                    </div>
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-4 font-medium text-gray-700">Title</th>
                          <th className="text-left p-4 font-medium text-gray-700">Category</th>
                          <th className="text-left p-4 font-medium text-gray-700">Author</th>
                          <th className="text-left p-4 font-medium text-gray-700">Status</th>
                          <th className="text-left p-4 font-medium text-gray-700">Created</th>
                          <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {blogs.map((blog) => (
                          <tr key={blog._id} className="border-b hover:bg-gray-50">
                            <td className="p-4">
                              <div>
                                <p className="font-medium text-gray-900">{blog.title}</p>
                                <p className="text-sm text-gray-500 truncate max-w-xs">{blog.excerpt}</p>
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                                {blog.category}
                              </Badge>
                            </td>
                            <td className="p-4">
                              <p className="text-sm text-gray-900">{blog.author || 'Unknown'}</p>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <Badge 
                                  variant={blog.published ? "default" : "secondary"}
                                  className={blog.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}
                                >
                                  {blog.published ? "Published" : "Draft"}
                                </Badge>
                                {blog.featured && (
                                  <Badge variant="default" className="bg-yellow-100 text-yellow-700">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4">
                              <div className="flex space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditBlog(blog)}
                                >
                                  <FileText className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBlog(blog._id)}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {blogs.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No blog posts found</p>
                      </div>
                    )}
                </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Service Consumption Section */}
          {activeSection === "serviceConsumption" && (
            <div className="mt-6">
              <ServiceConsumptionManagement />
            </div>
          )}

          {/* Services Management Section */}
          {activeSection === "services" && (
            <div className="mt-6">
              <ServicesManagement />
            </div>
          )}

          {/* Project Workflow Section */}
          {activeSection === "projects" && (
            <div className="mt-6">
              <ProjectWorkflow />
            </div>
          )}

          {/* Project Milestones Section */}
          {activeSection === "milestones" && (
            <div className="mt-6">
              <ProjectMilestoneViewer />
            </div>
          )}

          {/* Purchases & Sales Section */}
          {activeSection === "purchases" && (
            <div className="mt-6">
              <PurchasesManagement />
            </div>
          )}

          {/* Customer Testimonials Section */}
          {activeSection === "testimonials" && (
            <div className="mt-6">
              <TestimonialManagement />
            </div>
          )}

          {/* Contact Information Section */}
          {activeSection === "contactInfo" && (
            <div className="mt-6">
              <ContactInformationManagement />
            </div>
          )}
        </div>
      </div>

      {/* Chat Widget */}
      <div className="fixed bottom-4 right-4">
        <div className="relative">
          <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center cursor-pointer shadow-lg">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
            1
          </div>
                </div>
        <div className="absolute bottom-16 right-0 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
          <p className="text-sm font-medium text-gray-900">We Are Here!</p>
                </div>
                </div>

      {/* Portfolio Form Modal */}
      {showPortfolioForm && (
        <PortfolioForm
          onClose={handlePortfolioFormClose}
          onSuccess={handlePortfolioFormSuccess}
          portfolio={editingPortfolio}
        />
      )}

      {/* Blog Form Modal */}
      {showBlogForm && (
        <BlogForm
          onClose={handleBlogFormClose}
          onSuccess={handleBlogFormSuccess}
          blog={editingBlog}
        />
      )}

      {/* User Form Modal */}
      {showUserForm && (
        <UserForm
          onClose={handleUserFormClose}
          onSuccess={handleUserFormSuccess}
          createUser={createNewUser}
        />
      )}
    </div>
  );
};

export default AdminDashboard;