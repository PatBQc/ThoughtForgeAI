import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { sendToWhisper } from '../services/whisperService';
import { getChatResponse } from '../services/claudeService';
import { updateConversationJson } from '../services/conversationService';
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
  const messageIndexRef = useRef<number>(0);
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

  const generateFileName = useCallback((role: 'user' | 'assistant'): string => {
    let prefix = conversationPrefix;
    if (messageIndexRef.current === 0 && prefix === '') {
      prefix = generateAudioFileName();
      setConversationPrefix(prefix);
    }
  
    const fileName = `${prefix}-${messageIndexRef.current}-${role}.mp4`;
    const path = Platform.OS === 'ios' 
      ? `${RNFS.DocumentDirectoryPath}/${fileName}`
      : `${RNFS.ExternalDirectoryPath}/${fileName}`;
    return path;
  }, [conversationPrefix]);

  useEffect(() => {
    if (messageIndexRef.current === 0 && conversationPrefix === '') {
      const newPrefix = generateAudioFileName();
      setConversationPrefix(newPrefix);
    }
  }, [messageIndexRef.current, conversationPrefix]);

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
        const newFileName = generateFileName('user');
        const newUserMessage: Message = { 
          id: Date.now().toString(), 
          role: 'user', 
          content: transcription,
          fileName: newFileName
        };
        updateConversation([...messages, newUserMessage]);
        messageIndexRef.current += 1;
  
        try {
          const claudeMessages = messages.map(msg => ({ role: msg.role, content: msg.content }));
          claudeMessages.push({ role: 'user', content: transcription });
  
          const newAssistantFileName = generateFileName('assistant');
          const claudeResponse = await getChatResponse(claudeMessages, newAssistantFileName);
          const newAssistantMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: claudeResponse,
            fileName: newAssistantFileName
          };
          updateConversation([...messages, newUserMessage, newAssistantMessage]);
          messageIndexRef.current += 1;
        } catch (error) {
          console.error('Error getting response from Claude:', error);
          const errorFileName = generateFileName('assistant');
          const errorMessage: Message = { 
            id: (Date.now() + 1).toString(), 
            role: 'assistant', 
            content: "Désolé, je n'ai pas pu obtenir une réponse. Veuillez réessayer.",
            fileName: errorFileName
          };
          updateConversation([...messages, newUserMessage, errorMessage]);
          messageIndexRef.current += 1;
        }
      }
    } else {
      const fileName = generateFileName('user');
      const result = await audioRecorderPlayer.startRecorder(fileName);
      setIsRecording(true);
      console.log('Started recording, file path: ', result);
    }
  };

  const startNewConversation = useCallback(() => {
    setMessages([]);
    messageIndexRef.current = 0;
    const newPrefix = generateAudioFileName();
    setConversationPrefix(newPrefix);
    updateConversationJson(newPrefix, []);
  }, []);

  const updateConversation = useCallback(async (newMessages: Message[]) => {
    setMessages(newMessages);
    await updateConversationJson(conversationPrefix, newMessages);
  }, [conversationPrefix]);

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

