import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Calendar, Trophy, TrendingUp } from "lucide-react";
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
        <Card className="">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              預計獲得 Line Points
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.cashVoucher || 0} 點
            </div>
            <p className="text-xs text-muted-foreground mt-1">從平台獲取</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
