import axios from 'axios';
import FormData from 'form-data';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { apiKeyService } from '../services/apiKeyService';
import { Base64 } from 'js-base64';

export const sendToWhisper = async (filePath: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
    type: 'audio/mp3',
    name: 'audio.mp3',
  });
  formData.append('model', 'whisper-1');

  const key = await apiKeyService.OPENAI_API_KEY();

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${key}`,
      },
    });

    // Save transcription to a .txt file
    const txtFilePath = filePath.replace('.mp4', '.txt');
    await RNFS.writeFile(txtFilePath, response.data.text, 'utf8');

    return response.data.text;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Error calling OpenAI Whisper API:', error);
    }
    throw error;
  }
};

export const generateTTS = async (text: string): Promise<string> => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/audio/speech',
      { model: 'tts-1', voice: 'alloy', input: text },
      {
        headers: {
          'Authorization': `Bearer ${await apiKeyService.OPENAI_API_KEY()}`,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    // Convert ArrayBuffer to Base64
    const uintArray = new Uint8Array(response.data);
    const base64String = Base64.fromUint8Array(uintArray);
    return base64String;
  } catch (error) {
    console.error('Error generating TTS:', error);
    throw error;
  }
};

