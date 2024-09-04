import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';
import { apiKeyService } from '../services/apiKeyService';
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from '@env';

const SettingsScreen: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openAIFocused, setOpenAIFocused] = useState(false);
  const [anthropicFocused, setAnthropicFocused] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  useEffect(() => {
    const loadApiKeys = async () => {
      const openAIKeyStored = await apiKeyService.getApiKey('OPENAI_API_KEY');
      const anthropicKeyStored = await apiKeyService.getApiKey('ANTHROPIC_API_KEY');

      setOpenAIKey(openAIKeyStored || OPENAI_API_KEY || '');
      setAnthropicKey(anthropicKeyStored || ANTHROPIC_API_KEY || '');
    };
    loadApiKeys();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        (e) => setKeyboardOffset(e.endCoordinates.height)
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => setKeyboardOffset(0)
      );

      return () => {
        keyboardDidShowListener.remove();
        keyboardDidHideListener.remove();
      };
    }, [])
  );

  const saveSystemPrompt = async () => {
    try {
      await AsyncStorage.setItem('SYSTEM_PROMPT', systemPrompt);
      alert('System prompt saved successfully!');
    } catch (error) {
      console.error('Error saving system prompt:', error);
      alert('Failed to save system prompt');
    }
  };

  const saveApiKey = async (provider: string, key: string) => {
    await apiKeyService.saveApiKey(provider, key);
    alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key saved successfully!`);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            { paddingBottom: keyboardOffset + 20 },
          ]}
        >
          <SafeAreaView>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>OpenAI API Key</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your OpenAI API key"
                  secureTextEntry={!openAIFocused}
                  value={openAIKey}
                  onChangeText={setOpenAIKey}
                  onFocus={() => setOpenAIFocused(true)}
                  onBlur={() => setOpenAIFocused(false)}
                />
              </View>
              <Button title="Save OpenAI Key" onPress={() => saveApiKey('OPENAI_API_KEY', openAIKey)} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Anthropic API Key</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your Anthropic API key"
                  secureTextEntry={!anthropicFocused}
                  value={anthropicKey}
                  onChangeText={setAnthropicKey}
                  onFocus={() => setAnthropicFocused(true)}
                  onBlur={() => setAnthropicFocused(false)}
                />
              </View>
              <Button title="Save Anthropic Key" onPress={() => saveApiKey('ANTHROPIC_API_KEY', anthropicKey)} />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>System Prompt</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  multiline
                  numberOfLines={10}
                  value={systemPrompt}
                  onChangeText={setSystemPrompt}
                />
              </View>
              <Button title="Save System Prompt" onPress={saveSystemPrompt} />
            </View>
          </SafeAreaView>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
});

export default SettingsScreen;
