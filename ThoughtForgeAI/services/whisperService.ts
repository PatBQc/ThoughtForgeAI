import axios from 'axios';
import FormData from 'form-data';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { OPENAI_API_KEY } from '@env';

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
