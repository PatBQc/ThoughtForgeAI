import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, FlatList, Platform } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
import { sendToWhisper } from '../services/whisperService';
import { generateAudioFileName } from '../utils/utils';
import RNFS from 'react-native-fs';

type MessageType = 'user' | 'ai';

interface Message {
  id: string;
  text: string;
  type: MessageType;
}

const audioRecorderPlayer = new AudioRecorderPlayer();

const MessageBubble: React.FC<Message> = ({ text, type }) => (
  <View style={[styles.messageBubble, type === 'user' ? styles.userBubble : styles.aiBubble]}>
    <Text style={styles.messageText}>{text}</Text>
  </View>
);

const BrainstormScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedFilePath, setRecordedFilePath] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationIndex, setConversationIndex] = useState<number>(0);

  useEffect(() => {
    checkAndRequestPermission();
  }, []);

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
        setMessages(prev => [...prev, { id: Date.now().toString(), text: transcription, type: 'user' }]);
        // Ici, vous ajouteriez la logique pour obtenir la réponse du "cerveau"
        // et l'ajouter comme un message de type 'ai'
        // Par exemple :
        const aiResponse = 'Réponse du cerveau 🧠';
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: aiResponse, type: 'ai' }]);
      }
    } else {
      const fileName = generateAudioFileName(conversationIndex);
      const path = Platform.OS === 'ios' 
        ? `${RNFS.DocumentDirectoryPath}/${fileName}`
        : `${RNFS.ExternalDirectoryPath}/${fileName}`;

      const result = await audioRecorderPlayer.startRecorder(path);
      setIsRecording(true);
      setConversationIndex(prevIndex => prevIndex + 1);
      console.log('Started recording, file path: ', result);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => <MessageBubble {...item} />}
        keyExtractor={item => item.id}
        style={styles.messageList}
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
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#F0F0F0',
  },
  messageList: {
    flex: 1,
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
    marginTop: 10,
  },
  buttonRecording: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default BrainstormScreen;
