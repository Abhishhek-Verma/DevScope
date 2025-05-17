import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  html_url: string;
  topics: string[];
  fork: boolean;
  updated_at: string;
  homepage: string;
  stars: number;
  contributions: number; 
}

export interface GitHubContribution {
  date: string;
  count: number;
}

export interface GitHubLanguage {
  name: string;
  value: number;
  color: string;
}

export interface GitHubUserData {
  name: string;
  login: string;
  avatar_url: string;
  bio: string;
  followers: number;
  following: number;
  public_repos: number;
  location: string;
  created_at: string;
  company: string;
  blog: string;
  twitter_username: string;
  email: string;
  id: string;
}

export interface MonthlyActivity {
  name: string;
  commits: number;
  prs: number;
  issues: number;
}

interface UseGitHubDataResult {
  userData: GitHubUserData | null;
  repositories: GitHubRepo[];
  languages: GitHubLanguage[];
  contributions: GitHubContribution[];
  monthlyActivity: MonthlyActivity[];
  topTopics: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const languageColors: Record<string, string> = {
  JavaScript: "#f7df1e",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  "C#": "#178600",
  Go: "#00ADD8",
  Ruby: "#701516",
  PHP: "#4F5D95",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Dart: "#00B4AB",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Rust: "#DEA584",
  C: "#555555",
  "C++": "#f34b7d",
  Shell: "#89e051",
  Vue: "#41B883",
  Jupyter: "#DA5B0B",
  Other: "#6e7781"
};

export function useGitHubData(): UseGitHubDataResult {
  const { user, githubToken } = useAuth();
  const [userData, setUserData] = useState<GitHubUserData | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepo[]>([]);
  const [languages, setLanguages] = useState<GitHubLanguage[]>([]);
  const [contributions, setContributions] = useState<GitHubContribution[]>([]);
  const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity[]>([]);
  const [topTopics, setTopTopics] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGitHubData = async () => {
    if (!user || !githubToken) {
      setIsLoading(false);
      setError("User not authenticated or GitHub token not available");
      return;
    }

    setIsLoading(true);
    setError(null);

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
      
      setUserData(userData);

      const reposResponse = await fetch(
        `https://api.github.com/user/repos?per_page=100&sort=updated`,
        {
          headers: {
            Authorization: `token ${githubToken}`,
          },
        }
      );

      if (!reposResponse.ok) {
        throw new Error(`GitHub API error: ${reposResponse.status}`);
      }

      const allRepos = await reposResponse.json();
      
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const activeRepos = allRepos.filter(
        (repo: any) => 
          !repo.fork && 
          new Date(repo.updated_at) > sixMonthsAgo
      );
      
      const reposWithContributions = activeRepos.map((repo: any) => ({
        ...repo,
        stars: repo.stargazers_count,
        contributions: 0
      }));
      
      setRepositories(reposWithContributions);

      const languageMap: Record<string, number> = {};
      
      activeRepos.forEach((repo: any) => {
        if (repo.language) {
          languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
        }
      });
      
      const languageEntries = Object.entries(languageMap);
      const totalRepos = languageEntries.reduce((sum, [count]) => sum + count, 0);
      
      const processedLanguages = languageEntries
        .map(([name, count]) => ({
          name,
          value: Math.round((count / totalRepos) * 100),
          color: languageColors[name] || languageColors.Other,
        }))
        .sort((a, b) => b.value - a.value);
      
      setLanguages(processedLanguages);

      const topicsCounter: Record<string, number> = {};
      
      activeRepos.forEach((repo: any) => {
        repo.topics?.forEach((topic: string) => {
          topicsCounter[topic] = (topicsCounter[topic] || 0) + 1;
        });
      });
      
      const sortedTopics = Object.entries(topicsCounter)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([topic]) => topic);
      
      setTopTopics(sortedTopics);

      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const mockMonthlyActivity = months.map(name => ({
        name,
        commits: Math.floor(Math.random() * 30),
        prs: Math.floor(Math.random() * 10),
        issues: Math.floor(Math.random() * 15)
      }));
      
      setMonthlyActivity(mockMonthlyActivity);
      
      const today = new Date();
      const mockContributions = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          count: Math.floor(Math.random() * 10)
        };
      });
      
      setContributions(mockContributions);

    } catch (err) {
      console.error("Error fetching GitHub data:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch GitHub data");
      toast.error("Failed to load GitHub data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGitHubData();
  }, [user, githubToken]);

  return {
    userData,
    repositories,
    languages,
    contributions,
    monthlyActivity,
    topTopics,
    isLoading,
    error,
    refetch: async () => {
      await fetchGitHubData();
    }
  };
}
