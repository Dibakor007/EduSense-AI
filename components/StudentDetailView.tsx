import React, { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { mockClassAverages, mockStudentPerformanceHistory, mockStudentRecentActivity, mockStudentSkills } from '../data';
import { unifiedDataService } from '../services/dataService';
import { Submission, User } from '../types';
import Card from './Card';
import { BarChartIcon, BookOpenIcon, CheckSquareIcon, ClockIcon, DumbbellIcon, InfoIcon, RefreshCwIcon, SparklesIcon, TrendingUpIcon, TrophyIcon } from './icons';

interface StudentDetailViewProps {
    student: User;
    onBack: () => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: string; }> = ({ icon, label, value, color }) => (
    <Card className="flex items-center">
        <div className={`p-4 rounded-xl ${color}`}>
            {icon}
        </div>
        <div className="ml-4">
            <h3 className="text-sm font-semibold text-neutral">{label}</h3>
            <p className="text-2xl font-display font-bold text-neutral-extradark mt-1">{value}</p>
        </div>
    </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20">
          <p className="label font-bold text-neutral-extradark">{`Date: ${label}`}</p>
          <p className="intro text-primary">{`Score: ${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
};

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ student, onBack }) => {
    // In a real app, you would fetch this student's specific data
    const studentSkills = mockStudentSkills; 
    const performanceHistory = mockStudentPerformanceHistory;
    const recentActivity = mockStudentRecentActivity;
    const [studentSubmissions, setStudentSubmissions] = useState<Submission[]>([]);
    const [isUpdating, setIsUpdating] = useState(false);

    // Subscribe to real-time submission updates
    useEffect(() => {
        const unsubscribe = unifiedDataService.subscribe((data) => {
            const submissions = data.submissions.filter(s => s.studentId === student.id);
            setStudentSubmissions(submissions);
            setIsUpdating(true);
            setTimeout(() => setIsUpdating(false), 500);
        });

        // Initial sync
        const submissions = unifiedDataService.getStudentSubmissions(student.id);
        if (submissions.length > 0) {
            setStudentSubmissions(submissions);
        }

        return unsubscribe;
    }, [student.id]);

    const activityIcons = {
        assessment: <CheckSquareIcon className="h-5 w-5 text-success" />,
        learning: <BookOpenIcon className="h-5 w-5 text-secondary" />,
        practice: <DumbbellIcon className="h-5 w-5 text-warning" />,
        feedback: <InfoIcon className="h-5 w-5 text-primary" />,
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-6xl mx-auto">
                <button onClick={onBack} className="text-sm font-semibold text-primary mb-6">&larr; Back to Classroom</button>
                <header className="flex items-center justify-between mb-8">
                    <div className="flex items-center">
                        <img src={student.avatar} alt={student.name} className="h-20 w-20 rounded-full mr-6 border-4 border-white shadow-lg" />
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">{student.name}</h1>
                            <p className="text-lg text-neutral-medium mt-1">{student.email}</p>
                        </div>
                    </div>
                    {isUpdating && (
                      <div className="flex items-center text-sm text-secondary animate-pulse">
                        <RefreshCwIcon className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </div>
                    )}
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <StatCard icon={<CheckSquareIcon className="h-6 w-6 text-primary-dark"/>} label="Assessments Completed" value={`${student.stats.assessmentsCompleted}`} color="bg-gradient-to-br from-primary/10 to-secondary/10" />
                    <StatCard icon={<TrophyIcon className="h-6 w-6 text-secondary-dark"/>} label="Average Score" value={`${student.stats.averageScore.toFixed(1)}%`} color="bg-gradient-to-br from-secondary/10 to-cyan-300/10" />
                    <StatCard icon={<ClockIcon className="h-6 w-6 text-success-dark"/>} label="Total Study Time" value={`${(student.stats.totalStudyTime / 60).toFixed(1)} hrs`} color="bg-gradient-to-br from-success/10 to-green-300/10" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                    <div className="lg:col-span-3">
                        <Card className="h-full">
                             <div className="flex items-center mb-6">
                                <TrendingUpIcon className="h-6 w-6 text-primary mr-3" />
                                <h2 className="text-xl font-bold font-display text-neutral-extradark">Performance Trend</h2>
                            </div>
                             <div style={{ width: '100%', height: 250 }}>
                                <ResponsiveContainer>
                                    <AreaChart data={performanceHistory} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <defs>
                                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/>
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                                        <XAxis dataKey="date" tick={{ fill: '#475569', fontSize: 12 }} />
                                        <YAxis domain={[0, 100]} unit="%" tick={{ fill: '#64748B', fontSize: 12 }} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Area type="monotone" dataKey="score" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </div>
                     <div className="lg:col-span-2">
                        <Card className="h-full">
                             <div className="flex items-center mb-4">
                                <SparklesIcon className="h-6 w-6 text-primary mr-3" />
                                <h2 className="text-xl font-bold font-display text-neutral-extradark">AI-Generated Summary</h2>
                            </div>
                            <p className="text-neutral-dark text-md leading-relaxed">
                                {student.name} shows excellent performance in Data Structures, particularly with Arrays and Stacks. The primary growth area is Algorithms, where scores are consistently below the class average. Focusing on practice problems related to time complexity could yield significant improvements.
                            </p>
                        </Card>
                    </div>

                    <Card className="lg:col-span-3">
                        <div className="flex items-center mb-6">
                            <BarChartIcon className="h-6 w-6 text-primary mr-3" />
                            <h2 className="text-xl font-bold font-display text-neutral-extradark">Skill Proficiency</h2>
                        </div>
                        <div className="space-y-5">
                            {studentSkills.map(skill => (
                                <div key={skill.subject}>
                                    <div className="flex justify-between items-center mb-1.5 text-sm">
                                        <h4 className="font-semibold text-neutral-dark">{skill.subject}</h4>
                                        <span className="font-bold text-primary">{skill.score}%</span>
                                    </div>
                                    <div className="relative h-2.5 bg-neutral-light/40 rounded-full">
                                        <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${skill.score}%` }}></div>
                                        <div className="absolute top-0 h-full flex items-center" style={{ left: `${mockClassAverages[skill.subject] || 0}%` }} title={`Class Avg: ${mockClassAverages[skill.subject] || 0}%`}>
                                            <div className="h-4 w-1 bg-neutral-medium/70 rounded-full -translate-y-1"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                    <Card className="lg:col-span-2">
                         <h2 className="text-xl font-bold font-display text-neutral-extradark mb-4">Recent Submissions</h2>
                         <div className="space-y-4 max-h-96 overflow-y-auto">
                            {studentSubmissions.length > 0 ? (
                                studentSubmissions.map((submission) => (
                                    <div key={submission.id} className="flex items-start p-3 bg-white/50 rounded-lg border border-neutral-light/50 hover:border-primary transition-colors">
                                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-3 bg-gradient-to-br from-primary/10 to-secondary/10">
                                            <CheckSquareIcon className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-grow">
                                            <p className="font-semibold text-neutral-dark">Assessment Completed</p>
                                            <p className="text-xs text-neutral-medium">Score: <span className="font-bold text-primary">{submission.result.percentage.toFixed(1)}%</span></p>
                                            {submission.feedback && (
                                                <div className="mt-2 p-2 bg-secondary/5 rounded border-l-2 border-secondary">
                                                    <p className="text-xs font-semibold text-secondary mb-1 flex items-center">
                                                        <InfoIcon className="h-3 w-3 mr-1" />
                                                        Teacher Feedback
                                                    </p>
                                                    <p className="text-xs text-neutral-dark">{submission.feedback.comments}</p>
                                                    {submission.feedback.grade !== undefined && (
                                                        <p className="text-xs font-bold text-secondary mt-1">Grade: {submission.feedback.grade}/100</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-sm text-neutral-medium">No submissions yet</p>
                                </div>
                            )}
                         </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDetailView;