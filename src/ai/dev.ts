import { config } from 'dotenv';
config();

import '@/ai/flows/motivational-feedback.ts';
import '@/ai/flows/analyze-prescription-flow.ts';
import '@/ai/flows/generate-recovery-tasks-flow.ts';
import '@/ai/flows/summarize-progress-flow.ts';
