import React from 'react';

const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
  <div className="absolute w-2 h-4" style={style}></div>
);

const Confetti: React.FC = () => {
  const pieces = Array.from({ length: 150 }).map((_, index) => {
    const left = Math.random() * 100;
    const animDuration = 0.5 + Math.random() * 1.5;
    const animDelay = Math.random() * 1;
    const rotation = Math.random() * 360;
    const colors = ['#4F46E5', '#6366F1', '#06B6D4', '#22D3EE', '#F59E0B', '#FBBF24', '#FFFFFF'];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const style: React.CSSProperties = {
      left: `${left}%`,
      backgroundColor: color,
      transform: `rotate(${rotation}deg)`,
      animation: `fall ${animDuration}s linear ${animDelay}s forwards`,
      opacity: 0,
    };

    return <ConfettiPiece key={index} style={style} />;
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-50">
      <style>{`
        @keyframes fall {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
      {pieces}
    </div>
  );
};

export default Confetti;
