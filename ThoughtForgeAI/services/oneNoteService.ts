import { Client } from '@microsoft/microsoft-graph-client';
import authService from './authService';

class OneNoteService {
  private client: Client;

  constructor() {
    this.client = Client.init({
      authProvider: async (done) => {
        try {
          const token = await authService.getAccessToken();
          done(null, token);
        } catch (error) {
          done(error, null);
        }
      },
    });
  }

  async createPage(notebookId: string, sectionId: string, content: string): Promise<any> {
    try {
      const response = await this.client
        .api(`/me/onenote/notebooks/${notebookId}/sections/${sectionId}/pages`)
        .post({
          content: content,
        });
      return response;
    } catch (error) {
      console.error('Error creating OneNote page:', error);
      throw error;
    }
  }

  // Ajoutez d'autres méthodes ici pour interagir avec OneNote
}

export default new OneNoteService();
