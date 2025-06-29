
"use client";

import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';

export type Task = {
  id: string;
  text: string;
  icon: string;
};

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

export function useRecoveryState(
  conditionKey: string | null,
  conditionName: string | null,
  planDate: Date | undefined,
  dailyTasks: Task[] | null,
) {
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [sessionId] = useState(getSessionId());

  useEffect(() => {
    if (!sessionId || !conditionKey || !planDate) {
      setIsInitialized(true);
      setCompletedTasks([]); // Reset for the new day
      return;
    }

    const fetchProgress = async () => {
      setIsInitialized(false);
      const dateString = format(planDate, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_progress')
        .select('completed_tasks')
        .eq('session_id', sessionId)
        .eq('condition_key', conditionKey)
        .eq('plan_date', dateString)
        .maybeSingle();

      if (error) {
        console.error("Failed to fetch daily progress from Supabase", error);
      } else if (data && data.completed_tasks) {
        setCompletedTasks((data.completed_tasks as Task[]) || []);
      } else {
        setCompletedTasks([]); // No record for this day yet
      }
      setIsInitialized(true);
    };

    fetchProgress();
  }, [conditionKey, sessionId, planDate]);

  const handleTaskToggle = useCallback((task: Task) => {
    setCompletedTasks((prev) => {
      const isCompleted = prev.some(ct => ct.id === task.id);
      if (isCompleted) {
        return prev.filter(ct => ct.id !== task.id);
      } else {
        return [...prev, task];
      }
    });
  }, []);

  const saveProgress = useCallback(async (): Promise<boolean> => {
    if (!sessionId || !planDate || !conditionKey) return false;
    setIsSaving(true);
    
    const dateString = format(planDate, 'yyyy-MM-dd');
    
    try {
        const { error } = await supabase
            .from('daily_progress')
            .upsert({
                session_id: sessionId,
                condition_key: conditionKey,
                plan_date: dateString,
                completed_tasks: completedTasks,
            }, {
                onConflict: 'session_id,condition_key,plan_date'
            });
        
        if (error) {
            console.error("Failed to save daily progress to Supabase", error);
            return false;
        }
        return true;
    } catch(error) {
        console.error("Failed to save daily progress to Supabase", error);
        return false;
    } finally {
        setIsSaving(false);
    }
  }, [sessionId, planDate, conditionKey, completedTasks]);

  return { completedTasks, handleTaskToggle, isInitialized, saveProgress, isSaving };
}
