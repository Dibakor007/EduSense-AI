
import React from 'react';
import { Assessment, Question } from '../types';
import Card from './Card';
import Button from './Button';
import { ClockIcon, FileTextIcon, TrendingUpIcon, BarChartIcon } from './icons';

interface AssessmentDetailViewProps {
  assessment: Assessment;
  questions: Question[];
  onStartAssessment: (assessment: Assessment, isPractice?: boolean) => void;
  onBackToDashboard: () => void;
}

const AssessmentDetailView: React.FC<AssessmentDetailViewProps> = ({ assessment, questions, onStartAssessment, onBackToDashboard }) => {
    const assessmentQuestions = questions.filter(q => q.assessmentId === assessment.id);
    const topics = [...new Set(assessmentQuestions.map(q => q.topic))];

    const difficultyCounts = assessmentQuestions.reduce((acc, q) => {
        acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
        return acc;
    }, {} as Record<'easy' | 'medium' | 'hard', number>);

    // Fix: Explicitly cast the values to `number` to resolve a type inference issue during the sort comparison.
    const mostCommonDifficulty = Object.entries(difficultyCounts).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';

    const difficultyInfo = {
        easy: { color: 'bg-success' },
        medium: { color: 'bg-warning' },
        hard: { color: 'bg-danger' }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <p className="text-primary font-semibold">{assessment.subject}</p>
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark mt-1">{assessment.title}</h1>
                    <p className="text-lg text-neutral-medium mt-2 max-w-2xl mx-auto">{assessment.description}</p>
                </header>

                <Card className="mb-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-black/5">
                        <div className="p-4 sm:p-0">
                            <ClockIcon className="h-8 w-8 mx-auto text-secondary" />
                            <p className="mt-2 text-sm font-semibold text-neutral">Duration</p>
                            <p className="text-xl font-bold text-neutral-extradark">{assessment.duration} Minutes</p>
                        </div>
                        <div className="p-4 sm:p-0">
                            <FileTextIcon className="h-8 w-8 mx-auto text-secondary" />
                            <p className="mt-2 text-sm font-semibold text-neutral">Questions</p>
                            <p className="text-xl font-bold text-neutral-extradark">{assessment.totalQuestions} Questions</p>
                        </div>
                        <div className="p-4 sm:p-0">
                             <div className={`mx-auto h-8 w-8 rounded-full flex items-center justify-center font-bold text-white shadow-md ${difficultyInfo[assessment.difficulty].color}`}>
                                 <TrendingUpIcon className="h-5 w-5" />
                             </div>
                            <p className="mt-2 text-sm font-semibold text-neutral">Overall Difficulty</p>
                            <p className="text-xl font-bold text-neutral-extradark capitalize">{assessment.difficulty}</p>
                        </div>
                        <div className="p-4 sm:p-0">
                            <BarChartIcon className="h-8 w-8 mx-auto text-secondary" />
                            <p className="mt-2 text-sm font-semibold text-neutral">Typical Difficulty</p>
                            <p className="text-xl font-bold text-neutral-extradark capitalize">{mostCommonDifficulty}</p>
                        </div>
                    </div>
                </Card>

                <Card className="mb-8">
                     <h2 className="text-2xl font-bold font-display text-neutral-extradark mb-4">Assessment Content</h2>
                     <div className="flex flex-wrap gap-3">
                        {topics.map(topic => (
                            <span key={topic} className="px-4 py-2 bg-primary/10 text-primary font-semibold rounded-full text-sm">
                                {topic}
                            </span>
                        ))}
                     </div>
                     <div className="mt-8 pt-6 border-t border-black/10">
                        <h3 className="text-xl font-bold font-display text-neutral-dark mb-4">Question Breakdown</h3>
                        <ul className="space-y-4">
                            {assessmentQuestions.map((q, index) => (
                                <li key={q.id} className="p-4 bg-white/50 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center">
                                    <p className="text-neutral-dark flex-grow mr-4">
                                        <span className="font-semibold">{index + 1}.</span> {q.question}
                                    </p>
                                    <div className="flex items-center space-x-4 mt-3 sm:mt-0 shrink-0">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold capitalize ${difficultyInfo[q.difficulty].color} text-white`}>
                                            {q.difficulty}
                                        </span>
                                        <div className="flex items-center text-sm font-semibold text-neutral-medium">
                                            <ClockIcon className="h-4 w-4 mr-1.5" />
                                            <span>Avg. {q.avgTimeToAnswer}s</span>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                     </div>
                </Card>

                <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Button onClick={onBackToDashboard} variant="outline" className="w-full sm:w-auto !px-8 !py-4">Back to Dashboard</Button>
                    <Button onClick={() => onStartAssessment(assessment, true)} variant="secondary" className="w-full sm:w-auto !px-8 !py-4">
                        Practice Mode
                    </Button>
                    <Button onClick={() => onStartAssessment(assessment, false)} className="w-full sm:w-auto !px-8 !py-4">Start Assessment</Button>
                </div>
            </div>
        </div>
    );
};

export default AssessmentDetailView;
