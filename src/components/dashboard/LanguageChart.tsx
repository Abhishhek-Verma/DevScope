
import { Code2 } from "lucide-react";
import { 
  PieChart as RePieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { calculateLanguageData } from "./LanguageUtils";

interface LanguageChartProps {
  repositories: any[];
  isLoading: boolean;
}

export function LanguageChart({ repositories, isLoading }: LanguageChartProps) {
  const languageData = calculateLanguageData(repositories);

  return (
    <ChartContainer
      title="Top Languages"
      description="Distribution of programming languages in your repositories"
      action={
        <Button variant="ghost" size="sm" className="gap-1">
          <Code2 className="h-3.5 w-3.5" />
          <span className="text-xs">Details</span>
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Skeleton className="h-[250px] w-[250px] rounded-full" />
        </div>
      ) : languageData.length === 0 ? (
        <div className="flex h-[300px] items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Code2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No language data available</p>
            <p className="text-xs mt-1">Create repositories with code to see language distribution</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={languageData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  animationDuration={1500}
                >
                  {languageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value, name) => [`${value}%`, name]}
                  contentStyle={{ 
                    borderRadius: "8px",
                    background: "rgba(255, 255, 255, 0.8)",
                    boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                  }}
                />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {languageData.map((lang, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: lang.color }} />
                <span className="text-xs text-muted-foreground">
                  {lang.name} ({lang.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartContainer>
  );
}
