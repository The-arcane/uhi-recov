
"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { RECOVERY_PLANS } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { summarizeProgress, type SummarizeProgressOutput } from '@/ai/flows/summarize-progress-flow';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';
import { Separator } from '../ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const SESSION_ID_KEY = 'recovery_session_id';

const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};


export default function ProgressPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCondition = searchParams.get('condition');
  
  const [selectedCondition, setSelectedCondition] = useState<string | null>(initialCondition);
  const [userConditions, setUserConditions] = useState<{value: string, label: string}[]>([]);
  const [isLoadingConditions, setIsLoadingConditions] = useState(true);

  const plan = selectedCondition ? RECOVERY_PLANS[selectedCondition] : null;

  const [analysis, setAnalysis] = useState<SummarizeProgressOutput | null>(null);
  const [completedCount, setCompletedCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserConditions = async () => {
      const sessionId = getSessionId();
      if (!sessionId) {
          setIsLoadingConditions(false);
          return;
      };

      setIsLoadingConditions(true);
      setError(null);
      const { data, error: fetchError } = await supabase
          .from('daily_progress')
          .select('condition_key')
          .eq('session_id', sessionId);
      
      if (fetchError) {
          console.error("Failed to fetch user conditions", fetchError);
          setError("Could not load your list of recovery plans.");
      } else if (data) {
          const uniqueKeys = [...new Set(data.map(item => item.condition_key as string))];
          const conditions = uniqueKeys.map(key => ({
              value: key,
              label: RECOVERY_PLANS[key]?.name || key,
          })).filter(c => c.label !== c.value);
          
          setUserConditions(conditions);

          if (initialCondition && !uniqueKeys.includes(initialCondition)) {
              setSelectedCondition(null);
              router.replace('/progress', { scroll: false });
          }
      }
      setIsLoadingConditions(false);
    };
    fetchUserConditions();
  }, [initialCondition, router]);

  const handleConditionChange = (newCondition: string) => {
    setSelectedCondition(newCondition);
    router.push(`/progress?condition=${newCondition}`, { scroll: false });
  };

  useEffect(() => {
    if (!selectedCondition || !plan) {
        setIsLoading(false);
        setAnalysis(null);
        setCompletedCount(null);
        return;
    }

    const fetchProgressAndGenerateSummary = async () => {
        setIsLoading(true);
        setError(null);
        const sessionId = getSessionId();

        if (!sessionId) {
          setError("Could not identify your session. Please ensure local storage is enabled.");
          setIsLoading(false);
          return;
        }
        
        const { data: progressData, error: fetchError } = await supabase
            .from('daily_progress')
            .select('plan_date, completed_tasks')
            .eq('session_id', sessionId)
            .eq('condition_key', selectedCondition);

        if (fetchError) {
            console.error("Failed to fetch progress", fetchError);
            setError("Could not load your progress data from the database.");
            setIsLoading(false);
            return;
        }

        const totalCompleted = progressData.reduce((sum, day) => sum + (day.completed_tasks?.length || 0), 0);
        setCompletedCount(totalCompleted);

        const progressHistory = progressData.map(day => ({
            planDate: day.plan_date,
            completedTasks: day.completed_tasks || []
        }));
        
        try {
            const result = await summarizeProgress({
                conditionName: plan.name,
                progressHistory,
                totalCompletedCount: totalCompleted,
            });
            setAnalysis(result);
        } catch (e) {
            console.error("Failed to generate summary", e);
            setError("Could not generate your AI progress report. Please try again later.")
        } finally {
            setIsLoading(false);
        }
    };

    fetchProgressAndGenerateSummary();
  }, [selectedCondition, plan]);

  const renderContent = () => {
    if (isLoadingConditions) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <p>Loading your saved plans...</p>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error Loading Progress</AlertTitle>
                <AlertDescription>
                  {error}
                  <Button asChild variant="link" className="p-0 h-auto mt-2">
                    <Link href="/select-condition">Go back to selection page</Link>
                </Button>
                </AlertDescription>
            </Alert>
        );
    }

    if (userConditions.length === 0) {
        return (
            <div className="text-center text-muted-foreground pt-8 space-y-2">
                <p>You haven't saved any progress yet.</p>
                <Button asChild variant="link" className="p-0 h-auto">
                    <Link href="/select-condition">Start a new plan to see your progress</Link>
                </Button>
            </div>
        );
    }
    
    if (!selectedCondition) {
        return (
            <div className="text-center text-muted-foreground pt-8">
                <p>Please select a condition to view your progress report.</p>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <p>Loading your progress report...</p>
            </div>
        );
    }

    if (plan) {
        return (
             <div className="space-y-6 animate-in fade-in-50">
                <h3 className="text-xl font-semibold text-center">{plan.name}</h3>

                <div className="text-center p-6 bg-muted/50 rounded-lg">
                <p className="text-muted-foreground text-sm font-medium">TOTAL TASKS COMPLETED</p>
                <p className="text-5xl font-bold font-headline text-primary">{completedCount ?? 0}</p>
                </div>

                {analysis && (
                    <Card className="bg-primary/10 border-primary/30">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 font-headline text-primary-foreground/95">
                                <Sparkles className="h-5 w-5 text-primary" />
                                {analysis.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-primary-foreground/90">
                            <p>{analysis.summary}</p>
                            
                            <Separator className="bg-primary/20" />
                            
                            <div>
                                <h4 className="font-semibold mb-2">Benefits of Your Recent Activity</h4>
                                <p className="text-sm opacity-90">{analysis.benefits}</p>
                            </div>
                            
                            <Separator className="bg-primary/20" />

                            <div>
                                <h4 className="font-semibold mb-2">What to Expect Next</h4>
                                <p className="text-sm opacity-90">{analysis.lookahead}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-center pt-4">
                    <Button asChild>
                    <Link href={`/plan/${selectedCondition}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Plan
                    </Link>
                    </Button>
              </div>
            </div>
        );
    }

    return null;
  }

  return (
    <CardContent className="space-y-6">
        <div className="space-y-2">
            <Label htmlFor="condition-select" className="font-semibold">View Progress For</Label>
            <Select onValueChange={handleConditionChange} value={selectedCondition ?? ""} disabled={isLoadingConditions || userConditions.length === 0}>
                <SelectTrigger id="condition-select" className="h-12 text-base">
                    <SelectValue placeholder={isLoadingConditions ? "Loading plans..." : "Choose a recovery plan..."} />
                </SelectTrigger>
                <SelectContent>
                    {userConditions.map((cond) => (
                        <SelectItem key={cond.value} value={cond.value} className="text-base cursor-pointer">
                            {cond.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <Separator />
        
        {renderContent()}

    </CardContent>
  );
}
