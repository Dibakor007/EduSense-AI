
import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  barStyle?: React.CSSProperties;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, className = '', barStyle }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;

  const combinedStyle: React.CSSProperties = {
    width: `${percentage}%`,
    ...barStyle,
  };

  const barClasses = barStyle?.backgroundColor ? '' : 'bg-primary';

  return (
    <div className={`w-full bg-neutral-light/30 rounded-full h-2.5 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ease-out ${barClasses}`}
        style={combinedStyle}
      ></div>
    </div>
  );
};

export default ProgressBar;
