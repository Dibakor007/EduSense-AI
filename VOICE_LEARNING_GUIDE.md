# Voice-Based Learning Assistant Component

A comprehensive React component for voice-based learning interactions with Gemini API integration. This component enables students to interact with educational content using voice commands, audio explanations, and voice-to-text note-taking.

## Features

### 1. **Voice Commands for Navigation and Quiz Answers**

- Real-time speech recognition using Web Speech API
- Support for natural language voice commands
- Commands are processed through Gemini API for intelligent interpretation
- Voice commands return natural language responses that are synthesized back to speech

### 2. **Audio Explanations for Visual Learners**

- Generate audio explanations for any educational content
- Uses Gemini API to create clear, concise explanations
- Text-to-speech synthesis for enhanced learning experience
- Adjustable speech rate, pitch, and volume

### 3. **Voice-to-Text Note-Taking During Lessons**

- Capture speech and convert to text automatically
- Save notes with timestamps for later review
- Organize notes by subject/topic
- Persistent note storage within session
- Quick access to all recorded notes

### 4. **Accent-Adaptive Speech Recognition**

- Detects accent variations in speech
- Adapts recognition to different accents and dialects
- Confidence scoring for transcription accuracy
- Support for various English accents and pronunciations

## Installation & Setup

### Prerequisites

- React 19.2+
- TypeScript
- Gemini API key (set in `process.env.API_KEY`)

### Browser Support

- Chrome, Edge, Firefox, Safari (modern versions)
- Requires HTTPS in production (exception: localhost for development)

### API Integration

The component uses the Gemini API (configured via `@google/genai` package).

Ensure your environment variable is set:

```bash
API_KEY=your_gemini_api_key_here
```

## Usage

### Basic Implementation

```tsx
import VoiceBasedLearningAssistant from "./components/VoiceBasedLearningAssistant";

function App() {
  return (
    <VoiceBasedLearningAssistant
      isActive={true}
      context="Mathematics lesson"
      subject="Algebra"
      onCommandExecuted={(command, response) => {
        console.log("Command:", command);
        console.log("Response:", response);
      }}
    />
  );
}
```

### Props

| Prop                | Type     | Required | Description                                                           |
| ------------------- | -------- | -------- | --------------------------------------------------------------------- |
| `isActive`          | boolean  | No       | Enable/disable the component (default: true)                          |
| `onCommandExecuted` | function | No       | Callback when a voice command is processed                            |
| `context`           | string   | No       | Learning context for better suggestions (default: 'general learning') |
| `subject`           | string   | No       | Current subject being studied                                         |

### Example with Different Contexts

```tsx
// For a quiz
<VoiceBasedLearningAssistant
  context="quiz"
  subject="Biology"
  onCommandExecuted={(cmd, res) => handleQuizCommand(cmd, res)}
/>

// For a general lesson
<VoiceBasedLearningAssistant
  context="lecture"
  subject="History"
/>

// For homework help
<VoiceBasedLearningAssistant
  context="homework"
  subject="Physics"
/>
```

## Component Structure

### Main Controls

1. **Start/Stop Listening**

   - Initiates voice recognition
   - Shows real-time transcript while listening
   - Automatically processes command when stopped

2. **Save Note**

   - Saves current transcript as a persistent note
   - Associates note with subject if provided
   - Timestamps for reference

3. **Voice Command Suggestions**

   - AI-generated suggestions based on context
   - Click to execute any suggestion
   - Dynamically updated based on learning context

4. **Notes Panel**

   - View all saved voice notes
   - Organized by subject
   - Timestamped entries
   - Clear all notes option

5. **Stop Speaking**
   - Cancel ongoing audio playback
   - Available during speech synthesis

### Display Sections

- **Conversation Panel**: Real-time chat with the AI assistant
- **Current Transcript**: Shows what you're currently saying
- **Voice Notes**: Organized collection of saved notes
- **Command Suggestions**: Context-aware voice command ideas

## Voice Service API

The underlying `voiceService` provides these methods:

```typescript
// Start listening for voice input
startListening(onTranscript, onError): void

// Stop listening
stopListening(): void

// Synthesize speech from text
synthesizeSpeech(options): Promise<void>

// Generate audio explanation using Gemini
generateAudioExplanation(content): Promise<string>

// Process voice command with Gemini
processVoiceCommand(command): Promise<string>

// Create and save a voice note
createVoiceNote(transcript, subject): Promise<VoiceNote>

// Get all saved notes
getVoiceNotes(): VoiceNote[]

// Clear all notes
clearVoiceNotes(): void

// Get AI-suggested commands
getVoiceCommandSuggestions(context): Promise<string[]>

// Check if service is available
isAvailable(): boolean

// Check if currently listening
isCurrentlyListening(): boolean

// Cancel speech synthesis
cancelSpeech(): void
```

## Voice Command Examples

### For Math Learning

- "Explain this equation"
- "What's the next step?"
- "Give me another example"
- "How do I solve this?"

### For Language Learning

- "Pronounce this word"
- "What does this mean?"
- "Translate this sentence"
- "Give me pronunciation practice"

### For Quiz Taking

- "Read the question"
- "Is my answer correct?"
- "What's the explanation?"
- "Next question please"

### For General Learning

- "Define this concept"
- "Can you summarize?"
- "Give me an example"
- "What are the key points?"

## Features Breakdown

### 1. Speech Recognition

The component uses the Web Speech API for real-time voice input:

- Continuous recognition mode
- Interim results during speaking
- Confidence scoring
- Accent detection (simplified)
- Error handling for unsupported browsers

### 2. Speech Synthesis

Text-to-speech output with customizable parameters:

- Adjustable speech rate (0.5 - 2.0)
- Pitch control (0.5 - 2.0)
- Volume control (0 - 1.0)
- Graceful handling of ongoing speech

### 3. Gemini API Integration

Commands are processed through three Gemini API endpoints:

1. **Command Processing**: Interprets voice commands and generates responses
2. **Explanation Generation**: Creates detailed audio explanations
3. **Suggestion Generation**: Provides context-aware command suggestions

### 4. Note Management

- In-memory storage of voice notes
- Timestamps for each note
- Subject association
- Easy clearing and retrieval

## Styling

The component uses Tailwind CSS with a blue-to-indigo gradient theme:

- Main background: `from-blue-50 to-indigo-50`
- Primary buttons: `bg-blue-500`
- Accent colors for different features
- Responsive design for mobile and desktop
- Smooth animations and transitions

## Error Handling

The component handles various error scenarios:

- Browser doesn't support Speech Recognition
- Microphone access denied
- Speech synthesis errors
- Gemini API failures
- Network errors

All errors are displayed in a user-friendly error banner.

## State Management

Internal state tracking:

- `isListening`: Current listening status
- `currentTranscript`: User's latest speech input
- `interimTranscript`: Partial transcript while speaking
- `transcripts`: Full conversation history
- `voiceNotes`: Saved voice notes
- `isSpeaking`: Speech synthesis status
- `commandSuggestions`: AI-generated command suggestions
- `error`: Current error message

## Best Practices

### For Instructors

1. Provide clear context when implementing the component
2. Test voice recognition in your classroom environment
3. Ensure students understand available voice commands
4. Encourage note-taking during complex topics

### For Students

1. Speak clearly and naturally
2. Use suggested commands or phrase naturally
3. Review saved notes after lessons
4. Repeat commands if not recognized initially

### For Developers

1. Always set the API_KEY environment variable
2. Test in multiple browsers for compatibility
3. Handle HTTPS requirement in production
4. Consider adding keyboard shortcuts as fallbacks
5. Monitor Gemini API usage for cost management

## Accessibility Features

- Voice input for students with mobility challenges
- Audio output for visual learners
- Text alternatives for all voice features
- Keyboard controls via suggestions
- Clear status indicators

## Performance Considerations

- Voice service is instantiated as a singleton
- Minimal re-renders using React hooks
- Efficient transcript scrolling
- Auto-cleanup of old transcripts possible with pagination
- Async Gemini API calls don't block UI

## Future Enhancements

1. **Multi-language Support**: Extend to non-English languages
2. **Advanced Accent Detection**: Machine learning-based accent analysis
3. **Voice Biometrics**: Student identification via voice
4. **Offline Support**: Cache explanations and suggestions
5. **Analytics**: Track voice command effectiveness
6. **Custom Vocabulary**: Add subject-specific terms
7. **Interruption Handling**: Allow natural conversation flow
8. **Recording Export**: Save audio clips alongside notes

## Troubleshooting

### Microphone Not Working

- Check browser permissions for microphone access
- Restart the browser
- Try a different browser
- Ensure HTTPS connection (or localhost)

### Voice Commands Not Recognized

- Speak more clearly and at normal pace
- Use natural language phrasing
- Check for background noise
- Ensure language is set to English

### Speech Synthesis Not Working

- Check browser's speech synthesis support
- Ensure volume is not muted
- Try different voice if available
- Check for browser extensions blocking audio

### API Errors

- Verify API_KEY is correctly set
- Check Gemini API quota and usage
- Ensure internet connection is stable
- Review API error logs for details

## Integration Example

```tsx
import React, { useState } from "react";
import VoiceBasedLearningAssistant from "./components/VoiceBasedLearningAssistant";

function LessonPage() {
  const [lastCommand, setLastCommand] = useState<string>("");
  const [lastResponse, setLastResponse] = useState<string>("");

  const handleCommandExecuted = (command: string, response: string) => {
    setLastCommand(command);
    setLastResponse(response);

    // Handle command in your application
    console.log("Executed:", command);
    // Update lesson state, navigate, etc.
  };

  return (
    <div className="lesson-container">
      <div className="lesson-content">{/* Your lesson content */}</div>

      <VoiceBasedLearningAssistant
        isActive={true}
        context="lesson"
        subject="Mathematics"
        onCommandExecuted={handleCommandExecuted}
      />

      {lastCommand && (
        <div className="command-result">
          <p>
            <strong>Last Command:</strong> {lastCommand}
          </p>
          <p>
            <strong>Response:</strong> {lastResponse}
          </p>
        </div>
      )}
    </div>
  );
}

export default LessonPage;
```

## License

This component is part of the EduSense AI Adaptive Learning Platform.

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
