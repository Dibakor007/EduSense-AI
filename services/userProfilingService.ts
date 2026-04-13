/**
 * User Profiling Engine
 * Extracts and maintains comprehensive learning profiles for each student
 * Used as foundation for all personalization decisions
 */

import { Result, User } from "../types";

export interface UserLearningProfile {
    userId: string;

    // Cognitive Profile
    bloomsLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
    learningStyle: "visual" | "auditory" | "reading-writing" | "kinesthetic";
    cognitiveLoad: number; // 0-100 (how much cognitive load they can handle)
    processingSpeed: "slow" | "normal" | "fast";

    // Performance Profile
    knowledgeState: Map<string, number>; // skill -> proficiency (0-1)
    learningVelocity: number; // improvement rate per day (0-1)
    masteredSkills: string[]; // skills at >70% proficiency
    strugglingSkills: string[]; // skills at <50% proficiency
    errorPatterns: {
        pattern: string;
        frequency: number;
        lastOccurrence: Date;
    }[];
    misconceptions: {
        topic: string;
        misconception: string;
        frequency: number;
        interventionApproach: string;
    }[];

    // Engagement Profile
    motivationLevel: "low" | "medium" | "high";
    engagementTrend: number; // -100 to +100 (declining to improving)
    preferredContentType: ("video" | "text" | "interactive" | "gamified")[];
    optimalTimeOfDay: string; // e.g., "morning", "afternoon", "evening"
    sessionDurationPreference: number; // minutes

    // Accessibility Profile
    accessibilityNeeds: string[]; // e.g., ["dyslexia_support", "screen_reader"]
    languagePreference: "en" | "bn" | "hi";
    connectionQuality: "offline" | "slow" | "normal" | "fast";

    // Demographic & Context
    socioeconomicContext: "low" | "middle" | "high";
    educationSystem: "NCTB" | "CBSE" | "ICSE" | "IGCSE" | "IB";
    culturalContext: string;

    // Metadata
    createdAt: Date;
    lastUpdatedAt: Date;
    totalInteractions: number;
    averageSessionDuration: number;
}

export class UserProfilingService {
    private profiles: Map<string, UserLearningProfile> = new Map();

    /**
     * Build or rebuild a user's complete learning profile
     */
    async buildUserProfile(userId: string, user: User, history: Result[]): Promise<UserLearningProfile> {
        // 1. Collect all user data
        const userData = {
            user,
            results: history,
            responses: this.extractResponsePatterns(history),
        };

        // 2. Extract cognitive profile
        const bloomsLevel = this.detectBloomsLevel(userData);
        const learningStyle = this.detectLearningStyle(userData);
        const processingSpeed = this.calculateProcessingSpeed(userData);

        // 3. Calculate knowledge state (Bayesian framework)
        const knowledgeState = this.calculateKnowledgeState(userData);

        // 4. Extract patterns
        const errorPatterns = this.identifyErrorPatterns(userData);
        const misconceptions = this.extractMisconceptions(userData);

        // 5. Calculate engagement metrics
        const motivationLevel = this.assessMotivation(userData);
        const engagementTrend = this.calculateEngagementTrend(userData);
        const learningVelocity = this.calculateLearningVelocity(userData);

        // 6. Get accessibility needs (from user profile or assessment)
        const accessibilityNeeds = this.detectAccessibilityNeeds(userData);

        // 7. Compile profile
        const profile: UserLearningProfile = {
            userId,
            bloomsLevel,
            learningStyle,
            cognitiveLoad: this.calculateCognitiveLoad(userData),
            processingSpeed,
            knowledgeState,
            learningVelocity,
            masteredSkills: Array.from(knowledgeState.entries())
                .filter(([_, prof]) => prof > 0.7)
                .map(([skill]) => skill),
            strugglingSkills: Array.from(knowledgeState.entries())
                .filter(([_, prof]) => prof < 0.5)
                .map(([skill]) => skill),
            errorPatterns,
            misconceptions,
            motivationLevel,
            engagementTrend,
            preferredContentType: this.detectContentPreferences(userData),
            optimalTimeOfDay: this.detectOptimalTime(userData),
            sessionDurationPreference: this.getSessionDuration(userData),
            accessibilityNeeds,
            languagePreference: (user.educationLevel?.includes("Bangla") ? "bn" : "en") as any,
            connectionQuality: "normal", // Should be detected from device
            socioeconomicContext: "middle", // Should be from registration data
            educationSystem: "NCTB",
            culturalContext: "Bangladesh",
            createdAt: new Date(),
            lastUpdatedAt: new Date(),
            totalInteractions: history.length,
            averageSessionDuration: this.calculateAvgSessionDuration(history),
        };

        // 8. Store profile
        this.profiles.set(userId, profile);

        return profile;
    }

    /**
     * Update profile based on new learning event
     */
    async updateProfileOnEvent(
        userId: string,
        event: "question_answered" | "video_watched" | "assessment_completed",
        data: any
    ): Promise<UserLearningProfile> {
        const profile = this.profiles.get(userId);
        if (!profile) throw new Error(`Profile not found for user ${userId}`);

        if (event === "question_answered") {
            // Update knowledge state using Bayesian inference
            const skill = data.question.topic;
            const isCorrect = data.isCorrect;

            const currentState = profile.knowledgeState.get(skill) || 0.5;
            const updatedState = this.bayesianUpdate(currentState, isCorrect);
            profile.knowledgeState.set(skill, updatedState);

            // Update error patterns
            if (!isCorrect) {
                this.recordErrorPattern(profile, data);
            }

            // Update learning velocity
            profile.learningVelocity = this.recalculateLearningVelocity(profile);
        }

        if (event === "assessment_completed") {
            profile.totalInteractions++;
            profile.engagementTrend = this.recalculateEngagementTrend(profile);
            profile.motivationLevel = this.reassessMotivation(profile);
        }

        profile.lastUpdatedAt = new Date();
        return profile;
    }

    /**
     * Detect student's learning style (VARK: Visual, Auditory, Reading, Kinesthetic)
     */
    private detectLearningStyle(data: any): UserLearningProfile["learningStyle"] {
        let scores = { visual: 0, auditory: 0, reading: 0, kinesthetic: 0 };

        // Analyze interaction patterns
        const results = data.results as Result[];
        for (const result of results) {
            // If completed quickly with interactive content, likely kinesthetic
            if (result.timeTaken < 5 && data.user.xp! > 100) scores.kinesthetic += 2;

            // If prefers text-based assessments, reading preference
            if (result.skillBreakdown) scores.reading += 1;
        }

        // Map to VARK
        const max = Math.max(...Object.values(scores));
        const style = Object.entries(scores).find(([_, v]) => v === max)?.[0];

        return (style as any) || "visual"; // default to visual
    }

    /**
     * Detect student's Bloom's level
     */
    private detectBloomsLevel(data: any): UserLearningProfile["bloomsLevel"] {
        const avgScore = data.user.stats.averageScore;

        if (avgScore < 40) return "remember";
        if (avgScore < 55) return "understand";
        if (avgScore < 70) return "apply";
        if (avgScore < 80) return "analyze";
        if (avgScore < 90) return "evaluate";
        return "create";
    }

    /**
     * Calculate processing speed (slow, normal, fast)
     */
    private calculateProcessingSpeed(data: any): UserLearningProfile["processingSpeed"] {
        const results = (data.results as Result[]).slice(-10); // last 10
        if (results.length === 0) return "normal";

        const avgTime = results.reduce((sum, r) => sum + r.timeTaken, 0) / results.length;

        // If avg time < 5 min per assessment, fast
        if (avgTime < 5) return "fast";
        // If avg time > 15 min, slow
        if (avgTime > 15) return "slow";
        return "normal";
    }

    /**
     * Calculate knowledge state for each skill using Bayesian inference
     */
    private calculateKnowledgeState(data: any): Map<string, number> {
        const states = new Map<string, number>();
        const results = (data.results as Result[]) || [];

        for (const result of results) {
            const qResults = result.questionResults || [];
            for (const qr of qResults) {
                const currentState = states.get(qr.questionId) || 0.5;
                const updatedState = this.bayesianUpdate(currentState, qr.isCorrect);
                states.set(qr.questionId, updatedState);
            }
        }

        return states;
    }

    /**
     * Bayesian update: P(knows | response) using Bayes' theorem
     */
    private bayesianUpdate(prior: number, isCorrect: boolean): number {
        // P(correct | knows) = 0.95, P(correct | doesn't know) = 0.2 (guessing)
        const pCorrectIfKnows = 0.95;
        const pCorrectIfDoesntKnow = 0.2;

        let likelihood;
        if (isCorrect) {
            likelihood = pCorrectIfKnows;
        } else {
            likelihood = 1 - pCorrectIfKnows;
        }

        // Apply Bayesian update
        const numerator = likelihood * prior;
        const denominator =
            likelihood * prior + (1 - likelihood) * (1 - prior);

        const posterior = numerator / denominator;
        return Math.min(Math.max(posterior, 0), 1); // clamp to [0, 1]
    }

    /**
     * Identify error patterns from student's mistakes
     */
    private identifyErrorPatterns(data: any): UserLearningProfile["errorPatterns"] {
        const patterns: UserLearningProfile["errorPatterns"] = [];
        const results = (data.results as Result[]) || [];

        const errorMap = new Map<string, number>();

        for (const result of results) {
            for (const qr of result.questionResults || []) {
                if (!qr.isCorrect) {
                    // Classify error type
                    const errorType = this.classifyError(qr.answer);
                    errorMap.set(errorType, (errorMap.get(errorType) || 0) + 1);
                }
            }
        }

        for (const [pattern, frequency] of errorMap.entries()) {
            if (frequency >= 2) {
                // Only include patterns that appear 2+ times
                patterns.push({
                    pattern,
                    frequency,
                    lastOccurrence: new Date(),
                });
            }
        }

        return patterns.sort((a, b) => b.frequency - a.frequency);
    }

    /**
     * Classify the type of error (sign error, procedural, conceptual)
     */
    private classifyError(answer: string): string {
        if (answer.startsWith("-") && !answer.includes("-")) return "sign_error";
        if (answer.includes("0")) return "arithmetic_error";
        if (answer.includes("?")) return "incomplete_answer";
        return "procedural_error";
    }

    /**
     * Extract misconceptions from wrong answers
     */
    private extractMisconceptions(data: any): UserLearningProfile["misconceptions"] {
        const misconceptions: UserLearningProfile["misconceptions"] = [];
        const results = (data.results as Result[]) || [];

        // Common misconceptions database
        const commonMisconceptions: Record<string, string> = {
            "1/2 + 1/3 = 2/5": "Adding fractions by adding numerators and denominators",
            "(a+b)² = a² + b²": "Not applying distributive property correctly",
            "a⁰ = 0": "Thinking any power of a is 0",
            "log(a+b) = log(a) + log(b)": "Log of sum is sum of logs (incorrect)",
        };

        for (const result of results) {
            for (const qr of result.questionResults || []) {
                if (!qr.isCorrect) {
                    for (const [misconceptText, description] of Object.entries(
                        commonMisconceptions
                    )) {
                        if (qr.answer.includes(misconceptText)) {
                            misconceptions.push({
                                topic: result.skillBreakdown?.[Object.keys(result.skillBreakdown)[0]]
                                    ? Object.keys(result.skillBreakdown)[0]
                                    : "general",
                                misconception: misconceptText,
                                frequency: 1,
                                interventionApproach: `Direct instruction on: ${description}`,
                            });
                        }
                    }
                }
            }
        }

        return misconceptions;
    }

    /**
     * Assess student's motivation level
     */
    private assessMotivation(data: any): UserLearningProfile["motivationLevel"] {
        const xp = data.user.xp || 0;
        const streak = data.user.streakDays || 0;

        if (xp < 50 && streak < 2) return "low";
        if (xp < 200 || streak < 5) return "medium";
        return "high";
    }

    /**
     * Calculate engagement trend (improving, stable, declining)
     */
    private calculateEngagementTrend(data: any): number {
        const results = (data.results as Result[]).slice(-10);
        if (results.length < 2) return 0;

        const firstHalf = results.slice(0, 5);
        const secondHalf = results.slice(-5);

        const avg1 = firstHalf.reduce((sum, r) => sum + r.percentage, 0) / firstHalf.length;
        const avg2 = secondHalf.reduce((sum, r) => sum + r.percentage, 0) / secondHalf.length;

        return avg2 - avg1; // positive = improving
    }

    /**
     * Calculate learning velocity (how fast they're improving)
     */
    private calculateLearningVelocity(data: any): number {
        const results = (data.results as Result[]);
        if (results.length < 2) return 0;

        const daysDiff =
            (new Date(results[results.length - 1].submittedAt).getTime() -
                new Date(results[0].submittedAt).getTime()) /
            (1000 * 60 * 60 * 24);

        if (daysDiff === 0) return 0;

        const scoreDiff = results[results.length - 1].percentage - results[0].percentage;
        return scoreDiff / daysDiff; // percentage points per day
    }

    /**
     * Bayesian update for engagement
     */
    private recalculateEngagementTrend(profile: UserLearningProfile): number {
        return profile.engagementTrend * 0.8; // exponential decay + new data
    }

    /**
     * Recalculate learning velocity
     */
    private recalculateLearningVelocity(profile: UserLearningProfile): number {
        return profile.learningVelocity * 0.9; // weight recent more
    }

    /**
     * Reassess motivation
     */
    private reassessMotivation(profile: UserLearningProfile): UserLearningProfile["motivationLevel"] {
        if (profile.engagementTrend < -10) return "low";
        if (profile.engagementTrend > 10) return "high";
        return "medium";
    }

    /**
     * Detect accessibility needs
     */
    private detectAccessibilityNeeds(data: any): string[] {
        return data.user.stats?.totalStudyTime < 100
            ? ["extended_time", "simplified_language"]
            : [];
    }

    /**
     * Calculate cognitive load (how much info they can process)
     */
    private calculateCognitiveLoad(data: any): number {
        const avgScore = data.user.stats.averageScore;
        return (avgScore / 100) * 100; // 0-100 scale
    }

    /**
     * Detect content preferences
     */
    private detectContentPreferences(data: any): UserLearningProfile["preferredContentType"][] {
        // Default preference order
        return ["video", "interactive", "gamified", "text"];
    }

    /**
     * Detect optimal time of day
     */
    private detectOptimalTime(data: any): string {
        // Default to morning (would need timestamp data for real detection)
        return "morning";
    }

    /**
     * Get preferred session duration
     */
    private getSessionDuration(data: any): number {
        return 30; // 30 minutes default
    }

    /**
     * Calculate average session duration
     */
    private calculateAvgSessionDuration(history: Result[]): number {
        if (history.length === 0) return 30;
        const totalTime = history.reduce((sum, r) => sum + r.timeTaken, 0);
        return totalTime / history.length;
    }

    /**
     * Record an error pattern
     */
    private recordErrorPattern(profile: UserLearningProfile, data: any): void {
        const errorType = this.classifyError(data.answer);
        const existingPattern = profile.errorPatterns.find((p) => p.pattern === errorType);

        if (existingPattern) {
            existingPattern.frequency++;
            existingPattern.lastOccurrence = new Date();
        } else {
            profile.errorPatterns.push({
                pattern: errorType,
                frequency: 1,
                lastOccurrence: new Date(),
            });
        }
    }

    /**
     * Extract response patterns from results
     */
    private extractResponsePatterns(results: Result[]): any {
        return results.reduce(
            (acc, r) => {
                acc.totalAttempts += 1;
                acc.totalCorrect += r.questionResults?.filter((qr) => qr.isCorrect).length || 0;
                return acc;
            },
            { totalAttempts: 0, totalCorrect: 0 }
        );
    }

    /**
     * Get stored profile for a user
     */
    async getUserProfile(userId: string): Promise<UserLearningProfile | null> {
        return this.profiles.get(userId) || null;
    }

    /**
     * Predict what topic student will struggle with next
     */
    async predictNextFailure(userId: string): Promise<{
        topic: string;
        failureProbability: number;
        daysUntilFailure: number;
    } | null> {
        const profile = this.profiles.get(userId);
        if (!profile) return null;

        // Find skill with lowest mastery
        const lowestSkill = Array.from(profile.knowledgeState.entries())
            .sort(([_, a], [__, b]) => a - b)[0];

        if (!lowestSkill) return null;

        const failureProbability = 1 - lowestSkill[1]; // 1 - mastery = failure probability
        const daysUntilFailure = Math.max(1, Math.round(1 / profile.learningVelocity || 1)); // days to reach mastery

        return {
            topic: lowestSkill[0],
            failureProbability: Math.min(failureProbability, 0.99),
            daysUntilFailure,
        };
    }
}

export const userProfilingService = new UserProfilingService();
