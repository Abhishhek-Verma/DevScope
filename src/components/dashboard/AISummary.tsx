import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, RefreshCw, Copy, Download, Bot } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { GitHubUserData } from "@/hooks/useGitHubData";

interface AISummaryProps {
  isLoading: boolean;
  githubData: any;
  userData: GitHubUserData | null;
}

export function AISummary({ isLoading, githubData, userData }: AISummaryProps) {
  const [summary, setSummary] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if we have a saved summary in the database when the component loads
  useEffect(() => {
    async function fetchSavedSummary() {
      if (!userData || !userData.id) return;
      
      try {
        const { data, error } = await supabase
          .from('summaries')
          .select('content')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setSummary(data[0].content);
        }
      } catch (error) {
        console.error("Error fetching saved summary:", error);
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
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-summary', {
        body: { githubData, userData },
      });
      
      if (error) throw error;
      
      if (data && data.summary) {
        setSummary(data.summary);
        toast.success("AI summary generated!");
        
        // Save the summary to the database
        saveSummaryToDatabase(data.summary);
      } else {
        throw new Error("No summary returned from the API");
      }
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate AI summary");
    } finally {
      setIsGenerating(false);
    }
  };

  const saveSummaryToDatabase = async (summaryText: string) => {
    if (!userData || !userData.id) {
      console.error("No user ID available to save summary");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from('summaries')
        .upsert({
          user_id: userData.id,
          content: summaryText,
        }, { onConflict: 'user_id' });
        
      if (error) throw error;
      
      console.log("Summary saved to database");
    } catch (error) {
      console.error("Error saving summary to database:", error);
    } finally {
      setIsSaving(false);
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
          An AI-generated professional summary based on your GitHub activity
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
                <p>Analyzing GitHub activity and generating your professional summary...</p>
              </>
            ) : (
              <>
                <p>Generate an AI summary of your GitHub activity and skills</p>
                <p className="mt-1 text-xs">This uses AI to create a professional developer bio</p>
              </>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          onClick={generateSummary} 
          disabled={isGenerating || isLoading || !githubData || isSaving}
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
