import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { sendToWhisper } from '../services/whisperService';
import { getChatResponse } from '../services/claudeService';
import { generateAudioFileName } from '../utils/utils';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const BrainstormScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageIndex, setMessageIndex] = useState<number>(0);
  const [conversationPrefix, setConversationPrefix] = useState<string>('');

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const generateFileName = useCallback((index: number, role: 'user' | 'assistant'): string => {
    let prefix = conversationPrefix;
    if (index === 0 && prefix === '') {
      prefix = generateAudioFileName();
    }

    const fileName = `${prefix}${index}-${role}.mp4`;
    return fileName;
  }, [conversationPrefix]);

  useEffect(() => {
    if (messageIndex === 0 && conversationPrefix === '') {
      const newPrefix = generateAudioFileName();
      setConversationPrefix(newPrefix);
    }
  }, [messageIndex, conversationPrefix]);

  const checkAndRequestPermission = async () => {
    const permission = Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO;
    const result = await check(permission);
    if (result !== RESULTS.GRANTED) {
      await request(permission);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      const result = await audioRecorderPlayer.stopRecorder();
      setRecordedFilePath(result);
      setIsRecording(false);
      console.log('Stopped recording, file path: ', result);
      const transcription = await sendToWhisper(result);
      if (transcription) {
        const newFileName = generateFileName(messageIndex, 'user');
        const newUserMessage: Message = { 
          id: Date.now().toString(), 
          role: 'user', 
          content: transcription,
          fileName: newFileName
        };
        setMessages(prev => [...prev, newUserMessage]);
        setMessageIndex(prevIndex => prevIndex + 1);

        try {
          const claudeMessages = messages.map(msg => ({ role: msg.role, content: msg.content }));
          claudeMessages.push({ role: 'user', content: transcription });

          const newAssistantFileName = generateFileName(messageIndex + 1, 'assistant');
          const path = Platform.OS === 'ios' 
          ? `${RNFS.DocumentDirectoryPath}/${newAssistantFileName}`
          : `${RNFS.ExternalDirectoryPath}/${newAssistantFileName}`;

          const claudeResponse = await getChatResponse(claudeMessages, path);
          const newAssistantMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: claudeResponse,
            fileName: newAssistantFileName
          };
          setMessages(prev => [...prev, newAssistantMessage]);
          setMessageIndex(prevIndex => prevIndex + 1);
        } catch (error) {
          console.error('Error getting response from Claude:', error);
          const errorFileName = generateFileName(messageIndex, 'assistant');
          const errorMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: "Désolé, je n'ai pas pu obtenir une réponse. Veuillez réessayer.",
            fileName: errorFileName
          };
          setMessages(prev => [...prev, errorMessage]);
          setMessageIndex(prevIndex => prevIndex + 1);
        }
      }
    } else {
      const fileName = generateFileName(messageIndex, 'user');
      const path = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.ExternalDirectoryPath}/${fileName}`;

      const result = await audioRecorderPlayer.startRecorder(path);
      setIsRecording(true);
      console.log('Started recording, file path: ', result);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setMessageIndex(0);
    setConversationPrefix('');
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View style={[styles.messageBubble, item.role === 'user' ? styles.userBubble : styles.aiBubble]}>
      <Text style={styles.messageText}>{item.content}</Text>
      <Text style={styles.fileNameText}>{item.fileName}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={startNewConversation} style={styles.newConversationButton}>
          <Icon name="refresh-outline" size={24} color="#007AFF" />
          <Text style={styles.newConversationText}>Nouvelle conversation</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={item => item.id}
        style={styles.messageList}
        onContentSizeChange={scrollToBottom}
        onLayout={scrollToBottom}
      />
      <TouchableOpacity
        style={[styles.button, isRecording && styles.buttonRecording]}
        onPress={toggleRecording}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F0F0',
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  newConversationText: {
    marginLeft: 10,
    color: '#007AFF',
    fontSize: 16,
  },
  messageList: {
    flex: 1,
    padding: 10,
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
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  buttonRecording: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  fileNameText: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 5,
  },
});

export default BrainstormScreen;

