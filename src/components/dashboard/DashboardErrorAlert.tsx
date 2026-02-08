
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface DashboardErrorAlertProps {
  onRefresh: () => void;
}

export function DashboardErrorAlert({ onRefresh }: DashboardErrorAlertProps) {
  return (
    <Alert variant="destructive" className="mb-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Failed to load GitHub data</AlertTitle>
      <AlertDescription>
        We couldn't load your GitHub data. Please try refreshing or check your authentication.
      </AlertDescription>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2"
        onClick={onRefresh}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Retry
      </Button>
    </Alert>
  );
}
