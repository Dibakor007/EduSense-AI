import React, { useState } from 'react';
import { Type } from "@google/genai";
import { generateJsonContent } from '../services/aiService';
import { LearningPlanTask, User } from '../types';
import Card from './Card';
import Button from './Button';
import { SparklesIcon, RocketIcon, SearchIcon, BookOpenIcon, PlayCircleIcon, DumbbellIcon } from './icons';

interface PersonalizedLearningPathViewProps {
  user: User;
}

const taskTypeGradients = {
    video: 'bg-gradient-to-br from-secondary to-cyan-400',
    read: 'bg-gradient-to-br from-primary to-indigo-400',
    practice: 'bg-gradient-to-br from-warning to-amber-400',
};

const taskTypeBorders = {
    video: 'border-secondary',
    read: 'border-primary',
    practice: 'border-warning-dark',
};

const taskIcons = {
    video: <PlayCircleIcon className="h-8 w-8 text-white" />,
    read: <BookOpenIcon className="h-8 w-8 text-white" />,
    practice: <DumbbellIcon className="h-8 w-8 text-white" />,
};

// --- Sub-components ---

const PlanGenerator: React.FC<{
    onGenerate: (topic: string) => void;
    error: string | null;
}> = ({ onGenerate, error }) => {
    const [topic, setTopic] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onGenerate(topic);
    };

    return (
        <Card className="text-center p-8">
            <h2 className="text-2xl font-bold font-display text-neutral-extradark">What do you want to learn?</h2>
            <p className="text-neutral-medium mt-2 mb-6">Enter any topic, and our AI will craft a personalized 7-day learning plan for you.</p>
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
                <div className="relative">
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., 'Data Structures' or 'Quantum Computing'"
                        className="w-full pl-12 pr-4 py-4 bg-white/60 backdrop-blur-xl border-2 border-white/20 rounded-2xl shadow-xl shadow-black/5 text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-medium">
                        <SearchIcon className="w-6 h-6" />
                    </div>
                </div>
                {error && <p className="text-danger text-sm mt-2">{error}</p>}
                <Button type="submit" className="mt-4 !px-8 !py-3">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    Generate Plan
                </Button>
            </form>
        </Card>
    );
};

const LearningPlan: React.FC<{
    topic: string;
    plan: LearningPlanTask[];
    onReset: () => void;
}> = ({ topic, plan, onReset }) => (
    <div className="space-y-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-center">Your 7-Day Plan for <span className="text-primary">{topic}</span></h2>
        {plan.map(task => (
            <Card key={task.day} className={`!p-0 border-l-8 ${taskTypeBorders[task.type as keyof typeof taskTypeBorders]}`}>
                <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-32 flex flex-col items-center justify-center text-center p-4 md:border-r border-b md:border-b-0 border-black/10">
                        <p className="text-sm font-semibold text-neutral-medium">DAY</p>
                        <p className="text-5xl font-display font-bold text-neutral-extradark">{task.day}</p>
                    </div>
                    <div className="flex-grow p-4 flex items-center">
                        <div className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 mr-4 text-white ${taskTypeGradients[task.type as keyof typeof taskTypeGradients]}`}>
                            {taskIcons[task.type as keyof typeof taskIcons]}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-primary">{task.topic}</p>
                            <h3 className="font-bold text-lg text-neutral-dark">{task.title}</h3>
                            <p className="text-sm text-neutral-medium mt-1">{task.description}</p>
                        </div>
                    </div>
                </div>
            </Card>
        ))}
        <div className="text-center mt-8">
            <Button variant="outline" onClick={onReset}>Create a New Plan</Button>
        </div>
    </div>
);


const PersonalizedLearningPathView: React.FC<PersonalizedLearningPathViewProps> = ({ user }) => {
    const [topic, setTopic] = useState('');
    const [learningPlan, setLearningPlan] = useState<LearningPlanTask[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGeneratePlan = async (selectedTopic: string) => {
        if (!selectedTopic.trim()) {
            setError('Please enter a topic to generate a plan.');
            return;
        }
        
        setTopic(selectedTopic);
        setIsLoading(true);
        setError(null);
        setLearningPlan([]);
        
        try {
            const schema = {
                type: Type.OBJECT,
                properties: {
                    plan: {
                        type: Type.ARRAY,
                        description: "A 7-day learning plan with one task per day.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                day: { type: Type.NUMBER },
                                title: { type: Type.STRING },
                                description: { type: Type.STRING },
                                type: { type: Type.STRING, enum: ['video', 'read', 'practice'] },
                                topic: { type: Type.STRING }
                            },
                            required: ["day", "title", "description", "type", "topic"]
                        }
                    }
                },
                required: ["plan"]
            };

            const prompt = `Create a personalized 7-day learning plan for a student at the ${user.educationLevel} level, focused on the topic "${selectedTopic}". Generate one task per day, varying the task type (video, read, practice). Each task should have a clear title, a brief description, and a relevant sub-topic related to the main topic "${selectedTopic}".`;
            
            const response = await generateJsonContent(prompt, schema);
            
            if (response && Array.isArray(response.plan)) {
                setLearningPlan(response.plan.sort((a: LearningPlanTask, b: LearningPlanTask) => a.day - b.day));
            } else {
                throw new Error("Invalid plan format received from AI.");
            }
        } catch (e) {
            console.error("Failed to generate learning plan:", e);
            setError("Sorry, we couldn't create a plan for that topic. It might be too broad or specific. Please try another topic.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleReset = () => {
        setTopic('');
        setLearningPlan([]);
        setError(null);
    };

    return (
        <>
            <header className="mb-8 text-center">
                <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-full mb-4">
                    <RocketIcon className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Personalized Learning Plan</h1>
                <p className="text-lg text-neutral-medium mt-2 max-w-2xl mx-auto">A custom week-long journey to boost your skills, crafted by AI on demand.</p>
            </header>

            <div className="max-w-4xl mx-auto">
                {isLoading ? (
                    <Card className="text-center p-12">
                        <SparklesIcon className="h-12 w-12 text-primary mx-auto animate-pulse" />
                        <p className="mt-4 text-lg font-semibold text-neutral-dark">Crafting your plan for "{topic}"...</p>
                        <p className="text-neutral-medium mt-1">This may take a moment.</p>
                    </Card>
                ) : learningPlan.length > 0 ? (
                    <LearningPlan topic={topic} plan={learningPlan} onReset={handleReset} />
                ) : (
                    <PlanGenerator onGenerate={handleGeneratePlan} error={error} />
                )}
            </div>
        </>
    );
};

export default PersonalizedLearningPathView;