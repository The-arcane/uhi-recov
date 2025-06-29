'use server';
/**
 * @fileOverview An AI agent that analyzes user-described symptoms to suggest a recovery plan.
 *
 * - analyzeSymptoms - A function that handles the symptom analysis.
 * - AnalyzeSymptomsInput - The input type for the analyzeSymptoms function.
 * - AnalyzeSymptomsOutput - The return type for the analyzeSymptoms function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RECOVERY_PLANS } from '@/lib/data';

const AnalyzeSymptomsInputSchema = z.object({
  symptoms: z.string().describe("A user's description of their medical symptoms."),
});
export type AnalyzeSymptomsInput = z.infer<typeof AnalyzeSymptomsInputSchema>;

const validConditionKeys = Object.keys(RECOVERY_PLANS).filter(k => k !== 'other'); // Exclude 'other' from matching

const AnalyzeSymptomsOutputSchema = z.object({
  conditionKey: z.string().describe(`The single most likely condition key that best matches the symptoms. Must be one of the following values: ${validConditionKeys.join(', ')}, or 'other'.`),
  conditionName: z.string().describe("The name of the condition. If a matching plan is found, this should be the plan's name. If no plan is found (key is 'other'), generate a concise, user-friendly name for the condition based on the symptoms (e.g., 'Minor Head Cold', 'Ankle Strain')."),
  reasoning: z.string().describe('A brief, user-friendly explanation for why this condition was chosen.'),
  isDynamic: z.boolean().describe('Set to true if a new, dynamic plan was created (i.e., conditionKey is "other"). Otherwise, false.'),
});
export type AnalyzeSymptomsOutput = z.infer<typeof AnalyzeSymptomsOutputSchema>;

export async function analyzeSymptoms(input: AnalyzeSymptomsInput): Promise<AnalyzeSymptomsOutput> {
  return analyzeSymptomsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeSymptomsPrompt',
  input: {schema: AnalyzeSymptomsInputSchema},
  output: {schema: AnalyzeSymptomsOutputSchema},
  prompt: `You are a helpful medical assistant. Your task is to analyze a user's described symptoms and determine the most appropriate recovery plan.

Available pre-defined recovery plans: ${JSON.stringify(RECOVERY_PLANS, null, 2)}

1.  Read the user's symptoms carefully.
2.  Compare the symptoms against the available pre-defined recovery plans.
3.  **If there is a clear and strong match**, set 'conditionKey' to the corresponding key (e.g., 'flu') and 'conditionName' to its name. Set 'isDynamic' to false.
4.  **If there is no clear match**, you must create a dynamic plan. Set 'conditionKey' to 'other'. Based on the symptoms, generate a new, concise, user-friendly 'conditionName' (e.g., 'Sore Throat and Cough', 'Mild Ankle Sprain'). Set 'isDynamic' to true.
5.  Provide a 'reasoning' to explain your choice to the user. If you chose a pre-defined plan, explain why. If you created a dynamic one, explain that you've tailored a new plan for their specific symptoms.

User's Symptoms: "{{{symptoms}}}"`,
  config: {
    temperature: 0.3,
  }
});

const analyzeSymptomsFlow = ai.defineFlow(
  {
    name: 'analyzeSymptomsFlow',
    inputSchema: AnalyzeSymptomsInputSchema,
    outputSchema: AnalyzeSymptomsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
