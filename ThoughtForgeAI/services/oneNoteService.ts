import { Client } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import AsyncStorage from '@react-native-async-storage/async-storage';

let graphClient: Client | null = null;

const getAuthenticatedClient = async (): Promise<Client> => {
  if (!graphClient) {
    const accessToken = await AsyncStorage.getItem('oneNoteAccessToken');
    if (!accessToken) {
      throw new Error('No access token found');
    }

    const authProvider = {
      getAccessToken: async () => accessToken
    };

    graphClient = Client.initWithMiddleware({
      authProvider: authProvider as AuthCodeMSALBrowserAuthenticationProvider
    });
  }
  return graphClient;
};

export const getOrCreateNotebook = async (name: string): Promise<any> => {
  const client = await getAuthenticatedClient();
  
  // Vérifier si le notebook existe déjà
  const notebooks = await client.api('/me/onenote/notebooks')
    .filter(`displayName eq '${name}'`)
    .get();

  if (notebooks.value && notebooks.value.length > 0) {
    // Le notebook existe déjà, retourner le premier correspondant
    return notebooks.value[0];
  }

  // Le notebook n'existe pas, le créer
  const notebook = {
    displayName: name
  };
  return client.api('/me/onenote/notebooks').post(notebook);
};

export const getOrCreateSection = async (notebookId: string, name: string): Promise<any> => {
  const client = await getAuthenticatedClient();
  
  // Vérifier si la section existe déjà
  const sections = await client.api(`/me/onenote/notebooks/${notebookId}/sections`)
    .filter(`displayName eq '${name}'`)
    .get();

  if (sections.value && sections.value.length > 0) {
    // La section existe déjà, retourner la première correspondante
    return sections.value[0];
  }

  // La section n'existe pas, la créer
  const section = {
    displayName: name
  };
  return client.api(`/me/onenote/notebooks/${notebookId}/sections`).post(section);
};

export const getNotebooks = async (): Promise<any> => {
  const client = await getAuthenticatedClient();
  return client.api('/me/onenote/notebooks').get();
};

export const getSections = async (notebookId: string): Promise<any> => {
  const client = await getAuthenticatedClient();
  return client.api(`/me/onenote/notebooks/${notebookId}/sections`).get();
};

export const getPages = async (sectionId: string): Promise<any> => {
  const client = await getAuthenticatedClient();
  return client.api(`/me/onenote/sections/${sectionId}/pages`).get();
};


export const createPageWithContent = async (sectionId: string, title: string, content: string): Promise<any> => {
  const accessToken = await AsyncStorage.getItem('oneNoteAccessToken');
  if (!accessToken) {
    throw new Error('No access token found');
  }

  const endpoint = `https://graph.microsoft.com/v1.0/me/onenote/sections/${sectionId}/pages`;
  const boundary = 'MyPartBoundary' + Math.random().toString().substr(2);

  const htmlContent = `<!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
      </head>
      <body>
        ${content}
      </body>
    </html>`;

  const body = `--${boundary}\r\n` +
               `Content-Disposition: form-data; name="Presentation"\r\n` +
               `Content-Type: text/html\r\n\r\n` +
               `${htmlContent}\r\n` +
               `--${boundary}--\r\n`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: body
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error in createPageWithContent:', error);
    throw error;
  }
};