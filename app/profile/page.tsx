"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  Award,
  Target,
  TrendingUp,
  Clock,
  DollarSign,
  FileText,
  Trophy,
  RefreshCw,
  Download,
} from "lucide-react";
import Link from "next/link";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import {
  calculateUserStats,
  getMockUserStats,
  getUserSubmissions,
  getRankColor,
  getScoreColor,
  getCompleteProfile,
  clearUserCache,
  exportUserData,
  type UserStats,
  type SubmissionWithDetails,
} from "@/lib/user-profile";
import { UserStatsGrid, SubmissionHistory } from "@/components/profile";
import { UserInfoCard } from "@/components/profile/UserInfoCard";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentSubmissions, setRecentSubmissions] = useState<
    SubmissionWithDetails[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showEmail, setShowEmail] = useState(false);

  const handleLogout = () => {
    logout();
  };

  const loadUserData = async (forceRefresh: boolean = false) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      if (forceRefresh) {
        setRefreshing(true);
        await clearUserCache(user.id);
      }

      console.log("📊 Loading user data for:", user.id);

      // Get complete profile using the new service
      const completeProfile = await getCompleteProfile(user.id);

      console.log("✅ Complete profile loaded:", completeProfile);

      setStats(completeProfile.stats);
      setRecentSubmissions(completeProfile.submissions.slice(0, 5)); // Show only recent 5
    } catch (error) {
      console.error("Error loading user data:", error);
      setError("載入用戶資料時發生錯誤");

      // Fallback to mock data in case of error
      console.log("⚠️ Using fallback mock data");
      const mockStats = getMockUserStats();
      setStats(mockStats);
      setRecentSubmissions([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    await loadUserData(true);
  };

  const handleExportData = async () => {
    if (!user) return;

    try {
      const userData = await exportUserData(user.id);

      // Create and download JSON file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `user-data-${user.id}-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting user data:", error);
      setError("匯出資料時發生錯誤");
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user]);

  const getUserInitials = (displayName?: string, email?: string) => {
    if (displayName) {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen overflow-x-hidden">
        <DashboardHeader user={user} onLogout={handleLogout} />

        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 overflow-x-hidden">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-b from-gray-800 to-gray-950 
                  hover:from-gray-700 hover:to-gray-800 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
              >
                <ArrowLeft className="h-4 mr-2 text-white" />
                <span className="text-white">返回儀表板</span>
              </Button>
            </Link>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">會員資訊</h1>
                <p className="text-gray-600 mt-2">查看您的評鑑調查統計和歷史記錄</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={refreshing}
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      refreshing ? "animate-spin" : ""
                    }`}
                  />
                  {refreshing ? "更新中..." : "重新整理"}
                </Button>
                {/*<Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  匯出資料
                </Button>*/}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <Card className="mb-8 border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-red-600">
                    <div className="text-sm">{error}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setError(null)}
                  >
                    關閉
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* User Info Card */}
          <div className="mb-5">
            <UserInfoCard user={user} stats={stats} />
          </div>

          {/** Statistics Grid */}
          {loading ? (
            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="pb-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Stats Grid */}
              {stats && (
                <div className="lg:col-span-2">
                  <UserStatsGrid stats={stats} />
                </div>
              )}

              {/* User Info Card */}
              {/* <div className="lg:col-span-1">
                <UserInfoCard />
                </div> */}
            </div>
          )}

          {/* 
            <div>
            <h2 className="text-xl font-semibold text-gray-900">
              評鑑調查紀錄簡報
            </h2>
            <p className="text-gray-600 mt-2">
              以下顯示您最近 5 筆評鑑調查的填寫紀錄
            </p>
            </div>
            */}
          {/* Recent Submissions */}
          {/* 
            {!loading && recentSubmissions.length > 0 && (
            <div className="mt-2">
              <SubmissionHistory submissions={recentSubmissions} />
            </div>
            )}
            */}
        </div>
      </div>
    </ProtectedRoute>
  );
}
