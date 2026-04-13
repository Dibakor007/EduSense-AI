import React, { useMemo, useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from 'recharts';
import { Type } from "@google/genai";
import { generateJsonContent } from '../services/aiService';
import { User, SkillDetailContent, SkillDetailRecommendation, FutureSkillTrend, SkillRadarSummary, StudentSkill, ClassSkill, SkillProgressRecord } from '../types';
import Card from './Card';
import Button from './Button';
import { RadarIcon, SparklesIcon, PlayCircleIcon, FileTextIcon, DumbbellIcon, TrendingUpIcon, EyeIcon, RocketIcon, TrophyIcon, TrendingDownIcon, LightbulbIcon } from './icons';
import ProgressBar from './ProgressBar';

interface SkillRadarViewProps {
  userRole: User['role'];
  studentSkills: StudentSkill[];
  classSkills: ClassSkill[];
  skillProgressData: SkillProgressRecord[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-surface/80 backdrop-blur-xl rounded-xl shadow-lg border border-white/20">
          <p className="label font-bold text-neutral-extradark">{label}</p>
          {payload.map((entry: any) => (
             <p key={entry.name} style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value}%`}
             </p>
          ))}
        </div>
      );
    }
    return null;
};

const RecommendationItem: React.FC<{ rec: SkillDetailRecommendation }> = ({ rec }) => {
    const icons = {
        video: <PlayCircleIcon className="h-6 w-6 text-secondary" />,
        article: <FileTextIcon className="h-6 w-6 text-primary" />,
        practice: <DumbbellIcon className="h-6 w-6 text-warning-dark" />,
    };

    return (
        <div className="flex items-start gap-4 p-4 bg-surface/50 rounded-xl">
            <div className="p-3 bg-neutral-light/30 rounded-lg">{icons[rec.type]}</div>
            <div>
                <p className="font-bold text-neutral-dark">{rec.title}</p>
                <p className="text-sm text-neutral-medium">{rec.description}</p>
            </div>
        </div>
    );
};

const detailLoadingMessages = [
    "Analyzing performance trends...",
    "Identifying key observations...",
    "Curating learning recommendations...",
    "Personalizing your feedback..."
];

const SkillRadarView: React.FC<SkillRadarViewProps> = ({ userRole, studentSkills, classSkills, skillProgressData }) => {
    const [aiSummary, setAiSummary] = useState<SkillRadarSummary | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);

    const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
    const [skillDetails, setSkillDetails] = useState<SkillDetailContent | null>(null);
    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailLoadingMessage, setDetailLoadingMessage] = useState(detailLoadingMessages[0]);

    const [futureTrends, setFutureTrends] = useState<FutureSkillTrend[]>([]);
    const [areTrendsLoading, setAreTrendsLoading] = useState(true);

    const combinedSkillData = useMemo(() => {
        return studentSkills.map(studentSkill => {
            const classSkill = classSkills.find(cs => cs.name === studentSkill.subject);
            return {
                subject: studentSkill.subject,
                score: studentSkill.score,
                classAverage: classSkill ? classSkill.classAverage : 0,
                fullMark: studentSkill.fullMark
            };
        });
    }, [studentSkills, classSkills]);

    useEffect(() => {
        if (isDetailLoading) {
            const interval = setInterval(() => {
                setDetailLoadingMessage(prev => {
                    const currentIndex = detailLoadingMessages.indexOf(prev);
                    return detailLoadingMessages[(currentIndex + 1) % detailLoadingMessages.length];
                });
            }, 1500);
            return () => clearInterval(interval);
        }
    }, [isDetailLoading]);

    // Effect for the main overview AI summary
    useEffect(() => {
        const generateSummary = async () => {
            setIsSummaryLoading(true);
            try {
                const schema = {
                  type: Type.OBJECT,
                  properties: {
                    topStrength: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        reason: { type: Type.STRING, description: "A brief, one-sentence explanation for why it's a strength." }
                      },
                      required: ["skill", "reason"]
                    },
                    primaryWeakness: {
                      type: Type.OBJECT,
                      properties: {
                        skill: { type: Type.STRING },
                        reason: { type: Type.STRING, description: "A brief, one-sentence explanation for why it's a weakness." }
                      },
                      required: ["skill", "reason"]
                    },
                    suggestion: { type: Type.STRING, description: "A single, actionable suggestion for the primary weakness." }
                  },
                  required: ["topStrength", "primaryWeakness", "suggestion"]
                };

                const prompt = `You are an encouraging academic advisor. Analyze this student skill data and provide a structured summary.
                Data: ${combinedSkillData.map(skill => `- ${skill.subject}: My Score ${skill.score}%, Class Average ${skill.classAverage}%`).join('\n')}
                Identify the student's top strength (highest score or most above average) and primary weakness (lowest score or most below average). Provide a brief reason for each and one actionable suggestion for the weakness.`;
                
                const summaryData = await generateJsonContent(prompt, schema);
                setAiSummary(summaryData);

            } catch (error) {
                console.error("Error generating AI summary:", error);
                // Fallback in case of error
            } finally {
                setIsSummaryLoading(false);
            }
        };

        generateSummary();
    }, [combinedSkillData]);
    
    // Effect for the detailed skill view
    useEffect(() => {
        if (!selectedSkill) return;

        const generateSkillDetails = async () => {
            setIsDetailLoading(true);
            setDetailLoadingMessage(detailLoadingMessages[0]);
            setSkillDetails(null);
            try {
                const studentSkill = studentSkills.find(s => s.subject === selectedSkill);
                const skillProgress = skillProgressData.filter(p => p.skill === selectedSkill);

                const schema: any = {
                    type: Type.OBJECT,
                    properties: {
                        trendAnalysis: {
                            type: Type.OBJECT,
                            properties: {
                                summary: { type: Type.STRING, description: "A top-level, one-sentence summary of the performance trend (e.g., 'Steady improvement with a recent dip')." },
                                keyObservation: { type: Type.STRING, description: "A specific, data-driven observation from the trend (e.g., 'A significant jump in mastery occurred after October 15th')." }
                            },
                            required: ["summary", "keyObservation"]
                        },
                        recommendations: {
                            type: Type.ARRAY,
                            description: "3 diverse, actionable learning recommendations.",
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    type: { type: Type.STRING, enum: ['video', 'article', 'practice'] },
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING, description: "A one-sentence description of the resource or activity." }
                                },
                                required: ["type", "title", "description"]
                            }
                        }
                    },
                    required: ["trendAnalysis", "recommendations"]
                };

                const prompt = `A student has selected the skill "${selectedSkill}" to get more details. Their current mastery is ${studentSkill?.score}%.
                Their performance history is: ${skillProgress.map(p => `${p.date}: ${p.mastery}%`).join(', ')}.
                Provide a two-part trend analysis: a top-level summary and a specific key observation. Also provide exactly 3 diverse, actionable learning recommendations (one video, one article, one practice).`;

                const detailsData = await generateJsonContent(prompt, schema);
                setSkillDetails(detailsData);

            } catch (error) {
                console.error("Error generating skill details:", error);
                setSkillDetails({
                    trendAnalysis: {
                        summary: "Could not generate AI insights for this skill's trend.",
                        keyObservation: "Reviewing your progress timeline may provide more clarity."
                    },
                    recommendations: [{ type: 'practice', title: 'Review Fundamentals', description: 'Go over the core concepts of this topic to build a stronger foundation.' }]
                });
            } finally {
                setIsDetailLoading(false);
            }
        };

        generateSkillDetails();
    }, [selectedSkill, studentSkills, skillProgressData]);
    
    // Effect for future skill trends
    useEffect(() => {
        const generateFutureTrends = async () => {
            setAreTrendsLoading(true);
            try {
                const schema = {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            rank: { type: Type.NUMBER },
                            skill: { type: Type.STRING },
                            reason: { type: Type.STRING, description: "A brief, one-sentence explanation for why this skill is in high demand." }
                        },
                        required: ["rank", "skill", "reason"]
                    }
                };
                const prompt = `Based on current industry trends, generate a ranked list of the top 5 most in-demand technical skills for the next 10 years. Provide a brief reason for each.`;
                
                const trendsData = await generateJsonContent(prompt, schema);
                
                if (Array.isArray(trendsData)) {
                    setFutureTrends(trendsData);
                }

            } catch (error) {
                console.error("Error generating future skill trends:", error);
            } finally {
                setAreTrendsLoading(false);
            }
        };
        generateFutureTrends();
    }, []);

    const handleSkillClick = (data: any) => {
        if (data && data.activeLabel) {
            setSelectedSkill(data.activeLabel);
        }
    };
    
    const trendData = useMemo(() => {
        return skillProgressData.filter(d => d.skill === selectedSkill)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [selectedSkill, skillProgressData]);
    
    const renderOverview = () => (
      <div className="flex flex-col gap-8 animate-fade-in">
        <Card>
            <div className="flex items-center mb-4">
                <SparklesIcon className="h-6 w-6 text-primary mr-3" />
                <h2 className="text-xl font-bold font-display text-neutral-extradark">Skill Analysis</h2>
            </div>
            {isSummaryLoading || !aiSummary ? (
                <div className="space-y-4 animate-pulse">
                    <div className="h-16 bg-neutral-light/50 rounded-lg"></div>
                    <div className="h-16 bg-neutral-light/50 rounded-lg"></div>
                    <div className="h-16 bg-neutral-light/50 rounded-lg"></div>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 bg-success/10 rounded-xl">
                        <div className="p-3 bg-success/20 text-success-dark rounded-full"><TrophyIcon className="w-6 h-6"/></div>
                        <div>
                            <h4 className="font-bold text-success-dark">Top Strength: {aiSummary.topStrength.skill}</h4>
                            <p className="text-sm text-neutral-dark">{aiSummary.topStrength.reason}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4 p-4 bg-danger/10 rounded-xl">
                        <div className="p-3 bg-danger/20 text-danger-dark rounded-full"><TrendingDownIcon className="w-6 h-6"/></div>
                        <div>
                            <h4 className="font-bold text-danger-dark">Primary Weakness: {aiSummary.primaryWeakness.skill}</h4>
                            <p className="text-sm text-neutral-dark">{aiSummary.primaryWeakness.reason}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4 p-4 bg-primary/10 rounded-xl">
                        <div className="p-3 bg-primary/20 text-primary-dark rounded-full"><LightbulbIcon className="w-6 h-6"/></div>
                        <div>
                            <h4 className="font-bold text-primary-dark">Actionable Suggestion</h4>
                            <p className="text-sm text-neutral-dark">{aiSummary.suggestion}</p>
                        </div>
                    </div>
                </div>
            )}
        </Card>

        <Card>
            <div className="flex items-center mb-4">
                <RocketIcon className="h-6 w-6 text-secondary mr-3" />
                <h2 className="text-xl font-bold font-display text-neutral-extradark">Future Skill Trends</h2>
            </div>
            {areTrendsLoading ? (
                <div className="space-y-4 animate-pulse">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-start gap-4"><div className="w-8 h-8 rounded-full bg-neutral-light/50 shrink-0"></div><div className="flex-grow space-y-2"><div className="h-4 bg-neutral-light/50 rounded"></div><div className="h-3 bg-neutral-light/50 rounded w-5/6"></div></div></div>
                    ))}
                </div>
            ) : (
                <div className="space-y-5">
                    {futureTrends.sort((a,b) => a.rank - b.rank).slice(0, 3).map(trend => (
                        <div key={trend.rank} className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary/10 text-secondary-dark font-bold flex items-center justify-center text-lg">{trend.rank}</div>
                            <div>
                                <h4 className="font-bold text-neutral-dark">{trend.skill}</h4>
                                <p className="text-sm text-neutral-medium">{trend.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </Card>
      </div>
    );

    const renderDetailView = () => (
        <div className="flex flex-col gap-8 animate-fade-in">
             <div>
                <Button variant="outline" onClick={() => setSelectedSkill(null)} className="!py-1.5 !px-3 text-sm mb-4">
                    &larr; Back to Overview
                </Button>
                <h2 className="text-2xl font-bold font-display text-neutral-extradark">Details for <span className="text-primary">{selectedSkill}</span></h2>
             </div>
            <div className="h-[150px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <defs><linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4F46E5" stopOpacity={0.4}/><stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/></linearGradient></defs>
                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748B' }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="mastery" stroke="#4F46E5" strokeWidth={2} fill="url(#trendGradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
            {isDetailLoading ? (
                <div className="text-center p-8">
                    <SparklesIcon className="h-12 w-12 text-primary mx-auto animate-pulse" />
                    <p className="text-neutral-dark font-semibold mt-4 text-lg">{detailLoadingMessage}</p>
                </div>
            ) : skillDetails && (
                <div className="space-y-6">
                    <div>
                        <h3 className="font-bold text-neutral-dark mb-2">Trend Analysis</h3>
                         <div className="space-y-3">
                            <div className="p-4 bg-primary/5 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <TrendingUpIcon className="w-5 h-5 text-primary-dark mt-0.5 shrink-0"/>
                                    <div>
                                        <h4 className="font-bold text-primary-dark text-sm">Summary</h4>
                                        <p className="text-neutral-dark text-sm leading-relaxed">{skillDetails.trendAnalysis.summary}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 bg-secondary/5 rounded-xl">
                                <div className="flex items-start gap-3">
                                    <EyeIcon className="w-5 h-5 text-secondary-dark mt-0.5 shrink-0"/>
                                    <div>
                                        <h4 className="font-bold text-secondary-dark text-sm">Key Observation</h4>
                                        <p className="text-neutral-dark text-sm leading-relaxed">{skillDetails.trendAnalysis.keyObservation}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h3 className="font-bold text-neutral-dark mb-2">Learning Recommendations</h3>
                        <div className="space-y-3">
                            {skillDetails.recommendations.map((rec, index) => <RecommendationItem key={index} rec={rec} />)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

  return (
    <>
      <style>{`
          @keyframes pulse { 0% { stroke-opacity: 1; transform: scale(1); } 50% { stroke-opacity: 0.2; transform: scale(1.1); } 100% { stroke-opacity: 1; transform: scale(1); } }
      `}</style>
        <header className="mb-8">
          <div className="flex items-center">
            <RadarIcon className="h-8 w-8 text-primary mr-3" />
            <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">My Skill Profile</h1>
          </div>
          <p className="text-lg text-neutral-medium mt-1">A visual breakdown of your strengths and areas for growth.</p>
        </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
              <Card padding="sm" className="h-full">
                <div style={{ width: '100%', height: 500 }} className="cursor-pointer">
                  <ResponsiveContainer>
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={combinedSkillData} onClick={handleSkillClick}>
                      <defs>
                        <linearGradient id="radarGradientUser" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.7}/>
                          <stop offset="95%" stopColor="#4338CA" stopOpacity={0.4}/>
                        </linearGradient>
                      </defs>
                      <PolarGrid stroke="#e0e0e0" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#334155', fontSize: 14, fontWeight: 500 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748B', fontSize: 12 }} />
                      <Radar
                        name="My Score"
                        dataKey="score"
                        stroke="#4338CA"
                        fill="url(#radarGradientUser)"
                        fillOpacity={0.8}
                        strokeWidth={2}
                      />
                       <Radar
                        name="Class Average"
                        dataKey="classAverage"
                        stroke="#64748B"
                        fill="#94A3B8"
                        fillOpacity={0.2}
                        strokeWidth={2}
                        strokeDasharray="4 4"
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }}/>
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
          </div>
          <aside className="lg:col-span-2">
            <Card className="h-full">
                {selectedSkill ? renderDetailView() : renderOverview()}
            </Card>
          </aside>
      </div>
    </>
  );
};

export default SkillRadarView;