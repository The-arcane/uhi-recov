"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getMotivationalFeedback } from '@/ai/flows/motivational-feedback';
import { useToast } from '@/hooks/use-toast';
import { Lightbulb, Loader2, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

type MotivationalFeedbackProps = {
  completionRate: number;
};

export default function MotivationalFeedback({ completionRate }: MotivationalFeedbackProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetFeedback = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const result = await getMotivationalFeedback({ completionRate });
      setMessage(result.message);
    } catch (error) {
      console.error("Failed to get motivational feedback:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "We couldn't generate a tip right now. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Lightbulb className="text-primary" />
          Motivational Corner
        </CardTitle>
        <CardDescription>
          Your current completion rate is {Math.round(completionRate * 100)}%. Get a tip for a little boost!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleGetFeedback} disabled={isLoading} className="w-full sm:w-auto font-semibold">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Get a Motivational Tip
            </>
          )}
        </Button>
        {message && (
          <Alert className="bg-primary/20 border-primary/50 mt-4 animate-in fade-in-50">
             <Sparkles className="h-4 w-4 text-primary" />
            <AlertTitle className="font-headline">Here's a tip for you!</AlertTitle>
            <AlertDescription className="text-primary-foreground/90">
              {message}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
