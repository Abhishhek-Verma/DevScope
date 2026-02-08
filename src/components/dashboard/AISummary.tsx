import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Copy, Download, Bot } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GitHubUserData } from "@/hooks/useGitHubData";
import { getLatestAISummary, saveAISummary, type AISummary as DBSummary } from "@/integrations/supabase/database";

interface AISummaryProps {
  isLoading: boolean;
  githubData: any;
  userData: GitHubUserData | null;
}

export function AISummary({ isLoading, githubData, userData }: AISummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Check if we have a saved summary in database when the component loads
  useEffect(() => {
    async function fetchSavedSummary() {
      if (!userData || !userData.id) return;
      
      try {
        // Try to load from database
        const savedSummary = await getLatestAISummary(userData.id);
        
        if (savedSummary) {
          setSummary(savedSummary.content);
        }
      } catch (error) {
        console.log("Error loading summary:", error);
      }
    }
    
    fetchSavedSummary();
  }, [userData]);

  const generateSummary = async () => {
    if (!githubData || !userData) {
      toast.error("No GitHub data available to generate summary");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Check if Gemini API key is available
      const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
      
      if (geminiKey && geminiKey.trim() !== '') {
        // Use Gemini API for better summary generation
        await generateGeminiSummary(geminiKey);
      } else {
        // Fallback to local generation
        await generateLocalSummary();
      }
      
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateGeminiSummary = async (apiKey: string) => {
    const repos = githubData.repositories || [];
    const contributions = githubData.contributions || [];
    
    try {
      // Prepare data for Gemini
      const languages = repos.map((r: any) => r.language).filter(Boolean);
      const topics = repos.flatMap((r: any) => r.topics || []);
      const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stargazers_count || 0), 0);
      const totalCommits = contributions.reduce((sum: number, item: any) => sum + (item.count || 0), 0);
      
      const prompt = `Generate a professional 3-4 sentence developer summary for ${userData.name || userData.login}.

GitHub Stats:
- Public Repositories: ${repos.length}
- Total Stars: ${totalStars}
- Recent Commits: ${totalCommits}
- Primary Languages: ${[...new Set(languages)].slice(0, 5).join(', ')}
- Topics/Skills: ${[...new Set(topics)].slice(0, 10).join(', ')}
- Bio: ${userData.bio || 'N/A'}

Create a concise, professional summary highlighting their expertise and contributions. Focus on their technical skills and development activity. Return only the summary text without any additional formatting or explanations.`;

      console.log('Calling Gemini API with model: gemini-2.5-flash-lite');
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Gemini API error:', response.status, errorData);
        toast.error(`Gemini API failed (${response.status}), using local generation`);
        await generateLocalSummary();
        return;
      }

      const data = await response.json();
      console.log('Gemini API response:', data);
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        console.error('Invalid Gemini API response structure:', data);
        toast.error('Invalid AI response, using local generation');
        await generateLocalSummary();
        return;
      }
      
      const generatedSummary = data.candidates[0].content.parts[0].text.trim();
      
      setSummary(generatedSummary);
      toast.success("AI-powered summary generated with Gemini!");
      await saveSummaryToDatabase(generatedSummary, 'gemini', 'gemini-2.5-flash-lite');
    } catch (error) {
      console.error('Gemini API error:', error);
      toast.error('Gemini API failed, using local generation');
      await generateLocalSummary();
    }
  };

  const generateLocalSummary = async () => {
    // Generate a professional summary using the GitHub data
    const repos = githubData.repositories || [];
    const contributions = githubData.contributions || [];
      
      // Get top languages
      const languageMap: Record<string, number> = {};
      repos.forEach((repo: any) => {
        if (repo.language) {
          languageMap[repo.language] = (languageMap[repo.language] || 0) + 1;
        }
      });
      
      const topLanguages = Object.entries(languageMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([lang]) => lang);
      
      // Calculate metrics
      const totalStars = repos.reduce((sum: number, repo: any) => sum + (repo.stars || repo.stargazers_count || 0), 0);
      const totalCommits = contributions.reduce((sum: number, item: any) => sum + (item.commits || item.count || 0), 0);
      const totalRepos = userData.public_repos || repos.length;
      
      // Get repository topics
      const allTopics: string[] = [];
      repos.forEach((repo: any) => {
        if (repo.topics && Array.isArray(repo.topics)) {
          allTopics.push(...repo.topics);
        }
      });
      
      const topicCounts = allTopics.reduce((acc: Record<string, number>, topic) => {
        acc[topic] = (acc[topic] || 0) + 1;
        return acc;
      }, {});
      
      const topTopics = Object.entries(topicCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([topic]) => topic);
      
      // Build summary
      const summaryParts = [];
      
      summaryParts.push(`${userData.name || userData.login} is a ${totalRepos > 10 ? 'prolific' : 'dedicated'} developer with ${totalRepos} public repositories on GitHub.`);
      
      if (topLanguages.length > 0) {
        summaryParts.push(`Proficient in ${topLanguages.join(', ')}, ${userData.login} demonstrates versatility across multiple programming languages.`);
      }
      
      if (totalCommits > 0) {
        summaryParts.push(`With ${totalCommits} contributions in recent months, ${userData.login} shows consistent engagement with the development community.`);
      }
      
      if (totalStars > 0) {
        summaryParts.push(`Their work has garnered ${totalStars} stars, indicating community appreciation and code quality.`);
      }
      
      if (topTopics.length > 0) {
        summaryParts.push(`Areas of expertise include ${topTopics.slice(0, 3).join(', ')}.`);
      }
      
      if (userData.bio) {
        summaryParts.push(`${userData.bio}`);
      }
      
      const generatedSummary = summaryParts.join(' ');
      setSummary(generatedSummary);
      toast.success("Professional summary generated!");
      
      // Save to database instead of localStorage
      await saveSummaryToDatabase(generatedSummary, 'local');
  };

  const saveSummaryToDatabase = async (content: string, type: 'gemini' | 'local', model?: string) => {
    if (!userData?.id) {
      console.error("No user ID available to save summary");
      return;
    }
    
    try {
      const summaryData: DBSummary = {
        user_id: userData.id,
        content,
        generation_type: type,
        model_version: model
      };
      
      await saveAISummary(summaryData);
      console.log('Summary saved to database');
    } catch (error) {
      console.error('Error saving summary to database:', error);
      // Don't show error toast to user - summary is still displayed
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(summary);
    toast.success("Summary copied to clipboard!");
  };

  const downloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([summary], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `${userData?.login || "developer"}-ai-summary.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Summary downloaded!");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="h-4 w-4 text-primary" />
          AI-Generated Developer Summary
        </CardTitle>
        <CardDescription>
          {import.meta.env.VITE_GEMINI_API_KEY ? 
            "Using Google Gemini AI to generate your professional summary" : 
            "An AI-generated professional summary based on your GitHub activity"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {summary ? (
          <div className="rounded-md bg-primary/5 p-4 text-sm leading-relaxed">
            {summary}
          </div>
        ) : (
          <div className="flex h-32 flex-col items-center justify-center rounded-md bg-primary/5 p-4 text-center text-sm text-muted-foreground">
            {isGenerating ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin text-primary" />
                <p>Analyzing GitHub activity and generating professional summary...</p>
              </>
            ) : (
              <>
                <p>Generate an AI summary of your GitHub activity and skills</p>
                <p className="mt-1 text-xs">
                  {import.meta.env.VITE_GEMINI_API_KEY ? 
                    "Google Gemini AI configured - will generate enhanced summary" : 
                    "Add VITE_GEMINI_API_KEY to .env for AI-powered generation"}
                </p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={generateSummary} 
          disabled={isGenerating || isLoading || !githubData}
          className="gap-2"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {summary ? "Regenerate Summary" : "Generate Summary"}
        </Button>
        
        {summary && (
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={downloadSummary}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
