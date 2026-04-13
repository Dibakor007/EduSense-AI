import React, { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { User, Result } from '../types';
import Card from './Card';
import Button from './Button';
import Confetti from './Confetti';
import { GiftIcon, LightbulbIcon, DumbbellIcon, SparklesIcon } from './icons';

interface RewardStoreViewProps {
    user: User;
    lastResult: Result | null;
    onSpendXp: (cost: number) => boolean;
    onBackToDashboard: () => void;
}

const rewards = [
    {
        id: 'ai_tip',
        title: 'AI Study Tip',
        description: 'Get a personalized study suggestion from AI based on your recent performance.',
        cost: 30,
        icon: <LightbulbIcon className="h-8 w-8" />,
        gradient: 'from-primary/80 to-secondary/80',
        type: 'ai_tip',
    },
    {
        id: 'premium_quiz',
        title: 'Premium Quiz',
        description: 'Unlock a special, extra-challenging quiz to test your mastery.',
        cost: 50,
        icon: <DumbbellIcon className="h-8 w-8" />,
        gradient: 'from-success/80 to-green-400/80',
        type: 'premium_quiz',
    },
    {
        id: 'surprise_box',
        title: 'Surprise Me!',
        description: "Spend a few coins and let the AI give you a random fun fact or a joke.",
        cost: 20,
        icon: <SparklesIcon className="h-8 w-8" />,
        gradient: 'from-warning/80 to-amber-400/80',
        type: 'surprise',
    }
];

const RewardStoreView: React.FC<RewardStoreViewProps> = ({ user, lastResult, onSpendXp, onBackToDashboard }) => {
    const [unlockedReward, setUnlockedReward] = useState<any | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showConfetti, setShowConfetti] = useState(false);

    const handleUnlock = async (reward: typeof rewards[0]) => {
        if ((user.xp ?? 0) < reward.cost) {
            alert("Not enough XP!");
            return;
        }

        const success = onSpendXp(reward.cost);
        if (!success) return;

        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3000);

        setIsLoading(true);
        setError('');
        setUnlockedReward(null);

        try {
            if (reward.type === 'ai_tip') {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const weakAreas = lastResult ? Object.entries(lastResult.skillBreakdown)
                    .filter(([, data]) => (data as { percentage: number }).percentage < 75)
                    .map(([topic]) => topic) : [];
                
                const prompt = `I am a student who recently struggled with these topics: ${weakAreas.join(', ')}. Give me one short, actionable study tip (2 sentences max) to help me improve in one of those areas.`;
                
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                setUnlockedReward({ ...reward, content: response.text });

            } else if (reward.type === 'surprise') {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
                const prompt = "Tell me a fun, one-sentence computer science fact or a short, clean, computer-science-themed joke.";
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                setUnlockedReward({ ...reward, content: response.text });
            } else {
                 setUnlockedReward({ ...reward, content: "You've unlocked a new set of challenging questions in the AI Quiz Generator!" });
            }
        } catch (e) {
            console.error(e);
            setError('Could not get reward from AI. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 sm:p-6 lg:p-8 animate-fade-in relative">
            {showConfetti && <Confetti />}
            <div className="max-w-4xl mx-auto">
                <header className="mb-8 text-center">
                    <div className="inline-block bg-gradient-to-r from-yellow-400/10 to-amber-500/10 p-4 rounded-full mb-4">
                        <GiftIcon className="h-10 w-10 text-yellow-500" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">Reward Store</h1>
                    <p className="text-lg text-neutral-medium mt-2 max-w-2xl mx-auto">Spend your hard-earned Learning Coins (XP) on awesome rewards!</p>
                </header>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {rewards.map(reward => (
                        <div key={reward.id} className="relative group">
                            <div className={`absolute -inset-0.5 bg-gradient-to-r ${reward.gradient} rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500`}></div>
                            <Card className="!p-0 h-full flex flex-col relative">
                                <div className={`p-8 flex-grow flex flex-col items-center text-center bg-gradient-to-br ${reward.gradient} rounded-t-2xl`}>
                                    <div className="text-white drop-shadow-lg">{reward.icon}</div>
                                    <h3 className="text-2xl font-bold font-display text-white mt-4 drop-shadow-md">{reward.title}</h3>
                                </div>
                                <div className="p-6 flex-grow flex flex-col">
                                    <p className="text-neutral-medium text-sm flex-grow">{reward.description}</p>
                                    <Button onClick={() => handleUnlock(reward)} disabled={(user.xp ?? 0) < reward.cost} className="w-full mt-4">
                                        Unlock for 💰 {reward.cost} XP
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {(isLoading || unlockedReward || error) && (
                    <Card className="mt-8">
                        <h3 className="text-xl font-bold font-display text-neutral-extradark text-center">Your Reward</h3>
                        {isLoading && <p className="text-center p-8 animate-pulse">Unlocking your reward...</p>}
                        {error && <p className="text-center p-8 text-danger-dark">{error}</p>}
                        {unlockedReward && (
                             <div className="text-center p-6 animate-fade-in">
                                <h4 className="text-2xl font-bold text-primary">{unlockedReward.title}</h4>
                                <p className="mt-4 text-lg text-neutral-dark leading-relaxed">{unlockedReward.content}</p>
                                <Button variant="outline" onClick={() => setUnlockedReward(null)} className="mt-6">Got it!</Button>
                            </div>
                        )}
                    </Card>
                )}

                <div className="text-center mt-12">
                    <Button onClick={onBackToDashboard} className="!px-8 !py-4">Back to Dashboard</Button>
                </div>
            </div>
        </div>
    );
};

export default RewardStoreView;
