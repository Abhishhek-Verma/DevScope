
import { useState } from "react";
import { Activity, Zap, LucideIcon, Plus } from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoalItem } from "./GoalItem";
import { toast } from "sonner";

export interface Goal {
  name: string;
  current: number;
  target: number;
  icon: LucideIcon;
}

interface GoalsCardProps {
  goals: Goal[];
  onAddGoal?: (name: string, target: number) => void;
}

export function GoalsCard({ goals, onAddGoal }: GoalsCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [goalName, setGoalName] = useState("");
  const [goalTarget, setGoalTarget] = useState("");

  const handleSubmit = () => {
    if (!goalName.trim()) {
      toast.error("Please enter a goal name");
      return;
    }
    if (!goalTarget || parseInt(goalTarget) <= 0) {
      toast.error("Please enter a valid target number");
      return;
    }

    if (onAddGoal) {
      onAddGoal(goalName.trim(), parseInt(goalTarget));
      toast.success("Goal added successfully!");
    }
    
    setGoalName("");
    setGoalTarget("");
    setIsDialogOpen(false);
  };

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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>
                  Create a custom goal to track your GitHub progress.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="goal-name">Goal Name</Label>
                  <Input
                    id="goal-name"
                    placeholder="e.g., Pull Requests Merged"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="goal-target">Target</Label>
                  <Input
                    id="goal-target"
                    type="number"
                    placeholder="e.g., 50"
                    value={goalTarget}
                    onChange={(e) => setGoalTarget(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleSubmit}>Add Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
