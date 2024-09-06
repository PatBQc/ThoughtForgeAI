import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from 'react-native-splash-screen';
import TrackPlayer, { Capability } from 'react-native-track-player';
import BrainstormScreen from './screens/BrainstormScreen';
import ConversationFilesScreen from './screens/ConversationFilesScreen';
import SettingsScreen from './screens/SettingsScreen';
import TabIcon from './components/TabIcon';
import { ThemeProvider, useTheme } from './theme/themeContext';

// Créez un nouveau contexte pour le lecteur audio
export const PlayerContext = React.createContext<{ isPlayerReady: boolean }>({ isPlayerReady: false });

const Tab = createBottomTabNavigator();

// Extracted tab icon rendering function
const renderTabIcon = (route: any) => {
  return ({ focused, color, size }: { focused: boolean; color: string; size: number }) => (
    <TabIcon
      focused={focused}
      color={color}
      size={size}
      routeName={route.name}
    />
  );
};

const AppContent: React.FC<{ isPlayerReady: boolean }> = ({ isPlayerReady }) => {
  const { theme } = useTheme();

  useEffect(() => {
    SplashScreen.hide();
  }, []);

  return (
    <PlayerContext.Provider value={{ isPlayerReady }}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: renderTabIcon(route),
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
    </PlayerContext.Provider>
  );
};

const App: React.FC = () => {
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    const setupTrackPlayer = async () => {
      try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
          capabilities: [
            Capability.Play,
            Capability.Pause,
            Capability.Stop,
          ],
          compactCapabilities: [
            Capability.Play,
            Capability.Pause,
          ],
        });
        setIsPlayerReady(true);
      } catch (e) {
        console.error('Error setting up TrackPlayer:', e);
      }
    };

    setupTrackPlayer();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AppContent isPlayerReady={isPlayerReady} />
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;
