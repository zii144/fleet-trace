"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, MapPin, Users, Calendar, TrendingUp } from "lucide-react";
import { routeSubmissionService } from "@/lib/services/RouteSubmissionService";
import { getDefaultQuestionnaires } from "@/lib/questionnaire";
import styles from "./ProgressBar.module.css";

interface SubmissionStat {
  questionnaireId: string;
  routeId: string;
  routeName: string;
  totalSubmissions: number;
  uniqueUsers: number;
  lastSubmission: string;
}

export function RouteSubmissionDashboard() {
  const [submissionStats, setSubmissionStats] = useState<SubmissionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<string>("all");

  const questionnaires = getDefaultQuestionnaires();

  useEffect(() => {
    loadSubmissionStats();
  }, []);

  const loadSubmissionStats = async () => {
    setLoading(true);
    try {
      const stats = await routeSubmissionService.getSubmissionStatistics();
      setSubmissionStats(stats);
    } catch (error) {
      console.error("Error loading submission statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStats =
    selectedQuestionnaire === "all"
      ? submissionStats
      : submissionStats.filter(
          (stat) => stat.questionnaireId === selectedQuestionnaire
        );

  const getTotalStats = () => {
    const filtered = filteredStats;
    return {
      totalRoutes: filtered.length,
      totalSubmissions: filtered.reduce(
        (sum, stat) => sum + stat.totalSubmissions,
        0
      ),
      totalUniqueUsers: new Set(
        filtered.flatMap((stat) =>
          Array.from(
            { length: stat.uniqueUsers },
            (_, i) => `${stat.questionnaireId}-${stat.routeId}-${i}`
          )
        )
      ).size,
      mostPopularRoute: filtered.reduce(
        (max, stat) =>
          stat.totalSubmissions > (max?.totalSubmissions || 0) ? stat : max,
        null as SubmissionStat | null
      ),
    };
  };

  const totalStats = getTotalStats();

  const getQuestionnaireTitle = (questionnaireId: string) => {
    const questionnaire = questionnaires.find((q) => q.id === questionnaireId);
    return questionnaire?.title || questionnaireId;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">路線提交統計</h1>
          <p className="text-gray-600">查看和管理問卷路線提交數據</p>
        </div>
        <Button
          onClick={loadSubmissionStats}
          disabled={loading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          重新整理
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總路線數</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">
              {selectedQuestionnaire === "all" ? "所有問卷" : "當前問卷"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總提交數</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalSubmissions}
            </div>
            <p className="text-xs text-muted-foreground">
              跨所有路線的提交總數
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">獨立用戶</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalUniqueUsers}
            </div>
            <p className="text-xs text-muted-foreground">有提交記錄的用戶數</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">熱門路線</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold truncate">
              {totalStats.mostPopularRoute?.routeName || "暫無數據"}
            </div>
            <p className="text-xs text-muted-foreground">
              {totalStats.mostPopularRoute?.totalSubmissions || 0} 次提交
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>詳細路線統計</CardTitle>
            <div className="flex items-center gap-2">
              <label
                htmlFor="questionnaire-filter"
                className="text-sm font-medium"
              >
                問卷篩選:
              </label>
              <select
                id="questionnaire-filter"
                value={selectedQuestionnaire}
                onChange={(e) => setSelectedQuestionnaire(e.target.value)}
                className="px-3 py-1 border rounded-md text-sm"
                title="選擇要篩選的問卷"
              >
                <option value="all">所有問卷</option>
                {questionnaires.map((questionnaire) => (
                  <option key={questionnaire.id} value={questionnaire.id}>
                    {questionnaire.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">
              載入統計數據中...
            </div>
          ) : filteredStats.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              沒有找到路線提交數據
            </div>
          ) : (
            <div className="space-y-4">
              {filteredStats.map((stat, index) => (
                <div
                  key={`${stat.questionnaireId}-${stat.routeId}`}
                  className="p-4 border rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h3 className="font-medium">{stat.routeName}</h3>
                      <p className="text-sm text-gray-600">
                        {getQuestionnaireTitle(stat.questionnaireId)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {stat.totalSubmissions} 提交
                      </Badge>
                      <Badge variant="outline">{stat.uniqueUsers} 用戶</Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">問卷ID:</span>
                      <div className="font-mono text-xs">
                        {stat.questionnaireId}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">路線ID:</span>
                      <div className="font-mono text-xs">{stat.routeId}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">最後提交:</span>
                      <div className="text-xs">
                        {formatDate(stat.lastSubmission)}
                      </div>
                    </div>
                  </div>

                  {/* Progress bar showing submission frequency */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span>提交頻率</span>
                      <span>
                        {Math.round(
                          (stat.totalSubmissions /
                            Math.max(totalStats.totalSubmissions, 1)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`bg-blue-600 h-2 rounded-full ${styles.progressBar}`}
                        data-width={`${Math.round(
                          (stat.totalSubmissions /
                            Math.max(totalStats.totalSubmissions, 1)) *
                            100
                        )}%`}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Validation Rules Management */}
      <Card>
        <CardHeader>
          <CardTitle>驗證規則管理</CardTitle>
          <p className="text-sm text-gray-600">
            管理問卷的路線提交限制和驗證規則
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {questionnaires
              .filter((q) => q.routeTracking?.enabled)
              .map((questionnaire) => (
                <div key={questionnaire.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">{questionnaire.title}</h3>
                    <Badge
                      variant={
                        questionnaire.validationRules?.some((r) => r.isActive)
                          ? "default"
                          : "secondary"
                      }
                    >
                      {questionnaire.validationRules?.some((r) => r.isActive)
                        ? "有效規則"
                        : "無規則"}
                    </Badge>
                  </div>

                  {questionnaire.validationRules?.map((rule, index) => (
                    <div key={index} className="mt-2 p-3 bg-gray-50 rounded">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {rule.type === "route_submission_limit"
                            ? "路線提交限制"
                            : rule.type}
                        </span>
                        <Badge
                          variant={rule.isActive ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {rule.isActive ? "啟用" : "停用"}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>
                          執行方式:{" "}
                          {rule.enforcement === "block"
                            ? "封鎖"
                            : rule.enforcement === "warn"
                            ? "警告"
                            : "隱藏選項"}
                        </div>
                        <div>
                          每路線最大提交數:{" "}
                          {rule.config.maxSubmissionsPerRoute || "無限制"}
                        </div>
                        <div>錯誤訊息: {rule.errorMessage}</div>
                        {rule.warningMessage && (
                          <div>警告訊息: {rule.warningMessage}</div>
                        )}
                      </div>
                    </div>
                  ))}

                  {!questionnaire.validationRules?.length && (
                    <p className="text-sm text-gray-500 mt-2">
                      此問卷沒有配置驗證規則
                    </p>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default RouteSubmissionDashboard;
