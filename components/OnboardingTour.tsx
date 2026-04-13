import React, { useState } from 'react';
import { OnboardingStep } from '../types';
import Modal from './Modal';
import Button from './Button';
import ProgressBar from './ProgressBar';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  steps: OnboardingStep[];
}

const OnboardingTour: React.FC<OnboardingTourProps> = ({ isOpen, onClose, steps }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen || !steps || steps.length === 0) {
    return null;
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Welcome to EduSense AI!">
      <div className="p-4">
        <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
        <p className="text-neutral-dark mb-8">{step.content}</p>

        <ProgressBar value={currentStep + 1} max={steps.length} />
        <div className="flex justify-between items-center mt-6">
          <p className="text-sm font-semibold text-neutral-medium">
            Step {currentStep + 1} of {steps.length}
          </p>
          <div className="flex items-center gap-3">
            {currentStep > 0 && (
              <Button onClick={handlePrev} variant="outline" className="!py-2 !px-4">
                Previous
              </Button>
            )}
            <Button onClick={handleNext} className="!py-2 !px-4">
              {isLastStep ? 'Finish Tour' : 'Next'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OnboardingTour;