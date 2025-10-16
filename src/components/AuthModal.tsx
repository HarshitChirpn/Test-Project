import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "react-router-dom";
import { UserPlus, Mail, Lock, LogIn, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "login" | "register";
}

const AuthModal = ({
  isOpen,
  onClose,
  initialMode = "register",
}: AuthModalProps) => {
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signUp, signIn, signInWithGoogle, resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);

    try {
      if (mode === "register") {
        const { error } = await signUp(email, password);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Please check your email to confirm your account",
          });
          onClose();
        }
      } else {
        const { error } = await signIn(email, password);

        if (error) {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Success",
            description: "Welcome back!",
          });
          onClose();
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description:
            mode === "register"
              ? "Account created successfully! Welcome to the platform."
              : "Welcome back!",
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address first",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await resetPassword(email);

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setAgreeToTerms(true);
    setLoading(false);
  };

  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] lg:max-w-4xl w-[85vw] max-h-[95vh] p-0 overflow-hidden">
        <div className="flex flex-col lg:flex-row min-h-[400px] lg:min-h-[700px]">
          {/* Left side - Image with overlay content */}
          <div className="hidden lg:block lg:w-1/2 relative overflow-hidden lg:min-h-[700px]">
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src="/assets/hero-auth.jpeg"
                alt="Think Build Launch - Startup development journey from ideation to market launch"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 30%" }}
              />
            </div>

            {/* Overlay Content */}
            <div className="relative z-10 p-6 lg:p-8 h-full flex flex-col justify-start text-white bg-gradient-to-br from-black/60 to-black/40">
              <div>
                <h2 className="text-2xl lg:text-3xl font-bold mb-4 lg:mb-6">
                  {mode === "register"
                    ? "Success starts here"
                    : "Welcome back!"}
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    From idea to MVP in just 2 weeks
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Expert team of startup founders
                  </div>
                  <div className="flex items-center">
                    <svg
                      className="w-5 h-5 mr-3 flex-shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Full-stack development & design services
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="w-full lg:w-1/2 p-4 sm:p-6 lg:p-8 flex flex-col overflow-y-auto">
            <div className="mb-4 lg:mb-6">
              <h1 className="text-xl lg:text-2xl font-bold">
                {mode === "register"
                  ? "Create a new account"
                  : "Sign in to your account"}
              </h1>
            </div>

            {mode === "register" && (
              <p className="text-sm text-gray-600 mb-4 lg:mb-6">
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="text-brand-yellow hover:text-yellow-700 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}

            {mode === "login" && (
              <p className="text-sm text-gray-600 mb-4 lg:mb-6">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className="text-brand-yellow hover:text-yellow-700 font-medium"
                >
                  Sign up
                </button>
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-4 lg:mb-6">
              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 h-10 focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>

              <div>
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-10 focus:ring-brand-yellow focus:border-brand-yellow"
                  placeholder={
                    mode === "register"
                      ? "Create a password"
                      : "Enter your password"
                  }
                  disabled={loading}
                />
              </div>

              {mode === "register" && (
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    className="mt-1"
                    checked={agreeToTerms}
                    onCheckedChange={(checked) =>
                      setAgreeToTerms(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="terms"
                    className="text-xs text-gray-600 leading-relaxed"
                  >
                    By joining, you agree to the Idea2MVP{" "}
                    <Link
                      to="/getmvp/terms-condition"
                      className="text-brand-yellow hover:text-yellow-700"
                    >
                      Terms of Service
                    </Link>{" "}
                    and to occasionally receive emails from us. Please read our{" "}
                    <Link
                      to="/getmvp/privacy-policy"
                      className="text-brand-yellow hover:text-yellow-700"
                    >
                      Privacy Policy
                    </Link>{" "}
                    to learn how we use your personal data.
                  </Label>
                </div>
              )}

              {mode === "login" && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-brand-yellow hover:text-yellow-700 font-medium"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 bg-brand-yellow hover:bg-yellow-600 text-brand-black font-medium disabled:opacity-50"
              >
                {loading
                  ? mode === "register"
                    ? "Creating account..."
                    : "Signing in..."
                  : mode === "register"
                  ? "Continue"
                  : "Sign In"}
              </Button>
            </form>

            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full h-12 border-gray-300 hover:bg-gray-50 font-medium disabled:opacity-50"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
