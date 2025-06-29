
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import ProgressTracker from './progress-tracker';
import MotivationalFeedback from './motivational-feedback';
import { Button } from '../ui/button';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
    ArrowLeft, 
    BarChart3, 
    Loader2,
    Save,
    Bed,
    Snowflake,
    WrapText,
    ArrowUp,
    Pill,
    Dumbbell,
    Calendar as CalendarIcon,
    GlassWater,
    Thermometer,
    Bone,
    Eye,
    Heart,
    Bug,
    type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRecoveryState } from '@/hooks/use-recovery-state';
import { useRecoveryTasks } from '@/hooks/use-recovery-tasks';
import React, { useState } from 'react';
import { Calendar } from '../ui/calendar';
import { useToast } from '@/hooks/use-toast';

const iconMap: Record<string, LucideIcon> = {
    Bed,
    Snowflake,
    WrapText,
    ArrowUp,
    Pill,
    Dumbbell,
    Calendar: CalendarIcon, // Remap to avoid conflict with the component
    GlassWater,
    Thermometer,
    Bone,
    Eye,
    Heart,
    Bug,
};

export default function RecoveryPlanClient({ planName, condition }: { planName: string, condition: string }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  
  const { tasks, isLoading, error, dayNumber } = useRecoveryTasks(condition, planName, selectedDate);
  const { 
    completedTasks, 
    handleTaskToggle, 
    isInitialized, 
    saveProgress, 
    isSaving 
  } = useRecoveryState(condition, planName, selectedDate, tasks);

  const totalTasks = tasks?.length || 0;
  const completedCount = completedTasks.length;
  const completionRate = totalTasks > 0 ? completedCount / totalTasks : 0;

  const onSave = async () => {
    const saved = await saveProgress();
    if (saved) {
      toast({
          title: 'Progress Saved!',
          description: 'Your completed tasks for the day have been saved.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: 'Could not save your progress. Please try again.',
      });
    }
  }
  
  if (isLoading || !isInitialized) {
      return (
        <div className="flex flex-grow flex-col items-center justify-center text-lg font-semibold space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Our AI is crafting your personalized recovery plan...</p>
          <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </div>
      );
  }

  if (error) {
    return (
        <div className="flex flex-grow items-center justify-center">
             <Alert variant="destructive" className="max-w-lg">
                <AlertTitle>Error Generating Your Plan</AlertTitle>
                <AlertDescription>
                    {error}
                    <div className="mt-4">
                        <Button asChild>
                            <Link href="/select-condition">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Go Back
                            </Link>
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2 space-y-8">
            <header className="flex items-center justify-between gap-4">
            <Button variant="ghost" asChild>
                <Link href="/select-condition">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Change Condition
                </Link>
            </Button>
            <Button variant="outline" asChild>
                <Link href={`/progress?condition=${condition}`}>
                <BarChart3 className="mr-2 h-4 w-4" />
                View Progress Report
                </Link>
            </Button>
            </header>
            
            <Card className="shadow-lg overflow-hidden">
            <CardHeader className="bg-card">
                <CardTitle className="text-3xl font-bold font-headline">{planName}</CardTitle>
                <CardDescription className="text-lg">
                    {`Day ${dayNumber ?? 1}`} - Your AI-generated daily checklist for {selectedDate?.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 bg-card">
                <ProgressTracker completed={completedCount} total={totalTasks} />
            </CardContent>
            </Card>

            <Card>
            <CardHeader>
                <CardTitle className="font-headline">Daily Tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {tasks && tasks.length > 0 ? (
                    tasks.map((task) => {
                    const isCompleted = completedTasks.some(ct => ct.id === task.id);
                    const IconComponent = iconMap[task.icon] || Bug;
                    return (
                        <div
                        key={task.id}
                        className={cn(
                            "flex items-center gap-4 rounded-lg border p-4 transition-all duration-300",
                            isCompleted ? 'bg-accent/30' : 'bg-card'
                        )}
                        >
                        <Checkbox
                            id={task.id}
                            checked={isCompleted}
                            onCheckedChange={() => handleTaskToggle(task)}
                            className="h-6 w-6"
                            aria-label={`Mark task '${task.text}' as completed`}
                        />
                        <IconComponent className={cn("h-8 w-8 shrink-0", isCompleted ? 'text-muted-foreground' : 'text-primary')} />
                        <label
                            htmlFor={task.id}
                            className={cn(
                            "flex-1 text-lg font-medium transition-all duration-300 cursor-pointer",
                            isCompleted ? 'line-through text-muted-foreground' : 'text-card-foreground'
                            )}
                        >
                            {task.text}
                        </label>
                        </div>
                    );
                    })
                ) : (
                    <p>No tasks available for this day. Enjoy your rest!</p>
                )}

                 {tasks && tasks.length > 0 && (
                    <div className="flex justify-end pt-4">
                        <Button size="lg" onClick={onSave} disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-5 w-5" />
                                    Save Progress
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
            </Card>
        </div>

        <aside className="space-y-8 lg:mt-[5.5rem]">
            <Card className="shadow-lg">
                <CardHeader>
                    <CardTitle className="font-headline">Recovery Calendar</CardTitle>
                    <CardDescription>Select a day to view its tasks.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
            
            <MotivationalFeedback completionRate={completionRate} />
        </aside>

      </div>
  );
}
