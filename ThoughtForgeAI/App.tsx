import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import BrainstormScreen from './screens/BrainstormScreen';
import ConversationFilesScreen from './screens/ConversationFilesScreen';
import SettingsScreen from './screens/SettingsScreen';
import TabIcon from './TabIcon';

const Tab = createBottomTabNavigator();

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
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
          })}
        >
          <Tab.Screen name="Brainstorm" component={BrainstormScreen} />
          <Tab.Screen name="Conversations" component={ConversationFilesScreen} />
          <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
