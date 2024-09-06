import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import BrainstormScreen from './screens/BrainstormScreen';
import ConversationFilesScreen from './screens/ConversationFilesScreen';
import SettingsScreen from './screens/SettingsScreen';
import TabIcon from './TabIcon';
import { ThemeProvider, useTheme } from './theme/themeContext';

const Tab = createBottomTabNavigator();

const AppContent: React.FC = () => {
  const { theme } = useTheme();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              routeName={route.name}
            />
          ),
          tabBarStyle: {
            backgroundColor: theme.background,
          },
          tabBarActiveTintColor: theme.primary,
          tabBarInactiveTintColor: theme.text,
          headerStyle: {
            backgroundColor: theme.background,
          },
          headerTintColor: theme.text,
        })}
      >
        <Tab.Screen name="Brainstorm" component={BrainstormScreen} />
        <Tab.Screen name="Conversations" component={ConversationFilesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
