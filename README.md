![ThoughtForgeAI Banner](https://raw.githubusercontent.com/PatBQc/ThoughtForgeAI/main/metadata/new%20logo/banner.png)

# ThoughtForgeAI

ThoughtForgeAI is a cutting-edge React Native application designed to revolutionize brainstorming sessions through AI assistance. It enables users to engage in voice conversations with advanced AI models (such as OpenAI's GPT or Anthropic's Claude), record these sessions, and efficiently manage the resulting knowledge base.

## Features

- Voice-based interaction with AI for dynamic brainstorming sessions
- Automatic transcription of voice recordings using OpenAI's Whisper API
- Comprehensive conversation history management
- High-quality audio playback of recorded sessions
- Cross-platform support 
  - Developed on Android
  - Windows work with react-native-windows and Electron but no release yet
  - iOS not addressed yet
- Data synchronization with OneDrive
- Integration with OneNote for structured knowledge base management
- Dark/Light theme support with system preference detection
- Automatic subject summarization for easy conversation categorization
- Individual message audio playback with Text-to-Speech fallback

## Technologies Used

- [React Native](https://reactnative.dev/) for cross-platform mobile development
- [TypeScript](https://www.typescriptlang.org/) for type-safe code
- [OpenAI Whisper API](https://openai.com/research/whisper) for accurate voice transcription
- [Anthropic Claude API](https://www.anthropic.com/) for advanced AI interactions
- [React Navigation](https://reactnavigation.org/) for seamless app navigation
- [react-native-sound](https://www.npmjs.com/package/react-native-sound/) for advanced audio management
- [Microsoft Graph API](https://developer.microsoft.com/en-us/graph) for OneNote integration
- [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) for local data persistence

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js) or [yarn](https://yarnpkg.com/)
- [React Native development environment](https://reactnative.dev/docs/environment-setup) set up
- [Android Studio](https://developer.android.com/studio) (for Android development)
- [Xcode](https://developer.apple.com/xcode/) (for iOS development, macOS only)
- [Visual Studio Code](https://code.visualstudio.com/) (recommended IDE)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/PatBQc/ThoughtForgeAI.git
   ```

2. Navigate to the project directory:
   ```
   cd ThoughtForgeAI/ThoughtForgeAI
   ```

3. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   yarn install
   ```

4. Set up environment variables:
   Create a `.env` file in the root directory and add your API keys:
   ```
   OPENAI_API_KEY=your_openai_api_key
   ANTHROPIC_API_KEY=your_anthropic_api_key
   MICROSOFT_CLIENT_ID=your_microsoft_graph_client_id
   ```

5. Run the application:
   - For Android:
     ```
     npx react-native run-android
     ```
   - For iOS:
     ```
     npx react-native run-ios
     ```

## Project Structure

- `/screens`: Main screen components (BrainstormScreen, ConversationFilesScreen, SettingsScreen)
- `/components`: Reusable React components (MessageBubble, AudioPlayer)
- `/services`: API and service integrations (apiService, claudeService, openAIService, oneNoteService)
- `/utils`: Utility functions and helpers (formatConversation, systemPrompt)
- `/theme`: Theme configuration and context provider
- `/types`: TypeScript type definitions

## Key Components

### BrainstormScreen
![image](https://github.com/user-attachments/assets/9ebe8d33-ed65-4c2f-ae34-bf5ebcd9230e)
The core of the application where users interact with the AI, record voice inputs, and view conversation history.

### ConversationFilesScreen
![image](https://github.com/user-attachments/assets/2022ddf6-74ff-4ffe-95ea-e93f4815335e)
Displays all recorded conversations with options to view details, play audio, and export to OneNote.

### SettingsScreen
![image](https://github.com/user-attachments/assets/8be78d6b-e31b-4fcb-a6c9-21c5fcd77701)
Allows users to configure API keys, toggle themes, and manage OneNote integration.

### MessageBubble
A versatile component for displaying conversation messages with integrated audio playback.

## Features in Detail

### AI Integration
Utilizes Anthropic's Claude API for generating contextually relevant responses in brainstorming sessions.

### Voice Recording and Transcription
Implements voice recording functionality with automatic transcription using OpenAI's Whisper API.

### OneNote Integration
Enables exporting conversations to OneNote for persistent knowledge management.

### Theme Support
Offers dark and light themes with automatic system preference detection for optimal user experience.

### Audio Playback
Advanced audio management using react-native-track-player for high-quality playback of recorded sessions.

## Roadmap

- [x] Basic app structure and navigation
- [x] Voice recording and playback
- [x] Integration with OpenAI Whisper for transcription
- [x] Integration with Anthropic Claude for AI interactions
- [x] Conversation history management
- [x] OneNote integration for knowledge base management
- [x] Dark/Light theme support
- [x] Automatic subject summarization
- [ ] OneDrive integration for data synchronization
- [ ] iOS compatibility testing and fixes
- [ ] Performance optimizations for large conversation histories
- [ ] Electron-based desktop version

## Contributing

Contributions are welcome and greatly appreciated! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Development Notes

- 95% of the coding was done through Anthropic Claude 3.5 Sonnet Copy / Pasting
- Current development and testing have been primarily done with Android emulators
- iOS compatibility is a work in progress

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for the Whisper API
- [Anthropic](https://www.anthropic.com/) for the Claude API
- [Microsoft](https://www.microsoft.com/) for the Graph API and OneNote integration
- The React Native community for their excellent documentation and support

## Contact

Patrick Bélanger - [@PatBQc](https://github.com/PatBQc)

Project Link: [https://github.com/PatBQc/ThoughtForgeAI](https://github.com/PatBQc/ThoughtForgeAI)

To learn more about the developer, visit:
- Website: https://www.patb.ca
- GitHub profile: https://github.com/PatBQc
