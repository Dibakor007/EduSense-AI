/**
 * Multi-Agent Reasoning System
 * Coordinates multiple specialized AI agents for different learning aspects
 * Each agent specializes in a domain and communicates through a central controller
 */

import { aiService } from "./aiService";

export interface Agent {
    id: string;
    name: string;
    expertise: string;
    role: "content" | "assessment" | "feedback" | "motivation" | "socratic";
    systemPrompt: string;
    contextWindow: number; // max tokens to consider
}

export interface AgentRequest {
    agentId: string;
    query: string;
    context: Record<string, any>;
    priority: "low" | "medium" | "high";
}

export interface AgentResponse {
    agentId: string;
    response: string;
    confidence: number; // 0-1
    reasoning: string;
    followUpQuestions?: string[];
}

export interface CoordinationResult {
    agentResponses: AgentResponse[];
    synthesized: string;
    recommendedAction: string;
    reasoning: string;
    timestamp: Date;
}

export class MultiAgentController {
    private agents: Map<string, Agent> = new Map();
    private agentConversationHistory: Map<string, string[]> = new Map();
    private coordinationHistory: CoordinationResult[] = [];

    constructor() {
        this.initializeAgents();
    }

    /**
     * Initialize specialized agents
     */
    private initializeAgents(): void {
        const agents: Agent[] = [
            {
                id: "content_agent",
                name: "Content Expert",
                expertise: "Curriculum knowledge, content generation, prerequisite identification",
                role: "content",
                systemPrompt: `You are an expert curriculum specialist with deep knowledge of educational standards (NCTB, CBSE, IB). 
Your role is to provide accurate content, identify misconceptions, and ensure pedagogically sound explanations.
Always consider the student's current knowledge level and learning style.`,
                contextWindow: 8000,
            },
            {
                id: "assessment_agent",
                name: "Assessment Designer",
                expertise: "Question generation, difficulty calibration, assessment design",
                role: "assessment",
                systemPrompt: `You are an expert in assessment design and educational measurement.
Your role is to generate appropriate questions, calibrate difficulty, and align with learning objectives.
Consider Bloom's taxonomy and item response theory in your recommendations.`,
                contextWindow: 6000,
            },
            {
                id: "feedback_agent",
                name: "Feedback Coach",
                expertise: "Constructive feedback, motivation, student support",
                role: "feedback",
                systemPrompt: `You are an empathetic coach specialized in providing constructive, encouraging feedback.
Your role is to help students understand their mistakes, build confidence, and set realistic goals.
Always maintain a supportive, growth-mindset tone.`,
                contextWindow: 5000,
            },
            {
                id: "motivation_agent",
                name: "Motivation Specialist",
                expertise: "Student engagement, motivation psychology, gamification",
                role: "motivation",
                systemPrompt: `You are a motivation psychologist specializing in student engagement.
Your role is to identify motivation barriers, suggest engagement strategies, and design personalized incentives.
Consider intrinsic and extrinsic motivation factors.`,
                contextWindow: 5000,
            },
            {
                id: "socratic_agent",
                name: "Socratic Tutor",
                expertise: "Guided discovery learning, questioning techniques, meta-cognition",
                role: "socratic",
                systemPrompt: `You are a Socratic tutor who guides students to discover answers through strategic questioning.
Your role is to ask thought-provoking questions that lead to deeper understanding.
Never directly give answers; instead, guide the student's thinking process.`,
                contextWindow: 4000,
            },
        ];

        for (const agent of agents) {
            this.agents.set(agent.id, agent);
            this.agentConversationHistory.set(agent.id, []);
        }
    }

    /**
     * Request a response from a specific agent
     */
    async askAgent(request: AgentRequest): Promise<AgentResponse> {
        const agent = this.agents.get(request.agentId);
        if (!agent) throw new Error(`Agent not found: ${request.agentId}`);

        // Build context with conversation history
        const history = this.agentConversationHistory.get(request.agentId) || [];
        const contextStr = this.buildContext(request.context, history);

        // Build full prompt with system prompt + context + query
        const fullPrompt = `${agent.systemPrompt}

CONTEXT:
${contextStr}

CURRENT REQUEST:
${request.query}

Provide a thoughtful, specific response. Include your reasoning.`;

        try {
            const response = await aiService.generateTextContent(fullPrompt);

            // Parse structured response
            const structured = this.parseAgentResponse(response, agent.id);

            // Update conversation history
            history.push(`Q: ${request.query}\nA: ${response}`);
            if (history.length > 10) history.shift(); // keep last 10 exchanges
            this.agentConversationHistory.set(request.agentId, history);

            return structured;
        } catch (error) {
            console.error(`Agent ${agent.id} failed:`, error);
            throw error;
        }
    }

    /**
     * Coordinate multiple agents for complex decisions
     */
    async coordinateAgents(
        query: string,
        context: Record<string, any>,
        agentIds?: string[]
    ): Promise<CoordinationResult> {
        const targetAgents = agentIds || Array.from(this.agents.keys());

        // 1. Gather responses from all agents
        const responses: AgentResponse[] = [];
        for (const agentId of targetAgents) {
            try {
                const response = await this.askAgent({
                    agentId,
                    query,
                    context,
                    priority: "high",
                });
                responses.push(response);
            } catch (error) {
                console.error(`Failed to get response from ${agentId}:`, error);
            }
        }

        // 2. Synthesize agent responses
        const synthesized = await this.synthesizeResponses(responses, context);

        // 3. Determine recommended action
        const recommendedAction = this.determineAction(responses, context);

        // 4. Generate reasoning
        const reasoning = this.generateReasoning(responses, synthesized);

        const result: CoordinationResult = {
            agentResponses: responses,
            synthesized,
            recommendedAction,
            reasoning,
            timestamp: new Date(),
        };

        this.coordinationHistory.push(result);
        return result;
    }

    /**
     * Synthesize responses from multiple agents into coherent output
     */
    private async synthesizeResponses(
        responses: AgentResponse[],
        context: Record<string, any>
    ): Promise<string> {
        const agentInputs = responses
            .map((r) => `${r.agentId}: ${r.response}`)
            .join("\n\n");

        const synthesisPrompt = `You are a master coordinator synthesizing input from multiple specialized agents.
Your role is to integrate their perspectives into a cohesive, actionable recommendation.

Agent Responses:
${agentInputs}

Context:
${JSON.stringify(context, null, 2)}

Provide a synthesized summary that:
1. Integrates the best insights from each agent
2. Identifies any conflicting recommendations
3. Provides a unified perspective on the issue`;

        try {
            return await aiService.generateTextContent(synthesisPrompt);
        } catch {
            return "Synthesis unavailable due to technical issues.";
        }
    }

    /**
     * Determine recommended action based on agent consensus
     */
    private determineAction(
        responses: AgentResponse[],
        context: Record<string, any>
    ): string {
        // Extract recommendations from agent responses
        const recommendations = responses
            .map((r) => r.followUpQuestions?.[0] || "")
            .filter((r) => r.length > 0);

        if (recommendations.length > 0) {
            return recommendations[0]; // return most common recommendation
        }

        // Fallback based on context
        if (context.studentPerformance && context.studentPerformance < 50) {
            return "Provide remedial support and prerequisite review";
        }

        if (context.engagementLevel && context.engagementLevel < 30) {
            return "Increase motivation through gamification and personalized challenges";
        }

        return "Continue current learning pathway with monitoring";
    }

    /**
     * Generate reasoning for coordination decision
     */
    private generateReasoning(responses: AgentResponse[], synthesized: string): string {
        const avgConfidence = responses.reduce((sum, r) => sum + r.confidence, 0) / responses.length;
        const confidenceLevel =
            avgConfidence > 0.8 ? "high" : avgConfidence > 0.6 ? "moderate" : "low";

        return `Coordination based on ${responses.length} agent perspectives with ${confidenceLevel} confidence. ${responses.length > 2 ? "Multiple perspectives converged on the recommendation." : "Limited agent input processed."
            }`;
    }

    /**
     * Build context string for agent prompt
     */
    private buildContext(context: Record<string, any>, history: string[]): string {
        let contextStr = JSON.stringify(context, null, 2);

        if (history.length > 0) {
            contextStr += "\n\nRecent Conversation History:\n";
            contextStr += history.slice(-3).join("\n---\n");
        }

        return contextStr;
    }

    /**
     * Parse agent response into structured format
     */
    private parseAgentResponse(response: string, agentId: string): AgentResponse {
        // Extract confidence if present (format: [confidence: 0.85])
        const confidenceMatch = response.match(/\[confidence:\s*([\d.]+)\]/);
        const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.75;

        // Extract reasoning if present
        const reasoningMatch = response.match(/Reasoning:(.*?)(?:\n\n|$)/is);
        const reasoning = reasoningMatch ? reasoningMatch[1].trim() : response.substring(0, 100);

        // Try to extract follow-up questions
        const followUpQuestions = this.extractQuestions(response);

        return {
            agentId,
            response,
            confidence: Math.min(confidence, 1),
            reasoning,
            followUpQuestions,
        };
    }

    /**
     * Extract questions from text
     */
    private extractQuestions(text: string): string[] {
        const questions: string[] = [];
        const lines = text.split("\n");

        for (const line of lines) {
            if (line.includes("?") && line.length > 10 && line.length < 200) {
                // Looks like a question
                questions.push(line.replace(/^[\s\*\-\d+\.]+/, "").trim());
            }
        }

        return questions.slice(0, 3); // return up to 3 questions
    }

    /**
     * Get coordination history
     */
    getCoordinationHistory(agentId?: string): CoordinationResult[] {
        if (!agentId) return this.coordinationHistory;

        return this.coordinationHistory.filter((result) =>
            result.agentResponses.some((r) => r.agentId === agentId)
        );
    }

    /**
     * Clear conversation history for an agent
     */
    clearAgentHistory(agentId: string): void {
        this.agentConversationHistory.set(agentId, []);
    }

    /**
     * Get available agents
     */
    getAgents(): Agent[] {
        return Array.from(this.agents.values());
    }

    /**
     * Get agent by ID
     */
    getAgent(agentId: string): Agent | null {
        return this.agents.get(agentId) || null;
    }

    /**
     * Multi-agent learning session coordinator
     * Orchestrates a full learning session with agent coordination
     */
    async orchestrateLearningSession(
        studentId: string,
        learningObjective: string,
        studentContext: {
            currentProficiency: number;
            learningStyle: string;
            motivationLevel: string;
        }
    ): Promise<{
        contentPlan: string;
        assessmentPlan: string;
        motivationStrategy: string;
        tutorGuidance: string;
    }> {
        const context = { studentId, ...studentContext };

        // Coordinate agents to create learning plan
        const result = await this.coordinateAgents(
            `Design a learning session for: ${learningObjective}`,
            context,
            ["content_agent", "assessment_agent", "socratic_agent", "motivation_agent"]
        );

        return {
            contentPlan: await this.askContentAgent(learningObjective, studentContext),
            assessmentPlan: await this.askAssessmentAgent(learningObjective, studentContext),
            motivationStrategy: await this.askMotivationAgent(studentContext),
            tutorGuidance: await this.askSocraticAgent(learningObjective, studentContext),
        };
    }

    /**
     * Convenience methods for asking specific agents
     */
    private async askContentAgent(objective: string, context: any): Promise<string> {
        const response = await this.askAgent({
            agentId: "content_agent",
            query: `Create a content plan for: ${objective}`,
            context,
            priority: "high",
        });
        return response.response;
    }

    private async askAssessmentAgent(objective: string, context: any): Promise<string> {
        const response = await this.askAgent({
            agentId: "assessment_agent",
            query: `Design assessment for: ${objective}`,
            context,
            priority: "high",
        });
        return response.response;
    }

    private async askMotivationAgent(context: any): Promise<string> {
        const response = await this.askAgent({
            agentId: "motivation_agent",
            query: "Generate motivation strategy",
            context,
            priority: "medium",
        });
        return response.response;
    }

    private async askSocraticAgent(objective: string, context: any): Promise<string> {
        const response = await this.askAgent({
            agentId: "socratic_agent",
            query: `Guide student on: ${objective} using Socratic method`,
            context,
            priority: "high",
        });
        return response.response;
    }
}

export const multiAgentController = new MultiAgentController();
