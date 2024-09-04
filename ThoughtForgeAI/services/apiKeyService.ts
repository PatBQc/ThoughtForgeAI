// services/apiKeyService.ts
import { getSavedFileRootDirectory } from '../utils/utils';
import RNFS from 'react-native-fs';
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from '@env';

const CONFIG_PREFIX = '_config';

export const apiKeyService = {
  saveApiKey: async (provider: string, key: string) => {
    try {
        const directory = `${getSavedFileRootDirectory()}/${CONFIG_PREFIX}`;
        RNFS.mkdir(directory, { NSURLIsExcludedFromBackupKey: false });
        await RNFS.writeFile(`${directory}/${provider}_api_key`, key, 'utf8');
    } catch (error) {
        console.error(`Error saving ${provider} API key:`, error);
    }
  },

  getApiKey: async (provider: string) => {
    try {
        const directory = `${getSavedFileRootDirectory()}/${CONFIG_PREFIX}`;
        RNFS.mkdir(directory, { NSURLIsExcludedFromBackupKey: false });
        if(!(await RNFS.exists(`${directory}/${provider}_api_key`))) {
            if(provider === 'OPENAI_API_KEY') {
                return OPENAI_API_KEY;
            }
            if(provider === 'ANTHROPIC_API_KEY') {
                return ANTHROPIC_API_KEY;
            }
            return null;
        }
        return await RNFS.readFile(`${directory}/${provider}_api_key`, 'utf8');
    } catch (error) {
        console.error(`Error getting ${provider} API key:`, error);
        return null;
    }
  },

  ANTHROPIC_API_KEY: async () => {
    return await apiKeyService.getApiKey('ANTHROPIC_API_KEY');
  },

  OPENAI_API_KEY: async () => {
    return await apiKeyService.getApiKey('OPENAI_API_KEY');
  },

};
