import { Button } from "@/components/ui/button";
import { Link, Navigate } from "react-router-dom";
import { Code2, Github, Home, Briefcase, Laptop, BarChart, User, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

const Index = () => {
  const { user, isLoading, githubData } = useAuth();

  // Redirect to dashboard if already logged in
  if (user && !isLoading) {
    return <Navigate to="/dashboard" />;
  }

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

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="h-6 w-6 text-primary" />
            <span className="font-heading text-lg font-bold">DevScope</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/login">
              <Button size="sm" className="gap-1">
                <Github className="h-4 w-4" />
                Login
              </Button>
            </Link>
          </div>
        </div>
      </header>
      
      <main className="flex-1">
        {/* Welcome Banner for logged-in users */}
        {user && !isLoading && (
          <section className="bg-gradient-to-r from-devscope-100 to-white py-8 dark:from-devscope-900/20 dark:to-devscope-900/5">
            <div className="container">
              <div className="flex items-center gap-4 flex-wrap">
                <Avatar className="h-16 w-16 border-4 border-white dark:border-gray-800 shadow-lg">
                  <AvatarImage src={githubData?.userData?.avatar_url || user.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {(user.user_metadata?.preferred_username || user.email)?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold">Welcome, {user.user_metadata?.preferred_username || user.email?.split('@')[0]}!</h2>
                  <p className="text-muted-foreground">Track your GitHub journey and showcase your developer profile</p>
                  <div className="mt-2 flex gap-2">
                    <Link to="/dashboard">
                      <Button size="sm" className="gap-1">
                        <BarChart className="h-4 w-4" />
                        Dashboard
                      </Button>
                    </Link>
                    <Link to={`/portfolio/${user.user_metadata?.preferred_username || user.email?.split('@')[0]}`}>
                      <Button size="sm" variant="outline" className="gap-1">
                        <User className="h-4 w-4" />
                        My Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="py-16 md:py-24">
          <div className="container flex flex-col items-center text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="mb-4 rounded-full bg-primary/10 p-4"
            >
              <Code2 className="h-8 w-8 text-primary" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-gradient mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl"
            >
              Visualize Your Developer Journey
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-8 max-w-[42rem] text-lg text-muted-foreground md:text-xl"
            >
              Track your GitHub contributions, analyze your coding patterns, and showcase your developer story with beautiful visualizations.
            </motion.p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col gap-4 sm:flex-row"
            >
              <Link to="/login">
                <Button size="lg" className="w-full gap-2 sm:w-auto bg-gradient-to-r from-devscope-600 to-devscope-500 hover:from-devscope-700 hover:to-devscope-600">
                  <Github className="h-5 w-5" />
                  <span>Sign in with GitHub</span>
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
        
        {/* About Me Section */}
        <section className="py-16 bg-primary/5" id="about">
          <div className="container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="flex flex-col md:flex-row items-center gap-12"
            >
              <div className="md:w-1/2">
                <motion.div variants={itemVariants} className="mb-2">
                  <Badge className="mb-4 text-sm">About DevScope</Badge>
                </motion.div>
                <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-6">Developer Portfolio Platform Built For You</motion.h2>
                <motion.p variants={itemVariants} className="text-muted-foreground mb-4">
                  DevScope helps developers showcase their skills, track their GitHub activity, and create impressive portfolios to share with potential employers or clients.
                </motion.p>
                <motion.p variants={itemVariants} className="text-muted-foreground mb-6">
                  Whether you're a junior developer looking for your first role, or a senior developer showing off your latest projects, DevScope gives you the tools to highlight your best work.
                </motion.p>
                <motion.div variants={itemVariants}>
                  <Link to="/login">
                    <Button className="gap-2">
                      <User className="h-4 w-4" />
                      Create Your Portfolio
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <motion.div 
                variants={itemVariants}
                className="md:w-1/2 bg-gradient-to-br from-devscope-100 to-white dark:from-devscope-900/30 dark:to-devscope-800/10 p-8 rounded-xl shadow-lg"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Github className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">GitHub Integration</h3>
                    <p className="text-xs text-center text-muted-foreground">Connect your GitHub account to display your activity</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <BarChart className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Analytics Dashboard</h3>
                    <p className="text-xs text-center text-muted-foreground">Visualize your coding patterns and contributions</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Briefcase className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Portfolio Showcase</h3>
                    <p className="text-xs text-center text-muted-foreground">Create beautiful project displays</p>
                  </div>
                  <div className="flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <Laptop className="h-8 w-8 text-primary mb-2" />
                    <h3 className="font-semibold">Custom Domains</h3>
                    <p className="text-xs text-center text-muted-foreground">Use your own domain for your portfolio</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
        
        {/* Technologies Section */}
        <section className="py-16" id="technologies">
          <div className="container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="text-center mb-12"
            >
              <motion.div variants={itemVariants} className="mb-2 flex justify-center">
                <Badge className="mb-4 text-sm">Technologies</Badge>
              </motion.div>
              <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">Built With Modern Tech Stack</motion.h2>
              <motion.p variants={itemVariants} className="max-w-2xl mx-auto text-muted-foreground">
                DevScope leverages the latest web technologies to provide a seamless and responsive experience.
              </motion.p>
            </motion.div>
            
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
            >
              {[
                { name: "React", icon: "⚛️", color: "bg-blue-100 dark:bg-blue-900/30" },
                { name: "TypeScript", icon: "TS", color: "bg-blue-100 dark:bg-blue-900/30" },
                { name: "Tailwind CSS", icon: "🎨", color: "bg-teal-100 dark:bg-teal-900/30" },
                { name: "Supabase", icon: "⚡", color: "bg-green-100 dark:bg-green-900/30" },
                { name: "GitHub API", icon: "🐙", color: "bg-purple-100 dark:bg-purple-900/30" },
                { name: "Recharts", icon: "📊", color: "bg-red-100 dark:bg-red-900/30" },
                { name: "Framer Motion", icon: "✨", color: "bg-indigo-100 dark:bg-indigo-900/30" },
                { name: "Shadcn UI", icon: "🧩", color: "bg-gray-100 dark:bg-gray-800" },
              ].map((tech, index) => (
                <motion.div
                  key={tech.name}
                  variants={itemVariants}
                  className={`${tech.color} p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow`}
                >
                  <div className="text-2xl mb-2">{tech.icon}</div>
                  <h3 className="font-semibold">{tech.name}</h3>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-devscope-100 to-white dark:from-devscope-900/20 dark:to-devscope-900/5">
          <div className="container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={containerVariants}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.h2 variants={itemVariants} className="text-3xl font-bold mb-4">Ready to showcase your developer journey?</motion.h2>
              <motion.p variants={itemVariants} className="mb-8 text-muted-foreground">
                Create your developer portfolio, track your GitHub activity, and share your coding story with the world.
              </motion.p>
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/login">
                  <Button size="lg" className="gap-2 w-full sm:w-auto bg-gradient-to-r from-devscope-600 to-devscope-500 hover:from-devscope-700 hover:to-devscope-600">
                    <Github className="h-5 w-5" />
                    <span>Get Started Now</span>
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button size="lg" variant="outline" className="gap-2 w-full sm:w-auto">
                    <ArrowRight className="h-5 w-5" />
                    <span>Explore Dashboard</span>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">© 2025 DevScope. All rights reserved.</span>
          </div>
          <div className="flex gap-6">
            <a href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
            <a href="#technologies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Technologies
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Index;
