import React, { useState, useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, FlatList, Platform } from 'react-native';
import RNFS from 'react-native-fs';

const AudioFilesScreen: React.FC = () => {
  const [audioFiles, setAudioFiles] = useState<string[]>([]);

  useEffect(() => {
    listAudioFiles();
  }, []);

  const listAudioFiles = async () => {
    const path = Platform.OS === 'ios' ? RNFS.DocumentDirectoryPath : RNFS.ExternalDirectoryPath;
    const files = await RNFS.readDir(path);
    const audioFiles = files
      .filter(file => file.name.endsWith('.mp4'))
      .map(file => file.path);
    setAudioFiles(audioFiles);
  };

  const renderAudioFileItem = ({ item }: { item: string }) => (
    <TouchableOpacity style={styles.audioFileItem}>
      <Text>{item.split('/').pop()}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={audioFiles}
        renderItem={renderAudioFileItem}
        keyExtractor={item => item}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  audioFileItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default AudioFilesScreen;
