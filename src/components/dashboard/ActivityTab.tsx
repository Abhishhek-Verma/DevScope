
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { ActivityOverviewChart } from "./ActivityOverviewChart";
import { CodingTimeChart } from "./CodingTimeChart";
import { RecentActivityCard } from "./RecentActivityCard";
import { RepoTable } from "@/components/dashboard/RepoTable";
import { Skeleton } from "@/components/ui/skeleton";
import { GitHubRepo } from "@/hooks/useGitHubData";

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

export function ActivityTab() {
  const { isLoading, isGitHubDataLoading, githubData } = useAuth();
  
  const repositories = githubData?.repositories || [];
  
  const timeData = [
    { name: "Mon", hours: 3.5 },
    { name: "Tue", hours: 4.2 },
    { name: "Wed", hours: 2.8 },
    { name: "Thu", hours: 5.1 },
    { name: "Fri", hours: 3.9 },
    { name: "Sat", hours: 6.5 },
    { name: "Sun", hours: 4.7 }
  ];

  const activityData = [
    { name: "Week 1", commits: 23, prs: 5, issues: 8 },
    { name: "Week 2", commits: 15, prs: 3, issues: 4 },
    { name: "Week 3", commits: 32, prs: 7, issues: 10 },
    { name: "Week 4", commits: 27, prs: 6, issues: 7 }
  ];

  return (
    <div className="space-y-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div variants={itemVariants}>
          <ActivityOverviewChart activityData={activityData} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <CodingTimeChart timeData={timeData} />
        </motion.div>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <RecentActivityCard isLoading={isLoading || isGitHubDataLoading} />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        {isGitHubDataLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-1/3" />
            <Skeleton className="h-[400px] w-full" />
          </div>
        ) : (
          <RepoTable repositories={repositories as GitHubRepo[]} />
        )}
      </motion.div>
    </div>
  );
}
