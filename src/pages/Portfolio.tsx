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
  const { user } = useAuth();
  const { 
    userData, 
    repositories, 
    languages, 
    contributions, 
    monthlyActivity, 
    topTopics, 
    isLoading, 
    error, 
    refetch 
  } = useGitHubData();

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

  // Determine areas of expertise based on repositories and languages
  const determineExpertiseAreas = () => {
    // Start with variables that can be modified
    let frontendCounter = 0;
    let backendCounter = 0;
    let devopsCounter = 0;
    
    // Scan through repositories and topics
    repositories.forEach(repo => {
      // Frontend signals
      if (
        repo.topics?.some(topic => 
          ['react', 'vue', 'angular', 'frontend', 'ui', 'web', 'html', 'css', 'javascript', 'typescript'].includes(topic)
        ) ||
        ['JavaScript', 'TypeScript', 'HTML', 'CSS'].includes(repo.language)
      ) {
        frontendCounter++;
      }
      
      // Backend signals
      if (
        repo.topics?.some(topic => 
          ['api', 'backend', 'server', 'database', 'node', 'express', 'django', 'flask', 'spring'].includes(topic)
        ) ||
        ['Python', 'Java', 'Go', 'PHP', 'Ruby', 'C#'].includes(repo.language)
      ) {
        backendCounter++;
      }
      
      // DevOps signals
      if (
        repo.topics?.some(topic => 
          ['devops', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'cicd', 'terraform', 'ansible'].includes(topic)
        ) ||
        ['Shell', 'HCL', 'Dockerfile'].includes(repo.language)
      ) {
        devopsCounter++;
      }
    });
    
    // Return the areas with significance
    return {
      frontend: frontendCounter > 0,
      backend: backendCounter > 0,
      devops: devopsCounter > 0
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

  // Redirect to login if not authenticated
  if (!user && !isLoading) {
    return <Navigate to="/login" />;
  }

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
                    src={userData?.avatar_url} 
                    alt={username || "User"} 
                  />
                  <AvatarFallback>{username?.substring(0, 2).toUpperCase() || "GH"}</AvatarFallback>
                </Avatar>
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold">{userData?.name || username}</h1>
                  <p className="text-xl text-muted-foreground mb-2">{userData?.bio || "GitHub Developer"}</p>
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                      <Github className="h-3 w-3" />
                      <span>{userData?.login || username}</span>
                    </Badge>
                    {userData?.location && (
                      <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                        <MapPin className="h-3 w-3" />
                        <span>{userData.location}</span>
                      </Badge>
                    )}
                    {userData?.email && (
                      <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                        <Mail className="h-3 w-3" />
                        <span>{userData.email}</span>
                      </Badge>
                    )}
                    {userData?.blog && (
                      <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                        <Globe className="h-3 w-3" />
                        <span>{userData.blog}</span>
                      </Badge>
                    )}
                    <Badge variant="outline" className="gap-1 border-devscope-200 px-2 py-1">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {new Date(userData?.created_at || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <BookOpen className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{userData?.public_repos || 0}</div>
                        <div className="text-xs text-muted-foreground">Repositories</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <User className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{userData?.followers || 0}</div>
                        <div className="text-xs text-muted-foreground">Followers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <Star className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0)}</div>
                        <div className="text-xs text-muted-foreground">Stars</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-800/90 rounded-lg px-3 py-2 shadow-sm">
                      <GitHubActivity className="h-4 w-4 text-devscope-600" />
                      <div>
                        <div className="font-semibold">{contributions.reduce((total, item) => total + item.count, 0)}</div>
                        <div className="text-xs text-muted-foreground">Contributions</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
                  <Button size="sm" className="gap-1" onClick={() => window.open(`https://github.com/${userData?.login || username}`, '_blank')}>
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
                            {languages.map((lang) => (
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
                            
                            {topTopics.map((topic) => (
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
                                  data={languages}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={90}
                                  paddingAngle={2}
                                  dataKey="value"
                                >
                                  {languages.map((entry, index) => (
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
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Responsive UI Design</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Single Page Applications</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Modern JS Frameworks</span>
                                  </li>
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
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>API Development</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Database Design</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Server Architecture</span>
                                  </li>
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
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>CI/CD Pipelines</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Container Technologies</span>
                                  </li>
                                  <li className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span>Cloud Services</span>
                                  </li>
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
                                          backgroundColor: languages.find(l => l.name === repo.language)?.color 
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
