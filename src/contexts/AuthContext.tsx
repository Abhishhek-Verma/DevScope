import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabaseDataService } from "@/services/supabaseDataService";

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
      
      // Fetch real commit activity for monthly contributions
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyCommits: Record<string, number> = {};
      
      // Initialize all months
      months.forEach(month => {
        monthlyCommits[month] = 0;
      });
      
      // Fetch commits from recent repositories (limit to avoid rate limiting)
      const recentRepos = repositories.slice(0, 10);
      
      try {
        const commitPromises = recentRepos.map(async (repo: any) => {
          try {
            const since = new Date();
            since.setFullYear(since.getFullYear() - 1);
            
            const commitsResponse = await fetch(
              `https://api.github.com/repos/${userData.login}/${repo.name}/commits?author=${userData.login}&since=${since.toISOString()}&per_page=100`,
              {
                headers: {
                  Authorization: `token ${githubToken}`,
                },
              }
            );
            
            if (commitsResponse.ok) {
              const commits = await commitsResponse.json();
              commits.forEach((commit: any) => {
                const commitDate = new Date(commit.commit.author.date);
                const monthKey = months[commitDate.getMonth()];
                monthlyCommits[monthKey]++;
              });
            } else if (commitsResponse.status === 404) {
              // Repository might be private or deleted, skip it
            }
          } catch (error) {
            // Silently skip errors
          }
        });
        
        await Promise.all(commitPromises);
      } catch (error) {
        // Silently ignore errors
      }
      
      const contributions = months.map(month => ({
        month,
        commits: monthlyCommits[month]
      }));
      
      const githubData: GitHubData = {
        userData,
        repositories: mappedRepos,
        contributions,
      };
      
      setGithubData(githubData);
      
      // Store data in Supabase tables silently
      if (user && user.id) {
        await supabaseDataService.storeAllGitHubData(githubData, user.id);
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
