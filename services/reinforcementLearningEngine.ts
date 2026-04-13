/**
 * Reinforcement Learning Engine
 * Continuously improves content recommendations and learning strategies
 * using student feedback signals (implicit and explicit)
 */

export interface LearningAction {
    actionId: string;
    type: "content" | "difficulty" | "strategy" | "timing";
    contentId: string;
    reward: number; // how well this action worked
    studentResponse: "positive" | "neutral" | "negative";
    context: {
        studentProficiency: number;
        learningStyle: string;
        motivationLevel: string;
        timeOfDay: string;
    };
    timestamp: Date;
}

export interface Policy {
    policyId: string;
    description: string;
    stateSpace: string; // student profile characteristics
    actionSpace: string; // possible content/strategy options
    valueEstimates: Map<string, number>; // state-action -> expected reward
    epsilon: number; // exploration rate (0-1)
    alpha: number; // learning rate
    gamma: number; // discount factor
    version: number;
}

export interface ReinforcementLearningResult {
    recommendedAction: string;
    expectedReward: number; // expected learning outcome (0-1)
    explorationProbability: number; // probability of trying new strategy
    reasoningChain: string;
}

export class ReinforcementLearningEngine {
    private policies: Map<string, Policy> = new Map();
    private actionHistory: LearningAction[] = [];
    private qTable: Map<string, Map<string, number>> = new Map(); // state -> action -> Q-value
    private rewardHistory: Map<string, number[]> = new Map(); // for performance tracking

    constructor() {
        this.initializePolicies();
    }

    /**
     * Initialize learning policies
     */
    private initializePolicies(): void {
        // Content Selection Policy
        const contentPolicy: Policy = {
            policyId: "content_selection",
            description: "Optimizes which type of content to present",
            stateSpace: "student proficiency, learning style, motivation",
            actionSpace: "video, article, interactive, practice, gamified",
            valueEstimates: new Map(),
            epsilon: 0.15, // 15% exploration
            alpha: 0.1, // learning rate
            gamma: 0.9, // discount factor
            version: 1,
        };

        // Difficulty Progression Policy
        const difficultyPolicy: Policy = {
            policyId: "difficulty_progression",
            description: "Determines appropriate difficulty level",
            stateSpace: "current mastery, recent performance, engagement",
            actionSpace: "decrease, maintain, increase",
            valueEstimates: new Map(),
            epsilon: 0.1,
            alpha: 0.15,
            gamma: 0.95,
            version: 1,
        };

        // Learning Strategy Policy
        const strategyPolicy: Policy = {
            policyId: "learning_strategy",
            description: "Selects optimal learning strategy",
            stateSpace: "knowledge state, time available, learning pace",
            actionSpace: "spaced_repetition, active_recall, interleaving, elaboration",
            valueEstimates: new Map(),
            epsilon: 0.2,
            alpha: 0.12,
            gamma: 0.9,
            version: 1,
        };

        // Timing Policy
        const timingPolicy: Policy = {
            policyId: "timing_optimization",
            description: "Optimizes when to present content",
            stateSpace: "time of day, student availability, fatigue level",
            actionSpace: "immediate, after_break, morning, afternoon, evening",
            valueEstimates: new Map(),
            epsilon: 0.1,
            alpha: 0.08,
            gamma: 0.85,
            version: 1,
        };

        this.policies.set(contentPolicy.policyId, contentPolicy);
        this.policies.set(difficultyPolicy.policyId, difficultyPolicy);
        this.policies.set(strategyPolicy.policyId, strategyPolicy);
        this.policies.set(timingPolicy.policyId, timingPolicy);
    }

    /**
     * Select action using epsilon-greedy strategy
     * Balances exploitation (best known action) vs exploration (new actions)
     */
    async selectAction(
        policyId: string,
        state: string,
        possibleActions: string[]
    ): Promise<ReinforcementLearningResult> {
        const policy = this.policies.get(policyId);
        if (!policy) throw new Error(`Policy not found: ${policyId}`);

        // Epsilon-greedy: with epsilon probability, explore; otherwise exploit
        const shouldExplore = Math.random() < policy.epsilon;

        let selectedAction: string;
        let expectedReward: number;

        if (shouldExplore) {
            // Exploration: choose random action
            selectedAction = possibleActions[Math.floor(Math.random() * possibleActions.length)];
            expectedReward = 0.5; // neutral expectation
        } else {
            // Exploitation: choose best-known action
            const qValues = this.getQValues(policyId, state, possibleActions);
            const bestAction = this.selectBestAction(qValues);
            selectedAction = bestAction;
            expectedReward = this.getQValue(policyId, state, selectedAction);
        }

        const reasoning = this.generateReasoning(
            policyId,
            state,
            selectedAction,
            shouldExplore
        );

        return {
            recommendedAction: selectedAction,
            expectedReward: Math.max(0, Math.min(expectedReward, 1)), // clamp to [0,1]
            explorationProbability: policy.epsilon,
            reasoningChain: reasoning,
        };
    }

    /**
     * Observe reward and update Q-values
     * Core Q-Learning update: Q(s,a) = Q(s,a) + α[r + γ*max(Q(s',a')) - Q(s,a)]
     */
    async observeReward(
        action: LearningAction,
        newState: string,
        possibleNextActions: string[]
    ): Promise<void> {
        // Calculate reward signal
        const rewardSignal = this.calculateReward(action);

        // Get policy for this action type
        const policyId = this.getPolicyForAction(action.type);
        const policy = this.policies.get(policyId);

        if (!policy) return;

        // Get current Q-value
        const currentState = this.buildStateRepresentation(action.context);
        const currentQ = this.getQValue(policyId, currentState, action.contentId);

        // Calculate max Q-value for next state
        const nextQValues = this.getQValues(
            policyId,
            newState,
            possibleNextActions
        );
        const maxNextQ = Math.max(...Object.values(nextQValues));

        // Q-Learning update formula
        const updatedQ =
            currentQ + policy.alpha * (rewardSignal + policy.gamma * maxNextQ - currentQ);

        // Store updated Q-value
        this.setQValue(policyId, currentState, action.contentId, updatedQ);

        // Record action
        this.actionHistory.push(action);

        // Update reward history
        if (!this.rewardHistory.has(policyId)) {
            this.rewardHistory.set(policyId, []);
        }
        this.rewardHistory.get(policyId)!.push(rewardSignal);

        // Decay exploration rate over time
        if (this.actionHistory.length % 100 === 0) {
            this.decayExploration(policyId);
        }
    }

    /**
     * Calculate reward signal from implicit and explicit feedback
     */
    private calculateReward(action: LearningAction): number {
        let reward = 0;

        // Explicit feedback from student response
        if (action.studentResponse === "positive") reward += 0.8;
        else if (action.studentResponse === "neutral") reward += 0.4;
        else if (action.studentResponse === "negative") reward -= 0.3;

        // Implicit feedback from engagement
        // (would also include: time spent, completion, correctness, etc.)
        reward += Math.random() * 0.2; // stochastic component

        return Math.max(0, Math.min(reward, 1)); // clamp to [0,1]
    }

    /**
     * Get Q-values for all possible actions in a state
     */
    private getQValues(
        policyId: string,
        state: string,
        actions: string[]
    ): Record<string, number> {
        const qValues: Record<string, number> = {};

        for (const action of actions) {
            qValues[action] = this.getQValue(policyId, state, action);
        }

        return qValues;
    }

    /**
     * Get Q-value for specific state-action pair
     */
    private getQValue(policyId: string, state: string, action: string): number {
        if (!this.qTable.has(policyId)) {
            this.qTable.set(policyId, new Map());
        }

        const policyQTable = this.qTable.get(policyId)!;
        const stateKey = `${state}_${action}`;

        return policyQTable.get(stateKey) ?? 0.5; // default to neutral value
    }

    /**
     * Set Q-value for state-action pair
     */
    private setQValue(
        policyId: string,
        state: string,
        action: string,
        value: number
    ): void {
        if (!this.qTable.has(policyId)) {
            this.qTable.set(policyId, new Map());
        }

        const policyQTable = this.qTable.get(policyId)!;
        const stateKey = `${state}_${action}`;

        policyQTable.set(stateKey, Math.max(0, Math.min(value, 1)));
    }

    /**
     * Select best action from Q-values
     */
    private selectBestAction(qValues: Record<string, number>): string {
        let bestAction = Object.keys(qValues)[0];
        let bestValue = qValues[bestAction];

        for (const [action, value] of Object.entries(qValues)) {
            if (value > bestValue) {
                bestValue = value;
                bestAction = action;
            }
        }

        return bestAction;
    }

    /**
     * Build state representation from context
     */
    private buildStateRepresentation(context: {
        studentProficiency: number;
        learningStyle: string;
        motivationLevel: string;
        timeOfDay: string;
    }): string {
        // Discretize continuous values
        const profBucket =
            context.studentProficiency < 0.33
                ? "low"
                : context.studentProficiency < 0.67
                    ? "mid"
                    : "high";

        return `${profBucket}_${context.learningStyle}_${context.motivationLevel}_${context.timeOfDay}`;
    }

    /**
     * Get policy ID for action type
     */
    private getPolicyForAction(actionType: string): string {
        const mapping: Record<string, string> = {
            content: "content_selection",
            difficulty: "difficulty_progression",
            strategy: "learning_strategy",
            timing: "timing_optimization",
        };
        return mapping[actionType] || "content_selection";
    }

    /**
     * Decay exploration rate over time (start with exploration, move to exploitation)
     */
    private decayExploration(policyId: string): void {
        const policy = this.policies.get(policyId);
        if (policy) {
            policy.epsilon = Math.max(policy.epsilon * 0.99, 0.01); // decay but keep minimum
        }
    }

    /**
     * Generate reasoning for action selection
     */
    private generateReasoning(
        policyId: string,
        state: string,
        action: string,
        isExploration: boolean
    ): string {
        const policy = this.policies.get(policyId);
        if (!policy) return "";

        const mode = isExploration ? "Exploration" : "Exploitation";
        const qValue = this.getQValue(policyId, state, action);

        return `${mode}: Selected "${action}" for policy "${policyId}". Expected outcome: ${(qValue * 100).toFixed(0)}% success. State: ${state}`;
    }

    /**
     * Analyze learning trajectory
     */
    analyzeTrajectory(policyId: string): {
        averageReward: number;
        convergence: "diverging" | "converging" | "converged";
        recommendedAdjustment: string;
    } {
        const rewards = this.rewardHistory.get(policyId) || [];

        if (rewards.length === 0) {
            return {
                averageReward: 0,
                convergence: "diverging",
                recommendedAdjustment: "Insufficient data",
            };
        }

        const averageReward = rewards.reduce((a, b) => a + b) / rewards.length;

        // Check convergence trend
        const recent = rewards.slice(-20);
        const older = rewards.slice(-40, -20);
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;
        const trend = recentAvg - olderAvg;

        let convergence: "diverging" | "converging" | "converged";
        if (Math.abs(trend) < 0.02) convergence = "converged";
        else if (trend > 0) convergence = "converging";
        else convergence = "diverging";

        let recommendedAdjustment = "";
        if (averageReward < 0.4)
            recommendedAdjustment = "Increase exploration to find better strategies";
        else if (averageReward > 0.8)
            recommendedAdjustment = "Decrease exploration - good policy converged";
        else recommendedAdjustment = "Current policy performing adequately";

        return { averageReward, convergence, recommendedAdjustment };
    }

    /**
     * Export/import policies for persistence
     */
    exportPolicies(): string {
        const data = {
            policies: Array.from(this.policies.values()),
            qTable: Array.from(this.qTable.entries()).map(([k, v]) => [
                k,
                Array.from(v.entries()),
            ]),
            rewardHistory: Array.from(this.rewardHistory.entries()),
        };
        return JSON.stringify(data);
    }

    importPolicies(jsonData: string): void {
        try {
            const data = JSON.parse(jsonData);

            // Import policies
            for (const policy of data.policies) {
                this.policies.set(policy.policyId, policy);
            }

            // Import Q-table
            for (const [policyId, entries] of data.qTable) {
                this.qTable.set(policyId, new Map(entries));
            }

            // Import reward history
            for (const [policyId, rewards] of data.rewardHistory) {
                this.rewardHistory.set(policyId, rewards);
            }

            console.log("Policies imported successfully");
        } catch (error) {
            console.error("Failed to import policies:", error);
        }
    }

    /**
     * Get policy performance
     */
    getPolicyPerformance(): Record<string, any> {
        const performance: Record<string, any> = {};

        for (const [policyId, rewards] of this.rewardHistory.entries()) {
            if (rewards.length > 0) {
                performance[policyId] = {
                    averageReward: rewards.reduce((a, b) => a + b) / rewards.length,
                    maxReward: Math.max(...rewards),
                    minReward: Math.min(...rewards),
                    sampleCount: rewards.length,
                    trend: rewards.slice(-5).reduce((a, b) => a + b) / 5,
                };
            }
        }

        return performance;
    }

    /**
     * Get all tracked policies
     */
    getPolicies(): Policy[] {
        return Array.from(this.policies.values());
    }

    /**
     * Reset all Q-values
     */
    resetQTable(): void {
        this.qTable.clear();
        this.rewardHistory.clear();
        console.log("Q-table reset");
    }
}

export const reinforcementLearningEngine = new ReinforcementLearningEngine();
