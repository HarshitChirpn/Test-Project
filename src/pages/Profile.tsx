import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { userService, type UserProfile } from "@/services/userService";
import { ProfileEditDialog } from "@/components/ui/profile-edit-dialog";
import {
  User,
  Mail,
  MapPin,
  Calendar,
  Settings,
  ChevronLeft,
  Camera,
  Edit3,
  Check,
  CheckCircle2,
  Circle,
  Star,
  Award,
  Target,
  TrendingUp,
  Clock,
  Globe,
  Shield,
  Briefcase,
  Users,
} from "lucide-react";
import Footer from "@/components/Footer";

interface ProfileCompletionItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  action: string;
  points: number;
}

const Profile = () => {
  const { user, loading: authLoading, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Activity Overview data
  const [activityData, setActivityData] = useState({
    totalProjects: 0,
    completedProjects: 0,
    daysActive: 0,
    totalServices: 0
  });
  const [activityLoading, setActivityLoading] = useState(true);

  // Profile completion tracking
  const [completionItems, setCompletionItems] = useState<
    ProfileCompletionItem[]
  >([
    {
      id: "profile_photo",
      title: "Add profile photo",
      description: "Upload a professional photo to help others recognize you",
      completed: false,
      action: "Upload photo",
      points: 10,
    },
    {
      id: "display_name",
      title: "Set display name",
      description: "Choose how you want to be known on the platform",
      completed: false,
      action: "Add name",
      points: 5,
    },
    {
      id: "bio",
      title: "Write your bio",
      description: "Tell others about yourself and what you do",
      completed: false,
      action: "Add bio",
      points: 15,
    },
    {
      id: "location",
      title: "Add your location",
      description: "Let others know where you're based",
      completed: false,
      action: "Add location",
      points: 5,
    },
    {
      id: "preferences",
      title: "Set communication preferences",
      description: "Choose how you want to be contacted",
      completed: false,
      action: "Set preferences",
      points: 10,
    },
  ]);

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadActivityData();
    } else if (!authLoading) {
      // Only redirect if we're not still loading the auth state
      navigate("/getmvp/login");
    }
  }, [user, authLoading, navigate]);

  const loadUserProfile = async () => {
    if (!user?._id) return;

    setLoading(true);
    try {
      // Use the current user data from AuthContext instead of making an API call
      // This avoids the admin access requirement
      const profile: UserProfile = {
        uid: user._id,
        email: user.email,
        displayName: user.displayName || user.name,
        photoURL: user.photoURL,
        bio: user.bio,
        linkedin: user.linkedin,
        website: user.website,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        emailNotifications: user.emailNotifications,
        marketingEmails: user.marketingEmails,
        projectUpdates: user.projectUpdates,
        securityAlerts: user.securityAlerts,
        darkMode: user.darkMode
      };
      
      setUserProfile(profile);
      setDisplayName(profile.displayName || "");
      setBio(profile.bio || "");
      // Update completion status based on profile data
      updateCompletionStatus(profile);
    } catch (error) {
      console.error("Error loading user profile:", error);
      toast({
        title: "Loading failed ❌",
        description: "Could not load your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadActivityData = async () => {
    if (!user?._id) return;

    setActivityLoading(true);
    try {
      // Fetch user projects
      const projectsResponse = await fetch(`http://localhost:5000/api/projects/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let totalProjects = 0;
      let completedProjects = 0;
      
      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        if (projectsData.success && projectsData.data) {
          totalProjects = projectsData.data.length;
          completedProjects = projectsData.data.filter((project: any) => 
            project.status === 'completed' || project.progress === 100
          ).length;
        }
      }

      // Fetch user services
      const servicesResponse = await fetch(`http://localhost:5000/api/services/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      let totalServices = 0;
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        if (servicesData.success && servicesData.data) {
          totalServices = servicesData.data.length;
        }
      }

      // Calculate days active
      const daysActive = user.createdAt
        ? Math.ceil(
            (new Date().getTime() - new Date(user.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 0;

      setActivityData({
        totalProjects,
        completedProjects,
        daysActive,
        totalServices
      });
    } catch (error) {
      console.error("Error loading activity data:", error);
      // Set default values on error
      setActivityData({
        totalProjects: 0,
        completedProjects: 0,
        daysActive: user.createdAt
          ? Math.ceil(
              (new Date().getTime() - new Date(user.createdAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          : 0,
        totalServices: 0
      });
    } finally {
      setActivityLoading(false);
    }
  };

  const updateCompletionStatus = (profile: UserProfile) => {
    setCompletionItems((prev) =>
      prev.map((item) => {
        switch (item.id) {
          case "profile_photo":
            return {
              ...item,
              completed: !!(profile.photoURL || user?.photoURL),
            };
          case "display_name":
            return { ...item, completed: !!profile.displayName };
          case "bio":
            return {
              ...item,
              completed: !!(profile.bio && profile.bio.length > 10),
            };
          case "location":
            return { ...item, completed: false }; // Assuming location isn't in current profile
          case "preferences":
            return {
              ...item,
              completed: profile.emailNotifications !== undefined,
            };
          default:
            return item;
        }
      })
    );
  };

  if (!user) {
    return null;
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{authLoading ? 'Authenticating...' : 'Loading your profile...'}</p>
        </div>
      </div>
    );
  }

  const completionPercentage = Math.round(
    (completionItems.filter((item) => item.completed).length /
      completionItems.length) *
      100
  );
  const totalPoints = completionItems.reduce(
    (sum, item) => sum + (item.completed ? item.points : 0),
    0
  );
  const maxPoints = completionItems.reduce((sum, item) => sum + item.points, 0);

  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      })
    : "Recently";

  // Check if user was created through Google (for Firebase-migrated users)
  const isGoogleUser = user.providerData?.some(
    (provider) => provider.providerId === "google.com"
  ) || false;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/getmvp")}
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-brand-yellow" />
                <h1 className="text-xl font-semibold text-gray-900">
                  My Profile
                </h1>
              </div>
            </div>
            <Button
              onClick={() => navigate("/getmvp/settings")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-brand-yellow hover:text-brand-black hover:shadow-lg transition-all duration-300"
            >
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Header Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Profile Picture */}
                  <div className="relative flex-shrink-0">
                    <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                      <AvatarImage
                        src={userProfile?.photoURL || user.photoURL || ""}
                      />
                      <AvatarFallback className="bg-brand-yellow text-brand-black text-2xl font-bold">
                        {displayName.charAt(0).toUpperCase() ||
                          user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <ProfileEditDialog
                      defaultValues={{
                        firstName: displayName.split(" ")[0] || "",
                        lastName:
                          displayName.split(" ").slice(1).join(" ") || "",
                        username:
                          displayName.toLowerCase().replace(/\s+/g, "-") || "",
                        website: "",
                        bio: bio || "",
                        profileImage:
                          userProfile?.photoURL || user.photoURL || "",
                      }}
                      onSave={async (values) => {
                        if (!user?._id) return;

                        try {
                          await userService.updateUserProfile(user._id, {
                            name: `${values.firstName} ${values.lastName}`.trim(),
                            displayName: `${values.firstName} ${values.lastName}`.trim(),
                            bio: values.bio,
                            website: values.website,
                            linkedin: values.linkedin,
                          });

                          // Update user data in AuthContext
                          await updateUser();
                          
                          // Refresh profile data
                          await loadUserProfile();

                          toast({
                            title: "Profile updated! ✅",
                            description:
                              "Your profile has been saved successfully.",
                          });
                        } catch (error) {
                          console.error("Error updating profile:", error);
                          toast({
                            title: "Update failed ❌",
                            description:
                              "There was an error updating your profile. Please try again.",
                            variant: "destructive",
                          });
                        }
                      }}
                      onUploadSuccess={async () => {
                        console.log('🔄 onUploadSuccess callback triggered');
                        // Update user data in AuthContext when profile picture is uploaded
                        console.log('🔄 Calling updateUser...');
                        await updateUser();
                        console.log('✅ updateUser completed');
                        // Refresh profile data
                        console.log('🔄 Calling loadUserProfile...');
                        await loadUserProfile();
                        console.log('✅ loadUserProfile completed');
                        // Refresh activity data
                        console.log('🔄 Calling loadActivityData...');
                        await loadActivityData();
                        console.log('✅ loadActivityData completed');
                        
                        // Force a small delay and then refresh again to ensure the image is loaded
                        setTimeout(async () => {
                          console.log('🔄 Final refresh after delay...');
                          await updateUser();
                          await loadUserProfile();
                        }, 1000);
                      }}
                    >
                      <Button
                        size="sm"
                        className="absolute -bottom-2 -right-2 rounded-full w-10 h-10 p-0 bg-brand-yellow hover:bg-yellow-600 text-brand-black shadow-lg"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </ProfileEditDialog>
                  </div>

                  {/* Profile Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900 truncate">
                          {displayName || "Welcome!"}
                        </h2>
                        <p className="text-gray-600 mt-1">{user.email}</p>

                        {/* User badges */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {isGoogleUser && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-100 text-blue-800"
                            >
                              <Globe className="w-3 h-3 mr-1" />
                              Google Account
                            </Badge>
                          )}
                          {user.emailVerified && (
                            <Badge className="bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                          <Badge
                            variant="outline"
                            className="border-brand-yellow text-brand-yellow"
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Joined {joinedDate}
                          </Badge>
                        </div>
                      </div>

                      <ProfileEditDialog
                        defaultValues={{
                          firstName: displayName.split(" ")[0] || "",
                          lastName:
                            displayName.split(" ").slice(1).join(" ") || "",
                          username:
                            displayName.toLowerCase().replace(/\s+/g, "-") ||
                            "",
                          website: "",
                          bio: bio || "",
                          profileImage:
                            userProfile?.photoURL || user.photoURL || "",
                        }}
                        onSave={async (values) => {
                          if (!user?._id) return;

                          try {
                            await userService.updateUserProfile(user._id, {
                              name: `${values.firstName} ${values.lastName}`.trim(),
                              displayName: `${values.firstName} ${values.lastName}`.trim(),
                              bio: values.bio,
                              website: values.website,
                              linkedin: values.linkedin,
                            });

                            // Update user data in AuthContext
                            await updateUser();
                            
                            // Refresh profile data
                            await loadUserProfile();

                            toast({
                              title: "Profile updated! ✅",
                              description:
                                "Your profile has been saved successfully.",
                            });
                          } catch (error) {
                            console.error("Error updating profile:", error);
                            toast({
                              title: "Update failed ❌",
                              description:
                                "There was an error updating your profile. Please try again.",
                              variant: "destructive",
                            });
                          }
                        }}
                        onUploadSuccess={async () => {
                          // Update user data in AuthContext when profile picture is uploaded
                          await updateUser();
                          // Refresh profile data
                          await loadUserProfile();
                          // Refresh activity data
                          await loadActivityData();
                        }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Edit Profile
                        </Button>
                      </ProfileEditDialog>
                    </div>

                    {/* Bio Section */}
                    <div className="mt-4">
                      {bio ? (
                        <p className="text-gray-700 leading-relaxed">{bio}</p>
                      ) : (
                        <p className="text-gray-500 italic">
                          Add a bio to tell others about yourself and what
                          you're looking to accomplish.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-brand-yellow" />
                  Activity Overview
                </CardTitle>
                <CardDescription>
                  Your recent activity on the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {activityLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow"></div>
                    <span className="ml-2 text-gray-600">Loading activity data...</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{activityData.totalProjects}</div>
                      <div className="text-sm text-blue-700 mt-1">Projects</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{activityData.completedProjects}</div>
                      <div className="text-sm text-green-700 mt-1">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                      <div className="text-2xl font-bold text-purple-600">{activityData.daysActive}</div>
                      <div className="text-sm text-purple-700 mt-1">Days Active</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-brand-yellow/20 rounded-lg border border-brand-yellow/30">
                      <div className="text-2xl font-bold text-brand-yellow">{activityData.totalServices}</div>
                      <div className="text-sm text-yellow-800 mt-1">Services</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-brand-yellow" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Your latest actions and milestones
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-10 h-10 bg-brand-yellow rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-brand-black" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        Account Created
                      </p>
                      <p className="text-xs text-gray-500">
                        Welcome to Idea2MVP! Your journey starts here.
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {user.createdAt
                        ? new Date(
                            user.createdAt
                          ).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })
                        : "Recently"}
                    </div>
                  </div>

                  {user.emailVerified && (
                    <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Shield className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-green-900">
                          Email Verified
                        </p>
                        <p className="text-xs text-green-600">
                          Your account is now secure and verified.
                        </p>
                      </div>
                      <div className="text-xs text-green-400">Verified</div>
                    </div>
                  )}

                  {completionPercentage > 50 && (
                    <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          Profile Progress
                        </p>
                        <p className="text-xs text-blue-600">
                          Great job! Your profile is {completionPercentage}%
                          complete.
                        </p>
                      </div>
                      <div className="text-xs text-blue-400">
                        {completionPercentage}%
                      </div>
                    </div>
                  )}

                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <Briefcase className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      Ready to start your first project?
                    </p>
                    <Button
                      onClick={() => navigate("/getmvp")}
                      className="bg-brand-yellow hover:bg-yellow-600 text-brand-black"
                    >
                      Start Building
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Profile Completion */}
          <div className="space-y-6">
            {/* Profile Completion Card */}
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-brand-yellow" />
                  Profile Progress
                </CardTitle>
                <CardDescription>
                  Complete your profile to unlock all features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Overview */}
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-20 h-20 mb-3">
                    <svg
                      className="w-20 h-20 transform -rotate-90"
                      viewBox="0 0 100 100"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        className="text-gray-200"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        className="text-brand-yellow"
                        style={{
                          strokeDasharray: `${2 * Math.PI * 40}`,
                          strokeDashoffset: `${
                            2 * Math.PI * 40 * (1 - completionPercentage / 100)
                          }`,
                        }}
                      />
                    </svg>
                    <span className="absolute text-lg font-bold text-gray-900">
                      {completionPercentage}%
                    </span>
                  </div>

                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {totalPoints}/{maxPoints} points
                    </div>
                    <div className="text-sm text-gray-600">
                      Profile completion score
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Completion Checklist */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Complete your profile
                  </h4>
                  {completionItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      {item.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-sm text-gray-900">
                            {item.title}
                          </h5>
                          <Badge variant="secondary" className="text-xs">
                            +{item.points}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">
                          {item.description}
                        </p>
                        {!item.completed && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-brand-yellow hover:text-yellow-600 p-0 h-auto mt-2 text-xs"
                            onClick={() => {
                              if (item.id === "preferences") {
                                navigate("/getmvp/settings");
                              }
                            }}
                          >
                            {item.action} →
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {completionPercentage === 100 && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm font-medium text-green-800">
                      Profile Complete!
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      You've unlocked all features
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-brand-yellow" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full justify-start bg-brand-yellow hover:bg-yellow-600 text-brand-black"
                  onClick={() => navigate("/getmvp")}
                >
                  <Target className="w-4 h-4 mr-2" />
                  Start New Project
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start hover:bg-brand-yellow hover:text-brand-black hover:shadow-lg transition-all duration-300"
                  onClick={() => navigate("/getmvp/settings")}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Account Settings
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-gray-600 hover:text-gray-900"
                  onClick={() => navigate("/getmvp/contact")}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* Achievement Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-yellow" />
                  Achievements
                </CardTitle>
                <CardDescription>Milestones you've reached</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center p-3 bg-gradient-to-br from-yellow-50 to-brand-yellow/10 rounded-lg border border-brand-yellow/20">
                    <div className="w-8 h-8 mx-auto mb-2 bg-brand-yellow rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-brand-black" />
                    </div>
                    <p className="text-xs font-medium text-yellow-800">
                      New Member
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      Welcome aboard!
                    </p>
                  </div>

                  {user.emailVerified && (
                    <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                      <div className="w-8 h-8 mx-auto mb-2 bg-green-500 rounded-full flex items-center justify-center">
                        <Shield className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-medium text-green-800">
                        Verified
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Account secured
                      </p>
                    </div>
                  )}

                  {completionPercentage >= 75 && (
                    <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                      <div className="w-8 h-8 mx-auto mb-2 bg-blue-500 rounded-full flex items-center justify-center">
                        <Star className="w-4 h-4 text-white" />
                      </div>
                      <p className="text-xs font-medium text-blue-800">
                        Complete
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Profile done!
                      </p>
                    </div>
                  )}

                  {user.createdAt &&
                    Math.ceil(
                      (new Date().getTime() -
                        new Date(user.createdAt).getTime()) /
                        (1000 * 60 * 60 * 24)
                    ) >= 7 && (
                      <div className="text-center p-3 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="w-8 h-8 mx-auto mb-2 bg-purple-500 rounded-full flex items-center justify-center">
                          <Clock className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-xs font-medium text-purple-800">
                          Active
                        </p>
                        <p className="text-xs text-purple-600 mt-1">
                          Week strong!
                        </p>
                      </div>
                    )}
                </div>

                {/* Achievement Progress */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-xs text-gray-500 mb-2">
                    Next Achievement
                  </div>
                  {!user.emailVerified ? (
                    <div className="text-xs text-gray-600">
                      🔒 Verify your email to unlock the "Verified" badge
                    </div>
                  ) : completionPercentage < 75 ? (
                    <div className="text-xs text-gray-600">
                      ⭐ Complete {Math.ceil((75 - completionPercentage) / 25)}{" "}
                      more profile items to earn "Complete" badge
                    </div>
                  ) : (
                    <div className="text-xs text-gray-600">
                      🚀 Start your first project to unlock "Builder" badge
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
