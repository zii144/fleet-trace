"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { routeCompletionService } from "@/lib/services/RouteCompletionService";
import type {
  CategoryQuotaSummary,
  RouteQuotaInfo,
} from "@/types/route-submission";

interface RouteCompletionDashboardProps {
  questionnaireId: string;
}

export function RouteCompletionDashboard({
  questionnaireId,
}: RouteCompletionDashboardProps) {
  const [quotaData, setQuotaData] = useState<CategoryQuotaSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadQuotaData = async () => {
    setIsLoading(true);
    try {
      const data = await routeCompletionService.getCategoryQuotaSummary(
        questionnaireId
      );
      setQuotaData(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error loading quota data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotaData();
  }, [questionnaireId]);

  const getTotalStats = () => {
    const totalRoutes = quotaData.reduce(
      (sum, category) => sum + category.totalRoutes,
      0
    );
    const totalLimit = quotaData.reduce(
      (sum, category) => sum + category.totalLimit,
      0
    );
    const totalCompletions = quotaData.reduce(
      (sum, category) => sum + category.totalCompletions,
      0
    );
    const totalRemaining = quotaData.reduce(
      (sum, category) => sum + category.totalRemaining,
      0
    );
    const fullRoutes = quotaData.reduce(
      (sum, category) =>
        sum + category.routes.filter((route) => route.isFull).length,
      0
    );

    return {
      totalRoutes,
      totalLimit,
      totalCompletions,
      totalRemaining,
      fullRoutes,
      completionPercentage:
        totalLimit > 0 ? Math.round((totalCompletions / totalLimit) * 100) : 0,
    };
  };

  const stats = getTotalStats();

  const getStatusIcon = (route: RouteQuotaInfo) => {
    if (route.isFull) {
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    } else if (route.completionPercentage >= 80) {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (route: RouteQuotaInfo) => {
    if (route.isFull) {
      return "text-red-600 dark:text-red-400";
    } else if (route.completionPercentage >= 80) {
      return "text-yellow-600 dark:text-yellow-400";
    } else {
      return "text-green-600 dark:text-green-400";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">載入中...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">路線完成度追蹤</h2>
          <p className="text-gray-600 dark:text-gray-400">
            問卷 ID: {questionnaireId}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              最後更新: {lastUpdated.toLocaleString("zh-TW")}
            </span>
          )}
          <Button onClick={loadQuotaData} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            重新整理
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總路線數</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoutes}</div>
            <p className="text-xs text-muted-foreground">涵蓋所有類別</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總配額</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLimit}</div>
            <p className="text-xs text-muted-foreground">可收集總數</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCompletions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completionPercentage}% 完成度
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">剩餘配額</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRemaining}</div>
            <p className="text-xs text-muted-foreground">
              {stats.fullRoutes} 條路線已額滿
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>整體完成進度</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>完成度</span>
              <span>{stats.completionPercentage}%</span>
            </div>
            <Progress value={stats.completionPercentage} className="w-full" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {stats.totalCompletions} / {stats.totalLimit}
              </span>
              <span>剩餘 {stats.totalRemaining} 份</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">全部</TabsTrigger>
          {quotaData.map((category) => (
            <TabsTrigger key={category.category} value={category.category}>
              {category.categoryName}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {quotaData.map((category) => (
            <Card key={category.category}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {category.totalCompletions}/{category.totalLimit}
                    </Badge>
                    <Badge
                      variant={
                        category.totalRemaining === 0
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {category.totalRemaining} 剩餘
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>路線名稱</TableHead>
                      <TableHead>完成度</TableHead>
                      <TableHead>進度</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>剩餘配額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.routes.map((route) => (
                      <TableRow key={route.routeId}>
                        <TableCell className="font-medium">
                          {route.routeName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(route)}
                            <span className={getStatusColor(route)}>
                              {route.completionPercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Progress
                            value={route.completionPercentage}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={route.isFull ? "destructive" : "secondary"}
                          >
                            {route.isFull ? "已額滿" : "收集中"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getStatusColor(route)}>
                            {route.remainingQuota}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {quotaData.map((category) => (
          <TabsContent key={category.category} value={category.category}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{category.categoryName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {category.totalCompletions}/{category.totalLimit}
                    </Badge>
                    <Badge
                      variant={
                        category.totalRemaining === 0
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {category.totalRemaining} 剩餘
                    </Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>路線名稱</TableHead>
                      <TableHead>完成度</TableHead>
                      <TableHead>進度</TableHead>
                      <TableHead>狀態</TableHead>
                      <TableHead>剩餘配額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {category.routes.map((route) => (
                      <TableRow key={route.routeId}>
                        <TableCell className="font-medium">
                          {route.routeName}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(route)}
                            <span className={getStatusColor(route)}>
                              {route.completionPercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Progress
                            value={route.completionPercentage}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={route.isFull ? "destructive" : "secondary"}
                          >
                            {route.isFull ? "已額滿" : "收集中"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className={getStatusColor(route)}>
                            {route.remainingQuota}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
