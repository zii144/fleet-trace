"use client";
import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { getQuestionnaires } from "@/lib/questionnaire";
import type { Questionnaire } from "@/types/questionnaire";
import { useRouter, useSearchParams } from "next/navigation";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { PromoModal } from "@/components/PromoModal";
import { usePromoModal } from "@/hooks/use-promo-modal";
import { usePromotionCover } from "@/hooks/use-promotion-cover";
import {
  DashboardHeader,
  QuestionnaireGrid,
  SuccessAlert,
  DashboardStatsGrid,
} from "@/components/dashboard";
import { PromotionCover } from "@/components/PromotionCover";
import { PromotionIndicator } from "@/components/PromotionIndicator";
import { getAllActivePromotions } from "@/lib/promotion-config";
import { Banner } from "@/components/ui/Banner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { UserStatsGrid } from "@/components/profile/UserStatsGrid";
import type { UserStats } from "@/types/user";
import { calculateUserStats } from "@/lib/user-profile";
import { UserInfoCard } from "@/components/profile/UserInfoCard";
import { SessionStatus } from "@/components/auth/SessionStatus";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [questionnaireVisible, setQuestionnaireVisible] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const showSuccessAlert = searchParams.get("success") === "true";

  // Promotional modal state
  const {
    isOpen: isPromoOpen,
    hideModal: hidePromoModal,
    showModal: showPromoModal,
    dismissPermanently: dismissPromoModal,
  } = usePromoModal();

  // Promotion cover state
  const {
    isVisible: isPromotionCoverVisible,
    showCover: showPromotionCover,
    hideCover: hidePromotionCover,
    dismissPermanently: dismissPromotionCover,
  } = usePromotionCover();

  // Get all active promotions
  const activePromotions = getAllActivePromotions();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Load questionnaires - show all taxi service quality surveys
        const allQuestionnaires = getQuestionnaires();
        const filteredQuestionnaires = allQuestionnaires.filter((q) =>
          q.id.includes("-taxi-service-quality-survey")
        );
        setQuestionnaires(filteredQuestionnaires);

        // Load user stats if user is logged in
        if (user?.id) {
          const stats = await calculateUserStats(user.id);
          setUserStats(stats);
        }
      } catch (err) {
        console.error("Error loading data:", err);
        setError("無法載入資料，請重新整理頁面。");
        setQuestionnaires([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Trigger animations after data loads
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [user?.id]);

  // Scroll animation effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Intersection Observer for questionnaire section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setQuestionnaireVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const questionnaireSection = document.getElementById(
      "questionnaire-section"
    );
    if (questionnaireSection) {
      observer.observe(questionnaireSection);
    }

    return () => {
      if (questionnaireSection) {
        observer.unobserve(questionnaireSection);
      }
    };
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleCloseSuccessAlert = () => {
    router.replace("/dashboard");
  };

  const handlePromoGetStarted = () => {
    router.push("/dashboard");
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden">
        <DashboardHeader
          user={user as any}
          onLogout={handleLogout}
          onShowPromo={undefined}
        />
        {/* Hero Section with Background */}
        <div className="relative min-h-screen">
          {/* Background Banner */}
          <div className="absolute inset-0 w-full h-full">
            <Banner
              backgroundImage="/static-background/bg1.jpg"
              className="w-full h-full object-cover animate-float"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-orange-100/40 to-white/100 animate-pulse-glow"></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10">
            {showSuccessAlert && <SuccessAlert />}

            {/* Hero Welcome Section */}
            <div
              className={`pt-16 pb-8 text-center transition-all duration-1000 ease-out ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
            >
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1
                  className={`text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg transition-all duration-1000 delay-200 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  歡迎回來
                </h1>
                <p
                  className={`md:text-2xl text-white/90 mb-8 drop-shadow-md transition-all duration-1000 delay-400 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  繼續您的騎行體驗分享之旅
                </p>
              </div>
            </div>

            {/* User Stats Cards - Floating over the background */}
            <div
              className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 transition-all duration-1000 delay-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-12"
              }`}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* User Info Card */}
                {!isLoading && userStats && (
                  <div
                    className={`backdrop-blur-sm bg-white/20 rounded-2xl border border-white/20 shadow-2xl transition-all duration-700 delay-600 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                  >
                    <UserInfoCard
                      user={user}
                      stats={userStats}
                      className="bg-transparent border-none shadow-none"
                    />
                  </div>
                )}
                {/* Dashboard Stats Grid */}
                {!isLoading && userStats && (
                  <div
                    className={`backdrop-blur-sm bg-white/20 rounded-2xl border border-white/20 shadow-2xl p-6 transition-all duration-700 delay-700 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                  >
                    <DashboardStatsGrid stats={userStats} />
                  </div>
                )}
                {/* Session Status */}
                <div
                  className={`transition-all duration-700 delay-800 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <SessionStatus />
                </div>
              </div>
            </div>

            {/* Main Content Section */}
            <div className="">
              <div className="max-w-7xl mx-auto px-4 pb-12 sm:px-6 lg:px-8">
                <div
                  className={`mb-6 transition-all duration-1000 delay-800 ${
                    isVisible
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-8"
                  }`}
                >
                  <h1 className="text-3xl font-bold text-white drop-shadow-lg mb-2">
                    評鑑調查儀表板
                  </h1>
                  <p className="text-white/80 drop-shadow-lg">
                    選擇一個評鑑調查開始填寫
                  </p>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-lg">
                    <p className="text-red-800">{error}</p>
                  </div>
                )}

                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    <p className="mt-2 text-gray-600">載入評鑑調查中...</p>
                  </div>
                ) : (
                  <div
                    id="questionnaire-section"
                    className={`transition-all duration-1000 ease-in-out pb-12 -mt-5 ${
                      questionnaireVisible
                        ? "opacity-0 translate-y-0"
                        : "opacity-100 translate-y-8"
                    }`}
                  >
                    <QuestionnaireGrid
                      questionnaires={questionnaires}
                      user={user as any}
                      animateCards={questionnaireVisible}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Promotion Window - Disabled */}
      {/* <PromoModal
        isOpen={isPromoOpen}
        onClose={hidePromoModal}
        onGetStarted={handlePromoGetStarted}
        onDismissPermanently={dismissPromoModal}
      /> */}

      {/* Full-screen promotion cover */}
      {isPromotionCoverVisible && activePromotions.length > 0 && (
        <PromotionCover
          promotions={activePromotions}
          onClose={hidePromotionCover}
          onDismissPermanently={dismissPromotionCover}
        />
      )}
    </ProtectedRoute>
  );
}
