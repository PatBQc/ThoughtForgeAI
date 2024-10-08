import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYSTEM_PROMPT as DEFAULT_SYSTEM_PROMPT, SYSTEM_PROMPT_SUBJECT } from '../utils/systemPrompt';
import { apiKeyService } from '../services/apiKeyService';
import RNFS from 'react-native-fs';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const getChatResponse = async (messages: Message[], fileName: string): Promise<string> => {
  try {
    const storedSystemPrompt = await AsyncStorage.getItem('SYSTEM_PROMPT');
    const systemPrompt = storedSystemPrompt || DEFAULT_SYSTEM_PROMPT;

    const allMessages: Message[] = [
      ...messages,
    ];

    const key = await apiKeyService.ANTHROPIC_API_KEY();

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
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const claudeResponse = response.data.content[0].text;

    // Save Claude's response to a .txt file
    const txtFilePath = fileName.replace('.mp4', '.txt');
    await RNFS.writeFile(txtFilePath, claudeResponse, 'utf8');

    return claudeResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Error calling Anthropic Claude API:', error);
    }
    throw error;
  }
};


export const getSubject = async (summary: string): Promise<string> => {
  try {
    const systemPrompt = SYSTEM_PROMPT_SUBJECT;

    const key = await apiKeyService.ANTHROPIC_API_KEY();

    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: summary }],
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
        },
      }
    );

    const claudeResponse = response.data.content[0].text;
    return claudeResponse;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Error calling Anthropic Claude API:', error);
    }
    throw error;
  }
};
