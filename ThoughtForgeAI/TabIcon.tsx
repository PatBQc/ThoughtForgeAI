import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import { useTheme } from './theme/themeContext';

type TabIconProps = {
  focused: boolean;
  size: number;
  routeName: string;
};

const TabIcon: React.FC<TabIconProps> = ({ focused, size, routeName }) => {
  const { theme } = useTheme();
  let iconName: string;

  switch (routeName) {
    case 'Brainstorm':
      iconName = focused ? 'bulb' : 'bulb-outline';
      break;
    case 'Conversations':
      iconName = focused ? 'list' : 'list-outline';
      break;
    case 'Settings':
      iconName = focused ? 'settings' : 'settings-outline';
      break;
    default:
      iconName = 'alert-circle-outline';
  }

  const color = focused ? theme.primary : theme.text;

  return <Icon name={iconName} size={size} color={color} />;
};

export default TabIcon;
