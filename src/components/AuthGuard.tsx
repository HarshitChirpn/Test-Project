import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  Lock,
  User,
  Mail,
  Key,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showAuthModal?: boolean;
  onAuthSuccess?: () => void;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  fallback,
  showAuthModal = true,
  onAuthSuccess,
}) => {
  const { user, loading, signIn, signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-yellow border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show the protected content
  if (user) {
    return <>{children}</>;
  }

  // If user is not authenticated, show fallback or auth modal
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    try {
      if (isSignUp) {
        if (password !== confirmPassword) {
          setAuthError("Passwords do not match");
          return;
        }
        const { error } = await signUp(email, password);
        if (error) {
          setAuthError(error.message);
        } else {
          toast({
            title: "Account created successfully!",
            description:
              "Welcome to Idea2MVP. You can now proceed with your purchase.",
          });
          setIsAuthModalOpen(false);
          onAuthSuccess?.();
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setAuthError(error.message);
        } else {
          toast({
            title: "Welcome back!",
            description: "You can now proceed with your purchase.",
          });
          setIsAuthModalOpen(false);
          onAuthSuccess?.();
        }
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);

    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setAuthError(error.message);
      } else {
        toast({
          title: "Welcome!",
          description: "You can now proceed with your purchase.",
        });
        setIsAuthModalOpen(false);
        onAuthSuccess?.();
      }
    } catch (error) {
      setAuthError("An unexpected error occurred. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setAuthError(null);
  };

  const handleTabChange = (value: string) => {
    setIsSignUp(value === "signup");
    resetForm();
  };

  // Custom fallback component
  const defaultFallback = (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-brand-yellow/10 rounded-full flex items-center justify-center mb-4">
          <Lock className="w-8 h-8 text-brand-yellow" />
        </div>
        <CardTitle className="text-2xl">Authentication Required</CardTitle>
        <CardDescription>
          Please sign in or create an account to proceed with your purchase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            You need to be logged in to purchase our services
          </p>
          {showAuthModal ? (
            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400">
                  <User className="w-4 h-4 mr-2" />
                  Sign In / Sign Up
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-center">
                    {isSignUp ? "Create Account" : "Welcome Back"}
                  </DialogTitle>
                  <DialogDescription className="text-center">
                    {isSignUp
                      ? "Create your account to get started with Idea2MVP"
                      : "Sign in to your account to continue"}
                  </DialogDescription>
                </DialogHeader>

                <Tabs
                  value={isSignUp ? "signup" : "signin"}
                  onValueChange={handleTabChange}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="signin">Sign In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="space-y-4">
                    <form onSubmit={handleAuth} className="space-y-4">
                      {authError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400"
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                            Signing In...
                          </div>
                        ) : (
                          <>
                            <Key className="w-4 h-4 mr-2" />
                            Sign In
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="signup" className="space-y-4">
                    <form onSubmit={handleAuth} className="space-y-4">
                      {authError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{authError}</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="Create a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">
                          Confirm Password
                        </Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400"
                        disabled={authLoading}
                      >
                        {authLoading ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-brand-black border-t-transparent rounded-full animate-spin" />
                            Creating Account...
                          </div>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Create Account
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                >
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Continue with Google
                </Button>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="space-y-2">
              <Button
                asChild
                className="w-full bg-brand-yellow text-brand-black hover:bg-yellow-400"
              >
                <a href="/getmvp/register">
                  <User className="w-4 h-4 mr-2" />
                  Sign Up
                </a>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <a href="/getmvp/login">
                  <Key className="w-4 h-4 mr-2" />
                  Sign In
                </a>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return fallback || defaultFallback;
};

export default AuthGuard;
