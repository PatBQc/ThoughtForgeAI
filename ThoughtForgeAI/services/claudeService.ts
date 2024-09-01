import axios from 'axios';
import { CLAUDE_API_KEY } from '@env';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

export const getChatResponse = async (prompt: string): Promise<string> => {
  try {
    console.log('Calling Claude API with prompt: ', prompt);
    console.log('Calling Claude API with key (new): ', CLAUDE_API_KEY);
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': CLAUDE_API_KEY,
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return response.data.content[0].text;
  } catch (error) {
    console.error('Error calling Claude API:', error);
    throw error;
  }
};
