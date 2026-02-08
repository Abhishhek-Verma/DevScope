
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Github, RefreshCw, Share2, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UserData {
  name?: string;
  login?: string;
  avatar_url?: string;
  bio?: string;
  followers?: number;
  following?: number;
  public_repos?: number;
  location?: string;
  created_at?: string;
}

export function DashboardHeader() {
  const { user, isLoading, githubData, isGitHubDataLoading, refreshGitHubData } = useAuth();
  const [userBio, setUserBio] = useState<string>("");
  
  const userData = githubData?.userData || {} as UserData;
  const repositories = githubData?.repositories || [];
  
  const portfolioUrl = `/portfolio/${userData.login || user?.user_metadata?.preferred_username || 'developer'}`;

  useEffect(() => {
    if (userData) {
      if (userData.bio) {
        setUserBio(userData.bio);
      } else {
        const repos = repositories.length > 0 ? `with ${repositories.length} public repositories` : '';
        const joinDate = userData.created_at 
          ? `GitHub member since ${new Date(userData.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}` 
          : '';
        
        setUserBio(`${userData.name || 'Developer'} ${repos}. ${joinDate}`);
      }
    }
  }, [userData, repositories]);

  const handleRefresh = () => {
    refreshGitHubData();
    toast.success("Syncing GitHub data...");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8 rounded-lg relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-devscope-100 to-white dark:from-devscope-900/20 dark:to-devscope-900/5 z-0"></div>
      <div className="relative z-10 p-6">
        {isLoading || isGitHubDataLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-60" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14 border-4 border-white shadow-lg">
                <AvatarImage src={userData.avatar_url} alt={userData.name} />
                <AvatarFallback>{userData.name?.substring(0, 2) || 'GH'}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {userData.name || 'Developer'}!</h1>
                <p className="text-sm text-muted-foreground">
                  {userBio || "Here's what's happening with your GitHub activity"}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4 md:mt-0">
              <Button 
                size="sm" 
                className="gap-1 text-xs"
                onClick={handleRefresh}
                disabled={isGitHubDataLoading}
              >
                {isGitHubDataLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Github className="h-3.5 w-3.5" />
                )}
                <span>{isGitHubDataLoading ? 'Syncing...' : 'Sync with GitHub'}</span>
              </Button>

              <Link to={portfolioUrl}>
                <Button size="sm" variant="outline" className="gap-1 text-xs">
                  <User className="h-3.5 w-3.5" />
                  <span>View Profile</span>
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
