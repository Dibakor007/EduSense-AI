
import React, { useState, useEffect } from 'react';
import { Type } from "@google/genai";
import { generateJsonContent } from '../services/aiService';
import { RealLifeApplication } from '../types';
import { mockStudentSkills } from '../data';
import Card from './Card';
import Button from './Button';
import { GlobeIcon, SparklesIcon, BriefcaseIcon, GamepadIcon, RocketIcon, DollarSignIcon, HeartPulseIcon, CodeIcon, ShieldIcon, TargetIcon, BrainCircuitIcon, LightbulbIcon, SearchIcon } from './icons';
import ProgressBar from './ProgressBar';

interface RealLifeAppContextViewProps {
  onBackToDashboard: () => void;
}

const iconMap: { [key: string]: React.ReactNode } = {
    GamepadIcon: <GamepadIcon className="h-8 w-8 text-white" />,
    RocketIcon: <RocketIcon className="h-8 w-8 text-white" />,
    DollarSignIcon: <DollarSignIcon className="h-8 w-8 text-white" />,
    HeartPulseIcon: <HeartPulseIcon className="h-8 w-8 text-white" />,
    CodeIcon: <CodeIcon className="h-8 w-8 text-white" />,
    ShieldIcon: <ShieldIcon className="h-8 w-8 text-white" />,
    BriefcaseIcon: <BriefcaseIcon className="h-8 w-8 text-white" />,
    Default: <GlobeIcon className="h-8 w-8 text-white" />,
};

const getLoadingMessages = (topic: string) => [
    `Analyzing "${topic}"...`,
    "Finding real-world connections...",
    "Discovering career paths...",
    "Creating a mini-challenge...",
    "Bringing it all together..."
];


const RealLifeAppContextView: React.FC<RealLifeAppContextViewProps> = ({ onBackToDashboard }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSearchTopic, setActiveSearchTopic] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedContent, setGeneratedContent] = useState<RealLifeApplication | null>(null);
    const [showHint, setShowHint] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');

    useEffect(() => {
        if (isLoading && activeSearchTopic) {
            const messages = getLoadingMessages(activeSearchTopic);
            setLoadingMessage(messages[0]);
            const interval = setInterval(() => {
                setLoadingMessage(prev => {
                    const currentIndex = messages.indexOf(prev);
                    return messages[(currentIndex + 1) % messages.length];
                });
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [isLoading, activeSearchTopic]);

    const skills = mockStudentSkills;

    const handleGenerateContext = async (topic: string) => {
        if (!topic.trim()) return;

        setActiveSearchTopic(topic);
        setIsLoading(true);
        setError(null);
        setGeneratedContent(null);
        setShowHint(false);

        try {
            const schema = {
                type: Type.OBJECT,
                properties: {
                    useCases: {
                        type: Type.ARRAY,
                        description: "3 diverse, real-world use cases for the skill.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: { type: Type.STRING },
                                description: { type: Type.STRING, description: "A one-sentence explanation." },
                                icon: { type: Type.STRING, description: "The most relevant icon name from: GamepadIcon, RocketIcon, DollarSignIcon, HeartPulseIcon, CodeIcon, ShieldIcon, BriefcaseIcon." }
                            },
                            required: ["title", "description", "icon"],
                        }
                    },
                    interactiveZone: {
                        type: Type.OBJECT,
                        properties: {
                            miniChallenge: { type: Type.STRING, description: "A short, practical problem-solving task." },
                            solutionHint: { type: Type.STRING, description: "A one-sentence hint to solve the challenge." }
                        },
                        required: ["miniChallenge", "solutionHint"],
                    },
                    realityCheck: {
                        type: Type.OBJECT,
                        properties: {
                            careerConnections: {
                                type: Type.ARRAY,
                                description: "2 distinct career roles where this skill is crucial.",
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        role: { type: Type.STRING, description: "The job title." },
                                        application: { type: Type.STRING, description: "How the skill is used in this role." }
                                    },
                                    required: ["role", "application"]
                                }
                            }
                        },
                        required: ["careerConnections"],
                    }
                },
                required: ["useCases", "interactiveZone", "realityCheck"],
            };
            
            const prompt = `You are an expert career advisor and computer science educator. For the topic "${topic}", generate a set of real-life applications. The content should be inspiring and practical.
            - Use Cases: Generate 3 diverse and interesting real-world use cases. For each, provide a title, a concise one-sentence description, and select the most fitting icon name from this list: GamepadIcon, RocketIcon, DollarSignIcon, HeartPulseIcon, CodeIcon, ShieldIcon, BriefcaseIcon.
            - Interactive Zone: Create a short, practical mini-challenge (1-2 sentences) that requires applying the skill. Also provide a one-sentence hint for the solution.
            - Reality Check: List 2 distinct career roles where this skill is crucial. For each role, briefly explain its real-world application.`;

            const data = await generateJsonContent(prompt, schema);
            setGeneratedContent(data);

        } catch (e) {
            console.error("Error generating real-life context:", e);
            setError("Sorry, we couldn't generate the real-world context for this skill. Please try another one.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleGenerateContext(searchQuery);
    };

    const handleSelectSkill = (skillSubject: string) => {
        setSearchQuery(skillSubject);
        handleGenerateContext(skillSubject);
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <div className="inline-block bg-gradient-to-r from-secondary/10 to-cyan-400/10 p-4 rounded-full mb-4">
                        <GlobeIcon className="h-10 w-10 text-secondary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Real-Life Application Mode</h1>
                    <p className="text-lg text-neutral-medium mt-2 max-w-3xl mx-auto">Discover how your skills power the real world. Select a learned skill or search for any topic to see it in action.</p>
                </header>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Panel: Skill Selection */}
                    <aside className="lg:w-1/3">
                        <Card>
                            <h2 className="text-xl font-bold font-display text-neutral-extradark mb-4">Your Learned Skills</h2>
                            <div className="space-y-3">
                                {skills.map(skill => (
                                    <button 
                                        key={skill.subject}
                                        onClick={() => handleSelectSkill(skill.subject)}
                                        className={`w-full text-left p-3 rounded-xl transition-all duration-200 border-2 ${activeSearchTopic === skill.subject ? 'bg-secondary/10 border-secondary' : 'bg-white/50 border-transparent hover:border-secondary/50'}`}
                                    >
                                        <p className={`font-bold ${activeSearchTopic === skill.subject ? 'text-secondary-dark' : 'text-neutral-dark'}`}>{skill.subject}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <ProgressBar value={skill.score} max={100} className="h-1.5" barStyle={{backgroundColor: '#4f46e5'}} />
                                            <span className="text-xs font-semibold text-primary">{skill.score}%</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </Card>
                    </aside>

                    {/* Right Panel: Content Display */}
                    <main className="lg:w-2/3">
                        <form onSubmit={handleSearchSubmit} className="mb-6">
                            <div className="relative">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search for any skill or topic (e.g., 'Blockchain')"
                                    className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-xl shadow-black/5 text-neutral-dark focus:outline-none focus:ring-2 focus:ring-secondary"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium">
                                    <SearchIcon className="w-6 h-6" />
                                </div>
                            </div>
                        </form>

                        <Card className="min-h-[60vh] flex flex-col">
                            {!activeSearchTopic ? (
                                <div className="m-auto text-center">
                                    <GlobeIcon className="h-16 w-16 text-neutral-light mx-auto" />
                                    <p className="mt-4 text-neutral-medium font-semibold">Select a skill or search above to begin exploring.</p>
                                </div>
                            ) : isLoading ? (
                                <div className="m-auto text-center">
                                    <SparklesIcon className="h-16 w-16 text-secondary mx-auto animate-pulse" />
                                    <p className="mt-4 text-secondary-dark font-semibold">{loadingMessage}</p>
                                </div>
                            ) : error ? (
                                <div className="m-auto text-center p-8">
                                    <p className="text-danger-dark font-semibold">{error}</p>
                                </div>
                            ) : generatedContent && (
                                <div className="animate-fade-in space-y-8">
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <BrainCircuitIcon className="h-7 w-7 text-primary mr-3" />
                                            <h2 className="text-2xl font-bold font-display text-neutral-extradark">Real-World Use Cases</h2>
                                        </div>
                                        <div className="space-y-4">
                                            {generatedContent.useCases.map((useCase, index) => (
                                                <div key={index} className="flex items-start gap-4 p-4 bg-white/50 rounded-xl border border-neutral-light/30">
                                                    <div className="w-16 h-16 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br from-secondary to-cyan-400 shadow-md">
                                                        {iconMap[useCase.icon] || iconMap.Default}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-neutral-dark text-lg">{useCase.title}</h4>
                                                        <p className="text-sm text-neutral-medium mt-1">{useCase.description}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center mb-4">
                                            <TargetIcon className="h-7 w-7 text-primary mr-3" />
                                            <h2 className="text-2xl font-bold font-display text-neutral-extradark">Interactive Zone</h2>
                                        </div>
                                        <Card className="!p-6 bg-gradient-to-br from-primary/5 to-secondary/5">
                                            <h4 className="font-bold text-primary-dark">Mini-Challenge</h4>
                                            <p className="text-neutral-dark my-2">{generatedContent.interactiveZone.miniChallenge}</p>
                                            <Button variant="outline" onClick={() => setShowHint(!showHint)} className="!text-sm !py-1 !px-3">
                                                {showHint ? 'Hide Hint' : 'Show Hint'}
                                            </Button>
                                            {showHint && (
                                                <div className="mt-3 p-3 bg-yellow-400/10 border-l-4 border-warning rounded-r-md animate-fade-in">
                                                    <p className="text-sm text-yellow-700 flex items-center"><LightbulbIcon className="h-4 w-4 mr-2"/> {generatedContent.interactiveZone.solutionHint}</p>
                                                </div>
                                            )}
                                        </Card>
                                    </div>

                                    <div>
                                        <div className="flex items-center mb-4">
                                            <BriefcaseIcon className="h-7 w-7 text-primary mr-3" />
                                            <h2 className="text-2xl font-bold font-display text-neutral-extradark">Career Connections</h2>
                                        </div>
                                         <Card className="!p-6">
                                            <div className="space-y-4">
                                                {generatedContent.realityCheck.careerConnections.map((career, index) => (
                                                    <div key={index}>
                                                        <h4 className="font-bold text-lg text-primary-dark">{career.role}</h4>
                                                        <p className="text-neutral-dark mt-1">{career.application}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            )}
                        </Card>
                    </main>
                </div>
                
                <div className="text-center mt-12">
                    <Button onClick={onBackToDashboard} className="!px-8 !py-4">Back to Dashboard</Button>
                </div>
            </div>
        </div>
    );
};

export default RealLifeAppContextView;
