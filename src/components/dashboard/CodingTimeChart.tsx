
import { 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";
import { ChartContainer } from "@/components/dashboard/ChartContainer";

interface CodingTimeChartProps {
  timeData: {
    name: string;
    hours: number;
  }[];
}

export function CodingTimeChart({ timeData }: CodingTimeChartProps) {
  return (
    <ChartContainer
      title="Daily Coding Time"
      description="Estimated time spent coding based on commit frequency"
    >
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis dataKey="name" />
            <YAxis />
            <RechartsTooltip 
              formatter={(value) => [`${value} hours`, "Coding Time"]}
              contentStyle={{
                borderRadius: "8px",
                background: "rgba(255, 255, 255, 0.8)",
                boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
              }}
            />
            <Line 
              type="monotone" 
              dataKey="hours" 
              stroke="#8b5cf6" 
              strokeWidth={2} 
              dot={{ r: 4, fill: "#8b5cf6" }}
              activeDot={{ r: 6 }}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}
