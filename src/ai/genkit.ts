import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

export const ai = genkit({
  plugins: [googleAI({tools: [googleAI.webSearch()]})],
  model: 'googleai/gemini-2.0-flash',
});
