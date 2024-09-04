// services/apiService.ts
import { getSavedFileRootDirectory } from '../utils/utils';
import RNFS from 'react-native-fs';

const CONFIG_PREFIX = '_config';

export const apiService = {
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
            return null;
        }
        return await RNFS.readFile(`${directory}/${provider}_api_key`, 'utf8');
    } catch (error) {
        console.error(`Error getting ${provider} API key:`, error);
        return null;
    }
  }
};