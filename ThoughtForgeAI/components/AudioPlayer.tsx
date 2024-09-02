import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

interface AudioPlayerProps {
  audioFile: string;
  onClose: () => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioFile, onClose }) => {
  console.log('Audio file:', audioFile);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const audioRecorderPlayer = new AudioRecorderPlayer();

  const onStartPlay = async () => {
    try {
      await audioRecorderPlayer.startPlayer(audioFile);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const onStopPlay = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      setIsPlaying(false);
    } catch (error) {
      console.error('Error stopping audio:', error);
    }
  };

  React.useEffect(() => {
    return () => {
      onStopPlay();
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{audioFile}</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={isPlaying ? onStopPlay : onStartPlay}>
        <Text style={styles.buttonText}>
          {isPlaying ? 'Stop' : 'Play'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
  },
  closeButtonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default AudioPlayer;
