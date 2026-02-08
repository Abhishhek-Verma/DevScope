
import { Trophy } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";

export interface Achievement {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  date: string;
}

interface AchievementsCardProps {
  achievements: Achievement[];
}

export function AchievementsCard({ achievements }: AchievementsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-4 w-4 text-primary" />
          Achievements
        </CardTitle>
        <CardDescription>
          Milestones you've reached in your developer journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {achievements.map((achievement, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="rounded-full bg-primary/10 p-2">
                <achievement.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{achievement.title}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                <p className="mt-1 text-xs text-muted-foreground">Achieved: {achievement.date}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
