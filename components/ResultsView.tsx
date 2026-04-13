import React, { useState, useEffect } from 'react';
import { generateTextContent } from '../services/aiService';
import { Result, Assessment, Question } from '../types';
import { mockClassAverages } from '../data';
import Card from './Card';
import Button from './Button';
import { CheckCircleIcon, XCircleIcon, ClockIcon, TrophyIcon, InfoIcon, BarChartIcon, SparklesIcon, TrendingUpIcon, RadarIcon, Share2Icon, LineChartIcon } from './icons';
import { View } from '../App';

interface ResultsViewProps {
  result: Result;
  assessment: Assessment;
  questions: Question[];
  onNavigate: (view: View) => void;
  xpGained: number | null;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number; sublabel?: string; }> = ({ icon, label, value, sublabel }) => (
    <Card className="text-center flex flex-col justify-center" padding="sm">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto text-primary">
            {icon}
        </div>
        <p className="mt-3 text-2xl font-bold font-display text-neutral-extradark">{value}</p>
        <p className="text-sm font-semibold text-neutral">{label}</p>
        {sublabel && <p className="text-xs text-neutral-medium mt-1">{sublabel}</p>}
    </Card>
);

const QuestionAccordion: React.FC<{ qr: Result['questionResults'][0], index: number, question: Question | undefined, isOpen: boolean, onClick: () => void }> = ({ qr, index, question, isOpen, onClick }) => {
    if (!question) return null;

    const isCorrect = qr.isCorrect;

    return (
        <div className={`bg-surface/50 rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? 'ring-2 ring-primary/50' : 'hover:ring-1 hover:ring-primary/20'}`}>
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-4 text-left"
                aria-expanded={isOpen}
            >
                <p className="text-md text-neutral-dark font-semibold mr-4 flex-grow">
                    <span className="font-bold text-primary mr-2">Q{index + 1}:</span>
                    {question.question}
                </p>
                <div className="flex items-center space-x-4">
                    {isCorrect ?
                        <CheckCircleIcon className="h-6 w-6 text-success shrink-0" /> :
                        <XCircleIcon className="h-6 w-6 text-danger shrink-0" />
                    }
                    <svg className={`w-5 h-5 text-neutral-medium shrink-0 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </button>
            <div className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-4 border-t border-black/5">
                    <p className={`text-sm mt-3 font-medium ${isCorrect ? 'text-neutral-medium' : 'text-danger'}`}>Your answer: <span className="font-bold">{qr.answer || "Not answered"}</span></p>
                    {!isCorrect && (
                        <>
                            <p className="text-sm text-success-dark font-medium mt-1">Correct answer: <span className="font-bold">{question.correctAnswer}</span></p>
                            <div className="mt-3 p-3 bg-primary/10 border-l-4 border-primary rounded-r-lg">
                                <div className="flex">
                                    <InfoIcon className="h-5 w-5 text-primary-dark mr-2 shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-sm text-primary-dark">Explanation</h4>
                                        <p className="text-sm text-neutral-dark mt-1">{question.explanation}</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}

const ResultsView: React.FC<ResultsViewProps> = ({ result, assessment, questions, onNavigate, xpGained }) => {
    const { percentage, skillBreakdown, questionResults } = result;
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
    const [summaryError, setSummaryError] = useState<string | null>(null);
    const [openQuestionId, setOpenQuestionId] = useState<string | null>(null);

    useEffect(() => {
        const generateSummary = async () => {
            setIsSummaryLoading(true);
            setSummaryError(null);
            try {
                const prompt = `You are an encouraging and insightful AI learning coach. Analyze the following assessment results and provide a personalized summary for the student.

                Assessment Title: "${assessment.title}"
                Overall Score: ${result.percentage.toFixed(0)}%
            
                Skill Breakdown:
                ${Object.entries(result.skillBreakdown).map(([topic, data]) => `- ${topic}: ${(data as { percentage: number }).percentage.toFixed(0)}%`).join('\n')}
            
                Your summary should:
                1. Start with a positive and motivational opening sentence based on the overall score.
                2. Clearly identify the student's strongest skills (areas with the highest scores).
                3. Pinpoint the 1-2 most critical areas for improvement (areas with the lowest scores).
                4. Provide a brief, actionable suggestion for how to improve in one of the weak areas.
                5. Conclude with an encouraging closing statement.
            
                Keep the entire summary concise, friendly, and easy to understand (around 3-5 sentences). Do not use markdown or formatting.`;

                const summaryText = await generateTextContent(prompt);
                setAiSummary(summaryText);

            } catch (error) {
                console.error("Error generating AI summary:", error);
                setSummaryError("Couldn't generate AI insights at this time.");
            } finally {
                setIsSummaryLoading(false);
            }
        };

        generateSummary();
    }, [result, assessment.title]);


    const getQuestionById = (id: string) => questions.find(q => q.id === id);
    const isPassed = percentage >= 60;
    const motivationalTitle = percentage >= 85 ? "Excellent Work!" : percentage >= 60 ? "Great Job!" : "Good Effort, Let's Review";

    const radius = 80;
    const stroke = 12;
    const normalizedRadius = radius - stroke * 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <>
            <header className="text-center mb-10">
                <p className="text-primary font-semibold mb-2">{assessment.title}</p>
                <h1 className="text-4xl md:text-5xl font-bold font-display text-neutral-extradark">{motivationalTitle}</h1>
                {xpGained !== null && xpGained > 0 && (
                    <p className="mt-4 text-xl font-semibold text-yellow-500 animate-fade-in-up">
                        + {xpGained} XP Earned! 🌟
                    </p>
                )}
            </header>

            <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="md:col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-4">
                         <div className="relative">
                            <svg
                                height={radius * 2}
                                width={radius * 2}
                                className="-rotate-90"
                            >
                                <defs>
                                    <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" stopColor={isPassed ? '#34D399' : '#FBBF24'} />
                                        <stop offset="100%" stopColor={isPassed ? '#059669' : '#D97706'} />
                                    </linearGradient>
                                </defs>
                                <circle
                                    stroke="#E5E7EB"
                                    fill="transparent"
                                    strokeWidth={stroke}
                                    r={normalizedRadius}
                                    cx={radius}
                                    cy={radius}
                                />
                                <circle
                                    stroke="url(#scoreGradient)"
                                    fill="transparent"
                                    strokeWidth={stroke}
                                    strokeDasharray={circumference + ' ' + circumference}
                                    style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
                                    strokeLinecap="round"
                                    r={normalizedRadius}
                                    cx={radius}
                                    cy={radius}
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-5xl font-display font-bold text-neutral-extradark">{percentage.toFixed(0)}<span className="text-3xl">%</span></span>
                            </div>
                        </div>
                        <span className="text-md font-semibold text-neutral mt-3">Overall Score</span>
                    </Card>
                    <StatCard icon={<TrophyIcon className="h-6 w-6"/>} label="Final Score" value={`${result.score}/${assessment.totalQuestions}`} />
                    <StatCard icon={<ClockIcon className="h-6 w-6"/>} label="Time Taken" value={`${result.timeTaken} min`} />
                    <StatCard icon={<TrendingUpIcon className="h-6 w-6"/>} label="Class Rank" value="Top 20%" sublabel="Est. Percentile"/>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card>
                        <div className="flex items-center mb-6">
                            <BarChartIcon className="h-6 w-6 text-primary mr-3" />
                            <h2 className="text-xl font-bold font-display text-neutral-extradark">Skill Breakdown</h2>
                        </div>
                        <div className="space-y-5">
                            {Object.entries(skillBreakdown).map(([topic, data]) => {
                                const { percentage } = data as { percentage: number };
                                const classAvg = mockClassAverages[topic] || 0;
                                return (
                                    <div key={topic}>
                                        <div className="flex justify-between items-center mb-1.5 text-sm">
                                            <h4 className="font-semibold text-neutral-dark">{topic}</h4>
                                            <span className="font-bold text-primary">{percentage.toFixed(0)}%</span>
                                        </div>
                                        <div className="relative h-2.5 bg-neutral-light/40 rounded-full">
                                            <div className="absolute top-0 left-0 h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                                            <div className="absolute top-0 h-full flex items-center" style={{ left: `${classAvg}%` }} title={`Class Avg: ${classAvg}%`}>
                                                <div className="h-4 w-1 bg-neutral-medium/70 rounded-full -translate-y-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card>
                        <h2 className="text-xl font-bold font-display text-neutral-dark mb-4">Question Analysis</h2>
                        <div className="space-y-3 max-h-[24rem] overflow-y-auto pr-2">
                            {questionResults.map((qr, index) => (
                                <QuestionAccordion 
                                    key={qr.questionId}
                                    qr={qr}
                                    index={index}
                                    question={getQuestionById(qr.questionId)}
                                    isOpen={openQuestionId === qr.questionId}
                                    onClick={() => setOpenQuestionId(openQuestionId === qr.questionId ? null : qr.questionId)}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

                <Card>
                    <div className="flex items-center mb-4">
                        <SparklesIcon className="h-6 w-6 text-primary mr-3" />
                        <h2 className="text-xl font-bold font-display text-neutral-extradark">AI Performance Insights</h2>
                    </div>
                    {isSummaryLoading ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-neutral-light/50 rounded-md"></div>
                            <div className="h-4 bg-neutral-light/50 rounded-md w-5/6"></div>
                            <div className="h-4 bg-neutral-light/50 rounded-md w-3/4"></div>
                        </div>
                    ) : summaryError ? (
                        <p className="text-center text-danger-dark font-semibold p-4 bg-danger/10 rounded-lg">{summaryError}</p>
                    ) : (
                        <p className="text-neutral-dark text-md leading-relaxed">{aiSummary}</p>
                    )}
                </Card>

                <Card>
                    <div className="flex items-center mb-4">
                        <SparklesIcon className="h-6 w-6 text-secondary mr-3" />
                        <h2 className="text-xl font-bold font-display text-neutral-extradark">See How You've Grown</h2>
                    </div>
                    <p className="text-neutral-dark text-md leading-relaxed mb-6">Your performance has updated your learning profile. Explore your new insights:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Button variant="outline" onClick={() => onNavigate('skillRadar')}>
                            <RadarIcon className="h-5 w-5 mr-2" />
                            Updated Skill Radar
                        </Button>
                        <Button variant="outline" onClick={() => onNavigate('knowledgeGraph')}>
                            <Share2Icon className="h-5 w-5 mr-2" />
                            Knowledge Graph
                        </Button>
                        <Button variant="outline" onClick={() => onNavigate('progressTimeline')}>
                            <LineChartIcon className="h-5 w-5 mr-2" />
                            Progress Timeline
                        </Button>
                    </div>
                </Card>
            </div>

            <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button onClick={() => onNavigate('dynamicLearningPath')} className="w-full sm:w-auto !px-8 !py-3">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    View My Learning Path
                </Button>
            </div>
        </>
    );
};

export default ResultsView;