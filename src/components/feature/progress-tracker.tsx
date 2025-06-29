"use client";

import { Progress } from "@/components/ui/progress";

type ProgressTrackerProps = {
  completed: number;
  total: number;
};

export default function ProgressTracker({ completed, total }: ProgressTrackerProps) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <p className="text-md font-medium text-card-foreground">
          Today's Progress
        </p>
        <p className="text-lg font-bold text-card-foreground font-headline">
          {completed} / {total} tasks
        </p>
      </div>
      <Progress value={percentage} className="h-4 [&>div]:bg-accent" aria-label={`${Math.round(percentage)}% of tasks completed`} />
    </div>
  );
}
