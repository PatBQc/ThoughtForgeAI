import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { loadConversations, getConversationFiles } from '../services/conversationService';
import Icon from 'react-native-vector-icons/Ionicons';

interface Conversation {
  id: string;
  startTime: string;
  files: string[];
}

const ConversationFilesScreen: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null);

  useEffect(() => {
    loadAllConversations();
  }, []);

  const loadAllConversations = async () => {
    try {
      const conversationsData = await loadConversations();
      const conversationsWithFiles = await Promise.all(
        conversationsData.map(async (conv) => ({
          ...conv,
          files: await getConversationFiles(conv.id)
        }))
      );
      setConversations(conversationsWithFiles);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const toggleConversationExpansion = (conversationId: string) => {
    setExpandedConversation(prevId => prevId === conversationId ? null : conversationId);
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
          {item.files.map((file, index) => (
            <Text key={index} style={styles.fileItem}>{file}</Text>
          ))}
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
    shadowColor: "#000",
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
    fontSize: 14,
    color: '#333',
    marginLeft: 10,
    marginBottom: 2,
  },
});

export default ConversationFilesScreen;