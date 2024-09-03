# ThoughtForgeAI

ThoughtForgeAI is a React Native application designed to facilitate AI-assisted brainstorming sessions. It allows users to engage in voice conversations with an AI (using OpenAI's GPT or Anthropic's Claude), record these sessions, and manage the resulting knowledge base.


## Features

- Voice-based interaction with AI for brainstorming sessions
- Automatic transcription of voice recordings
- Conversation history management
- Audio playback of recorded sessions
- Cross-platform support (iOS and Android)
- Data synchronization with OneDrive (planned feature)
- Integration with OneNote for knowledge base management (planned feature)

## Technologies Used

- [React Native](https://reactnative.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [OpenAI Whisper API](https://openai.com/research/whisper) for voice transcription
- [Anthropic Claude API](https://www.anthropic.com/) for AI interactions
- [React Navigation](https://reactnavigation.org/) for app navigation
- [react-native-audio-recorder-player](https://github.com/hyochan/react-native-audio-recorder-player) for audio recording and playback

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

2. Navigate to the project directory (yes twice):
   ```
   cd ThoughtForgeAI
   cd ThoughtForgeAI
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
   ```

5. Run the application:
   - For Android:
     ```
     npx react-native run-android
     ```
   - For iOS (not currently tested):
     ```
     npx react-native run-ios
     ```

## Project Structure

- `/screens`: Contains the main screen components
- `/components`: Reusable React components
- `/services`: API and service integrations
- `/utils`: Utility functions and helpers

## Screenshots

[Insert screenshot of Brainstorm screen]
### Brainstorm
![image](https://github.com/user-attachments/assets/9ebe8d33-ed65-4c2f-ae34-bf5ebcd9230e)

The Brainstorm screen is where users can start new conversations with the AI. It features a record button to capture voice input and displays the conversation history.

### Conversations
![image](https://github.com/user-attachments/assets/2022ddf6-74ff-4ffe-95ea-e93f4815335e)

The Conversations screen lists all previous brainstorming sessions. Users can view details of each conversation and access audio recordings.

### Settings
![image](https://github.com/user-attachments/assets/8be78d6b-e31b-4fcb-a6c9-21c5fcd77701)

The Settings screen allows users to configure app preferences and manage API connections.

## Roadmap

- [x] Basic app structure and navigation
- [x] Voice recording and playback
- [x] Integration with OpenAI Whisper for transcription
- [x] Integration with Anthropic Claude for AI interactions
- [x] Conversation history management
- [ ] OneDrive integration for data synchronization
- [ ] OneNote integration for knowledge base management
- [ ] iOS compatibility testing and fixes
- [ ] Performance optimizations for large conversation histories

## Contributing

Contributions are welcome and greatly appreciated! Please feel free to submit a Pull Request.

## Development Notes

- 95% of the coding was done through Anthropic Claude 3.5 Sonnet Copy / Pasting
- Current development and testing have been primarily done with Android emulators
- No specific efforts have been made for iOS compatibility, although we believe no Android-specific features are being used

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [OpenAI](https://openai.com/) for the Whisper API
- [Anthropic](https://www.anthropic.com/) for the Claude API
- The React Native community for their excellent documentation and support

## Contact

To learn more about the developer, visit:
- Website: https://www.patb.ca
- GitHub profile: https://github.com/PatBQc
