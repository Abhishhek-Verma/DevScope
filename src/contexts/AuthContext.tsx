import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
      const userResponse = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `token ${githubToken}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error(`GitHub API error: ${userResponse.status}`);
      }
      
      const userData = await userResponse.json();
      
      if (user && user.id) {
        userData.id = user.id;
      }
      
      const reposResponse = await fetch(
        "https://api.github.com/user/repos?per_page=100&sort=updated",
        {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        }
      );
      
      if (!reposResponse.ok) {
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }
      
      const repositories = await reposResponse.json();
      
      const mappedRepos = repositories.map((repo: any) => ({
        ...repo,
        stars: repo.stargazers_count,
      }));
      
      const mockContributions = [
        { month: "Jan", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Feb", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Mar", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Apr", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "May", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Jun", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Jul", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Aug", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Sep", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Oct", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Nov", commits: Math.floor(Math.random() * 30) + 5 },
        { month: "Dec", commits: Math.floor(Math.random() * 30) + 5 },
      ];
      
      const githubData: GitHubData = {
        userData,
        repositories: mappedRepos,
        contributions: mockContributions,
      };
      
      setGithubData(githubData);
      return githubData;
      
    } catch (error) {
      console.error("Error fetching GitHub data:", error);
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
        console.error("GitHub login error:", error);
        toast.error(`Login error: ${error.message}`);
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      toast.error("An unexpected error occurred during login");
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error);
        toast.error(`Logout error: ${error.message}`);
      } else {
        setGithubData(null);
        setGithubToken(null);
        navigate("/login");
        toast.success("Successfully logged out");
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
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
