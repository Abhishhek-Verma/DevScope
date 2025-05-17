
import { motion } from "framer-motion";
import { Heart, BookMarked, FileText, CheckCircle2, Trophy, Star, GitMerge, LucideIcon } from "lucide-react";
import { GoalsCard, Goal } from "./GoalsCard";
import { AchievementsCard, Achievement } from "./AchievementsCard";

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

export function GoalsTab() {
  const goalsData: Goal[] = [
    { name: "Open Source Contributions", current: 75, target: 100, icon: Heart },
    { name: "New Repositories", current: 8, target: 12, icon: BookMarked },
    { name: "Documentation Improvement", current: 60, target: 100, icon: FileText },
    { name: "Code Reviews", current: 45, target: 50, icon: CheckCircle2 }
  ];

  const achievements: Achievement[] = [
    {
      title: "Consistent Contributor",
      description: "Committed code for 30 consecutive days",
      icon: Trophy,
      date: "Mar 15, 2025"
    },
    {
      title: "Popular Repository",
      description: "Repository reached 100+ stars",
      icon: Star,
      date: "Feb 20, 2025"
    },
    {
      title: "Pull Request Master",
      description: "Merged 50+ pull requests",
      icon: GitMerge,
      date: "Jan 12, 2025"
    }
  ];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <GoalsCard goals={goalsData} />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <AchievementsCard achievements={achievements} />
      </motion.div>
    </motion.div>
  );
}
