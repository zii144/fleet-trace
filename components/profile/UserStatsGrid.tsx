import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Target,
  TrendingUp,
  Trophy,
  Calendar,
  Award,
  Clock,
  Smartphone,
  Monitor,
  Tablet,
  Zap,
  BarChart3,
  Flame,
  Activity,
} from "lucide-react";
import type { UserStats } from "@/lib/user-profile";

interface UserStatsGridProps {
  stats: UserStats;
}

export function UserStatsGrid({ stats }: UserStatsGridProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getPerformanceLevel = (performance: number) => {
    if (performance >= 60) return { level: "優秀", color: "text-green-600" };
    if (performance >= 30) return { level: "可進步", color: "text-yellow-600" };
    return { level: "未完成任何問卷", color: "text-red-600" };
  };

  const performance = getPerformanceLevel(stats.availableQuestionnaireRate);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}小時 ${minutes}分鐘`;
    }
    return `${minutes}分鐘`;
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case "mobile":
        return <Smartphone className="w-3 h-3" />;
      case "tablet":
        return <Tablet className="w-3 h-3" />;
      default:
        return <Monitor className="w-3 h-3" />;
    }
  };

  const getQualityColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getStreakColor = (streak: number) => {
    if (streak >= 10) return "text-orange-600";
    if (streak >= 5) return "text-yellow-600";
    return "text-blue-600";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Total Submissions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">總提交次數</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
          <p className="text-xs text-muted-foreground flex items-center mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            上次提交：{formatDate(stats.lastSubmission)}
          </p>
        </CardContent>
      </Card>

      {/* Average Score */}
      {/* 
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">可用問卷填寫率</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
        {stats.availableQuestionnaireRate || "數據未提供"}%
          </div>
          <p
        className={`text-xs font-medium ${performance.color} flex items-center mt-1`}
          >
        <Award className="w-3 h-3 mr-1" />
        表現：{performance.level}
          </p>
        </CardContent>
      </Card>
      */}

      {/* Completion Rate */}
      {/*
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">問卷填寫總字數</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.totalCharactersWritten || "數據未提供"}字
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            於問卷中填寫文宇的總數
          </p>
        </CardContent>
      </Card>
      */}

      {/* Total Points */}
      {/*
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">本月獲得現金劵</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ${stats.cashVoucher || "數據未提供"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            數值將於每月的1月1日重置
          </p>
        </CardContent>
      </Card>
      */}

      {/* Monthly Points */}
      {/*
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            從推薦功能獲取現金劵
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${stats.referralCashVoucher || "數據未提供"}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            推薦功能帶來的現金劵增長
          </p>
        </CardContent>
      </Card>

      {/* User Rank */}
      {/*
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">會員等級</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">{stats.rank}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.totalSubmissions < 10 &&
              `還需完成問卷 ${10 - stats.totalSubmissions} 份以達成升級條件`}
            {stats.totalSubmissions >= 10 &&
              stats.totalSubmissions < 15 &&
              `還需 ${15 - stats.totalSubmissions} 份以達成升級條件`}
            {stats.totalSubmissions >= 15 &&
              stats.totalSubmissions < 20 &&
              `還需 ${20 - stats.totalSubmissions} 份以達成升級條件`}
            {stats.totalSubmissions >= 20 &&
              stats.totalSubmissions < 30 &&
              `還需 ${30 - stats.totalSubmissions} 份以達成升級條件`}
            {stats.totalSubmissions >= 30 && "已達最高等級"}
          </p>
        </CardContent>
      </Card>
      */}

      {/* Enhanced Stats Cards */}

      {/* Time Statistics */}
      {/*
      {stats.totalTimeSpent !== undefined && stats.totalTimeSpent > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總填寫時間</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(stats.totalTimeSpent)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              平均每份問卷：{formatTime(stats.averageTimePerQuestionnaire || 0)}
            </p>
          </CardContent>
        </Card>
      )}
      */}

      {/* Quality Score */}
      {/*
      {stats.qualityScore !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">問卷品質分數</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getQualityColor(
                stats.qualityScore
              )}`}
            >
              {stats.qualityScore}/100
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              基於填寫整體完整性、參與度和時間投入
            </p>
          </CardContent>
        </Card>
      )}
      */}

      {/* Completion Streak */}
      {/*
      {stats.completionStreak !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成連續度</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div
              className={`text-2xl font-bold ${getStreakColor(
                stats.completionStreak
              )}`}
            >
              {stats.completionStreak}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              最長連續每日完成：{stats.longestStreak || 0}
            </p>
          </CardContent>
        </Card>
      )}
      */}

      {/* Perfect Completions */}
      {/*
      {stats.perfectCompletions !== undefined && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完美完成次數</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.perfectCompletions}次
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              100% 完成率的問卷次數
            </p>
          </CardContent>
        </Card>
      )}
      */}

      {/* Device Usage */}
      {/*
      {stats.deviceUsage &&
        Object.values(stats.deviceUsage).some((count) => count > 0) && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                裝置使用情況
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(stats.deviceUsage)
                  .filter(([_, count]) => count > 0)
                  .map(([device, count]) => (
                    <div
                      key={device}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {getDeviceIcon(device)}
                        <span className="text-sm capitalize">
                          {device === "desktop"
                            ? "電腦"
                            : device === "mobile"
                            ? "手機"
                            : "平板"}
                        </span>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {count}次
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      */}

      {/* Text and Map Interactions */}
      {/*
      {((stats.textResponsesCount !== undefined &&
        stats.textResponsesCount > 0) ||
        (stats.mapSelectionsCount !== undefined &&
          stats.mapSelectionsCount > 0)) && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">互動統計</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.textResponsesCount !== undefined &&
                stats.textResponsesCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">文字回答</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.textResponsesCount}次
                    </Badge>
                  </div>
                )}
              {stats.mapSelectionsCount !== undefined &&
                stats.mapSelectionsCount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">地圖選擇</span>
                    <Badge variant="outline" className="text-xs">
                      {stats.mapSelectionsCount}次
                    </Badge>
                  </div>
                )}
            </div>
          </CardContent>
        </Card>
      )}
      */}
    </div>
  );
}
