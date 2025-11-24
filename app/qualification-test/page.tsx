"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { qualificationService, type QualificationStatus } from "@/lib/services";
import { useAuth } from "@/components/auth/AuthProvider";
import { Lock, CheckCircle, AlertCircle, User, FileText } from "lucide-react";

export default function QualificationTestPage() {
  const { user } = useAuth();
  const [qualifications, setQualifications] = useState<
    Record<string, QualificationStatus>
  >({});
  const [isLoading, setIsLoading] = useState(false);

  const testQuestionnaires = [
    "self-info-survey",
    "train-service-usage-survey-2025",
    "cycling-survey-2025",
    "diverse-cycling-survey-2025",
  ];

  const checkAllQualifications = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Check if user's email is verified
      const isEmailVerified = user.emailVerified || false;
      
      const results = await qualificationService.checkMultipleQualifications(
        user.id,
        testQuestionnaires,
        isEmailVerified
      );
      setQualifications(results);
    } catch (error) {
      console.error("Error checking qualifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAllQualifications();
  }, [user?.id]);

  const qualificationRules = qualificationService.getQualificationRules();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                請先登入
              </h3>
              <p className="text-gray-600">需要登入才能測試問卷資格檢查功能</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            問卷資格檢查測試
          </h1>
          <p className="text-gray-600">測試用戶問卷參與資格檢查系統</p>
        </div>

        {/* User Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              測試用戶資訊
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">用戶 ID:</p>
                <p className="font-mono text-sm">{user.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">電子郵件:</p>
                <p className="text-sm">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">電子郵件驗證狀態:</p>
                <p className={`text-sm font-medium ${user.emailVerified ? 'text-green-600' : 'text-red-600'}`}>
                  {user.emailVerified ? '已驗證' : '未驗證'}
                </p>
              </div>
            </div>
            <Button
              onClick={checkAllQualifications}
              disabled={isLoading}
              className="mt-4"
            >
              {isLoading ? "檢查中..." : "重新檢查資格"}
            </Button>
          </CardContent>
        </Card>

        {/* Qualification Rules */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>資格規則設定</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {qualificationRules.map((rule) => (
                <div key={rule.id} className="border rounded-lg p-4">
                  <h3 className="font-medium mb-2">{rule.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    問卷 ID: {rule.id}
                  </p>
                  {rule.prerequisites.length > 0 ? (
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-1">
                        前置條件:
                      </p>
                      <ul className="list-disc list-inside space-y-1">
                        {rule.prerequisites.map((prereq) => (
                          <li key={prereq} className="text-sm text-gray-600">
                            {qualificationService.getQuestionnaireName(prereq)}
                            <span className="text-gray-400 ml-2">
                              ({prereq})
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="text-sm text-green-600">
                      無前置條件 - 隨時可參與
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Qualification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              資格檢查結果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="mt-2 text-gray-600">檢查資格中...</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {testQuestionnaires.map((questionnaireId) => {
                  const status = qualifications[questionnaireId];
                  const hasPrerequisites =
                    qualificationService.hasPrerequisites(questionnaireId);

                  return (
                    <Card
                      key={questionnaireId}
                      className={`
                      ${
                        status?.isQualified === false
                          ? "border-orange-200 bg-orange-50"
                          : ""
                      }
                      ${
                        status?.isQualified === true && hasPrerequisites
                          ? "border-green-200 bg-green-50"
                          : ""
                      }
                    `}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {status?.isQualified === false ? (
                              <Lock className="w-5 h-5 text-orange-600" />
                            ) : status?.isQualified === true &&
                              hasPrerequisites ? (
                              <CheckCircle className="w-5 h-5 text-green-600" />
                            ) : (
                              <FileText className="w-5 h-5 text-blue-600" />
                            )}
                            <CardTitle className="text-base">
                              {qualificationService.getQuestionnaireName(
                                questionnaireId
                              )}
                            </CardTitle>
                          </div>
                          <Badge
                            variant={
                              status?.isQualified === false
                                ? "destructive"
                                : status?.isQualified === true &&
                                  hasPrerequisites
                                ? "default"
                                : "secondary"
                            }
                          >
                            {status?.isQualified === false
                              ? "未符合"
                              : status?.isQualified === true && hasPrerequisites
                              ? "符合資格"
                              : "無限制"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3">
                          問卷 ID:{" "}
                          <code className="bg-gray-100 px-1 rounded">
                            {questionnaireId}
                          </code>
                        </p>

                        {hasPrerequisites && status && (
                          <div className="space-y-2">
                            {status.completedPrerequisites.length > 0 && (
                              <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-sm">
                                  <div className="font-medium text-green-700 mb-1">
                                    已完成:
                                  </div>
                                  <ul className="list-disc list-inside">
                                    {status.completedPrerequisites.map(
                                      (prereq: string) => (
                                        <li
                                          key={prereq}
                                          className="text-xs text-green-600"
                                        >
                                          {qualificationService.getQuestionnaireName(
                                            prereq
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}

                            {status.missingPrerequisites.length > 0 && (
                              <Alert className="border-orange-200 bg-orange-50">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <AlertDescription className="text-sm">
                                  <div className="font-medium text-orange-700 mb-1">
                                    尚未完成:
                                  </div>
                                  <ul className="list-disc list-inside">
                                    {status.missingPrerequisites.map(
                                      (prereq: string) => (
                                        <li
                                          key={prereq}
                                          className="text-xs text-orange-600"
                                        >
                                          {qualificationService.getQuestionnaireName(
                                            prereq
                                          )}
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>
                        )}

                        {!hasPrerequisites && (
                          <Alert className="border-blue-200 bg-blue-50">
                            <FileText className="h-4 w-4 text-blue-600" />
                            <AlertDescription className="text-sm text-blue-700">
                              此問卷無前置條件，隨時可以參與
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>除錯資訊</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(qualifications, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
