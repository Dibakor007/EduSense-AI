# Voice-Based Learning Assistant - Implementation Guide

## Quick Start

### 1. Import the Component

```tsx
import VoiceBasedLearningAssistant from "./components/VoiceBasedLearningAssistant";
```

### 2. Add to Your Page

```tsx
<VoiceBasedLearningAssistant
  isActive={true}
  context="lesson"
  subject="Mathematics"
/>
```

### 3. Set Environment Variable

```bash
API_KEY=your_gemini_api_key_here
```

## Integration Checklist

### Prerequisites

- [ ] Gemini API key obtained from Google AI Studio
- [ ] API key set as environment variable `API_KEY`
- [ ] `@google/genai` package installed (already in package.json)
- [ ] TypeScript configured in project
- [ ] HTTPS enabled (or using localhost for development)

### File Structure

```
edusense-ai/
├── components/
│   ├── VoiceBasedLearningAssistant.tsx       ✓ Main component
│   ├── VoiceBasedLearningAssistant.examples.tsx  ✓ Example implementations
│   └── [other components]
├── services/
│   ├── voiceService.ts                      ✓ Voice service
│   └── aiService.ts
├── types.ts
├── types.voice.ts                           ✓ Voice types
├── VOICE_LEARNING_GUIDE.md                  ✓ Documentation
└── VOICE_IMPLEMENTATION_GUIDE.md            ✓ This file
```

## Step-by-Step Integration

### Step 1: Update Your View Component

```tsx
import React, { useState } from "react";
import VoiceBasedLearningAssistant from "../components/VoiceBasedLearningAssistant";

const MyLessonView: React.FC = () => {
  const [lastVoiceCommand, setLastVoiceCommand] = useState<string>("");

  const handleVoiceCommand = (command: string, response: string) => {
    setLastVoiceCommand(`Command: ${command}\nResponse: ${response}`);

    // Process command in your app logic
    processCommand(command, response);
  };

  return (
    <div className="lesson-container">
      <h1>My Lesson</h1>

      {/* Your lesson content */}
      <div className="lesson-content">{/* Content here */}</div>

      {/* Add Voice Assistant */}
      <VoiceBasedLearningAssistant
        isActive={true}
        context="lesson"
        subject="Your Subject"
        onCommandExecuted={handleVoiceCommand}
      />

      {/* Display results */}
      {lastVoiceCommand && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3>Last Voice Command</h3>
          <pre>{lastVoiceCommand}</pre>
        </div>
      )}
    </div>
  );
};

export default MyLessonView;
```

### Step 2: Integration with Quiz

```tsx
const QuizViewWithVoice: React.FC<{ quizId: string }> = ({ quizId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleVoiceAnswer = (command: string, response: string) => {
    // Extract answer from voice command
    const answer = extractAnswerFromVoice(command);

    // Store answer
    setAnswers((prev) => ({
      ...prev,
      [quizId + "_q" + currentQuestionIndex]: answer,
    }));

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Quiz Content */}
      <div>
        <h2>{currentQuestion.question}</h2>
        <p>
          Progress: {currentQuestionIndex + 1} / {questions.length}
        </p>
      </div>

      {/* Voice Assistant */}
      <VoiceBasedLearningAssistant
        isActive={true}
        context="quiz"
        subject={quizSubject}
        onCommandExecuted={handleVoiceAnswer}
      />
    </div>
  );
};
```

### Step 3: Integration with Homework/Practice

```tsx
const HomeworkView: React.FC = () => {
  const [solutions, setSolutions] = useState<
    Array<{
      problem: string;
      solution: string;
      timestamp: Date;
    }>
  >([]);

  const handleVoiceHelp = (command: string, response: string) => {
    setSolutions((prev) => [
      ...prev,
      {
        problem: command,
        solution: response,
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="p-6">
      <h1>Homework Help</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          {/* Display homework problems */}
          <div className="bg-blue-50 p-4 rounded">
            <h3>Problem:</h3>
            <p className="text-lg font-mono">Solve: x² + 5x + 6 = 0</p>
          </div>

          {/* Show solutions found */}
          <div className="mt-4">
            <h3>Solutions:</h3>
            {solutions.map((sol, idx) => (
              <div key={idx} className="mt-2 p-3 bg-gray-100 rounded">
                <p>
                  <strong>Q:</strong> {sol.problem}
                </p>
                <p>
                  <strong>A:</strong> {sol.solution}
                </p>
              </div>
            ))}
          </div>
        </div>

        <VoiceBasedLearningAssistant
          isActive={true}
          context="homework"
          subject="Mathematics"
          onCommandExecuted={handleVoiceHelp}
        />
      </div>
    </div>
  );
};
```

### Step 4: Integration with Classroom Management

```tsx
// In TeacherDashboardView or StudentClassroomView
const ClassroomWithVoice: React.FC = () => {
  return (
    <div className="classroom-view">
      {/* Existing classroom content */}

      {/* Add voice assistant for student help */}
      {userRole === "student" && (
        <VoiceBasedLearningAssistant
          isActive={true}
          context="classroom"
          subject={currentSubject}
          onCommandExecuted={(cmd, res) => {
            console.log("Student voice interaction:", cmd, res);
          }}
        />
      )}
    </div>
  );
};
```

## Advanced Usage

### Custom Voice Service Integration

```tsx
import voiceService from "../services/voiceService";

// Generate custom audio explanations
async function explainConcept(concept: string) {
  try {
    const explanation = await voiceService.generateAudioExplanation(
      `Explain ${concept} in simple terms for a 10th grader`
    );
    console.log("Explanation:", explanation);
  } catch (error) {
    console.error("Failed to explain:", error);
  }
}

// Get voice notes
function getSavedNotes() {
  const notes = voiceService.getVoiceNotes();
  return notes.filter((note) => note.subject === "Mathematics");
}

// Get command suggestions for specific context
async function getContextualSuggestions() {
  const suggestions = await voiceService.getVoiceCommandSuggestions(
    "solving quadratic equations"
  );
  console.log("Suggestions:", suggestions);
}
```

### Programmatic Control

```tsx
import voiceService from "../services/voiceService";

// Check if voice is available
if (voiceService.isAvailable()) {
  console.log("Voice features available");
}

// Manual listening control
voiceService.startListening(
  (result) => console.log(result.transcript),
  (error) => console.error(error)
);

// Manual speech synthesis
await voiceService.synthesizeSpeech({
  text: "Welcome to the lesson",
  rate: 0.95,
  pitch: 1,
  volume: 1,
});

// Clear all notes
voiceService.clearVoiceNotes();

// Cancel ongoing speech
voiceService.cancelSpeech();
```

## Component Props Reference

```tsx
interface VoiceBasedLearningAssistantProps {
  // Enable/disable the component
  isActive?: boolean;

  // Callback when voice command is processed
  onCommandExecuted?: (command: string, response: string) => void;

  // Learning context for better suggestions
  context?: string;

  // Subject being studied
  subject?: string;
}
```

## Browser Compatibility

| Browser | Support | Notes         |
| ------- | ------- | ------------- |
| Chrome  | ✓ Full  | Best support  |
| Edge    | ✓ Full  | Full support  |
| Firefox | ✓ Full  | Good support  |
| Safari  | ✓ Full  | Good support  |
| Opera   | ✓ Full  | Full support  |
| IE      | ✗ None  | Not supported |

## Troubleshooting Common Issues

### Issue: "Speech Recognition not available"

**Solution:**

- Ensure using HTTPS (or localhost for dev)
- Update browser to latest version
- Check if microphone is accessible

### Issue: Microphone Permission Denied

**Solution:**

- Check browser permissions settings
- Allow microphone access to the site
- Restart browser if needed

### Issue: API Errors

**Solution:**

```tsx
// Add error handling
<VoiceBasedLearningAssistant
  isActive={true}
  onError={(error) => {
    console.error("Voice error:", error);
    // Show user-friendly message
    showNotification("Voice feature temporarily unavailable");
  }}
/>
```

### Issue: No Speech Detected

**Solution:**

- Speak clearly and at normal pace
- Reduce background noise
- Check microphone is working
- Try different browser

### Issue: Slow API Responses

**Solution:**

- Check internet connection
- Verify API quota not exceeded
- Reduce request frequency
- Consider caching responses

## Performance Optimization

### 1. Lazy Load Voice Component

```tsx
const VoiceAssistant = React.lazy(
  () => import("./components/VoiceBasedLearningAssistant")
);

<Suspense fallback={<div>Loading...</div>}>
  <VoiceAssistant isActive={true} />
</Suspense>;
```

### 2. Memoize Component

```tsx
const MemoVoiceAssistant = React.memo(VoiceBasedLearningAssistant);
```

### 3. Limit Note Storage

```tsx
// In voiceService.ts - modify to limit storage
private maxNotes = 100;

createVoiceNote(transcript: string, subject?: string) {
  // ... existing code ...
  if (this.notes.length > this.maxNotes) {
    this.notes.shift(); // Remove oldest
  }
}
```

## Security Considerations

### 1. API Key Safety

- Never expose API key in client-side code
- Use environment variables
- Rotate keys regularly
- Monitor API usage

### 2. User Data

- Don't store sensitive information in voice notes
- Implement user authentication
- Clear notes on logout
- Comply with GDPR/privacy laws

### 3. HTTPS Requirement

- Use HTTPS in production
- Microphone access requires secure context
- Test thoroughly before deployment

## Testing

### Unit Testing Example

```tsx
import { render, screen } from "@testing-library/react";
import VoiceBasedLearningAssistant from "./VoiceBasedLearningAssistant";

test("renders voice assistant", () => {
  render(<VoiceBasedLearningAssistant isActive={true} />);
  expect(screen.getByText(/Start Listening/i)).toBeInTheDocument();
});

test("calls onCommandExecuted callback", async () => {
  const mockCallback = jest.fn();
  render(<VoiceBasedLearningAssistant onCommandExecuted={mockCallback} />);
  // Simulate voice interaction...
  expect(mockCallback).toHaveBeenCalled();
});
```

## Monitoring & Analytics

### Track Usage

```tsx
const handleVoiceCommand = (command: string, response: string) => {
  // Log analytics
  logEvent("voice_command", {
    command,
    subject,
    context,
    timestamp: new Date(),
  });
};
```

### Error Tracking

```tsx
const handleVoiceError = (error: string) => {
  // Log to error tracking service
  trackError("voice_error", {
    error,
    component: "VoiceBasedLearningAssistant",
    userAgent: navigator.userAgent,
  });
};
```

## Deployment Checklist

- [ ] API key set in production environment
- [ ] HTTPS enabled
- [ ] Error handling implemented
- [ ] Analytics tracking added
- [ ] Browser compatibility tested
- [ ] Microphone permissions tested
- [ ] Fallback UI for unsupported browsers
- [ ] Performance optimized
- [ ] Security audit completed
- [ ] User documentation prepared

## Support Resources

- **Gemini API Docs**: https://ai.google.dev/
- **Web Speech API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/

## Next Steps

1. ✓ Copy the three files to your project
2. ✓ Set environment variable
3. ✓ Import component in your views
4. ✓ Test voice functionality
5. ✓ Implement error handling
6. ✓ Monitor and iterate

## Contributing

To enhance the voice assistant:

1. Add new voice commands
2. Improve accent detection
3. Add language support
4. Enhance UI/UX
5. Add analytics

## Changelog

### v1.0.0 (Initial Release)

- Voice command support
- Audio explanations
- Voice-to-text note-taking
- Accent-adaptive recognition
- Gemini API integration
