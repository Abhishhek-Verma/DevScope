
import { LucideIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface GoalItemProps {
  name: string;
  current: number;
  target: number;
  icon: LucideIcon;
}

export function GoalItem({ name, current, target, icon: Icon }: GoalItemProps) {
  const percentage = Math.round((current / target) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <span className="font-medium">{name}</span>
        </div>
        <span className="text-sm">{current}/{target}</span>
      </div>
      <Progress value={percentage} className="h-2" />
      <p className="text-xs text-muted-foreground">
        {percentage}% complete
      </p>
    </div>
  );
}
