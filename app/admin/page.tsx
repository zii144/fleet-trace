"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { QuestionnaireBuilder } from "@/components/admin/QuestionnaireBuilder";
import { AdminManagementTable } from "@/components/admin/AdminManagementTable";
import UserInfoManagement from "@/components/admin/UserInfoManagement";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getQuestionnaires,
  getQuestionnaireResponses,
} from "@/lib/questionnaire";
import {
  createQuestionnaire,
  updateQuestionnaire,
  deleteQuestionnaire,
} from "@/lib/firebase-questionnaires";
import type {
  Questionnaire,
  QuestionnaireResponse,
} from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  Eye,
  Database,
  MapPin,
} from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [activeTab, setActiveTab] = useState<string>("questionnaires"); // Default to questionnaires tab

  const [isLoading, setIsLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<
    Questionnaire | undefined
  >(undefined);

  // Load saved tab preference on mount
  useEffect(() => {
    const savedTab = localStorage.getItem("admin-active-tab");
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Save tab preference when it changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem("admin-active-tab", value);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [questionnairesData, responsesData] = await Promise.all([
        Promise.resolve(getQuestionnaires()),
        getQuestionnaireResponses(),
      ]);
      setQuestionnaires(questionnairesData);
      setResponses(responsesData);
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setShowBuilder(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個評鑑調查嗎？此操作無法復原。")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteQuestionnaire(id);
      await loadData(); // Reload data
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      alert("刪除評鑑調查時發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuestionnaire = () => {
    setEditingQuestionnaire(undefined);
    setShowBuilder(true);
  };

  const handleBuilderSave = async (questionnaire: Questionnaire) => {
    setShowBuilder(false);
    setEditingQuestionnaire(undefined);
    await loadData(); // Reload data
  };

  const handleBuilderCancel = () => {
    setShowBuilder(false);
    setEditingQuestionnaire(undefined);
  };

  const getResponsesForQuestionnaire = (questionnaireId: string) => {
    return responses.filter((r) => r.questionnaireId === questionnaireId);
  };

  return (
    <ProtectedRoute requireAdmin>
      {showBuilder ? (
        <div className="min-h-screen bg-gray-50">
          <QuestionnaireBuilder
            questionnaire={editingQuestionnaire}
            onSave={handleBuilderSave}
            onCancel={handleBuilderCancel}
          />
        </div>
      ) : (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">管理面板</h1>
                  <p className="text-gray-600">管理評鑑調查並查看回覆</p>
                </div>
                <Link href="/dashboard">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    返回儀表板
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="mb-0">
              <h1 className="text-2xl font-bold mb-2">資料表管理介面</h1>
              <p className="text-muted-foreground">
                依分類管理雲端儲存的所有數據
              </p>
            </div>

            <div className="px-4 py-2 sm:px-0">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="space-y-6"
              >
                <TabsList>
                  <TabsTrigger value="management">
                    <Database className="w-4 h-4 mr-2" />
                    數據管理
                  </TabsTrigger>
                  <TabsTrigger value="user-info">用戶資料</TabsTrigger>
                  <TabsTrigger value="questionnaires">評鑑調查管理</TabsTrigger>
                  {/* <TabsTrigger value="responses">回覆記錄</TabsTrigger> */}
                </TabsList>

                <TabsContent value="questionnaires" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">管理評鑑調查</h2>
                    <Button onClick={handleNewQuestionnaire}>
                      <Plus className="w-4 h-4 mr-2" />
                      新增評鑑調查
                    </Button>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {questionnaires.map((questionnaire) => (
                      <Card key={questionnaire.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle className="text-lg">
                                {questionnaire.title}
                              </CardTitle>
                              <CardDescription>
                                {questionnaire.description}
                              </CardDescription>
                            </div>
                            <Badge variant="secondary">
                              v{questionnaire.version}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2 mb-4">
                            <p className="text-sm text-gray-600">
                              <strong>主辦機關:</strong>{" "}
                              {questionnaire.organize}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>部分:</strong>{" "}
                              {questionnaire.sections.length}
                            </p>
                            <p className="text-sm text-gray-600">
                              <strong>回覆:</strong>{" "}
                              {
                                getResponsesForQuestionnaire(questionnaire.id)
                                  .length
                              }
                            </p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(questionnaire)}
                              disabled={isLoading}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(questionnaire.id)}
                              disabled={isLoading}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                            <Link href={`/questionnaire/${questionnaire.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="responses" className="space-y-6">
                  <h2 className="text-2xl font-semibold">回覆摘要</h2>

                  {responses.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-12">
                        <p className="text-gray-600">尚無回覆提交。</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-4">
                      {questionnaires.map((questionnaire) => {
                        const questionnaireResponses =
                          getResponsesForQuestionnaire(questionnaire.id);
                        if (questionnaireResponses.length === 0) return null;

                        return (
                          <Card key={questionnaire.id}>
                            <CardHeader>
                              <CardTitle>{questionnaire.title}</CardTitle>
                              <CardDescription>
                                {questionnaireResponses.length} 個回覆
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {questionnaireResponses.map((response) => (
                                  <div
                                    key={response.id}
                                    className="p-3 bg-gray-50 rounded"
                                  >
                                    <p className="text-sm font-medium">
                                      回覆 ID: {response.id}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                      提交時間:{" "}
                                      {new Date(
                                        response.submittedAt
                                      ).toLocaleString()}
                                    </p>
                                    <details className="mt-2">
                                      <summary className="cursor-pointer text-sm font-medium">
                                        查看回覆
                                      </summary>
                                      <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-auto">
                                        {JSON.stringify(
                                          response.responses,
                                          null,
                                          2
                                        )}
                                      </pre>
                                    </details>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="management" className="space-y-6">
                  <AdminManagementTable userRole={user?.role || "user"} />
                </TabsContent>


                <TabsContent value="user-info" className="space-y-6">
                  <UserInfoManagement />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
