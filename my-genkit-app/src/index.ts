import { configure } from '@genkit-ai/core';
import { defineFlow, runFlow } from '@genkit-ai/flow';
import { googleAI } from '@genkit-ai/google-genai';
import * as z from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

configure({
  plugins: [
    googleAI(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

export const analyzeMedicalDataFlow = defineFlow(
  {
    name: 'analyzeMedicalDataFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (symptoms) => {
    const model = googleAI.model('gemini-pro');
    const prompt = `As a medical professional, analyze these symptoms and provide possible diagnoses: ${symptoms}

Please include:
1. Potential conditions
2. Severity assessment
3. Recommended next steps`;
    
    const result = await model.generateContent({ prompt });
    return result.text();
  }
);

async function run() {
  const result = await runFlow(analyzeMedicalDataFlow, 'Fever, headache, fatigue, and sore throat');
  console.log(result);
}

run();
