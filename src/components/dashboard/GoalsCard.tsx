
import { Activity, Zap, LucideIcon } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoalItem } from "./GoalItem";

export interface Goal {
  name: string;
  current: number;
  target: number;
  icon: LucideIcon;
}

interface GoalsCardProps {
  goals: Goal[];
}

export function GoalsCard({ goals }: GoalsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          GitHub Goals
        </CardTitle>
        <CardDescription>
          Track your progress towards personal development goals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {goals.map((goal, index) => (
            <GoalItem
              key={index}
              name={goal.name}
              current={goal.current}
              target={goal.target}
              icon={goal.icon}
            />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Button>
            <Zap className="mr-2 h-4 w-4" />
            Add New Goal
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
