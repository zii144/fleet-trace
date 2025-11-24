"use client";

import { useEffect, useState } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { QuestionnaireBuilder } from "@/components/admin/QuestionnaireBuilder";
import { AdminManagementTable } from "@/components/admin/AdminManagementTable";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getQuestionnaires,
  validateQuestionnaireJSON,
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
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, Edit, Trash2, Eye, Database } from "lucide-react";

export default function AdminPage() {
  const { user } = useAuth();
  const [questionnaires, setQuestionnaires] = useState<Questionnaire[]>([]);
  const [responses, setResponses] = useState<QuestionnaireResponse[]>([]);
  const [jsonInput, setJsonInput] = useState("");
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    error?: string;
  } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<
    Questionnaire | undefined
  >(undefined);

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

  const handleValidateAndSave = async () => {
    if (!jsonInput.trim()) {
      setValidationResult({ valid: false, error: "請提供 JSON 內容" });
      return;
    }

    setIsLoading(true);
    try {
      const result = validateQuestionnaireJSON(jsonInput);
      if (result.valid && result.questionnaire) {
        if (editingId) {
          await updateQuestionnaire(editingId, result.questionnaire);
        } else {
          await createQuestionnaire(result.questionnaire);
        }
        setValidationResult({ valid: true });
        setJsonInput("");
        setEditingId(null);
        await loadData(); // Reload data
      } else {
        setValidationResult({ valid: false, error: result.error });
      }
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      setValidationResult({
        valid: false,
        error: "保存問卷時發生錯誤",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (questionnaire: Questionnaire) => {
    setEditingQuestionnaire(questionnaire);
    setShowBuilder(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("確定要刪除這個問卷嗎？此操作無法復原。")) {
      return;
    }

    setIsLoading(true);
    try {
      await deleteQuestionnaire(id);
      await loadData(); // Reload data
    } catch (error) {
      console.error("Error deleting questionnaire:", error);
      alert("刪除問卷時發生錯誤，請稍後再試");
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

  const handleNewQuestionnaireJSON = () => {
    const template = {
      id: `questionnaire-${Date.now()}`,
      title: "New Questionnaire",
      description: "Description of the questionnaire",
      version: "1.0",
      organize: "交通部運輸研究所",
      sections: [
        {
          id: "section-1",
          title: "Section Title",
          questions: [
            {
              id: "question-1",
              type: "text",
              label: "Sample Question",
              required: true,
              placeholder: "Enter your answer",
            },
          ],
        },
      ],
    };
    setJsonInput(JSON.stringify(template, null, 2));
    setEditingId(null);
    setValidationResult(null);
  };

  const getResponsesForQuestionnaire = (questionnaireId: string) => {
    return responses.filter((r) => r.questionnaireId === questionnaireId);
  };

  return (
    <ProtectedRoute requireAdmin>
      {showBuilder ? (
        <QuestionnaireBuilder
          questionnaire={editingQuestionnaire}
          onSave={handleBuilderSave}
          onCancel={handleBuilderCancel}
        />
      ) : (
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center py-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">管理面板</h1>
                  <p className="text-gray-600">管理問卷並查看回覆</p>
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
            <div className="px-4 py-6 sm:px-0">
              <Tabs defaultValue="management" className="space-y-6">
                <TabsList>
                  <TabsTrigger value="management">
                    <Database className="w-4 h-4 mr-2" />
                    數據管理
                  </TabsTrigger>
                  <TabsTrigger value="questionnaires">問卷管理</TabsTrigger>
                  <TabsTrigger value="responses">回覆記錄</TabsTrigger>
                  <TabsTrigger value="editor">JSON 編輯器</TabsTrigger>
                </TabsList>

                <TabsContent value="questionnaires" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">管理問卷</h2>
                    <Button onClick={handleNewQuestionnaire}>
                      <Plus className="w-4 h-4 mr-2" />
                      新增問卷
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

                <TabsContent value="editor" className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold">
                      {editingId ? "編輯問卷" : "建立新問卷"}
                    </h2>
                    {editingId && (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setJsonInput("");
                          setEditingId(null);
                          setValidationResult(null);
                        }}
                      >
                        取消編輯
                      </Button>
                    )}
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>JSON 設定</CardTitle>
                      <CardDescription>
                        使用 JSON 定義您的問卷結構。請參閱 README 了解架構詳情。
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Textarea
                        value={jsonInput}
                        onChange={(e) => setJsonInput(e.target.value)}
                        placeholder="在此貼上您的問卷 JSON..."
                        className="min-h-[400px] font-mono text-sm"
                      />

                      {validationResult && (
                        <Alert
                          variant={
                            validationResult.valid ? "default" : "destructive"
                          }
                        >
                          <AlertDescription>
                            {validationResult.valid
                              ? "✅ 有效的 JSON！問卷已成功儲存。"
                              : `❌ ${validationResult.error}`}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex space-x-2">
                        <Button
                          onClick={handleValidateAndSave}
                          disabled={isLoading}
                        >
                          {isLoading
                            ? editingId
                              ? "更新中..."
                              : "建立中..."
                            : editingId
                            ? "更新問卷"
                            : "建立問卷"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleNewQuestionnaireJSON}
                          disabled={isLoading}
                        >
                          載入範本
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="management" className="space-y-6">
                  <AdminManagementTable userRole={user?.role || "user"} />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
