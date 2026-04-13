/**
 * AI Systems Testing & Usage Guide
 * Examples of how to use all 7 AI engines
 */

import { Result, User } from "../types";
import { adaptiveContentEngine } from "./adaptiveContentEngine";
import { aiIntegration } from "./aiSystemsIntegration";
import { bayesianKnowledgeTracing } from "./bayesianKnowledgeTracing";
import { multiAgentController } from "./multiAgentController";
import { performancePredictionModel } from "./performancePredictionModel";
import { reinforcementLearningEngine } from "./reinforcementLearningEngine";
import { teacherCoPilot } from "./teacherCoPilotService";
import { userProfilingService } from "./userProfilingService";

/**
 * =============================================
 * 1. USER PROFILING SERVICE - EXAMPLES
 * =============================================
 */
export async function exampleUserProfiling() {
    console.log("\n📊 USER PROFILING SERVICE EXAMPLES\n");

    // Create mock student
    const student: User = {
        id: "student_001",
        name: "Ahmed Khan",
        email: "ahmed@school.edu",
        role: "student",
        avatar: "https://example.com/avatar.jpg",
        stats: {
            totalStudyTime: 450,
            averageScore: 78,
            topicsMastered: ["Algebra", "Geometry"],
            topicsFailed: ["Trigonometry"],
        },
        classIds: ["class_001"],
        xp: 2500,
        level: 12,
        streakDays: 8,
        educationLevel: "SSC",
        iqLevel: 2,
        institution: "Modern School",
        subjects: ["Mathematics", "Physics"],
        experience: "3 months",
        bio: "Interested in STEM",
    };

    // Create mock results
    const mockResults: Result[] = [
        {
            id: "result_001",
            studentId: student.id,
            assessmentId: "assess_001",
            score: 78,
            percentage: 78,
            timeTaken: 35,
            submittedAt: new Date("2024-01-10"),
            skillBreakdown: { algebra: 85, functions: 70 },
            questionResults: [
                { questionId: "q1", isCorrect: true, answer: "correct", timeTaken: 2 },
            ],
        },
    ];

    // Build profile
    const profile = await userProfilingService.buildUserProfile(
        student.id,
        student,
        mockResults
    );

    console.log("✓ Profile created for", profile.userId);
    console.log("  Learning Style:", profile.learningStyle);
    console.log("  Bloom's Level:", profile.bloomsLevel);
    console.log("  Motivation:", profile.motivationLevel);
    console.log("  Mastered Skills:", profile.masteredSkills);
    console.log("  Struggling Skills:", profile.strugglingSkills);

    // Predict next failure
    const prediction = await userProfilingService.predictNextFailure(student.id);
    console.log("\n  Next potential failure:");
    console.log("    Topic:", prediction?.topic);
    console.log("    Failure Probability:", (prediction?.failureProbability! * 100).toFixed(1) + "%");
    console.log("    Days Until:", prediction?.daysUntilFailure, "days");
}

/**
 * =============================================
 * 2. BAYESIAN KNOWLEDGE TRACING - EXAMPLES
 * =============================================
 */
export function exampleBayesianKT() {
    console.log("\n🧠 BAYESIAN KNOWLEDGE TRACING EXAMPLES\n");

    // Initialize skill
    const skillId = "algebra_linear_equations";
    const state = bayesianKnowledgeTracing.initializeSkill(skillId);

    console.log("✓ Initialized skill:", skillId);
    console.log("  Initial Knowledge Probability:", (state.pInit * 100).toFixed(0) + "%");

    // Simulate student responses
    const responses = [
        { skillId, isCorrect: true },
        { skillId, isCorrect: true },
        { skillId, isCorrect: false },
        { skillId, isCorrect: true },
        { skillId, isCorrect: true },
    ];

    console.log("\n  Simulating 5 attempts:");
    for (const [idx, response] of responses.entries()) {
        const result = bayesianKnowledgeTracing.updateKnowledge(
            response.skillId,
            response.isCorrect
        );
        console.log(
            `  Attempt ${idx + 1}: ${response.isCorrect ? "✓" : "✗"} → Knowledge: ${(result.updatedKnowledge * 100).toFixed(1)}%`
        );
    }

    // Get current state
    const currentState = bayesianKnowledgeTracing.getKnowledgeState(skillId);
    console.log("\n  Final State:");
    console.log("    Mastery:", (currentState?.pKnown! * 100).toFixed(1) + "%");
    console.log("    Total Attempts:", currentState?.attempts);
    console.log("    Correct Answers:", currentState?.correctCount);

    // Predict time to mastery
    const daysToMastery = bayesianKnowledgeTracing.estimateTimeToMastery(skillId, 2);
    console.log("    Estimated days to mastery (2 attempts/day):", daysToMastery);
}

/**
 * =============================================
 * 3. ADAPTIVE CONTENT ENGINE (RAG) - EXAMPLES
 * =============================================
 */
export async function exampleAdaptiveContent() {
    console.log("\n📚 ADAPTIVE CONTENT ENGINE (RAG) EXAMPLES\n");

    // Create student profile
    const profile = {
        userId: "student_001",
        bloomsLevel: "apply" as const,
        learningStyle: "visual" as const,
        cognitiveLoad: 75,
        processingSpeed: "normal" as const,
        knowledgeState: new Map([
            ["algebra", 0.6],
            ["geometry", 0.4],
            ["trigonometry", 0.2],
        ]),
        learningVelocity: 0.05,
        masteredSkills: ["algebra"],
        strugglingSkills: ["trigonometry"],
        errorPatterns: [],
        misconceptions: [],
        motivationLevel: "high" as const,
        engagementTrend: 15,
        preferredContentType: ["video", "interactive"] as any,
        optimalTimeOfDay: "morning",
        sessionDurationPreference: 30,
        accessibilityNeeds: [],
        languagePreference: "en" as const,
        connectionQuality: "normal" as const,
        socioeconomicContext: "middle" as const,
        educationSystem: "NCTB" as const,
        culturalContext: "Bangladesh",
        createdAt: new Date(),
        lastUpdatedAt: new Date(),
        totalInteractions: 5,
        averageSessionDuration: 28,
    };

    // Generate adaptive content plan
    const plan = await adaptiveContentEngine.generateAdaptiveContentPlan("student_001", {
        studentProfile: profile,
        learningObjective: "Quadratic Equations",
        contentTypes: ["video", "interactive"],
        difficulty: "intermediate",
    });

    console.log("✓ Adaptive Content Plan Generated");
    console.log("  Objective:", plan.objective);
    console.log("  Content Units:", plan.contentSequence.length);
    console.log("  Total Duration:", plan.estimatedDuration, "minutes");
    console.log("  Adaptation Rationale:", plan.adaptationRationale);

    console.log("\n  Content Sequence:");
    for (const [idx, content] of plan.contentSequence.entries()) {
        console.log(
            `    ${idx + 1}. ${content.title} (${content.duration} min, ${content.bloomsLevel})`
        );
    }

    console.log("\n  Checkpoints:");
    for (const checkpoint of plan.checkpoints) {
        console.log(
            `    After content: ${checkpoint.assessmentQuestions} questions, ${checkpoint.successCriteria}% to pass`
        );
    }
}

/**
 * =============================================
 * 4. PERFORMANCE PREDICTION (ML) - EXAMPLES
 * =============================================
 */
export async function examplePerformancePrediction() {
    console.log("\n📈 PERFORMANCE PREDICTION (ML) EXAMPLES\n");

    // Create student features
    const features = {
        averageScore: 75,
        recentScore: 78,
        scoreVariance: 8,
        totalAttempts: 12,
        masterSkills: 3,
        strugglingSkills: 1,
        averageKnowledgeState: 0.72,
        daysActive: 45,
        sessionsCount: 18,
        averageSessionDuration: 32,
        streakDays: 7,
        timeOfDayPreference: 10,
        attentionSpan: 35,
        errorRate: 0.15,
        subject: "Mathematics",
        difficulty: "intermediate" as const,
        educationLevel: "SSC",
        daysSinceLastAttempt: 1,
        daysSinceMastered: 14,
    };

    // Predict performance
    const prediction = await performancePredictionModel.predictPerformance(features);

    console.log("✓ Performance Prediction Generated");
    console.log("  Predicted Score:", prediction.predictedScore + "%");
    console.log("  Confidence:", (prediction.confidence * 100).toFixed(0) + "%");
    console.log("  Confidence Interval:", `[${prediction.lowerBound}, ${prediction.upperBound}]`);
    console.log("  Risk Level:", prediction.riskLevel);

    if (prediction.recommendedIntervention) {
        console.log("  Intervention:", prediction.recommendedIntervention);
    }

    console.log("\n  Top Factors:");
    for (const factor of prediction.explainableFactors) {
        console.log(`    ${factor.factor}: ${factor.explanation}`);
    }

    // Get model metrics
    const metrics = performancePredictionModel.getModelMetrics();
    console.log("\n  Model Performance:");
    console.log("    Accuracy:", (metrics.accuracy * 100).toFixed(1) + "%");
    console.log("    Precision:", (metrics.precision * 100).toFixed(1) + "%");
    console.log("    Recall:", (metrics.recall * 100).toFixed(1) + "%");
}

/**
 * =============================================
 * 5. TEACHER CO-PILOT - EXAMPLES
 * =============================================
 */
export async function exampleTeacherCoPilot() {
    console.log("\n👨‍🏫 TEACHER CO-PILOT EXAMPLES\n");

    // 5a. Generate Lesson Plan
    console.log("  5a. Generating Lesson Plan...");
    const lessonPlan = await teacherCoPilot.generateLessonPlan(
        "Mathematics",
        "Quadratic Equations",
        "SSC",
        45,
        30,
        5
    );

    console.log("✓ Lesson Plan Generated");
    console.log("  Title:", lessonPlan.title);
    console.log("  Duration:", lessonPlan.duration, "minutes");
    console.log("  Objectives:", lessonPlan.objectives.length);
    console.log("  Activities:", lessonPlan.activities.length);
    console.log("  Assessment Questions:", lessonPlan.assessment.questions);

    // 5b. Generate Feedback
    console.log("\n  5b. Generating Student Feedback...");
    const feedback = await teacherCoPilot.generateFeedback(
        "Fatima Ahmed",
        "Student submitted assignment on quadratic equations",
        [
            { category: "Correctness", maxPoints: 30 },
            { category: "Clarity", maxPoints: 20 },
            { category: "Completeness", maxPoints: 20 },
        ],
        "encouraging"
    );

    console.log("✓ Feedback Generated");
    console.log("  Student:", feedback.studentName);
    console.log("  Positive Points:");
    for (const point of feedback.feedback.positive) {
        console.log("    -", point);
    }
    console.log("  Areas for Improvement:");
    for (const area of feedback.feedback.areas) {
        console.log("    -", area);
    }

    // 5c. Generate Student Insights
    console.log("\n  5c. Generating Student Insights...");
    const mockStudent: User = {
        id: "s001",
        name: "Rahim Hassan",
        email: "rahim@school.edu",
        role: "student",
        stats: {
            totalStudyTime: 300,
            averageScore: 62,
            topicsMastered: [],
            topicsFailed: ["Algebra", "Geometry"],
        },
        xp: 800,
        level: 8,
        streakDays: 2,
        classIds: [],
        avatar: "",
        educationLevel: "SSC",
        iqLevel: 1,
        institution: "",
        subjects: [],
        experience: "",
        bio: "",
    };

    const mockResults: Result[] = [
        {
            id: "r1",
            studentId: mockStudent.id,
            assessmentId: "a1",
            score: 55,
            percentage: 55,
            timeTaken: 40,
            submittedAt: new Date(),
            skillBreakdown: { algebra: 45, geometry: 50 },
            questionResults: [],
        },
    ];

    const insight = await teacherCoPilot.generateStudentInsight(mockStudent, mockResults, {
        present: 18,
        total: 20,
    });

    console.log("✓ Student Insight Generated");
    console.log("  Student:", insight.studentName);
    console.log("  Risk Level:", insight.riskLevel);
    console.log("  Average Score:", insight.keyMetrics.averageScore.toFixed(1) + "%");
    console.log("  Engagement:", insight.keyMetrics.engagementLevel.toFixed(0) + "/100");
    console.log("  Struggling Areas:", insight.strugglingAreas.map((a) => a.skill).join(", "));
}

/**
 * =============================================
 * 6. MULTI-AGENT REASONING - EXAMPLES
 * =============================================
 */
export async function exampleMultiAgent() {
    console.log("\n🤖 MULTI-AGENT REASONING EXAMPLES\n");

    // Get available agents
    const agents = multiAgentController.getAgents();
    console.log("✓ Available Agents:");
    for (const agent of agents) {
        console.log(`  - ${agent.name}: ${agent.expertise}`);
    }

    // Coordinate agents
    console.log("\n  Coordinating agents on learning objective...");
    const coordination = await multiAgentController.coordinateAgents(
        "Student struggles with trigonometry. How should we help?",
        {
            studentProficiency: 0.4,
            learningStyle: "interactive",
            strugglingTopics: ["trigonometry", "angles"],
        },
        ["content_agent", "feedback_agent", "motivation_agent"]
    );

    console.log("✓ Multi-Agent Coordination Result");
    console.log("  Agent Responses:", coordination.agentResponses.length);
    console.log("  Recommended Action:", coordination.recommendedAction);
    console.log("  Reasoning:", coordination.reasoning);

    // Show agent responses
    console.log("\n  Individual Agent Responses:");
    for (const response of coordination.agentResponses) {
        console.log(`    ${response.agentId}: Confidence ${(response.confidence * 100).toFixed(0)}%`);
    }
}

/**
 * =============================================
 * 7. REINFORCEMENT LEARNING - EXAMPLES
 * =============================================
 */
export async function exampleReinforcementLearning() {
    console.log("\n🔄 REINFORCEMENT LEARNING ENGINE EXAMPLES\n");

    // Select action using epsilon-greedy
    const actionResult = await reinforcementLearningEngine.selectAction(
        "content_selection",
        "high_visual_motivated_morning",
        ["video", "interactive", "text", "gamified"]
    );

    console.log("✓ Action Selected");
    console.log("  Recommended Content:", actionResult.recommendedAction);
    console.log("  Expected Success:", (actionResult.expectedReward * 100).toFixed(0) + "%");
    console.log("  Exploration Rate:", (actionResult.explorationProbability * 100).toFixed(0) + "%");
    console.log("  Reasoning:", actionResult.reasoningChain);

    // Simulate reward
    console.log("\n  Observing outcome and updating policies...");
    await reinforcementLearningEngine.observeReward(
        {
            actionId: "action_001",
            type: "content",
            contentId: actionResult.recommendedAction,
            reward: 0.85,
            studentResponse: "positive",
            context: {
                studentProficiency: 0.7,
                learningStyle: "visual",
                motivationLevel: "high",
                timeOfDay: "10",
            },
            timestamp: new Date(),
        },
        "high_visual_motivated_morning",
        ["video", "interactive", "text", "gamified"]
    );

    console.log("✓ Reward Observed and Policies Updated");

    // Get trajectory analysis
    const trajectory = reinforcementLearningEngine.analyzeTrajectory("content_selection");
    console.log("\n  Learning Trajectory Analysis:");
    console.log("    Average Reward:", (trajectory.averageReward * 100).toFixed(1) + "%");
    console.log("    Convergence Status:", trajectory.convergence);
    console.log("    Recommendation:", trajectory.recommendedAdjustment);
}

/**
 * =============================================
 * COMPLETE INTEGRATION EXAMPLE
 * =============================================
 */
export async function exampleCompleteIntegration() {
    console.log("\n" + "=".repeat(60));
    console.log("🎓 COMPLETE AI SYSTEMS INTEGRATION EXAMPLE");
    console.log("=".repeat(60) + "\n");

    // Create mock student
    const student: User = {
        id: "student_final",
        name: "Zara Rahman",
        email: "zara@school.edu",
        role: "student",
        avatar: "https://example.com/avatar.jpg",
        stats: {
            totalStudyTime: 520,
            averageScore: 82,
            topicsMastered: ["Algebra", "Coordinate Geometry"],
            topicsFailed: ["Trigonometry"],
        },
        classIds: ["class_001"],
        xp: 3200,
        level: 14,
        streakDays: 12,
        educationLevel: "SSC",
        iqLevel: 3,
        institution: "Modern School",
        subjects: ["Mathematics", "Physics", "Chemistry"],
        experience: "6 months",
        bio: "Top student interested in engineering",
    };

    const mockResults: Result[] = [
        {
            id: "result_001",
            studentId: student.id,
            assessmentId: "assess_001",
            score: 92,
            percentage: 92,
            timeTaken: 28,
            submittedAt: new Date("2024-01-15"),
            skillBreakdown: { algebra: 95, functions: 88, calculus: 85 },
            questionResults: [
                { questionId: "q1", isCorrect: true, answer: "correct", timeTaken: 2 },
                { questionId: "q2", isCorrect: true, answer: "correct", timeTaken: 1 },
            ],
        },
    ];

    // Run complete session
    const session = await aiIntegration.runCompleteStudentSession(
        student,
        mockResults,
        "Calculus: Derivatives and Applications"
    );

    console.log("✓ Complete session initialized");
    console.log("  Student Profile:", session.profile.userId);
    console.log("  Content Units:", session.contentPlan.length);
    console.log("  Predicted Score:", session.performancePrediction.score + "%");
    console.log("  Performance Risk:", session.performancePrediction.risk);

    // Show system report
    const report = aiIntegration.getSystemReport();
    console.log("\n📊 SYSTEM REPORT:");
    console.log("  AI Engines:", report.engines.length);
    console.log("  Learning Policies:", report.policies);
    console.log("  Model Accuracy:");
    for (const model of report.models) {
        console.log(`    - ${model.name}: ${model.accuracy}`);
    }

    console.log("\n" + "=".repeat(60));
    console.log("✅ INTEGRATION TEST COMPLETE");
    console.log("=".repeat(60) + "\n");
}

/**
 * =============================================
 * RUNNING ALL EXAMPLES
 * =============================================
 */
export async function runAllExamples() {
    try {
        await exampleUserProfiling();
        exampleBayesianKT();
        await exampleAdaptiveContent();
        await examplePerformancePrediction();
        await exampleTeacherCoPilot();
        await exampleMultiAgent();
        await exampleReinforcementLearning();
        await exampleCompleteIntegration();

        console.log("\n✅ ALL EXAMPLES COMPLETED SUCCESSFULLY\n");
    } catch (error) {
        console.error("Error running examples:", error);
    }
}

// Export for use
export { runAllExamples };
