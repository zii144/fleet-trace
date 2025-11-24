"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Plus,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BarChart3,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Database,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
} from "lucide-react";
import { routeCompletionService } from "@/lib/services/RouteCompletionService";
import { getAllKMLFiles, getKMLFilesByCategory } from "@/lib/kml-config";
import type {
  RouteCompletionTracking,
  RouteQuotaInfo,
  CategoryQuotaSummary,
} from "@/types/route-submission";

interface RouteCompletionManagementProps {
  userRole?: string;
}

export function RouteCompletionManagement({
  userRole,
}: RouteCompletionManagementProps) {
  const [trackingData, setTrackingData] = useState<RouteCompletionTracking[]>(
    []
  );
  const [filteredData, setFilteredData] = useState<RouteCompletionTracking[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestionnaire, setSelectedQuestionnaire] =
    useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Bulk operations
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [bulkOperation, setBulkOperation] = useState<string>("");

  // Edit dialog
  const [editingItem, setEditingItem] =
    useState<RouteCompletionTracking | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Sorting state
  const [sortField, setSortField] = useState<string>("routeName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Statistics
  const [statistics, setStatistics] = useState({
    totalRoutes: 0,
    totalSlots: 0,
    totalCompletions: 0,
    fullRoutes: 0,
    lowAvailabilityRoutes: 0,
  });

  // Load data on component mount
  useEffect(() => {
    loadTrackingData();
  }, []);

  // Apply filters when data or filters change
  useEffect(() => {
    applyFilters();
  }, [
    trackingData,
    searchTerm,
    selectedQuestionnaire,
    selectedCategory,
    selectedStatus,
    sortField,
    sortDirection,
  ]);

  const loadTrackingData = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Loading tracking data for admin...");

      // Get all route quotas for admin (no filtering)
      const allQuotas =
        await routeCompletionService.getAllRouteQuotasForAdmin();
      console.log("All quotas loaded:", allQuotas.length, allQuotas);

      // Convert to tracking data format
      const trackingData = allQuotas.map((quota) => ({
        id: quota.id || "",
        routeId: quota.routeId,
        routeName: quota.routeName,
        category: quota.category as any,
        questionnaireId: quota.questionnaireId || "",
        completionLimit: quota.completionLimit,
        currentCompletions: quota.currentCompletions,
        lastUpdated: quota.lastUpdated || new Date().toISOString(),
        isActive: quota.isActive || true,
        metadata: quota.metadata || { totalSubmissions: 0, uniqueUsers: 0 },
      })) as RouteCompletionTracking[];

      console.log(
        "Tracking data converted:",
        trackingData.length,
        trackingData
      );
      setTrackingData(trackingData);
      calculateStatistics(trackingData);
    } catch (error) {
      console.error("Error loading tracking data:", error);
      setError("載入路線完成追蹤資料時發生錯誤");
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (data: RouteCompletionTracking[]) => {
    const stats = {
      totalRoutes: data.length,
      totalSlots: data.reduce((sum, item) => sum + item.completionLimit, 0),
      totalCompletions: data.reduce(
        (sum, item) => sum + item.currentCompletions,
        0
      ),
      fullRoutes: data.filter(
        (item) => item.currentCompletions >= item.completionLimit
      ).length,
      lowAvailabilityRoutes: data.filter(
        (item) =>
          item.currentCompletions < item.completionLimit &&
          item.completionLimit - item.currentCompletions <= 5
      ).length,
    };
    setStatistics(stats);
  };

  const applyFilters = () => {
    let filtered = [...trackingData];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.routeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.routeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.questionnaireId.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Questionnaire filter
    if (selectedQuestionnaire !== "all") {
      filtered = filtered.filter(
        (item) => item.questionnaireId === selectedQuestionnaire
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Status filter
    if (selectedStatus !== "all") {
      switch (selectedStatus) {
        case "full":
          filtered = filtered.filter(
            (item) => item.currentCompletions >= item.completionLimit
          );
          break;
        case "low":
          filtered = filtered.filter(
            (item) =>
              item.currentCompletions < item.completionLimit &&
              item.completionLimit - item.currentCompletions <= 5
          );
          break;
        case "available":
          filtered = filtered.filter(
            (item) =>
              item.currentCompletions < item.completionLimit &&
              item.completionLimit - item.currentCompletions > 5
          );
          break;
        case "inactive":
          filtered = filtered.filter((item) => !item.isActive);
          break;
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case "routeName":
          aValue = a.routeName;
          bValue = b.routeName;
          break;
        case "routeId":
          aValue = a.routeId;
          bValue = b.routeId;
          break;
        case "category":
          aValue = a.category;
          bValue = b.category;
          break;
        case "questionnaireId":
          aValue = a.questionnaireId;
          bValue = b.questionnaireId;
          break;
        case "completionLimit":
          aValue = a.completionLimit;
          bValue = b.completionLimit;
          break;
        case "currentCompletions":
          aValue = a.currentCompletions;
          bValue = b.currentCompletions;
          break;
        case "remainingQuota":
          aValue = a.completionLimit - a.currentCompletions;
          bValue = b.completionLimit - b.currentCompletions;
          break;
        case "completionPercentage":
          aValue = (a.currentCompletions / a.completionLimit) * 100;
          bValue = (b.currentCompletions / b.completionLimit) * 100;
          break;
        case "lastUpdated":
          aValue = new Date(a.lastUpdated);
          bValue = new Date(b.lastUpdated);
          break;
        case "isActive":
          aValue = a.isActive ? 1 : 0;
          bValue = b.isActive ? 1 : 0;
          break;
        default:
          aValue = a.routeName;
          bValue = b.routeName;
      }

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue, "zh-TW")
          : bValue.localeCompare(aValue, "zh-TW");
      } else {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }
    });

    setFilteredData(filtered);
  };

  const handleEdit = (item: RouteCompletionTracking) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    try {
      // Update the tracking data
      await routeCompletionService.updateRouteCompletionTracking(editingItem);

      // Reload data
      await loadTrackingData();
      setEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error("Error updating tracking data:", error);
      alert("更新資料時發生錯誤");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除此追蹤記錄嗎？此操作無法復原。")) {
      return;
    }

    try {
      await routeCompletionService.deleteRouteCompletionTracking(id);
      await loadTrackingData();
    } catch (error) {
      console.error("Error deleting tracking data:", error);
      alert("刪除資料時發生錯誤");
    }
  };

  const handleBulkOperation = async () => {
    if (selectedItems.size === 0 || !bulkOperation) return;

    try {
      switch (bulkOperation) {
        case "activate":
          // Activate selected items
          for (const id of selectedItems) {
            const item = trackingData.find((d) => d.id === id);
            if (item) {
              await routeCompletionService.updateRouteCompletionTracking({
                ...item,
                isActive: true,
              });
            }
          }
          break;
        case "deactivate":
          // Deactivate selected items
          for (const id of selectedItems) {
            const item = trackingData.find((d) => d.id === id);
            if (item) {
              await routeCompletionService.updateRouteCompletionTracking({
                ...item,
                isActive: false,
              });
            }
          }
          break;
        case "reset":
          // Reset completion counts
          for (const id of selectedItems) {
            const item = trackingData.find((d) => d.id === id);
            if (item) {
              await routeCompletionService.updateRouteCompletionTracking({
                ...item,
                currentCompletions: 0,
                metadata: {
                  ...item.metadata,
                  totalSubmissions: 0,
                  uniqueUsers: 0,
                },
              });
            }
          }
          break;
        case "delete":
          // Delete selected items
          if (
            confirm(
              `確定要刪除選中的 ${selectedItems.size} 個記錄嗎？此操作無法復原。`
            )
          ) {
            for (const id of selectedItems) {
              await routeCompletionService.deleteRouteCompletionTracking(id);
            }
          }
          break;
      }

      await loadTrackingData();
      setSelectedItems(new Set());
      setBulkOperation("");
    } catch (error) {
      console.error("Error performing bulk operation:", error);
      alert("執行批量操作時發生錯誤");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredData.map((item) => item.id)));
    } else {
      setSelectedItems(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedItems);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedItems(newSelected);
  };

  const getUniqueQuestionnaires = () => {
    const questionnaireCounts = new Map<string, number>();

    trackingData.forEach((item) => {
      const count = questionnaireCounts.get(item.questionnaireId) || 0;
      questionnaireCounts.set(item.questionnaireId, count + 1);
    });

    return Array.from(questionnaireCounts.entries())
      .map(([questionnaire, count]) => ({ questionnaire, count }))
      .sort((a, b) => a.questionnaire.localeCompare(b.questionnaire));
  };

  const getUniqueCategories = () => {
    const categoryCounts = new Map<string, number>();

    trackingData.forEach((item) => {
      const count = categoryCounts.get(item.category) || 0;
      categoryCounts.set(item.category, count + 1);
    });

    return Array.from(categoryCounts.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => a.category.localeCompare(b.category));
  };

  const getCategoryDisplayName = (category: string) => {
    const displayNames: Record<string, string> = {
      "round-island-main": "環島自行車路線（環島1號）",
      "round-island": "環島自行車路線（環支線）",
      "round-island-alternative": "環島自行車路線（替代路線）",
      diverse: "多元自行車路線",
      scenic: "風景路線",
      custom: "自訂路線",
    };
    return displayNames[category] || category;
  };

  const getQuestionnaireDisplayName = (questionnaire: string) => {
    const displayNames: Record<string, string> = {
      "cycling-survey-2025": "環島自行車路線問卷",
      "diverse-cycling-survey-2025": "多元自行車路線問卷",
      "self-info-survey": "個人資料問卷",
    };
    return displayNames[questionnaire] || questionnaire;
  };

  const getStatusBadge = (item: RouteCompletionTracking) => {
    const remaining = item.completionLimit - item.currentCompletions;

    if (!item.isActive) {
      return <Badge variant="secondary">停用</Badge>;
    }

    if (remaining === 0) {
      return <Badge variant="destructive">已額滿</Badge>;
    }

    if (remaining <= 5) {
      return (
        <Badge variant="outline" className="text-orange-600 border-orange-200">
          低額度
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="text-green-600 border-green-200">
        啟用
      </Badge>
    );
  };

  const getCompletionPercentage = (item: RouteCompletionTracking) => {
    return Math.round((item.currentCompletions / item.completionLimit) * 100);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-4 h-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? (
      <ChevronUp className="w-4 h-4 text-primary" />
    ) : (
      <ChevronDown className="w-4 h-4 text-primary" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-6 h-6 animate-spin mr-2" />
          載入中...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button onClick={loadTrackingData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重新載入
        </Button>
      </div>
    );
  }

  if (trackingData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">路線完成追蹤管理</h2>
            <p className="text-muted-foreground">
              管理所有路線的完成配額和追蹤狀態
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTrackingData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重新載入
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">尚無追蹤資料</h3>
            <p className="text-muted-foreground mb-4">
              目前沒有任何路線完成追蹤記錄。請先初始化追蹤資料。
            </p>
            <Button onClick={loadTrackingData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              重新載入
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">路線完成追蹤管理</h2>
          <p className="text-muted-foreground">
            管理所有路線的完成配額和追蹤狀態
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTrackingData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            重新載入
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總路線數</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalRoutes}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {trackingData.filter((item) => item.isActive).length} 啟用中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總配額</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalSlots}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {statistics.totalSlots - statistics.totalCompletions} 剩餘
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statistics.totalCompletions}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(
                (statistics.totalCompletions / statistics.totalSlots) * 100
              )}
              % 完成率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已額滿</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mt-1">
              {statistics.fullRoutes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(
                (statistics.fullRoutes / statistics.totalRoutes) * 100
              )}
              % 總路線
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">低額度</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {statistics.lowAvailabilityRoutes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">≤5 個剩餘配額</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            快速操作
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedQuestionnaire("cycling-survey-2025");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
            >
              環島路線問卷 (
              {getUniqueQuestionnaires().find(
                (q) => q.questionnaire === "cycling-survey-2025"
              )?.count || 0}
              )
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedQuestionnaire("diverse-cycling-survey-2025");
                setSelectedCategory("all");
                setSelectedStatus("all");
              }}
            >
              多元路線問卷 (
              {getUniqueQuestionnaires().find(
                (q) => q.questionnaire === "diverse-cycling-survey-2025"
              )?.count || 0}
              )
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedQuestionnaire("all");
                setSelectedCategory("all");
                setSelectedStatus("full");
              }}
            >
              查看已額滿 ({statistics.fullRoutes})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedQuestionnaire("all");
                setSelectedCategory("all");
                setSelectedStatus("low");
              }}
            >
              查看低額度 ({statistics.lowAvailabilityRoutes})
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedQuestionnaire("all");
                setSelectedCategory("all");
                setSelectedStatus("inactive");
              }}
            >
              查看停用 ({trackingData.filter((item) => !item.isActive).length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              問卷統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUniqueQuestionnaires().map((item) => {
                const questionnaireData = trackingData.filter(
                  (t) => t.questionnaireId === item.questionnaire
                );
                const totalSlots = questionnaireData.reduce(
                  (sum, t) => sum + t.completionLimit,
                  0
                );
                const totalCompletions = questionnaireData.reduce(
                  (sum, t) => sum + t.currentCompletions,
                  0
                );
                const fullRoutes = questionnaireData.filter(
                  (t) => t.currentCompletions >= t.completionLimit
                ).length;

                return (
                  <div
                    key={item.questionnaire}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {getQuestionnaireDisplayName(item.questionnaire)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} 條路線
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {totalCompletions}/{totalSlots}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fullRoutes} 條已額滿
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              類別統計
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {getUniqueCategories().map((item) => {
                const categoryData = trackingData.filter(
                  (t) => t.category === item.category
                );
                const totalSlots = categoryData.reduce(
                  (sum, t) => sum + t.completionLimit,
                  0
                );
                const totalCompletions = categoryData.reduce(
                  (sum, t) => sum + t.currentCompletions,
                  0
                );
                const fullRoutes = categoryData.filter(
                  (t) => t.currentCompletions >= t.completionLimit
                ).length;

                return (
                  <div
                    key={item.category}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <div className="font-medium">
                        {getCategoryDisplayName(item.category)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.count} 條路線
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {totalCompletions}/{totalSlots}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {fullRoutes} 條已額滿
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            篩選條件
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="search">搜尋</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="搜尋路線名稱或ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="questionnaire">問卷</Label>
              <Select
                value={selectedQuestionnaire}
                onValueChange={setSelectedQuestionnaire}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇問卷" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部問卷</SelectItem>
                  {getUniqueQuestionnaires().map((item) => (
                    <SelectItem
                      key={item.questionnaire}
                      value={item.questionnaire}
                    >
                      {getQuestionnaireDisplayName(item.questionnaire)} (
                      {item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">類別</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇類別" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部類別</SelectItem>
                  {getUniqueCategories().map((item) => (
                    <SelectItem key={item.category} value={item.category}>
                      {getCategoryDisplayName(item.category)} ({item.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">狀態</Label>
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部狀態</SelectItem>
                  <SelectItem value="available">啟用中</SelectItem>
                  <SelectItem value="low">低額度</SelectItem>
                  <SelectItem value="full">已額滿</SelectItem>
                  <SelectItem value="inactive">停用</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Operations */}
      {selectedItems.size > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>批量操作 ({selectedItems.size} 個項目)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Select value={bulkOperation} onValueChange={setBulkOperation}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="選擇操作" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activate">啟用選中項目</SelectItem>
                  <SelectItem value="deactivate">停用選中項目</SelectItem>
                  <SelectItem value="reset">重置完成數</SelectItem>
                  <SelectItem value="delete">刪除選中項目</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleBulkOperation} disabled={!bulkOperation}>
                執行操作
              </Button>
              <Button
                variant="outline"
                onClick={() => setSelectedItems(new Set())}
              >
                取消選擇
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            追蹤記錄 ({filteredData.length} / {trackingData.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedItems.size === filteredData.length &&
                        filteredData.length > 0
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("routeName")}
                    >
                      路線
                      {getSortIcon("routeName")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("questionnaireId")}
                    >
                      問卷
                      {getSortIcon("questionnaireId")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("category")}
                    >
                      類別
                      {getSortIcon("category")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("completionLimit")}
                    >
                      配額
                      {getSortIcon("completionLimit")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("currentCompletions")}
                    >
                      完成數
                      {getSortIcon("currentCompletions")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("remainingQuota")}
                    >
                      剩餘配額
                      {getSortIcon("remainingQuota")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("completionPercentage")}
                    >
                      進度
                      {getSortIcon("completionPercentage")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("isActive")}
                    >
                      狀態
                      {getSortIcon("isActive")}
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 font-medium hover:bg-muted/50 transition-colors flex items-center gap-1"
                      onClick={() => handleSort("lastUpdated")}
                    >
                      最後更新
                      {getSortIcon("lastUpdated")}
                    </Button>
                  </TableHead>
                  <TableHead className="w-24">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) =>
                          handleSelectItem(item.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.routeName}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.routeId}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{item.questionnaireId}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category}</Badge>
                    </TableCell>
                    <TableCell>{item.completionLimit}</TableCell>
                    <TableCell>{item.currentCompletions}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {Math.max(
                          0,
                          item.completionLimit - item.currentCompletions
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">剩餘</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress
                          value={getCompletionPercentage(item)}
                          className="w-16"
                        />
                        <span className="text-sm text-muted-foreground">
                          {getCompletionPercentage(item)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(item)}</TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.lastUpdated).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>確認刪除</AlertDialogTitle>
                              <AlertDialogDescription>
                                確定要刪除路線 "{item.routeName}"
                                的追蹤記錄嗎？此操作無法復原。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(item.id)}
                              >
                                刪除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>編輯追蹤記錄</DialogTitle>
            <DialogDescription>修改路線完成追蹤的設定</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>路線名稱</Label>
                <Input value={editingItem.routeName} disabled />
              </div>
              <div className="space-y-2">
                <Label>問卷ID</Label>
                <Input
                  value={editingItem.questionnaireId}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      questionnaireId: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>完成配額</Label>
                <Input
                  type="number"
                  value={editingItem.completionLimit}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      completionLimit: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>當前完成數</Label>
                <Input
                  type="number"
                  value={editingItem.currentCompletions}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      currentCompletions: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={editingItem.isActive}
                  onCheckedChange={(checked) =>
                    setEditingItem({
                      ...editingItem,
                      isActive: checked as boolean,
                    })
                  }
                />
                <Label htmlFor="isActive">啟用此追蹤</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSaveEdit}>儲存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
