import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Calendar,
  Trophy,
  TrendingUp,
  Target,
  Clock,
} from "lucide-react";
import type { UserStats } from "@/types/user";

interface DashboardStatsGridProps {
  stats: UserStats;
  className?: string;
}

export function DashboardStatsGrid({
  stats,
  className = "",
}: DashboardStatsGridProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "鑽石會員":
        return "text-purple-600 bg-purple-100";
      case "金牌會員":
        return "text-yellow-600 bg-yellow-100";
      case "銀牌會員":
        return "text-gray-600 bg-gray-100";
      case "銅牌會員":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-blue-600 bg-blue-100";
    }
  };

  return (
    <div className={`h-full flex flex-col space-y-4 ${className}`}>
      {/* Main Stats Row */}
      <div className="grid grid-cols-1 gap-4 flex-1">
        {/* Total Submissions */}
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總提交次數</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.totalSubmissions}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <Calendar className="w-3 h-3 mr-1" />
              上次提交：{formatDate(stats.lastSubmission)}
            </p>

            {/* !! Hardcoded "11" for now since 10 route questionnaires are available and 1 is the self-info questionnaire */}
            {stats.totalSubmissions >= 11 && (
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <TrendingUp className="w-3 h-3 mr-1" />
                您已達本次獎勵活動的最高獎勵
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cash Voucher */}
        {/*<Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">現金券餘額</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.cashVoucher || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">從平台獲取</p>
          </CardContent>
        </Card>*/}
      </div>

      {/* Secondary Stats Row */}
      {/*<div className="grid grid-cols-2 gap-4 flex-1">
        {/* Member Rank */}
      {/*<Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">會員等級</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge
              className={`${getRankColor(
                stats.rank
              )} text-sm pointer-events-none select-none`}
            >
              {stats.rank}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              {stats.totalSubmissions < 10 &&
                `還需 ${10 - stats.totalSubmissions} 份問卷升級`}
              {stats.totalSubmissions >= 10 &&
                stats.totalSubmissions < 20 &&
                `還需 ${20 - stats.totalSubmissions} 份問卷升級`}
              {stats.totalSubmissions >= 20 && "已達高級會員"}
            </p>
          </CardContent>
        </Card>*/}

      {/* Referral Cash */}
      {/*<Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">推薦獎勵</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              ${stats.referralCashVoucher || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">推薦朋友獲得</p>
          </CardContent>
        </Card>*/}
      {/*</div>*/}

      {/* Progress Indicator */}
      {/*<Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">本月進度</span>
            <span className="text-sm text-muted-foreground">
              {Math.min(stats.totalSubmissions, 10)}/10 問卷
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min((stats.totalSubmissions / 10) * 100, 100)}%`,
              }}
            ></div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            完成更多問卷以獲得更多獎勵
          </p>
        </CardContent>
      </Card>*/}
    </div>
  );
}
