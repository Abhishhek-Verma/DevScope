
import { 
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { ChartContainer } from "@/components/dashboard/ChartContainer";

interface ActivityOverviewChartProps {
  activityData: {
    name: string;
    commits: number;
    prs: number;
    issues: number;
  }[];
}

export function ActivityOverviewChart({ activityData }: ActivityOverviewChartProps) {
  return (
    <ChartContainer
      title="Weekly Activity Overview"
      description="Combined GitHub activity showing commits, PRs, and issues"
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={activityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip 
              contentStyle={{
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Area 
              type="monotone" 
              dataKey="commits" 
              stackId="1" 
              stroke="#8b5cf6" 
              fill="#8b5cf6" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="prs" 
              stackId="1" 
              stroke="#06b6d4" 
              fill="#06b6d4" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="issues" 
              stackId="1" 
              stroke="#10b981" 
              fill="#10b981" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#8b5cf6]"></div>
          <span className="text-xs">Commits</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#06b6d4]"></div>
          <span className="text-xs">Pull Requests</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 rounded-full bg-[#10b981]"></div>
          <span className="text-xs">Issues</span>
        </div>
      </div>
    </ChartContainer>
  );
}
