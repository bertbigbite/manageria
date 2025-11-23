import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, Copy } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [adminEmail, setAdminEmail] = useState("");
  const [error, setError] = useState("");

  const handleCreateAdmin = async () => {
    setLoading(true);
    setError("");
    
    try {
      const { data, error: functionError } = await supabase.functions.invoke("create-admin");
      
      if (functionError) throw functionError;
      
      setAdminEmail(data.email);
      setSuccess(true);
      toast.success("Admin account created successfully!");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to create admin account";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error creating admin:", err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <CardDescription>
            Create your admin account to access the dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!success ? (
            <>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <Button
                onClick={handleCreateAdmin}
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Admin Account...
                  </>
                ) : (
                  "Create Admin Account"
                )}
              </Button>
            </>
          ) : (
            <>
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Admin account created successfully!
                </AlertDescription>
              </Alert>

              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium mb-1">Email</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-background px-3 py-2 rounded border">
                      {adminEmail}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(adminEmail, "Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium mb-1">Password</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm bg-background px-3 py-2 rounded border">
                      Admin123!
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard("Admin123!", "Password")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground">
                Save these credentials securely. You'll need them to log in.
              </p>

              <Button
                onClick={() => navigate("/admin/login")}
                className="w-full"
                variant="default"
              >
                Go to Login Page
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
