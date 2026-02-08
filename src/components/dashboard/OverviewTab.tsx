
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { AISummary } from "@/components/dashboard/AISummary";
import { CommitActivityChart } from "@/components/dashboard/CommitActivityChart";
import { LanguageChart } from "@/components/dashboard/LanguageChart";
import { PortfolioCard } from "@/components/dashboard/PortfolioCard";

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

export function OverviewTab() {
  const { isLoading, isGitHubDataLoading, githubData, user } = useAuth();
  
  const commitData = githubData?.contributions || [];
  const repositories = githubData?.repositories || [];
  const userData = githubData?.userData || null;
  
  const portfolioUrl = `/u/${userData?.login || user?.user_metadata?.preferred_username || 'developer'}`;

  return (
    <div className="space-y-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="grid grid-cols-1 gap-6 lg:grid-cols-2"
      >
        <motion.div variants={itemVariants}>
          <CommitActivityChart 
            commitData={commitData}
            isLoading={isLoading || isGitHubDataLoading}
          />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <LanguageChart 
            repositories={repositories}
            isLoading={isLoading || isGitHubDataLoading}
          />
        </motion.div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <AISummary 
          isLoading={isLoading || isGitHubDataLoading} 
          githubData={githubData} 
          userData={userData} 
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-8"
      >
        <PortfolioCard portfolioUrl={portfolioUrl} />
      </motion.div>
    </div>
  );
}
