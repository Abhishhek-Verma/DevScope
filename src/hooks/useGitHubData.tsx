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
      const totalRepos = languageEntries.reduce((sum, [, count]) => sum + count, 0);
      
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

      // Fetch real monthly activity data using commit stats
      const currentDate = new Date();
      const monthlyActivityMap: Record<string, { commits: number; prs: number; issues: number }> = {};
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      
      // Initialize last 12 months
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        const monthKey = months[date.getMonth()];
        if (!monthlyActivityMap[monthKey]) {
          monthlyActivityMap[monthKey] = { commits: 0, prs: 0, issues: 0 };
        }
      }

      // Fetch recent commits from all active repos (limited to avoid rate limiting)
      const commitPromises = activeRepos.slice(0, 10).map(async (repo: any) => {
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
              if (monthlyActivityMap[monthKey]) {
                monthlyActivityMap[monthKey].commits++;
              }
            });
          } else if (commitsResponse.status === 404) {
            // Repository might be private or deleted, skip it
          }
        } catch (error) {
          // Silently skip errors
        }
      });

      await Promise.all(commitPromises);

      // Fetch issues and PRs from user's events
      try {
        const eventsResponse = await fetch(
          `https://api.github.com/users/${userData.login}/events?per_page=100`,
          {
            headers: {
              Authorization: `token ${githubToken}`,
            },
          }
        );
        
        if (eventsResponse.ok) {
          const events = await eventsResponse.json();
          events.forEach((event: any) => {
            const eventDate = new Date(event.created_at);
            const monthKey = months[eventDate.getMonth()];
            
            if (monthlyActivityMap[monthKey]) {
              if (event.type === 'PullRequestEvent') {
                monthlyActivityMap[monthKey].prs++;
              } else if (event.type === 'IssuesEvent') {
                monthlyActivityMap[monthKey].issues++;
              }
            }
          });
        }
      } catch (error) {
        // Silently ignore errors
      }

      const processedMonthlyActivity = months.map(name => ({
        name,
        ...monthlyActivityMap[name]
      }));
      
      setMonthlyActivity(processedMonthlyActivity);
      
      // Generate real contribution data from recent commits across all repos
      const contributionMap: Record<string, number> = {};
      const last90Days = 90;
      
      // Initialize last 90 days
      for (let i = 0; i < last90Days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateKey = date.toISOString().split('T')[0];
        contributionMap[dateKey] = 0;
      }
      
      // Count commits from fetched data
      await Promise.all(activeRepos.slice(0, 15).map(async (repo: any) => {
        try {
          const since = new Date();
          since.setDate(since.getDate() - last90Days);
          
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
              const dateKey = commit.commit.author.date.split('T')[0];
              if (contributionMap[dateKey] !== undefined) {
                contributionMap[dateKey]++;
              }
            });
          } else if (commitsResponse.status === 404) {
            // Repository might be private or deleted, skip it
          }
        } catch (error) {
          // Silently skip errors
        }
      }));
      
      const realContributions = Object.entries(contributionMap)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => b.date.localeCompare(a.date));
      
      setContributions(realContributions);

    } catch (err) {
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
