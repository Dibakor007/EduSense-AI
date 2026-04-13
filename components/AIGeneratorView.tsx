import React, { useState, useMemo, useEffect } from 'react';
import { Type } from "@google/genai";
import { generateJsonContent, generateTextContent } from '../services/aiService';
import { Result, GeneratedQuestion } from '../types';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { SparklesIcon, BrainCircuitIcon, LightbulbIcon, CheckCircleIcon, XCircleIcon } from './icons';

type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

interface AIGeneratorViewProps {
  lastResult: Result | null;
  onCompletePractice: (finalDifficulty: Difficulty) => void;
  initialTopic?: string;
}

type QuizStage = 'config' | 'in_progress' | 'summary';
const difficultyLevels: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];

const difficultyInfo = {
    Easy: { color: 'bg-success', label: 'Easy' },
    Medium: { color: 'bg-yellow-400', label: 'Medium' },
    Hard: { color: 'bg-warning', label: 'Hard' },
    Expert: { color: 'bg-danger', label: 'Expert' },
};

interface QuizRecord extends GeneratedQuestion {
    userAnswer: string;
    isCorrect: boolean;
}

// --- Sub-components for each stage ---

const ConfigScreen: React.FC<{
    initialTopic: string;
    initialDifficulty: Difficulty;
    weakTopics: string[];
    onStart: (topic: string, difficulty: Difficulty) => void;
    error: string | null;
    setError: (error: string | null) => void;
}> = ({ initialTopic, initialDifficulty, weakTopics, onStart, error, setError }) => {
    const [topic, setTopic] = useState(initialTopic);
    const [difficulty, setDifficulty] = useState(initialDifficulty);

    useEffect(() => {
        setTopic(initialTopic);
    }, [initialTopic]);

    const handleStart = () => {
        if (!topic.trim()) {
            setError("Please enter a topic.");
            return;
        }
        onStart(topic, difficulty);
    };

    return (
        <Card>
            <h2 className="text-2xl font-bold font-display text-neutral-extradark mb-4">Adaptive Practice Session</h2>
            <p className="text-neutral-medium mb-6">Hone your skills with a 20-question quiz that adapts to your performance.</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="topic" className="block text-sm font-medium text-neutral-dark">Topic</label>
                    <input
                        id="topic" type="text" value={topic} onChange={e => setTopic(e.target.value)}
                        placeholder="e.g., 'Linked Lists'"
                        className="mt-1 block w-full px-4 py-3 bg-surface/50 border border-neutral-light/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {weakTopics.length > 0 && !initialTopic && (
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="text-xs font-semibold text-neutral-medium">Suggestions:</span>
                            {weakTopics.map(t => (
                                <button key={t} onClick={() => setTopic(t)} className="px-2 py-1 text-xs font-semibold rounded-full bg-warning/20 text-warning-dark hover:bg-warning/30">
                                    {t}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="difficulty" className="block text-sm font-medium text-neutral-dark">Starting Difficulty</label>
                    <select
                        id="difficulty"
                        value={difficulty}
                        onChange={e => setDifficulty(e.target.value as Difficulty)}
                        className="mt-1 block w-full px-4 py-3 bg-surface/50 border border-neutral-light/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {difficultyLevels.map(level => <option key={level}>{level}</option>)}
                    </select>
                </div>
                {error && <p className="text-danger text-sm">{error}</p>}
                <Button onClick={handleStart} className="w-full !py-3">Start Practice</Button>
            </div>
        </Card>
    );
};

const QuizScreen: React.FC<{
    topic: string;
    questionNumber: number;
    difficulty: Difficulty;
    isLoading: boolean;
    error: string | null;
    currentQuestion: GeneratedQuestion | null;
    currentAnswer: string;
    onAnswerChange: (answer: string) => void;
    feedback: { isCorrect: boolean; explanation: string; hint?: string } | null;
    onAnswerSubmit: () => void;
    onNextQuestion: () => void;
}> = ({ topic, questionNumber, difficulty, isLoading, error, currentQuestion, currentAnswer, onAnswerChange, feedback, onAnswerSubmit, onNextQuestion }) => (
    <Card>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
            <div>
                <h2 className="text-xl font-bold font-display text-neutral-extradark">Question {questionNumber}/20</h2>
                <p className="text-primary font-semibold">{topic}</p>
            </div>
            <div className="text-left sm:text-center">
                <p className="text-xs font-semibold text-neutral-medium">DIFFICULTY</p>
                <span className={`px-3 py-1 text-sm font-bold text-white rounded-full ${difficultyInfo[difficulty].color}`}>
                    {difficultyInfo[difficulty].label}
                </span>
            </div>
        </div>
        <ProgressBar value={questionNumber} max={20} className="mb-4" />
        <div className="flex w-full h-2 rounded-full overflow-hidden bg-neutral-light/30 mb-6" title={`Current difficulty: ${difficulty}`}>
            {difficultyLevels.map((level, index) => (
                <div key={level} className="flex-1">
                    {difficultyLevels.indexOf(difficulty) >= index && (
                         <div className={`h-full ${difficultyInfo[level].color} transition-all duration-500`}></div>
                    )}
                </div>
            ))}
        </div>
        {isLoading && <p className="text-center p-8 animate-pulse">Generating question...</p>}
        {error && <p className="text-center p-8 text-danger">{error}</p>}
        {currentQuestion && (
            <div className="animate-fade-in">
                <p className="font-semibold text-lg text-neutral-dark mb-4">{currentQuestion.question}</p>
                <div className="space-y-3">
                    {currentQuestion.options.map(opt => (
                        <label key={opt} className={`flex items-center p-3 border rounded-lg transition-all ${currentAnswer === opt ? 'bg-primary/10 border-primary ring-2 ring-primary/50' : 'bg-surface/50 border-neutral-light/50'} ${feedback ? 'cursor-not-allowed' : 'cursor-pointer hover:border-primary/50'}`}>
                            <input type="radio" name="answer" value={opt} checked={currentAnswer === opt} onChange={e => onAnswerChange(e.target.value)} disabled={!!feedback} className="h-4 w-4 text-primary focus:ring-primary"/>
                            <span className="ml-3 text-neutral-dark">{opt}</span>
                        </label>
                    ))}
                </div>
                {feedback && (
                    <div className={`mt-4 p-4 rounded-lg border-l-4 ${feedback.isCorrect ? 'bg-success/10 border-success' : 'bg-danger/10 border-danger'}`}>
                        <div className="flex items-start gap-3">
                            {feedback.isCorrect ? <CheckCircleIcon className="h-6 w-6 text-success shrink-0"/> : <XCircleIcon className="h-6 w-6 text-danger shrink-0"/>}
                            <div>
                                <h3 className={`font-bold ${feedback.isCorrect ? 'text-success-dark' : 'text-danger-dark'}`}>
                                    {feedback.isCorrect ? 'Correct!' : `Not quite. The correct answer is: ${currentQuestion.correctAnswer}`}
                                </h3>
                                <p className="text-sm text-neutral-dark mt-1">{feedback.explanation}</p>
                                {feedback.hint && (
                                    <div className="mt-2 p-2 bg-yellow-400/10 border-l-4 border-warning rounded-r-md">
                                        <p className="text-sm text-yellow-700"><span className="font-bold">Hint:</span> {feedback.hint}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="mt-6 text-right">
                    {feedback ? (
                        <Button onClick={onNextQuestion}>
                            {questionNumber === 20 ? 'Finish & View Summary' : 'Next Question'}
                        </Button>
                    ) : (
                        <Button onClick={onAnswerSubmit} disabled={!currentAnswer}>Submit Answer</Button>
                    )}
                </div>
            </div>
        )}
    </Card>
);

const SummaryScreen: React.FC<{
    topic: string;
    score: number;
    isLoading: boolean;
    summary: string;
    onRestart: () => void;
}> = ({ topic, score, isLoading, summary, onRestart }) => (
    <Card className="text-center">
        <h2 className="text-2xl font-bold font-display text-neutral-extradark">Practice Complete!</h2>
        <p className="text-primary font-semibold mt-1">{topic}</p>
        <div className="my-6">
            <p className="text-5xl font-display font-bold text-neutral-extradark">{score}<span className="text-2xl text-neutral-medium">/20</span></p>
            <p className="font-semibold text-neutral-dark">Correct Answers</p>
        </div>
        <Card padding="sm" className="bg-primary/5">
            <div className="flex items-center">
                <SparklesIcon className="h-6 w-6 text-primary mr-3 shrink-0" />
                <div>
                    <h3 className="font-bold text-left text-primary-dark">AI Feedback</h3>
                    {isLoading ? <p className="text-left animate-pulse">Generating summary...</p> : <p className="text-left text-neutral-dark">{summary}</p>}
                </div>
            </div>
        </Card>
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="outline" onClick={onRestart}>Practice Again</Button>
        </div>
    </Card>
);


const AIGeneratorView: React.FC<AIGeneratorViewProps> = ({ lastResult, onCompletePractice, initialTopic }) => {
    const [stage, setStage] = useState<QuizStage>('config');
    const [topic, setTopic] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const [currentQuestion, setCurrentQuestion] = useState<GeneratedQuestion | null>(null);
    const [currentAnswer, setCurrentAnswer] = useState<string>('');
    const [feedback, setFeedback] = useState<{ isCorrect: boolean; explanation: string; hint?: string } | null>(null);

    const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);
    const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
    const [correctStreak, setCorrectStreak] = useState(0);

    const [summary, setSummary] = useState<string>('');

    const weakTopics = useMemo(() => {
        if (!lastResult) return [];
        return Object.entries(lastResult.skillBreakdown)
            .filter(([, data]) => (data as { percentage: number }).percentage < 75)
            .map(([topic]) => topic);
    }, [lastResult]);
    
    useEffect(() => {
        if (initialTopic) {
            setTopic(initialTopic);
        } else if (weakTopics.length > 0 && !topic) {
            setTopic(weakTopics[0]);
        }
    }, [initialTopic, weakTopics, topic]);

    const fetchQuestion = async (currentDifficulty: Difficulty) => {
        setIsLoading(true);
        setError(null);
        setCurrentQuestion(null);
        
        try {
            const schema = {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctAnswer: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                },
                required: ['question', 'correctAnswer', 'explanation', 'options'],
            };
            const prompt = `Generate a single multiple choice question with 4 options for a quiz.
            Topic: ${topic}.
            Difficulty: ${currentDifficulty}.
            The 'correctAnswer' must exactly match one of the options.`;
            
            const questionData = await generateJsonContent(prompt, schema);
            setCurrentQuestion(questionData);
        } catch (e) {
            console.error("Error generating question:", e);
            setError("Failed to generate a question. The topic might be too specific. Please try another one.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchHint = async (questionText: string): Promise<string> => {
        try {
            const prompt = `The student answered this question incorrectly: "${questionText}". Provide a very short, one-sentence hint to help them understand the core concept without giving away the answer.`;
            return await generateTextContent(prompt);
        } catch (e) {
            console.error("Error fetching hint:", e);
            return "Remember to review the fundamental principles of this topic.";
        }
    };
    
    const fetchSummary = async () => {
        setIsLoading(true);
        try {
            const score = quizHistory.filter(q => q.isCorrect).length;
            const prompt = `A student just finished a 20-question adaptive quiz on "${topic}". They got ${score} out of 20 correct and reached a final difficulty of "${difficulty}".
            Provide a short, encouraging summary (2-3 sentences) of their performance and suggest one specific area to focus on next.`;
            const summaryText = await generateTextContent(prompt);
            setSummary(summaryText);
        } catch (e) {
            console.error("Error fetching summary:", e);
            setSummary("Great work completing the adaptive quiz! Keep practicing to solidify your knowledge.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleStartQuiz = (startTopic: string, startDifficulty: Difficulty) => {
        setTopic(startTopic);
        setDifficulty(startDifficulty);
        setQuizHistory([]);
        setCorrectStreak(0);
        setFeedback(null);
        setCurrentAnswer('');
        setSummary('');
        setStage('in_progress');
        fetchQuestion(startDifficulty);
    };

    const handleAnswerSubmit = async () => {
        if (!currentQuestion || !currentAnswer) return;
        
        const isCorrect = currentAnswer === currentQuestion.correctAnswer;
        
        if (isCorrect) {
            const newStreak = correctStreak + 1;
            setCorrectStreak(newStreak);
            if (newStreak >= 2) {
                const currentDifficultyIndex = difficultyLevels.indexOf(difficulty);
                if (currentDifficultyIndex < difficultyLevels.length - 1) {
                    setDifficulty(difficultyLevels[currentDifficultyIndex + 1]);
                }
                setCorrectStreak(0);
            }
            setFeedback({ isCorrect: true, explanation: currentQuestion.explanation });
        } else {
            setCorrectStreak(0);
            const currentDifficultyIndex = difficultyLevels.indexOf(difficulty);
            if (currentDifficultyIndex > 0) {
                setDifficulty(difficultyLevels[currentDifficultyIndex - 1]);
            }
            const hint = await fetchHint(currentQuestion.question);
            setFeedback({ isCorrect: false, explanation: currentQuestion.explanation, hint });
        }
        
        setQuizHistory([...quizHistory, { ...currentQuestion, userAnswer: currentAnswer, isCorrect }]);
    };

    const handleNextQuestion = () => {
        if (quizHistory.length >= 19) { // Check before incrementing
            setStage('summary');
            onCompletePractice(difficulty);
            fetchSummary();
        } else {
            setFeedback(null);
            setCurrentAnswer('');
            fetchQuestion(difficulty);
        }
    };
    
    const handleRestart = () => {
        setStage('config');
        setQuizHistory([]);
        setDifficulty('Easy');
        setCorrectStreak(0);
        setFeedback(null);
        setCurrentAnswer('');
        setCurrentQuestion(null);
        setSummary('');
        if (!initialTopic) {
            setTopic('');
        }
    };

    const renderContent = () => {
        switch (stage) {
            case 'in_progress':
                return <QuizScreen 
                    topic={topic}
                    questionNumber={quizHistory.length + 1}
                    difficulty={difficulty}
                    isLoading={isLoading}
                    error={error}
                    currentQuestion={currentQuestion}
                    currentAnswer={currentAnswer}
                    onAnswerChange={setCurrentAnswer}
                    feedback={feedback}
                    onAnswerSubmit={handleAnswerSubmit}
                    onNextQuestion={handleNextQuestion}
                />;
            case 'summary':
                return <SummaryScreen 
                    topic={topic}
                    score={quizHistory.filter(q => q.isCorrect).length}
                    isLoading={isLoading}
                    summary={summary}
                    onRestart={handleRestart}
                />;
            case 'config':
            default:
                return <ConfigScreen 
                    initialTopic={topic}
                    initialDifficulty={difficulty}
                    weakTopics={weakTopics}
                    onStart={handleStartQuiz}
                    error={error}
                    setError={setError}
                />;
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-8 text-center">
                <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-full mb-4">
                    <BrainCircuitIcon className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Adaptive Practice</h1>
                <p className="text-lg text-neutral-medium mt-2 max-w-2xl mx-auto">Strengthen your skills with a quiz that adapts to you.</p>
            </header>
            {renderContent()}
        </div>
    );
};

export default AIGeneratorView;