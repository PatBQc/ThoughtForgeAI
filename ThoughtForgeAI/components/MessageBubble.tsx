import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import Sound from 'react-native-sound';
import RNFS from 'react-native-fs';
import { generateTTS } from '../services/openAIService';
import { getSavedFileRootDirectory } from '../utils/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  fileName: string;
}

interface MessageBubbleProps {
  message: Message;
  conversationPrefix: string;
  onAudioPlay: (messageId: string) => void;
  isCurrentlyPlaying: boolean;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MessageBubble: React.FC<MessageBubbleProps> = ({
    message,
    conversationPrefix,
    onAudioPlay,
    isCurrentlyPlaying,
  }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const soundRef = useRef<Sound | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
    useEffect(() => {
      return () => {
        if (soundRef.current) {
          soundRef.current.stop();
          soundRef.current.release();
        }
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }, []);
  
    useEffect(() => {
      if (!isCurrentlyPlaying && soundRef.current) {
        soundRef.current.stop();
        setProgress(0);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, [isCurrentlyPlaying]);
  
    const playAudio = useCallback(async () => {
      if (isCurrentlyPlaying) {
        if (soundRef.current) {
          soundRef.current.stop();
        }
        onAudioPlay('');
        return;
      }
  
      let audioFile = message.fileName;
      console.log('--playaudio-- Audio file avant TTS:', audioFile);
      const fileExists = await RNFS.exists(audioFile);
  
      if (!fileExists || (message.role === 'assistant' && !audioFile.endsWith('.mp4'))) {
        setIsLoading(true);
        try {
          const ttsResult = await generateTTS(message.content);
          audioFile = audioFile.replace('.txt', '.mp4');
          message.fileName = audioFile;
          console.log('--playaudio-- Audio file après TTS:', audioFile);
          await RNFS.writeFile(audioFile, ttsResult, 'base64');
        } catch (error) {
          console.error('Failed to generate TTS:', error);
          setIsLoading(false);
          return;
        }
      }
  
      setIsLoading(true);
      const newSound = new Sound(audioFile, '', (error) => {
        setIsLoading(false);
        if (error) {
          console.log('Failed to load the sound', error);
          return;
        }
  
        setDuration(newSound.getDuration());
        soundRef.current = newSound;
  
        newSound.play((success) => {
          if (success) {
            console.log('Successfully finished playing');
          } else {
            console.log('Playback failed due to audio decoding errors');
          }
          onAudioPlay('');
          setProgress(0);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
        });
  
        onAudioPlay(message.id);
  
        intervalRef.current = setInterval(() => {
          newSound.getCurrentTime((seconds) => setProgress(seconds));
        }, 100);
      });
    }, [message, conversationPrefix, onAudioPlay, isCurrentlyPlaying]);
  
    const onSliderValueChange = useCallback((value: number) => {
      if (soundRef.current) {
        soundRef.current.setCurrentTime(value);
        setProgress(value);
      }
    }, []);
  
    return (
      <View style={[
        styles.messageBubble,
        message.role === 'user' ? styles.userBubble : styles.aiBubble,
        styles.minBubbleSize,
      ]}>
        <Text style={styles.messageText}>{message.content}</Text>
        <View style={styles.audioControls}>
          {isLoading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <TouchableOpacity onPress={playAudio}>
              <Icon name={isCurrentlyPlaying ? 'stop' : 'play'} size={24} color="white" />
            </TouchableOpacity>
          )}
          {(message.fileName.endsWith('.mp4') || isCurrentlyPlaying) && (
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={progress}
              onValueChange={onSliderValueChange}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#000000"
            />
          )}
        </View>
      </View>
    );
  };


const styles = StyleSheet.create({
  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    borderRadius: 20,
    marginVertical: 5,
  },
  minBubbleSize: {
    minWidth: SCREEN_WIDTH * 0.6,
    minHeight: 80,
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
    marginBottom: 10,
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  slider: {
    flex: 1,
    marginLeft: 10,
    height: 40,
  },
});

export default MessageBubble;
