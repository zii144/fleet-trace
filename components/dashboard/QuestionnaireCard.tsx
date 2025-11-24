"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileText, Lock, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import type { Questionnaire } from "@/types/questionnaire";
import type { QualificationStatus } from "@/lib/services/QuestionnaireQualificationService";
import { qualificationService } from "@/lib/services";
import { useAuth } from "@/components/auth/AuthProvider";
import { Banner } from "../ui/Banner";

interface QuestionnaireCardProps {
  questionnaire: Questionnaire;
}

export function QuestionnaireCard({ questionnaire }: QuestionnaireCardProps) {
  const { user } = useAuth();
  const [qualificationStatus, setQualificationStatus] =
    useState<QualificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const totalQuestions = questionnaire.sections.reduce(
    (acc, section) => acc + section.questions.length,
    0
  );

  useEffect(() => {
    const checkQualification = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // Check if user's email is verified from Firebase auth
        const isEmailVerified = user.emailVerified || false;

        const status = await qualificationService.checkQualification(
          user.id,
          questionnaire.id,
          isEmailVerified
        );
        setQualificationStatus(status);
      } catch (error) {
        console.error("Error checking qualification:", error);
        // Default to qualified if there's an error
        setQualificationStatus({
          isQualified: true,
          missingPrerequisites: [],
          completedPrerequisites: [],
          isDisabled: false,
          emailVerified: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkQualification();
  }, [user?.id, questionnaire.id, user?.emailVerified]);

  // Check if questionnaire is disabled due to qualification requirements OR completion
  const isDisabledByPrerequisites =
    qualificationStatus && !qualificationStatus.isQualified;
  const isDisabledByCompletion = qualificationStatus?.isDisabled || false;
  const isDisabled = isDisabledByPrerequisites || isDisabledByCompletion;

  const hasPrerequisites = qualificationService.hasPrerequisites(
    questionnaire.id
  );

  return (
    <Card
      className={`transition-all duration-500 ease-in-out flex flex-col hover-lift h-full ${
        isDisabled
          ? "rounded-2xl opacity-60 border-gray-300 bg-gray-50 dark:bg-gray-800"
          : "rounded-2xl inset-shadow-2xs hover:shadow-lg hover:scale-105 hover:-translate-y-0.5"
      } border-2 border-white inset-shadow-lg`}
    >
      <CardHeader className="relative p-0">
        <div className="relative w-full h-full rounded-t-2xl overflow-hidden">
          <Banner
            className="w-full h-full object-cover blur-[1px] transition-transform duration-700 hover:scale-110"
            backgroundVideo={questionnaire.banner}
          />
          <div className="absolute overflow-hidden inset-0 bg-gradient-to-b from-white/5 via-white/30 to-white/100 transition-opacity duration-300 hover:opacity-80" />
        </div>

        <div className="p-4">
          <CardTitle
            className={`text-xl text-gray-800 ${
              isDisabled ? "text-gray-500" : ""
            }`}
          >
            {questionnaire.title}
          </CardTitle>
          <CardDescription
            className={isDisabled ? "text-gray-400 pt-2" : "pt-2"}
          >
            {questionnaire.description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="space-y-2 mb-4">
          <p
            className={`text-sm ${
              isDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <strong>主辦機關:</strong>{" "}
            {questionnaire.organize || "交通部運輸研究所"}
          </p>
          {/*<p
            className={`text-sm ${
              isDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <strong>部分:</strong> 約 {questionnaire.sections.length} 個
          </p>*/}
          <p
            className={`text-sm ${
              isDisabled ? "text-gray-400" : "text-gray-600"
            }`}
          >
            <strong>問題:</strong> 約 {totalQuestions} 問
          </p>
        </div>

        {/* Show qualification status */}
        {(hasPrerequisites ||
          qualificationService.requiresEmailVerification(questionnaire.id)) &&
          qualificationStatus &&
          !isLoading && (
            <div className="mb-4">
              {!qualificationStatus.isQualified ? (
                <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-sm text-orange-700 dark:text-orange-300">
                    <div className="font-medium mb-1">需要完成以下條件：</div>
                    <ul className="list-disc list-inside space-y-1">
                      {qualificationStatus.missingPrerequisites.map(
                        (prereq) => (
                          <li key={prereq} className="text-xs">
                            {qualificationService.getQuestionnaireName(prereq)}
                          </li>
                        )
                      )}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <AlertDescription className="text-sm text-green-700 dark:text-green-300 font-medium">
                      本評鑑調查現已開放
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </div>
          )}

        {/* Show completion status for questionnaires that should be disabled when completed */}
        {isDisabledByCompletion && qualificationStatus && !isLoading && (
          <div className="mb-4">
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-sm text-blue-700 dark:text-blue-300">
                <div className="font-medium mb-1">已完成此評鑑調查</div>
                <p className="text-xs">
                  感謝您的參與！現在可以自由完成其他評鑑調查
                </p>
              </AlertDescription>
            </Alert>
          </div>
        )}

        {/* Show repeatable status for questionnaires that are repeatable (exclude taxi surveys) */}
        {questionnaire.isRepeatable &&
          !questionnaire.id.includes("-taxi-service-quality-survey") && (
            <div className="mb-4">
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <div className="flex items-center gap-2">
                  <AlertDescription className="text-sm text-yellow-700 dark:text-yellow-300">
                    <div className="font-medium mb-1">
                      本評鑑調查可以重複填寫，且每條路線只能填寫一次，完成後將自動列入
                      <b>「路線回饋」</b>資料；詳情請參閱<b>「獎勵活動」</b>頁面
                    </div>
                  </AlertDescription>
                </div>
              </Alert>
            </div>
          )}

        <div className="mt-auto">
          {isDisabled ? (
            <Button className="w-full" disabled variant="outline">
              {isDisabledByCompletion ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  已完成此評鑑調查
                </>
              ) : qualificationStatus?.missingPrerequisites.includes(
                  "email-verification"
                ) ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  需要驗證電子郵件
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  目前本評鑑調查尚未開放
                </>
              )}
            </Button>
          ) : (
            <Link href={`/questionnaire/${questionnaire.id}`}>
              <Button
                className="w-full bg-gradient-to-b from-gray-800 to-gray-950 
                  text-center 
                  transition-all duration-500 ease-in-out
                hover:from-gray-700 hover:to-gray-800 hover:scale-105
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
              >
                開始評鑑調查
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
