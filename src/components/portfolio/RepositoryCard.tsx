
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { GitHubRepo } from "@/hooks/useGitHubData";
import { motion } from "framer-motion";
import { Code, ExternalLink, Github, Star, GitFork } from "lucide-react";

interface RepositoryCardProps {
  repo: GitHubRepo;
  index: number;
}

export function RepositoryCard({ repo, index }: RepositoryCardProps) {
  // Determine the language color based on repo.language
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
    Other: "#6e7781"
  };
  
  const languageColor = languageColors[repo.language] || languageColors.Other;
  
  // Limit topics to display
  const displayTopics = repo.topics?.slice(0, 4) || [];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="transition-all duration-300"
    >
      <Card className="overflow-hidden h-full flex flex-col border-t-4 border-t-primary hover:shadow-lg transition-shadow">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{repo.name}</CardTitle>
          <CardDescription className="line-clamp-2">
            {repo.description || "No description available"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-2 mt-2">
            {repo.language && (
              <Badge 
                className="flex items-center gap-1.5"
                variant="secondary"
              >
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: languageColor }}
                />
                {repo.language}
              </Badge>
            )}
            
            {displayTopics.map((topic) => (
              <Badge 
                key={topic} 
                variant="secondary" 
                className="bg-primary/10 text-primary hover:bg-primary/20"
              >
                {topic}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
            {repo.stargazers_count > 0 && (
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                <span>{repo.stargazers_count}</span>
              </div>
            )}
            
            {repo.forks_count > 0 && (
              <div className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                <span>{repo.forks_count}</span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between gap-2 pt-2">
          <Button variant="outline" size="sm" className="gap-1" onClick={() => window.open(repo.html_url, '_blank')}>
            <Github className="h-4 w-4" />
            <span>Repository</span>
          </Button>
          {repo.homepage && (
            <Button size="sm" className="gap-1" onClick={() => window.open(repo.homepage, '_blank')}>
              <ExternalLink className="h-4 w-4" />
              <span>Live Demo</span>
            </Button>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
