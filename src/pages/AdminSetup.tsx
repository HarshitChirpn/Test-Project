import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useAdmin } from "@/contexts/AdminContext";
import { Shield, ArrowLeft, CheckCircle } from "lucide-react";

const AdminSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isAdmin, adminLoading } = useAdmin();
  const { toast } = useToast();

  useEffect(() => {
    // If user is admin, redirect to admin dashboard
    if (!adminLoading && isAdmin) {
      navigate("/getmvp/admin");
    }
  }, [isAdmin, adminLoading, navigate]);

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-slate-600">Checking admin status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">
              Admin Setup Complete
            </h1>
            <p className="text-slate-600 mt-2">
              Admin user has been configured in the system
            </p>
          </div>

          {!user ? (
            <div className="text-center space-y-4">
              <p className="text-slate-600">
                Please log in to access admin features
              </p>
              <Button onClick={() => navigate("/getmvp/login")}>
                Go to Login
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Admin User ID:</strong> N1KPQTtYNIQyvXp8dT4wVLZ9ePB2
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    This user has been granted admin privileges in Firestore.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <Button
                  onClick={() => navigate("/getmvp/admin")}
                  className="w-full bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700"
                >
                  Go to Admin Dashboard
                </Button>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={() => navigate("/getmvp")}
              className="w-full flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Site</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminSetup;
