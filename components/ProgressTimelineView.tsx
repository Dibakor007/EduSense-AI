import React, { useState, useMemo, useEffect } from 'react';
import { Type } from "@google/genai";
import { generateJsonContent } from '../services/aiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Line } from 'recharts';
import { mockClassAverages, mockStudentRecentActivity } from '../data';
import { TimelineEvent, TimelineAiInsight, SkillProgressRecord } from '../types';
import Card from './Card';
import Button from './Button';
import { LineChartIcon, SparklesIcon, TrendingUpIcon, EyeIcon, TrophyIcon, CheckSquareIcon, BookOpenIcon, DumbbellIcon } from './icons';

interface ProgressTimelineViewProps {
  skillProgressData: SkillProgressRecord[];
  timelineEvents: TimelineEvent[];
}

const CombinedTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        if (data.event) {
            const { event } = data;
            return (
                <div className="p-3 bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
                    <p className="font-bold text-neutral-extradark">{event.title}</p>
                    {event.score && <p className="text-sm text-primary font-semibold">Score: {event.score}%</p>}
                </div>
            );
        }
        return (
            <div className="p-3 bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
                <p className="label font-bold text-neutral-extradark">{`Date: ${label}`}</p>
                <p className="intro text-primary">{`Mastery: ${payload[0].value}%`}</p>
            </div>
        );
    }
    return null;
};

const CustomEventDot = (props: any) => {
    const { cx, cy, payload } = props;
    const { event } = payload;
    if (!event) return null;

    const iconMap = {
        assessment: <CheckSquareIcon className="h-4 w-4 text-white" />,
        milestone: <TrophyIcon className="h-4 w-4 text-white" />,
    };

    const colorMap = {
        assessment: 'bg-primary',
        milestone: 'bg-secondary',
    };

    return (
        <g transform={`translate(${cx},${cy})`}>
            <foreignObject x={-12} y={-12} width={24} height={24}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-surface/80 shadow-lg ${colorMap[event.type]}`}>
                    {iconMap[event.type]}
                </div>
            </foreignObject>
        </g>
    );
};

const FilterButton: React.FC<{ onClick: () => void; isActive: boolean; children: React.ReactNode }> = ({ onClick, isActive, children }) => (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
        isActive
          ? 'bg-primary text-white shadow'
          : 'bg-surface/80 text-neutral-medium hover:bg-neutral-light/50'
      }`}
    >
      {children}
    </button>
  );

const ProgressTimelineView: React.FC<ProgressTimelineViewProps> = ({ skillProgressData, timelineEvents }) => {
    const allSkills = useMemo(() => [...new Set(skillProgressData.map(d => d.skill))], [skillProgressData]);
    const [selectedSkill, setSelectedSkill] = useState<string>(allSkills[0] || '');
    const [timeRange, setTimeRange] = useState<'30d' | 'all'>('all');

    const [aiInsights, setAiInsights] = useState<TimelineAiInsight | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    
    const filteredData = useMemo(() => {
        let data = skillProgressData
            .filter(d => d.skill === selectedSkill)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        if (timeRange === '30d') {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            data = data.filter(d => new Date(d.date) >= thirtyDaysAgo);
        }
        
        return data;
    }, [selectedSkill, timeRange, skillProgressData]);

    const eventsOnChart = useMemo(() => {
        const dateRange = new Set(filteredData.map(d => d.date));
        return timelineEvents
            .filter(event => event.skill === selectedSkill && dateRange.has(event.date))
            .map(event => {
                const dataPoint = filteredData.find(d => d.date === event.date);
                return { ...dataPoint, event };
            });
    }, [filteredData, selectedSkill, timelineEvents]);

    const stats = useMemo(() => {
        if (filteredData.length === 0) return { current: 0, change: 0, vsClass: 0 };
        const current = filteredData[filteredData.length - 1].mastery;
        const change = filteredData.length > 1 ? current - filteredData[0].mastery : 0;
        const classAvg = mockClassAverages[selectedSkill] || 0;
        const vsClass = classAvg > 0 ? current - classAvg : 0;
        return { current, change, vsClass };
    }, [filteredData, selectedSkill]);
    
    const activityLog = useMemo(() => {
        // Derive activity log from timeline events for consistency
        return timelineEvents
            .filter(event => event.skill === selectedSkill || event.skill === 'General')
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map(event => {
                let detail = '';
                if (event.score) detail += `Score: ${event.score}%`;
                return {
                    type: event.type,
                    title: event.title,
                    detail: detail,
                    time: new Date(event.date).toLocaleDateString(), // simplified time
                    skill: event.skill
                };
            });
    }, [selectedSkill, timelineEvents]);

    useEffect(() => {
        if (!selectedSkill) return;
        const generateSummary = async () => {
            if (filteredData.length < 2) {
                setAiInsights({ observation: "Not enough data for insights.", tip: "Keep practicing to see your progress over time!" });
                setIsSummaryLoading(false);
                return;
            }
            setIsSummaryLoading(true);
            try {
                const schema = {
                    type: Type.OBJECT,
                    properties: {
                        observation: { type: Type.STRING, description: "A one-sentence key observation about the student's progress trend." },
                        tip: { type: Type.STRING, description: "A short, actionable tip based on the observation." },
                    },
                    required: ['observation', 'tip'],
                };
                
                const prompt = `Analyze a student's progress for the skill "${selectedSkill}". Their mastery went from ${filteredData[0].mastery}% to ${filteredData[filteredData.length - 1].mastery}% over this period. The class average is ${mockClassAverages[selectedSkill]}%. Provide a key observation and an actionable tip.`;
                
                const insights = await generateJsonContent(prompt, schema);
                setAiInsights(insights);

            } catch (error) {
                console.error("Error generating AI summary:", error);
                setAiInsights({ observation: "Error generating insights.", tip: "Please try again later." });
            } finally {
                setIsSummaryLoading(false);
            }
        };

        generateSummary();
    }, [filteredData, selectedSkill]);

    const activityIcons = {
        assessment: <CheckSquareIcon className="h-5 w-5 text-success" />,
        milestone: <TrophyIcon className="h-5 w-5 text-secondary" />,
        learning: <BookOpenIcon className="h-5 w-5 text-secondary" />,
        practice: <DumbbellIcon className="h-5 w-5 text-warning" />,
    };

    return (
        <>
            <header className="mb-8">
                <div className="flex items-center">
                    <LineChartIcon className="h-8 w-8 text-primary mr-3" />
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">My Learning Journey</h1>
                </div>
                <p className="text-lg text-neutral-medium mt-1">Track your skill development over time with detailed insights.</p>
            </header>

            <Card padding="sm" className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <label htmlFor="skill-select" className="text-sm font-semibold text-neutral-dark mr-3">Select a Skill:</label>
                        <select
                            id="skill-select"
                            value={selectedSkill}
                            onChange={e => setSelectedSkill(e.target.value)}
                            className="px-4 py-2 bg-surface border border-neutral-light/50 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            {allSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 bg-neutral-light/30 p-1 rounded-lg">
                        <FilterButton onClick={() => setTimeRange('30d')} isActive={timeRange === '30d'}>Last 30 Days</FilterButton>
                        <FilterButton onClick={() => setTimeRange('all')} isActive={timeRange === 'all'}>All Time</FilterButton>
                    </div>
                </div>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card>
                        <h2 className="text-xl font-bold font-display text-neutral-extradark mb-6">Mastery for <span className="text-primary">{selectedSkill}</span></h2>
                        <div style={{ width: '100%', height: 350 }}>
                        {filteredData.length > 0 ? (
                            <ResponsiveContainer>
                                <AreaChart
                                    data={filteredData}
                                    margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                >
                                    <defs>
                                        <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                    <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
                                    <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#64748B', fontSize: 12 }} />
                                    <Tooltip content={<CombinedTooltip />} />
                                    <ReferenceLine y={mockClassAverages[selectedSkill]} stroke="#64748B" strokeDasharray="4 4" strokeWidth={2}>
                                        <Label value={`Class Avg: ${mockClassAverages[selectedSkill]}%`} position="insideTopRight" fill="#475569" fontSize={12} fontWeight="bold" />
                                    </ReferenceLine>
                                    <Area type="monotone" dataKey="mastery" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#colorUv)" />
                                    <Line dataKey="mastery" data={eventsOnChart} stroke="none" dot={<CustomEventDot />} isAnimationActive={false} activeDot={{ r: 8 }} />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-full text-neutral-medium">
                                No data available for the selected period.
                            </div>
                        )}
                        </div>
                    </Card>
                     <Card>
                        <h2 className="text-xl font-bold font-display text-neutral-extradark mb-4">Activity Log for {selectedSkill}</h2>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {activityLog.length > 0 ? activityLog.map((activity, index) => (
                                <div key={index} className="flex items-start">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 bg-gradient-to-br from-primary/10 to-secondary/10`}>
                                        {activityIcons[activity.type as keyof typeof activityIcons]}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-neutral-dark">{activity.title}</p>
                                        <p className="text-sm text-neutral-medium">{activity.detail} &middot; {activity.time}</p>
                                    </div>
                                </div>
                            )) : <p className="text-sm text-neutral-medium text-center py-4">No recent activities for this skill.</p>}
                        </div>
                    </Card>
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <div className="space-y-4">
                         <h3 className="font-bold text-neutral-dark">At a Glance</h3>
                        <Card padding="sm">
                            <p className="text-sm font-semibold text-neutral">Current Mastery</p>
                            <p className="text-4xl font-display font-bold text-primary">{stats.current.toFixed(0)}%</p>
                        </Card>
                         <Card padding="sm">
                            <p className="text-sm font-semibold text-neutral">Progress ({timeRange === '30d' ? '30d' : 'All Time'})</p>
                            <p className={`text-4xl font-display font-bold ${stats.change >= 0 ? 'text-success' : 'text-danger'}`}>{stats.change >= 0 ? '+' : ''}{stats.change.toFixed(0)}%</p>
                        </Card>
                        <Card padding="sm">
                            <p className="text-sm font-semibold text-neutral">vs. Class Average</p>
                            <p className={`text-4xl font-display font-bold ${stats.vsClass >= 0 ? 'text-success' : 'text-danger'}`}>{stats.vsClass >= 0 ? '+' : ''}{stats.vsClass.toFixed(0)}%</p>
                        </Card>
                    </div>
                    <Card className="h-full">
                        <div className="flex items-center mb-4">
                            <SparklesIcon className="h-6 w-6 text-primary mr-3" />
                            <h2 className="text-xl font-bold font-display text-neutral-extradark">AI-Powered Insights</h2>
                        </div>
                        {isSummaryLoading ? (
                            <div className="space-y-3 animate-pulse">
                                <div className="h-4 bg-neutral-light/50 rounded-md w-full"></div>
                                <div className="h-4 bg-neutral-light/50 rounded-md w-5/6"></div>
                            </div>
                        ) : aiInsights ? (
                            <div className="space-y-4">
                                <div className="p-3 bg-primary/5 rounded-lg">
                                    <div className="flex items-start gap-2">
                                        <EyeIcon className="w-5 h-5 text-primary-dark mt-0.5 shrink-0"/>
                                        <div>
                                            <h4 className="font-bold text-primary-dark text-sm">Key Observation</h4>
                                            <p className="text-neutral-dark text-sm leading-relaxed">{aiInsights.observation}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-secondary/5 rounded-lg">
                                     <div className="flex items-start gap-2">
                                         <SparklesIcon className="w-5 h-5 text-secondary-dark mt-0.5 shrink-0"/>
                                         <div>
                                            <h4 className="font-bold text-secondary-dark text-sm">Actionable Tip</h4>
                                            <p className="text-neutral-dark text-sm leading-relaxed">{aiInsights.tip}</p>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ) : null}
                    </Card>
                </div>
            </div>
        </>
    );
};

export default ProgressTimelineView;