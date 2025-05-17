
import { Users, Share2, FileText, Download, Copy } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { toast } from "sonner";

interface PortfolioCardProps {
  portfolioUrl: string;
}

export function PortfolioCard({ portfolioUrl }: PortfolioCardProps) {
  return (
    <Card className="overflow-hidden border-t-4 border-t-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4 text-primary" />
          Public Developer Portfolio
        </CardTitle>
        <CardDescription>
          Share your developer profile and GitHub achievements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">Your Public Portfolio URL</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 gap-1"
              onClick={() => {
                const url = `${window.location.origin}${portfolioUrl}`;
                navigator.clipboard.writeText(url);
                toast.success("URL copied to clipboard!");
              }}
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </Button>
          </div>
          <div className="rounded-md bg-background p-2">
            <code className="break-all text-xs">
              {window.location.origin}{portfolioUrl}
            </code>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <Link to={portfolioUrl}>
            <Button className="gap-1">
              <Share2 className="h-3.5 w-3.5" />
              <span>View Portfolio</span>
            </Button>
          </Link>
          <Button variant="outline" className="gap-1">
            <FileText className="h-3.5 w-3.5" />
            <span>Export as PDF</span>
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            <span>Export as Markdown</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
