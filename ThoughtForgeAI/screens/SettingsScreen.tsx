import React, { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';

const SettingsScreen: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);

  const saveSystemPrompt = async () => {
    try {
      await AsyncStorage.setItem('SYSTEM_PROMPT', systemPrompt);
      alert('System prompt saved successfully!');
    } catch (error) {
      console.error('Error saving system prompt:', error);
      alert('Failed to save system prompt');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>API Key:</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Enter your API key"
          secureTextEntry
        />
      </View>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>System Prompt:</Text>
        <TextInput 
          style={styles.input} 
          multiline
          numberOfLines={10}
          value={systemPrompt}
          onChangeText={setSystemPrompt}
        />
        <Button title="Save System Prompt" onPress={saveSystemPrompt} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
});

export default SettingsScreen;
