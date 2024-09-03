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

    // Save transcription to a .txt file
    const txtFilePath = filePath.replace('.mp4', '.txt');
    await RNFS.writeFile(txtFilePath, response.data.text, 'utf8');
    console.log('Transcription saved to:', txtFilePath);

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