import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log("Auth callback initiated");
      
      try {
        // Get the session and detailed error information
        const { data, error } = await supabase.auth.getSession();
        
        console.log("Auth session response:", data);
        
        if (error) {
          console.error("Authentication error details:", error);
          toast.error(`Authentication error: ${error.message}`);
          navigate('/login');
          return;
        }
        
        // Check if user is properly authenticated
        if (!data.session || !data.session.user) {
          console.error("No valid session or user found in response");
          toast.error("GitHub authentication failed. Please try again.");
          navigate('/login');
          return;
        }
        
        console.log("User successfully authenticated:", {
          id: data.session.user.id,
          email: data.session.user.email,
          metadata: data.session.user.user_metadata
        });
        
        // Check if token exists
        if (!data.session.access_token) {
          console.error("No access token in session");
          toast.error("Authentication failed: No access token");
          navigate('/login');
          return;
        }
        
        toast.success("Successfully signed in with GitHub!");
        console.log("Current origin:", window.location.origin);
        console.log("Attempting redirect to:", `${window.location.origin}/dashboard`);

        // Try with a timeout to ensure other processes complete
        setTimeout(() => {
          window.location.href = `${window.location.origin}/dashboard`;
          console.log("Redirect executed");
        }, 1000);
      } catch (error) {
        console.error("Unexpected error in auth callback:", error);
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
