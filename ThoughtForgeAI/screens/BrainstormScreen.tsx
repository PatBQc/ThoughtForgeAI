// screens/BrainstormScreen.tsx

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { sendToWhisper } from '../services/openAIService';
import { getChatResponse } from '../services/claudeService';
import { updateConversationJson } from '../services/conversationService';
import { generateAudioFileName, getSavedFileRootDirectory } from '../utils/utils';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';
import MessageBubble from '../components/MessageBubble';
import { useTheme } from '../theme/themeContext';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const BrainstormScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIndexRef = useRef<number>(0);
  const [conversationPrefix, setConversationPrefix] = useState<string>('');
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);

  const flatListRef = useRef<FlatList>(null);
  
  const { theme } = useTheme();

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (messageIndexRef.current === 0 && conversationPrefix === '') {
      const newPrefix = generateAudioFileName();
      setConversationPrefix(newPrefix);
    }
  }, [conversationPrefix]);

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

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
      setIsRecording(false);

      const transcription = await sendToWhisper(result);
      if (transcription) {
        const newFileName = generateFileName('user');
        const newUserMessage: Message = {
          id: Date.now().toString(),
          role: 'user',
          content: transcription,
          fileName: newFileName,
        };
        updateConversation([...messages, newUserMessage]);
        messageIndexRef.current += 1;

        try {
          const claudeMessages = messages.map(msg => ({ role: msg.role, content: msg.content }));
          claudeMessages.push({ role: 'user', content: transcription });

          const newAssistantFileName = generateFileName('assistant').replace('.mp4', '.txt');
          const claudeResponse = await getChatResponse(claudeMessages, newAssistantFileName);
          const newAssistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: claudeResponse,
            fileName: newAssistantFileName,
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
            fileName: errorFileName,
          };
          updateConversation([...messages, newUserMessage, errorMessage]);
          messageIndexRef.current += 1;
        }
      }
    } else {
      const fileName = generateFileName('user');
      const result = await audioRecorderPlayer.startRecorder(fileName);
      setIsRecording(true);
    }
  };

  const generateFileName = useCallback((role: 'user' | 'assistant'): string => {
    let prefix = conversationPrefix;
    if (messageIndexRef.current === 0 && prefix === '') {
      prefix = generateAudioFileName();
      setConversationPrefix(prefix);
    }

    const fileName = `${prefix}-${messageIndexRef.current}-${role}.mp4`;
    const directory = `${getSavedFileRootDirectory()}/_conversations/${prefix}`;

    RNFS.mkdir(directory, { NSURLIsExcludedFromBackupKey: false });

    const path = `${directory}/${fileName}`;
    return path;
  }, [conversationPrefix]);

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

  const handleAudioPlay = (messageId: string) => {
    setCurrentPlayingId(messageId);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <MessageBubble
    message={item}
    conversationPrefix={conversationPrefix}
    onAudioPlay={handleAudioPlay}
    isCurrentlyPlaying={currentPlayingId === item.id}
    />
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: theme.secondary }]}>
        <TouchableOpacity onPress={startNewConversation} style={styles.newConversationButton}>
          <Icon name="refresh-outline" size={24} color={theme.primary} />
          <Text style={[styles.newConversationText, { color: theme.primary }]}>Nouvelle conversation</Text>
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
        style={[
          styles.button, 
          { backgroundColor: theme.primary },
          isRecording && { backgroundColor: theme.accent }
        ]}
        onPress={toggleRecording}
      >
        <Text style={[styles.buttonText, { color: theme.background }]}>
          {isRecording ? 'Arrêter l\'enregistrement' : 'Commencer l\'enregistrement'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 10,
    borderBottomWidth: 1,
  },
  newConversationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  newConversationText: {
    marginLeft: 10,
    fontSize: 16,
  },
  messageList: {
    flex: 1,
    padding: 10,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    margin: 10,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});


export default BrainstormScreen;
