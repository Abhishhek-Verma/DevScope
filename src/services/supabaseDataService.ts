import { supabase } from "@/integrations/supabase/client";
import {
  GitHubUserProfile,
  GitHubRepository,
  GitHubEvent,
  ComprehensiveGitHubData,
} from "./githubApiService";

// These interfaces are for backward compatibility with existing code
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
  public_gists?: number;
  followers?: number;
  following?: number;
  created_at: string;
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

export const supabaseDataService = {
  // Store comprehensive user profile with JSONB for complete data
  async storeUserProfile(profile: GitHubUserProfile, userId: string) {
    try {
      const profileData = {
        user_id: userId,
        github_id: profile.id.toString(),
        github_username: profile.login,
        name: profile.name || profile.login,
        avatar_url: profile.avatar_url,
        bio: profile.bio,
        location: profile.location,
        company: profile.company,
        blog: profile.blog,
        twitter_username: profile.twitter_username,
        email: profile.email,
        public_repos: profile.public_repos,
        public_gists: profile.public_gists,
        followers: profile.followers,
        following: profile.following,
        hireable: profile.hireable,
        created_at: profile.created_at,
        profile_data: profile, // Store complete profile in JSONB
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

  // Store all repositories with complete data
  async storeRepositories(repositories: GitHubRepository[], userId: string) {
    try {
      const repoData = repositories.map((repo) => ({
        user_id: userId,
        repo_id: repo.id,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        topics: repo.topics || [],
        url: repo.html_url,
        is_private: repo.private,
        is_fork: repo.fork,
        homepage: repo.homepage,
        open_issues: repo.open_issues_count,
        watchers: repo.watchers_count,
        size: repo.size,
        default_branch: repo.default_branch,
        license_name: repo.license?.name || null,
        created_at: repo.created_at,
        updated_at: repo.updated_at,
        repo_data: repo, // Store complete repo data in JSONB
      }));

      // Delete old repositories first
      await supabase
        .from("repository_snapshots")
        .delete()
        .eq("user_id", userId);

      // Insert new repositories in batches (Supabase has limits)
      const batchSize = 100;
      for (let i = 0; i < repoData.length; i += batchSize) {
        const batch = repoData.slice(i, i + batchSize);
        const { error } = await supabase
          .from("repository_snapshots")
          .insert(batch);

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Store activity logs from GitHub events
  async storeActivityLogs(events: GitHubEvent[], userId: string) {
    try {
      const activityData = events.map((event) => ({
        user_id: userId,
        activity_type: event.type,
        activity_data: {
          type: event.type,
          repo: event.repo,
          payload: event.payload,
          public: event.public,
        },
        github_event_id: event.id,
        occurred_at: event.created_at,
      }));

      // Delete old activity logs (keep last 1000)
      const { data: existingLogs } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("user_id", userId)
        .order("occurred_at", { ascending: false })
        .range(1000, 10000);

      if (existingLogs && existingLogs.length > 0) {
        const idsToDelete = existingLogs.map((log) => log.id);
        await supabase
          .from("activity_logs")
          .delete()
          .in("id", idsToDelete);
      }

      // Insert new activity logs in batches
      const batchSize = 100;
      for (let i = 0; i < activityData.length; i += batchSize) {
        const batch = activityData.slice(i, i + batchSize);
        try {
          await supabase
            .from("activity_logs")
            .insert(batch);
        } catch (error) {
          // Skip if duplicate
        }
      }
    } catch (error) {
      // Silently fail
    }
  },

  // Store monthly stats with comprehensive data
  async storeMonthlyStats(
    monthlyActivity: Record<string, { commits: number; prs: number; issues: number }>,
    userId: string
  ) {
    try {
      const currentYear = new Date().getFullYear();
      const monthMap: Record<string, number> = {
        Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
        Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
      };

      const statsData = Object.entries(monthlyActivity).map(([month, stats]) => ({
        user_id: userId,
        year: currentYear,
        month: monthMap[month] || 1,
        total_commits: stats.commits,
        total_prs: stats.prs,
        total_issues: stats.issues,
      }));

      // Delete old stats for current year
      await supabase
        .from("monthly_stats")
        .delete()
        .eq("user_id", userId)
        .eq("year", currentYear);

      // Insert new stats
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

  // Store comprehensive GitHub data (NEW - handles all data types)
  async storeComprehensiveData(data: ComprehensiveGitHubData, userId: string) {
    try {
      await Promise.all([
        this.storeUserProfile(data.profile, userId),
        this.storeRepositories(data.repositories, userId),
        this.storeActivityLogs(data.events, userId),
        this.storeMonthlyStats(data.stats.monthlyActivity, userId),
      ]);
    } catch (error) {
      // Silently fail
    }
  },

  // Backward compatibility - Store data from old format
  async storeAllGitHubData(githubData: GitHubData, userId: string) {
    try {
      // Convert old format to new format
      const profile: GitHubUserProfile = {
        login: githubData.userData.login,
        id: 0, // Will be updated from actual API
        avatar_url: githubData.userData.avatar_url,
        name: githubData.userData.name || null,
        bio: githubData.userData.bio || null,
        location: githubData.userData.location || null,
        email: githubData.userData.email || null,
        blog: githubData.userData.blog || null,
        company: githubData.userData.company || null,
        twitter_username: githubData.userData.twitter_username || null,
        public_repos: githubData.userData.public_repos || 0,
        public_gists: githubData.userData.public_gists || 0,
        followers: githubData.userData.followers || 0,
        following: githubData.userData.following || 0,
        created_at: githubData.userData.created_at,
        updated_at: new Date().toISOString(),
        hireable: null,
        gravatar_id: null,
        html_url: `https://github.com/${githubData.userData.login}`,
        type: "User",
      };

      const monthlyActivity: Record<string, { commits: number; prs: number; issues: number }> = {};
      githubData.contributions.forEach((contrib) => {
        monthlyActivity[contrib.month] = {
          commits: contrib.commits,
          prs: 0,
          issues: 0,
        };
      });

      await Promise.all([
        this.storeUserProfile(profile, userId),
        this.storeRepositories(githubData.repositories, userId),
        this.storeMonthlyStats(monthlyActivity, userId),
      ]);
    } catch (error) {
      // Silently fail
    }
  },
};

