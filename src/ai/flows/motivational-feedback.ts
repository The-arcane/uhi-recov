'use server';

/**
 * @fileOverview An AI agent that provides motivational feedback based on the user's completion rate.
 *
 * - getMotivationalFeedback - A function that generates motivational feedback.
 * - MotivationalFeedbackInput - The input type for the getMotivationalFeedback function.
 * - MotivationalFeedbackOutput - The return type for the getMotivationalFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MotivationalFeedbackInputSchema = z.object({
  completionRate: z
    .number()
    .min(0)
    .max(1)
    .describe("The user's daily task completion rate (a number between 0 and 1)."),
});
export type MotivationalFeedbackInput = z.infer<typeof MotivationalFeedbackInputSchema>;

const MotivationalFeedbackOutputSchema = z.object({
  message: z.string().describe('A personalized motivational message.'),
});
export type MotivationalFeedbackOutput = z.infer<typeof MotivationalFeedbackOutputSchema>;

export async function getMotivationalFeedback(input: MotivationalFeedbackInput): Promise<MotivationalFeedbackOutput> {
  return motivationalFeedbackFlow(input);
}

const motivationalQuotes = [
  "The only way to do great work is to love what you do.",
  "Believe you can and you're halfway there.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Success is not final, failure is not fatal: It is the courage to continue that counts.",
  "It always seems impossible until it's done.",
];

const prompt = ai.definePrompt({
  name: 'motivationalFeedbackPrompt',
  input: {schema: MotivationalFeedbackInputSchema},
  output: {schema: MotivationalFeedbackOutputSchema},
  prompt: `You are a motivational coach providing encouragement to a user based on their task completion rate.

  Analyze the user's completion rate and provide a personalized message. Incorporate a relevant quote from the following list to enhance the message:
  {{#each motivationalQuotes}}
  - {{{this}}}
  {{/each}}

  Completion Rate: {{{completionRate}}}

  Message:`, // Keep the 'Message:' prefix, the LLM will complete it.
  config: {
    temperature: 0.7,
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_LOW_AND_ABOVE',
      },
    ],
  },
});

const motivationalFeedbackFlow = ai.defineFlow(
  {
    name: 'motivationalFeedbackFlow',
    inputSchema: MotivationalFeedbackInputSchema,
    outputSchema: MotivationalFeedbackOutputSchema,
  },
  async input => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    const quote = motivationalQuotes[randomIndex];
    const {output} = await prompt({...input, motivationalQuotes});
    return output!;
  }
);
