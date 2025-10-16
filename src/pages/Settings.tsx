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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { userService } from "@/services/userService";
import { ProfileEditDialog } from "@/components/ui/profile-edit-dialog";
import {
  User,
  Mail,
  Shield,
  Bell,
  Palette,
  Download,
  Trash2,
  Settings as SettingsIcon,
  ChevronLeft,
  Camera,
  Eye,
  EyeOff,
  Lock,
  Smartphone,
  Globe,
  HelpCircle,
  FileText,
  LogOut,
  Save,
  Edit3,
  Check,
  X,
} from "lucide-react";
import Footer from "@/components/Footer";

const Settings = () => {
  const { user, signOut, resetPassword, updateUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Profile state
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");

  // Account state
  const [currentEmail, setCurrentEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  // Preferences state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [projectUpdates, setProjectUpdates] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // Data export state
  const [exportLoading, setExportLoading] = useState(false);

  // Loading states
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Tab state for sidebar navigation
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user) {
      setCurrentEmail(user.email || "");
      setDisplayName(user.displayName || "");
      // Load user preferences from Firestore
      loadUserPreferences();
    } else {
      navigate("/getmvp");
    }
  }, [user, navigate]);

  const loadUserPreferences = async () => {
    if (!user?._id) return;

    setSettingsLoading(true);
    try {
      const userProfile = await userService.getUserProfile(user._id);
      if (userProfile) {
        setDisplayName(userProfile.displayName || user.displayName || "");
        setBio(userProfile.bio || "");
        // Load notification preferences
        setEmailNotifications(
          userProfile.emailNotifications !== undefined
            ? userProfile.emailNotifications
            : true
        );
        setMarketingEmails(userProfile.marketingEmails || false);
        setProjectUpdates(
          userProfile.projectUpdates !== undefined
            ? userProfile.projectUpdates
            : true
        );
        setSecurityAlerts(
          userProfile.securityAlerts !== undefined
            ? userProfile.securityAlerts
            : true
        );
        // Load appearance preferences
        setDarkMode(userProfile.darkMode || false);
      }
    } catch (error) {
      console.error("Error loading user preferences:", error);
      toast({
        title: "Loading failed ❌",
        description: "Could not load your preferences. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setSettingsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!currentEmail) return;

    try {
      const { error } = await resetPassword(currentEmail);
      if (error) {
        toast({
          title: "Reset failed ❌",
          description: error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset email sent! 📧",
          description: "Check your email for password reset instructions.",
        });
        setShowPasswordReset(false);
      }
    } catch (error) {
      toast({
        title: "Reset failed ❌",
        description: "There was an error sending the reset email.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationChange = async (key: string, value: boolean) => {
    if (!user?._id) return;

    try {
      await userService.updateUserProfile(user._id, {
        [key]: value,
      });

      // Update user data in AuthContext for real-time updates
      await updateUser();

      toast({
        title: "Preference updated! ✅",
        description: "Your notification settings have been saved.",
      });
    } catch (error) {
      console.error("Error updating notification preference:", error);
      toast({
        title: "Update failed ❌",
        description: "Could not save your preference. Please try again.",
        variant: "destructive",
      });
      // Revert the change
      switch (key) {
        case "emailNotifications":
          setEmailNotifications(!value);
          break;
        case "marketingEmails":
          setMarketingEmails(!value);
          break;
        case "projectUpdates":
          setProjectUpdates(!value);
          break;
        case "securityAlerts":
          setSecurityAlerts(!value);
          break;
      }
    }
  };

  const handleThemeChange = async (isDark: boolean) => {
    if (!user?._id) return;

    try {
      await userService.updateUserProfile(user._id, {
        darkMode: isDark,
      });

      // Update user data in AuthContext for real-time updates
      await updateUser();

      setDarkMode(isDark);

      toast({
        title: "Theme updated! 🎨",
        description: `Switched to ${isDark ? "dark" : "light"} mode.`,
      });
    } catch (error) {
      console.error("Error updating theme:", error);
      toast({
        title: "Theme update failed ❌",
        description: "Could not save your theme preference.",
        variant: "destructive",
      });
      setDarkMode(!isDark); // Revert
    }
  };

  const handleDataExport = async () => {
    if (!user?._id) return;

    setExportLoading(true);
    try {
      // Get all user data from different collections
      const userProfile = await userService.getUserProfile(user._id);

      // Prepare export data
      const exportData = {
        profile: userProfile,
        preferences: {
          emailNotifications,
          marketingEmails,
          projectUpdates,
          securityAlerts,
          darkMode,
        },
        exportDate: new Date().toISOString(),
        account: {
          email: user.email,
          createdAt: user.createdAt,
          lastSignIn: user.lastLoginAt,
          emailVerified: user.emailVerified,
        },
      };

      // Create and download JSON file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `idea2mvp-data-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Data exported! 📊",
        description: "Your data has been downloaded as a JSON file.",
      });
    } catch (error) {
      console.error("Error exporting data:", error);
      toast({
        title: "Export failed ❌",
        description: "There was an error exporting your data.",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user?._id) return;

    try {
      // Create a deletion request document in Firestore
      await userService.createAccountDeletionRequest(user._id, {
        email: user.email || "",
        requestDate: new Date().toISOString(),
        userData: {
          _id: user._id,
          displayName: user.displayName,
          createdAt: user.createdAt,
          lastSignIn: user.lastLoginAt,
        },
      });

      toast({
        title: "Account deletion requested 🗑️",
        description:
          "Your account deletion request has been submitted. You'll receive a confirmation email within 24 hours. You can continue using your account until then.",
      });
    } catch (error) {
      console.error("Error creating deletion request:", error);
      toast({
        title: "Deletion failed ❌",
        description:
          "There was an error processing your deletion request. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/getmvp");
    } catch (error) {
      toast({
        title: "Sign out failed ❌",
        description: "There was an error signing out.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return null;
  }

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
                onClick={() => navigate("/getmvp")}
                size="sm"
                className="text-gray-600 hover:text-brand-black mb-2 border-gray-300 hover:bg-brand-yellow hover:shadow-lg transition-all duration-300"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <div className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-brand-yellow" />
                <h1 className="text-xl font-semibold text-gray-900">
                  Settings
                </h1>
              </div>
            </div>
            {/* <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:border-red-300 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button> */}
            <Button
              variant="outline"
              onClick={handleSignOut}
              size="sm"
              className="text-gray-600 hover:text-brand-black mb-2 border-gray-300 hover:bg-brand-yellow hover:shadow-lg transition-all duration-300"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-x-hidden">
        {settingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your settings...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Settings Navigation - Modern Card-based Approach */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
              {/* Quick Settings Overview - Hidden on mobile */}
              <div className="lg:col-span-2 hidden lg:block">
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>
                      Manage your account and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <nav className="space-y-1">
                      {[
                        {
                          id: "profile",
                          label: "Personal Info",
                          icon: User,
                          description: "Name, photo, bio",
                        },
                        {
                          id: "account",
                          label: "Account Security",
                          icon: Shield,
                          description: "Password, email",
                        },
                        {
                          id: "notifications",
                          label: "Notifications",
                          icon: Bell,
                          description: "Email preferences",
                        },
                        {
                          id: "appearance",
                          label: "Appearance",
                          icon: Palette,
                          description: "Theme, colors",
                        },
                        {
                          id: "privacy",
                          label: "Privacy & Data",
                          icon: Lock,
                          description: "Export, delete",
                        },
                        {
                          id: "about",
                          label: "Help & Support",
                          icon: HelpCircle,
                          description: "Contact, terms",
                        },
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full text-left p-3 rounded-lg transition-colors group ${
                            activeTab === item.id
                              ? "bg-brand-yellow/10 border border-brand-yellow/20"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <item.icon
                              className={`w-4 h-4 ${
                                activeTab === item.id
                                  ? "text-brand-yellow"
                                  : "text-gray-400 group-hover:text-brand-yellow"
                              }`}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900">
                                {item.label}
                              </div>
                              <div className="text-xs text-gray-500">
                                {item.description}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </nav>
                  </CardContent>
                </Card>
              </div>

              {/* Settings Content */}
              <div className="lg:col-span-3 space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="space-y-6"
                  id="settings-tabs"
                >
                  {/* Simplified Mobile Tabs - Hidden on Desktop */}
                  <div className="lg:hidden">
                    <TabsList className="grid w-full grid-cols-6 h-auto p-1 bg-gray-100 text-xs">
                      <TabsTrigger
                        value="profile"
                        className="flex flex-col items-center gap-1 px-2 py-2"
                      >
                        <User className="w-4 h-4" />
                        <span className="text-xs">Profile</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="account"
                        className="flex flex-col items-center gap-1 px-2 py-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span className="text-xs">Security</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="notifications"
                        className="flex flex-col items-center gap-1 px-2 py-2"
                      >
                        <Bell className="w-4 h-4" />
                        <span className="text-xs">Notify</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="appearance"
                        className="flex flex-col items-center gap-1 px-2 py-2"
                      >
                        <Palette className="w-4 h-4" />
                        <span className="text-xs">Theme</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="privacy"
                        className="flex flex-col items-center gap-1 px-2 py-2"
                      >
                        <Lock className="w-4 h-4" />
                        <span className="text-xs">Privacy</span>
                      </TabsTrigger>
                      <TabsTrigger
                        value="about"
                        className="flex flex-col items-center gap-1 px-2 py-2"
                      >
                        <HelpCircle className="w-4 h-4" />
                        <span className="text-xs">Help</span>
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Profile Tab */}
                  <TabsContent value="profile" className="space-y-6">
                    <Card id="section-profile">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <User className="w-5 h-5 text-brand-yellow" />
                          Profile Information
                        </CardTitle>
                        <CardDescription>
                          Manage your public profile and personal information
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Profile Picture */}
                        <div className="flex items-center gap-6">
                          <div className="relative">
                            <Avatar className="w-20 h-20">
                              <AvatarImage src={user?.photoURL || ""} />
                              <AvatarFallback className="bg-brand-yellow text-brand-black text-lg font-semibold">
                                {displayName?.charAt(0).toUpperCase() ||
                                  user?.email?.charAt(0).toUpperCase() ||
                                  "U"}
                              </AvatarFallback>
                            </Avatar>
                            <ProfileEditDialog
                              defaultValues={{
                                firstName: displayName.split(" ")[0] || "",
                                lastName:
                                  displayName.split(" ").slice(1).join(" ") ||
                                  "",
                                username:
                                  displayName
                                    .toLowerCase()
                                    .replace(/\s+/g, "-") || "",
                                website: "",
                                linkedin: "",
                                bio: bio || "",
                                profileImage: user.photoURL || "",
                              }}
                              onSave={async (values) => {
                                if (!user?._id) return;

                                try {
                                  await userService.updateUserProfile(
                                    user._id,
                                    {
                                      displayName:
                                        `${values.firstName} ${values.lastName}`.trim(),
                                      bio: values.bio,
                                      website: values.website,
                                      linkedin: values.linkedin,
                                    }
                                  );

                                  // Update user data in AuthContext for real-time updates
                                  await updateUser();

                                  toast({
                                    title: "Profile updated! ✅",
                                    description:
                                      "Your profile has been saved successfully.",
                                  });

                                  loadUserPreferences();
                                } catch (error) {
                                  console.error(
                                    "Error updating profile:",
                                    error
                                  );
                                  toast({
                                    title: "Update failed ❌",
                                    description:
                                      "There was an error updating your profile. Please try again.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                            >
                              <Button
                                size="sm"
                                className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 bg-brand-yellow hover:bg-yellow-600 text-brand-black border-2 border-white shadow-md"
                              >
                                <Camera className="w-4 h-4" />
                              </Button>
                            </ProfileEditDialog>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <div>
                                <h3 className="font-semibold text-gray-900">
                                  {displayName || "User"}
                                </h3>
                                <p className="text-sm text-gray-500">
                                  {user.email}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
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
                                </div>
                              </div>
                              <ProfileEditDialog
                                defaultValues={{
                                  firstName: displayName.split(" ")[0] || "",
                                  lastName:
                                    displayName.split(" ").slice(1).join(" ") ||
                                    "",
                                  username:
                                    displayName
                                      .toLowerCase()
                                      .replace(/\s+/g, "-") || "",
                                  website: "",
                                  bio: bio || "",
                                  profileImage: user.photoURL || "",
                                }}
                                onSave={async (values) => {
                                  if (!user?._id) return;

                                  try {
                                    await userService.updateUserProfile(
                                      user._id,
                                      {
                                        displayName:
                                          `${values.firstName} ${values.lastName}`.trim(),
                                        bio: values.bio,
                                      }
                                    );

                                    // Update user data in AuthContext for real-time updates
                                    await updateUser();

                                    toast({
                                      title: "Profile updated! ✅",
                                      description:
                                        "Your profile has been saved successfully.",
                                    });

                                    loadUserPreferences();
                                  } catch (error) {
                                    console.error(
                                      "Error updating profile:",
                                      error
                                    );
                                    toast({
                                      title: "Update failed ❌",
                                      description:
                                        "There was an error updating your profile. Please try again.",
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="hover:bg-brand-yellow hover:text-brand-black hover:shadow-lg transition-all duration-300 whitespace-nowrap"
                                >
                                  <Edit3 className="w-4 h-4 mr-2" />
                                  <span className="hidden sm:inline">
                                    Edit Profile
                                  </span>
                                  <span className="sm:hidden">Edit</span>
                                </Button>
                              </ProfileEditDialog>
                            </div>
                            {bio && (
                              <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                                {bio}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Quick Profile Actions */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-gray-900">
                              {user.createdAt
                                ? Math.ceil(
                                    (new Date().getTime() -
                                      new Date(
                                        user.createdAt
                                      ).getTime()) /
                                      (1000 * 60 * 60 * 24)
                                  )
                                : 0}
                            </div>
                            <div className="text-sm text-gray-600">
                              Days Active
                            </div>
                          </div>
                          <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-lg font-semibold text-brand-yellow">
                              {user.emailVerified ? "Verified" : "Pending"}
                            </div>
                            <div className="text-sm text-gray-600">
                              Account Status
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Account Tab */}
                  <TabsContent value="account" className="space-y-6">
                    <Card id="section-account">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="w-5 h-5 text-brand-yellow" />
                          Account Settings
                        </CardTitle>
                        <CardDescription>
                          Manage your account security and authentication
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                          <Label>Email Address</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              value={currentEmail}
                              disabled
                              className="flex-1"
                            />
                            {user.emailVerified ? (
                              <Badge className="bg-green-100 text-green-800">
                                Verified
                              </Badge>
                            ) : (
                              <Badge variant="destructive">Unverified</Badge>
                            )}
                          </div>
                        </div>

                        {/* Password */}
                        {!isGoogleUser && (
                          <div className="space-y-2">
                            <Label>Password</Label>
                            <div className="flex gap-2">
                              <Input
                                type="password"
                                value="••••••••"
                                disabled
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                onClick={() => setShowPasswordReset(true)}
                                className="hover:bg-brand-yellow hover:text-brand-black hover:shadow-lg transition-all duration-300"
                              >
                                Reset Password
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Connected Accounts */}
                        <div className="space-y-4">
                          <Label>Connected Accounts</Label>
                          <div className="space-y-2">
                            {isGoogleUser ? (
                              <div className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                                <div className="flex items-center gap-3">
                                  <div className="w-5 h-5 bg-blue-600 rounded text-white text-xs font-bold flex items-center justify-center">
                                    G
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Google
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Connected via Google OAuth
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                  Connected
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <Mail className="w-5 h-5 text-gray-400" />
                                  <div>
                                    <p className="font-medium text-gray-900">
                                      Email & Password
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Traditional email authentication
                                    </p>
                                  </div>
                                </div>
                                <Badge className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Password Reset Dialog */}
                    <AlertDialog
                      open={showPasswordReset}
                      onOpenChange={setShowPasswordReset}
                    >
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset Password</AlertDialogTitle>
                          <AlertDialogDescription>
                            We'll send a password reset link to your email
                            address: {currentEmail}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handlePasswordReset}
                            className="bg-brand-yellow hover:bg-yellow-600 text-brand-black"
                          >
                            Send Reset Email
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TabsContent>

                  {/* Notifications Tab */}
                  <TabsContent value="notifications" className="space-y-6">
                    <Card id="section-notifications">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Bell className="w-5 h-5 text-brand-yellow" />
                          Notification Preferences
                        </CardTitle>
                        <CardDescription>
                          Choose what notifications you want to receive
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Email Notifications */}
                        <div className="space-y-4">
                          <h4 className="font-medium text-gray-900">
                            Email Notifications
                          </h4>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Project Updates</p>
                              <p className="text-sm text-gray-500">
                                Get notified about your project progress
                              </p>
                            </div>
                            <Switch
                              checked={projectUpdates}
                              onCheckedChange={(checked) => {
                                setProjectUpdates(checked);
                                handleNotificationChange(
                                  "projectUpdates",
                                  checked
                                );
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Security Alerts</p>
                              <p className="text-sm text-gray-500">
                                Important security and account updates
                              </p>
                            </div>
                            <Switch
                              checked={securityAlerts}
                              onCheckedChange={(checked) => {
                                setSecurityAlerts(checked);
                                handleNotificationChange(
                                  "securityAlerts",
                                  checked
                                );
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Marketing Emails</p>
                              <p className="text-sm text-gray-500">
                                Product updates, tips, and offers
                              </p>
                            </div>
                            <Switch
                              checked={marketingEmails}
                              onCheckedChange={(checked) => {
                                setMarketingEmails(checked);
                                handleNotificationChange(
                                  "marketingEmails",
                                  checked
                                );
                              }}
                            />
                          </div>

                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                All Email Notifications
                              </p>
                              <p className="text-sm text-gray-500">
                                Master toggle for all emails
                              </p>
                            </div>
                            <Switch
                              checked={emailNotifications}
                              onCheckedChange={(checked) => {
                                setEmailNotifications(checked);
                                handleNotificationChange(
                                  "emailNotifications",
                                  checked
                                );
                              }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Appearance Tab */}
                  <TabsContent value="appearance" className="space-y-6">
                    <Card id="section-appearance">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Palette className="w-5 h-5 text-brand-yellow" />
                          Appearance Settings
                        </CardTitle>
                        <CardDescription>
                          Customize how the app looks and feels
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Dark Mode</p>
                            <p className="text-sm text-gray-500">
                              Switch between light and dark themes
                            </p>
                          </div>
                          <Switch
                            checked={darkMode}
                            onCheckedChange={handleThemeChange}
                          />
                        </div>

                        <Separator />

                        <div>
                          <p className="font-medium mb-2">Brand Colors</p>
                          <div className="flex gap-2">
                            <div className="w-8 h-8 bg-brand-yellow rounded-full border-2 border-gray-200"></div>
                            <div className="w-8 h-8 bg-brand-black rounded-full border-2 border-gray-200"></div>
                            <div className="w-8 h-8 bg-gray-100 rounded-full border-2 border-gray-200"></div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Privacy Tab */}
                  <TabsContent value="privacy" className="space-y-6">
                    <Card id="section-privacy">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lock className="w-5 h-5 text-brand-yellow" />
                          Privacy & Data
                        </CardTitle>
                        <CardDescription>
                          Control your data and privacy settings
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Data Export */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Export Your Data</p>
                            <p className="text-sm text-gray-500">
                              Download a copy of your account data
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            onClick={handleDataExport}
                            disabled={exportLoading}
                            className="hover:bg-brand-yellow hover:text-brand-black hover:shadow-lg transition-all duration-300"
                          >
                            {exportLoading ? (
                              <>Preparing...</>
                            ) : (
                              <>
                                <Download className="w-4 h-4 mr-2" />
                                Export Data
                              </>
                            )}
                          </Button>
                        </div>

                        <Separator />

                        {/* Account Deletion */}
                        <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                          <div className="flex items-center gap-2 text-red-600">
                            <Trash2 className="w-5 h-5" />
                            <h4 className="font-medium">Danger Zone</h4>
                          </div>

                          <div className="space-y-2">
                            <p className="text-sm text-red-700">
                              Once you delete your account, there is no going
                              back. This action cannot be undone.
                            </p>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Account
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Are you absolutely sure?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. This will
                                    permanently delete your account and remove
                                    your data from our servers.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={handleDeleteAccount}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Yes, delete my account
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* About Tab */}
                  <TabsContent value="about" className="space-y-6">
                    <Card id="section-about">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-brand-yellow" />
                          About & Support
                        </CardTitle>
                        <CardDescription>
                          App information, help, and legal documents
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="space-y-4">
                          <div>
                            <p className="font-medium">Idea2MVP</p>
                            <p className="text-sm text-gray-500">
                              Version 1.0.0
                            </p>
                          </div>

                          <Separator />

                          <div className="space-y-2">
                            <Button
                              variant="ghost"
                              className="w-full justify-start p-0 h-auto"
                              onClick={() => navigate("/getmvp/contact")}
                            >
                              <div className="flex items-center gap-3 p-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>Contact Support</span>
                              </div>
                            </Button>

                            <Button
                              variant="ghost"
                              className="w-full justify-start p-0 h-auto"
                              onClick={() =>
                                navigate("/getmvp/terms-condition")
                              }
                            >
                              <div className="flex items-center gap-3 p-3">
                                <FileText className="w-4 h-4 text-gray-400" />
                                <span>Terms & Conditions</span>
                              </div>
                            </Button>

                            <Button
                              variant="ghost"
                              className="w-full justify-start p-0 h-auto"
                              onClick={() => navigate("/getmvp/privacy-policy")}
                            >
                              <div className="flex items-center gap-3 p-3">
                                <Lock className="w-4 h-4 text-gray-400" />
                                <span>Privacy Policy</span>
                              </div>
                            </Button>
                          </div>

                          <Separator />

                          <div className="text-center text-sm text-gray-500">
                            <p>Made with ❤️ by the Idea2MVP Team</p>
                            <p>© 2024 Idea2MVP. All rights reserved.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Settings;
