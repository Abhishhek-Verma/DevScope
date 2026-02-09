import { PageLayout } from "@/components/layout/PageLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RepositoryCard } from "@/components/portfolio/RepositoryCard";
import { motion } from "framer-motion";
import { 
  BookOpen, 
  Calendar, 
  Code, 
  Download, 
  ExternalLink, 
  Github, 
  Globe, 
  Link2, 
  Mail, 
  MapPin, 
  Share2, 
  Star,
  Twitter,
  Loader2,
  Briefcase,
  User,
  FileCode,
  Award,
  CheckCircle2,
  Zap
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from "recharts";
import { useParams, Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useGitHubData } from "@/hooks/useGitHubData";

export default function Portfolio() {
  const { username } = useParams<{ username: string }>();
  const { user, githubToken } = useAuth();
  
  // State for public portfolio data
  const [publicUserData, setPublicUserData] = useState<any>(null);
  const [publicRepos, setPublicRepos] = useState<any[]>([]);
  const [isLoadingPublic, setIsLoadingPublic] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);
  
  // If viewing someone else's portfolio (username in URL), fetch their public data
  const isViewingOthersProfile = username && (!user || user.user_metadata?.user_name !== username);
  
  // Use either public data or authenticated data
  const { 
    userData, 
    repositories, 
    languages, 
    contributions, 
    monthlyActivity, 
    topTopics, 
    isLoading: isLoadingAuth, 
    error: errorAuth, 
    refetch 
  } = useGitHubData();
  
  // Fetch public GitHub data for the username in URL
  useEffect(() => {
    async function fetchPublicData() {
      if (!isViewingOthersProfile || !username) return;
      
      setIsLoadingPublic(true);
      setPublicError(null);
      
      try {
        // Fetch public user data with authentication to avoid rate limits
        const headers: HeadersInit = {};
        // Use logged-in user's token OR fallback to public token from env
        const tokenToUse = githubToken || import.meta.env.VITE_GITHUB_PUBLIC_TOKEN;
        if (tokenToUse) {
          headers['Authorization'] = `token ${tokenToUse}`;
        }
        
        const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
        if (!userRes.ok) {
          if (userRes.status === 404) {
            throw new Error(`GitHub user "${username}" not found. Please check the username in the URL.`);
          } else if (userRes.status === 403) {
            throw new Error('GitHub API rate limit exceeded. Please try again later or log in for higher limits.');
          }
          throw new Error(`Failed to fetch user data: ${userRes.statusText}`);
        }
        const userData = await userRes.json();
        setPublicUserData(userData);
        
        // Fetch public repositories
        const reposRes = await fetch(
          `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
          { headers }
        );
        if (!reposRes.ok) {
          throw new Error('Failed to fetch repositories');
        }
        const repos = await reposRes.json();
        
        // Filter out forks and add required fields
        const activeRepos = repos
          .filter((repo: any) => !repo.fork)
          .map((repo: any) => ({
            ...repo,
            stars: repo.stargazers_count,
            contributions: 0
          }));
        
        setPublicRepos(activeRepos);
      } catch (err: any) {
        setPublicError(err.message);
      } finally {
        setIsLoadingPublic(false);
      }
    }
    
    fetchPublicData();
  }, [username, isViewingOthersProfile, githubToken]);
  
  // Use public data if viewing someone else's profile
  const displayUserData = isViewingOthersProfile ? publicUserData : userData;
  const displayRepos = isViewingOthersProfile ? publicRepos : repositories;
  const isLoading = isViewingOthersProfile ? isLoadingPublic : isLoadingAuth;
  const error = isViewingOthersProfile ? publicError : errorAuth;

  // Animation variants
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

  // Calculate languages from displayRepos for public profiles
  const calculatePublicLanguages = () => {
    const languageMap: Record<string, number> = {};
    displayRepos.forEach((repo: any) => {
      if (repo.language) {
        languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
      }
    });
    
    const total = Object.values(languageMap).reduce((sum, count) => sum + count, 0);
    return Object.entries(languageMap)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / total) * 100),
        color: '#8b5cf6' // Default color
      }))
      .sort((a, b) => b.value - a.value);
  };
  
  // Calculate topics from displayRepos for public profiles
  const calculatePublicTopics = () => {
    const topicsCounter: Record<string, number> = {};
    displayRepos.forEach((repo: any) => {
      repo.topics?.forEach((topic: string) => {
        topicsCounter[topic] = (topicsCounter[topic] || 0) + 1;
      });
    });
    
    return Object.entries(topicsCounter)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([topic]) => topic);
  };
  
  // Use calculated data for public profiles
  const displayLanguages = isViewingOthersProfile ? calculatePublicLanguages() : languages;
  const displayTopics = isViewingOthersProfile ? calculatePublicTopics() : topTopics;
  
  // Determine areas of expertise based on repositories and languages
  const determineExpertiseAreas = () => {
    // Collect actual skills from repositories
    const frontendSkills = new Set<string>();
    const backendSkills = new Set<string>();
    const devopsSkills = new Set<string>();
    
    // Scan through repositories and topics
    displayRepos.forEach(repo => {
      // Frontend signals
      if (repo.language === 'JavaScript') frontendSkills.add('JavaScript');
      if (repo.language === 'TypeScript') frontendSkills.add('TypeScript');
      if (repo.language === 'HTML') frontendSkills.add('HTML/CSS');
      if (repo.language === 'CSS') frontendSkills.add('HTML/CSS');
      
      repo.topics?.forEach(topic => {
        if (topic === 'react') frontendSkills.add('React');
        if (topic === 'vue') frontendSkills.add('Vue.js');
        if (topic === 'angular') frontendSkills.add('Angular');
        if (topic === 'nextjs' || topic === 'next') frontendSkills.add('Next.js');
        if (topic === 'svelte') frontendSkills.add('Svelte');
        if (topic === 'tailwindcss' || topic === 'tailwind') frontendSkills.add('Tailwind CSS');
      });
      
      // Backend signals
      if (repo.language === 'Python') backendSkills.add('Python');
      if (repo.language === 'Java') backendSkills.add('Java');
      if (repo.language === 'Go') backendSkills.add('Go');
      if (repo.language === 'PHP') backendSkills.add('PHP');
      if (repo.language === 'Ruby') backendSkills.add('Ruby');
      if (repo.language === 'C#') backendSkills.add('C#');
      if (repo.language === 'Rust') backendSkills.add('Rust');
      
      repo.topics?.forEach(topic => {
        if (topic === 'nodejs' || topic === 'node') backendSkills.add('Node.js');
        if (topic === 'express') backendSkills.add('Express.js');
        if (topic === 'django') backendSkills.add('Django');
        if (topic === 'flask') backendSkills.add('Flask');
        if (topic === 'spring' || topic === 'springboot') backendSkills.add('Spring Boot');
        if (topic === 'postgresql' || topic === 'postgres') backendSkills.add('PostgreSQL');
        if (topic === 'mongodb') backendSkills.add('MongoDB');
        if (topic === 'mysql') backendSkills.add('MySQL');
        if (topic === 'api' || topic === 'rest-api') backendSkills.add('REST API');
        if (topic === 'graphql') backendSkills.add('GraphQL');
      });
      
      // DevOps signals
      if (repo.language === 'Shell') devopsSkills.add('Shell Scripting');
      if (repo.language === 'HCL') devopsSkills.add('Terraform');
      if (repo.language === 'Dockerfile') devopsSkills.add('Docker');
      
      repo.topics?.forEach(topic => {
        if (topic === 'docker') devopsSkills.add('Docker');
        if (topic === 'kubernetes' || topic === 'k8s') devopsSkills.add('Kubernetes');
        if (topic === 'aws') devopsSkills.add('AWS');
        if (topic === 'azure') devopsSkills.add('Azure');
        if (topic === 'gcp' || topic === 'google-cloud') devopsSkills.add('Google Cloud');
        if (topic === 'cicd' || topic === 'ci-cd') devopsSkills.add('CI/CD');
        if (topic === 'github-actions') devopsSkills.add('GitHub Actions');
        if (topic === 'terraform') devopsSkills.add('Terraform');
        if (topic === 'ansible') devopsSkills.add('Ansible');
      });
    });
    
    // Return the areas with actual skills
    return {
      frontend: frontendSkills.size > 0 ? Array.from(frontendSkills).slice(0, 5) : null,
      backend: backendSkills.size > 0 ? Array.from(backendSkills).slice(0, 5) : null,
      devops: devopsSkills.size > 0 ? Array.from(devopsSkills).slice(0, 5) : null
    };
  };
  
  const expertiseAreas = determineExpertiseAreas();

  // Generate weekday activity data from contributions
  const generateWeekdayActivity = () => {
    if (!contributions || contributions.length === 0) {
      return [
        { name: "Sun", commits: 0 },
        { name: "Mon", commits: 0 },
        { name: "Tue", commits: 0 },
        { name: "Wed", commits: 0 },
        { name: "Thu", commits: 0 },
        { name: "Fri", commits: 0 },
        { name: "Sat", commits: 0 },
      ];
    }
    
    const weekdayData = [
      { name: "Sun", commits: 0 },
      { name: "Mon", commits: 0 },
      { name: "Tue", commits: 0 },
      { name: "Wed", commits: 0 },
      { name: "Thu", commits: 0 },
      { name: "Fri", commits: 0 },
      { name: "Sat", commits: 0 },
    ];
    
    contributions.forEach(contrib => {
      const date = new Date(contrib.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      weekdayData[dayOfWeek].commits += contrib.count;
    });
    
    return weekdayData;
  };
  
  const weekdayActivity = generateWeekdayActivity();

  return (
    <PageLayout>
      <div className="container py-8">
        {isLoading ? (
          <div className="flex min-h-[70vh] flex-col items-center justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <h2 className="text-xl font-semibold">Loading GitHub profile...</h2>
            <p className="text-muted-foreground">Fetching your GitHub data and contributions.</p>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="max-w-2xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error loading profile</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            {/* Profile Header - Enhanced with animations and glassmorphism */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8 relative overflow-hidden rounded-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-devscope-600/20 to-devscope-400/10 backdrop-blur-sm z-0"></div>
              <div className="relative z-10 p-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <Avatar className="h-28 w-28 border-4 border-white dark:border-gray-800 shadow-xl">
                  <AvatarImage 
                    src={displayUserData?.avatar_url} 
                    alt={username || "User"} 
                  />
                  <AvatarFallback>{username?.substring(0, 2).toUpperCase() || "GH"}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold">{displayUserData?.name || username}</h1>
                  <p className="text-xl text-muted-foreground mb-2">{displayUserData?.bio || "GitHub Developer"}</p>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                      <Github className="h-3 w-3" />
                      <span>{displayUserData?.login || username}</span>
                    </Badge>
                    {displayUserData?.location && (
                      <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                        <MapPin className="h-3 w-3" />
                        <span>{displayUserData.location}</span>
                      </Badge>
                    )}
                    {displayUserData?.email && (
                      <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                        <Mail className="h-3 w-3" />
                        <span>{displayUserData.email}</span>
                      </Badge>
                    )}
                    {displayUserData?.blog && (
                      <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                        <Globe className="h-3 w-3" />
                        <span>{displayUserData.blog}</span>
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {new Date(displayUserData?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <BookOpen className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{displayUserData?.public_repos || 0}</div>
                        <div className="text-xs text-muted-foreground">Repositories</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <User className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{displayUserData?.followers || 0}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <Star className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{displayRepos.reduce((sum, repo) => sum + repo.stargazers_count, 0)}</div>
                        <div className="text-xs text-muted-foreground">Stars</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <GitHubActivity className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{isViewingOthersProfile ? displayRepos.length : contributions.reduce((total, item) => total + item.count, 0)}</div>
                        <div className="text-xs text-muted-foreground">Contributions</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <Button size="sm" className="gap-1" onClick={() => window.open(`https://github.com/${displayUserData?.login || username}`, '_blank')}>
                    <Github className="h-3.5 w-3.5" />
                    <span>Follow on GitHub</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="gap-1" 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast.success("Profile URL copied to clipboard!");
                    }}
                  >
                    <Share2 className="h-3.5 w-3.5" />
                    <span>Share Profile</span>
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tabs Section */}
            <Tabs defaultValue="projects" className="mb-8">
              <TabsList className="mb-6 grid w-full grid-cols-3">
                <TabsTrigger value="projects">Projects</TabsTrigger>
                <TabsTrigger value="skills">Skills & Technologies</TabsTrigger>
                <TabsTrigger value="contributions">GitHub Contributions</TabsTrigger>
              </TabsList>
              
              {/* Projects Tab */}
              <TabsContent value="projects" className="space-y-6">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                  className="mb-6"
                >
                  <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        <h2 className="text-2xl font-bold">GitHub Repositories</h2>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="gap-1"
                        onClick={() => refetch()}
                      >
                        <FileCode className="h-4 w-4" />
                        <span>Refresh Data</span>
                      </Button>
                    </div>
                  </motion.div>
                </motion.div>
                
                {repositories.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {repositories.map((repo, index) => (
                      <RepositoryCard 
                        key={repo.id} 
                        repo={repo} 
                        index={index} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                      <BookOpen className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No repositories found</h3>
                    <p className="text-muted-foreground mb-4">
                      This GitHub account doesn't have any non-forked, active repositories to display.
                    </p>
                    <Button 
                      onClick={() => window.open(`https://github.com/new`, '_blank')}
                      className="gap-1"
                    >
                      <Github className="h-4 w-4" />
                      <span>Create a repository</span>
                    </Button>
                  </div>
                )}
              </TabsContent>
              
              {/* Skills Tab */}
              <TabsContent value="skills" className="space-y-6">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                      <Code className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">Skills & Technologies</h2>
                    </div>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Award className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">Identified Skills</CardTitle>
                          </div>
                          <CardDescription>Based on repository languages and topics</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {displayLanguages.map((lang) => (
                              <Badge 
                                key={lang.name} 
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 py-1 px-3 flex items-center gap-1.5"
                              >
                                <div 
                                  className="h-2 w-2 rounded-full" 
                                  style={{ backgroundColor: lang.color }}
                                />
                                {lang.name}
                              </Badge>
                            ))}
                            
                            {displayTopics.map((topic) => (
                              <Badge 
                                key={topic} 
                                variant="secondary"
                                className="bg-primary/10 text-primary hover:bg-primary/20 py-1 px-3"
                              >
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <Code className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">Languages</CardTitle>
                          </div>
                          <CardDescription>Programming language distribution</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={displayLanguages}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {displayLanguages.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  formatter={(value, name) => [`${value}%`, name]} 
                                  contentStyle={{
                                    borderRadius: "8px",
                                    background: "rgba(255, 255, 255, 0.8)",
                                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                                  }}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                          <div className="mt-4 flex flex-wrap justify-center gap-2">
                            {languages.map((lang) => (
                              <div key={lang.name} className="flex items-center gap-1">
                                <div 
                                  className="h-3 w-3 rounded-full" 
                                  style={{ backgroundColor: lang.color }}
                                ></div>
                                <span className="text-xs">{lang.name} ({lang.value}%)</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div variants={itemVariants} className="md:col-span-2">
                      <Card>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">Areas of Expertise</CardTitle>
                          </div>
                          <CardDescription>Based on repository analysis</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                            {expertiseAreas.frontend && (
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Zap className="h-5 w-5 text-primary" />
                                  <h3 className="font-semibold">Frontend Development</h3>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {expertiseAreas.frontend.map((skill, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {expertiseAreas.backend && (
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Zap className="h-5 w-5 text-primary" />
                                  <h3 className="font-semibold">Backend Development</h3>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {expertiseAreas.backend.map((skill, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {expertiseAreas.devops && (
                              <div className="bg-primary/5 p-4 rounded-lg">
                                <div className="flex items-center gap-2 mb-2">
                                  <Zap className="h-5 w-5 text-primary" />
                                  <h3 className="font-semibold">DevOps & Tools</h3>
                                </div>
                                <ul className="space-y-2 text-sm">
                                  {expertiseAreas.devops.map((skill, idx) => (
                                    <li key={idx} className="flex items-center gap-2">
                                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                                      <span>{skill}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            
                            {!expertiseAreas.frontend && !expertiseAreas.backend && !expertiseAreas.devops && (
                              <div className="md:col-span-3 text-center py-8">
                                <p className="text-muted-foreground">
                                  Not enough repository data to determine areas of expertise.
                                  Create and contribute to more GitHub repositories to build your profile.
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                </motion.div>
              </TabsContent>
              
              {/* Contributions Tab */}
              <TabsContent value="contributions" className="space-y-6">
                <motion.div
                  initial="hidden"
                  animate="visible"
                  variants={containerVariants}
                >
                  <motion.div variants={itemVariants} className="mb-6">
                    <div className="flex items-center gap-2 mb-6">
                      <GitHubActivity className="h-5 w-5 text-primary" />
                      <h2 className="text-2xl font-bold">GitHub Contributions</h2>
                    </div>
                  </motion.div>
                  
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">Weekly Activity</CardTitle>
                          <CardDescription>Contribution pattern across weekdays</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={weekdayActivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar 
                                  dataKey="commits" 
                                  fill="#8b5cf6" 
                                  radius={[4, 4, 0, 0]} 
                                  animationDuration={1500}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                    
                    <motion.div variants={itemVariants}>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-xl">Monthly Activity</CardTitle>
                          <CardDescription>Contribution trend over the past months</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={monthlyActivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Line 
                                  type="monotone" 
                                  dataKey="commits" 
                                  stroke="#8b5cf6" 
                                  strokeWidth={2} 
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                  animationDuration={1500}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="prs" 
                                  stroke="#06b6d4" 
                                  strokeWidth={2} 
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                  animationDuration={1500}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="issues" 
                                  stroke="#f97316" 
                                  strokeWidth={2} 
                                  dot={{ r: 3 }}
                                  activeDot={{ r: 5 }}
                                  animationDuration={1500}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  
                  <motion.div variants={itemVariants} className="mt-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-xl">Top Repositories</CardTitle>
                        <CardDescription>Most popular and active projects</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                          {repositories.length > 0 ? (
                            repositories
                              .sort((a, b) => b.stargazers_count - a.stargazers_count)
                              .slice(0, 6)
                              .map((repo) => (
                                <motion.div 
                                  key={repo.id}
                                  whileHover={{ y: -5 }}
                                  className="rounded-lg border p-4 hover:shadow-md transition-all"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold truncate">{repo.name}</h3>
                                    <Badge variant="outline" className="gap-1">
                                      <Star className="h-3 w-3" />
                                      <span>{repo.stargazers_count}</span>
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                                    {repo.description || "No description available"}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                      <div 
                                        className="h-2 w-2 rounded-full" 
                                        style={{ 
                                          backgroundColor: displayLanguages.find(l => l.name === repo.language)?.color 
                                            || "#6e7781" 
                                        }}
                                      ></div>
                                      <span className="text-xs">{repo.language || "Unknown"}</span>
                                    </div>
                                    <a 
                                      href={repo.html_url} 
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      <span>View</span>
                                    </a>
                                  </div>
                                </motion.div>
                              ))
                          ) : (
                            <div className="col-span-full text-center py-8">
                              <p className="text-muted-foreground">No repositories found</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </motion.div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageLayout>
  );
}

// Activity icon component
function GitHubActivity(props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="2" y="7" width="3" height="10" rx="1" />
      <rect x="8" y="5" width="3" height="14" rx="1" />
      <rect x="14" y="3" width="3" height="18" rx="1" />
      <rect x="20" y="6" width="3" height="12" rx="1" />
    </svg>
  );
}
