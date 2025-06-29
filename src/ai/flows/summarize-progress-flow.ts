'use server';
/**
 * @fileOverview An AI agent that generates a personalized summary of the user's recovery progress.
 *
 * - summarizeProgress - A function that handles the progress summarization.
 * - SummarizeProgressInput - The input type for the summarizeProgress function.
 * - SummarizeProgressOutput - The return type for the summarizeProgress function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskSchema = z.object({
  id: z.string(),
  text: z.string(),
  icon: z.string(),
});

const DailyProgressSchema = z.object({
    planDate: z.string().describe("The date of the plan in 'yyyy-MM-dd' format."),
    completedTasks: z.array(TaskSchema).describe("An array of tasks completed on this date."),
});

const SummarizeProgressInputSchema = z.object({
    conditionName: z.string().describe("The name of the user's medical condition."),
    progressHistory: z.array(DailyProgressSchema).describe("A history of the user's daily completed tasks."),
    totalCompletedCount: z.number().int().min(0).describe("Total number of tasks completed by the user so far."),
});
export type SummarizeProgressInput = z.infer<typeof SummarizeProgressInputSchema>;

const SummarizeProgressOutputSchema = z.object({
  title: z.string().describe("A short, encouraging title for the progress report. e.g., 'Fantastic Progress!' or 'Great Start!'"),
  summary: z.string().describe("A general summary of the user's progress, mentioning their consistency or encouraging them to continue."),
  benefits: z.string().describe("An analysis of the benefits of the specific tasks the user completed recently. Explain why those actions are helpful for recovery. This should be a paragraph."),
  lookahead: z.string().describe("A forward-looking statement that previews what the user might expect for the next day's recovery tasks, setting positive and realistic expectations."),
});
export type SummarizeProgressOutput = z.infer<typeof SummarizeProgressOutputSchema>;

export async function summarizeProgress(input: SummarizeProgressInput): Promise<SummarizeProgressOutput> {
  // If there's no history, generate a simple "getting started" message.
  if (input.progressHistory.length === 0) {
    return {
        title: "Ready to Start Your Recovery?",
        summary: `It looks like you're getting set up to recover from ${input.conditionName}. Completing your first day's tasks is the first step towards feeling better.`,
        benefits: "Once you complete some tasks, we'll analyze how they're helping you. For example, resting helps your body fight off illness, and staying hydrated is key for cellular repair.",
        lookahead: "Your first day's plan will focus on simple, crucial steps to get your recovery started on the right foot. You can do it!"
    }
  }
  return summarizeProgressFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeProgressPrompt',
  input: {schema: SummarizeProgressInputSchema},
  output: {schema: SummarizeProgressOutputSchema},
  prompt: `You are a friendly, insightful, and encouraging AI medical assistant.
  A user is recovering from {{{conditionName}}}.
  They have completed a total of {{{totalCompletedCount}}} tasks so far.

  Here is their recent progress history:
  {{#each progressHistory}}
  On {{planDate}}, they completed:
  {{#each completedTasks}}
  - {{text}}
  {{/each}}
  {{/each}}

  Based on this information, provide a detailed and personalized analysis of their progress.

  1.  **Title**: Write a short, positive, and encouraging title for the report.
  2.  **Summary**: Write a general 2-3 sentence summary of their overall progress. If they have completed many tasks, praise their consistency. If they have completed only a few, be gentle and encouraging.
  3.  **Benefits**: Look at the most recently completed tasks. Explain the *benefits* of these specific activities in relation to their recovery from {{{conditionName}}}. For example, if they rested and hydrated, explain why that's crucial. Write this as a single, helpful paragraph.
  4.  **Lookahead**: Provide a short, forward-looking statement. Briefly mention what the next stage of recovery might involve (e.g., "As you get stronger, tomorrow's plan might include some light activity..."). This should be motivating and set positive expectations.

  Respond in the required JSON format.
  `,
  config: {
    temperature: 0.7,
  }
});

const summarizeProgressFlow = ai.defineFlow(
  {
    name: 'summarizeProgressFlow',
    inputSchema: SummarizeProgressInputSchema,
    outputSchema: SummarizeProgressOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
