/**
 * Teacher Co-Pilot
 * AI assistant that helps teachers automate lesson planning, grading, and student insights
 * Generates personalized lesson plans, feedback, and identifies at-risk students
 */

import { Result, User } from "../types";
import { aiService } from "./aiService";

export interface LessonPlan {
    id: string;
    title: string;
    subject: string;
    topic: string;
    gradeLevel: string;
    duration: number; // minutes
    objectives: string[]; // learning objectives
    activities: LessonActivity[];
    materials: string[];
    assessment: {
        type: "formative" | "summative";
        questions: number;
        timeAllocation: number;
    };
    alignedCurriculum: string; // NCTB, CBSE, etc
    differentiation: {
        forStruggling: string;
        forAdvanced: string;
    };
    generatedAt: Date;
}

export interface LessonActivity {
    id: string;
    type: "introduction" | "exploration" | "explanation" | "practice" | "closure";
    description: string;
    duration: number; // minutes
    materials: string[];
    bloomsLevel: string;
}

export interface StudentInsight {
    studentId: string;
    studentName: string;
    riskLevel: "low" | "medium" | "high";
    keyMetrics: {
        averageScore: number;
        attendanceRate: number;
        engagementLevel: number; // 0-100
        participationScore: number; // 0-100
    };
    strugglingAreas: {
        skill: string;
        proficiency: number; // 0-100
        recommendedAction: string;
    }[];
    strengths: string[];
    recommendations: string[];
    suggestedIntervention?: string;
}

export interface FeedbackSuggestion {
    studentName: string;
    submissionType: "assignment" | "test" | "project";
    feedback: {
        positive: string[]; // what they did well
        areas: string[]; // areas for improvement
        actionItems: string[]; // specific next steps
    };
    rubricScore: {
        category: string;
        score: number;
        outOf: number;
    }[];
    sentimentTone: "encouraging" | "neutral" | "challenging";
}

export class TeacherCoPilot {
    private lessonPlans: Map<string, LessonPlan> = new Map();
    private studentInsights: Map<string, StudentInsight> = new Map();
    private feedbackHistory: FeedbackSuggestion[] = [];

    /**
     * Generate a lesson plan based on subject, topic, and grade level
     */
    async generateLessonPlan(
        subject: string,
        topic: string,
        gradeLevel: string,
        duration: number,
        studentCount?: number,
        strugglingStudents?: number
    ): Promise<LessonPlan> {
        const prompt = `Create a detailed lesson plan for:
Subject: ${subject}
Topic: ${topic}
Grade Level: ${gradeLevel}
Duration: ${duration} minutes
Students: ${studentCount || 30}
Struggling Students: ${strugglingStudents || 0}

Generate in JSON format with:
- objectives (array of 3-4 learning objectives)
- activities (array of lesson activities with type, description, duration)
- materials (list of required materials)
- assessment (formative assessment plan)
- differentiation (for struggling and advanced students)

Align with NCTB curriculum standards.`;

        try {
            const planData = await aiService.generateJsonContent(prompt, {
                type: "object",
                properties: {
                    objectives: { type: "array", items: { type: "string" } },
                    activities: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                type: { type: "string" },
                                description: { type: "string" },
                                duration: { type: "number" },
                                bloomsLevel: { type: "string" },
                            },
                        },
                    },
                    materials: { type: "array", items: { type: "string" } },
                    assessment: {
                        type: "object",
                        properties: {
                            type: { type: "string" },
                            questions: { type: "number" },
                        },
                    },
                    differentiation: {
                        type: "object",
                        properties: {
                            forStruggling: { type: "string" },
                            forAdvanced: { type: "string" },
                        },
                    },
                },
            });

            // Convert activities to LessonActivity objects
            const activities: LessonActivity[] = (planData as any).activities.map(
                (a: any, idx: number) => ({
                    id: `activity_${idx}`,
                    type: a.type,
                    description: a.description,
                    duration: a.duration,
                    materials: a.materials || [],
                    bloomsLevel: a.bloomsLevel || "apply",
                })
            );

            const lessonPlan: LessonPlan = {
                id: `plan_${Date.now()}`,
                title: `${topic} - ${gradeLevel}`,
                subject,
                topic,
                gradeLevel,
                duration,
                objectives: (planData as any).objectives,
                activities,
                materials: (planData as any).materials,
                assessment: {
                    type: (planData as any).assessment.type,
                    questions: (planData as any).assessment.questions,
                    timeAllocation: Math.round(duration * 0.2), // 20% of time
                },
                alignedCurriculum: "NCTB",
                differentiation: (planData as any).differentiation,
                generatedAt: new Date(),
            };

            this.lessonPlans.set(lessonPlan.id, lessonPlan);
            return lessonPlan;
        } catch (error) {
            console.error("Failed to generate lesson plan:", error);
            throw error;
        }
    }

    /**
     * Generate automated feedback for student submission
     */
    async generateFeedback(
        studentName: string,
        submission: string,
        rubric?: { category: string; maxPoints: number }[],
        sentimentTone: "encouraging" | "neutral" | "challenging" = "encouraging"
    ): Promise<FeedbackSuggestion> {
        const prompt = `Provide constructive feedback for a student submission.

Student Name: ${studentName}
Submission: ${submission}

Tone: ${sentimentTone}

Generate feedback in JSON format with:
- positive (array of 2-3 things done well)
- areas (array of 2-3 areas for improvement)
- actionItems (array of 2-3 specific next steps)

Be specific, actionable, and encouraging.`;

        try {
            const feedbackData = await aiService.generateJsonContent(prompt, {
                type: "object",
                properties: {
                    positive: { type: "array", items: { type: "string" } },
                    areas: { type: "array", items: { type: "string" } },
                    actionItems: { type: "array", items: { type: "string" } },
                },
            });

            // Calculate rubric scores if provided
            const rubricScore = rubric
                ? rubric.map((r) => ({
                    category: r.category,
                    score: Math.random() * r.maxPoints, // in production, score based on submission
                    outOf: r.maxPoints,
                }))
                : [];

            const suggestion: FeedbackSuggestion = {
                studentName,
                submissionType: "assignment",
                feedback: feedbackData as any,
                rubricScore,
                sentimentTone,
            };

            this.feedbackHistory.push(suggestion);
            return suggestion;
        } catch (error) {
            console.error("Failed to generate feedback:", error);
            throw error;
        }
    }

    /**
     * Generate student insights and intervention recommendations
     */
    async generateStudentInsight(
        student: User,
        results: Result[],
        attendanceData?: { present: number; total: number }
    ): Promise<StudentInsight> {
        // Calculate key metrics
        const averageScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
            : 0;

        const attendanceRate = attendanceData
            ? (attendanceData.present / attendanceData.total) * 100
            : 100;

        const engagementLevel = this.calculateEngagement(student, results);

        // Identify struggling areas
        const strugglingAreas = this.identifyStrugglingAreas(results);

        // Determine risk level
        const riskLevel = this.assessStudentRisk(averageScore, engagementLevel, strugglingAreas.length);

        // Generate recommendations
        const recommendations = await this.generateRecommendations(
            student.name,
            strugglingAreas,
            averageScore,
            engagementLevel
        );

        const insight: StudentInsight = {
            studentId: student.id,
            studentName: student.name,
            riskLevel,
            keyMetrics: {
                averageScore,
                attendanceRate,
                engagementLevel,
                participationScore: student.stats.totalStudyTime / 60, // rough estimate
            },
            strugglingAreas,
            strengths: this.identifyStrengths(results),
            recommendations,
            suggestedIntervention:
                riskLevel === "high" ? this.getInterventionStrategy(student, strugglingAreas) : undefined,
        };

        this.studentInsights.set(student.id, insight);
        return insight;
    }

    /**
     * Get insights for entire class
     */
    async getClassInsights(
        students: User[],
        allResults: Map<string, Result[]>
    ): Promise<{
        classMetrics: {
            averageScore: number;
            engagementLevel: number;
            attendanceRate: number;
        };
        studentInsights: StudentInsight[];
        atRiskStudents: StudentInsight[];
        recommendations: string[];
    }> {
        const insights: StudentInsight[] = [];
        const atRiskStudents: StudentInsight[] = [];

        for (const student of students) {
            const results = allResults.get(student.id) || [];
            const insight = await this.generateStudentInsight(student, results);
            insights.push(insight);

            if (insight.riskLevel === "high") {
                atRiskStudents.push(insight);
            }
        }

        // Calculate class metrics
        const classMetrics = {
            averageScore:
                insights.reduce((sum, i) => sum + i.keyMetrics.averageScore, 0) / insights.length,
            engagementLevel:
                insights.reduce((sum, i) => sum + i.keyMetrics.engagementLevel, 0) / insights.length,
            attendanceRate:
                insights.reduce((sum, i) => sum + i.keyMetrics.attendanceRate, 0) / insights.length,
        };

        // Generate class-level recommendations
        const classRecommendations = this.generateClassRecommendations(
            classMetrics,
            atRiskStudents.length,
            insights.length
        );

        return {
            classMetrics,
            studentInsights: insights,
            atRiskStudents,
            recommendations: classRecommendations,
        };
    }

    /**
     * Calculate student engagement level
     */
    private calculateEngagement(student: User, results: Result[]): number {
        let engagement = 0;

        // Attendance-like metric
        engagement += Math.min(student.stats.totalStudyTime / 60, 30); // max 30 points

        // Consistency
        engagement += Math.min(student.streakDays! * 2, 30); // max 30 points

        // Performance
        const avgScore = results.length > 0
            ? results.reduce((sum, r) => sum + r.percentage, 0) / results.length
            : 50;
        engagement += Math.min(avgScore / 3, 40); // max 40 points

        return Math.min(engagement, 100);
    }

    /**
     * Identify areas where student is struggling
     */
    private identifyStrugglingAreas(results: Result[]): StudentInsight["strugglingAreas"] {
        const areaMap = new Map<string, { score: number; count: number }>();

        for (const result of results) {
            if (result.percentage < 60) {
                // Below 60% = struggling
                for (const [skill, score] of Object.entries(result.skillBreakdown || {})) {
                    const current = areaMap.get(skill) || { score: 0, count: 0 };
                    areaMap.set(skill, {
                        score: current.score + (score as number),
                        count: current.count + 1,
                    });
                }
            }
        }

        return Array.from(areaMap.entries())
            .map(([skill, { score, count }]) => ({
                skill,
                proficiency: Math.round((score / count) * 100),
                recommendedAction: `Focus on ${skill} with targeted practice and one-on-one support`,
            }))
            .sort((a, b) => a.proficiency - b.proficiency)
            .slice(0, 3); // top 3 struggling areas
    }

    /**
     * Identify student strengths
     */
    private identifyStrengths(results: Result[]): string[] {
        const skillScores = new Map<string, number[]>();

        for (const result of results) {
            for (const [skill, score] of Object.entries(result.skillBreakdown || {})) {
                if (!skillScores.has(skill)) skillScores.set(skill, []);
                skillScores.get(skill)!.push(score as number);
            }
        }

        const strengths: string[] = [];
        for (const [skill, scores] of skillScores.entries()) {
            const avgScore = scores.reduce((a, b) => a + b) / scores.length;
            if (avgScore > 80) {
                strengths.push(`Strong in ${skill} (avg: ${Math.round(avgScore)}%)`);
            }
        }

        return strengths;
    }

    /**
     * Assess student risk level
     */
    private assessStudentRisk(
        score: number,
        engagement: number,
        strugglingCount: number
    ): "low" | "medium" | "high" {
        let riskPoints = 0;

        if (score < 50) riskPoints += 3;
        else if (score < 65) riskPoints += 2;
        else if (score < 75) riskPoints += 1;

        if (engagement < 30) riskPoints += 3;
        else if (engagement < 50) riskPoints += 2;
        else if (engagement < 70) riskPoints += 1;

        if (strugglingCount >= 3) riskPoints += 2;
        else if (strugglingCount >= 2) riskPoints += 1;

        if (riskPoints >= 6) return "high";
        if (riskPoints >= 3) return "medium";
        return "low";
    }

    /**
     * Generate personalized recommendations
     */
    private async generateRecommendations(
        studentName: string,
        strugglingAreas: StudentInsight["strugglingAreas"],
        score: number,
        engagement: number
    ): Promise<string[]> {
        const areas = strugglingAreas.map((a) => a.skill).join(", ");

        const prompt = `Generate 3 specific, actionable recommendations for a student:
Student: ${studentName}
Average Score: ${Math.round(score)}%
Engagement: ${Math.round(engagement)}%
Struggling Areas: ${areas}

Recommendations should be specific, encouraging, and implementable.`;

        try {
            const text = await aiService.generateTextContent(prompt);
            // Parse recommendations from text
            return text
                .split("\n")
                .filter((line) => line.trim().length > 0)
                .slice(0, 3);
        } catch {
            return [
                "Review struggling topics with additional resources",
                "Increase study frequency and consistency",
                "Schedule office hours with teacher for support",
            ];
        }
    }

    /**
     * Generate class-level recommendations
     */
    private generateClassRecommendations(
        metrics: {
            averageScore: number;
            engagementLevel: number;
            attendanceRate: number;
        },
        atRiskCount: number,
        totalCount: number
    ): string[] {
        const recommendations: string[] = [];

        if (metrics.averageScore < 60) {
            recommendations.push("Class average is below satisfactory. Review curriculum pacing and assess prior knowledge.");
        }

        if (metrics.engagementLevel < 50) {
            recommendations.push("Low engagement detected. Consider using more interactive teaching methods and real-world applications.");
        }

        if (atRiskCount > totalCount * 0.2) {
            recommendations.push(`${atRiskCount} students at risk. Implement targeted interventions and peer tutoring programs.`);
        }

        if (metrics.attendanceRate < 90) {
            recommendations.push("Attendance below 90%. Follow up with absent students and review attendance policies.");
        }

        return recommendations.length > 0
            ? recommendations
            : ["Class is performing well. Continue current teaching strategies."];
    }

    /**
     * Get intervention strategy for at-risk student
     */
    private getInterventionStrategy(
        student: User,
        strugglingAreas: StudentInsight["strugglingAreas"]
    ): string {
        const topArea = strugglingAreas[0];

        const strategies = [
            `One-on-one tutoring session focusing on ${topArea.skill}`,
            `Assignment: Complete 5 practice problems on ${topArea.skill}`,
            `Video review: Watch Khan Academy introduction to ${topArea.skill}`,
            `Parent notification: Request 15 minutes daily study on ${topArea.skill}`,
            `Modified assessments: Extended time and simplified questions for ${topArea.skill}`,
        ];

        return strategies[Math.floor(Math.random() * strategies.length)];
    }

    /**
     * Get all generated lesson plans
     */
    getLessonPlans(): LessonPlan[] {
        return Array.from(this.lessonPlans.values());
    }

    /**
     * Get feedback history
     */
    getFeedbackHistory(): FeedbackSuggestion[] {
        return this.feedbackHistory;
    }

    /**
     * Get student insight
     */
    getStudentInsight(studentId: string): StudentInsight | null {
        return this.studentInsights.get(studentId) || null;
    }
}

export const teacherCoPilot = new TeacherCoPilot();
