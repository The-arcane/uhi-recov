
"use client";

import { useState, useEffect } from 'react';
import { generateRecoveryTasks } from '@/ai/flows/generate-recovery-tasks-flow';
import type { Task } from './use-recovery-state';
import { differenceInCalendarDays, format, parseISO } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';


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

// Helper to manage plan start date in localStorage
const getPlanStartDate = (conditionKey: string): Date => {
    const storedDate = localStorage.getItem(`plan_start_date_${conditionKey}`);
    if (storedDate) {
        return parseISO(storedDate);
    }
    const newStartDate = new Date();
    localStorage.setItem(`plan_start_date_${conditionKey}`, newStartDate.toISOString());
    return newStartDate;
};


export function useRecoveryTasks(conditionKey: string | null, conditionName: string | null, planDate: Date | undefined) {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dayNumber, setDayNumber] = useState<number | null>(null);
  const [sessionId] = useState(getSessionId());

  useEffect(() => {
    if (!conditionKey || !conditionName || !planDate || !sessionId) {
        setIsLoading(false);
        setTasks(null);
        return;
    }

    const startDate = getPlanStartDate(conditionKey);
    const currentDayNumber = differenceInCalendarDays(planDate, startDate) + 1;

    // Do not generate plans for past dates or far future dates
    if (currentDayNumber < 1 || currentDayNumber > 100) { 
        setTasks([]);
        setIsLoading(false);
        setDayNumber(currentDayNumber);
        setError("This date is outside the typical recovery period.");
        return;
    }
    
    setDayNumber(currentDayNumber);

    const fetchAndSetTasks = async () => {
      setIsLoading(true);
      setError(null);
      const dateString = format(planDate, 'yyyy-MM-dd');

      // 1. Check database for a stored plan for this day
      const { data: storedPlan, error: fetchError } = await supabase
        .from('daily_plans')
        .select('tasks')
        .eq('session_id', sessionId)
        .eq('condition_key', conditionKey)
        .eq('plan_date', dateString)
        .maybeSingle();

      if (fetchError) {
          console.error("Error fetching stored plan", fetchError);
          setError("Could not load your plan from the database.");
          setIsLoading(false);
          return;
      }
      
      if (storedPlan) {
          setTasks(storedPlan.tasks as Task[]);
          setIsLoading(false);
          return;
      }

      // 2. If not in DB, generate with AI
      try {
        const result = await generateRecoveryTasks({ conditionKey, conditionName, dayNumber: currentDayNumber });
        if (result && result.tasks) {
          setTasks(result.tasks);
          // 3. Store the new plan in the database
          const { error: insertError } = await supabase
            .from('daily_plans')
            .upsert({
                session_id: sessionId,
                condition_key: conditionKey,
                plan_date: dateString,
                tasks: result.tasks
            }, {
                onConflict: 'session_id,condition_key,plan_date'
            });
          if (insertError) {
            // This is not a critical error, the user can still see the tasks
            console.error("Could not save the generated plan to the database", insertError);
          }
        } else {
            throw new Error("AI did not return valid tasks.");
        }
      } catch (err) {
        console.error("Failed to generate recovery tasks:", err);
        setError("Could not generate a recovery plan for this day. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAndSetTasks();
    
  }, [conditionKey, conditionName, planDate, sessionId]);

  return { tasks, isLoading, error, dayNumber };
}
