
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpRight, Github, Star, GitFork, FileCode } from "lucide-react";
import { GitHubRepo } from "@/hooks/useGitHubData";

interface RepoTableProps {
  repositories: GitHubRepo[];
}

export function RepoTable({ repositories }: RepoTableProps) {
  const getLanguageColor = (language: string) => {
    const colors: Record<string, string> = {
      JavaScript: "bg-yellow-500",
      TypeScript: "bg-blue-500",
      Python: "bg-green-500",
      Java: "bg-red-500",
      "C#": "bg-purple-500",
      PHP: "bg-indigo-500",
      Go: "bg-cyan-500",
      Ruby: "bg-pink-500",
      Rust: "bg-orange-500",
      Swift: "bg-amber-500",
      Kotlin: "bg-fuchsia-500",
      Dart: "bg-emerald-500",
    };

    return colors[language] || "bg-gray-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Top Repositories</CardTitle>
          <CardDescription className="text-xs">
            Your most contributed repositories
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Github className="h-3.5 w-3.5" />
          <span>View All</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Repository</TableHead>
                <TableHead className="hidden md:table-cell">Language</TableHead>
                <TableHead className="text-right">Stars</TableHead>
                <TableHead className="text-right hidden md:table-cell">Forks</TableHead>
                <TableHead className="text-right">Contributions</TableHead>
                <TableHead className="text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repositories.length > 0 ? (
                repositories.map((repo) => (
                  <TableRow key={repo.name} className="group">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span className="font-medium">{repo.name}</span>
                        <span className="hidden text-xs text-muted-foreground md:inline">
                          {repo.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className={`h-3 w-3 rounded-full ${getLanguageColor(repo.language)}`}></div>
                        <span>{repo.language}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" />
                        {repo.stars}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right hidden md:table-cell">
                      <Badge variant="outline" className="gap-1">
                        <GitFork className="h-3 w-3" />
                        {repo.forks_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {repo.contributions}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                        onClick={() => window.open(repo.html_url, '_blank')}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No repositories found. Sync with GitHub to load your data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
