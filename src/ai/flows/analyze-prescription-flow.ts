
'use server';
/**
 * @fileOverview An AI agent that analyzes a prescription document and identifies the medical condition.
 *
 * - analyzePrescription - A function that handles the prescription analysis.
 * - AnalyzePrescriptionInput - The input type for the analyzePrescription function.
 * - AnalyzePrescriptionOutput - The return type for the analyzePrescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { RECOVERY_PLANS } from '@/lib/data';

const AnalyzePrescriptionInputSchema = z.object({
  prescriptionDataUri: z
    .string()
    .describe(
      "A medical prescription document (image, PDF, etc.), as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzePrescriptionInput = z.infer<typeof AnalyzePrescriptionInputSchema>;

const validConditionKeys = Object.keys(RECOVERY_PLANS);

const AnalyzePrescriptionOutputSchema = z.object({
  conditionKey: z.string().describe(`The single most likely condition key that best matches the prescription. Must be one of the following values: ${validConditionKeys.join(', ')}`),
  reasoning: z.string().describe('A brief, user-friendly explanation for why this condition was chosen based on the prescription.'),
});
export type AnalyzePrescriptionOutput = z.infer<typeof AnalyzePrescriptionOutputSchema>;

export async function analyzePrescription(input: AnalyzePrescriptionInput): Promise<AnalyzePrescriptionOutput> {
  return analyzePrescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzePrescriptionPrompt',
  input: {schema: AnalyzePrescriptionInputSchema},
  output: {schema: AnalyzePrescriptionOutputSchema},
  prompt: `You are a highly accurate medical assistant. Your task is to analyze the provided medical prescription document (which could be an image, PDF, or other document format) and strictly match the diagnosed condition to ONE of the following available recovery plan keys.

Your analysis must be based *only* on the explicit diagnosis written in the document. Do not infer relationships to other conditions that are not mentioned. If the prescription says "Acute Myocardial Infarction", you must find the best match for that exact condition from the list.

Available plan keys: ${validConditionKeys.join(', ')}

1.  Carefully read the 'Diagnosis' section of the prescription document.
2.  Compare the diagnosis to the available plan keys. Select the single best match.
3.  For your 'reasoning', state the diagnosis found in the document and explain why you chose the corresponding plan key. For example: "The diagnosis is 'Influenza', so I have selected the 'flu' recovery plan."

Prescription Document: {{media url=prescriptionDataUri}}`,
  config: {
    temperature: 0.2,
  }
});

const analyzePrescriptionFlow = ai.defineFlow(
  {
    name: 'analyzePrescriptionFlow',
    inputSchema: AnalyzePrescriptionInputSchema,
    outputSchema: AnalyzePrescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
