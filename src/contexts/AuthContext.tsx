import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabaseDataService } from "@/services/supabaseDataService";
import { GitHubAPIService } from "@/services/githubApiService";

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  loginWithGitHub: () => Promise<void>;
  logout: () => Promise<void>;
  githubData: GitHubData | null;
  isGitHubDataLoading: boolean;
  refreshGitHubData: () => Promise<void>;
  githubToken: string | null;
}

interface GitHubUser {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string;
  company: string;
  blog: string;
  twitter_username: string;
  email: string;
  created_at: string;
  id: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  topics: string[];
  html_url: string;
  stars: number;
}

interface GitHubContribution {
  month: string;
  commits: number;
}

interface GitHubData {
  userData: GitHubUser;
  repositories: GitHubRepository[];
  contributions: GitHubContribution[];
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [githubData, setGithubData] = useState<GitHubData | null>(null);
  const [isGitHubDataLoading, setIsGitHubDataLoading] = useState(false);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.provider_token) {
        setGithubToken(session.provider_token);
      }
      
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.provider_token) {
          setGithubToken(session.provider_token);
        } else {
          setGithubToken(null);
        }
        
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user && githubToken) {
      refreshGitHubData();
    }
  }, [user, githubToken]);

  const fetchGitHubData = async () => {
    if (!user || !githubToken) return null;
    
    setIsGitHubDataLoading(true);
    
    try {
      // Use new comprehensive GitHub API service
      const githubApi = new GitHubAPIService(githubToken);
      const comprehensiveData = await githubApi.fetchComprehensiveData();
      
      // Convert to old format for backward compatibility with UI
      const userData = {
        ...comprehensiveData.profile,
        id: user.id,
      };
      
      const mappedRepos = comprehensiveData.repositories.map((repo) => ({
        ...repo,
        stars: repo.stargazers_count,
      }));
      
      // Convert monthly activity to contributions format
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const contributions = months.map(month => ({
        month,
        commits: comprehensiveData.stats.monthlyActivity[month]?.commits || 0,
      }));
      
      const githubData: GitHubData = {
        userData,
        repositories: mappedRepos,
        contributions,
      };
      
      setGithubData(githubData);
      
      // Store comprehensive data in Supabase (includes PRs, issues, events, etc.)
      if (user && user.id) {
        await supabaseDataService.storeComprehensiveData(comprehensiveData, user.id);
      }
      
      return githubData;
      
    } catch (error) {
      toast.error("Failed to fetch GitHub data");
      return null;
    } finally {
      setIsGitHubDataLoading(false);
    }
  };

  const refreshGitHubData = async () => {
    await fetchGitHubData();
  };

  const loginWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          scopes: "read:user user:email repo",
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast.error(`Login error: ${error.message}`);
      }
    } catch (error) {
      toast.error("An unexpected error occurred during login");
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast.error(`Logout error: ${error.message}`);
      } else {
        setGithubData(null);
        setGithubToken(null);
        navigate("/login");
        toast.success("Successfully logged out");
      }
    } catch (error) {
      toast.error("An unexpected error occurred during logout");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isLoading,
        loginWithGitHub,
        logout,
        githubData,
        isGitHubDataLoading,
        refreshGitHubData,
        githubToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
