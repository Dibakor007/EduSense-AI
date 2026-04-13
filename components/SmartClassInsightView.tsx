

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { Classroom, User, ClassInsightReport, Submission, Assessment } from '../types';
import Card from './Card';
import Button from './Button';
import { LightbulbIcon, SparklesIcon, TrendingDownIcon, TrendingUpIcon, ClockIcon, UserIcon, BarChartIcon } from './icons';

interface SmartClassInsightViewProps {
  classrooms: Classroom[];
  students: User[];
  assessments: Assessment[];
  allSubmissions: Submission[];
  selectedClassId: string;
  assessmentId: string | null;
  onBack: () => void;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20">
          <p className="label font-bold text-neutral-extradark">{label}</p>
          <p className="intro" style={{ color: payload[0].fill }}>{`Average Score: ${payload[0].value.toFixed(1)}%`}</p>
        </div>
      );
    }
    return null;
};

const SmartClassInsightView: React.FC<SmartClassInsightViewProps> = ({ classrooms, students, assessments, allSubmissions, selectedClassId: initialClassId, assessmentId, onBack }) => {
    const [selectedClassId, setSelectedClassId] = useState<string>(initialClassId);
    const [report, setReport] = useState<ClassInsightReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    const selectedAssessment = useMemo(() => assessmentId ? assessments.find(a => a.id === assessmentId) : null, [assessmentId, assessments]);

    const analyzeData = useCallback((classId: string): Omit<ClassInsightReport, 'aiSummary' | 'generatedAt'> => {
        const classStudents = students.filter(s => s.classIds?.includes(classId));
        
        let submissions = allSubmissions;
        if (assessmentId) {
            submissions = allSubmissions.filter(sub => sub.assessmentId === assessmentId);
        }
        
        const data = submissions.map(sub => {
            const student = students.find(s => s.id === sub.studentId);
            const assessment = assessments.find(a => a.id === sub.assessmentId);
            return {
                studentId: sub.studentId,
                studentName: student?.name || 'Unknown',
                classId: assessment?.classId || '',
                subject: assessment?.subject || 'Unknown',
                // For weak topics, we'll use a placeholder until we have per-question data
                topics: Object.keys(sub.result.skillBreakdown),
                score: sub.result.percentage,
                date: sub.submittedAt,
                assessmentId: sub.assessmentId,
            };
        }).filter(d => d.classId === classId);
        
        // Overall Average
        const totalScore = data.reduce((acc, cur) => acc + cur.score, 0);
        const overallAverage = data.length > 0 ? totalScore / data.length : 0;

        // Weak Topics (using skill breakdown from results)
        const topicScores: { [key: string]: number[] } = {};
        submissions.filter(s => s.result.assessmentId === assessmentId).forEach(sub => {
            Object.entries(sub.result.skillBreakdown).forEach(([topic, details]) => {
                if (!topicScores[topic]) topicScores[topic] = [];
                // FIX: Explicitly cast `details` to access the `percentage` property, resolving a TypeScript type inference issue.
                topicScores[topic].push((details as { percentage: number }).percentage);
            });
        });

        const weakTopics = Object.entries(topicScores).map(([topic, scores]) => ({
            topic,
            averageScore: scores.reduce((a, b) => a + b, 0) / scores.length
        })).filter(t => t.averageScore < 60);

        // Improving Students (simplified for this context)
        const improvingStudents = students.slice(0, 2).map(s => ({name: s.name, id: s.id}));

        // Backlog Students
        const assessmentsForClass = assessments.filter(a => a.classId === classId && a.id === (assessmentId || a.id));
        const submissionsByStudent: { [id: string]: Set<string> } = {};
        data.forEach(d => {
            if (!submissionsByStudent[d.studentId]) submissionsByStudent[d.studentId] = new Set();
            submissionsByStudent[d.studentId].add(d.assessmentId);
        });
        const backlogStudents = classStudents.filter(student => {
            const submittedCount = submissionsByStudent[student.id]?.size || 0;
            return assessmentsForClass.length - submittedCount > 0;
        }).map(s => ({ name: s.name, id: s.id }));

        // Subject Averages
        const subjectAverages = [{ name: selectedAssessment?.subject || "Overall", averageScore: overallAverage }];
        
        // Performance Distribution
        const studentAverages = data.map(d => d.score);
        const distribution = { excellent: 0, average: 0, weak: 0 };
        studentAverages.forEach(avg => {
            if (avg > 80) distribution.excellent++;
            else if (avg >= 60) distribution.average++;
            else distribution.weak++;
        });
        const performanceDistribution = [
            { name: 'Excellent (>80%)', count: distribution.excellent, color: '#10B981' },
            { name: 'Average (60-80%)', count: distribution.average, color: '#F59E0B' },
            { name: 'Weak (<60%)', count: distribution.weak, color: '#EF4444' },
        ];
        
        return { overallAverage, weakTopics, improvingStudents, backlogStudents, subjectAverages, performanceDistribution };

    }, [students, allSubmissions, assessments, assessmentId]);

    const handleGenerateReport = useCallback(async (classId: string) => {
        if (!classId) return;
        setIsLoading(true);
        setError(null);
        setReport(null);
        
        try {
            const analysis = analyzeData(classId);
            
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const context = assessmentId ? `for the assessment "${selectedAssessment?.title}"` : 'across all assessments';
            
            const prompt = `You are an expert educational analyst providing insights for a teacher. Based on the following class performance data ${context}, write a concise, actionable summary.
            
            - Overall Class Average: ${analysis.overallAverage.toFixed(1)}%
            - Weak Topics (avg score < 60%): ${analysis.weakTopics.length > 0 ? analysis.weakTopics.map(t => `${t.topic} (${t.averageScore.toFixed(1)}%)`).join(', ') : 'None'}
            - Students who haven't submitted this assessment: ${analysis.backlogStudents.length > 0 ? analysis.backlogStudents.map(s => s.name).join(', ') : 'None'}

            Your summary should:
            1. State the overall performance on this specific assessment.
            2. Highlight the most critical topics to focus on for reteaching.
            3. Mention if there are students who need to complete the assessment.
            4. Conclude with a clear, single recommendation for the next lesson or a follow-up action.
            
            Keep the tone professional and helpful. Do not use markdown. Limit the summary to 3-4 sentences.`;

            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });
            
            setReport({
                ...analysis,
                aiSummary: response.text,
                generatedAt: new Date().toLocaleString()
            });

        } catch (e) {
            console.error("Error generating report:", e);
            setError("Failed to generate AI insights. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    }, [analyzeData, assessmentId, selectedAssessment]);

    useEffect(() => {
        if (selectedClassId) {
            handleGenerateReport(selectedClassId);
        }
    }, [selectedClassId, handleGenerateReport]);


    return (
        <div className="animate-fade-in">
            <button onClick={onBack} className="text-sm font-semibold text-primary mb-6">&larr; Back to Dashboard</button>
            <header className="mb-8">
                <div className="flex items-center">
                    <LightbulbIcon className="h-8 w-8 text-secondary mr-3" />
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Smart Class Insight</h1>
                </div>
                <p className="text-lg text-neutral-medium mt-1">AI-powered analytics to guide your teaching decisions.</p>
            </header>

            <Card className="mb-8">
                {assessmentId ? (
                    <div className="p-4 bg-secondary/10 rounded-lg text-center">
                        <p className="font-semibold text-secondary-dark">Showing Full Report For:</p>
                        <p className="font-bold text-xl text-secondary-dark">{selectedAssessment?.title}</p>
                    </div>
                ) : (
                    <div className="flex flex-col md:flex-row items-center gap-4">
                        <div className="flex-grow w-full md:w-auto">
                            <label htmlFor="class-select" className="block text-sm font-medium text-neutral-dark mb-1">Select a Classroom for Overall Analysis</label>
                            <select
                                id="class-select"
                                value={selectedClassId}
                                onChange={e => {
                                    setSelectedClassId(e.target.value);
                                    setReport(null);
                                }}
                                className="w-full px-4 py-3 bg-white/50 border border-neutral-light rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-secondary"
                            >
                                <option value="" disabled>-- Choose a class --</option>
                                {classrooms.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </Card>
            
            {error && <Card className="text-center bg-danger/10 text-danger-dark font-semibold p-4">{error}</Card>}

            {!report && !isLoading && !selectedClassId && (
                <Card className="text-center py-16">
                     <LightbulbIcon className="h-12 w-12 text-secondary mx-auto" />
                    <h3 className="text-xl font-bold mt-4">Ready for Insights?</h3>
                    <p className="text-neutral-medium mt-2">Select a class to see an AI-powered breakdown of overall student performance.</p>
                </Card>
            )}
            
            {isLoading && (
                <Card className="text-center py-16">
                    <div className="flex justify-center items-center">
                        <SparklesIcon className="h-10 w-10 text-secondary animate-pulse mr-4" />
                        <p className="text-lg font-semibold text-secondary-dark">Analyzing class data and generating insights...</p>
                    </div>
                </Card>
            )}

            {report && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <div className="flex items-center gap-3 mb-2"><TrendingDownIcon className="w-6 h-6 text-danger"/><h3 className="font-bold text-neutral-dark text-lg">Weak Topics</h3></div>
                            {report.weakTopics.length > 0 ? (
                                <ul className="space-y-2">
                                    {report.weakTopics.map(t => <li key={t.topic} className="flex justify-between text-sm"><span className="font-semibold text-neutral-dark">{t.topic}</span> <span className="text-danger font-bold">{t.averageScore.toFixed(1)}%</span></li>)}
                                </ul>
                            ) : <p className="text-sm text-neutral-medium">No topics with an average below 60%. Great job!</p>}
                        </Card>
                        <Card>
                             <div className="flex items-center gap-3 mb-2"><TrendingUpIcon className="w-6 h-6 text-success"/><h3 className="font-bold text-neutral-dark text-lg">Top Performers</h3></div>
                             {report.improvingStudents.length > 0 ? (
                                <ul className="space-y-1">{report.improvingStudents.map(s => <li key={s.id} className="text-sm font-semibold text-neutral-dark">{s.name}</li>)}</ul>
                            ) : <p className="text-sm text-neutral-medium">Data will populate as students complete more assessments.</p>}
                        </Card>
                        <Card>
                             <div className="flex items-center gap-3 mb-2"><ClockIcon className="w-6 h-6 text-warning-dark"/><h3 className="font-bold text-neutral-dark text-lg">Incomplete Submissions</h3></div>
                              {report.backlogStudents.length > 0 ? (
                                <ul className="space-y-1">{report.backlogStudents.map(s => <li key={s.id} className="text-sm font-semibold text-neutral-dark">{s.name}</li>)}</ul>
                            ) : <p className="text-sm text-neutral-medium">All students have submitted this assessment.</p>}
                        </Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                         <Card className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4"><BarChartIcon className="w-6 h-6 text-secondary"/><h3 className="font-bold text-neutral-dark text-lg">Overall Performance</h3></div>
                            <div className="text-center mb-4">
                                <span className="text-5xl font-bold font-display text-secondary-dark">{report.overallAverage.toFixed(1)}%</span>
                                <p className="text-neutral-medium font-semibold">Class Average</p>
                            </div>
                        </Card>
                        <Card>
                             <div className="flex items-center gap-3 mb-4"><UserIcon className="w-6 h-6 text-secondary"/><h3 className="font-bold text-neutral-dark text-lg">Performance Distribution</h3></div>
                            <div style={{width: '100%', height: 150}}>
                                <ResponsiveContainer>
                                    <PieChart>
                                        <Pie data={report.performanceDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={3}>
                                            {report.performanceDistribution.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                             <div className="flex justify-center flex-wrap gap-x-4 gap-y-1 mt-2 text-xs">
                                {report.performanceDistribution.map(entry => (
                                    <div key={entry.name} className="flex items-center"><div className="w-2 h-2 rounded-full mr-1.5" style={{backgroundColor: entry.color}}></div> {entry.name}</div>
                                ))}
                            </div>
                        </Card>
                    </div>
                    <Card>
                        <div className="flex items-center gap-3 mb-2"><SparklesIcon className="w-6 h-6 text-secondary"/><h3 className="font-bold text-neutral-dark text-lg">AI Summary & Recommendation</h3></div>
                        <p className="text-neutral-dark text-md leading-relaxed bg-secondary/10 p-4 rounded-lg border-l-4 border-secondary">{report.aiSummary}</p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default SmartClassInsightView;