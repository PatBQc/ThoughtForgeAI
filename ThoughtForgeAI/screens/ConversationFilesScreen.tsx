import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as Progress from 'react-native-progress';
import { loadConversations, getConversationFiles, readConversationContent } from '../services/conversationService';
import { getOrCreateNotebook, getOrCreateSection, createPageWithContent } from '../services/oneNoteService';
import { formatConversationToHTML } from '../utils/formatConversation';
import Icon from 'react-native-vector-icons/Ionicons';
import MessageBubble from '../components/MessageBubble';
import { useTheme } from '../theme/themeContext';

interface Conversation {
  id: string;
  startTime: string;
  subject?: string;
  files: string[];
  messages: Message[];
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

const ConversationFilesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportingConversationId, setExportingConversationId] = useState<string | null>(null);
  const [exportAllProgress, setExportAllProgress] = useState<number | null>(null);

  const { theme } = useTheme();

  const loadAllConversations = useCallback(async () => {
    try {
      const conversationsData = await loadConversations();
      const conversationsWithDetails = await Promise.all(
        conversationsData.map(async (conv) => {
          const files = await getConversationFiles(conv.id);
          const content = await readConversationContent(conv.id);
          return {
            ...conv,
            files,
            messages: content ? content.messages : [],
          };
        })
      );
      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllConversations();
    }, [loadAllConversations])
  );

  const toggleConversationExpansion = (conversationId: string) => {
    setExpandedConversation(prevId => prevId === conversationId ? null : conversationId);
    // Reset currentPlayingId when closing a conversation
    if (expandedConversation === conversationId) {
      setCurrentPlayingId(null);
    }
  };

  const handleAudioPlay = (messageId: string) => {
    setCurrentPlayingId(prevId => prevId === messageId ? null : messageId);
  };

  const exportConversation = async (conversation: Conversation) => {
    try {
      setExportingConversationId(conversation.id);

      // Obtenir ou créer un notebook
      let notebook = await getOrCreateNotebook('ThoughtForgeAI Notebook');

      // Obtenir ou créer une section dans le notebook
      let section = await getOrCreateSection(notebook.id, 'Brainstorming Sessions');

      // Formater et exporter la conversation
      const htmlContent = formatConversationToHTML(conversation.messages, conversation.subject || 'Brainstorming Session');
      await createPageWithContent(section.id, conversation.subject || `Session ${conversation.id}`, htmlContent);
    } catch (error) {
      console.error('Error exporting conversation:', error);
      Alert.alert('Error', 'Failed to export conversation. Please try again.');
    } finally {
      setExportingConversationId(null);
    }
  };

  const exportAllConversations = async () => {
    try {
      setExportAllProgress(0);

      // Obtenir ou créer un notebook
      let notebook = await getOrCreateNotebook('ThoughtForgeAI Notebook');

      // Obtenir ou créer une section dans le notebook
      let section = await getOrCreateSection(notebook.id, 'Brainstorming Sessions');

      for (let i = 0; i < conversations.length; i++) {
        const conversation = conversations[i];
        // Formater et exporter la conversation
        const htmlContent = formatConversationToHTML(conversation.messages, conversation.subject || 'Brainstorming Session');
        await createPageWithContent(section.id, conversation.subject || `Session ${conversation.id}`, htmlContent);

        // Mettre à jour la progression
        setExportAllProgress((i + 1) / conversations.length);
      }

      Alert.alert('Success', 'All conversations exported to OneNote successfully!');
    } catch (error) {
      console.error('Error exporting all conversations:', error);
      Alert.alert('Error', 'Failed to export all conversations. Some may have been exported.');
    } finally {
      setExportAllProgress(null);
    }
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }, conversationId: string) => (
    <MessageBubble
      key={`${conversationId}-${item.id}-${index}`}
      message={item}
      conversationPrefix={conversationId}
      onAudioPlay={handleAudioPlay}
      isCurrentlyPlaying={currentPlayingId === item.id}
    />
  );

  const renderConversation = ({ item }: { item: Conversation }) => (
    <View style={[styles.conversationContainer, { backgroundColor: theme.background }]}>
      <TouchableOpacity onPress={() => toggleConversationExpansion(item.id)}>
        <View style={styles.conversationHeader}>
          <Text style={[styles.conversationTitle, { color: theme.primary }]}>
            {item.subject?.trim() ?? item.id}
          </Text>
          <Icon
            name={expandedConversation === item.id ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={24}
            color={theme.primary}
          />
        </View>
        <Text style={[styles.conversationDate, { color: theme.text }]}>
          Started: {new Date(item.startTime).toLocaleString()}
        </Text>
      </TouchableOpacity>
      {expandedConversation === item.id && (
        <>
          <FlatList
            data={item.messages}
            renderItem={({ item: message, index }) => renderMessage({ item: message, index }, item.id)}
            keyExtractor={(message, index) => `${item.id}-${message.id}-${index}`}
            style={styles.messageList}
          />
          <TouchableOpacity
            style={[styles.exportButton, { backgroundColor: theme.primary }]}
            onPress={() => exportConversation(item)}
            disabled={exportingConversationId !== null}
          >
            {exportingConversationId === item.id ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.exportButtonText}>Export to OneNote</Text>
            )}
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const renderExportAllButton = () => {
    if (exportAllProgress !== null) {
      return (
        <View style={styles.progressBarContainer}>
          <Progress.Bar
            progress={exportAllProgress}
            width={null}
            height={40}
            color={theme.primary}
            borderWidth={0}
            borderRadius={5}
          />
          <Text style={[styles.progressText, { color: theme.text }]}>
            {Math.round(exportAllProgress * 100)}%
          </Text>
        </View>
      );
    }

    return (
      <TouchableOpacity
        style={[styles.exportAllButton, { backgroundColor: theme.primary }]}
        onPress={exportAllConversations}
        disabled={exportingConversationId !== null || exportAllProgress !== null}
      >
        <Text style={styles.exportButtonText}>Export Conversations to OneNote</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderExportAllButton()}
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={item => item.id}
        refreshing={false}
        onRefresh={loadAllConversations}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  conversationContainer: {
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  conversationDate: {
    fontSize: 14,
    marginTop: 5,
  },
  fileList: {
    marginTop: 10,
  },
  fileListTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  fileName: {
    marginLeft: 10,
    fontSize: 14,
  },
  messageList: {
    marginTop: 10,
  },
  exportButton: {
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40, // Définir une hauteur fixe pour le bouton
  },
  exportAllButton: {
    padding: 10,
    borderRadius: 5,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  progressBarContainer: {
    margin: 10,
    height: 40,
    borderRadius: 5,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  progressText: {
    position: 'absolute',
    alignSelf: 'center',
    fontWeight: 'bold',
  },
});

export default ConversationFilesScreen;
