import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  Download,
  Filter,
  RefreshCw,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Clock,
  FileText,
  Eye,
  ChevronDown,
  ChevronRight,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import {
  getAllQuestionnaires,
  getQuestionnaireById,
} from "@/public/questionnaires/index";
import { getResponsesByQuestionnaireId } from "@/lib/firebase-questionnaires";
import { useToast } from "@/hooks/use-toast";
import type {
  Questionnaire,
  QuestionnaireResponse,
} from "@/types/questionnaire";

interface QuestionField {
  id: string;
  label: string;
  type: string;
  section: string;
  options?: string[];
}

interface AnalyticsData {
  totalResponses: number;
  completionRate: number;
  averageTimeSpent: number;
  deviceBreakdown: Record<string, number>;
  responseTrends: Array<{ date: string; count: number }>;
  fieldAnalytics: Record<
    string,
    {
      type: "categorical" | "text";
      data?: Record<string, number>;
      count?: number;
    }
  >;
}

export function QuestionnaireResponseManager() {
  const { toast } = useToast();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [selectedQuestionnaireId, setSelectedQuestionnaireId] =
    useState<string>("");
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [showResponseDetail, setShowResponseDetail] = useState(false);
  const [selectedResponse, setSelectedResponse] =
    useState<QuestionnaireResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [fieldSearchTerm, setFieldSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from: string; to: string }>({
    from: "",
    to: "",
  });

  const selectedQuestionnaire = useMemo(() => {
    return questionnaires.find((q) => q.id === selectedQuestionnaireId);
  }, [questionnaires, selectedQuestionnaireId]);

  const questionFields = useMemo(() => {
    if (!selectedQuestionnaire) return [];

    const fields: QuestionField[] = [];
    selectedQuestionnaire.sections.forEach((section) => {
      section.questions.forEach((question) => {
        // Extract options based on question type
        let options: string[] | undefined;
        if (
          question.type === "select" ||
          question.type === "radio" ||
          question.type === "checkbox"
        ) {
          options = question.options;
        } else if (
          question.type === "select-text" ||
          question.type === "checkbox-text"
        ) {
          options = question.options;
        } else if (
          question.type === "radio-number" ||
          question.type === "radio-text"
        ) {
          options = question.options?.map((opt) =>
            typeof opt === "string" ? opt : opt.label || opt.value
          );
        }

        fields.push({
          id: question.id,
          label: question.label,
          type: question.type,
          section: section.title,
          options,
        });
      });
    });
    return fields;
  }, [selectedQuestionnaire]);

  const analyticsData = useMemo((): AnalyticsData => {
    if (!responses.length) {
      return {
        totalResponses: 0,
        completionRate: 0,
        averageTimeSpent: 0,
        deviceBreakdown: {},
        responseTrends: [],
        fieldAnalytics: {},
      };
    }

    const totalResponses = responses.length;
    const completedResponses = responses.filter(
      (r) => r.status === "completed"
    ).length;
    const completionRate = (completedResponses / totalResponses) * 100;

    const averageTimeSpent =
      responses.reduce((sum, r) => sum + (r.timeSpentSeconds || 0), 0) /
      totalResponses;

    const deviceBreakdown = responses.reduce((breakdown, r) => {
      const device = r.deviceType || "desktop";
      breakdown[device] = (breakdown[device] || 0) + 1;
      return breakdown;
    }, {} as Record<string, number>);

    // Group responses by date
    const responseTrends = responses.reduce((trends, r) => {
      const date = new Date(r.submittedAt).toLocaleDateString("zh-TW");
      const existing = trends.find((t) => t.date === date);
      if (existing) {
        existing.count++;
      } else {
        trends.push({ date, count: 1 });
      }
      return trends;
    }, [] as Array<{ date: string; count: number }>);

    // Analyze field responses
    const fieldAnalytics: Record<string, any> = {};
    questionFields.forEach((field) => {
      const fieldResponses = responses
        .map((r) => r.responses[field.id])
        .filter(Boolean);
      if (fieldResponses.length > 0) {
        if (field.type === "radio" || field.type === "select") {
          const counts = fieldResponses.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          fieldAnalytics[field.id] = { type: "categorical", data: counts };
        } else if (field.type === "checkbox") {
          const allOptions = new Set<string>();
          fieldResponses.forEach((response) => {
            if (Array.isArray(response)) {
              response.forEach((option) => allOptions.add(option));
            }
          });
          const counts = Array.from(allOptions).reduce((acc, option) => {
            acc[option] = fieldResponses.filter(
              (r) => Array.isArray(r) && r.includes(option)
            ).length;
            return acc;
          }, {} as Record<string, number>);
          fieldAnalytics[field.id] = { type: "categorical", data: counts };
        } else {
          fieldAnalytics[field.id] = {
            type: "text",
            count: fieldResponses.length,
          };
        }
      }
    });

    return {
      totalResponses,
      completionRate,
      averageTimeSpent,
      deviceBreakdown,
      responseTrends,
      fieldAnalytics,
    };
  }, [responses, questionFields]);

  const filteredResponses = useMemo(() => {
    let filtered = responses;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply date filter
    if (dateFilter.from) {
      filtered = filtered.filter(
        (r) => new Date(r.submittedAt) >= new Date(dateFilter.from)
      );
    }
    if (dateFilter.to) {
      filtered = filtered.filter(
        (r) => new Date(r.submittedAt) <= new Date(dateFilter.to)
      );
    }

    return filtered;
  }, [responses, searchTerm, dateFilter]);

  const filteredQuestionFields = useMemo(() => {
    if (!fieldSearchTerm) return questionFields;

    return questionFields.filter(
      (field) =>
        field.label.toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
        field.section.toLowerCase().includes(fieldSearchTerm.toLowerCase()) ||
        field.type.toLowerCase().includes(fieldSearchTerm.toLowerCase())
    );
  }, [questionFields, fieldSearchTerm]);

  useEffect(() => {
    loadQuestionnaires();
  }, []);

  useEffect(() => {
    if (selectedQuestionnaireId) {
      loadResponses(selectedQuestionnaireId);
    }
  }, [selectedQuestionnaireId]);

  const loadQuestionnaires = async () => {
    try {
      const allQuestionnaires = getAllQuestionnaires();
      setQuestionnaires(allQuestionnaires);
      if (allQuestionnaires.length > 0 && !selectedQuestionnaireId) {
        setSelectedQuestionnaireId(allQuestionnaires[0].id);
      }
    } catch (err) {
      console.error("Error loading questionnaires:", err);
      setError("加載問卷失敗");
    }
  };

  const loadResponses = async (questionnaireId: string) => {
    setLoading(true);
    setError(null);
    try {
      const questionnaireResponses = await getResponsesByQuestionnaireId(
        questionnaireId
      );
      setResponses(questionnaireResponses);
    } catch (err) {
      console.error("Error loading responses:", err);
      setError("加載回應失敗");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldToggle = (fieldId: string) => {
    setSelectedFields((prev) =>
      prev.includes(fieldId)
        ? prev.filter((id) => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleViewResponse = (response: QuestionnaireResponse) => {
    setSelectedResponse(response);
    setShowResponseDetail(true);
  };

  // Helper function to format values for export
  const formatExportValue = (value: any, field?: QuestionField) => {
    if (value === null || value === undefined) return "";
    if (!field) return String(value);

    // Special handling for region-long-answer type
    if (field.type === "region-long-answer" && Array.isArray(value)) {
      return value
        .map((block, index) => {
          const region = block.Region || block.region || "";
          const location = block.Location || block.location || "";
          const reason = block.Reason || block.reason || "";
          return `${index + 1}. ${region} - ${location} (${reason})`;
        })
        .join("; ");
    }

    // Handle select-text: if not "其他", return just the selected value
    if (field.type === "select-text" && value && typeof value === "object") {
      if (value.selected && value.selected !== "其他") {
        return value.selected;
      }
      if (value.selected === "其他" && value.text) {
        return `${value.selected}: ${value.text}`;
      }
      if (value.selected === "其他") {
        return value.selected;
      }
    }

    // Handle checkbox type (regular checkbox, not checkbox-text)
    if (field.type === "checkbox" && Array.isArray(value)) {
      return value.join(", ");
    }

    // Handle checkbox-text: if not "其他", return just the selected array
    if (field.type === "checkbox-text" && value && typeof value === "object") {
      if (Array.isArray(value.selected) && !value.selected.includes("其他")) {
        return value.selected.join(", ");
      }
      if (
        Array.isArray(value.selected) &&
        value.selected.includes("其他") &&
        value.text
      ) {
        return `${value.selected.join(", ")} (其他: ${value.text})`;
      }
      if (Array.isArray(value.selected) && value.selected.includes("其他")) {
        return value.selected.join(", ");
      }
    }

    // Handle radio-number type
    if (field.type === "radio-number" && value && typeof value === "object") {
      const parts = [];
      if (value.selected) {
        parts.push(value.selected);
        if (value.numbers && value.numbers[value.selected]) {
          parts.push(`人數: ${value.numbers[value.selected]}`);
        }
        if (value.texts && value.texts[value.selected]) {
          parts.push(`文字: ${value.texts[value.selected]}`);
        }
      }
      return parts.join(" | ");
    }

    // Handle radio-text type
    if (field.type === "radio-text" && value && typeof value === "object") {
      const parts = [];
      if (value.selected) {
        parts.push(value.selected);
        if (value.texts && value.texts[value.selected]) {
          parts.push(`文字: ${value.texts[value.selected]}`);
        }
      }
      return parts.join(" | ");
    }

    // Handle matrix type
    if (field.type === "matrix" && value && typeof value === "object") {
      return Object.entries(value)
        .map(([key, val]) => `${key}: ${val}`)
        .join("; ");
    }

    // Handle train-schedule-request type
    if (
      field.type === "train-schedule-request" &&
      value &&
      typeof value === "object"
    ) {
      const parts = [];
      if (value.selected) {
        parts.push(value.selected);
        if (value.schedules && Array.isArray(value.schedules)) {
          const scheduleText = value.schedules
            .map(
              (schedule: any, index: number) =>
                `${index + 1}. ${schedule.startStation}→${
                  schedule.endStation
                } (${schedule.schedule})`
            )
            .join("; ");
          if (scheduleText) {
            parts.push(`班次: ${scheduleText}`);
          }
        }
      }
      return parts.join(" | ");
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  const exportData = (format: "csv" | "json") => {
    if (!selectedQuestionnaire || !filteredResponses.length) return;

    if (format === "csv") {
      const headers = [
        "Response ID",
        "User ID",
        "Submitted At",
        "Status",
        "Time Spent (s)",
      ];
      const selectedFieldHeaders = selectedFields.map((fieldId) => {
        const field = questionFields.find((f) => f.id === fieldId);
        return field?.label || fieldId;
      });

      const csvContent = [
        [...headers, ...selectedFieldHeaders].join(","),
        ...filteredResponses.map((response) => {
          const baseData = [
            response.id,
            response.userId,
            new Date(response.submittedAt).toLocaleString("zh-TW"),
            response.status,
            response.timeSpentSeconds || 0,
          ];
          const fieldData = selectedFields.map((fieldId) => {
            const value = response.responses[fieldId];
            const field = questionFields.find((f) => f.id === fieldId);
            return formatExportValue(value, field);
          });
          return [...baseData, ...fieldData].join(",");
        }),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${selectedQuestionnaire.id}_responses.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Enhanced JSON export with converted field names and formatted values
      const convertedResponses = filteredResponses.map((response) => {
        const convertedResponses: Record<string, any> = {};

        // Convert field IDs to labels and format values for each response
        Object.entries(response.responses).forEach(([fieldId, value]) => {
          const field = questionFields.find((f) => f.id === fieldId);
          const label = field?.label || fieldId;
          convertedResponses[label] = formatExportValue(value, field);
        });

        return {
          ...response,
          responses: convertedResponses,
        };
      });

      const jsonData = {
        questionnaire: selectedQuestionnaire,
        responses: convertedResponses,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
        type: "application/json",
      });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `${selectedQuestionnaire.id}_responses.json`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    toast({
      title: "導出成功",
      description: `已成功導出 ${filteredResponses.length} 筆回應資料`,
    });
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "tablet":
        return <Tablet className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  const formatFieldValue = (value: any, field: QuestionField) => {
    if (value === null || value === undefined) return "-";

    // Special handling for region-long-answer type
    if (field.type === "region-long-answer" && Array.isArray(value)) {
      return value
        .map((block, index) => {
          const region = block.Region || block.region || "";
          const location = block.Location || block.location || "";
          const reason = block.Reason || block.reason || "";
          return `${index + 1}. ${region} - ${location} (${reason})`;
        })
        .join("; ");
    }

    if (Array.isArray(value)) {
      return value.join(", ");
    }

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    return String(value);
  };

  return (
    <div className="container mx-auto p-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">問卷回應管理</h1>
        <p className="text-muted-foreground">查看和分析問卷回應資料</p>
      </div>

      {/* Questionnaire Selection */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>選擇問卷</CardTitle>
          <CardDescription>選擇要查看的問卷回應</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="questionnaire-select">問卷</Label>
              <Select
                value={selectedQuestionnaireId}
                onValueChange={setSelectedQuestionnaireId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="選擇問卷" />
                </SelectTrigger>
                <SelectContent>
                  {questionnaires.map((questionnaire) => (
                    <SelectItem key={questionnaire.id} value={questionnaire.id}>
                      {questionnaire.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              onClick={() => loadResponses(selectedQuestionnaireId)}
              disabled={loading}
            >
              <RefreshCw
                className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`}
              />
              刷新
            </Button>
          </div>
        </CardContent>
      </Card>

      {selectedQuestionnaire && (
        <>
          {/* Analytics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">總回應數</p>
                    <p className="text-2xl font-bold">
                      {analyticsData.totalResponses}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">完成率</p>
                    <p className="text-2xl font-bold">
                      {analyticsData.completionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">平均時間</p>
                    <p className="text-2xl font-bold">
                      {Math.round(analyticsData.averageTimeSpent)}s
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="w-4 h-4 text-purple-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">裝置分布</p>
                    <p className="text-2xl font-bold">
                      {Object.keys(analyticsData.deviceBreakdown).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Sidebar - Field Selection */}
            <div className="lg:col-span-1">
              <Card className="h-fit">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">問卷欄位</CardTitle>
                  <CardDescription>選擇要查看的欄位資料</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Search Field */}
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="搜尋欄位..."
                      value={fieldSearchTerm}
                      onChange={(e) => setFieldSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Handy button to select and deselect all fields */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      if (selectedFields.length === questionFields.length) {
                        setSelectedFields([]);
                      } else {
                        setSelectedFields(questionFields.map((f) => f.id));
                      }
                    }}
                  >
                    {selectedFields.length === questionFields.length
                      ? "全部取消"
                      : "全部選取"}
                  </Button>

                  {/* Field Count */}
                  <div className="text-xs text-muted-foreground">
                    顯示 {filteredQuestionFields.length} /{" "}
                    {questionFields.length} 個欄位
                  </div>

                  {/* Fields List */}
                  <ScrollArea className="h-[calc(100vh-24rem)] min-h-[400px] pr-2">
                    <div className="space-y-2">
                      {filteredQuestionFields.length === 0 ? (
                        <div className="text-center py-4 text-sm text-muted-foreground">
                          沒有找到符合的欄位
                        </div>
                      ) : (
                        filteredQuestionFields.map((field) => {
                          const isSelected = selectedFields.includes(field.id);
                          return (
                            <Button
                              key={field.id}
                              variant={isSelected ? "outline" : "ghost"}
                              className={`w-full justify-start p-3 h-auto text-left rounded-md ${
                                isSelected
                                  ? "border-spacing-3 bg-primary/5"
                                  : "hover:bg-muted/50"
                              }`}
                              onClick={() => handleFieldToggle(field.id)}
                            >
                              <div
                                className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center ${
                                  isSelected
                                    ? "border-primary bg-primary"
                                    : "border-muted-foreground/30"
                                }`}
                              >
                                {isSelected && (
                                  <div className="w-2 h-2 bg-white rounded-sm" />
                                )}
                              </div>
                              <div className="flex flex-col items-start space-y-1 w-full min-w-0">
                                <div className="flex items-center space-x-2 w-full min-w-0">
                                  <span className="text-sm font-medium truncate min-w-0 flex-1">
                                    {field.label}
                                  </span>
                                </div>
                                <div className="ml-6 text-xs text-muted-foreground truncate w-full">
                                  {field.section} • {field.type}
                                </div>
                              </div>
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="responses" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="responses">回應列表</TabsTrigger>
                  <TabsTrigger value="analytics">資料分析</TabsTrigger>
                  <TabsTrigger value="export">匯出資料</TabsTrigger>
                </TabsList>

                <TabsContent value="responses" className="space-y-4">
                  {/* Filters */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor="search">搜尋</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="search"
                              placeholder="搜尋回應 ID 或使用者 ID..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="date-from">開始日期</Label>
                          <Input
                            id="date-from"
                            type="date"
                            value={dateFilter.from}
                            onChange={(e) =>
                              setDateFilter((prev) => ({
                                ...prev,
                                from: e.target.value,
                              }))
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="date-to">結束日期</Label>
                          <Input
                            id="date-to"
                            type="date"
                            value={dateFilter.to}
                            onChange={(e) =>
                              setDateFilter((prev) => ({
                                ...prev,
                                to: e.target.value,
                              }))
                            }
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Responses Table */}
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <div>
                          <CardTitle>回應列表</CardTitle>
                          <CardDescription className="mt-1">
                            顯示 {filteredResponses.length} 筆回應
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>回應 ID</TableHead>
                              <TableHead>使用者 ID</TableHead>
                              <TableHead>提交時間</TableHead>
                              <TableHead>狀態</TableHead>
                              <TableHead>時間</TableHead>
                              <TableHead>裝置</TableHead>
                              {selectedFields.map((fieldId) => {
                                const field = questionFields.find(
                                  (f) => f.id === fieldId
                                );
                                return (
                                  <TableHead key={fieldId}>
                                    {field?.label}
                                  </TableHead>
                                );
                              })}
                              <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {loading ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7 + selectedFields.length}
                                  className="text-center"
                                >
                                  載入中...
                                </TableCell>
                              </TableRow>
                            ) : filteredResponses.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={7 + selectedFields.length}
                                  className="text-center"
                                >
                                  沒有找到回應資料
                                </TableCell>
                              </TableRow>
                            ) : (
                              filteredResponses.map((response) => (
                                <TableRow key={response.id}>
                                  <TableCell className="font-mono text-sm">
                                    {response.id.substring(0, 8)}...
                                  </TableCell>
                                  <TableCell className="font-mono text-sm">
                                    {response.userId.substring(0, 8)}...
                                  </TableCell>
                                  <TableCell>
                                    {new Date(
                                      response.submittedAt
                                    ).toLocaleString("zh-TW")}
                                  </TableCell>
                                  <TableCell>
                                    <Badge
                                      variant={
                                        response.status === "completed"
                                          ? "default"
                                          : "secondary"
                                      }
                                    >
                                      {response.status === "completed"
                                        ? "已完成"
                                        : "草稿"}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    {response.timeSpentSeconds
                                      ? `${response.timeSpentSeconds}s`
                                      : "-"}
                                  </TableCell>
                                  <TableCell>
                                    <div className="flex items-center space-x-1">
                                      {getDeviceIcon(
                                        response.deviceType || "desktop"
                                      )}
                                      <span className="text-xs capitalize">
                                        {response.deviceType || "desktop"}
                                      </span>
                                    </div>
                                  </TableCell>
                                  {selectedFields.map((fieldId) => {
                                    const field = questionFields.find(
                                      (f) => f.id === fieldId
                                    );
                                    return (
                                      <TableCell
                                        key={fieldId}
                                        className="max-w-xs truncate"
                                      >
                                        {formatFieldValue(
                                          response.responses[fieldId],
                                          field!
                                        )}
                                      </TableCell>
                                    );
                                  })}
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        handleViewResponse(response)
                                      }
                                    >
                                      <Eye className="w-4 h-4" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="analytics" className="space-y-4">
                  {/* Device Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>裝置使用分布</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {Object.entries(analyticsData.deviceBreakdown).map(
                          ([device, count]) => (
                            <div
                              key={device}
                              className="flex items-center space-x-3 p-3 border rounded-lg"
                            >
                              {getDeviceIcon(device)}
                              <div>
                                <p className="font-medium capitalize">
                                  {device}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {count} 次 (
                                  {(
                                    (count / analyticsData.totalResponses) *
                                    100
                                  ).toFixed(1)}
                                  %)
                                </p>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Field Analytics */}
                  {selectedFields.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>欄位分析</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {selectedFields.map((fieldId) => {
                            const field = questionFields.find(
                              (f) => f.id === fieldId
                            );
                            const analytics =
                              analyticsData.fieldAnalytics[fieldId];

                            if (!analytics) return null;

                            return (
                              <div
                                key={fieldId}
                                className="border rounded-lg p-4"
                              >
                                <h4 className="font-medium mb-3">
                                  {field?.label}
                                </h4>
                                {analytics.type === "categorical" &&
                                analytics.data ? (
                                  <div className="space-y-2">
                                    {Object.entries(analytics.data).map(
                                      ([option, count]) => (
                                        <div
                                          key={option}
                                          className="flex justify-between items-center"
                                        >
                                          <span className="text-sm">
                                            {option}
                                          </span>
                                          <div className="flex items-center space-x-2">
                                            <div className="w-32 bg-gray-200 rounded-full h-2">
                                              <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                  width: `${
                                                    (count /
                                                      analyticsData.totalResponses) *
                                                    100
                                                  }%`,
                                                }}
                                              />
                                            </div>
                                            <span className="text-sm font-medium w-12 text-right">
                                              {count}
                                            </span>
                                          </div>
                                        </div>
                                      )
                                    )}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">
                                    文字回應：{analytics.count} 筆
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="export" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>匯出資料</CardTitle>
                      <CardDescription>選擇匯出格式和範圍</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Label>匯出範圍</Label>
                          <p className="text-sm text-muted-foreground">
                            將匯出 {filteredResponses.length} 筆回應資料
                          </p>
                        </div>

                        <div>
                          <Label>選擇欄位</Label>
                          <p className="text-sm text-muted-foreground">
                            已選擇 {selectedFields.length} 個欄位
                          </p>
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            onClick={() => exportData("csv")}
                            disabled={filteredResponses.length === 0}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            匯出 CSV
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => exportData("json")}
                            disabled={filteredResponses.length === 0}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            匯出 JSON
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </>
      )}

      {/* Response Detail Dialog */}
      <Dialog open={showResponseDetail} onOpenChange={setShowResponseDetail}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>回應詳細資料</DialogTitle>
            <DialogDescription>查看完整的回應內容</DialogDescription>
          </DialogHeader>
          {selectedResponse && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>回應 ID</Label>
                  <p className="text-sm font-mono">{selectedResponse.id}</p>
                </div>
                <div>
                  <Label>使用者 ID</Label>
                  <p className="text-sm font-mono">{selectedResponse.userId}</p>
                </div>
                <div>
                  <Label>提交時間</Label>
                  <p className="text-sm">
                    {new Date(selectedResponse.submittedAt).toLocaleString(
                      "zh-TW"
                    )}
                  </p>
                </div>
                <div>
                  <Label>狀態</Label>
                  <Badge
                    variant={
                      selectedResponse.status === "completed"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {selectedResponse.status === "completed"
                      ? "已完成"
                      : "草稿"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label>回應內容</Label>
                <div className="mt-2 space-y-2">
                  {questionFields.map((field) => {
                    const value = selectedResponse.responses[field.id];
                    if (value === null || value === undefined) return null;

                    return (
                      <div key={field.id} className="border rounded-lg p-3">
                        <h4 className="font-medium text-sm mb-1">
                          {field.label}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-1">
                          {field.section} • {field.type}
                        </p>
                        <div className="text-sm">
                          {formatFieldValue(value, field)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
