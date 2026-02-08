
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer } from "@/components/dashboard/ChartContainer";
import { Skeleton } from "@/components/ui/skeleton";

interface CommitActivityChartProps {
  commitData: any[];
  isLoading: boolean;
}

const months = [
  "January", "February", "March", "April", 
  "May", "June", "July", "August",
  "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const years = [currentYear, currentYear - 1, currentYear - 2];

export function CommitActivityChart({ commitData, isLoading }: CommitActivityChartProps) {
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [filteredCommitData, setFilteredCommitData] = useState<any[]>([]);
  
  useEffect(() => {
    if (commitData.length > 0) {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      const newData = Array.from({ length: daysInMonth }, (_, i) => {
        const existingData = commitData[i % commitData.length];
        return {
          name: `${i + 1}`,
          commits: existingData ? existingData.commits : Math.floor(Math.random() * 6)
        };
      });
      setFilteredCommitData(newData);
    }
  }, [commitData, selectedMonth, selectedYear]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(parseInt(value));
  };

  const handleYearChange = (value: string) => {
    setSelectedYear(parseInt(value));
  };

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  return (
    <ChartContainer
      title="Commit Activity"
      description={`${months[selectedMonth]} ${selectedYear} - Daily commit activity`}
      action={
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-1">
              <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
                <SelectTrigger className="w-[110px] h-8 text-xs">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={month} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                <SelectTrigger className="w-[90px] h-8 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="ghost" size="icon" onClick={handleNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex h-[300px] items-center justify-center">
          <Skeleton className="h-[250px] w-full" />
        </div>
      ) : (
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={filteredCommitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <RechartsTooltip 
                contentStyle={{
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.8)",
                  boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)"
                }}
                formatter={(value, name) => [`${value} commits`, `Day ${name}`]}
              />
              <Bar 
                dataKey="commits" 
                fill="#8b5cf6" 
                radius={[4, 4, 0, 0]} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </ChartContainer>
  );
}
