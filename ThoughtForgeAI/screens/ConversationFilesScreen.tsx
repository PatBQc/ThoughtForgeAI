import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadConversations, getConversationFiles, readConversationContent } from '../services/conversationService';
import Icon from 'react-native-vector-icons/Ionicons';
import MessageBubble from '../components/MessageBubble';

interface Conversation {
  id: string;
  startTime: string;
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
    <View style={styles.conversationContainer}>
      <TouchableOpacity onPress={() => toggleConversationExpansion(item.id)}>
        <View style={styles.conversationHeader}>
          <Text style={styles.conversationTitle}>Conversation: {item.id}</Text>
          <Icon
            name={expandedConversation === item.id ? 'chevron-up-outline' : 'chevron-down-outline'}
            size={24}
            color="#007AFF"
          />
        </View>
        <Text style={styles.conversationDate}>Started: {new Date(item.startTime).toLocaleString()}</Text>
      </TouchableOpacity>
      {expandedConversation === item.id && (
        <FlatList
          data={item.messages}
          renderItem={({ item: message, index }) => renderMessage({ item: message, index }, item.id)}
          keyExtractor={(message, index) => `${item.id}-${message.id}-${index}`}
          style={styles.messageList}
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
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
    backgroundColor: '#F0F0F0',
  },
  conversationContainer: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: '#FFFFFF',
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
    color: '#007AFF',
  },
  conversationDate: {
    fontSize: 14,
    color: '#666',
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
    color: '#333',
  },
  messageList: {
    marginTop: 10,
  },
});

export default ConversationFilesScreen;
