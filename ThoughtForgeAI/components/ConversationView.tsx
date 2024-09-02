import React from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

interface ConversationViewProps {
  conversation: {
    id: string;
    startTime: string;
    messages: Message[];
  };
  onClose: () => void;
}

const ConversationView: React.FC<ConversationViewProps> = ({ conversation, onClose }) => {
  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.fileNameText}>{item.fileName}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conversation: {conversation.id}</Text>
      <FlatList
        data={conversation.messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#007AFF',
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#34C759',
  },
  messageText: {
    color: 'white',
    fontSize: 16,
  },
  fileNameText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#007AFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default ConversationView;
