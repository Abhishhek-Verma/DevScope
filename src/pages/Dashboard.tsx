
import { useEffect } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsSection } from "@/components/dashboard/StatsSection";
import { DashboardErrorAlert } from "@/components/dashboard/DashboardErrorAlert";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ActivityTab } from "@/components/dashboard/ActivityTab";
import { GoalsTab } from "@/components/dashboard/GoalsTab";

export default function Dashboard() {
  const { user, isLoading, githubData, isGitHubDataLoading, refreshGitHubData } = useAuth();

  if (!user && !isLoading) {
    return <Navigate to="/login" />;
  }

  return (
    <PageLayout>
      <div className="container py-6">
        <DashboardHeader />

        {!isLoading && !isGitHubDataLoading && !githubData && (
          <DashboardErrorAlert onRefresh={refreshGitHubData} />
        )}

        <StatsSection />

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="goals">Goals & Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>
          
          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>
          
          <TabsContent value="goals">
            <GoalsTab />
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
