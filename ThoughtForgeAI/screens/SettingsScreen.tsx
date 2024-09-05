import React, { useState, useCallback, useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  Switch,
  View,
  Button,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SYSTEM_PROMPT } from '../utils/systemPrompt';
import { apiKeyService } from '../services/apiKeyService';
import { ANTHROPIC_API_KEY, OPENAI_API_KEY } from '@env';
import { useTheme } from '../theme/themeContext';
import { login, logout } from '../services/authService';
import { createNotebook } from '../services/oneNoteService';

const SettingsScreen: React.FC = () => {
  const [systemPrompt, setSystemPrompt] = useState(SYSTEM_PROMPT);
  const [openAIKey, setOpenAIKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [openAIFocused, setOpenAIFocused] = useState(false);
  const [anthropicFocused, setAnthropicFocused] = useState(false);
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { theme, isDark, toggleTheme } = useTheme();

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

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('oneNoteAccessToken');
      setIsLoggedIn(!!token);
    };
    
    checkLoginStatus();
  }, []);

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

  const handleAuthAction = async () => {
    try {
      if (isLoggedIn) {
        await logout();
        setIsLoggedIn(false);
      } else {
        const result = await login();
        if (result.accessToken) {
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error('Authentication error:', error);
      // Vous pouvez ajouter ici une alerte pour l'utilisateur
      alert('Authentication Error', 'An error occurred during authentication. Please try again.', error);
    }
  };

  const handleCreateNotebook = async () => {
    try {
      const result = await createNotebook('ThoughtForgeAI Notebook');
      alert('Success', 'Notebook created successfully!');
      console.log('Notebook created:', result);
    } catch (error) {
      console.error('Error creating notebook:', error);
      alert('Error', 'Failed to create notebook. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
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
              <Text style={[styles.sectionTitle, { color: theme.text }]}>OpenAI API Key</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                  placeholder="Enter your OpenAI API key"
                  placeholderTextColor={theme.secondary}
                  secureTextEntry={!openAIFocused}
                  value={openAIKey}
                  onChangeText={setOpenAIKey}
                  onFocus={() => setOpenAIFocused(true)}
                  onBlur={() => setOpenAIFocused(false)}
                />
              </View>
              <Button
                title="Save OpenAI Key"
                onPress={() => saveApiKey('OPENAI_API_KEY', openAIKey)}
                color={theme.primary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Anthropic API Key</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: theme.text, borderColor: theme.text }]}
                  placeholder="Enter your Anthropic API key"
                  placeholderTextColor={theme.secondary}
                  secureTextEntry={!anthropicFocused}
                  value={anthropicKey}
                  onChangeText={setAnthropicKey}
                  onFocus={() => setAnthropicFocused(true)}
                  onBlur={() => setAnthropicFocused(false)}
                />
              </View>
              <Button
                title="Save Anthropic Key"
                onPress={() => saveApiKey('ANTHROPIC_API_KEY', anthropicKey)}
                color={theme.primary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>System Prompt</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, styles.multilineInput, { color: theme.text, borderColor: theme.text }]}
                  multiline
                  numberOfLines={10}
                  value={systemPrompt}
                  onChangeText={setSystemPrompt}
                  placeholderTextColor={theme.secondary}
                />
              </View>
              <Button
                title="Save System Prompt"
                onPress={saveSystemPrompt}
                color={theme.primary}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.text, { color: theme.text }]}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#767577', true: theme.primary }}
                thumbColor={isDark ? theme.accent : '#f4f3f4'}
              />
            </View>

            <View style={styles.section}>
              <Text style={[styles.text, { color: theme.text }]}>Microsoft OneDrive and OneNote Integration</Text>
              <TouchableOpacity 
                style={styles.button} 
                onPress={handleAuthAction}
              >
                <Text style={styles.buttonText}>
                  {isLoggedIn ? 'Disconnect' : 'Connect'}
                </Text>
              </TouchableOpacity>
              {isLoggedIn && (
                <TouchableOpacity 
                  style={styles.button} 
                  onPress={handleCreateNotebook}
                >
                  <Text style={styles.buttonText}>Create OneNote Notebook</Text>
                </TouchableOpacity>
              )}
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
    borderRadius: 5,
    padding: 10,
  },
  multilineInput: {
    height: 150,
    textAlignVertical: 'top',
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },  
});

export default SettingsScreen;
