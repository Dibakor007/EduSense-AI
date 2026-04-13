import React from 'react';

interface RadialProgressBarProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  children?: React.ReactNode;
}

const RadialProgressBar: React.FC<RadialProgressBarProps> = ({
  progress,
  size = 120,
  strokeWidth = 10,
  color = '#4F46E5',
  trackColor = '#E5E7EB',
  children,
}) => {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          stroke={trackColor}
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={center}
          cy={center}
        />
        <circle
          stroke={color}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={center}
          cy={center}
          style={{ transition: 'stroke-dashoffset 0.5s ease-out' }}
        />
      </svg>
      {children && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
};

export default RadialProgressBar;
