# Emotion-Aware Learning Component

## Overview

The **Emotion-Aware Learning** component is an intelligent system that monitors learner emotional states and adapts the learning experience accordingly. It detects frustration patterns, stress indicators, and engagement levels to provide personalized support and optimize learning outcomes.

## Features

### 1. **Frustration Pattern Detection**

- Tracks wrong answers and consecutive failures
- Monitors time spent on questions (excessive time indicates struggle)
- Detects retry patterns
- Calculates frustration score (0-100%)

### 2. **Stress Level Monitoring**

- Tracks session duration without breaks
- Monitors difficulty level of attempted questions
- Detects rushing behavior (too fast completion times)
- Provides stress score (0-100%)

### 3. **Engagement Tracking**

- Monitors activity gaps and idle time
- Tracks hint requests frequency
- Calculates engagement level (0-100%)
- Provides real-time engagement feedback

### 4. **Confidence Assessment**

- Inversely correlated with frustration and stress
- Real-time confidence scoring
- Visual feedback on learner confidence
- Personalized confidence-building suggestions

### 5. **Adaptive Difficulty Adjustment**

- Automatically suggests appropriate difficulty levels
- Based on emotional state analysis
- Recommendations:
  - **Easy**: When frustration > 70% or stress > 80%
  - **Medium**: When frustration > 50% or stress > 60%
  - **Hard**: When confidence > 80% and frustration < 30%

### 6. **Personalized Encouragement Messages**

Four types of messages:

- **Motivation**: When frustration is moderate (40-60%)
- **Break Suggestions**: When frustration > 60% or stress > 70%
- **Celebration**: After correct answers or achievements
- **Guidance**: When engagement drops below 50%

### 7. **Break Management**

- Automatic break suggestions after 45+ minutes
- Increased urgency after 90+ minutes
- Optional break acceptance/dismissal
- Personalized break messages

## Component Structure

### Props

```typescript
interface EmotionAwareLearningProps {
  user: User;
  onClose?: () => void;
}
```

### Emotional State Interface

```typescript
interface EmotionalState {
  frustrationLevel: number; // 0-100
  stressLevel: number; // 0-100
  engagementLevel: number; // 0-100
  confidenceLevel: number; // 0-100
}
```

### Learning Activity Tracking

```typescript
interface LearningActivity {
  timestamp: number;
  activityType: "question_answered" | "time_spent" | "hint_requested" | "retry";
  isCorrect?: boolean;
  timeSpent?: number; // seconds
  difficultyLevel?: "Easy" | "Medium" | "Hard" | "Expert";
}
```

## Usage

### Basic Integration

```tsx
import EmotionAwareLearning from "./components/EmotionAwareLearning";

function App() {
  const [user, setUser] = useState<User>(mockUser);

  return (
    <EmotionAwareLearning user={user} onClose={() => console.log("Closed")} />
  );
}
```

### Integration with Quiz/Assessment Systems

The component can be integrated with existing quiz systems by logging activities:

```typescript
// After a question is answered
const logActivity = (activity: LearningActivity) => {
  setActivityLog((prev) => [...prev, activity]);
};

// Example: Log correct answer
logActivity({
  timestamp: Date.now(),
  activityType: "question_answered",
  isCorrect: true,
  timeSpent: 45,
  difficultyLevel: "Medium",
});
```

## Visual Feedback

### Progress Bars

- **Frustration**: Red (high) → Yellow (moderate) → Green (low)
- **Stress**: Red (high) → Yellow (moderate) → Green (low)
- **Engagement**: Green (high) → Yellow (moderate) → Red (low)
- **Confidence**: Green (high) → Yellow (moderate) → Red (low)

### Emotion Icons

- **Smile**: Overall positive state (avg > 70%)
- **Meh**: Neutral state (avg 40-70%)
- **Frown**: Struggling state (avg < 40%)

## Algorithms

### Frustration Analysis

```
frustrationScore = 0
+ wrongAnswers × 15
+ (avgTimeSpent > 120s ? 20 : 0)
+ retries × 10
= min(frustrationScore, 100)
```

### Stress Calculation

```
stressScore = 0
+ (sessionDuration > 45min ? 30 : 0)
+ (sessionDuration > 90min ? 40 : 0)
+ recentHardQuestions × 10
+ (avgTime < 30s && count > 3 ? 20 : 0)
= min(stressScore, 100)
```

### Engagement Calculation

```
engagementScore = 100
- (idleTime > 3min ? 40 : 0)
- hints × 8
= max(engagementScore, 0)
```

### Confidence Calculation

```
confidence = max(0, 100 - (frustration + stress) / 2)
```

## Session Statistics

The component tracks and displays:

- Total activities completed
- Correct answers count
- Incorrect answers count
- Total time spent (in minutes)

## Demo Mode

The component includes simulation buttons for testing:

- ✓ **Correct Answer**: Simulates a correct response
- ✗ **Wrong Answer**: Simulates an incorrect response
- 💡 **Request Hint**: Simulates hint usage
- 🔄 **Retry Question**: Simulates question retry

## Customization

### Adjusting Thresholds

You can customize detection thresholds by modifying the component:

```typescript
// In analyzeFrustration()
frustrationScore += wrongAnswers * 15; // Adjust multiplier

// In calculateStress()
if (sessionDuration > 45) stressScore += 30; // Adjust duration/score

// In calculateEngagement()
engagementScore -= hints * 8; // Adjust hint penalty
```

### Custom Messages

Add your own encouragement messages by modifying the arrays in `generateEncouragementMessage()`:

```typescript
const motivationMessages = [
  `Custom message for ${user.name}`,
  // Add more messages...
];
```

## Benefits

1. **Improved Learning Outcomes**: Adaptive difficulty prevents frustration and boredom
2. **Better Retention**: Optimal stress levels enhance memory formation
3. **Increased Engagement**: Personalized encouragement maintains motivation
4. **Prevents Burnout**: Break suggestions promote healthy learning habits
5. **Data-Driven**: Evidence-based emotional state analysis
6. **Personalized Experience**: Messages and recommendations tailored to each learner

## Future Enhancements

Potential improvements:

- Integration with facial recognition for emotion detection
- Voice tone analysis for stress detection
- Machine learning for personalized threshold adjustment
- Historical emotional state tracking and analytics
- Peer comparison (anonymous) for motivation
- Integration with wearable devices (heart rate, etc.)
- Customizable notification preferences
- Parent/teacher dashboard for monitoring

## Dependencies

- React
- TypeScript
- User types from `../types`
- Card, Button components
- Icon components (BrainCircuitIcon, HeartIcon, SmileIcon, MehIcon, FrownIcon, TrendingUpIcon)

## Browser Support

Works on all modern browsers that support:

- ES6+
- CSS Grid
- Flexbox
- React 18+

## Accessibility

- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatible
- Clear visual indicators
- Dismissible notifications

## License

Same as parent project license.
