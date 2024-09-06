import React, { useState, useCallback, useContext, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import TrackPlayer, { Event, State, useProgress, useTrackPlayerEvents } from 'react-native-track-player';
import RNFS from 'react-native-fs';
import { generateTTS } from '../services/openAIService';
import { useTheme } from '../theme/themeContext';
import { PlayerContext } from '../App';

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
  const [localDuration, setLocalDuration] = useState(0);
  const [localPosition, setLocalPosition] = useState(0);
  const [localIsPlaying, setLocalIsPlaying] = useState(false);
  const { position, duration } = useProgress(100);

  const { theme } = useTheme();
  const { isPlayerReady } = useContext(PlayerContext);

  useTrackPlayerEvents([Event.PlaybackActiveTrackChanged, Event.PlaybackState], async (event) => {
    if (event.type === Event.PlaybackActiveTrackChanged && event.track === null) {
      // This means the playlist has ended
      setLocalIsPlaying(false);
      setLocalPosition(0);
      onAudioPlay('');
    } else if (event.type === Event.PlaybackState) {
      const playerState = (await TrackPlayer.getPlaybackState()).state;
      setLocalIsPlaying(playerState === State.Playing);
      if (playerState === State.Stopped || playerState === State.None) {
        setLocalPosition(0);
        onAudioPlay('');
      }
    }
  });

  useEffect(() => {
    if (localIsPlaying) {
      setLocalPosition(position);
      setLocalDuration(duration);
    }
  }, [position, duration, localIsPlaying]);

  useEffect(() => {
    if (!isCurrentlyPlaying && localIsPlaying) {
      setLocalIsPlaying(false);
      setLocalPosition(0);
    }
  }, [isCurrentlyPlaying, localIsPlaying]);

  const playAudio = useCallback(async () => {
    if (!isPlayerReady) {
      console.warn('TrackPlayer is not ready yet');
      return;
    }

    if (localIsPlaying) {
      await TrackPlayer.pause();
      setLocalIsPlaying(false);
      onAudioPlay('');
      return;
    }

    let fileName = message.fileName;
    let audioFile = message.fileName;
    if(fileName.endsWith('.txt')) {
      audioFile = fileName.replace('.txt', '.mp4');
    }

    const fileExists = await RNFS.exists(audioFile);

    if (!fileExists) {
      setIsLoading(true);
      try {
        const ttsResult = await generateTTS(message.content);
        await RNFS.writeFile(audioFile, ttsResult, 'base64');
        message.fileName = audioFile;
      } catch (error) {
        console.error('Failed to generate TTS:', error);
        setIsLoading(false);
        return;
      }
    }

    setIsLoading(true);
    try {
      await TrackPlayer.reset();
      await TrackPlayer.add({
        url: `file://${audioFile}`,
        title: 'Audio Message',
        artist: message.role,
      });

      const trackDuration = await TrackPlayer.getDuration();
      setLocalDuration(trackDuration);
      setLocalPosition(0);

      await TrackPlayer.play();
      setLocalIsPlaying(true);
      onAudioPlay(message.id);

    } catch (error) {
      console.error('Failed to play audio:', error);
    } finally {
      setIsLoading(false);
    }
  }, [message, onAudioPlay, isPlayerReady, localIsPlaying]);

  const onSliderValueChange = useCallback(async (value: number) => {
    await TrackPlayer.seekTo(value);
    setLocalPosition(value);
  }, []);

  return (
    <View style={[
      styles.messageBubble,
      message.role === 'user'
        ? [styles.userBubble, { backgroundColor: theme.messageBubbleUser }]
        : [styles.aiBubble, { backgroundColor: theme.messageBubbleAssistant }],
      styles.minBubbleSize,
    ]}>
      <Text style={styles.messageText}>{message.content}</Text>
      <View style={styles.audioControls}>
        {isLoading ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <TouchableOpacity onPress={playAudio}>
            <Icon name={localIsPlaying ? 'pause' : 'play'} size={24} color="white" />
          </TouchableOpacity>
        )}
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={localDuration}
          value={localPosition}
          onValueChange={onSliderValueChange}
          minimumTrackTintColor="#FFFFFF"
          maximumTrackTintColor="#000000"
        />
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
  },
  aiBubble: {
    alignSelf: 'flex-start',
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
