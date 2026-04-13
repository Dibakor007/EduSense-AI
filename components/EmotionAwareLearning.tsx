import React, { useEffect, useRef, useState } from "react";
import { Result, User } from "../types";
import Button from "./Button";
import Card from "./Card";
import {
  BrainCircuitIcon,
  CheckCircleIcon,
  FrownIcon,
  HeartIcon,
  MehIcon,
  SmileIcon,
  TrendingUpIcon,
  XCircleIcon,
} from "./icons";

interface EmotionAwareLearningProps {
  user: User;
  lastResult?: Result | null;
  onClose?: () => void;
}

interface EmotionalState {
  frustrationLevel: number; // 0-100
  stressLevel: number; // 0-100
  engagementLevel: number; // 0-100
  confidenceLevel: number; // 0-100
}

interface LearningActivity {
  timestamp: number;
  activityType: "question_answered" | "time_spent" | "hint_requested" | "retry";
  isCorrect?: boolean;
  timeSpent?: number; // seconds
  difficultyLevel?: "Easy" | "Medium" | "Hard" | "Expert";
}

interface EncouragementMessage {
  type: "motivation" | "break" | "celebration" | "guidance";
  message: string;
  icon: React.ReactNode;
}

const SMOOTHING_ALPHA = 0.35; // Dampens abrupt swings in the emotional state
const MAX_SESSION_MINUTES_BEFORE_BREAK = 50;

const EmotionAwareLearning: React.FC<EmotionAwareLearningProps> = ({
  user,
  lastResult,
  onClose,
}) => {
  // Initialize emotional state based on last result if available
  const getInitialEmotionalState = (): EmotionalState => {
    if (!lastResult) {
      return {
        frustrationLevel: 0,
        stressLevel: 0,
        engagementLevel: 100,
        confidenceLevel: 70,
      };
    }

    const wrongCount = lastResult.questionResults.filter(
      (qr) => !qr.isCorrect
    ).length;
    const totalQuestions = lastResult.questionResults.length;
    const wrongPercentage = (wrongCount / totalQuestions) * 100;
    const score = lastResult.percentage;

    // Calculate initial frustration based on wrong answers
    const frustration = Math.min(wrongPercentage * 0.8, 80);

    // Calculate stress based on time taken and performance
    const stress =
      lastResult.timeTaken > 45
        ? Math.min(50 + (lastResult.timeTaken - 45), 70)
        : 30;

    // Engagement based on score
    const engagement = Math.max(40, Math.min(100, score + 20));

    // Confidence based on score
    const confidence = Math.max(20, Math.min(95, score));

    return {
      frustrationLevel: frustration,
      stressLevel: stress,
      engagementLevel: engagement,
      confidenceLevel: confidence,
    };
  };

  const [emotionalState, setEmotionalState] = useState<EmotionalState>(
    getInitialEmotionalState()
  );

  const [activityLog, setActivityLog] = useState<LearningActivity[]>([]);
  const [currentMessage, setCurrentMessage] =
    useState<EncouragementMessage | null>(null);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const [suggestedDifficulty, setSuggestedDifficulty] =
    useState<string>("Medium");
  const [sessionStartTime] = useState(Date.now());
  const [consecutiveWrong, setConsecutiveWrong] = useState(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [flowScore, setFlowScore] = useState(75);

  const activityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Show initial message based on last result
  useEffect(() => {
    if (lastResult) {
      const score = lastResult.percentage;
      if (score >= 80) {
        setCurrentMessage({
          type: "celebration",
          message: `Wow, ${user.name}! Your last score of ${score.toFixed(
            0
          )}% was outstanding! Your emotional state shows great confidence. Keep this momentum going! 🌟`,
          icon: <SmileIcon className="w-6 h-6" />,
        });
      } else if (score >= 60) {
        setCurrentMessage({
          type: "motivation",
          message: `Hey ${user.name}, you scored ${score.toFixed(
            0
          )}% on your last assessment. That's solid progress! Let's work on those challenging areas together. 💪`,
          icon: <HeartIcon className="w-6 h-6" />,
        });
      } else {
        setCurrentMessage({
          type: "guidance",
          message: `${user.name}, your last score was ${score.toFixed(
            0
          )}%. I can see you're facing some challenges. Let's break things down step by step and build your confidence back up. 🧩`,
          icon: <BrainCircuitIcon className="w-6 h-6" />,
        });
        if (lastResult.timeTaken > 60) {
          setShowBreakSuggestion(true);
        }
      }
    }
  }, [lastResult, user.name]);

  // Simulated activity tracking (in a real app, this would be connected to actual quiz/learning activities)
  useEffect(() => {
    activityTimerRef.current = setInterval(() => {
      setTotalTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => {
      if (activityTimerRef.current) {
        clearInterval(activityTimerRef.current);
      }
    };
  }, []);

  // Analyze frustration patterns
  const analyzeFrustration = (activities: LearningActivity[]): number => {
    if (activities.length === 0) return 0;

    const recentActivities = activities.slice(-10); // Last 10 activities
    let frustrationScore = 0;

    // Check for wrong answers
    const wrongAnswers = recentActivities.filter(
      (a) => a.activityType === "question_answered" && !a.isCorrect
    ).length;
    frustrationScore += wrongAnswers * 15;

    // Check for excessive time spent
    const avgTimeSpent =
      recentActivities
        .filter((a) => a.timeSpent)
        .reduce((acc, a) => acc + (a.timeSpent || 0), 0) /
      recentActivities.length;
    if (avgTimeSpent > 120) frustrationScore += 20; // More than 2 minutes per question

    // Check for retries
    const retries = recentActivities.filter(
      (a) => a.activityType === "retry"
    ).length;
    frustrationScore += retries * 10;

    // Penalize streaks of wrong answers more heavily than isolated mistakes
    if (consecutiveWrong >= 3) {
      frustrationScore += 20;
    }

    return Math.min(frustrationScore, 100);
  };

  // Calculate stress indicators
  const calculateStress = (activities: LearningActivity[]): number => {
    const sessionDuration = (Date.now() - sessionStartTime) / 1000 / 60; // minutes
    let stressScore = 0;

    // Long session without break
    if (sessionDuration > 45) stressScore += 30;
    if (sessionDuration > 90) stressScore += 40;

    // Encourage breaks when global timer exceeds threshold
    if (sessionDuration > MAX_SESSION_MINUTES_BEFORE_BREAK) {
      stressScore += 15;
    }

    // High difficulty questions
    const recentHardQuestions = activities
      .slice(-5)
      .filter(
        (a) => a.difficultyLevel === "Hard" || a.difficultyLevel === "Expert"
      ).length;
    stressScore += recentHardQuestions * 10;

    // Rapid consecutive activities (rushing)
    const recentTimes = activities.slice(-5).map((a) => a.timeSpent || 0);
    const avgTime = recentTimes.reduce((a, b) => a + b, 0) / recentTimes.length;
    if (avgTime < 30 && recentTimes.length > 3) stressScore += 20; // Too fast, possibly stressed

    // Rushing plus wrong answers suggests anxious guessing
    const wrongAndFast = activities
      .slice(-6)
      .filter(
        (a) =>
          a.activityType === "question_answered" &&
          !a.isCorrect &&
          (a.timeSpent || 0) < 25
      ).length;
    stressScore += wrongAndFast * 8;

    return Math.min(stressScore, 100);
  };

  // Calculate engagement level
  const calculateEngagement = (activities: LearningActivity[]): number => {
    if (activities.length === 0) return 100;

    const recentActivities = activities.slice(-10);
    let engagementScore = 100;

    // Decrease for long gaps between activities
    const now = Date.now();
    const lastActivity = recentActivities[recentActivities.length - 1];
    if (lastActivity && now - lastActivity.timestamp > 180000) {
      // 3 minutes idle
      engagementScore -= 40;
    }

    // Decrease for excessive hints
    const hints = recentActivities.filter(
      (a) => a.activityType === "hint_requested"
    ).length;
    engagementScore -= hints * 8;

    // Reward correct streaks to keep learners in flow
    const lastFive = recentActivities.slice(-5);
    const correctStreak = lastFive.filter((a) => a.isCorrect).length;
    engagementScore += correctStreak * 4;

    return Math.max(engagementScore, 0);
  };

  // Update emotional state based on activities
  useEffect(() => {
    const frustration = analyzeFrustration(activityLog);
    const stress = calculateStress(activityLog);
    const engagement = calculateEngagement(activityLog);

    // Confidence inversely related to frustration and stress
    const confidence = Math.max(0, 100 - (frustration + stress) / 2);

    // Smooth the emotional curve to avoid jarring UI jumps
    setEmotionalState((prev) => ({
      frustrationLevel:
        prev.frustrationLevel * (1 - SMOOTHING_ALPHA) +
        frustration * SMOOTHING_ALPHA,
      stressLevel:
        prev.stressLevel * (1 - SMOOTHING_ALPHA) + stress * SMOOTHING_ALPHA,
      engagementLevel:
        prev.engagementLevel * (1 - SMOOTHING_ALPHA) +
        engagement * SMOOTHING_ALPHA,
      confidenceLevel:
        prev.confidenceLevel * (1 - SMOOTHING_ALPHA) +
        confidence * SMOOTHING_ALPHA,
    }));

    // Flow score favors balanced stress, high engagement, and confidence
    const newFlowScore = Math.max(
      0,
      Math.min(
        100,
        engagement * 0.35 + confidence * 0.35 - stress * 0.15 - frustration * 0.15
      )
    );
    setFlowScore((prev) => prev * 0.6 + newFlowScore * 0.4);

    // Suggest breaks or motivation
    if (frustration > 60 || stress > 70) {
      setShowBreakSuggestion(true);
      generateEncouragementMessage("break");
    } else if (frustration > 40) {
      generateEncouragementMessage("motivation");
    } else if (engagement < 50) {
      generateEncouragementMessage("guidance");
    }

    // Adaptive difficulty adjustment
    adjustDifficulty(frustration, stress, confidence);
  }, [activityLog]);

  // Adjust difficulty based on emotional state
  const adjustDifficulty = (
    frustration: number,
    stress: number,
    confidence: number
  ) => {
    if (frustration > 70 || stress > 80) {
      setSuggestedDifficulty("Easy");
    } else if (frustration > 50 || stress > 60) {
      setSuggestedDifficulty("Medium");
    } else if (confidence > 80 && frustration < 30) {
      setSuggestedDifficulty("Hard");
    } else {
      setSuggestedDifficulty("Medium");
    }
  };

  // Generate personalized encouragement messages
  const generateEncouragementMessage = (
    type: "motivation" | "break" | "celebration" | "guidance"
  ) => {
    const motivationMessages = [
      `Hey ${user.name}, you're doing great! Every mistake is a step towards mastery. 💪`,
      `${user.name}, remember: learning is a journey, not a race. Take your time! 🌟`,
      `Don't give up, ${user.name}! The breakthrough is often just one more try away. 🚀`,
      `${user.name}, you've overcome challenges before, and you'll overcome this one too! 🎯`,
      `Progress over perfection, ${user.name}! You're learning and growing. 🌱`,
    ];

    const breakMessages = [
      `${user.name}, you've been working hard! How about a 5-minute break? Your brain will thank you! ☕`,
      `Time for a quick breather, ${user.name}! Step away, stretch, and come back refreshed. 🧘`,
      `${user.name}, taking breaks actually helps you learn better. Rest for a bit! 🌸`,
      `You've earned a break, ${user.name}! Go grab some water and reset. 💧`,
      `${user.name}, even champions need rest. Take 5 minutes to recharge! ⚡`,
    ];

    const celebrationMessages = [
      `Amazing work, ${user.name}! You're on fire! 🔥`,
      `Excellent progress, ${user.name}! Keep up this momentum! 🎉`,
      `You're crushing it, ${user.name}! Absolutely brilliant! ⭐`,
      `${user.name}, that's what I call mastery! Fantastic! 🏆`,
      `Wow, ${user.name}! You're making this look easy! 💯`,
    ];

    const guidanceMessages = [
      `${user.name}, try breaking down the problem into smaller steps. You've got this! 🧩`,
      `When stuck, ${user.name}, try explaining the concept out loud. It helps! 💡`,
      `${user.name}, remember to use the hints available. They're there to help you learn! 📚`,
      `Try a different approach, ${user.name}. Sometimes a fresh perspective works wonders! 🔄`,
      `${user.name}, reviewing the basics might help clarify this concept. No rush! 📖`,
    ];

    let messages: string[];
    let icon: React.ReactNode;

    switch (type) {
      case "motivation":
        messages = motivationMessages;
        icon = <SmileIcon className="w-6 h-6" />;
        break;
      case "break":
        messages = breakMessages;
        icon = <HeartIcon className="w-6 h-6" />;
        break;
      case "celebration":
        messages = celebrationMessages;
        icon = <SmileIcon className="w-6 h-6" />;
        break;
      case "guidance":
        messages = guidanceMessages;
        icon = <BrainCircuitIcon className="w-6 h-6" />;
        break;
    }

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setCurrentMessage({ type, message: randomMessage, icon });
  };

  // Simulate activity (for demo purposes)
  const simulateActivity = (
    activityType: LearningActivity["activityType"],
    isCorrect?: boolean
  ) => {
    const newActivity: LearningActivity = {
      timestamp: Date.now(),
      activityType,
      isCorrect,
      timeSpent: Math.floor(Math.random() * 180) + 30, // 30-210 seconds
      difficultyLevel: ["Easy", "Medium", "Hard", "Expert"][
        Math.floor(Math.random() * 4)
      ] as any,
    };

    setActivityLog((prev) => [...prev, newActivity]);

    if (activityType === "question_answered") {
      if (isCorrect) {
        setConsecutiveWrong(0);
        if (Math.random() > 0.7) {
          generateEncouragementMessage("celebration");
        }
      } else {
        setConsecutiveWrong((prev) => prev + 1);
        if (consecutiveWrong >= 2) {
          generateEncouragementMessage("motivation");
        }
      }
    }
  };

  // Take a break
  const takeBreak = () => {
    setShowBreakSuggestion(false);
    setCurrentMessage({
      type: "break",
      message: `Great decision, ${user.name}! See you in a few minutes. 😊`,
      icon: <HeartIcon className="w-6 h-6" />,
    });
  };

  // Dismiss message
  const dismissMessage = () => {
    setCurrentMessage(null);
    setShowBreakSuggestion(false);
  };

  // Get emotion icon based on state
  const getEmotionIcon = () => {
    const avgState =
      (emotionalState.engagementLevel + emotionalState.confidenceLevel) / 2;
    if (avgState > 70) return <SmileIcon className="w-12 h-12 text-success" />;
    if (avgState > 40) return <MehIcon className="w-12 h-12 text-warning" />;
    return <FrownIcon className="w-12 h-12 text-danger" />;
  };

  // Get color for progress bars
  const getColorClass = (value: number) => {
    if (value > 70) return "bg-danger";
    if (value > 40) return "bg-warning";
    return "bg-success";
  };

  const getEngagementColorClass = (value: number) => {
    if (value > 70) return "bg-success";
    if (value > 40) return "bg-warning";
    return "bg-danger";
  };

  const flowBadge = () => {
    if (flowScore >= 80) return { label: "In the zone", tone: "bg-success/15 text-success" };
    if (flowScore >= 60) return { label: "Stable focus", tone: "bg-warning/15 text-warning-dark" };
    return { label: "Needs reset", tone: "bg-danger/15 text-danger" };
  };

  const actionPlan = () => {
    const actions: string[] = [];

    if (emotionalState.frustrationLevel > 60) {
      actions.push("Try an easier variant to rebuild confidence");
    }
    if (emotionalState.stressLevel > 60 || totalTimeSpent / 60 > MAX_SESSION_MINUTES_BEFORE_BREAK) {
      actions.push("Take a 5-minute reset break with hydration");
    }
    if (emotionalState.engagementLevel < 50) {
      actions.push("Switch to a hands-on example or mini-quiz");
    }
    if (actions.length === 0) {
      actions.push("Stay in current flow and push one level harder");
    }

    return actions;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/90 via-primary to-purple-600 text-white shadow-lg">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top_left,_#ffffff_0,_transparent_50%)]" />
        <div className="relative p-6 sm:p-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/15 rounded-full p-3">
              <BrainCircuitIcon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-display">Emotion-Aware Learning</h1>
              <p className="text-sm text-white/80">Adaptive support that responds to mood, momentum, and cognitive load.</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`text-sm px-3 py-1 rounded-full border border-white/30 ${flowBadge().tone}`}>
              {flowBadge().label} · Flow {Math.round(flowScore)}%
            </span>
            <span className="text-sm px-3 py-1 rounded-full bg-white/15 backdrop-blur">
              Suggested: {suggestedDifficulty}
            </span>
            {onClose && (
              <Button onClick={onClose} variant="outline" className="bg-white text-primary border-none">
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Current Emotional State */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold font-display text-neutral-extradark">
            Your Learning State
          </h2>
          {getEmotionIcon()}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 rounded-xl bg-neutral-light/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-dark">
                Frustration Level
              </span>
              <span className="text-sm font-bold">
                {emotionalState.frustrationLevel.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getColorClass(
                  emotionalState.frustrationLevel
                )}`}
                style={{ width: `${emotionalState.frustrationLevel}%` }}
              />
            </div>
            <p className="text-xs text-neutral-medium mt-1">
              {emotionalState.frustrationLevel > 70
                ? "High - Consider taking a break"
                : emotionalState.frustrationLevel > 40
                ? "Moderate - You're doing fine"
                : "Low - Great focus!"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-light/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-dark">
                Stress Level
              </span>
              <span className="text-sm font-bold">
                {emotionalState.stressLevel.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getColorClass(
                  emotionalState.stressLevel
                )}`}
                style={{ width: `${emotionalState.stressLevel}%` }}
              />
            </div>
            <p className="text-xs text-neutral-medium mt-1">
              {emotionalState.stressLevel > 70
                ? "High - Time for a break"
                : emotionalState.stressLevel > 40
                ? "Moderate - Stay calm"
                : "Low - Relaxed learning!"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-light/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-dark">
                Engagement Level
              </span>
              <span className="text-sm font-bold">
                {emotionalState.engagementLevel.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getEngagementColorClass(
                  emotionalState.engagementLevel
                )}`}
                style={{ width: `${emotionalState.engagementLevel}%` }}
              />
            </div>
            <p className="text-xs text-neutral-medium mt-1">
              {emotionalState.engagementLevel > 70
                ? "High - Excellent focus!"
                : emotionalState.engagementLevel > 40
                ? "Moderate - Stay engaged"
                : "Low - Need motivation?"}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-neutral-light/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-neutral-dark">
                Confidence Level
              </span>
              <span className="text-sm font-bold">
                {emotionalState.confidenceLevel.toFixed(0)}%
              </span>
            </div>
            <div className="w-full h-3 bg-neutral-light rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${getEngagementColorClass(
                  emotionalState.confidenceLevel
                )}`}
                style={{ width: `${emotionalState.confidenceLevel}%` }}
              />
            </div>
            <p className="text-xs text-neutral-medium mt-1">
              {emotionalState.confidenceLevel > 70
                ? "High - You've got this!"
                : emotionalState.confidenceLevel > 40
                ? "Moderate - Building up"
                : "Low - Take it step by step"}
            </p>
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-3">
          {actionPlan().map((action) => (
            <div key={action} className="flex items-center gap-3 rounded-lg bg-white shadow-sm border border-neutral-light px-3 py-2">
              <span className="text-lg">⭐</span>
              <p className="text-sm text-neutral-dark">{action}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Last Result Analysis */}
      {lastResult && (
        <Card className="border-l-4 border-primary">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuitIcon className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-bold font-display text-neutral-extradark">
              Last Assessment Analysis
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-primary/10 rounded-lg">
              <p className="text-3xl font-bold text-primary">
                {lastResult.percentage.toFixed(0)}%
              </p>
              <p className="text-sm text-neutral-medium mt-1">Overall Score</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <CheckCircleIcon className="w-6 h-6 text-success" />
                <p className="text-3xl font-bold text-success">
                  {
                    lastResult.questionResults.filter((qr) => qr.isCorrect)
                      .length
                  }
                </p>
              </div>
              <p className="text-sm text-neutral-medium mt-1">
                Correct Answers
              </p>
            </div>
            <div className="text-center p-4 bg-danger/10 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                <XCircleIcon className="w-6 h-6 text-danger" />
                <p className="text-3xl font-bold text-danger">
                  {
                    lastResult.questionResults.filter((qr) => !qr.isCorrect)
                      .length
                  }
                </p>
              </div>
              <p className="text-sm text-neutral-medium mt-1">Wrong Answers</p>
            </div>
          </div>

          <div className="bg-neutral-light/30 rounded-lg p-4">
            <h4 className="font-bold text-neutral-extradark mb-3">
              Emotional Impact Analysis
            </h4>
            <div className="space-y-2 text-sm">
              {lastResult.percentage >= 80 ? (
                <p className="text-success-dark flex items-start gap-2">
                  <span className="text-lg">🎉</span>
                  <span>
                    Excellent performance! Your high score indicates strong
                    confidence and low frustration levels. Keep up the great
                    work!
                  </span>
                </p>
              ) : lastResult.percentage >= 60 ? (
                <p className="text-warning-dark flex items-start gap-2">
                  <span className="text-lg">💪</span>
                  <span>
                    Good effort! Some challenges encountered may have increased
                    frustration slightly. Focus on the areas that need
                    improvement.
                  </span>
                </p>
              ) : (
                <p className="text-danger-dark flex items-start gap-2">
                  <span className="text-lg">🤔</span>
                  <span>
                    This assessment was challenging. Higher frustration and
                    stress levels detected. Consider reviewing fundamentals and
                    taking regular breaks while studying.
                  </span>
                </p>
              )}

              {lastResult.timeTaken > 60 && (
                <p className="text-neutral-dark flex items-start gap-2">
                  <span className="text-lg">⏱️</span>
                  <span>
                    Time taken: {lastResult.timeTaken} minutes. Extended
                    duration may indicate increased cognitive load. Try
                    practicing with shorter, focused sessions.
                  </span>
                </p>
              )}

              {Object.keys(lastResult.skillBreakdown).length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-neutral-extradark mb-2">
                    Skill Performance:
                  </p>
                  <div className="space-y-2">
                    {Object.entries(lastResult.skillBreakdown)
                      .sort(
                        ([, a], [, b]) =>
                          (b as { percentage: number }).percentage -
                          (a as { percentage: number }).percentage
                      )
                      .map(([skill, data]) => (
                        <div key={skill} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-medium text-neutral-dark">
                                {skill}
                              </span>
                              <span className="text-xs font-bold">
                                {(
                                  data as { percentage: number }
                                ).percentage.toFixed(0)}
                                %
                              </span>
                            </div>
                            <div className="w-full h-2 bg-neutral-light rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  (data as { percentage: number }).percentage >=
                                  70
                                    ? "bg-success"
                                    : (data as { percentage: number })
                                        .percentage >= 40
                                    ? "bg-warning"
                                    : "bg-danger"
                                }`}
                                style={{
                                  width: `${(
                                    data as { percentage: number }
                                  ).percentage.toFixed(0)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Encouragement Message */}
      {currentMessage && (
        <Card className="border-l-4 border-primary bg-primary/5">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 text-primary">
              {currentMessage.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg text-neutral-extradark mb-2">
                {currentMessage.type === "motivation" && "Keep Going!"}
                {currentMessage.type === "break" && "Break Time"}
                {currentMessage.type === "celebration" && "Excellent Work!"}
                {currentMessage.type === "guidance" && "Learning Tip"}
              </h3>
              <p className="text-neutral-dark">{currentMessage.message}</p>
            </div>
            <button
              onClick={dismissMessage}
              className="flex-shrink-0 text-neutral-medium hover:text-neutral-dark transition-colors"
            >
              ✕
            </button>
          </div>
          {showBreakSuggestion && (
            <div className="mt-4 flex gap-3">
              <Button onClick={takeBreak} className="flex-1">
                Take a 5-min Break
              </Button>
              <Button
                onClick={dismissMessage}
                variant="outline"
                className="flex-1"
              >
                Continue Learning
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Adaptive Difficulty Recommendation */}
      <Card>
        <h3 className="text-xl font-bold font-display text-neutral-extradark mb-4">
          Adaptive Difficulty Recommendation
        </h3>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6 p-4 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/15 rounded-xl">
              <TrendingUpIcon className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="text-sm text-neutral-medium">Based on your current state</p>
              <p className="text-2xl font-bold text-primary mt-1">
                {suggestedDifficulty} Difficulty
              </p>
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-3 text-sm text-neutral-medium">
            <div className="rounded-lg bg-white border border-neutral-light p-3">
              <p className="font-semibold text-neutral-extradark">Frustration</p>
              <p>{emotionalState.frustrationLevel.toFixed(0)}% · lower = harder content</p>
            </div>
            <div className="rounded-lg bg-white border border-neutral-light p-3">
              <p className="font-semibold text-neutral-extradark">Confidence</p>
              <p>{emotionalState.confidenceLevel.toFixed(0)}% · higher = unlocks challenges</p>
            </div>
          </div>
          <Button className="whitespace-nowrap">Apply Recommendation</Button>
        </div>
        <p className="text-sm text-neutral-medium mt-3">
          We balance challenge and comfort by blending frustration, stress, confidence, and engagement to keep you in flow.
        </p>
      </Card>

      {/* Learning Session Stats */}
      <Card>
        <h3 className="text-xl font-bold font-display text-neutral-extradark mb-4">
          Session Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-neutral-light/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">
              {activityLog.length}
            </p>
            <p className="text-sm text-neutral-medium">Activities</p>
          </div>
          <div className="text-center p-4 bg-neutral-light/50 rounded-lg">
            <p className="text-2xl font-bold text-success">
              {activityLog.filter((a) => a.isCorrect).length}
            </p>
            <p className="text-sm text-neutral-medium">Correct</p>
          </div>
          <div className="text-center p-4 bg-neutral-light/50 rounded-lg">
            <p className="text-2xl font-bold text-danger">
              {activityLog.filter((a) => a.isCorrect === false).length}
            </p>
            <p className="text-sm text-neutral-medium">Incorrect</p>
          </div>
          <div className="text-center p-4 bg-neutral-light/50 rounded-lg">
            <p className="text-2xl font-bold text-neutral-extradark">
              {Math.floor(totalTimeSpent / 60)}m
            </p>
            <p className="text-sm text-neutral-medium">Time Spent</p>
          </div>
        </div>
      </Card>

      {/* Demo Controls (for testing) */}
      <Card>
        <h3 className="text-xl font-bold font-display text-neutral-extradark mb-4">
          Simulate Activities (Demo)
        </h3>
        <p className="text-sm text-neutral-medium mb-4">
          Use these buttons to simulate learning activities and see how the
          system responds:
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => simulateActivity("question_answered", true)}
            variant="outline"
          >
            ✓ Correct Answer
          </Button>
          <Button
            onClick={() => simulateActivity("question_answered", false)}
            variant="outline"
          >
            ✗ Wrong Answer
          </Button>
          <Button
            onClick={() => simulateActivity("hint_requested")}
            variant="outline"
          >
            💡 Request Hint
          </Button>
          <Button onClick={() => simulateActivity("retry")} variant="outline">
            🔄 Retry Question
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EmotionAwareLearning;
