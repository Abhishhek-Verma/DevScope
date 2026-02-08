
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useGitHubData } from "@/hooks/useGitHubData";
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
  const { monthlyActivity, contributions } = useGitHubData();
  
  const repositories = githubData?.repositories || [];
  
  // Generate coding time data from contribution patterns
  const generateCodingTimeData = () => {
    if (!contributions || contributions.length === 0) {
      return [
        { name: "Mon", hours: 0 },
        { name: "Tue", hours: 0 },
        { name: "Wed", hours: 0 },
        { name: "Thu", hours: 0 },
        { name: "Fri", hours: 0 },
        { name: "Sat", hours: 0 },
        { name: "Sun", hours: 0 }
      ];
    }

    const weekdayHours: Record<number, number> = {
      0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    };

    contributions.forEach(contrib => {
      const date = new Date(contrib.date);
      const dayOfWeek = date.getDay();
      // Estimate 0.5 hours per contribution
      weekdayHours[dayOfWeek] += contrib.count * 0.5;
    });

    return [
      { name: "Sun", hours: parseFloat((weekdayHours[0] / contributions.length * 7).toFixed(1)) },
      { name: "Mon", hours: parseFloat((weekdayHours[1] / contributions.length * 7).toFixed(1)) },
      { name: "Tue", hours: parseFloat((weekdayHours[2] / contributions.length * 7).toFixed(1)) },
      { name: "Wed", hours: parseFloat((weekdayHours[3] / contributions.length * 7).toFixed(1)) },
      { name: "Thu", hours: parseFloat((weekdayHours[4] / contributions.length * 7).toFixed(1)) },
      { name: "Fri", hours: parseFloat((weekdayHours[5] / contributions.length * 7).toFixed(1)) },
      { name: "Sat", hours: parseFloat((weekdayHours[6] / contributions.length * 7).toFixed(1)) }
    ];
  };

  const timeData = generateCodingTimeData();

  // Use last 4 weeks of monthly activity data for the overview chart
  const activityData = monthlyActivity.slice(-4).map((month, index) => ({
    name: `Week ${index + 1}`,
    commits: month.commits,
    prs: month.prs,
    issues: month.issues
  }));

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
