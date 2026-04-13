import React from 'react';
import { BookOpenIcon, BriefcaseIcon, GraduationCapIcon, BrainCircuitIcon } from './icons';

interface AcademicLevelSelectionViewProps {
  onSelect: (level: string) => void;
}

const AcademicLevelSelectionView: React.FC<AcademicLevelSelectionViewProps> = ({ onSelect }) => {
  const educationLevels = [
    { name: 'SSC (Class 9-10)', icon: <BookOpenIcon />, color: 'text-primary' },
    { name: 'HSC (Class 11-12)', icon: <BriefcaseIcon />, color: 'text-secondary' },
    { name: 'University Level', icon: <GraduationCapIcon />, color: 'text-success' },
    { name: 'Solo Leveling', icon: <BrainCircuitIcon />, color: 'text-danger' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 animate-fade-in-up bg-background">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">One Last Step!</h1>
        <p className="text-lg text-neutral-medium mt-2 mb-8">Please select your current academic level to personalize your learning experience.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {educationLevels.map(level => (
            <div
              key={level.name}
              onClick={() => onSelect(level.name)}
              className="p-8 text-center rounded-2xl transition-all duration-300 cursor-pointer group bg-surface/70 backdrop-blur-xl shadow-md hover:shadow-xl hover:-translate-y-2 border-4 border-transparent hover:border-primary"
              role="button"
              tabIndex={0}
            >
              <div className="relative z-10">
                <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto bg-neutral-light/30 group-hover:bg-primary/10`}>
                  {React.cloneElement(level.icon, { className: `h-10 w-10 text-neutral-dark group-hover:${level.color}` })}
                </div>
                <p className="mt-4 font-bold text-lg text-neutral-extradark group-hover:text-primary-dark">{level.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AcademicLevelSelectionView;