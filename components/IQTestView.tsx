
import React, { useState } from 'react';
import { User, GeneratedQuestion } from '../types';
import { generateIQQuestions } from '../services/aiService';
import Card from './Card';
import Button from './Button';
import ProgressBar from './ProgressBar';
import { BrainCircuitIcon, SparklesIcon, CheckCircleIcon, XCircleIcon, TrophyIcon, CheckIcon } from './icons';

interface IQTestViewProps {
    user: User;
    onUpdateIqLevel: (newLevel: number) => void;
}

type Stage = 'start' | 'in_progress' | 'summary';

interface QuizRecord extends GeneratedQuestion {
    userAnswer: string;
    isCorrect: boolean;
}

const IQTestView: React.FC<IQTestViewProps> = ({ user, onUpdateIqLevel }) => {
    const [stage, setStage] = useState<Stage>('start');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [questions, setQuestions] = useState<GeneratedQuestion[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentAnswer, setCurrentAnswer] = useState<string>('');
    const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);
    const [summaryView, setSummaryView] = useState<'overview' | 'analysis'>('overview');

    const level = user.iqLevel ?? 0;
    const QUESTIONS_PER_LEVEL = 15;
    const LEVEL_UP_THRESHOLD = 0.7; // 70% correct to level up

    const handleStartTest = async () => {
        setIsLoading(true);
        setError(null);
        setQuizHistory([]);
        setCurrentQuestionIndex(0);
        setCurrentAnswer('');
        setSummaryView('overview');

        try {
            const fetchedQuestions = await generateIQQuestions(level);
            if (fetchedQuestions.length < QUESTIONS_PER_LEVEL) {
                 throw new Error("AI did not generate enough questions.");
            }
            setQuestions(fetchedQuestions.slice(0, QUESTIONS_PER_LEVEL));
            setStage('in_progress');
        } catch (e) {
            console.error(e);
            setError("Could not generate the IQ test right now. Please try again later.");
            setStage('start');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerSubmit = () => {
        if (!currentAnswer) return;
        
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = currentAnswer === currentQuestion.correctAnswer;
        
        const newHistory = [...quizHistory, { ...currentQuestion, userAnswer: currentAnswer, isCorrect }];
        setQuizHistory(newHistory);
        
        if (currentQuestionIndex < QUESTIONS_PER_LEVEL - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setCurrentAnswer('');
        } else {
            // End of quiz
            const score = newHistory.filter(q => q.isCorrect).length;
            if (score / QUESTIONS_PER_LEVEL >= LEVEL_UP_THRESHOLD) {
                onUpdateIqLevel(level + 1);
            }
            setStage('summary');
        }
    };

    const renderStartScreen = () => (
        <Card className="text-center p-8">
            <h2 className="text-2xl font-bold font-display text-neutral-extradark">IQ Challenge</h2>
            <p className="text-neutral-medium mt-2 mb-6">Test your logical reasoning and problem-solving skills.</p>
            <div className="mb-8">
                <p className="text-sm font-semibold text-neutral">CURRENT LEVEL</p>
                <p className="text-6xl font-display font-bold text-primary">{level}</p>
            </div>
            {error && <p className="text-danger mb-4">{error}</p>}
            <Button onClick={handleStartTest} disabled={isLoading} className="!px-8 !py-3">
                {isLoading ? 'Preparing Test...' : `Start Level ${level} Test`}
            </Button>
        </Card>
    );

    const renderInProgressScreen = () => {
        const question = questions[currentQuestionIndex];
        if (!question) return null;

        return (
            <Card>
                <h2 className="text-xl font-bold font-display text-neutral-extradark">Question {currentQuestionIndex + 1}/{QUESTIONS_PER_LEVEL}</h2>
                <ProgressBar value={currentQuestionIndex + 1} max={QUESTIONS_PER_LEVEL} className="my-4" />
                <p className="font-semibold text-lg text-neutral-dark mb-6 min-h-[6rem]">{question.question}</p>
                <div className="space-y-3">
                    {question.options.map(opt => (
                        <button
                            key={opt}
                            onClick={() => setCurrentAnswer(opt)}
                            className={`w-full text-left flex items-center p-3 border-2 rounded-lg transition-all ${currentAnswer === opt ? 'bg-primary/10 border-primary' : 'bg-surface/50 border-neutral-light/50 hover:border-primary/50'}`}
                        >
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mr-3 ${currentAnswer === opt ? 'border-primary bg-primary' : 'border-neutral-medium'}`}>
                                {currentAnswer === opt && <CheckIcon className="w-4 h-4 text-white" />}
                            </div>
                            <span className="text-neutral-dark font-medium">{opt}</span>
                        </button>
                    ))}
                </div>
                 <div className="mt-6 text-right">
                    <Button onClick={handleAnswerSubmit} disabled={!currentAnswer}>
                        {currentQuestionIndex === QUESTIONS_PER_LEVEL - 1 ? 'Finish Test' : 'Next Question'}
                    </Button>
                </div>
            </Card>
        );
    };

    const renderSummaryScreen = () => {
        const score = quizHistory.filter(q => q.isCorrect).length;
        const leveledUp = score / QUESTIONS_PER_LEVEL >= LEVEL_UP_THRESHOLD;

        if (summaryView === 'analysis') {
            return (
                <Card>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold font-display text-neutral-extradark">Test Analysis</h2>
                        <Button variant="outline" onClick={() => setSummaryView('overview')}>Back to Summary</Button>
                    </div>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                        {quizHistory.map((record, index) => (
                            <div key={index} className={`p-4 rounded-lg border-l-4 ${record.isCorrect ? 'border-success bg-success/5' : 'border-danger bg-danger/5'}`}>
                                <p className="font-bold text-neutral-dark">Q{index + 1}: {record.question}</p>
                                <div className="text-sm mt-2 space-y-1">
                                    <div className={`flex items-center ${record.isCorrect ? 'text-neutral-dark' : 'text-danger-dark'}`}>
                                        {record.isCorrect ? <CheckCircleIcon className="w-4 h-4 mr-2 text-success shrink-0" /> : <XCircleIcon className="w-4 h-4 mr-2 text-danger shrink-0"/>}
                                        Your answer: <span className="font-semibold ml-1">{record.userAnswer}</span>
                                    </div>
                                    {!record.isCorrect && (
                                        <div className="flex items-center text-success-dark">
                                            <CheckCircleIcon className="w-4 h-4 mr-2 text-success shrink-0"/>
                                            Correct answer: <span className="font-semibold ml-1">{record.correctAnswer}</span>
                                        </div>
                                    )}
                                    <p className="text-neutral-medium pt-1 pl-6">{record.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            );
        }

        return (
            <Card className="text-center p-8">
                {leveledUp && <TrophyIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4"/>}
                <h2 className="text-2xl font-bold font-display text-neutral-extradark">Test Complete!</h2>
                <div className="my-6">
                    <p className="text-5xl font-display font-bold text-neutral-extradark">{score}<span className="text-2xl text-neutral-medium">/{QUESTIONS_PER_LEVEL}</span></p>
                    <p className="font-semibold text-neutral-dark">Correct Answers</p>
                </div>
                {leveledUp ? (
                    <div className="p-4 bg-success/10 text-success-dark rounded-lg">
                        <p className="font-bold">Congratulations! You've reached IQ Level {level + 1}!</p>
                    </div>
                ) : (
                     <div className="p-4 bg-warning/10 text-warning-dark rounded-lg">
                        <p className="font-bold">Good effort! You need {Math.ceil(QUESTIONS_PER_LEVEL * LEVEL_UP_THRESHOLD)} correct answers to level up.</p>
                    </div>
                )}
                <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button variant="outline" onClick={() => setSummaryView('analysis')}>View Analysis</Button>
                    <Button onClick={() => setStage('start')} className="!px-8 !py-3">
                        {leveledUp ? `Start Level ${level + 1} Test` : `Try Level ${level} Again`}
                    </Button>
                </div>
            </Card>
        );
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <header className="mb-8 text-center">
                <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-full mb-4">
                    <BrainCircuitIcon className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">IQ Practice Zone</h1>
                <p className="text-lg text-neutral-medium mt-2 max-w-2xl mx-auto">Sharpen your mind with adaptive logical challenges.</p>
            </header>

            {stage === 'start' && renderStartScreen()}
            {stage === 'in_progress' && renderInProgressScreen()}
            {stage === 'summary' && renderSummaryScreen()}
        </div>
    );
};

export default IQTestView;
