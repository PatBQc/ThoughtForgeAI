import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';

type TabIconProps = {
  focused: boolean;
  color: string;
  size: number;
  routeName: string;
};

const TabIcon: React.FC<TabIconProps> = ({ focused, color, size, routeName }) => {
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

  return <Icon name={iconName} size={size} color={color} />;
};

export default TabIcon;
