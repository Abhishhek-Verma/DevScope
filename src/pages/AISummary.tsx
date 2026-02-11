import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Download, RefreshCw, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navigate } from "react-router-dom";

export default function AISummary() {
  const { user, githubData, isGitHubDataLoading } = useAuth();
  const [summary, setSummary] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function loadSavedSummary() {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('summaries')
          .select('content')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSummary(data[0].content);
        }
      } catch (error) {
        // Silently fail
      }
    }
    
    loadSavedSummary();
  }, [user]);

  if (!user && !isGitHubDataLoading) {
    return <Navigate to="/login" />;
  }

  const generateSummary = async () => {
    if (!githubData) {
      toast.error("No GitHub data available to generate summary");
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { githubData },
      });
      
      if (error) throw error;
      
      if (data && data.summary) {
        setSummary(data.summary);
        
        await supabase
          .from('summaries')
          .upsert({
            user_id: user.id,
            content: data.summary,
          });
          
        toast.success("AI summary generated and saved!");
      } else {
        throw new Error("No summary returned from the API");
      }
    } catch (error) {
      toast.error("Failed to generate AI summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefresh = () => {
    generateSummary();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
  };

  const handleExport = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    const username = githubData?.userData?.login || user?.user_metadata?.preferred_username || "developer";
    element.download = `${username}-ai-summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Summary exported!");
  };

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">AI Summary</h1>
              <p className="text-muted-foreground">
                Insights and analysis of your GitHub contributions
              </p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2" 
              onClick={handleRefresh}
              disabled={isGenerating || isGitHubDataLoading}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Generate</span>
            </Button>
          </div>

          <Card className="mb-8 overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 bg-primary/5 pb-4">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Bot className="h-5 w-5 text-primary" />
                  <span>AI-Generated Summary</span>
                </CardTitle>
                <CardDescription>
                  Analysis based on your recent GitHub activity
                </CardDescription>
              </div>
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1"
                  onClick={handleShare}
                  disabled={!summary}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1"
                  onClick={handleExport}
                  disabled={!summary}
                >
                  <Download className="h-4 w-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-slate-50 to-white p-6 shadow-inner dark:from-slate-900/40 dark:to-slate-900/10">
                <div className="relative min-h-[300px] font-serif text-lg leading-relaxed">
                  {isGenerating ? (
                    <div className="flex h-full w-full flex-col items-center justify-center">
                      <Loader2 className="mb-4 h-8 w-8 animate-spin text-primary" />
                      <p className="text-muted-foreground">Analyzing your GitHub activity...</p>
                    </div>
                  ) : summary ? (
                    summary
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-center">
                      <Bot className="mb-4 h-16 w-16 text-muted-foreground/50" />
                      <p className="text-muted-foreground">
                        Click the "Generate" button to create an AI-powered summary of your GitHub activity.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-primary/5 px-6 py-4">
              <p className="text-xs text-muted-foreground">
                {summary && "Last updated: " + new Date().toLocaleDateString()}
              </p>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-base">How It Works</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-green"></div>
                    <span>Analyzes your GitHub repositories and activity</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-green"></div>
                    <span>Identifies your top programming languages</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-green"></div>
                    <span>Evaluates contribution patterns over time</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-green"></div>
                    <span>Creates a professional summary of your skills</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="bg-primary/5 pb-2">
                <CardTitle className="text-base">Uses For Your Summary</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-blue"></div>
                    <span>Add to your LinkedIn profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-blue"></div>
                    <span>Include in your developer portfolio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-blue"></div>
                    <span>Use in job applications and cover letters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="mt-1 h-2 w-2 rounded-full bg-chart-blue"></div>
                    <span>Share with your professional network</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
