import React from "react";
import { LearningRecommendation } from "../types";
import Button from "./Button";
import Card from "./Card";
import {
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  FileTextIcon,
  FlameIcon,
  PlayCircleIcon,
} from "./icons";

interface RecommendationCardProps {
  recommendation: LearningRecommendation;
  isCompleted: boolean;
  onToggleComplete: () => void;
}

const contentTypeIcons = {
  video: <PlayCircleIcon className="h-5 w-5" />,
  article: <FileTextIcon className="h-5 w-5" />,
  practice: <DumbbellIcon className="h-5 w-5" />,
};

const difficultyColors = {
  easy: "bg-success/20 text-success-dark",
  medium: "bg-warning/20 text-warning-dark",
  hard: "bg-danger/20 text-danger-dark",
};

const RecommendationCard: React.FC<RecommendationCardProps> = ({
  recommendation,
  isCompleted,
  onToggleComplete,
}) => {
  const {
    title,
    skill,
    contentType,
    duration,
    difficulty,
    thumbnail,
    priority,
    description,
    youtubeSearchQuery,
    googleSearchQuery,
    keyTopics,
    source,
  } = recommendation;

  const openYouTubeSearch = () => {
    if (youtubeSearchQuery) {
      window.open(
        `https://www.youtube.com/results?search_query=${encodeURIComponent(
          youtubeSearchQuery
        )}`,
        "_blank"
      );
    }
  };

  const openGoogleSearch = () => {
    if (googleSearchQuery) {
      window.open(
        `https://www.google.com/search?q=${encodeURIComponent(
          googleSearchQuery
        )}`,
        "_blank"
      );
    }
  };

  return (
    <Card
      className={`!p-0 flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus-within:-translate-y-1 focus-within:shadow-xl ${
        isCompleted
          ? "ring-2 ring-success/30"
          : "hover:ring-2 hover:ring-primary/30"
      }`}
    >
      <div className="relative">
        <img
          src={thumbnail}
          alt={title}
          className={`w-full h-40 object-cover rounded-t-2xl ${
            isCompleted ? "opacity-60" : ""
          }`}
        />
        <div
          className={`absolute top-4 right-4 flex items-center bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-neutral-dark shadow-lg`}
        >
          {contentTypeIcons[contentType]}
          <span className="ml-1.5 capitalize">{contentType}</span>
        </div>
        {source === "ai" && (
          <div className="absolute top-4 right-4 mr-20 flex items-center bg-primary/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
            ✨ AI
          </div>
        )}
        {isCompleted && (
          <div className="absolute top-4 left-4 flex items-center bg-success/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-lg animate-fade-in">
            <CheckIcon className="h-4 w-4 mr-1" />
            <span>Completed</span>
          </div>
        )}
        {priority === "high" && !isCompleted && (
          <div className="absolute bottom-4 left-4 flex items-center bg-danger/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
            <FlameIcon className="h-4 w-4 mr-1" />
            <span>High Priority</span>
          </div>
        )}
        {priority === "medium" && !isCompleted && (
          <div className="absolute bottom-4 left-4 flex items-center bg-warning/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-semibold text-white shadow-lg">
            <span>Recommended</span>
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <span className="text-sm font-semibold text-primary uppercase tracking-wide">
          {skill}
        </span>
        <h3
          className={`font-bold text-lg text-neutral-extradark mt-2 leading-tight ${
            isCompleted ? "line-through opacity-70" : ""
          }`}
        >
          {title}
        </h3>

        {description && (
          <p className="text-sm text-neutral-medium mt-2 line-clamp-2">
            {description}
          </p>
        )}

        {keyTopics && keyTopics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {keyTopics.slice(0, 3).map((topic, idx) => (
              <span
                key={idx}
                className="text-xs bg-primary/10 text-primary-dark px-2 py-0.5 rounded-full"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-4 text-sm text-neutral-medium">
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold capitalize ${difficultyColors[difficulty]}`}
          >
            {difficulty}
          </span>
          <div className="flex items-center font-semibold">
            <ClockIcon className="h-4 w-4 mr-1.5" />
            <span>{duration} min</span>
          </div>
        </div>

        {/* External Resource Buttons */}
        {(youtubeSearchQuery || googleSearchQuery) && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {youtubeSearchQuery && (
              <Button
                variant="outline"
                className="!py-2 !text-xs"
                onClick={openYouTubeSearch}
              >
                🎥 YouTube
              </Button>
            )}
            {googleSearchQuery && (
              <Button
                variant="outline"
                className="!py-2 !text-xs"
                onClick={openGoogleSearch}
              >
                🔍 Google
              </Button>
            )}
          </div>
        )}

        <Button
          variant={isCompleted ? "outline" : "primary"}
          className={`w-full mt-4 !py-2.5 !font-bold transition-all ${
            !isCompleted ? "hover:scale-[1.02]" : ""
          }`}
          onClick={onToggleComplete}
        >
          {isCompleted ? "↻ Review Again" : "✓ Mark as Complete"}
        </Button>
      </div>
    </Card>
  );
};

export default RecommendationCard;
