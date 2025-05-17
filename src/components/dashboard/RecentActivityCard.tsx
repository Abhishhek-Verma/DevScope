
import { 
  History, 
  GitBranch, 
  GitMerge, 
  Star, 
  BookOpen 
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

interface RecentActivityCardProps {
  isLoading: boolean;
}

export function RecentActivityCard({ isLoading }: RecentActivityCardProps) {
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
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-64" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))
          ) : (
            <>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-green-100 p-2 dark:bg-green-900/20">
                  <GitBranch className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Pushed to <span className="text-primary">main</span> in <span className="font-semibold">devscope-dashboard</span></p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900/20">
                  <GitMerge className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium">Merged pull request <span className="text-primary">#42</span> in <span className="font-semibold">weather-app</span></p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/20">
                  <Star className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Starred <span className="font-semibold">react-query</span> repository</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-amber-100 p-2 dark:bg-amber-900/20">
                  <BookOpen className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-medium">Created new repository <span className="font-semibold">ai-article-summarizer</span></p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full gap-1">
          <History className="h-4 w-4" />
          <span>View All Activity</span>
        </Button>
      </CardFooter>
    </Card>
  );
}
