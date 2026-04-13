import React, { useEffect, useMemo, useState } from "react";
import { allMockRecommendations } from "../data";
import { generateLearningRecommendations } from "../services/aiService";
import { LearningRecommendation, StudentSkill } from "../types";
import Button from "./Button";
import Card from "./Card";
import {
  BookOpenIcon,
  BrainCircuitIcon,
  CheckCircleIcon,
  LightbulbIcon,
  RefreshCwIcon,
  SparklesIcon,
  TargetIcon,
  TrendingUpIcon,
  TrophyIcon,
} from "./icons";
import RecommendationCard from "./RecommendationCard";

interface DynamicLearningPathViewProps {
  studentSkills: StudentSkill[];
}

type ContentTypeFilter = "all" | LearningRecommendation["contentType"];
type DifficultyFilter = "all" | LearningRecommendation["difficulty"];
type SortOption = "priority" | "difficulty" | "duration" | "skill";

const FilterButton: React.FC<{
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
}> = ({ onClick, isActive, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
      isActive
        ? "bg-primary text-white shadow"
        : "bg-surface/80 text-neutral-medium hover:bg-neutral-light/50"
    }`}
    aria-pressed={isActive}
  >
    {children}
  </button>
);

const DynamicLearningPathView: React.FC<DynamicLearningPathViewProps> = ({
  studentSkills,
}) => {
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);
  const [contentTypeFilter, setContentTypeFilter] =
    useState<ContentTypeFilter>("all");
  const [difficultyFilter, setDifficultyFilter] =
    useState<DifficultyFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("priority");
  const [showOnlyPriority, setShowOnlyPriority] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<
    LearningRecommendation[]
  >([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [useAIRecommendations, setUseAIRecommendations] = useState(false);

  // Load completed recommendations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("edusense_completed_recs");
    if (saved) {
      setCompletedRecs(JSON.parse(saved));
    }
  }, []);

  // Save completed recommendations to localStorage
  useEffect(() => {
    localStorage.setItem(
      "edusense_completed_recs",
      JSON.stringify(completedRecs)
    );
  }, [completedRecs]);

  // Generate AI recommendations based on skill gaps
  const generateAIRecommendations = async () => {
    if (!studentSkills || studentSkills.length === 0) {
      setAiError(
        "Complete an assessment first to get personalized recommendations!"
      );
      return;
    }

    const weakSkills = studentSkills.filter((skill) => skill.score < 80);
    if (weakSkills.length === 0) {
      setAiError(
        "🎉 No skill gaps found. You're doing great! All skills are above 80%."
      );
      return;
    }

    setIsLoadingAI(true);
    setAiError(null);

    try {
      const skillGaps = weakSkills.map((skill) => ({
        subject: skill.subject,
        score: skill.score,
      }));

      console.log("Generating AI recommendations for skill gaps:", skillGaps);
      const recommendations = await generateLearningRecommendations(skillGaps);
      console.log("AI recommendations generated:", recommendations);

      setAiRecommendations(recommendations);
      setUseAIRecommendations(true);
    } catch (error: any) {
      console.error("Failed to generate AI recommendations:", error);
      const errorMessage =
        error.message ||
        "Failed to generate AI recommendations. Please try again.";

      // Check for specific error types
      if (errorMessage.includes("API key")) {
        setAiError(
          "⚠️ API key not configured. Please add VITE_GEMINI_API_KEY to your .env file and restart the server."
        );
      } else if (
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit")
      ) {
        setAiError(
          "⚠️ API quota exceeded. Please try again later or check your API key limits."
        );
      } else {
        setAiError(`⚠️ ${errorMessage}`);
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  const handleToggleComplete = (recId: string) => {
    setCompletedRecs((prev) =>
      prev.includes(recId)
        ? prev.filter((id) => id !== recId)
        : [...prev, recId]
    );
  };

  const clearAllCompleted = () => {
    setCompletedRecs([]);
  };

  const priorityOrder = { high: 1, medium: 2, low: 3 };
  const difficultyOrder = { easy: 1, medium: 2, hard: 3 };

  const personalizedRecommendations = useMemo(() => {
    if (!studentSkills || studentSkills.length === 0) return {};

    const weakSkills = studentSkills.filter((skill) => skill.score < 80);

    if (weakSkills.length === 0) return {};

    // Choose between AI-generated or mock recommendations
    const recommendationsSource =
      useAIRecommendations && aiRecommendations.length > 0
        ? aiRecommendations
        : allMockRecommendations;

    const recommendationsByTopic: {
      [key: string]: { recs: LearningRecommendation[]; score: number };
    } = {};

    weakSkills.forEach((skill) => {
      let recsForTopic = recommendationsSource
        .filter((rec) => rec.skill === skill.subject)
        .filter(
          (rec) =>
            contentTypeFilter === "all" || rec.contentType === contentTypeFilter
        )
        .filter(
          (rec) =>
            difficultyFilter === "all" || rec.difficulty === difficultyFilter
        )
        .filter((rec) => !showOnlyPriority || rec.priority === "high");

      // Apply sorting
      recsForTopic = recsForTopic.sort((a, b) => {
        switch (sortBy) {
          case "priority":
            return priorityOrder[a.priority] - priorityOrder[b.priority];
          case "difficulty":
            return (
              difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
            );
          case "duration":
            return a.duration - b.duration;
          case "skill":
            return a.skill.localeCompare(b.skill);
          default:
            return 0;
        }
      });

      if (recsForTopic.length > 0) {
        recommendationsByTopic[skill.subject] = {
          recs: recsForTopic,
          score: skill.score,
        };
      }
    });

    return recommendationsByTopic;
  }, [
    studentSkills,
    contentTypeFilter,
    difficultyFilter,
    sortBy,
    showOnlyPriority,
    useAIRecommendations,
    aiRecommendations,
  ]);

  const hasRecommendations =
    Object.keys(personalizedRecommendations).length > 0;

  const hasAnyRecsBeforeFilter = useMemo(() => {
    if (!studentSkills) return false;
    const weakTopics = studentSkills
      .filter((skill) => skill.score < 80)
      .map((skill) => skill.subject);
    return weakTopics.some((topic) =>
      allMockRecommendations.some((rec) => rec.skill === topic)
    );
  }, [studentSkills]);

  // Calculate statistics
  const totalRecommendations = useMemo(() => {
    return Object.values(personalizedRecommendations).reduce(
      (sum, data) =>
        sum + (data as { recs: LearningRecommendation[] }).recs.length,
      0
    );
  }, [personalizedRecommendations]);

  const completedCount = useMemo(() => {
    const allRecommendationIds = Object.values(
      personalizedRecommendations
    ).flatMap((data) =>
      (data as { recs: LearningRecommendation[] }).recs.map((rec) => rec.id)
    );
    return allRecommendationIds.filter((id) => completedRecs.includes(id))
      .length;
  }, [personalizedRecommendations, completedRecs]);

  const totalEstimatedTime = useMemo(() => {
    return Object.values(personalizedRecommendations).reduce((sum, data) => {
      const recs = (data as { recs: LearningRecommendation[] }).recs;
      return (
        sum +
        recs
          .filter((rec) => !completedRecs.includes(rec.id))
          .reduce((s, rec) => s + rec.duration, 0)
      );
    }, 0);
  }, [personalizedRecommendations, completedRecs]);

  const progressPercentage =
    totalRecommendations > 0
      ? Math.round((completedCount / totalRecommendations) * 100)
      : 0;

  return (
    <>
      <header className="mb-8 text-center">
        <div className="inline-block bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-full mb-4">
          <SparklesIcon className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold font-display text-neutral-extradark">
          Recommendations Learning Path
        </h1>
        <p className="text-lg text-neutral-medium mt-2 max-w-2xl mx-auto">
          Your personalized journey to mastery, with content curated just for
          you.
        </p>
      </header>

      {/* AI Recommendation Generation */}
      {studentSkills && studentSkills.length > 0 && (
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-shrink-0">
              <BrainCircuitIcon className="h-12 w-12 text-primary" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-lg font-bold text-primary-dark mb-1">
                AI-Powered Recommendations
              </h3>
              <p className="text-neutral-dark text-sm">
                Generate personalized learning content from YouTube, Google, and
                AI-curated resources based on your skill gaps
              </p>
            </div>
            <div className="flex gap-3">
              {useAIRecommendations && aiRecommendations.length > 0 && (
                <Button
                  onClick={() => {
                    setUseAIRecommendations(false);
                    setAiRecommendations([]);
                  }}
                  variant="outline"
                  disabled={isLoadingAI}
                >
                  Show Mock Data
                </Button>
              )}
              <Button
                onClick={generateAIRecommendations}
                disabled={isLoadingAI}
                className="flex items-center gap-2"
              >
                {isLoadingAI ? (
                  <>
                    <RefreshCwIcon className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <SparklesIcon className="h-4 w-4" />
                    {aiRecommendations.length > 0
                      ? "Regenerate"
                      : "Generate AI Recommendations"}
                  </>
                )}
              </Button>
            </div>
          </div>
          {aiError && (
            <div className="mt-4 p-3 bg-danger/10 border border-danger/30 rounded-lg text-danger-dark text-sm">
              {aiError}
            </div>
          )}
          {useAIRecommendations && aiRecommendations.length > 0 && (
            <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg text-success-dark text-sm font-medium">
              ✓ Using {aiRecommendations.length} AI-generated recommendations
            </div>
          )}
        </Card>
      )}

      {/* Progress Stats */}
      {hasAnyRecsBeforeFilter && totalRecommendations > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <BookOpenIcon className="w-6 h-6 text-primary" />
            </div>
            <p className="text-3xl font-bold text-primary">
              {totalRecommendations}
            </p>
            <p className="text-sm text-neutral-medium">Total Resources</p>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <CheckCircleIcon className="w-6 h-6 text-success" />
            </div>
            <p className="text-3xl font-bold text-success">{completedCount}</p>
            <p className="text-sm text-neutral-medium">Completed</p>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TrendingUpIcon className="w-6 h-6 text-warning" />
            </div>
            <p className="text-3xl font-bold text-warning">
              {progressPercentage}%
            </p>
            <p className="text-sm text-neutral-medium">Progress</p>
          </Card>
          <Card className="text-center">
            <div className="flex items-center justify-center mb-2">
              <TargetIcon className="w-6 h-6 text-danger" />
            </div>
            <p className="text-3xl font-bold text-danger">
              {totalEstimatedTime}
            </p>
            <p className="text-sm text-neutral-medium">Min Remaining</p>
          </Card>
        </div>
      )}

      <div className="animate-fade-in">
        {hasAnyRecsBeforeFilter && (
          <Card className="mb-8">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold font-display text-neutral-extradark">
                  Filter & Sort
                </h3>
                {completedCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllCompleted}
                    className="!text-sm !py-1.5"
                  >
                    Clear Completed
                  </Button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Type:</span>
                  <FilterButton
                    onClick={() => setContentTypeFilter("all")}
                    isActive={contentTypeFilter === "all"}
                  >
                    All
                  </FilterButton>
                  <FilterButton
                    onClick={() => setContentTypeFilter("video")}
                    isActive={contentTypeFilter === "video"}
                  >
                    Video
                  </FilterButton>
                  <FilterButton
                    onClick={() => setContentTypeFilter("article")}
                    isActive={contentTypeFilter === "article"}
                  >
                    Article
                  </FilterButton>
                  <FilterButton
                    onClick={() => setContentTypeFilter("practice")}
                    isActive={contentTypeFilter === "practice"}
                  >
                    Practice
                  </FilterButton>
                </div>

                <div className="w-px h-5 bg-neutral-light/50 hidden sm:block"></div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Difficulty:</span>
                  <FilterButton
                    onClick={() => setDifficultyFilter("all")}
                    isActive={difficultyFilter === "all"}
                  >
                    All
                  </FilterButton>
                  <FilterButton
                    onClick={() => setDifficultyFilter("easy")}
                    isActive={difficultyFilter === "easy"}
                  >
                    Easy
                  </FilterButton>
                  <FilterButton
                    onClick={() => setDifficultyFilter("medium")}
                    isActive={difficultyFilter === "medium"}
                  >
                    Medium
                  </FilterButton>
                  <FilterButton
                    onClick={() => setDifficultyFilter("hard")}
                    isActive={difficultyFilter === "hard"}
                  >
                    Hard
                  </FilterButton>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-3 pt-3 border-t border-neutral-light/50">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold">Sort by:</span>
                  <FilterButton
                    onClick={() => setSortBy("priority")}
                    isActive={sortBy === "priority"}
                  >
                    Priority
                  </FilterButton>
                  <FilterButton
                    onClick={() => setSortBy("difficulty")}
                    isActive={sortBy === "difficulty"}
                  >
                    Difficulty
                  </FilterButton>
                  <FilterButton
                    onClick={() => setSortBy("duration")}
                    isActive={sortBy === "duration"}
                  >
                    Duration
                  </FilterButton>
                  <FilterButton
                    onClick={() => setSortBy("skill")}
                    isActive={sortBy === "skill"}
                  >
                    Skill
                  </FilterButton>
                </div>

                <div className="w-px h-5 bg-neutral-light/50 hidden sm:block"></div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showOnlyPriority}
                    onChange={(e) => setShowOnlyPriority(e.target.checked)}
                    className="w-4 h-4 text-primary border-neutral-light rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-semibold text-neutral-dark">
                    High Priority Only
                  </span>
                </label>
              </div>
            </div>
          </Card>
        )}

        {hasAnyRecsBeforeFilter && (
          <Card className="mb-8 bg-primary/5 border border-primary/20">
            <div className="flex items-center">
              <LightbulbIcon className="h-8 w-8 text-primary mr-4 shrink-0" />
              <div>
                <h3 className="text-lg font-bold text-primary-dark">
                  Your Personalized Focus Areas
                </h3>
                <p className="text-neutral-dark mt-1">
                  Based on your recent assessments, we've identified these key
                  areas for growth. Focusing on these topics will help you
                  improve your overall mastery.
                </p>
              </div>
            </div>
          </Card>
        )}

        {!studentSkills || studentSkills.length === 0 ? (
          <Card>
            <p className="text-center text-neutral-medium p-8">
              Complete an assessment to get your personalized recommendations!
            </p>
          </Card>
        ) : hasRecommendations ? (
          <div className="space-y-8">
            {Object.entries(personalizedRecommendations).map(
              ([topic, data]) => (
                <div key={topic}>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <h4 className="font-bold text-xl text-neutral-dark">
                      To improve on{" "}
                      <span className="text-primary">{topic}</span>
                    </h4>
                    <div
                      className={`px-3 py-1 text-sm font-bold rounded-full ${
                        // FIX: Cast `data` to its expected type to access properties.
                        (data as { score: number }).score < 40
                          ? "bg-danger/10 text-danger-dark"
                          : // FIX: Cast `data` to its expected type to access properties.
                          (data as { score: number }).score < 70
                          ? "bg-warning/10 text-warning-dark"
                          : "bg-success/10 text-success-dark"
                      }`}
                    >
                      {/* FIX: Cast `data` to its expected type to access properties. */}
                      Current Mastery: {(data as { score: number }).score}%
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* FIX: Cast `data` to its expected type to access properties. */}
                    {(data as { recs: LearningRecommendation[] }).recs.map(
                      (rec) => (
                        <RecommendationCard
                          key={rec.id}
                          recommendation={rec}
                          isCompleted={completedRecs.includes(rec.id)}
                          onToggleComplete={() => handleToggleComplete(rec.id)}
                        />
                      )
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        ) : hasAnyRecsBeforeFilter ? (
          <Card>
            <p className="text-center text-neutral-medium p-8">
              No recommendations match your current filters. Try a different
              selection!
            </p>
          </Card>
        ) : (
          <Card className="!bg-gradient-to-br from-success/20 to-green-300/20 text-center">
            <div className="p-8">
              <TrophyIcon className="h-16 w-16 text-success-dark mx-auto" />
              <h4 className="text-2xl font-bold font-display text-neutral-extradark mt-4">
                Congratulations!
              </h4>
              <p className="text-neutral-dark mt-2 max-w-md mx-auto">
                You've demonstrated strong proficiency across all topics in your
                last assessment. Keep up the fantastic work!
              </p>
            </div>
          </Card>
        )}
      </div>
    </>
  );
};

export default DynamicLearningPathView;
