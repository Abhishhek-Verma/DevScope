
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Heart, BookMarked, FileText, CheckCircle2, Trophy, Star, GitMerge, LucideIcon } from "lucide-react";
import { GoalsCard, Goal } from "./GoalsCard";
import { AchievementsCard, Achievement } from "./AchievementsCard";
import { useAuth } from "@/contexts/AuthContext";
import { useGitHubData } from "@/hooks/useGitHubData";
import { getUserGoals, saveUserGoals, type UserGoal } from "@/integrations/supabase/database";
import { toast } from "sonner";

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

// Icon map to avoid serialization issues with localStorage
const ICON_MAP: Record<string, LucideIcon> = {
  Heart,
  BookMarked,
  Star,
  CheckCircle2,
  Trophy,
  GitMerge,
  FileText
};

// Serializable goal format for localStorage
interface SavedGoal {
  name: string;
  current: number;
  target: number;
  iconName: string;
}

export function GoalsTab() {
  const { githubData, user } = useAuth();
  const { repositories, contributions } = useGitHubData();

  // Calculate real metrics from GitHub data
  const totalCommits = contributions.reduce((sum, item) => sum + item.count, 0);
  const totalRepos = repositories.length;
  const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  
  // Default goals
  const getDefaultGoals = (): Goal[] => [
    { name: "Commit Contributions", current: 0, target: 500, icon: Heart },
    { name: "Public Repositories", current: 0, target: 20, icon: BookMarked },
    { name: "GitHub Stars", current: 0, target: 100, icon: Star },
    { name: "Code Reviews", current: 0, target: 50, icon: CheckCircle2 }
  ];

  const [goalsData, setGoalsData] = useState<Goal[]>(getDefaultGoals());
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);

  // Load goals from database
  useEffect(() => {
    async function loadGoals() {
      if (!user?.id) {
        setIsLoadingGoals(false);
        return;
      }
      
      try {
        const dbGoals = await getUserGoals(user.id);
        
        if (dbGoals.length > 0) {
          const loadedGoals: Goal[] = dbGoals.map(g => ({
            name: g.goal_name,
            current: g.current_value || 0,
            target: g.target_value,
            icon: ICON_MAP[g.icon_name || 'Heart'] || Heart
          }));
          setGoalsData(loadedGoals);
        }
      } catch (error) {
        toast.error('Failed to load goals');
      } finally {
        setIsLoadingGoals(false);
      }
    }
    
    loadGoals();
  }, [user]);

  // Save goals to database
  const saveGoals = async (goals: Goal[]) => {
    if (!user?.id) return;
    
    try {
      const dbGoals: UserGoal[] = goals.map(g => {
        const iconName = Object.keys(ICON_MAP).find(key => ICON_MAP[key] === g.icon) || 'Heart';
        return {
          user_id: user.id,
          goal_name: g.name,
          target_value: g.target,
          current_value: g.current,
          icon_name: iconName,
          is_completed: g.current >= g.target
        };
      });
      
      await saveUserGoals(user.id, dbGoals);
    } catch (error) {
      toast.error('Failed to save goals');
    }
  };

  // Add new goal handler
  const handleAddGoal = async (name: string, target: number) => {
    const newGoal: Goal = {
      name,
      current: 0,
      target,
      icon: Trophy
    };
    const updatedGoals = [...goalsData, newGoal];
    setGoalsData(updatedGoals);
    await saveGoals(updatedGoals);
  };

  // Update goals with real GitHub data
  useEffect(() => {
    const updatedGoals = goalsData.map(goal => {
      switch (goal.name) {
        case "Commit Contributions":
          return { ...goal, current: totalCommits };
        case "Public Repositories":
          return { ...goal, current: totalRepos };
        case "GitHub Stars":
          return { ...goal, current: totalStars };
        default:
          return goal;
      }
    });
    
    setGoalsData(updatedGoals);
    saveGoals(updatedGoals);
  }, [totalCommits, totalRepos, totalStars]);

  // Calculate achievements based on real data
  const calculateAchievements = (): Achievement[] => {
    const achievements: Achievement[] = [];
    
    // Check for consistent contributor (commits in last 30 days)
    const last30Days = contributions.slice(0, 30);
    const daysWithCommits = last30Days.filter(day => day.count > 0).length;
    if (daysWithCommits >= 20) {
      achievements.push({
        title: "Consistent Contributor",
        description: `Active for ${daysWithCommits} of the last 30 days`,
        icon: Trophy,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
    
    // Check for popular repository
    const popularRepos = repositories.filter(repo => repo.stargazers_count >= 10);
    if (popularRepos.length > 0) {
      const mostStarred = popularRepos.reduce((max, repo) => 
        repo.stargazers_count > max.stargazers_count ? repo : max
      );
      achievements.push({
        title: "Popular Repository",
        description: `${mostStarred.name} reached ${mostStarred.stargazers_count} stars`,
        icon: Star,
        date: new Date(mostStarred.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
    
    // Check for total commits milestone
    if (totalCommits >= 100) {
      achievements.push({
        title: "Commit Century",
        description: `Reached ${totalCommits} total contributions`,
        icon: GitMerge,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
    
    // If no achievements yet, show encouragement
    if (achievements.length === 0) {
      achievements.push({
        title: "Getting Started",
        description: "Keep contributing to unlock achievements!",
        icon: Trophy,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      });
    }
    
    return achievements;
  };

  const achievements = calculateAchievements();

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
    >
      <motion.div variants={itemVariants} className="lg:col-span-2">
        <GoalsCard goals={goalsData} onAddGoal={handleAddGoal} />
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <AchievementsCard achievements={achievements} />
      </motion.div>
    </motion.div>
  );
}
