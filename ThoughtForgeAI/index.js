/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import { enableScreens } from 'react-native-screens';
import TrackPlayer from 'react-native-track-player';

enableScreens();

AppRegistry.registerComponent(appName, () => App);
TrackPlayer.registerPlaybackService(() => require('./services/trackPlayerServices'));