/**
 * INTEGRATION TEST - Verify all 7 AI systems work together
 * Run this to validate the complete implementation
 */

import { adaptiveContentEngine } from "./adaptiveContentEngine";
import { aiIntegration } from "./aiSystemsIntegration";
import { bayesianKnowledgeTracing } from "./bayesianKnowledgeTracing";
import { multiAgentController } from "./multiAgentController";
import { performancePredictionModel } from "./performancePredictionModel";
import { reinforcementLearningEngine } from "./reinforcementLearningEngine";
import { teacherCoPilot } from "./teacherCoPilotService";
import { userProfilingService } from "./userProfilingService";

export async function runIntegrationTests() {
    console.log("\n" + "=".repeat(70));
    console.log("🧪 INTEGRATION TEST SUITE - ALL 7 AI SYSTEMS");
    console.log("=".repeat(70));

    const tests = [
        { name: "User Profiling Engine", test: testUserProfiling },
        { name: "Bayesian Knowledge Tracing", test: testBayesianKT },
        { name: "Adaptive Content Engine", test: testAdaptiveContent },
        { name: "Performance Prediction", test: testPerformancePrediction },
        { name: "Teacher Co-Pilot", test: testTeacherCoPilot },
        { name: "Multi-Agent Reasoning", test: testMultiAgent },
        { name: "Reinforcement Learning", test: testReinforcementLearning },
        { name: "System Integration", test: testSystemIntegration },
    ];

    let passed = 0;
    let failed = 0;

    for (const { name, test } of tests) {
        try {
            console.log(`\n📋 Testing: ${name}`);
            await test();
            console.log(`✅ PASSED: ${name}`);
            passed++;
        } catch (error) {
            console.error(`❌ FAILED: ${name}`, error);
            failed++;
        }
    }

    console.log("\n" + "=".repeat(70));
    console.log(`📊 TEST RESULTS: ${passed} passed, ${failed} failed`);
    console.log("=".repeat(70) + "\n");

    return { passed, failed, total: tests.length };
}

async function testUserProfiling() {
    const mockUser = {
        id: "test_001",
        name: "Test Student",
        email: "test@school.edu",
        role: "student" as const,
        avatar: "",
        stats: {
            totalStudyTime: 400,
            averageScore: 78,
            topicsMastered: ["Algebra"],
            topicsFailed: [],
        },
        classIds: [],
        xp: 2000,
        level: 10,
        streakDays: 5,
        educationLevel: "SSC",
        iqLevel: 2,
        institution: "Test School",
        subjects: ["Math"],
        experience: "3 months",
        bio: "Test",
    };

    const mockResults = [
        {
            id: "r1",
            studentId: "test_001",
            assessmentId: "a1",
            score: 78,
            percentage: 78,
            timeTaken: 30,
            submittedAt: new Date(),
            skillBreakdown: { algebra: 80 },
            questionResults: [{ questionId: "q1", isCorrect: true, answer: "x=4", timeTaken: 2 }],
        },
    ];

    const profile = await userProfilingService.buildUserProfile("test_001", mockUser, mockResults);

    if (!profile || !profile.userId || !profile.bloomsLevel) {
        throw new Error("Profile building failed");
    }

    console.log(`  ✓ Profile created: ${profile.bloomsLevel} level, ${profile.learningStyle} style`);
    console.log(`  ✓ Mastered skills: ${profile.masteredSkills.length}`);
    console.log(`  ✓ Engagement trend: ${profile.engagementTrend}`);
}

function testBayesianKT() {
    const skillId = "test_algebra";

    // Initialize
    const state = bayesianKnowledgeTracing.initializeSkill(skillId);
    if (!state) throw new Error("BKT initialization failed");

    console.log(`  ✓ Skill initialized with pInit=${(state.pInit * 100).toFixed(0)}%`);

    // Update with correct answer
    const result1 = bayesianKnowledgeTracing.updateKnowledge(skillId, true);
    console.log(`  ✓ After correct: ${(result1.updatedKnowledge * 100).toFixed(1)}%`);

    // Update with incorrect answer
    const result2 = bayesianKnowledgeTracing.updateKnowledge(skillId, false);
    console.log(`  ✓ After incorrect: ${(result2.updatedKnowledge * 100).toFixed(1)}%`);

    // Check mastery prediction
    const daysToMastery = bayesianKnowledgeTracing.estimateTimeToMastery(skillId, 2);
    console.log(`  ✓ Days to mastery (2 attempts/day): ${daysToMastery}`);

    if (daysToMastery < 0 || daysToMastery > 365) {
        throw new Error("Invalid mastery estimate");
    }
}

async function testAdaptiveContent() {
    const mockProfile = {
        userId: "test_001",
        bloomsLevel: "apply" as const,
        learningStyle: "visual" as const,
        cognitiveLoad: 70,
        processingSpeed: "normal" as const,
        knowledgeState: new Map([["algebra", 0.6]]),
        learningVelocity: 0.05,
        masteredSkills: [],
        strugglingSkills: [],
        errorPatterns: [],
        misconceptions: [],
        motivationLevel: "high" as const,
        engagementTrend: 10,
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

    const plan = await adaptiveContentEngine.generateAdaptiveContentPlan("test_001", {
        studentProfile: mockProfile,
        learningObjective: "Quadratic Equations",
        contentTypes: ["video"],
    });

    if (!plan || !plan.contentSequence) {
        throw new Error("Content plan generation failed");
    }

    console.log(`  ✓ Content plan generated with ${plan.contentSequence.length} units`);
    console.log(`  ✓ Total duration: ${plan.estimatedDuration} minutes`);
    console.log(`  ✓ Checkpoints: ${plan.checkpoints.length}`);
}

async function testPerformancePrediction() {
    const prediction = await performancePredictionModel.predictPerformance({
        averageScore: 75,
        recentScore: 78,
        scoreVariance: 8,
        totalAttempts: 10,
        masterSkills: 3,
        strugglingSkills: 1,
        averageKnowledgeState: 0.7,
        daysActive: 30,
        sessionsCount: 15,
        averageSessionDuration: 30,
        streakDays: 5,
        timeOfDayPreference: 9,
        attentionSpan: 35,
        errorRate: 0.2,
        subject: "Math",
        difficulty: "intermediate" as const,
        educationLevel: "SSC",
        daysSinceLastAttempt: 1,
        daysSinceMastered: 10,
    });

    if (!prediction || prediction.predictedScore < 0 || prediction.predictedScore > 100) {
        throw new Error("Invalid performance prediction");
    }

    console.log(`  ✓ Predicted score: ${prediction.predictedScore}%`);
    console.log(`  ✓ Confidence: ${(prediction.confidence * 100).toFixed(0)}%`);
    console.log(`  ✓ Risk level: ${prediction.riskLevel}`);
    console.log(`  ✓ Confidence interval: [${prediction.lowerBound}, ${prediction.upperBound}]`);

    const metrics = performancePredictionModel.getModelMetrics();
    console.log(`  ✓ Model accuracy: ${(metrics.accuracy * 100).toFixed(1)}%`);
}

async function testTeacherCoPilot() {
    // Test lesson plan generation
    const lessonPlan = await teacherCoPilot.generateLessonPlan(
        "Mathematics",
        "Algebra",
        "SSC",
        45,
        30
    );

    if (!lessonPlan || !lessonPlan.objectives || lessonPlan.objectives.length === 0) {
        throw new Error("Lesson plan generation failed");
    }

    console.log(`  ✓ Lesson plan: "${lessonPlan.title}"`);
    console.log(`  ✓ Objectives: ${lessonPlan.objectives.length}`);
    console.log(`  ✓ Activities: ${lessonPlan.activities.length}`);
    console.log(`  ✓ Materials: ${lessonPlan.materials.length}`);

    // Test feedback generation
    const feedback = await teacherCoPilot.generateFeedback(
        "Test Student",
        "Sample submission"
    );

    if (!feedback || !feedback.feedback) {
        throw new Error("Feedback generation failed");
    }

    console.log(`  ✓ Feedback generated with ${feedback.feedback.positive.length} positive points`);
}

async function testMultiAgent() {
    const agents = multiAgentController.getAgents();

    if (!agents || agents.length !== 5) {
        throw new Error("Agent initialization failed");
    }

    console.log(`  ✓ ${agents.length} agents initialized`);

    // Test agent request
    const response = await multiAgentController.askAgent({
        agentId: "content_agent",
        query: "Test query",
        context: { test: true },
        priority: "medium",
    });

    if (!response || !response.response) {
        throw new Error("Agent response failed");
    }

    console.log(`  ✓ Content agent responded with confidence ${(response.confidence * 100).toFixed(0)}%`);

    // Test coordination
    const coordination = await multiAgentController.coordinateAgents("Test coordination", {
        test: true,
    });

    if (!coordination || coordination.agentResponses.length === 0) {
        throw new Error("Agent coordination failed");
    }

    console.log(`  ✓ Coordinated ${coordination.agentResponses.length} agent responses`);
}

async function testReinforcementLearning() {
    // Test action selection
    const actionResult = await reinforcementLearningEngine.selectAction(
        "content_selection",
        "test_state",
        ["video", "interactive", "text"]
    );

    if (!actionResult || !actionResult.recommendedAction) {
        throw new Error("Action selection failed");
    }

    console.log(`  ✓ Action selected: ${actionResult.recommendedAction}`);
    console.log(`  ✓ Expected reward: ${(actionResult.expectedReward * 100).toFixed(0)}%`);

    // Test reward observation
    await reinforcementLearningEngine.observeReward(
        {
            actionId: "test_action",
            type: "content",
            contentId: "test_content",
            reward: 0.8,
            studentResponse: "positive",
            context: {
                studentProficiency: 0.7,
                learningStyle: "visual",
                motivationLevel: "high",
                timeOfDay: "10",
            },
            timestamp: new Date(),
        },
        "test_state",
        ["video", "interactive", "text"]
    );

    console.log(`  ✓ Reward observed and Q-values updated`);

    // Test trajectory analysis
    const trajectory = reinforcementLearningEngine.analyzeTrajectory("content_selection");
    console.log(`  ✓ Learning trajectory: ${trajectory.convergence}`);
}

async function testSystemIntegration() {
    // Get system report
    const report = aiIntegration.getSystemReport();

    if (!report || report.engines.length !== 7) {
        throw new Error("System integration failed");
    }

    console.log(`  ✓ ${report.engines.length} engines integrated`);
    console.log(`  ✓ ${report.policies} learning policies`);
    console.log(`  ✓ ${report.models.length} ML models`);

    // Test export/import
    const state = aiIntegration.exportSystemState();
    if (!state || state.length === 0) {
        throw new Error("State export failed");
    }

    console.log(`  ✓ System state exported (${state.length} chars)`);

    // Import state
    aiIntegration.importSystemState(state);
    console.log(`  ✓ System state imported successfully`);
}

/**
 * Run with: await runIntegrationTests()
 */
export default runIntegrationTests;
