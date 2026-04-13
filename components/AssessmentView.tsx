import React, { useState, useEffect, useCallback } from 'react';
import { Assessment, Question, Result, QuestionResult } from '../types';
import Card from './Card';
import Button from './Button';
import { ClockIcon, TrendingUpIcon, TrendingDownIcon, CheckCircleIcon, XCircleIcon, SparklesIcon, FlagIcon, ChevronsDown } from './icons';
import { generateTextStream } from '../services/aiService';
import ProgressBar from './ProgressBar';

interface AssessmentViewProps {
  assessment: Assessment;
  questions: Question[];
  onSubmit: (result: Result) => void;
  isPracticeMode?: boolean;
}

const AsidePanel: React.FC<{
    isPracticeMode: boolean;
    timeLeft: number;
    currentQuestionIndex: number;
    questions: Question[];
    answers: { [key: string]: string };
    questionResults: { [key: string]: boolean | null };
    skippedQuestions: Set<string>;
    flaggedQuestions: Set<string>;
    changeQuestion: (index: number) => void;
}> = ({ isPracticeMode, timeLeft, currentQuestionIndex, questions, answers, questionResults, skippedQuestions, flaggedQuestions, changeQuestion }) => {
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    
    return (
        <div className="w-full lg:w-80 lg:shrink-0 flex flex-col gap-6">
            {!isPracticeMode && (
                <Card padding="sm">
                    <div className="flex items-center justify-center bg-surface/50 px-4 py-2 rounded-lg">
                        <ClockIcon className="h-6 w-6 text-primary"/>
                        <span className="ml-2 text-2xl font-semibold text-neutral-extradark tabular-nums">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </span>
                    </div>
                    <p className="text-xs text-center text-neutral mt-2">Time Remaining</p>
                </Card>
            )}

            <Card className="flex-grow">
                <h3 className="font-bold text-neutral-dark mb-4">Progress & Navigation</h3>
                <div className="mb-4">
                    <div className="flex justify-between items-center text-sm font-semibold mb-1 text-neutral-dark">
                        <span>Question</span>
                        <span>{currentQuestionIndex + 1} / {questions.length}</span>
                    </div>
                    <ProgressBar value={currentQuestionIndex + 1} max={questions.length} />
                </div>
                <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => {
                        const isAnswered = answers[q.id] !== undefined;
                        const isFlagged = flaggedQuestions.has(q.id);
                        let statusClasses = "bg-neutral-light/30 text-neutral-medium hover:bg-neutral-light/60";
                        if (isPracticeMode) {
                            if (isAnswered) statusClasses = "bg-secondary/20 text-secondary-dark";
                        } else {
                            const result = questionResults[q.id];
                            const isSkipped = skippedQuestions.has(q.id);
                            if (isAnswered) {
                                if (result === true) statusClasses = "bg-success/20 text-success-dark font-bold";
                                else if (result === false) statusClasses = "bg-danger/20 text-danger-dark font-bold";
                            } else if (isSkipped) {
                                statusClasses = "bg-warning/20 text-warning-dark";
                            }
                        }

                        if (isFlagged) {
                            statusClasses += " ring-2 ring-yellow-500";
                        }

                        if (index === currentQuestionIndex) {
                            statusClasses = "ring-2 ring-primary bg-primary/20 text-primary-dark font-bold";
                        }
                        
                        return (
                            <button key={q.id} onClick={() => changeQuestion(index)} className={`flex items-center justify-center h-10 w-10 rounded-lg text-sm font-semibold transition-all ${statusClasses}`}>
                                {index + 1}
                            </button>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
}

const AssessmentView: React.FC<AssessmentViewProps> = ({ assessment, questions, onSubmit, isPracticeMode = false }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [questionTimings, setQuestionTimings] = useState<{ [key: string]: number }>({});
  const [questionResults, setQuestionResults] = useState<{ [key: string]: boolean | null }>({});
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(assessment.duration * 60);
  const [startTime] = useState(new Date());
  const [currentQuestionTime, setCurrentQuestionTime] = useState(0);

  const [difficultyFeedback, setDifficultyFeedback] = useState<{ type: 'up' | 'down'; key: number } | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<{ isCorrect: boolean; explanation: string } | null>(null);

  const [tutorHint, setTutorHint] = useState<string>('');
  const [isTutorLoading, setIsTutorLoading] = useState<boolean>(false);
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [flaggedQuestions, setFlaggedQuestions] = useState<Set<string>>(new Set());
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);

  const handleSubmit = useCallback(() => {
    const timeSpentOnLast = Math.round((Date.now() - questionStartTime) / 1000);
    const finalTimings = {
      ...questionTimings,
      [questions[currentQuestionIndex].id]: (questionTimings[questions[currentQuestionIndex].id] || 0) + timeSpentOnLast,
    };

    let score = 0;
    const finalQuestionResults: QuestionResult[] = questions.map(q => {
        const userAnswer = answers[q.id];
        let isCorrect = false;
        if (userAnswer) {
            if (q.type === 'short_answer' || q.type === 'code') {
                isCorrect = userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase();
            } else {
                isCorrect = userAnswer === q.correctAnswer;
            }
        }
        
        if (isCorrect) score++;

        return {
            questionId: q.id,
            answer: userAnswer || '',
            isCorrect,
            timeTaken: finalTimings[q.id] || 0,
        };
    });

    const skillBreakdown: { [key: string]: { score: number, total: number }} = {};
    finalQuestionResults.forEach(qr => {
        const question = questions.find(q => q.id === qr.questionId);
        if (!question) return;

        if (!skillBreakdown[question.topic]) {
            skillBreakdown[question.topic] = { score: 0, total: 0 };
        }
        skillBreakdown[question.topic].total++;
        if (qr.isCorrect) {
            skillBreakdown[question.topic].score++;
        }
    });

    const finalSkillBreakdown = Object.keys(skillBreakdown).reduce((acc, topic) => {
        const { score, total } = skillBreakdown[topic];
        acc[topic] = { score, total, percentage: total > 0 ? (score / total) * 100 : 0 };
        return acc;
    }, {} as Result['skillBreakdown']);
    
    const endTime = new Date();
    const timeTaken = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    const finalResult: Result = {
        id: `res_${Math.random().toString(36).substr(2, 9)}`,
        studentId: 'usr_123',
        assessmentId: assessment.id,
        score,
        percentage: (score / questions.length) * 100,
        timeTaken,
        submittedAt: new Date().toISOString(),
        skillBreakdown: finalSkillBreakdown,
        questionResults: finalQuestionResults,
    };
    onSubmit(finalResult);
  }, [answers, assessment.id, currentQuestionIndex, onSubmit, questionStartTime, questionTimings, questions, startTime]);

  useEffect(() => {
    setCurrentQuestionTime(0);
    const timer = setInterval(() => {
      setCurrentQuestionTime(Math.round((Date.now() - questionStartTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [currentQuestionIndex, questionStartTime]);

  useEffect(() => {
    if (isPracticeMode) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, handleSubmit, isPracticeMode]);

  const handleSelectAnswer = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const isCorrect = question.correctAnswer === answer;

    if (isPracticeMode) {
      setPracticeFeedback({ isCorrect, explanation: question.explanation });
    } else {
      setQuestionResults(prev => ({...prev, [questionId]: isCorrect}));
      setDifficultyFeedback({ type: isCorrect ? 'up' : 'down', key: Date.now() });
      setTimeout(() => setDifficultyFeedback(null), 2500);
    }
    
    if (skippedQuestions.has(questionId)) {
        setSkippedQuestions(prev => {
            const newSkipped = new Set(prev);
            newSkipped.delete(questionId);
            return newSkipped;
        });
    }
  };

  const handleTextAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
    if (skippedQuestions.has(questionId)) {
        setSkippedQuestions(prev => {
            const newSkipped = new Set(prev);
            newSkipped.delete(questionId);
            return newSkipped;
        });
    }
  };

  const handleCheckShortAnswer = () => {
    if (!isPracticeMode) return;
    const question = questions[currentQuestionIndex];
    const userAnswer = answers[question.id] || '';
    const isCorrect = userAnswer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
    setPracticeFeedback({ isCorrect, explanation: question.explanation });
  };

  const changeQuestion = (newIndex: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    const currentQuestionId = questions[currentQuestionIndex].id;
    setQuestionTimings(prev => ({ ...prev, [currentQuestionId]: (prev[currentQuestionId] || 0) + timeSpent }));
    setCurrentQuestionIndex(newIndex);
    setQuestionStartTime(Date.now());
    setTutorHint('');
    setIsTutorLoading(false);
    setPracticeFeedback(null);
  };

  const handleSkip = () => {
    if (currentQuestionIndex < questions.length - 1) {
        const currentQuestionId = questions[currentQuestionIndex].id;
        setSkippedQuestions(prev => new Set(prev).add(currentQuestionId));
        setAnswers(prev => {
            const newAnswers = { ...prev };
            delete newAnswers[currentQuestionId];
            return newAnswers;
        });
        setQuestionResults(prev => {
            const newResults = { ...prev };
            delete newResults[currentQuestionId];
            return newResults;
        });
        changeQuestion(currentQuestionIndex + 1);
    }
  };

  const handleToggleFlag = () => {
    const currentQuestionId = questions[currentQuestionIndex].id;
    setFlaggedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionId)) {
        newSet.delete(currentQuestionId);
      } else {
        newSet.add(currentQuestionId);
      }
      return newSet;
    });
  };

  const handleAskTutor = async () => {
    setIsTutorLoading(true);
    setTutorHint('');
    try {
        const prompt = `Provide a short, single-sentence hint for the following assessment question. Do not give the answer. Question: "${currentQuestion.question}"`;
        const response = await generateTextStream(prompt);

        for await (const chunk of response) {
            setTutorHint(prev => prev + chunk.text);
        }
    } catch (error) {
        console.error("Error fetching hint from AI Tutor:", error);
        setTutorHint("Sorry, I couldn't get a hint for you right now.");
    } finally {
        setIsTutorLoading(false);
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="text-center p-8">
          <h2 className="text-2xl font-bold font-display text-neutral-extradark">No Questions Found</h2>
          <p className="text-neutral-medium mt-2">There was an issue loading questions for this assessment.</p>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const questionMinutes = Math.floor(currentQuestionTime / 60);
  const questionSeconds = currentQuestionTime % 60;

  const isShortAnswerPractice = isPracticeMode && (currentQuestion.type === 'short_answer' || currentQuestion.type === 'code');
  const showCheckAnswerButton = isShortAnswerPractice && !practiceFeedback;

  return (
    <div className="min-h-screen flex flex-col p-4 sm:p-6 lg:p-0">
      {difficultyFeedback && (
        <div key={difficultyFeedback.key} className="fixed top-24 left-1/2 -translate-x-1/2 bg-neutral-extradark text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in-out z-50">
            {difficultyFeedback.type === 'up' ? 
                <div className="flex items-center"><TrendingUpIcon className="h-5 w-5 mr-2 text-success" /> Difficulty increasing...</div> :
                <div className="flex items-center"><TrendingDownIcon className="h-5 w-5 mr-2 text-warning" /> Adjusting difficulty...</div>
            }
        </div>
      )}

      <header className="w-full mb-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
              <div>
                  <h1 className="text-2xl md:text-3xl font-bold font-display text-neutral-extradark">{assessment.title}</h1>
                  <p className="text-neutral-medium">{assessment.subject}</p>
              </div>
              {isPracticeMode && (
                  <div className="px-4 py-2 bg-secondary/10 text-secondary-dark font-bold rounded-lg shrink-0">
                      Practice Mode
                  </div>
              )}
          </div>
      </header>
      
      <div className="w-full max-w-7xl mx-auto flex-grow flex flex-col lg:flex-row gap-6 lg:gap-8">
        <main className="flex-grow flex flex-col">
            <Card className="h-full flex flex-col">
                <div className="flex-grow">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-primary">{currentQuestion.topic} &middot; Question {currentQuestionIndex + 1} of {questions.length}</p>
                        <div className="flex items-center text-sm font-semibold text-neutral-dark bg-neutral-light/30 px-2 py-1 rounded-md tabular-nums">
                            <ClockIcon className="h-4 w-4 mr-1.5 text-neutral"/>
                            <span>{String(questionMinutes).padStart(2, '0')}:{String(questionSeconds).padStart(2, '0')}</span>
                        </div>
                    </div>
                    <h2 className="text-xl md:text-2xl font-semibold text-neutral-extradark mt-2 mb-8">{currentQuestion.question}</h2>
                    
                    {(currentQuestion.type === 'multiple_choice' || currentQuestion.type === 'true_false') && currentQuestion.options && currentQuestion.options.length > 0 ? (
                        <div className="space-y-4">
                            {currentQuestion.options.map(option => (
                                <label key={option} className={`flex items-center p-4 border rounded-xl transition-all duration-200 ${answers[currentQuestion.id] === option ? 'bg-primary/5 border-primary ring-2 ring-primary' : 'bg-transparent border-neutral-light/50'} ${isPracticeMode && practiceFeedback ? 'cursor-not-allowed' : 'cursor-pointer hover:border-neutral-light'}`}>
                                    <input
                                        type="radio"
                                        name={currentQuestion.id}
                                        value={option}
                                        checked={answers[currentQuestion.id] === option}
                                        onChange={() => handleSelectAnswer(currentQuestion.id, option)}
                                        className="h-5 w-5 text-primary focus:ring-primary-light border-gray-300"
                                        disabled={isPracticeMode && !!practiceFeedback}
                                    />
                                    <span className="ml-4 text-md text-neutral-dark font-medium">{option}</span>
                                </label>
                            ))}
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="short_answer_input" className="block text-sm font-medium text-neutral-dark mb-2">
                                Your Answer
                            </label>
                            <input
                                id="short_answer_input"
                                type="text"
                                value={answers[currentQuestion.id] || ''}
                                onChange={(e) => handleTextAnswerChange(currentQuestion.id, e.target.value)}
                                className="block w-full max-w-lg px-4 py-3 bg-surface/50 border border-neutral-light/50 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary sm:text-sm"
                                placeholder="Type your answer here..."
                                disabled={isPracticeMode && !!practiceFeedback}
                            />
                        </div>
                    )}

                    {isPracticeMode && practiceFeedback && (
                      <div className={`mt-6 p-4 rounded-xl border-l-4 ${practiceFeedback.isCorrect ? 'bg-success/10 border-success' : 'bg-danger/10 border-danger'}`}>
                          <div className="flex items-start">
                              {practiceFeedback.isCorrect ? <CheckCircleIcon className="h-6 w-6 text-success mr-3 shrink-0" /> : <XCircleIcon className="h-6 w-6 text-danger mr-3 shrink-0" />}
                              <div>
                                  <h3 className={`text-lg font-bold ${practiceFeedback.isCorrect ? 'text-success-dark' : 'text-danger-dark'}`}>
                                      {practiceFeedback.isCorrect ? 'Correct!' : 'Incorrect'}
                                  </h3>
                                  {!practiceFeedback.isCorrect && <p className="text-neutral-dark font-semibold mt-1">Correct Answer: {currentQuestion.correctAnswer}</p>}
                                  <p className="text-neutral-dark mt-2">{practiceFeedback.explanation}</p>
                              </div>
                          </div>
                      </div>
                    )}
                    
                    {!isPracticeMode && (
                        <div className="mt-8">
                            <Button variant="outline" onClick={handleAskTutor} disabled={isTutorLoading}>
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                {isTutorLoading ? 'Getting hint...' : 'Ask AI Tutor for a Hint'}
                            </Button>
                            {(isTutorLoading || tutorHint) && (
                                <div className="mt-4 p-4 bg-gradient-to-r from-secondary/10 to-cyan-300/10 border-l-4 border-secondary rounded-r-lg">
                                    <p className="text-secondary-dark font-medium">{tutorHint}{isTutorLoading && <span className="inline-block w-1 h-4 bg-secondary-dark animate-pulse ml-1"></span>}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                <footer className="w-full mt-8 pt-6 border-t border-neutral-light/50">
                    <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4">
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Button variant="outline" onClick={handleToggleFlag} className={flaggedQuestions.has(currentQuestion.id) ? 'bg-yellow-400/20 text-yellow-600' : ''}>
                                <FlagIcon className="h-5 w-5 mr-2" />
                                {flaggedQuestions.has(currentQuestion.id) ? 'Unflag' : 'Flag'}
                            </Button>
                        </div>
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            {showCheckAnswerButton ? (
                                <Button onClick={handleCheckShortAnswer}>Check Answer</Button>
                            ) : (
                                <>
                                    <Button variant="outline" onClick={() => changeQuestion(Math.max(0, currentQuestionIndex - 1))} disabled={currentQuestionIndex === 0}>
                                        Previous
                                    </Button>
                                    {(!isPracticeMode || (isPracticeMode && !practiceFeedback)) && currentQuestionIndex < questions.length - 1 && (
                                        <Button variant="outline" onClick={handleSkip}>Skip Question</Button>
                                    )}
                                    {currentQuestionIndex < questions.length - 1 ? (
                                        <Button onClick={() => changeQuestion(Math.min(questions.length - 1, currentQuestionIndex + 1))}>
                                            Next
                                        </Button>
                                    ) : (
                                        <Button variant="success" onClick={handleSubmit}>
                                            Finish & Submit
                                        </Button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </footer>
            </Card>
        </main>
        
        <aside className="hidden lg:block">
            <AsidePanel {...{isPracticeMode, timeLeft, currentQuestionIndex, questions, answers, questionResults, skippedQuestions, flaggedQuestions, changeQuestion}} />
        </aside>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-10 bg-surface/80 backdrop-blur-lg border-t border-black/5">
             <button onClick={() => setIsMobilePanelOpen(!isMobilePanelOpen)} className="w-full flex justify-between items-center p-4">
                <span className="font-bold text-neutral-dark">Progress & Tools</span>
                <ChevronsDown className={`w-6 h-6 text-neutral transition-transform ${isMobilePanelOpen ? 'rotate-180' : ''}`} />
             </button>
             <div className={`transition-all duration-300 ease-in-out ${isMobilePanelOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-4 border-t border-black/5">
                    <AsidePanel {...{isPracticeMode, timeLeft, currentQuestionIndex, questions, answers, questionResults, skippedQuestions, flaggedQuestions, changeQuestion}} />
                </div>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AssessmentView;