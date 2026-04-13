import React from "react";
import { View } from "../App";
import { Classroom, User } from "../types";
import {
  BarChartIcon,
  BookOpenIcon,
  BrainCircuitIcon,
  GiftIcon,
  GlobeIcon,
  HeartIcon,
  HomeIcon,
  LayoutGridIcon,
  LightbulbIcon,
  LineChartIcon,
  LogOutIcon,
  RadarIcon,
  RocketIcon,
  Share2Icon,
  SparklesIcon,
  TrendingUpIcon,
  UserIcon,
} from "./icons";

interface SidebarProps {
  user: User;
  activeView: View;
  onNavigate: (view: View, payload?: any) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  onCloseSidebar: () => void;
  classrooms: Classroom[];
  selectedClass: Classroom | null;
  hasLastResult: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  isActive,
  onClick,
  disabled,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center px-4 py-2.5 text-left text-sm font-bold rounded-lg transition-colors relative ${
      isActive
        ? "bg-primary/10 text-primary"
        : disabled
        ? "text-neutral-medium opacity-50 cursor-not-allowed"
        : "text-neutral-dark hover:bg-neutral-light/40"
    }`}
  >
    {isActive && (
      <div className="absolute left-0 top-2 bottom-2 w-1 bg-primary rounded-r-full"></div>
    )}
    <div
      className={`mr-3 ${
        isActive
          ? "text-primary"
          : disabled
          ? "text-neutral-medium"
          : "text-neutral"
      }`}
    >
      {icon}
    </div>
    {label}
  </button>
);

const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeView,
  onNavigate,
  onLogout,
  isSidebarOpen,
  onCloseSidebar,
  classrooms,
  selectedClass,
  hasLastResult,
}) => {
  const handleNavigation = (view: View, payload?: any) => {
    onNavigate(view, payload);
    onCloseSidebar(); // Close sidebar on navigation click (for mobile)
  };

  const StudentNav = () => (
    <nav className="flex flex-col flex-grow p-4 overflow-y-auto">
      <div className="space-y-1.5">
        <NavItem
          icon={<HomeIcon className="h-5 w-5" />}
          label="Dashboard"
          isActive={activeView === "dashboard"}
          onClick={() => handleNavigation("dashboard")}
        />

        <div className="pt-2">
          <h3 className="px-4 text-xs font-bold text-neutral-medium uppercase tracking-wider mb-2">
            Learn
          </h3>
          <NavItem
            icon={<TrendingUpIcon className="h-5 w-5" />}
            label="Recommendations"
            isActive={activeView === "dynamicLearningPath"}
            onClick={() => handleNavigation("dynamicLearningPath")}
          />
          <NavItem
            icon={<RocketIcon className="h-5 w-5" />}
            label="Personalized Plan"
            isActive={activeView === "personalizedLearningPath"}
            onClick={() => handleNavigation("personalizedLearningPath")}
          />
          <NavItem
            icon={<SparklesIcon className="h-5 w-5" />}
            label="Adaptive Practice"
            isActive={activeView === "aiGenerator"}
            onClick={() => handleNavigation("aiGenerator")}
          />
          <NavItem
            icon={<LightbulbIcon className="h-5 w-5" />}
            label="Voice Assistant"
            isActive={activeView === "voiceAssistant"}
            onClick={() => handleNavigation("voiceAssistant")}
          />
          <NavItem
            icon={<HeartIcon className="h-5 w-5" />}
            label="Emotion-Aware Learning"
            isActive={activeView === "emotionAwareLearning"}
            onClick={() => handleNavigation("emotionAwareLearning")}
          />
        </div>

        <div className="pt-2">
          <h3 className="px-4 text-xs font-bold text-neutral-medium uppercase tracking-wider mb-2">
            Analyze
          </h3>
          <NavItem
            icon={<LineChartIcon className="h-5 w-5" />}
            label="Progress Timeline"
            isActive={activeView === "progressTimeline"}
            onClick={() => handleNavigation("progressTimeline")}
          />
          <NavItem
            icon={<Share2Icon className="h-5 w-5" />}
            label="Knowledge Graph"
            isActive={activeView === "knowledgeGraph"}
            onClick={() => handleNavigation("knowledgeGraph")}
          />
          <NavItem
            icon={<RadarIcon className="h-5 w-5" />}
            label="Skill Radar"
            isActive={activeView === "skillRadar"}
            onClick={() => handleNavigation("skillRadar")}
          />
          <NavItem
            icon={<BarChartIcon className="h-5 w-5" />}
            label="Last Result"
            isActive={activeView === "results"}
            onClick={() => handleNavigation("results")}
            disabled={!hasLastResult}
          />
        </div>

        <div className="pt-2">
          <h3 className="px-4 text-xs font-bold text-neutral-medium uppercase tracking-wider mb-2">
            Engage
          </h3>
          <NavItem
            icon={<BrainCircuitIcon className="h-5 w-5" />}
            label="IQ Test"
            isActive={activeView === "iqTest"}
            onClick={() => handleNavigation("iqTest")}
          />
          <NavItem
            icon={<GlobeIcon className="h-5 w-5" />}
            label="Real-Life Context"
            isActive={activeView === "realLifeAppContext"}
            onClick={() => handleNavigation("realLifeAppContext")}
          />
          <NavItem
            icon={<GiftIcon className="h-5 w-5" />}
            label="Reward Store"
            isActive={activeView === "rewardStore"}
            onClick={() => handleNavigation("rewardStore")}
          />
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-black/5 space-y-1.5">
        <NavItem
          icon={<UserIcon className="h-5 w-5" />}
          label="My Profile"
          isActive={activeView === "userProfile"}
          onClick={() => handleNavigation("userProfile")}
        />
        <NavItem
          icon={<BookOpenIcon className="h-5 w-5" />}
          label="My Classrooms"
          isActive={
            activeView === "myClassrooms" || activeView === "studentClassroom"
          }
          onClick={() => handleNavigation("myClassrooms")}
        />
      </div>
    </nav>
  );

  const TeacherNav = () => (
    <nav className="flex-grow p-4 space-y-1.5 overflow-y-auto">
      <NavItem
        icon={<LayoutGridIcon className="h-5 w-5" />}
        label="Classrooms"
        isActive={activeView === "teacherDashboard"}
        onClick={() => handleNavigation("teacherDashboard")}
      />
      <NavItem
        icon={<LightbulbIcon className="h-5 w-5" />}
        label="Smart Class Insight"
        isActive={activeView === "smartClassInsight"}
        onClick={() => handleNavigation("smartClassInsight")}
      />
    </nav>
  );

  const sidebarContent = (
    <div className="flex flex-col h-full bg-surface/95 backdrop-blur-xl border-r border-black/5">
      <div className="px-6 py-5 border-b border-black/5">
        <div className="flex items-center">
          <BookOpenIcon className="h-8 w-8 text-primary" />
          <h1 className="ml-3 text-xl font-display font-bold text-neutral-extradark">
            EduSense AI
          </h1>
        </div>
      </div>

      {user.role === "teacher" ? <TeacherNav /> : <StudentNav />}

      <div className="p-4 border-t border-black/5">
        <button
          onClick={onLogout}
          className="w-full flex items-center px-4 py-2.5 text-left text-sm font-bold rounded-lg transition-colors text-neutral-dark hover:bg-danger/10 hover:text-danger-dark"
        >
          <LogOutIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-300 ${
          isSidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onCloseSidebar}
        aria-hidden="true"
      ></div>
      <aside
        className={`fixed inset-y-0 left-0 w-64 z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
