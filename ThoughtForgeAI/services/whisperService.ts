import axios from 'axios';
import FormData from 'form-data';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';

const OPENAI_API_KEY = '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'; // Remplacez par votre clé API

export const sendToWhisper = async (filePath: string): Promise<string | null> => {
  const formData = new FormData();
  formData.append('file', {
    uri: Platform.OS === 'android' ? `file://${filePath}` : filePath,
    type: 'audio/mp3',
    name: 'audio.mp3',
  });
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
    });
    console.log('Transcription:', response.data.text);
    return response.data.text;
  } catch (error) {
    console.error('Error sending to Whisper:', error);
    return null;
  }
};
