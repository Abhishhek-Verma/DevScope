/**
 * Comprehensive GitHub API Data Fetcher
 * Fetches ALL available data from GitHub API
 */

export interface GitHubUserProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  location: string | null;
  email: string | null;
  blog: string | null;
  company: string | null;
  twitter_username: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  hireable: boolean | null;
  gravatar_id: string | null;
  html_url: string;
  type: string;
}

export interface GitHubRepository {
  id: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  watchers_count: number;
  open_issues_count: number;
  topics: string[];
  html_url: string;
  homepage: string | null;
  private: boolean;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  default_branch: string;
  license: { key: string; name: string; spdx_id: string } | null;
  has_issues: boolean;
  has_projects: boolean;
  has_wiki: boolean;
  archived: boolean;
  disabled: boolean;
  visibility: string;
  owner: {
    login: string;
    id: number;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  merged_at: string | null;
  html_url: string;
  user: {
    login: string;
    id: number;
  };
  head: {
    ref: string;
    sha: string;
  };
  base: {
    ref: string;
    sha: string;
  };
  draft: boolean;
  merged: boolean;
}

export interface GitHubIssue {
  id: number;
  number: number;
  state: string;
  title: string;
  body: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  html_url: string;
  user: {
    login: string;
    id: number;
  };
  labels: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  comments: number;
  pull_request?: { url: string }; // Present if it's a PR
}

export interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    id: number;
    login: string;
    avatar_url: string;
  };
  repo: {
    id: number;
    name: string;
    url: string;
  };
  payload: any;
  public: boolean;
  created_at: string;
}

export interface GitHubOrganization {
  login: string;
  id: number;
  avatar_url: string;
  description: string | null;
  url: string;
}

export interface GitHubGist {
  id: string;
  description: string | null;
  public: boolean;
  created_at: string;
  updated_at: string;
  html_url: string;
  files: Record<string, {
    filename: string;
    type: string;
    language: string | null;
    size: number;
  }>;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  repository?: {
    name: string;
    full_name: string;
  };
}

export interface ComprehensiveGitHubData {
  profile: GitHubUserProfile;
  repositories: GitHubRepository[];
  pullRequests: GitHubPullRequest[];
  issues: GitHubIssue[];
  events: GitHubEvent[];
  organizations: GitHubOrganization[];
  gists: GitHubGist[];
  commits: GitHubCommit[];
  stats: {
    totalCommits: number;
    totalPRs: number;
    totalIssues: number;
    totalStars: number;
    monthlyActivity: Record<string, {
      commits: number;
      prs: number;
      issues: number;
    }>;
  };
}

export class GitHubAPIService {
  private baseUrl = 'https://api.github.com';
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private async fetchWithAuth(url: string): Promise<any> {
    const response = await fetch(url, {
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    return response.json();
  }

  private async fetchAllPages(url: string, maxPages = 10): Promise<any[]> {
    const results: any[] = [];
    let currentUrl = url;
    let pageCount = 0;

    while (currentUrl && pageCount < maxPages) {
      const response = await fetch(currentUrl, {
        headers: {
          Authorization: `token ${this.token}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!response.ok) {
        break;
      }

      const data = await response.json();
      results.push(...(Array.isArray(data) ? data : [data]));

      // Check for pagination
      const linkHeader = response.headers.get('Link');
      const nextMatch = linkHeader?.match(/<([^>]+)>;\s*rel="next"/);
      currentUrl = nextMatch ? nextMatch[1] : '';
      pageCount++;
    }

    return results;
  }

  async fetchUserProfile(): Promise<GitHubUserProfile> {
    return this.fetchWithAuth(`${this.baseUrl}/user`);
  }

  async fetchRepositories(): Promise<GitHubRepository[]> {
    return this.fetchAllPages(`${this.baseUrl}/user/repos?per_page=100&sort=updated`);
  }

  async fetchPullRequests(): Promise<GitHubPullRequest[]> {
    try {
      // Fetch PRs created by the user
      const searchUrl = `${this.baseUrl}/search/issues?q=is:pr+author:@me&per_page=100&sort=created`;
      const searchResults = await this.fetchWithAuth(searchUrl);
      
      const prs: GitHubPullRequest[] = [];
      if (searchResults.items) {
        for (const item of searchResults.items.slice(0, 100)) {
          try {
            // Fetch full PR details
            const prUrl = item.pull_request?.url;
            if (prUrl) {
              const prData = await this.fetchWithAuth(prUrl);
              prs.push(prData);
            }
          } catch (error) {
            // Skip individual PR errors
          }
        }
      }
      return prs;
    } catch (error) {
      return [];
    }
  }

  async fetchIssues(): Promise<GitHubIssue[]> {
    try {
      const searchUrl = `${this.baseUrl}/search/issues?q=author:@me+is:issue&per_page=100&sort=created`;
      const searchResults = await this.fetchWithAuth(searchUrl);
      return searchResults.items || [];
    } catch (error) {
      return [];
    }
  }

  async fetchEvents(): Promise<GitHubEvent[]> {
    try {
      const profile = await this.fetchUserProfile();
      return this.fetchAllPages(`${this.baseUrl}/users/${profile.login}/events?per_page=100`, 3);
    } catch (error) {
      return [];
    }
  }

  async fetchOrganizations(): Promise<GitHubOrganization[]> {
    try {
      return this.fetchWithAuth(`${this.baseUrl}/user/orgs`);
    } catch (error) {
      return [];
    }
  }

  async fetchGists(): Promise<GitHubGist[]> {
    try {
      return this.fetchAllPages(`${this.baseUrl}/gists?per_page=100`, 3);
    } catch (error) {
      return [];
    }
  }

  async fetchCommitsForRepo(owner: string, repo: string, username: string, maxCommits = 100): Promise<GitHubCommit[]> {
    try {
      const since = new Date();
      since.setFullYear(since.getFullYear() - 1);
      
      const commits = await this.fetchAllPages(
        `${this.baseUrl}/repos/${owner}/${repo}/commits?author=${username}&since=${since.toISOString()}&per_page=${maxCommits}`,
        2
      );
      
      return commits.map(commit => ({
        ...commit,
        repository: {
          name: repo,
          full_name: `${owner}/${repo}`,
        },
      }));
    } catch (error) {
      return [];
    }
  }

  async fetchComprehensiveData(): Promise<ComprehensiveGitHubData> {
    // Fetch all data in parallel for speed
    const [
      profile,
      repositories,
      organizations,
      gists,
      events,
    ] = await Promise.all([
      this.fetchUserProfile(),
      this.fetchRepositories(),
      this.fetchOrganizations(),
      this.fetchGists(),
      this.fetchEvents(),
    ]);

    // Fetch commits from recent repositories
    const recentRepos = repositories.slice(0, 20);
    const commitPromises = recentRepos.map(repo =>
      this.fetchCommitsForRepo(repo.owner.login, repo.name, profile.login)
    );
    const repoCommits = await Promise.allSettled(commitPromises);
    const commits = repoCommits
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<GitHubCommit[]>).value);

    // Fetch PRs and Issues (can be slow, do after commits)
    const [pullRequests, issues] = await Promise.all([
      this.fetchPullRequests(),
      this.fetchIssues(),
    ]);

    // Calculate stats
    const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
    const totalCommits = commits.length;
    const totalPRs = pullRequests.length;
    const totalIssues = issues.filter(issue => !issue.pull_request).length;

    // Calculate monthly activity
    const monthlyActivity: Record<string, { commits: number; prs: number; issues: number }> = {};
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    months.forEach(month => {
      monthlyActivity[month] = { commits: 0, prs: 0, issues: 0 };
    });

    commits.forEach(commit => {
      const date = new Date(commit.commit.author.date);
      const monthKey = months[date.getMonth()];
      if (monthlyActivity[monthKey]) {
        monthlyActivity[monthKey].commits++;
      }
    });

    pullRequests.forEach(pr => {
      const date = new Date(pr.created_at);
      const monthKey = months[date.getMonth()];
      if (monthlyActivity[monthKey]) {
        monthlyActivity[monthKey].prs++;
      }
    });

    issues
      .filter(issue => !issue.pull_request)
      .forEach(issue => {
        const date = new Date(issue.created_at);
        const monthKey = months[date.getMonth()];
        if (monthlyActivity[monthKey]) {
          monthlyActivity[monthKey].issues++;
        }
      });

    return {
      profile,
      repositories,
      pullRequests,
      issues,
      events,
      organizations,
      gists,
      commits,
      stats: {
        totalCommits,
        totalPRs,
        totalIssues,
        totalStars,
        monthlyActivity,
      },
    };
  }
}
