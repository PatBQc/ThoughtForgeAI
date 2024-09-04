import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { loadConversations, getConversationFiles, readConversationContent } from '../services/conversationService';
import Icon from 'react-native-vector-icons/Ionicons';
import AudioPlayer from '../components/AudioPlayer'; // Nous allons créer ce composant
import ConversationView from '../components/ConversationView'; // Nous allons créer ce composant

interface Conversation {
  id: string;
  startTime: string;
  files: string[];
  messages: Message[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

const ConversationFilesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);
  const [selectedAudio, setSelectedAudio] = useState<string | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

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
  };

  const handleFilePress = (fileName: string, conversation: Conversation) => {
    if (fileName.endsWith('.mp4')) {
      setSelectedAudio(fileName);
    } else {
      setSelectedConversation(conversation);
    }
  };

  const renderFile = (fileName: string, conversation: Conversation) => {
    const isAudio = fileName.endsWith('.mp4');
    const icon = isAudio ? 'musical-notes' : 'document-text';
    return (
      <TouchableOpacity
        key={fileName}
        style={styles.fileItem}
        onPress={() => handleFilePress(fileName, conversation)}
      >
        <Icon name={icon} size={24} color="#007AFF" />
        <Text style={styles.fileName}>{fileName}</Text>
      </TouchableOpacity>
    );
  };

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
        <View style={styles.fileList}>
          <Text style={styles.fileListTitle}>Files:</Text>
          {item.files.map(file => renderFile(file, item))}
        </View>
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
      <Modal
        visible={!!selectedAudio}
        transparent={true}
        animationType="slide"
      >
        <AudioPlayer
          audioFile={selectedAudio!}
          onClose={() => setSelectedAudio(null)}
        />
      </Modal>
      <Modal
        visible={!!selectedConversation}
        animationType="slide"
      >
        <ConversationView
          conversation={selectedConversation!}
          onClose={() => setSelectedConversation(null)}
        />
      </Modal>
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
});

export default ConversationFilesScreen;
