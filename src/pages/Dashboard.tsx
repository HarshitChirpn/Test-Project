import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { userService, UserProfile } from "@/services/userService";
import {
  dashboardService,
  UserDashboardData,
} from "@/services/dashboardService";
import { progressService, PhaseSubsteps } from "@/services/progressService";
import { contactService } from "@/services/contactService";
import { useToast } from "@/components/ui/use-toast";
import NewProjectModalV2 from "@/components/NewProjectModalV2";
import ProjectCard from "@/components/ProjectCard";
import ProjectTrackingDisplay from "@/components/ProjectTrackingDisplay";
import ProjectDetailsModal from "@/components/ProjectDetailsModal";
import EditProjectModal from "@/components/EditProjectModal";
import { useProjects } from "@/contexts/ProjectContext";
import { Project } from "@/services/projectService";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Rocket,
  Target,
  Code,
  BarChart3,
  TrendingUp,
  CheckCircle,
  Lightbulb,
  Calendar,
  MessageSquare,
  Settings,
  User,
  Bell,
  Plus,
  ArrowRight,
  Zap,
  Clock,
  Trophy,
  Users,
  Building2,
  Briefcase,
  DollarSign,
  Globe,
  Menu,
  X,
  Flag,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import PurchasedServices from "@/components/PurchasedServices";
import { PurchasedServicesProvider } from "@/contexts/PurchasedServicesContext";
import UserProjectJourney from "@/components/UserProjectJourney";
import UserMilestoneViewer from "@/components/UserMilestoneViewer";

const Dashboard = () => {
  const { user } = useAuth();
  const { projects, workflowProjects, stats, loading: projectsLoading } = useProjects();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dashboardData, setDashboardData] = useState<UserDashboardData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isProjectDetailsOpen, setIsProjectDetailsOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [phaseSubsteps] = useState<PhaseSubsteps>(
    progressService.getPhaseSubsteps()
  );
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  // Set up real-time updates for dashboard data (polling every 30 seconds)
  useEffect(() => {
    if (!user) return;

    console.log('[Dashboard] Setting up real-time polling for dashboard updates');
    
    const pollInterval = setInterval(() => {
      console.log('[Dashboard] Polling for dashboard updates...');
      loadDashboardData(true); // Background refresh
    }, 30000); // 30 seconds

    // Cleanup on unmount
    return () => {
      console.log('[Dashboard] Stopping dashboard polling');
      clearInterval(pollInterval);
    };
  }, [user]);

  const loadDashboardData = async (isBackgroundRefresh = false) => {
    if (!user) return;

    if (isBackgroundRefresh) {
      setIsRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      const data = await dashboardService.getUserDashboardData(user._id, user);
      setDashboardData(data);
      setUserProfile(data.userProfile);

      if (isBackgroundRefresh) {
        console.log('[Dashboard] Background refresh completed successfully');
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      if (!isBackgroundRefresh) {
        toast({
          title: "Error loading dashboard",
          description:
            "Unable to load dashboard data. Please try refreshing the page.",
          variant: "destructive",
        });
      }
    } finally {
      if (isBackgroundRefresh) {
        setIsRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  // Get user type from dashboard data
  const userType = "founders";
  const projectData = dashboardData?.projectData;
  const allProjects = dashboardData?.allProjects || [];
  const userProgress = dashboardData?.progress;

  // Get the most recent project from real-time workflow data
  const recentProject = workflowProjects && workflowProjects.length > 0 
    ? workflowProjects.reduce((latest, current) => {
        const latestTime = new Date(latest.updatedAt || latest.createdAt).getTime();
        const currentTime = new Date(current.updatedAt || current.createdAt).getTime();
        return currentTime > latestTime ? current : latest;
      })
    : null;

  // Debug log to verify real-time data is being used
  console.log('[Dashboard] Real-time project data:', {
    recentProject: recentProject?.projectName,
    workflowProjectCount: workflowProjects?.length,
    lastUpdated: recentProject?.updatedAt,
    currentPhase: recentProject?.currentPhase,
    currentSubstep: recentProject?.currentSubstep,
    progress: recentProject?.progress?.overall
  });

  // State for current active tab
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // User type-specific configurations using real-time data
  const getUserTypeConfig = () => {
    // Use real-time project data if available, otherwise fallback to dashboard data
    const currentProject = recentProject ? {
      name: recentProject.projectName,
      description: recentProject.projectDescription,
      industry: recentProject.category || "Technology",
      status: recentProject.status,
      type: recentProject.projectType || "Custom Project",
    } : projectData?.projectInfo || {
      name: "Your Project",
      description: "Getting started",
      industry: "Technology",
      status: "planning",
      type: "Custom Project",
    };

    // Use real-time progress data if available
    const currentProgress = recentProject?.progress || userProgress || {
      overall: 0,
      phases: {
        discovery: 0,
        design: 0,
        development: 0,
        testing: 0,
        launch: 0,
        support: 0,
      },
    };

    const getProcessSteps = () => {
      const phases = currentProgress.phases;
      const getStatus = (progress: number) => {
        if (progress >= 80) return "completed";
        if (progress > 0) return "in-progress";
        return "pending";
      };

      return [
        {
          title: "Discovery",
          icon: Lightbulb,
          status: getStatus(phases.discovery || 0),
          progress: phases.discovery || 0,
        },
        {
          title: "Design",
          icon: Target,
          status: getStatus(phases.design || 0),
          progress: phases.design || 0,
        },
        {
          title: "Development",
          icon: Code,
          status: getStatus(phases.development || 0),
          progress: phases.development || 0,
        },
        {
          title: "Testing",
          icon: BarChart3,
          status: getStatus(phases.testing || 0),
          progress: phases.testing || 0,
        },
        {
          title: "Launch",
          icon: TrendingUp,
          status: getStatus(phases.launch || 0),
          progress: phases.launch || 0,
        },
        {
          title: "Support",
          icon: CheckCircle,
          status: getStatus(phases.support || 0),
          progress: phases.support || 0,
        },
      ];
    };

    switch (userType) {
      case "founders":
        return {
          title: "Founder Dashboard",
          welcomeMessage: "Let's turn your startup idea into reality",
          icon: Rocket,
          primaryProject: currentProject.name,
          description: currentProject.description,
          industry: currentProject.industry,
          stage: currentProject.status,
          processSteps: getProcessSteps()
        };

      case "incubators":
        return {
          title: "Incubator Dashboard",
          welcomeMessage: "Manage your portfolio and investment pipeline",
          icon: Building2,
          primaryProject: defaultProject.name,
          description: defaultProject.description,
          industry: defaultProject.industry,
          stage: defaultProject.status,
          processSteps: getProcessSteps()
        };

      case "enterprise":
        return {
          title: "Enterprise Dashboard",
          welcomeMessage: "Accelerate innovation and R&D initiatives",
          icon: Building2,
          primaryProject: defaultProject.name,
          description: defaultProject.description,
          industry: defaultProject.industry,
          stage: defaultProject.status,
          processSteps: getProcessSteps()
        };

      default:
        return {
          title: "Dashboard",
          welcomeMessage: "Welcome to your dashboard",
          icon: Rocket,
          primaryProject: defaultProject.name,
          description: defaultProject.description,
          industry: defaultProject.industry,
          stage: defaultProject.status,
          processSteps: getProcessSteps()
        };
    }
  };

  const config = getUserTypeConfig();
  const overallProgress = recentProject?.progress?.overall ||
    userProgress?.overall ||
    config.processSteps.reduce((acc, step) => acc + step.progress, 0) /
      Math.max(config.processSteps.length, 1);

  // Segment-specific quick actions
  const getQuickActions = () => {
    const baseActions = [
      {
        title: "Account Settings",
        icon: Settings,
        href: "/getmvp/settings",
        description: "Manage your account",
      },
      {
        title: "Contact Support",
        icon: MessageSquare,
        href: "/getmvp/contact",
        description: "Get help from our team",
      },
    ];

    switch (userType) {
      case "founders":
        return [
          {
            title: "Launch New MVP",
            icon: Rocket,
            action: () => setIsNewProjectModalOpen(true),
            description: "Start your next product",
          },
          {
            title: "View Case Studies",
            icon: Target,
            href: "/getmvp/portfolio",
            description: "See successful MVPs",
          },
          {
            title: "Read Startup Guide",
            icon: Lightbulb,
            href: "/getmvp/blog",
            description: "Learn from experts",
          },
          ...baseActions,
        ];

      case "incubators":
        return [
          {
            title: "Add Portfolio Company",
            icon: Briefcase,
            action: () => setIsNewProjectModalOpen(true),
            description: "Support new investment",
          },
          {
            title: "Due Diligence Tools",
            icon: BarChart3,
            href: "/getmvp/services",
            description: "Evaluation resources",
          },
          {
            title: "Market Research",
            icon: Globe,
            href: "/getmvp/blog",
            description: "Industry insights",
          },
          ...baseActions,
        ];

      case "enterprise":
        return [
          {
            title: "Start R&D Initiative",
            icon: Building2,
            action: () => setIsNewProjectModalOpen(true),
            description: "Launch innovation project",
          },
          {
            title: "Innovation Framework",
            icon: Zap,
            href: "/getmvp/services",
            description: "Enterprise solutions",
          },
          {
            title: "Tech Trends",
            icon: TrendingUp,
            href: "/getmvp/blog",
            description: "Innovation insights",
          },
          ...baseActions,
        ];

      default:
        return [
          {
            title: "Start New Project",
            icon: Plus,
            action: () => setIsNewProjectModalOpen(true),
            description: "Get your next project started",
          },
          {
            title: "View Portfolio",
            icon: Target,
            href: "/getmvp/portfolio",
            description: "Browse our work",
          },
          ...baseActions,
        ];
    }
  };

  const quickActions = getQuickActions();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const handleQuickSupport = async (type: "chat" | "call" | "email") => {
    if (!user) return;

    try {
      const message =
        type === "chat"
          ? "User requested live chat support"
          : type === "call"
          ? "User requested to schedule a consultation call"
          : "User requested email support";

      const result = await contactService.submitQuickSupport(
        user._id,
        message,
        type
      );

      if (result.success) {
        toast({
          title: "Request Submitted",
          description: `Your ${type} request has been submitted. We'll get back to you soon!`,
        });
      } else {
        throw new Error("Failed to submit request");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <PurchasedServicesProvider>
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="border-b bg-gradient-to-r from-slate-50 to-blue-50">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  >
                    {sidebarCollapsed ? (
                      <Menu className="h-6 w-6" />
                    ) : (
                      <X className="h-6 w-6" />
                    )}
                  </Button>
                  <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                    <AvatarImage src={userProfile?.photoURL || ""} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getInitials(
                        userProfile?.displayName || user?.email || "U"
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h1 className="text-xl font-bold">
                        Welcome back,{" "}
                        {userProfile?.displayName || user?.email?.split("@")[0]}
                        !
                      </h1>
                      <Badge variant="secondary" className="text-xs">
                        {userType === "founders"
                          ? "🚀 Founder"
                          : userType === "incubators"
                          ? "💼 Incubator"
                          : "🏢 Enterprise"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {config.welcomeMessage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="hidden md:block text-right text-sm">
                    <p className="font-medium">
                      {Math.round(overallProgress)}% Complete
                    </p>
                    <p className="text-muted-foreground">Overall Progress</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline">Notifications</span>
                  </Button>
                  <Link to="/getmvp/profile">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      <span className="hidden md:inline">Profile</span>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">

            {/* Render content based on active tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Current Project Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center">
                          <config.icon className="h-5 w-5 mr-2 text-primary" />
                          {userType === "founders"
                            ? "Your Startup"
                            : userType === "incubators"
                            ? "Portfolio Overview"
                            : "R&D Projects"}
                        </div>
                        <div className="flex items-center space-x-2">
                          {isRefreshing && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-primary mr-1"></div>
                              Updating...
                            </div>
                          )}
                          {recentProject && (
                            <div className="text-xs text-green-600 flex items-center">
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                              Live Data
                            </div>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        {userType === "founders"
                          ? "Track your MVP development progress"
                          : userType === "incubators"
                          ? "Manage your portfolio companies"
                          : "Monitor innovation initiatives"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">
                            {config.primaryProject}
                          </h4>
                          <Badge variant="secondary">{config.stage}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>

                        {/* Current Phase and Substep Display */}
                        {(recentProject?.currentPhase || userProgress?.currentStatus) && (
                          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Flag className="h-4 w-4 text-blue-600" />
                                <span className="font-medium text-blue-900">
                                  Current Phase:
                                </span>
                                <Badge className="bg-blue-100 text-blue-800">
                                  {recentProject?.currentPhase || userProgress?.currentStatus?.currentPhase}
                                </Badge>
                              </div>
                              <div className="text-xs text-blue-600">
                                {recentProject?.progress?.phases?.[recentProject.currentPhase] || 
                                 userProgress?.currentStatus?.phaseProgress || 0}%
                                complete
                              </div>
                            </div>
                            <div className="text-sm text-blue-800">
                              <span className="font-medium">Current Step:</span>{" "}
                              {recentProject?.currentSubstep ? 
                                (phaseSubsteps[recentProject.currentPhase]?.[recentProject.currentSubstep as any]?.title || recentProject.currentSubstep) :
                                (userProgress?.currentStatus ? 
                                  (phaseSubsteps[userProgress.currentStatus.currentPhase]?.[userProgress.currentStatus.currentSubstep as any]?.title || "Not specified") :
                                  "Not specified")
                              }
                            </div>
                            <div className="mt-2">
                              <Progress
                                value={
                                  recentProject?.progress?.phases?.[recentProject.currentPhase] || 
                                  userProgress?.currentStatus?.substepProgress || 0
                                }
                                className="h-1 bg-blue-200"
                              />
                              <div className="text-xs text-blue-600 mt-1">
                                Step Progress:{" "}
                                {recentProject?.progress?.phases?.[recentProject.currentPhase] || 
                                 userProgress?.currentStatus?.substepProgress || 0}%
                              </div>
                            </div>
                            {(recentProject?.notes || userProgress?.currentStatus?.notes) && (
                              <div className="mt-2 text-xs text-blue-700 italic">
                                "{recentProject?.notes || userProgress?.currentStatus?.notes}"
                              </div>
                            )}
                          </div>
                        )}

                        <Progress value={overallProgress} className="h-2" />
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>{Math.round(overallProgress)}% complete</span>
                          <span>Industry: {config.industry}</span>
                        </div>
                      </div>

                      {(recentProject?.techStack || projectData?.techStack) &&
                        (recentProject?.techStack || projectData?.techStack).length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Tech Stack:</h5>
                            <div className="flex flex-wrap gap-2">
                              {(recentProject?.techStack || projectData?.techStack).map((tech, index) => (
                                <Badge key={index} variant="outline">
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                      {(recentProject?.milestones || projectData?.milestones) && (
                        <div className="mt-4">
                          <h5 className="font-medium mb-2">Next Milestone:</h5>
                          <div className="text-sm text-muted-foreground">
                            {(recentProject?.milestones || projectData?.milestones).find(
                              (m: any) => !m.completed
                            )?.title || "All milestones completed!"}
                          </div>
                        </div>
                      )}

                      {/* Project Tracking Section */}
                      <div className="mt-4">
                        <h5 className="font-medium mb-2 flex items-center">
                          <Flag className="h-4 w-4 mr-2 text-primary" />
                          Project Tracking
                        </h5>
                        <div className="text-sm text-muted-foreground">
                          {(recentProject?._id || dashboardData?.projectData?.projectInfo?.id) ? (
                            <ProjectTrackingDisplay
                              projectId={
                                recentProject?._id || dashboardData.projectData.projectInfo.id
                              }
                            />
                          ) : (
                            <p>
                              Project tracking information will be available
                              once your project is initialized.
                            </p>
                          )}
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full mt-4"
                        onClick={() => setIsNewProjectModalOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        {userType === "founders"
                          ? "Expand Project"
                          : userType === "incubators"
                          ? "Add Portfolio Company"
                          : "Start New R&D Initiative"}
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Zap className="h-5 w-5 mr-2 text-primary" />
                        Quick Actions
                      </CardTitle>
                      <CardDescription>
                        Common tasks and shortcuts
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {quickActions.map((action, index) => {
                        if (action.href) {
                          return (
                            <Link key={index} to={action.href}>
                              <div className="flex items-center p-3 rounded-lg border hover:bg-accent hover:border-primary/20 transition-colors cursor-pointer">
                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                                  <action.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {action.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {action.description}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </Link>
                          );
                        } else {
                          return (
                            <div key={index} onClick={action.action}>
                              <div className="flex items-center p-3 rounded-lg border hover:bg-accent hover:border-primary/20 transition-colors cursor-pointer">
                                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                                  <action.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium">
                                    {action.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    {action.description}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                              </div>
                            </div>
                          );
                        }
                      })}
                    </CardContent>
                  </Card>
                </div>

                {/* Segment-specific Insights & Recommendations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personalized Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Lightbulb className="h-5 w-5 mr-2 text-primary" />
                        {userType === "founders"
                          ? "Startup Insights"
                          : userType === "incubators"
                          ? "Investment Insights"
                          : "Innovation Insights"}
                      </CardTitle>
                      <CardDescription>
                        {userType === "founders"
                          ? "Tailored advice for your startup journey"
                          : userType === "incubators"
                          ? "Market trends and portfolio guidance"
                          : "R&D best practices and emerging technologies"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {userType === "founders" && (
                        <>
                          <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <h4 className="font-medium text-blue-800">
                              MVP Validation Tip
                            </h4>
                            <p className="text-sm text-blue-700 mt-1">
                              Based on your {config.industry} focus, consider
                              implementing user interviews before development
                            </p>
                          </div>
                          <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <h4 className="font-medium text-green-800">
                              Market Opportunity
                            </h4>
                            <p className="text-sm text-green-700 mt-1">
                              {config.industry} market shows strong growth
                              potential - good timing for your MVP launch
                            </p>
                          </div>
                        </>
                      )}

                      {userType === "incubators" && (
                        <>
                          <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
                            <h4 className="font-medium text-purple-800">
                              Portfolio Diversification
                            </h4>
                            <p className="text-sm text-purple-700 mt-1">
                              Consider expanding into AI/ML startups - strong
                              performance in current market
                            </p>
                          </div>
                          <div className="p-3 bg-orange-50 rounded-lg border-l-4 border-orange-400">
                            <h4 className="font-medium text-orange-800">
                              Due Diligence Alert
                            </h4>
                            <p className="text-sm text-orange-700 mt-1">
                              New regulatory changes in{" "}
                              fintech{" "}
                              sector require updated evaluation criteria
                            </p>
                          </div>
                        </>
                      )}

                      {userType === "enterprise" && (
                        <>
                          <div className="p-3 bg-indigo-50 rounded-lg border-l-4 border-indigo-400">
                            <h4 className="font-medium text-indigo-800">
                              Innovation Framework
                            </h4>
                            <p className="text-sm text-indigo-700 mt-1">
                              Implement lean startup methodology for faster R&D
                              cycles and reduced risk
                            </p>
                          </div>
                          <div className="p-3 bg-teal-50 rounded-lg border-l-4 border-teal-400">
                            <h4 className="font-medium text-teal-800">
                              Technology Trends
                            </h4>
                            <p className="text-sm text-teal-700 mt-1">
                              Emerging tech stack recommendations for your{" "}
                              innovation{" "}
                              initiatives
                            </p>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recommended Resources */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Trophy className="h-5 w-5 mr-2 text-primary" />
                        Recommended Resources
                      </CardTitle>
                      <CardDescription>
                        Curated content based on your profile and goals
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {userType === "founders" ? (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                                <Rocket className="h-5 w-5 text-yellow-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  MVP Development Guide
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Step-by-step startup methodology
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/portfolio"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                <Target className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  {config.industry} Success Stories
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Learn from similar startups
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : userType === "incubators" ? (
                        <>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                <BarChart3 className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  Investment Analysis Tools
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Portfolio management resources
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                                <Globe className="h-5 w-5 text-green-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  Market Intelligence Report
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Industry trends and forecasts
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                                <Zap className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  Enterprise Innovation Framework
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Systematic R&D methodology
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                                <TrendingUp className="h-5 w-5 text-teal-600" />
                              </div>
                              <div>
                                <h4 className="font-medium">
                                  Technology Roadmap
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Emerging tech for enterprise
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      )}

                      <Button variant="outline" className="w-full mt-3">
                        <Plus className="h-4 w-4 mr-2" />
                        View All Resources
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Process Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-primary" />
                      {userType === "founders"
                        ? "Your MVP Journey"
                        : userType === "incubators"
                        ? "Investment Process"
                        : "R&D Development Process"}
                    </CardTitle>
                    <CardDescription>
                      Overall progress: {Math.round(overallProgress)}% complete
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Progress value={overallProgress} className="mb-6" />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {config.processSteps.map((step, index) => (
                        <div key={index} className="text-center">
                          <div
                            className={`h-12 w-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : step.status === "in-progress"
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <step.icon className="h-6 w-6" />
                          </div>
                          <h4 className="font-medium text-sm">{step.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {step.progress}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "projects" && (
              <div className="space-y-6">
                {/* Project Statistics */}
                {stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Projects</p>
                            <p className="text-2xl font-bold">{stats.totalProjects}</p>
                          </div>
                          <Rocket className="h-8 w-8 text-primary" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Active Projects</p>
                            <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
                          </div>
                          <Target className="h-8 w-8 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Completed</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.completedProjects}</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-purple-600" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">Avg Progress</p>
                            <p className="text-2xl font-bold text-blue-600">{Math.round(stats.averageProgress)}%</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-blue-600" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Projects Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {userType === "founders"
                        ? "Your Startup Projects"
                        : userType === "incubators"
                        ? "Portfolio Companies"
                        : "R&D Initiatives"}
                    </h2>
                    <p className="text-muted-foreground">
                      {userType === "founders"
                        ? "Track your MVP development projects"
                        : userType === "incubators"
                        ? "Monitor your portfolio investments"
                        : "Manage innovation projects"}
                    </p>
                  </div>
                  <Button onClick={() => setIsNewProjectModalOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    {userType === "founders"
                      ? "New Project"
                      : userType === "incubators"
                      ? "Add Company"
                      : "New Initiative"}
                  </Button>
                </div>

                {/* Projects Grid */}
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading projects...</p>
                    </div>
                  </div>
                ) : projects.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <ProjectCard
                        key={project._id}
                        project={project}
                        onEdit={(project) => {
                          setSelectedProject(project);
                          setIsEditProjectOpen(true);
                        }}
                        onView={(project) => {
                          setSelectedProject(project);
                          setIsProjectDetailsOpen(true);
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Rocket className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            {userType === "founders"
                              ? "No projects yet"
                              : userType === "incubators"
                              ? "No portfolio companies"
                              : "No initiatives"}
                          </h3>
                          <p className="text-muted-foreground mt-1">
                            {userType === "founders"
                              ? "Start your first MVP project to begin your journey"
                              : userType === "incubators"
                              ? "Add your first portfolio company to track investments"
                              : "Launch your first innovation project"}
                          </p>
                        </div>
                        <Button onClick={() => setIsNewProjectModalOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          {userType === "founders"
                            ? "Create First Project"
                            : userType === "incubators"
                            ? "Add First Company"
                            : "Start First Initiative"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === "journey" && (
              <UserProjectJourney />
            )}

            {activeTab === "milestones" && (
              <UserMilestoneViewer />
            )}

            {activeTab === "learn" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {userType === "founders"
                          ? "Startup Resources"
                          : userType === "incubators"
                          ? "Market Intelligence"
                          : "Innovation Resources"}
                      </CardTitle>
                      <CardDescription>
                        {userType === "founders"
                          ? "Essential knowledge for founders"
                          : userType === "incubators"
                          ? "Market trends and insights"
                          : "Innovation frameworks and tools"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {userType === "founders" ? (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Lightbulb className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">Startup Guide</h4>
                                <p className="text-sm text-muted-foreground">
                                  Learn from expert insights
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Code className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Development Resources
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Technical guides and tutorials
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/about"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Target className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Business Strategy
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Growth and scaling advice
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : userType === "incubators" ? (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <BarChart3 className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">Market Analysis</h4>
                                <p className="text-sm text-muted-foreground">
                                  Industry trends and data
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Briefcase className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Due Diligence Tools
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Portfolio evaluation resources
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/portfolio"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Success Case Studies
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Portfolio company outcomes
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Innovation Framework
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Enterprise R&D methodology
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Enterprise Solutions
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Custom R&D partnerships
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/about"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Technology Roadmap
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Emerging tech strategies
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Support & Contact</CardTitle>
                      <CardDescription>
                        Get help when you need it
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link
                        to="/getmvp/contact"
                        className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <h4 className="font-medium">Contact Our Team</h4>
                        <p className="text-sm text-muted-foreground">
                          Reach out for project discussions
                        </p>
                      </Link>
                      <div className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Quick Request</h4>
                        </div>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleQuickSupport("call")}
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Book Consultation
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full justify-start"
                            onClick={() => handleQuickSupport("email")}
                          >
                            <Code className="h-4 w-4 mr-2" />
                            Technical Review
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "milestones" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {userType === "founders"
                        ? "6-Step MVP Process"
                        : userType === "incubators"
                        ? "Investment Process"
                        : "R&D Development Process"}
                    </CardTitle>
                    <CardDescription>
                      {userType === "founders"
                        ? "Our proven methodology from idea to successful product"
                        : userType === "incubators"
                        ? "Systematic approach to portfolio management"
                        : "Enterprise innovation development workflow"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {config.processSteps.map((step, index) => (
                        <div key={index} className="flex items-start space-x-4">
                          <div
                            className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                              step.status === "completed"
                                ? "bg-green-100 text-green-600"
                                : step.status === "in-progress"
                                ? "bg-primary/10 text-primary"
                                : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            <step.icon className="h-6 w-6" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-semibold">{step.title}</h3>
                              <Badge
                                variant={
                                  step.status === "completed"
                                    ? "default"
                                    : step.status === "in-progress"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {step.status}
                              </Badge>
                            </div>
                            <Progress value={step.progress} className="mb-2" />
                            <p className="text-sm text-muted-foreground">
                              {step.progress}% complete
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "timeline" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Timeline</CardTitle>
                    <CardDescription>
                      View your project milestones and deadlines
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Timeline view coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "documents" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Documents</CardTitle>
                    <CardDescription>
                      Manage project documentation and files
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Document management coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "team" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team</CardTitle>
                    <CardDescription>
                      Collaborate with your team members
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Team management coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "analytics" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics</CardTitle>
                    <CardDescription>
                      Track your project performance and metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Analytics dashboard coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Notifications</CardTitle>
                    <CardDescription>
                      Stay updated with your project progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Notifications center coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                    <CardDescription>
                      Manage your account and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Settings panel coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "help" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Help & Support</CardTitle>
                    <CardDescription>
                      Get assistance and find answers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                      Help center coming soon!
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === "services" && (
              <div className="space-y-6">
                {/* My Purchased Services */}
                <PurchasedServices showTitle={true} showStats={true} />

                {/* Available Services */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        {userType === "founders"
                          ? "Learning Resources"
                          : userType === "incubators"
                          ? "Market Intelligence"
                          : "Innovation Resources"}
                      </CardTitle>
                      <CardDescription>
                        {userType === "founders"
                          ? "Educational content to accelerate your startup"
                          : userType === "incubators"
                          ? "Market data and investment insights"
                          : "R&D frameworks and technology trends"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {userType === "founders" ? (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Rocket className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Startup Methodology
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Proven frameworks for MVP success
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/about"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Target className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Validation Framework
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Learn our 6-step process
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Code className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Development Services
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Full-stack MVP solutions
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : userType === "incubators" ? (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <BarChart3 className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Investment Trends
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Market analysis and forecasts
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Briefcase className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Due Diligence Tools
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Portfolio evaluation resources
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/portfolio"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Trophy className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Success Case Studies
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Portfolio company outcomes
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/getmvp/blog"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Zap className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Innovation Framework
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Enterprise R&D methodology
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/services"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <Building2 className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Enterprise Solutions
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Custom R&D partnerships
                                </p>
                              </div>
                            </div>
                          </Link>
                          <Link
                            to="/getmvp/about"
                            className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                          >
                            <div className="flex items-center">
                              <TrendingUp className="h-5 w-5 mr-3 text-primary" />
                              <div>
                                <h4 className="font-medium">
                                  Technology Roadmap
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  Emerging tech strategies
                                </p>
                              </div>
                            </div>
                          </Link>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Support & Contact</CardTitle>
                      <CardDescription>
                        Get help when you need it
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link
                        to="/getmvp/contact"
                        className="block p-3 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <h4 className="font-medium">Contact Our Team</h4>
                        <p className="text-sm text-muted-foreground">
                          Reach out for project discussions
                        </p>
                      </Link>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Live Chat Support</h4>
                        <p className="text-sm text-muted-foreground">
                          Available Mon-Fri, 9 AM - 6 PM
                        </p>
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={() => handleQuickSupport("chat")}
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Start Chat
                        </Button>
                      </div>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">Schedule a Call</h4>
                        <p className="text-sm text-muted-foreground">
                          Book a consultation with our experts
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="mt-2"
                          onClick={() => handleQuickSupport("call")}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Call
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Project Modal */}
        <NewProjectModalV2
          isOpen={isNewProjectModalOpen}
          onClose={() => setIsNewProjectModalOpen(false)}
          userType={userType}
          onProjectCreated={loadDashboardData}
        />

        {/* Project Details Modal */}
        <ProjectDetailsModal
          project={selectedProject}
          isOpen={isProjectDetailsOpen}
          onClose={() => {
            setIsProjectDetailsOpen(false);
            setSelectedProject(null);
          }}
          onEdit={(project) => {
            setSelectedProject(project);
            setIsEditProjectOpen(true);
          }}
        />

        {/* Edit Project Modal */}
        <EditProjectModal
          project={selectedProject}
          isOpen={isEditProjectOpen}
          onClose={() => {
            setIsEditProjectOpen(false);
            setSelectedProject(null);
          }}
        />
      </div>
    </PurchasedServicesProvider>
  );
};

export default Dashboard;
