import { authorize, refresh, revoke } from 'react-native-app-auth';
import { MICROSOFT_CLIENT_ID } from '@env';

const config = {
  clientId: MICROSOFT_CLIENT_ID,
  redirectUrl: 'thoughtforgeai://auth',
  scopes: ['Notes.Create', 'Notes.ReadWrite', 'Notes.ReadWrite.All'],
  additionalParameters: { prompt: 'select_account' },
  serviceConfiguration: {
    authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
    tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  },
};

export const login = async () => {
  try {
    const result = await authorize(config);
    // Stockez le résultat (tokens, etc.) de manière sécurisée
    return result;
  } catch (error) {
    console.error('Error during login:', error);
    throw error;
  }
};

export const refreshToken = async (refreshToken: string) => {
  try {
    const result = await refresh(config, { refreshToken });
    // Mettez à jour les tokens stockés
    return result;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
};

export const logout = async (tokenToRevoke: string) => {
  try {
    await revoke(config, { tokenToRevoke });
    // Nettoyez les tokens stockés localement
  } catch (error) {
    console.error('Error during logout:', error);
    throw error;
  }
};