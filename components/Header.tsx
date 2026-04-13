import React, { useEffect, useRef, useState } from "react";
import { View } from "../App";
import { Notification, User } from "../types";
import Button from "./Button";
import {
    ArrowLeftIcon,
    BellIcon,
    BookOpenIcon,
    LightbulbIcon,
    LogOutIcon,
    MenuIcon,
    PlayCircleIcon,
    SparklesIcon,
    UserIcon,
} from "./icons";

interface HeaderProps {
  user: User;
  onLogout: () => void;
  onToggleSidebar: () => void;
  activeView: View;
  onOpenJoinClassModal: () => void;
  onOpenAssessmentModal: () => void;
  onNavigateToSmartClassInsight?: () => void;
  onNavigateToMyClassrooms?: () => void;
  onNavigateToUserProfile: () => void;
  notifications: Notification[];
  onMarkNotificationsRead: (id?: string) => void;
  onBack: () => void;
  hasHistory: boolean;
}

const formatTimeAgo = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.round((now.getTime() - date.getTime()) / 1000);
  const minutes = Math.round(seconds / 60);
  const hours = Math.round(minutes / 60);
  const days = Math.round(hours / 24);

  if (seconds < 60) return `${seconds}s ago`;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

const Header: React.FC<HeaderProps> = ({
  user,
  onLogout,
  onToggleSidebar,
  activeView,
  onOpenJoinClassModal,
  onOpenAssessmentModal,
  onNavigateToSmartClassInsight,
  onNavigateToMyClassrooms,
  onNavigateToUserProfile,
  notifications,
  onMarkNotificationsRead,
  onBack,
  hasHistory,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [animateXp, setAnimateXp] = useState(false);
  const prevXp = useRef(user.xp);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (
      user.xp !== undefined &&
      prevXp.current !== undefined &&
      user.xp > prevXp.current
    ) {
      setAnimateXp(true);
      const timer = setTimeout(() => setAnimateXp(false), 1000); // Animation duration
      return () => clearTimeout(timer);
    }
  }, [user.xp]);

  useEffect(() => {
    prevXp.current = user.xp;
  }, [user.xp]);

  return (
    <header className="sticky top-0 z-20 bg-gradient-to-r from-white/80 via-white/70 to-white/80 backdrop-blur-2xl border-b border-gradient-to-r from-primary/10 via-secondary/10 to-primary/10 shadow-sm">
      <style>{`
          @keyframes xp-gain {
            0% { transform: scale(1); background-color: transparent; }
            50% { transform: scale(1.1); background-color: #FBBF24; color: white; }
            100% { transform: scale(1); background-color: transparent; }
          }
          .animate-xp-gain {
            animation: xp-gain 1s ease-out;
          }
        `}</style>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <button
              onClick={onToggleSidebar}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-xl text-neutral-dark hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300"
              aria-label="Open sidebar"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            {hasHistory && (
              <button
                onClick={onBack}
                className="ml-2 flex items-center gap-2 px-3 py-2 rounded-xl text-neutral-dark hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-300 group"
                aria-label="Go back"
              >
                <ArrowLeftIcon className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
                <span className="hidden sm:inline font-semibold">
                  Back
                </span>
              </button>
            )}
          </div>

          <div className="flex-1 flex justify-end items-center">
            {user.role === "student" && (
              <div className="flex items-center gap-2 sm:gap-4 mr-2 sm:mr-4">
                <div
                  className={`flex items-center gap-2 font-bold bg-gradient-to-r from-amber-400 to-yellow-500 text-white px-4 py-2 rounded-full text-sm shadow-md hover:shadow-lg transition-all duration-300 ${
                    animateXp ? "animate-xp-gain" : ""
                  }`}
                >
                  <SparklesIcon className="h-4 w-4" />
                  <span>{user.xp ?? 0} XP</span>
                </div>
                {onNavigateToMyClassrooms && (
                  <Button
                    variant="outline"
                    onClick={onNavigateToMyClassrooms}
                    className="!py-2 !px-3 hidden sm:inline-flex"
                  >
                    <BookOpenIcon className="h-4 w-4 mr-2" />
                    My Classroom
                  </Button>
                )}
                <Button
                  variant="secondary"
                  onClick={onOpenJoinClassModal}
                  className="!py-2 !px-3 hidden sm:inline-flex"
                >
                  <UserIcon className="h-4 w-4 mr-2" />
                  Join Class
                </Button>
                <Button
                  onClick={onOpenAssessmentModal}
                  className="!py-2 !px-3 hidden sm:inline-flex"
                >
                  <PlayCircleIcon className="h-4 w-4 mr-2" />
                  Start Assessment
                </Button>
              </div>
            )}

            {user.role === "teacher" && onNavigateToSmartClassInsight && (
              <div className="flex items-center gap-4 mr-4">
                <Button
                  variant="secondary"
                  onClick={onNavigateToSmartClassInsight}
                  className="!py-2 !px-4 hidden sm:inline-flex"
                >
                  <LightbulbIcon className="h-4 w-4 mr-2" />
                  Smart Class Insight
                </Button>
              </div>
            )}

            <div className="relative">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2.5 rounded-xl text-neutral-dark hover:text-primary hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 transition-all duration-300 relative"
                aria-label={`${unreadCount} unread notifications`}
              >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-danger to-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
              {isNotificationOpen && (
                <div className="origin-top-right absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-2xl ring-1 ring-black/5 focus:outline-none animate-fade-in overflow-hidden">
                  <div className="p-4 flex justify-between items-center bg-gradient-to-r from-primary/5 via-secondary/5 to-primary/5 border-b border-black/5">
                    <h3 className="font-bold text-neutral-extradark flex items-center gap-2">
                      <BellIcon className="h-5 w-5 text-primary" />
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => onMarkNotificationsRead()}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-black/5 last:border-0 ${
                            !n.read ? "bg-primary/5" : ""
                          }`}
                        >
                          <p className="text-sm text-neutral-dark">{n.text}</p>
                          <p className="text-xs text-neutral-medium mt-1">
                            {formatTimeAgo(n.timestamp)}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-sm text-neutral-medium">
                        No new notifications.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative ml-3">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-secondary/10 transition-all duration-300"
              >
                <img
                  className="h-9 w-9 rounded-full ring-2 ring-white shadow-md"
                  src={user.avatar}
                  alt="User avatar"
                />
                <span className="hidden sm:inline text-sm font-semibold text-neutral-extradark">
                  {user.name}
                </span>
              </button>
              {isDropdownOpen && (
                <div
                  className="origin-top-right absolute right-0 mt-3 w-56 rounded-2xl shadow-2xl bg-white/95 backdrop-blur-2xl ring-1 ring-black/5 focus:outline-none animate-fade-in overflow-hidden"
                  role="menu"
                  aria-orientation="vertical"
                >
                  <div className="py-1" role="none">
                    {user.role === "student" && (
                      <div className="sm:hidden border-b border-black/10 mb-1 pb-1">
                        <button
                          onClick={() => {
                            onNavigateToMyClassrooms?.();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-left text-neutral-dark hover:bg-primary/10 hover:text-primary-dark"
                          role="menuitem"
                        >
                          <BookOpenIcon className="h-5 w-5 mr-3" />
                          My Classrooms
                        </button>
                        <button
                          onClick={() => {
                            onOpenJoinClassModal();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-left text-neutral-dark hover:bg-secondary/10 hover:text-secondary-dark"
                          role="menuitem"
                        >
                          <UserIcon className="h-5 w-5 mr-3" />
                          Join a Classroom
                        </button>
                        <button
                          onClick={() => {
                            onOpenAssessmentModal();
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center px-4 py-2 text-sm text-left text-neutral-dark hover:bg-primary/10 hover:text-primary-dark"
                          role="menuitem"
                        >
                          <PlayCircleIcon className="h-5 w-5 mr-3" />
                          Start Assessment
                        </button>
                      </div>
                    )}
                    {user.role === "teacher" &&
                      onNavigateToSmartClassInsight && (
                        <div className="sm:hidden border-b border-black/10 mb-1 pb-1">
                          <button
                            onClick={() => {
                              onNavigateToSmartClassInsight();
                              setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-left text-neutral-dark hover:bg-secondary/10 hover:text-secondary-dark"
                            role="menuitem"
                          >
                            <LightbulbIcon className="h-5 w-5 mr-3" />
                            Smart Class Insight
                          </button>
                        </div>
                      )}
                    <button
                      onClick={() => {
                        onNavigateToUserProfile();
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center px-4 py-2 text-sm text-left text-neutral-dark hover:bg-primary/10 hover:text-primary-dark"
                      role="menuitem"
                    >
                      <UserIcon className="h-5 w-5 mr-3" />
                      My Profile
                    </button>
                    <button
                      onClick={onLogout}
                      className="w-full flex items-center px-4 py-2 text-sm text-left text-neutral-dark hover:bg-danger/10 hover:text-danger-dark"
                      role="menuitem"
                    >
                      <LogOutIcon className="h-5 w-5 mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
