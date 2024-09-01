import React from 'react';
import { SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

const SettingsScreen: React.FC = () => {
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
      {/* Ajoutez d'autres paramètres ici */}
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
