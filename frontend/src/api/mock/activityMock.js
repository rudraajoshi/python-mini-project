import { delay } from './mockClient.js';
import { activity, suggestedQuestions } from './data.js';

export async function list() {
  await delay(260);
  return { results: structuredClone(activity), suggestions: suggestedQuestions };
}
