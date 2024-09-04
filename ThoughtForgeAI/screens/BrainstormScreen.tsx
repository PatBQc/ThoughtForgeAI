import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, Platform, ActivityIndicator, Dimensions } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { sendToWhisper, generateTTS } from '../services/openAIService';
import { getChatResponse } from '../services/claudeService';
import { updateConversationJson } from '../services/conversationService';
import { generateAudioFileName, getSavedFileRootDirectory } from '../utils/utils';
import RNFS from 'react-native-fs';
import Icon from 'react-native-vector-icons/Ionicons';
import Sound from 'react-native-sound';
import Slider from '@react-native-community/slider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

interface AudioState {
  isPlaying: boolean;
  duration: number;
  progress: number;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const BrainstormScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const messageIndexRef = useRef<number>(0);
  const [conversationPrefix, setConversationPrefix] = useState<string>('');
  const flatListRef = useRef<FlatList>(null);
  const [currentAudio, setCurrentAudio] = useState<Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({});
  const [audioStates, setAudioStates] = useState<{ [key: string]: AudioState }>({});
  const audioRefs = useRef<{ [key: string]: Sound | null }>({});
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);


  useEffect(() => {
    checkAndRequestPermission();
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    return () => {
      stopCurrentAudio();
      Object.values(audioRefs.current).forEach(sound => {
        sound?.release();
      });
    };
  }, []);

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
    const directory = `${getSavedFileRootDirectory()}/_conversations/${prefix}`;

    RNFS.mkdir(directory, { NSURLIsExcludedFromBackupKey: false });

    const path = `${directory}/${fileName}`;
    return path;
  }, [conversationPrefix]);

  useEffect(() => {
    if (messageIndexRef.current === 0 && conversationPrefix === '') {
      const newPrefix = generateAudioFileName();
      setConversationPrefix(newPrefix);
    }
  }, [conversationPrefix]);

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

          const newAssistantFileName = generateFileName('assistant');
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


  const stopCurrentAudio = () => {
    if (currentPlayingId && audioRefs.current[currentPlayingId]) {
      audioRefs.current[currentPlayingId]?.stop();
      setAudioStates(prev => ({
        ...prev,
        [currentPlayingId]: { ...prev[currentPlayingId], isPlaying: false, progress: 0 }
      }));
      setCurrentPlayingId(null);
    }
  };

  const playAudio = async (message: Message) => {
    const messageId = message.id;
    
    // Stop the currently playing audio if any
    stopCurrentAudio();

    if (audioRefs.current[messageId]) {
      audioRefs.current[messageId]?.release();
    }

    let audioFile = message.fileName;
    const fileExists = await RNFS.exists(audioFile);

    if (!fileExists || !audioFile.endsWith('.mp4')) {
      setIsLoading(prev => ({ ...prev, [messageId]: true }));
      try {
        const ttsResult = await generateTTS(message.content);
        audioFile = `${getSavedFileRootDirectory()}/_conversations/${conversationPrefix}/${conversationPrefix}-${messageIndexRef.current}-${message.role}.mp4`;
        await RNFS.writeFile(audioFile, ttsResult, 'base64');
        const updatedMessages = messages.map(msg => 
          msg.id === messageId ? { ...msg, fileName: audioFile } : msg
        );
        updateConversation(updatedMessages);
      } catch (error) {
        console.error('Failed to generate TTS:', error);
        setIsLoading(prev => ({ ...prev, [messageId]: false }));
        return;
      }
    }

    const sound = new Sound(audioFile, '', (error) => {
      if (error) {
        console.log('Failed to load the sound', error);
        setIsLoading(prev => ({ ...prev, [messageId]: false }));
        return;
      }

      setAudioStates(prev => ({
        ...prev,
        [messageId]: { isPlaying: true, duration: sound.getDuration(), progress: 0 }
      }));
      setIsLoading(prev => ({ ...prev, [messageId]: false }));
      setCurrentPlayingId(messageId);

      sound.play((success) => {
        if (success) {
          console.log('Successfully finished playing');
        } else {
          console.log('Playback failed due to audio decoding errors');
        }
        setAudioStates(prev => ({
          ...prev,
          [messageId]: { ...prev[messageId], isPlaying: false, progress: 0 }
        }));
        setCurrentPlayingId(null);
      });

      const interval = setInterval(() => {
        sound.getCurrentTime((seconds) => {
          setAudioStates(prev => ({
            ...prev,
            [messageId]: { ...prev[messageId], progress: seconds }
          }));
        });
      }, 100);

      audioRefs.current[messageId] = sound;

      return () => clearInterval(interval);
    });
  };

  const stopAudio = (messageId: string) => {
    if (audioRefs.current[messageId]) {
      audioRefs.current[messageId]?.stop();
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { ...prev[messageId], isPlaying: false, progress: 0 }
      }));
      setCurrentPlayingId(null);
    }
  };

  const onSliderValueChange = (value: number, messageId: string) => {
    if (audioRefs.current[messageId]) {
      audioRefs.current[messageId]?.setCurrentTime(value);
      setAudioStates(prev => ({
        ...prev,
        [messageId]: { ...prev[messageId], progress: value }
      }));
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const audioState = audioStates[item.id] || { isPlaying: false, duration: 0, progress: 0 };
    return (
      <View style={[
        styles.messageBubble, 
        item.role === 'user' ? styles.userBubble : styles.aiBubble,
        styles.minBubbleSize
      ]}>
        <Text style={styles.messageText}>{item.content}</Text>
        <View style={styles.audioControls}>
          {isLoading[item.id] ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <TouchableOpacity onPress={() => audioState.isPlaying ? stopAudio(item.id) : playAudio(item)}>
              <Icon name={audioState.isPlaying ? "stop" : "play"} size={24} color="white" />
            </TouchableOpacity>
          )}
          {(item.fileName.endsWith('.mp4') || audioState.isPlaying) && (
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={audioState.duration}
              value={audioState.progress}
              onValueChange={(value) => onSliderValueChange(value, item.id)}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
          )}
        </View>
      </View>
    );
  };

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
    marginBottom: 10, // Ajoute un espace entre le texte et les contrôles audio
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
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Espace les éléments uniformément
    marginTop: 5,
  },
  slider: {
    flex: 1,
    marginLeft: 10,
    height: 40, // Augmente la hauteur du slider pour une meilleure interaction
  },
  minBubbleSize: {
    minWidth: SCREEN_WIDTH * 0.6, // 60% de la largeur de l'écran
    minHeight: 80, // Hauteur minimale en pixels
  },
});

export default BrainstormScreen;

