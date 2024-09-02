import axios from 'axios';
import { CLAUDE_API_KEY } from '@env';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYSTEM_PROMPT as DEFAULT_SYSTEM_PROMPT } from '../utils/systemPrompt';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const getChatResponse = async (messages: Message[]): Promise<string> => {
  try {
    const storedSystemPrompt = await AsyncStorage.getItem('SYSTEM_PROMPT');
    const systemPrompt = storedSystemPrompt || DEFAULT_SYSTEM_PROMPT;

    const allMessages: Message[] = [
      ...messages
    ];

    const response = await axios.post(
        CLAUDE_API_URL,
        {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          system: systemPrompt,
          messages: allMessages,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01',
          },
        }
      );

    return response.data.content[0].text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Error calling Claude API:', error);
    }
    throw error;
  }
};
