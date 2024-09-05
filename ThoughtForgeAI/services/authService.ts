import { authorize, refresh, revoke } from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MICROSOFT_CLIENT_ID } from '@env';

const config = {
  clientId: MICROSOFT_CLIENT_ID,
  redirectUrl: 'thoughtforgeai://auth',
  scopes: ['Notes.Create', 'Notes.ReadWrite', 'Notes.ReadWrite.All'],
  additionalParameters: { prompt: 'select_account' },
  serviceConfiguration: {
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
    revocationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/logout',
  },
};

export const login = async () => {
  try {
    const result = await authorize(config);
    if (result.accessToken) {
      await AsyncStorage.setItem('oneNoteAccessToken', result.accessToken);
    }
    if (result.refreshToken) {
      await AsyncStorage.setItem('oneNoteRefreshToken', result.refreshToken);
    }
    return result;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('oneNoteRefreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const result = await refresh(config, { refreshToken });
    if (result.accessToken) {
      await AsyncStorage.setItem('oneNoteAccessToken', result.accessToken);
    }
    if (result.refreshToken) {
      await AsyncStorage.setItem('oneNoteRefreshToken', result.refreshToken);
    }
    return result;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    const accessToken = await AsyncStorage.getItem('oneNoteAccessToken');
    if (accessToken) {
      await revoke(config, { tokenToRevoke: accessToken });
    }
    await AsyncStorage.removeItem('oneNoteAccessToken');
    await AsyncStorage.removeItem('oneNoteRefreshToken');
  } catch (error) {
    console.error('Error during logout:', error);
    // Même si la révocation échoue, nous supprimons les tokens localement
    await AsyncStorage.removeItem('oneNoteAccessToken');
    await AsyncStorage.removeItem('oneNoteRefreshToken');
  }
};
