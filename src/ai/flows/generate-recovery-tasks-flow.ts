'use server';
/**
 * @fileOverview An AI agent that generates a dynamic recovery plan for a given medical condition.
 *
 * - generateRecoveryTasks - A function that handles the dynamic task generation.
 * - GenerateRecoveryTasksInput - The input type for the generateRecoveryTasks function.
 * - GenerateRecoveryTasksOutput - The return type for the generateRecoveryTasks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { VALID_TASK_ICONS } from '@/lib/data';

const GenerateRecoveryTasksInputSchema = z.object({
  conditionName: z.string().describe("The name of the medical condition (e.g., 'Influenza (Flu)')."),
  conditionKey: z.string().describe("A unique key for the condition (e.g., 'flu')."),
  dayNumber: z.number().int().min(1).describe("The specific day number in the recovery plan (e.g., 1 for Day 1)."),
});
export type GenerateRecoveryTasksInput = z.infer<typeof GenerateRecoveryTasksInputSchema>;

const TaskSchema = z.object({
    id: z.string().describe("A unique ID for the task, formatted as '<conditionKey>-<dayNumber>-<index>'. For example: 'flu-1-1'."),
    text: z.string().describe('The description of the recovery task.'),
    icon: z.string().describe(`The name of a valid Lucide icon for the task. Must be one of: ${VALID_TASK_ICONS.join(', ')}`),
});

const GenerateRecoveryTasksOutputSchema = z.object({
  tasks: z.array(TaskSchema).describe('An array of 5 to 7 recovery tasks for the given condition and day number.'),
});
export type GenerateRecoveryTasksOutput = z.infer<typeof GenerateRecoveryTasksOutputSchema>;

export async function generateRecoveryTasks(input: GenerateRecoveryTasksInput): Promise<GenerateRecoveryTasksOutput> {
  return generateRecoveryTasksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateRecoveryTasksPrompt',
  input: {schema: GenerateRecoveryTasksInputSchema},
  output: {schema: GenerateRecoveryTasksOutputSchema},
  prompt: `You are a helpful medical assistant who creates simple, actionable recovery plans.
  Your goal is to generate a list of 5 to 7 daily tasks for Day {{{dayNumber}}} of a patient's recovery from: {{{conditionName}}}.
  The plan should be easy to understand and follow. As the days increase, the tasks can become progressively more demanding if appropriate for the condition.

  For each task, provide a unique ID using the condition key '{{{conditionKey}}}', the day number '{{{dayNumber}}}', and its index (e.g., '{{{conditionKey}}}-{{{dayNumber}}}-1', '{{{conditionKey}}}-{{{dayNumber}}}-2').

  For each task, you MUST select the most appropriate icon from this list of valid icon names:
  ${VALID_TASK_ICONS.join(', ')}

  Provide your response in the requested JSON format with an array of task objects.
  `,
  config: {
    temperature: 0.5,
  }
});

const generateRecoveryTasksFlow = ai.defineFlow(
  {
    name: 'generateRecoveryTasksFlow',
    inputSchema: GenerateRecoveryTasksInputSchema,
    outputSchema: GenerateRecoveryTasksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
