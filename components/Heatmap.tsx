import React from 'react';
import { SkillBreakdown } from '../types';
import Card from './Card';
import { LayoutGridIcon } from './icons';

interface HeatmapProps {
  data: SkillBreakdown;
}

const getColor = (percentage: number): string => {
  if (percentage >= 90) return 'bg-success-dark';
  if (percentage >= 75) return 'bg-success';
  if (percentage >= 60) return 'bg-yellow-400';
  if (percentage >= 40) return 'bg-warning';
  return 'bg-danger';
};

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
  const topics = Object.keys(data);

  return (
    <Card>
      <div className="flex items-center mb-6">
        <LayoutGridIcon className="h-6 w-6 text-primary mr-3" />
        <h2 className="text-xl font-bold font-display text-neutral-extradark">Skill Gap Heatmap</h2>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {topics.map(topic => (
          <div key={topic} className="group relative rounded-xl overflow-hidden p-4 text-white font-semibold text-center transition-transform transform hover:scale-105"
               style={{ backgroundColor: 'rgba(0,0,0,0.1)'}}>
            <div className={`absolute inset-0 transition-all duration-300 ${getColor(data[topic].percentage)}`} style={{ width: `${data[topic].percentage}%` }}></div>
            <div className="relative z-10 flex justify-between items-center">
                <span>{topic}</span>
                <span className="font-bold">{data[topic].percentage.toFixed(0)}%</span>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center space-x-2 mt-6 text-xs text-neutral-medium">
        <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-danger mr-1.5"></span> Weak</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-warning mr-1.5"></span> Developing</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-success mr-1.5"></span> Strong</div>
        <div className="flex items-center"><span className="w-3 h-3 rounded-sm bg-success-dark mr-1.5"></span> Mastered</div>
      </div>
    </Card>
  );
};

export default Heatmap;