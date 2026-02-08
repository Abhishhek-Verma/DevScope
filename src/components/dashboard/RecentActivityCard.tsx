
import { 
  History, 
  GitBranch, 
  GitMerge, 
  Star, 
  BookOpen,
  GitCommit,
  GitPullRequest,
  CircleDot,
  GitFork
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";

interface RecentActivityCardProps {
  isLoading: boolean;
}

interface GitHubEvent {
  id: string;
  type: string;
  repo: {
    name: string;
  };
  payload: any;
  created_at: string;
}

export function RecentActivityCard({ isLoading }: RecentActivityCardProps) {
  const { githubToken, user } = useAuth();
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!githubToken || !user) {
        setLoadingEvents(false);
        return;
      }

      try {
        const response = await fetch(
          `https://api.github.com/users/${user.user_metadata?.user_name || user.user_metadata?.preferred_username}/events?per_page=10`,
          {
            headers: {
              Authorization: `token ${githubToken}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setEvents(data.slice(0, 4)); // Get only the 4 most recent events
        }
      } catch (error) {
        console.error("Error fetching GitHub events:", error);
      } finally {
        setLoadingEvents(false);
      }
    };

    fetchRecentActivity();
  }, [githubToken, user]);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'PushEvent':
        return <GitBranch className="h-4 w-4 text-green-600 dark:text-green-400" />;
      case 'PullRequestEvent':
        return <GitMerge className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
      case 'WatchEvent':
        return <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />;
      case 'CreateEvent':
        return <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
      case 'IssuesEvent':
        return <CircleDot className="h-4 w-4 text-red-600 dark:text-red-400" />;
      case 'ForkEvent':
        return <GitFork className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <GitCommit className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'PushEvent':
        return 'bg-green-100 dark:bg-green-900/20';
      case 'PullRequestEvent':
        return 'bg-purple-100 dark:bg-purple-900/20';
      case 'WatchEvent':
        return 'bg-yellow-100 dark:bg-yellow-900/20';
      case 'CreateEvent':
        return 'bg-blue-100 dark:bg-blue-900/20';
      case 'IssuesEvent':
        return 'bg-red-100 dark:bg-red-900/20';
      case 'ForkEvent':
        return 'bg-indigo-100 dark:bg-indigo-900/20';
      default:
        return 'bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const formatEventDescription = (event: GitHubEvent) => {
    const repoName = event.repo.name.split('/')[1] || event.repo.name;
    
    switch (event.type) {
      case 'PushEvent':
        const commitCount = event.payload.commits?.length || 0;
        return `Pushed ${commitCount} commit${commitCount !== 1 ? 's' : ''} to ${repoName}`;
      case 'PullRequestEvent':
        const action = event.payload.action;
        const prNumber = event.payload.pull_request?.number;
        return `${action === 'opened' ? 'Opened' : action === 'closed' ? 'Closed' : 'Updated'} pull request #${prNumber} in ${repoName}`;
      case 'WatchEvent':
        return `Starred ${repoName}`;
      case 'CreateEvent':
        const refType = event.payload.ref_type;
        return `Created ${refType} in ${repoName}`;
      case 'IssuesEvent':
        const issueAction = event.payload.action;
        const issueNumber = event.payload.issue?.number;
        return `${issueAction === 'opened' ? 'Opened' : 'Closed'} issue #${issueNumber} in ${repoName}`;
      case 'ForkEvent':
        return `Forked ${repoName}`;
      default:
        return `Activity in ${repoName}`;
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return diffMins <= 1 ? 'Just now' : `${diffMins} minutes ago`;
    } else if (diffHours < 24) {
      return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return eventDate.toLocaleDateString();
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>
          Your most recent GitHub actions and contributions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading || loadingEvents ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : events.length > 0 ? (
            events.map((event) => (
              <div key={event.id} className="flex items-start gap-3">
                <div className={`rounded-full p-2 ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>
                <div>
                  <p className="font-medium text-sm">{formatEventDescription(event)}</p>
                  <p className="text-xs text-muted-foreground">{getTimeAgo(event.created_at)}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No recent activity found
            </p>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full gap-1"
          onClick={() => window.open(`https://github.com/${user?.user_metadata?.user_name || user?.user_metadata?.preferred_username}`, '_blank')}
        >
          <History className="h-4 w-4" />
          <span>View All Activity on GitHub</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
