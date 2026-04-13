import { aiService } from "./aiService";
import { UserLearningProfile } from "./userProfilingService";

export interface ContentUnit {
    id: string;
    title: string;
    topic: string;
    skill: string;
    difficulty: "beginner" | "intermediate" | "advanced" | "expert";
    bloomsLevel: "remember" | "understand" | "apply" | "analyze" | "evaluate" | "create";
    type: "video" | "article" | "interactive" | "practice" | "gamified";
    duration: number; // minutes
    prerequisites: string[]; // skill IDs
    concepts: string[]; // main concepts covered
    language: string;
    content: string; // actual content
    metadata: {
        source: "NCTB" | "Khan Academy" | "EdNet" | "Generated";
        createdAt: Date;
        updatedAt: Date;
        engagementScore: number; // 0-100
    };
}

export interface RAGQuery {
    studentProfile: UserLearningProfile;
    learningObjective: string;
    prerequisiteSkills?: string[];
    contentTypes?: ("video" | "article" | "interactive" | "practice" | "gamified")[];
    difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
}

export interface AdaptiveContentPlan {
    studentId: string;
    objective: string;
    contentSequence: ContentUnit[];
    estimatedDuration: number; // total minutes
    adaptationRationale: string;
    checkpoints: {
        afterContent: string;
        assessmentQuestions: number;
        successCriteria: number; // min % to proceed
    }[];
}

export class AdaptiveContentEngine {
    private contentDatabase: Map<string, ContentUnit> = new Map();
    private retrievalCache: Map<string, ContentUnit[]> = new Map();

    constructor() {
        this.initializeContentDatabase();
    }

    /**
     * Initialize content database with curriculum standards
     * In production, this would sync with NCTB, Khan Academy APIs
     */
    private initializeContentDatabase(): void {
        // Sample NCTB content structure (would be loaded from database)
        const nctbContent: ContentUnit[] = [
            {
                id: "NCTB_SSC_MATH_ALGEBRA_1",
                title: "Introduction to Algebra",
                topic: "Algebra",
                skill: "algebraic_fundamentals",
                difficulty: "beginner",
                bloomsLevel: "remember",
                type: "video",
                duration: 15,
                prerequisites: [],
                concepts: ["variables", "expressions", "equations"],
                language: "en",
                content: "Linear equations in one variable...",
                metadata: {
                    source: "NCTB",
                    createdAt: new Date("2024-01-01"),
                    updatedAt: new Date("2024-01-01"),
                    engagementScore: 85,
                },
            },
            {
                id: "NCTB_SSC_MATH_GEOMETRY_1",
                title: "Basic Geometry Concepts",
                topic: "Geometry",
                skill: "geometry_basics",
                difficulty: "beginner",
                bloomsLevel: "understand",
                type: "interactive",
                duration: 20,
                prerequisites: [],
                concepts: ["points", "lines", "shapes"],
                language: "en",
                content: "Interactive geometry explorer...",
                metadata: {
                    source: "NCTB",
                    createdAt: new Date("2024-01-01"),
                    updatedAt: new Date("2024-01-01"),
                    engagementScore: 88,
                },
            },
        ];

        // Store in database
        for (const unit of nctbContent) {
            this.contentDatabase.set(unit.id, unit);
        }
    }

    /**
     * Generate adaptive content plan for a student
     */
    async generateAdaptiveContentPlan(
        studentId: string,
        query: RAGQuery
    ): Promise<AdaptiveContentPlan> {
        const { studentProfile, learningObjective, contentTypes, difficulty } = query;

        // 1. Retrieve relevant content (RAG retrieval phase)
        const relevantContent = await this.retrieveRelevantContent({
            studentProfile,
            learningObjective,
            contentTypes: contentTypes || studentProfile.preferredContentType,
            difficulty:
                difficulty ||
                this.mapBloomsToContentDifficulty(studentProfile.bloomsLevel),
        });

        // 2. Rank content by student fit (RAG ranking)
        const rankedContent = this.rankContentByStudentFit(
            relevantContent,
            studentProfile
        );

        // 3. Build adaptive sequence respecting prerequisites and pacing
        const contentSequence = this.buildAdaptiveSequence(
            rankedContent,
            studentProfile
        );

        // 4. Generate personalized content (GAG augmentation phase)
        const enrichedContent = await this.generatePersonalizedContent(
            contentSequence,
            studentProfile
        );

        // 5. Create adaptive checkpoints
        const checkpoints = this.createAdaptiveCheckpoints(enrichedContent);

        return {
            studentId,
            objective: learningObjective,
            contentSequence: enrichedContent,
            estimatedDuration: enrichedContent.reduce((sum, c) => sum + c.duration, 0),
            adaptationRationale: this.generateAdaptationRationale(
                studentProfile,
                enrichedContent
            ),
            checkpoints,
        };
    }

    /**
     * RAG Retrieval: Find content matching learning objective and student fit
     */
    private async retrieveRelevantContent(query: {
        studentProfile: UserLearningProfile;
        learningObjective: string;
        contentTypes: string[];
        difficulty: string;
    }): Promise<ContentUnit[]> {
        const { studentProfile, learningObjective, contentTypes, difficulty } =
            query;

        // Check cache first
        const cacheKey = `${learningObjective}_${difficulty}`;
        if (this.retrievalCache.has(cacheKey)) {
            return this.retrievalCache.get(cacheKey)!;
        }

        // Semantic search: Find content by objective
        let results: ContentUnit[] = Array.from(this.contentDatabase.values()).filter(
            (content) => {
                // Match by topic/skill (semantic similarity)
                const topicMatch =
                    content.topic.toLowerCase().includes(learningObjective.toLowerCase()) ||
                    content.concepts.some((c) =>
                        c.toLowerCase().includes(learningObjective.toLowerCase())
                    );

                // Match by difficulty
                const difficultyMatch =
                    content.difficulty === difficulty ||
                    (difficulty === "beginner" && content.difficulty === "beginner") ||
                    (difficulty === "advanced" &&
                        ["advanced", "expert"].includes(content.difficulty));

                // Match by content type preference
                const typeMatch = contentTypes.length === 0 ||
                    contentTypes.includes(content.type);

                return topicMatch && difficultyMatch && typeMatch;
            }
        );

        // If no results, use generative retrieval (ask Gemini)
        if (results.length === 0) {
            results = await this.generativeRetrieval(learningObjective, difficulty);
        }

        // Cache results
        this.retrievalCache.set(cacheKey, results);

        return results;
    }

    /**
     * Generative Retrieval: Use Gemini to create missing content
     */
    private async generativeRetrieval(
        objective: string,
        difficulty: string
    ): Promise<ContentUnit[]> {
        const prompt = `Create 3 learning content units for: "${objective}" at ${difficulty} level.
Return as JSON array with: {id, title, concepts: string[], duration: number}`;

        try {
            const content = await aiService.generateJsonContent(prompt, {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: { type: "string" },
                        title: { type: "string" },
                        concepts: { type: "array", items: { type: "string" } },
                        duration: { type: "number" },
                    },
                },
            });

            // Convert to ContentUnit (simplified)
            return (content as any[]).map((item, idx) => ({
                id: item.id || `GEN_${Date.now()}_${idx}`,
                title: item.title,
                topic: objective,
                skill: objective.toLowerCase().replace(/\s/g, "_"),
                difficulty: difficulty as any,
                bloomsLevel: "understand" as any,
                type: "video" as any,
                duration: item.duration || 15,
                prerequisites: [],
                concepts: item.concepts || [],
                language: "en",
                content: `Generated content for ${item.title}`,
                metadata: {
                    source: "Generated" as any,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    engagementScore: 70,
                },
            }));
        } catch (error) {
            console.error("Generative retrieval failed:", error);
            return [];
        }
    }

    /**
     * Rank content units by fit to student profile
     */
    private rankContentByStudentFit(
        content: ContentUnit[],
        profile: UserLearningProfile
    ): ContentUnit[] {
        return content.sort((a, b) => {
            let scoreA = 0,
                scoreB = 0;

            // 1. Learning style match
            if (
                (profile.learningStyle === "visual" && a.type === "video") ||
                (profile.learningStyle === "kinesthetic" && a.type === "interactive") ||
                (profile.learningStyle === "auditory" && a.type === "video")
            )
                scoreA += 30;
            if (
                (profile.learningStyle === "visual" && b.type === "video") ||
                (profile.learningStyle === "kinesthetic" && b.type === "interactive") ||
                (profile.learningStyle === "auditory" && b.type === "video")
            )
                scoreB += 30;

            // 2. Bloom's level alignment
            if (a.bloomsLevel === profile.bloomsLevel) scoreA += 25;
            if (b.bloomsLevel === profile.bloomsLevel) scoreB += 25;

            // 3. Engagement score
            scoreA += a.metadata.engagementScore;
            scoreB += b.metadata.engagementScore;

            // 4. Duration fit (prefer shorter sessions for struggling students)
            if (profile.motivationLevel === "low" && a.duration < 20) scoreA += 15;
            if (profile.motivationLevel === "low" && b.duration < 20) scoreB += 15;

            return scoreB - scoreA;
        });
    }

    /**
     * Build adaptive sequence respecting prerequisites and pacing
     */
    private buildAdaptiveSequence(
        content: ContentUnit[],
        profile: UserLearningProfile
    ): ContentUnit[] {
        const sequence: ContentUnit[] = [];
        const completed = new Set<string>();

        // Start with foundational content
        for (const unit of content) {
            // Check prerequisites
            const preqMet = unit.prerequisites.length === 0 ||
                unit.prerequisites.every((p) =>
                    profile.masteredSkills.includes(p) || completed.has(p)
                );

            if (preqMet) {
                sequence.push(unit);
                completed.add(unit.id);

                // Limit sequence length based on cognitive load
                const maxItems = Math.ceil(profile.cognitiveLoad / 20); // 5-10 items
                if (sequence.length >= maxItems) break;
            }
        }

        return sequence;
    }

    /**
     * Generate personalized content for sequence
     */
    private async generatePersonalizedContent(
        sequence: ContentUnit[],
        profile: UserLearningProfile
    ): Promise<ContentUnit[]> {
        const personalized: ContentUnit[] = [];

        for (const unit of sequence) {
            const updatedUnit = { ...unit };

            // Personalize based on profile
            if (profile.accessibilityNeeds.length > 0) {
                updatedUnit.content += `\n\n[Accessibility: ${profile.accessibilityNeeds.join(", ")}]`;
            }

            if (profile.misconceptions.length > 0) {
                const relevantMisconceptions = profile.misconceptions.filter(
                    (m) => m.topic === unit.skill
                );
                if (relevantMisconceptions.length > 0) {
                    updatedUnit.content += `\n\n[Common misconceptions to avoid: ${relevantMisconceptions
                        .map((m) => m.misconception)
                        .join(", ")}]`;
                }
            }

            personalized.push(updatedUnit);
        }

        return personalized;
    }

    /**
     * Create adaptive checkpoints
     */
    private createAdaptiveCheckpoints(
        content: ContentUnit[]
    ): AdaptiveContentPlan["checkpoints"] {
        return content.map((unit) => ({
            afterContent: unit.id,
            assessmentQuestions: Math.ceil(unit.duration / 5), // ~1 question per 5 minutes
            successCriteria: unit.bloomsLevel === "remember" ? 70 : 80, // higher bar for complex skills
        }));
    }

    /**
     * Generate explanation for why this content was selected
     */
    private generateAdaptationRationale(
        profile: UserLearningProfile,
        content: ContentUnit[]
    ): string {
        const reasons: string[] = [];

        reasons.push(`Adapted for ${profile.learningStyle} learning style`);

        if (profile.bloomsLevel !== "remember") {
            reasons.push(
                `Includes content at ${profile.bloomsLevel} level (Bloom's Taxonomy)`
            );
        }

        if (profile.strugglingSkills.length > 0) {
            reasons.push(`Focuses on struggling areas: ${profile.strugglingSkills.slice(0, 2).join(", ")}`);
        }

        if (profile.misconceptions.length > 0) {
            reasons.push("Includes intervention for common misconceptions");
        }

        return reasons.join("; ");
    }

    /**
     * Map Bloom's level to content difficulty
     */
    private mapBloomsToContentDifficulty(
        bloomsLevel: string
    ): "beginner" | "intermediate" | "advanced" | "expert" {
        const mapping: Record<string, any> = {
            remember: "beginner",
            understand: "beginner",
            apply: "intermediate",
            analyze: "advanced",
            evaluate: "advanced",
            create: "expert",
        };
        return mapping[bloomsLevel] || "intermediate";
    }

    /**
     * Get next recommended content for student
     */
    async getNextContent(
        studentId: string,
        currentObjective: string,
        profile: UserLearningProfile
    ): Promise<ContentUnit | null> {
        const plan = await this.generateAdaptiveContentPlan(studentId, {
            studentProfile: profile,
            learningObjective: currentObjective,
        });

        return plan.contentSequence[0] || null;
    }

    /**
     * Add custom content to database
     */
    addCustomContent(content: ContentUnit): void {
        this.contentDatabase.set(content.id, content);
        // Invalidate cache
        this.retrievalCache.clear();
    }

    /**
     * Get content statistics
     */
    getContentStats(): {
        totalContent: number;
        byType: Record<string, number>;
        byDifficulty: Record<string, number>;
    } {
        const content = Array.from(this.contentDatabase.values());

        const byType: Record<string, number> = {};
        const byDifficulty: Record<string, number> = {};

        for (const unit of content) {
            byType[unit.type] = (byType[unit.type] || 0) + 1;
            byDifficulty[unit.difficulty] = (byDifficulty[unit.difficulty] || 0) + 1;
        }

        return {
            totalContent: content.length,
            byType,
            byDifficulty,
        };
    }
}

export const adaptiveContentEngine = new AdaptiveContentEngine();
