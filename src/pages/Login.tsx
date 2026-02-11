
import { Button } from "@/components/ui/button";
import { PageLayout } from "@/components/layout/PageLayout";
import { Github, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Login() {
  const { user, isLoading, loginWithGitHub } = useAuth();

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

  const handleGitHubLogin = async () => {
    try {
      await loginWithGitHub();
    } catch (error) {
      // Error handled by loginWithGitHub
    }
  };

  return (
    <PageLayout>
      <div className="container flex flex-col items-center justify-center px-4 py-12 md:py-24">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[28rem]">
          <div className="flex flex-col items-center space-y-2 text-center">
            <div className="mb-2 h-16 w-16 rounded-full bg-primary/10 p-3">
              <svg className="h-full w-full text-primary" fill="currentColor" viewBox="0 0 24 24">
                <path d="M10 20L14 4M18 8L22 12L18 16M6 16L2 12L6 8" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gradient">Welcome to DevScope</h1>
            <p className="text-sm text-muted-foreground">
              Sign in with GitHub to visualize your contributions and enhance your productivity.
            </p>
          </div>
          
          <div className="grid gap-6">
            <div className="space-y-4">
              <Alert variant="default" className="bg-muted border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertTitle>GitHub Authentication</AlertTitle>
                <AlertDescription>
                  Use your GitHub account to sign in securely. This will allow us to fetch your GitHub contributions and repositories.
                </AlertDescription>
              </Alert>
              
              {/* GitHub Sign In Button */}
              <Button 
                onClick={handleGitHubLogin}
                disabled={isLoading}
                className="w-full gap-2 bg-[#24292F] text-white hover:bg-[#24292F]/90 dark:bg-[#24292F]/90 dark:text-white dark:hover:bg-[#24292F]/80"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Github className="h-5 w-5" />
                )}
                <span>Sign in with GitHub</span>
              </Button>
            </div>
          </div>
          
          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-xl bg-gradient-to-br from-devscope-100 to-devscope-50 p-6 dark:from-devscope-900/50 dark:to-devscope-800/30">
              <h3 className="mb-2 text-lg font-semibold">Track Contributions</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your GitHub activity with beautiful interactive charts and visualizations.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-devscope-100 to-devscope-50 p-6 dark:from-devscope-900/50 dark:to-devscope-800/30">
              <h3 className="mb-2 text-lg font-semibold">AI Insights</h3>
              <p className="text-sm text-muted-foreground">
                Get personalized AI-powered summaries of your coding patterns and achievements.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-devscope-100 to-devscope-50 p-6 dark:from-devscope-900/50 dark:to-devscope-800/30">
              <h3 className="mb-2 text-lg font-semibold">Share Portfolio</h3>
              <p className="text-sm text-muted-foreground">
                Create a shareable portfolio highlighting your skills and contributions.
              </p>
            </div>
            <div className="rounded-xl bg-gradient-to-br from-devscope-100 to-devscope-50 p-6 dark:from-devscope-900/50 dark:to-devscope-800/30">
              <h3 className="mb-2 text-lg font-semibold">Productivity Focus</h3>
              <p className="text-sm text-muted-foreground">
                Identify trends in your work habits to improve productivity and code quality.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
