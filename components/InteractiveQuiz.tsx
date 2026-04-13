import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface QuizData {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

interface InteractiveQuizProps {
  quiz: QuizData;
}

const InteractiveQuiz: React.FC<InteractiveQuizProps> = ({ quiz }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelectAnswer = (option: string) => {
    if (isAnswered) return;
    setSelectedAnswer(option);
    setIsAnswered(true);
  };

  const getOptionClasses = (option: string) => {
    if (!isAnswered) {
      return 'border-neutral-light/50 hover:border-primary/50';
    }
    if (option === quiz.correctAnswer) {
      return 'bg-success/10 border-success ring-2 ring-success';
    }
    if (option === selectedAnswer) {
      return 'bg-danger/10 border-danger ring-2 ring-danger';
    }
    return 'border-neutral-light/50 opacity-60';
  };

  return (
    <div className="mt-4 pt-4 border-t border-black/10">
      <p className="font-semibold text-neutral-dark mb-3">{quiz.question}</p>
      <div className="space-y-2">
        {quiz.options.map((option) => (
          <button
            key={option}
            onClick={() => handleSelectAnswer(option)}
            disabled={isAnswered}
            className={`w-full text-left flex items-center p-3 border rounded-lg transition-all text-neutral-dark ${getOptionClasses(option)}`}
          >
            <div className="flex-grow">{option}</div>
            {isAnswered && option === quiz.correctAnswer && <CheckCircleIcon className="h-5 w-5 text-success" />}
            {isAnswered && option === selectedAnswer && option !== quiz.correctAnswer && <XCircleIcon className="h-5 w-5 text-danger" />}
          </button>
        ))}
      </div>
      {isAnswered && (
        <div className="mt-3 p-3 bg-primary/5 border-l-4 border-primary/50 rounded-r-md">
          <p className="text-sm font-semibold text-primary-dark">Explanation:</p>
          <p className="text-sm text-neutral-dark mt-1">{quiz.explanation}</p>
        </div>
      )}
    </div>
  );
};

export default InteractiveQuiz;
