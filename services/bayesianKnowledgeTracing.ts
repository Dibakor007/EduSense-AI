/**
 * Bayesian Knowledge Tracing (BKT)
 * Probabilistic model to track and predict student knowledge over time
 * Industry-standard approach used by Carnegie Learning, ALEKS, etc.
 */

export interface BKTState {
    skillId: string;

    // Core BKT parameters
    pInit: number; // P(initially know), typically 0.1
    pTransition: number; // P(learn | didn't know), typically 0.3
    pCorrect: number; // P(correct answer | know), typically 0.95
    pGuess: number; // P(correct answer | don't know), typically 0.2

    // Latent state
    pKnown: number; // Current probability student knows skill (0-1)

    // Metadata
    attempts: number;
    correctCount: number;
    lastUpdated: Date;
}

export interface KnowledgeTraceResult {
    skillId: string;
    previousKnowledge: number;
    updatedKnowledge: number;
    confidence: number; // how certain about this estimate (0-1)
    predictedNextCorrectProb: number; // probability of getting next question right
    recommendedAction: "master" | "practice" | "prereq" | "intervention";
}

export class BayesianKnowledgeTracing {
    private skillStates: Map<string, BKTState> = new Map();

    // Default BKT parameters (can be optimized per skill/population)
    private defaultParams = {
        pInit: 0.1, // 10% chance student knows skill initially
        pTransition: 0.3, // 30% chance to learn from one correct attempt
        pCorrect: 0.95, // 95% chance to answer correctly if they know
        pGuess: 0.2, // 20% chance to guess correctly
    };

    /**
     * Initialize a skill for knowledge tracing
     */
    initializeSkill(
        skillId: string,
        pInit?: number,
        pTransition?: number,
        pCorrect?: number,
        pGuess?: number
    ): BKTState {
        const state: BKTState = {
            skillId,
            pInit: pInit ?? this.defaultParams.pInit,
            pTransition: pTransition ?? this.defaultParams.pTransition,
            pCorrect: pCorrect ?? this.defaultParams.pCorrect,
            pGuess: pGuess ?? this.defaultParams.pGuess,
            pKnown: pInit ?? this.defaultParams.pInit,
            attempts: 0,
            correctCount: 0,
            lastUpdated: new Date(),
        };

        this.skillStates.set(skillId, state);
        return state;
    }

    /**
     * Core BKT update: Update knowledge probability based on observation
     * Uses Bayes' theorem: P(knows | observation) ∝ P(observation | knows) * P(knows)
     */
    updateKnowledge(skillId: string, isCorrect: boolean): KnowledgeTraceResult {
        let state = this.skillStates.get(skillId);

        if (!state) {
            // Auto-initialize if not exists
            state = this.initializeSkill(skillId);
        }

        const previousKnowledge = state.pKnown;

        // 1. Calculate probability of this observation under each hypothesis
        // P(correct | knows) = pCorrect, P(correct | doesn't know) = pGuess
        const pObservationIfKnows = isCorrect ? state.pCorrect : 1 - state.pCorrect;
        const pObservationIfDoesntKnow = isCorrect ? state.pGuess : 1 - state.pGuess;

        // 2. Apply Bayes' theorem
        const pKnowsGivenObservation = this.bayesUpdate(
            state.pKnown,
            pObservationIfKnows,
            pObservationIfDoesntKnow
        );

        // 3. Apply state transition: did they learn?
        // If they don't know but got it right, they might have learned
        // P(knows_t+1) = P(knows_t) + (1 - P(knows_t)) * pTransition
        state.pKnown =
            pKnowsGivenObservation +
            (1 - pKnowsGivenObservation) * state.pTransition;

        // 4. Update statistics
        state.attempts += 1;
        if (isCorrect) state.correctCount += 1;
        state.lastUpdated = new Date();

        // 5. Predict next attempt probability
        // P(correct_next) = pKnown * pCorrect + (1 - pKnown) * pGuess
        const predictedNextCorrectProb =
            state.pKnown * state.pCorrect + (1 - state.pKnown) * state.pGuess;

        // 6. Determine recommended action
        const recommendedAction = this.determineAction(
            state.pKnown,
            state.attempts,
            isCorrect
        );

        // 7. Calculate confidence in estimate
        const confidence = this.calculateConfidence(state.attempts);

        this.skillStates.set(skillId, state);

        return {
            skillId,
            previousKnowledge,
            updatedKnowledge: state.pKnown,
            confidence,
            predictedNextCorrectProb,
            recommendedAction,
        };
    }

    /**
     * Bayesian update formula
     * P(knows | obs) = P(obs | knows) * P(knows) / P(obs)
     */
    private bayesUpdate(
        prior: number,
        pObsIfKnows: number,
        pObsIfDoesntKnow: number
    ): number {
        const numerator = pObsIfKnows * prior;
        const denominator = pObsIfKnows * prior + pObsIfDoesntKnow * (1 - prior);

        if (denominator === 0) return prior;
        return Math.min(Math.max(numerator / denominator, 0), 1); // clamp [0,1]
    }

    /**
     * Determine recommended action based on knowledge state
     */
    private determineAction(
        pKnown: number,
        attempts: number,
        lastCorrect: boolean
    ): "master" | "practice" | "prereq" | "intervention" {
        // Already mastered?
        if (pKnown > 0.85 && attempts >= 3) return "master";

        // Struggling (wrong despite attempts)?
        if (attempts > 5 && !lastCorrect) return "intervention";

        // Need prerequisites?
        if (attempts >= 2 && pKnown < 0.3) return "prereq";

        // Keep practicing
        return "practice";
    }

    /**
     * Calculate confidence in knowledge estimate
     * More attempts = higher confidence
     */
    private calculateConfidence(attempts: number): number {
        // Confidence increases with attempts, levels off at 10+
        return Math.min(attempts / 10, 0.95);
    }

    /**
     * Get current knowledge state
     */
    getKnowledgeState(skillId: string): BKTState | null {
        return this.skillStates.get(skillId) || null;
    }

    /**
     * Batch update: process multiple question responses at once
     */
    batchUpdate(
        responses: Array<{ skillId: string; isCorrect: boolean }>
    ): KnowledgeTraceResult[] {
        return responses.map((r) => this.updateKnowledge(r.skillId, r.isCorrect));
    }

    /**
     * Predict probability of correct answer on next attempt
     */
    predictNextAttempt(skillId: string): number {
        const state = this.skillStates.get(skillId);
        if (!state) return this.defaultParams.pGuess;

        // P(correct) = P(knows) * P(correct | knows) + P(doesn't know) * P(guess)
        return (
            state.pKnown * state.pCorrect + (1 - state.pKnown) * state.pGuess
        );
    }

    /**
     * Estimate time until mastery (>85% probability)
     * Uses learning rate to predict future progress
     */
    estimateTimeToMastery(skillId: string, attemptsPerDay: number = 1): number {
        const state = this.skillStates.get(skillId);
        if (!state) return 7; // default 1 week

        if (state.pKnown > 0.85) return 0; // already mastered

        // Remaining probability to learn
        const pRemaining = 0.85 - state.pKnown;

        // Expected attempts to reach 85%
        // Each attempt adds pTransition probability (if they don't already know)
        const expectedAttempts = Math.ceil(pRemaining / state.pTransition);

        return Math.ceil(expectedAttempts / attemptsPerDay);
    }

    /**
     * Get knowledge progression for visualization
     */
    getKnowledgeProgression(skillId: string): {
        attempts: number;
        pKnown: number;
        masteryPercentage: number;
    } {
        const state = this.skillStates.get(skillId);
        if (!state) return { attempts: 0, pKnown: 0, masteryPercentage: 0 };

        return {
            attempts: state.attempts,
            pKnown: state.pKnown,
            masteryPercentage: Math.round(state.pKnown * 100),
        };
    }

    /**
     * Get knowledge state for all skills (for dashboard)
     */
    getAllKnowledgeStates(): Record<
        string,
        {
            skillId: string;
            mastery: number;
            attempts: number;
            status: string;
        }
    > {
        const result: Record<string, any> = {};

        for (const [skillId, state] of this.skillStates.entries()) {
            let status = "Learning";
            if (state.pKnown > 0.85) status = "Mastered";
            else if (state.attempts > 5 && state.pKnown < 0.3) status = "Struggling";
            else if (state.attempts > 3) status = "Practicing";

            result[skillId] = {
                skillId,
                mastery: Math.round(state.pKnown * 100),
                attempts: state.attempts,
                status,
            };
        }

        return result;
    }

    /**
     * Reset skill knowledge (student wants to retry)
     */
    resetSkill(skillId: string): void {
        const state = this.skillStates.get(skillId);
        if (state) {
            state.pKnown = state.pInit;
            state.attempts = 0;
            state.correctCount = 0;
            state.lastUpdated = new Date();
        }
    }

    /**
     * Export/Import skill states (for persistence)
     */
    exportStates(): string {
        const data: Record<string, BKTState> = {};
        for (const [skillId, state] of this.skillStates.entries()) {
            data[skillId] = state;
        }
        return JSON.stringify(data);
    }

    importStates(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);
            for (const [skillId, state] of Object.entries(data)) {
                this.skillStates.set(skillId, state as BKTState);
            }
        } catch (error) {
            console.error("Failed to import BKT states:", error);
        }
    }

    /**
     * Clear all skill states
     */
    clearStates(): void {
        this.skillStates.clear();
    }

    /**
     * Get statistics across all tracked skills
     */
    getGlobalStatistics(): {
        totalSkillsTracked: number;
        averageMastery: number;
        masteredCount: number;
        strugglingCount: number;
        totalAttempts: number;
    } {
        const states = Array.from(this.skillStates.values());

        if (states.length === 0) {
            return {
                totalSkillsTracked: 0,
                averageMastery: 0,
                masteredCount: 0,
                strugglingCount: 0,
                totalAttempts: 0,
            };
        }

        const averageMastery = states.reduce((sum, s) => sum + s.pKnown, 0) / states.length;
        const masteredCount = states.filter((s) => s.pKnown > 0.85).length;
        const strugglingCount = states.filter((s) => s.attempts > 5 && s.pKnown < 0.3)
            .length;
        const totalAttempts = states.reduce((sum, s) => sum + s.attempts, 0);

        return {
            totalSkillsTracked: states.length,
            averageMastery,
            masteredCount,
            strugglingCount,
            totalAttempts,
        };
    }

    /**
     * Compare two time periods to see learning progress
     */
    getProgressBetweenDates(
        skillId: string,
        startDate: Date,
        endDate: Date
    ): { startMastery: number; endMastery: number; improvement: number } {
        // In production, this would query historical data
        // For now, return current state
        const state = this.skillStates.get(skillId);
        if (!state) {
            return { startMastery: 0, endMastery: 0, improvement: 0 };
        }

        return {
            startMastery: Math.max(0, state.pKnown - 0.1), // estimate
            endMastery: state.pKnown,
            improvement: 0.1,
        };
    }
}

export const bayesianKnowledgeTracing = new BayesianKnowledgeTracing();
