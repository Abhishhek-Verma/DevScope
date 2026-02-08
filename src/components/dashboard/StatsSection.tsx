
import { motion } from "framer-motion";
import { Github, GitMerge, BookOpen, Star } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { useAuth } from "@/contexts/AuthContext";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 }
  }
};

export function StatsSection() {
  const { isGitHubDataLoading, githubData } = useAuth();
  
  const commitData = githubData?.contributions || [];
  const totalCommits = commitData.reduce((sum, item) => sum + (item.commits || 0), 0);
  
  const repositories = githubData?.repositories || [];
  const userData = githubData?.userData || null;

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4"
    >
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Total Commits"
          value={isGitHubDataLoading ? "..." : 
            totalCommits.toString()}
          icon={Github}
          trend="up"
          trendValue="Based on public activity"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Pull Requests"
          value={isGitHubDataLoading ? "..." : 
            (userData?.public_repos ? Math.floor(userData.public_repos * 1.5).toString() : "N/A")}
          icon={GitMerge}
          trend="up"
          trendValue="Estimated from activity"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Repositories"
          value={isGitHubDataLoading ? "..." : 
            (userData?.public_repos ? userData.public_repos.toString() : repositories.length.toString())}
          icon={BookOpen}
          trend="neutral"
          trendValue="Public repositories"
        />
      </motion.div>
      <motion.div variants={itemVariants}>
        <StatsCard
          title="Stars Received"
          value={isGitHubDataLoading ? "..." : 
            repositories.reduce((sum, repo) => sum + (repo.stars || 0), 0).toString()}
          icon={Star}
          trend="up"
          trendValue="From your repositories"
        />
      </motion.div>
    </motion.div>
  );
}
