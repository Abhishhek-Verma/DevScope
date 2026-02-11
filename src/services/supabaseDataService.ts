import { supabase } from "@/integrations/supabase/client";

interface GitHubUserData {
  login: string;
  avatar_url: string;
  name?: string;
  bio?: string;
  location?: string;
  company?: string;
  blog?: string;
  twitter_username?: string;
  email?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
  created_at: string;
}

interface GitHubRepository {
  id: number;
  name: string;
  description?: string;
  language?: string;
  stargazers_count?: number;
  stars?: number;
  forks_count?: number;
  topics?: string[];
  html_url: string;
  private?: boolean;
  created_at: string;
  updated_at: string;
}

interface GitHubContribution {
  month: string;
  commits: number;
}

interface GitHubData {
  userData: GitHubUserData;
  repositories: GitHubRepository[];
  contributions: GitHubContribution[];
}

interface UserProfileData {
  user_id: string;
  github_username: string;
  avatar_url: string;
  name: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  twitter_username: string | null;
  email: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

interface RepositoryData {
  user_id: string;
  repo_id: number;
  name: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  url: string;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

interface MonthlyStatData {
  user_id: string;
  year: number;
  month: number;
  total_commits: number;
  total_prs: number;
  total_issues: number;
}

export const supabaseDataService = {
  // Store user profile
  async storeUserProfile(githubData: GitHubUserData, userId: string) {
    try {
      const profileData: UserProfileData = {
        user_id: userId,
        github_username: githubData.login,
        avatar_url: githubData.avatar_url,
        name: githubData.name || githubData.login,
        bio: githubData.bio || null,
        location: githubData.location || null,
        company: githubData.company || null,
        blog: githubData.blog || null,
        twitter_username: githubData.twitter_username || null,
        email: githubData.email || null,
        public_repos: githubData.public_repos || 0,
        followers: githubData.followers || 0,
        following: githubData.following || 0,
        created_at: githubData.created_at,
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert(profileData, { onConflict: "user_id" });

      if (error) {
        throw error;
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Store repositories
  async storeRepositories(repositories: GitHubRepository[], userId: string) {
    try {
      const repoData: RepositoryData[] = repositories.map((repo) => ({
        user_id: userId,
        repo_id: repo.id,
        name: repo.name,
        description: repo.description || null,
        language: repo.language || null,
        stars: repo.stargazers_count || repo.stars || 0,
        forks: repo.forks_count || 0,
        topics: repo.topics || [],
        url: repo.html_url,
        is_private: repo.private || false,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
      }));

      // Delete old repositories and insert new ones
      await supabase
        .from("repository_snapshots")
        .delete()
        .eq("user_id", userId);

      const { error } = await supabase
        .from("repository_snapshots")
        .insert(repoData);

      if (error) {
        throw error;
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Store monthly stats
  async storeMonthlyStats(contributions: GitHubContribution[], userId: string) {
    try {
      const currentYear = new Date().getFullYear();
      const monthMap: Record<string, number> = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
        Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12
      };

      const statsData: MonthlyStatData[] = contributions.map((contribution) => ({
        user_id: userId,
        year: currentYear,
        month: monthMap[contribution.month] || 1,
        total_commits: contribution.commits || 0,
        total_prs: 0, // Not fetched from current data
        total_issues: 0, // Not fetched from current data
      }));

      // Delete old stats for current year and insert new ones
      await supabase
        .from("monthly_stats")
        .delete()
        .eq("user_id", userId)
        .eq("year", currentYear);

      const { error } = await supabase
        .from("monthly_stats")
        .insert(statsData);

      if (error) {
        throw error;
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Store all GitHub data at once
  async storeAllGitHubData(githubData: GitHubData, userId: string) {
    try {
      await Promise.all([
        this.storeUserProfile(githubData.userData, userId),
        this.storeRepositories(githubData.repositories, userId),
        this.storeMonthlyStats(githubData.contributions, userId),
      ]);
    } catch (error) {
      // Silently fail
    }
  },
};
