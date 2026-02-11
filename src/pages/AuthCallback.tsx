import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Security: Auth callback initiated (no sensitive data logged)
      
      try {
        // Get the session and detailed error information
        const { data, error } = await supabase.auth.getSession();
        
        // Security: Never log session data as it contains sensitive tokens
        
        if (error) {
          toast.error(`Authentication error: ${error.message}`);
          navigate('/login');
          return;
        }
        
        // Check if user is properly authenticated
        if (!data.session || !data.session.user) {
          toast.error("GitHub authentication failed. Please try again.");
          navigate('/login');
          return;
        }
        
        // Security: User authenticated successfully (no sensitive data logged)
        
        // Check if token exists
        if (!data.session.access_token) {
          toast.error("Authentication failed: No access token");
          navigate('/login');
          return;
        }
        
        toast.success("Successfully signed in with GitHub!");

        // Try with a timeout to ensure other processes complete
        setTimeout(() => {
          window.location.href = `${window.location.origin}/dashboard`;
        }, 1000);
      } catch (error) {
        toast.error("An unexpected error occurred during GitHub authentication. Please try again.");
        navigate('/login');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="text-xl font-semibold">Setting up your GitHub account...</h2>
        <p className="text-muted-foreground">Please wait while we complete the authentication process.</p>
      </div>
    </div>
  );
}
