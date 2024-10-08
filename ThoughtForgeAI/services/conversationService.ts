// services/conversationService.ts

import RNFS from 'react-native-fs';
import { getSavedFileRootDirectory } from '../utils/utils';
import { getSubject } from './claudeService'; // Adjust the path as necessary

interface ConversationData {
  id: string;
  startTime: string;
  subject?: string;
  messages: Array<{
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
    fileName: string;
  }>;
}

const getConversationDirectory = () => {
  return `${getSavedFileRootDirectory()}/_conversations`;
};

export const updateConversationJson = async (conversationId: string, messages: any[]) => {
  const conversationPath = getConversationDirectory();
  const jsonFilePath = `${conversationPath}/${conversationId}.json`;

  let conversationData: ConversationData;

  try {
    // Ensure the conversation directory exists
    await RNFS.mkdir(conversationPath, { NSURLIsExcludedFromBackupKey: false });

    // Check if the file exists
    const fileExists = await RNFS.exists(jsonFilePath);
    if (fileExists) {
      // If it exists, read and parse the existing data
      const jsonContent = await RNFS.readFile(jsonFilePath, 'utf8');
      conversationData = JSON.parse(jsonContent);
    } else {
      // If it doesn't exist, create a new conversation object
      conversationData = {
        id: conversationId,
        startTime: new Date().toISOString(),
        messages: [],
      };
    }

    // if we received two messages from user, we can now infer the subject
    if(messages.length >= 3 && !conversationData.subject) {
      let summary = `
      # USER
      ${messages[0].content}, 

      # ASSISTANT
      ${messages[1].content}

      #USER
      ${messages[2].content}`;
      conversationData.subject = await getSubject(summary);
    }

    // Update the messages
    conversationData.messages = messages.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp || new Date().toISOString(),
      fileName: msg.fileName,
    }));

    // Write the updated data back to the file
    await RNFS.writeFile(jsonFilePath, JSON.stringify(conversationData, null, 2), 'utf8');
  } catch (error) {
    console.error('Error updating conversation JSON:', error);
  }
};

export const loadConversations = async (): Promise<ConversationData[]> => {
  try {
    const conversationPath = getConversationDirectory();
    const files = await RNFS.readDir(conversationPath);
    const jsonFiles = files.filter(file => file.name.endsWith('.json'));

    const conversationsData = await Promise.all(
      jsonFiles.map(async (file) => {
        const content = await RNFS.readFile(file.path, 'utf8');
        return JSON.parse(content) as ConversationData;
      })
    );

    return conversationsData;
  } catch (error) {
    console.error('Error loading conversations:', error);
    // Nothing, just assume no conversations exist
    return [];
  }
};

export const getConversationFiles = async (conversationId: string): Promise<string[]> => {
  try {
    const directory = `${getConversationDirectory()}/${conversationId}`;

    const allFiles = await RNFS.readDir(directory);
    return allFiles
      .filter(f => f.name.startsWith(conversationId))
      .map(f => f.name);
  } catch (error) {
    console.error('Error getting conversation files:', error);
    return [];
  }
};

export const readConversationContent = async (conversationId: string): Promise<any> => {
    const conversationPath = getConversationDirectory();
    const jsonFilePath = `${conversationPath}/${conversationId}.json`;

    try {
        const content = await RNFS.readFile(jsonFilePath, 'utf8');
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading conversation content:', error);
        return null;
    }
};

