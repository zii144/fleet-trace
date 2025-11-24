"use client";

import { useState, useEffect } from "react";
import type {
  Questionnaire,
  QuestionnaireResponse,
  Question,
} from "@/types/questionnaire";
import {
  QuestionRenderer,
  transformResponseForFirebase,
} from "./QuestionRenderer";
import { ValidationSummaryModal } from "./ValidationSummaryModal";
import { QuestionnaireCompletionModal } from "./QuestionnaireCompletionModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/components/auth/AuthProvider";
import { submitQuestionnaireResponse } from "@/lib/user-profile";
import { useRouter } from "next/navigation";
import { useQuestionScroll } from "@/hooks/use-question-scroll";
import { useToast } from "@/components/ui/use-toast";
import { AlertTriangle, CheckCircle } from "lucide-react";

interface QuestionnaireFormProps {
  questionnaire: Questionnaire;
}

export function QuestionnaireForm({ questionnaire }: QuestionnaireFormProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { scrollToQuestion } = useQuestionScroll();
  const { toast } = useToast();
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completedResponse, setCompletedResponse] = useState<any>(null);

  // Keyboard shortcut to open validation modal
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + Shift + V to open validation modal
      if (
        (event.ctrlKey || event.metaKey) &&
        event.shiftKey &&
        event.key === "V"
      ) {
        if (Object.keys(errors).length > 0) {
          setShowValidationModal(true);
        }
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [errors]);

  // Enhanced tracking state
  const [startTime] = useState<number>(Date.now());
  const [sectionStartTime, setSectionStartTime] = useState<number>(Date.now());
  const [revisitCount, setRevisitCount] = useState<number>(0);
  const [deviceType] = useState<"desktop" | "mobile" | "tablet">(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent;
      if (/tablet|ipad|playbook|silk/i.test(userAgent)) return "tablet";
      if (
        /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(
          userAgent
        )
      )
        return "mobile";
      return "desktop";
    }
    return "desktop";
  });

  // Safety check for questionnaire and sections
  if (
    !questionnaire ||
    !questionnaire.sections ||
    questionnaire.sections.length === 0
  ) {
    console.log(
      "❌ QuestionnaireForm: Invalid questionnaire data:",
      questionnaire
    );
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">問卷資料載入中或無效...</p>
      </div>
    );
  }

  const currentSection = questionnaire.sections[currentSectionIndex];

  // Helper function to check if a question should be shown based on conditional logic
  const shouldShowQuestion = (
    question: Question,
    allResponses: Record<string, any>
  ) => {
    if (!question.conditional) return true;

    const { dependsOn, showWhen } = question.conditional;
    const dependentValue = allResponses[dependsOn];

    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependentValue);
    }

    return dependentValue === showWhen;
  };

  // Helper function to check if a section should be shown based on conditional logic
  const shouldShowSection = (
    section: any,
    allResponses: Record<string, any>
  ) => {
    // Check if any question in the section should be shown
    return section.questions.some((question: any) =>
      shouldShowQuestion(question, allResponses)
    );
  };

  // Get only visible questions for validation
  const getVisibleQuestions = (
    section: any,
    allResponses: Record<string, any>
  ) => {
    return section.questions.filter((q: any) =>
      shouldShowQuestion(q, allResponses)
    );
  };

  // Check if we should end the questionnaire early (when user selects "否" for train service)
  const shouldEndQuestionnaire = () => {
    const trainServiceUsage = responses["train-used"];
    const trainNonUsageReason = responses["train-unused-reason"];

    // If user selected "否" for train service and filled the reason, end questionnaire
    return (
      trainServiceUsage === "否" &&
      trainNonUsageReason &&
      (Array.isArray(trainNonUsageReason)
        ? trainNonUsageReason.length > 0
        : trainNonUsageReason.length > 0)
    );
  };

  const validateSection = () => {
    const sectionErrors: Record<string, string> = {};
    const visibleQuestions = getVisibleQuestions(currentSection, responses);

    visibleQuestions.forEach((question: Question) => {
      const value = responses[question.id];

      // Handle matrix questions separately due to their object structure
      if (question.type === "matrix" && question.required) {
        const matrixValue = value || {};
        const matrixQuestion = question as any;
        const missingRows: string[] = [];

        // Check each row (option) to see if it has a value
        matrixQuestion.options?.forEach((option: string) => {
          if (!matrixValue[option]) {
            missingRows.push(option);
          }
        });

        if (missingRows.length > 0) {
          sectionErrors[
            question.id
          ] = `請完成以下項目的評分: ${missingRows.join(", ")}`;
        }
      }
      // Handle region-long-answer questions
      else if (question.type === "region-long-answer" && question.required) {
        const regionValue = value || [];
        const regionQuestion = question as any;
        const minBlocks = regionQuestion.minBlocks || 1;

        if (regionValue.length < minBlocks) {
          sectionErrors[question.id] = `至少需要填寫 ${minBlocks} 個項目`;
        } else {
          // Check if all required fields in each block are filled
          const incompleteBlocks: number[] = [];
          regionValue.forEach((block: any, index: number) => {
            if (!block.region || !block.location || !block.reason) {
              incompleteBlocks.push(index + 1);
            }
          });

          if (incompleteBlocks.length > 0) {
            sectionErrors[question.id] = `請完成第 ${incompleteBlocks.join(
              ", "
            )} 項的所有欄位`;
          }
        }
      }
      // Handle all other question types
      else if (
        question.required &&
        (!value || (Array.isArray(value) && value.length === 0))
      ) {
        if (question.type === "radio-number") {
          const radioNumberValue = value || { selected: "", numbers: {} };
          if (!radioNumberValue.selected) {
            sectionErrors[question.id] = "此欄位為必填";
          }
        } else if (question.type === "radio-text") {
          const radioTextValue = value || { selected: "", texts: {} };
          if (!radioTextValue.selected) {
            sectionErrors[question.id] = "此欄位為必填";
          }
        } else {
          sectionErrors[question.id] = "此欄位為必填";
        }
      }

      // Additional validation for radio-number type
      if (question.type === "radio-number" && value?.selected) {
        const radioNumberQuestion = question as any;
        const selectedOption = radioNumberQuestion.options?.find(
          (opt: any) => opt.value === value.selected
        );
        if (selectedOption?.hasNumberInput) {
          const numberValue = value.numbers?.[value.selected];
          if (!numberValue || numberValue < (selectedOption.numberMin || 1)) {
            sectionErrors[question.id] = `請輸入${
              selectedOption.numberLabel || "數字"
            }`;
          }
        }
      }

      // Additional validation for radio-text type
      if (question.type === "radio-text" && value?.selected) {
        const radioTextQuestion = question as any;
        const selectedOption = radioTextQuestion.options?.find(
          (opt: any) => opt.value === value.selected
        );
        if (selectedOption?.hasTextInput) {
          const textValue = value.texts?.[value.selected];
          if (!textValue || textValue.trim() === "") {
            sectionErrors[question.id] = `請輸入${
              selectedOption.textLabel || "文字"
            }`;
          } else {
            // Validate text length
            if (
              selectedOption.textMinLength &&
              textValue.length < selectedOption.textMinLength
            ) {
              sectionErrors[
                question.id
              ] = `文字長度至少需要 ${selectedOption.textMinLength} 個字符`;
            }
            if (
              selectedOption.textMaxLength &&
              textValue.length > selectedOption.textMaxLength
            ) {
              sectionErrors[
                question.id
              ] = `文字長度不能超過 ${selectedOption.textMaxLength} 個字符`;
            }
          }
        }
      }

      // General validation for other types (min/max/pattern)
      if (question.validation && value) {
        const { min, max, pattern } = question.validation;

        if (question.type === "number") {
          const numValue = Number(value);
          if (min !== undefined && numValue < min) {
            sectionErrors[question.id] = `最小值為 ${min}`;
          }
          if (max !== undefined && numValue > max) {
            sectionErrors[question.id] = `最大值為 ${max}`;
          }
        } else if (typeof value === "string") {
          if (min !== undefined && value.length < min) {
            sectionErrors[question.id] = `最少需要 ${min} 個字符`;
          }
          if (max !== undefined && value.length > max) {
            sectionErrors[question.id] = `最多允許 ${max} 個字符`;
          }
        }

        if (
          pattern &&
          typeof value === "string" &&
          !new RegExp(pattern).test(value)
        ) {
          sectionErrors[question.id] = "格式無效";
        }
      }

      // Enhanced time validation
      if (question.type === "time" && value) {
        const timeQuestion = question as any;
        const timeFormat = timeQuestion.timeFormat || "YYYY-MM";

        // Validate time format
        let isValidFormat = true;
        switch (timeFormat) {
          case "YYYY-MM":
            isValidFormat = /^[0-9]{4}-[0-9]{2}$/.test(value);
            break;
          case "YYYY-MM-DD":
            isValidFormat = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(value);
            break;
          case "YYYY":
            isValidFormat = /^[0-9]{4}$/.test(value);
            break;
          case "MM-DD":
            isValidFormat = /^[0-9]{2}-[0-9]{2}$/.test(value);
            break;
          case "HH:mm":
            isValidFormat = /^[0-9]{2}:[0-9]{2}$/.test(value);
            break;
          case "YYYY-MM-DD HH:mm":
            // Accept both formats: "YYYY-MM-DD HH:mm" and "YYYY-MM-DDTHH:mm"
            isValidFormat =
              /^[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}$/.test(value);
            break;
        }

        if (!isValidFormat) {
          sectionErrors[question.id] = `請使用正確的時間格式: ${timeFormat}`;
        }

        // Validate date range if specified
        if (isValidFormat && (timeQuestion.minDate || timeQuestion.maxDate)) {
          // For datetime comparison, normalize the format
          let compareValue = value;
          if (timeFormat === "YYYY-MM-DD HH:mm") {
            compareValue = value.replace("T", " ");
          }

          if (timeQuestion.minDate && compareValue < timeQuestion.minDate) {
            sectionErrors[question.id] = `時間不能早於 ${timeQuestion.minDate}`;
          }
          if (timeQuestion.maxDate && compareValue > timeQuestion.maxDate) {
            sectionErrors[question.id] = `時間不能晚於 ${timeQuestion.maxDate}`;
          }
        }
      }
    });

    setErrors(sectionErrors);
    return Object.keys(sectionErrors).length === 0;
  };

  const findNextVisibleSection = (fromIndex: number): number => {
    for (let i = fromIndex + 1; i < questionnaire.sections.length; i++) {
      if (shouldShowSection(questionnaire.sections[i], responses)) {
        return i;
      }
    }
    return questionnaire.sections.length; // Return length if no more visible sections
  };

  const handleNext = () => {
    if (validateSection()) {
      // Check if we should end questionnaire early (after completing train-service-b)
      if (currentSection.id === "train-service-b" && shouldEndQuestionnaire()) {
        handleSubmit();
        return;
      }

      const nextSectionIndex = findNextVisibleSection(currentSectionIndex);
      if (nextSectionIndex < questionnaire.sections.length) {
        setCurrentSectionIndex(nextSectionIndex);
        setSectionStartTime(Date.now());
        // Scroll to top when moving to next section
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Show success toast
        toast({
          title: "✅ 完成",
          description: "已成功進入下一部分",
          duration: 2000,
        });
      }
    } else {
      // Show validation modal when there are errors
      setShowValidationModal(true);

      // Show error toast
      const errorCount = Object.keys(errors).length;
      toast({
        title: "⚠️ 請完成必填項目",
        description: `還有 ${errorCount} 個問題需要完成`,
        variant: "destructive",
        duration: 4000,
      });
    }
  };

  const handlePrevious = () => {
    // Find the previous visible section
    for (let i = currentSectionIndex - 1; i >= 0; i--) {
      if (shouldShowSection(questionnaire.sections[i], responses)) {
        setCurrentSectionIndex(i);
        setSectionStartTime(Date.now());
        setRevisitCount((prev) => prev + 1);
        // Scroll to top when moving to previous section
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      }
    }
  };

  const handleSubmit = async () => {
    if (!validateSection() || !user) {
      console.log("❌ Validation failed or no user:", {
        validateSection: validateSection(),
        user,
      });
      // Show validation modal when there are errors
      if (Object.keys(errors).length > 0) {
        setShowValidationModal(true);
      }
      return;
    }

    console.log("🚀 Starting questionnaire submission for user:", user.id);
    console.log("📝 Questionnaire ID:", questionnaire.id);

    setIsSubmitting(true);

    try {
      const endTime = Date.now();
      const timeSpentSeconds = Math.floor((endTime - startTime) / 1000);

      // Calculate enhanced metrics
      const totalQuestions = questionnaire.sections.reduce(
        (sum, section) => sum + section.questions.length,
        0
      );

      const answeredQuestions = Object.keys(responses).length;

      const completionPercentage =
        totalQuestions > 0
          ? Math.round((answeredQuestions / totalQuestions) * 100)
          : 0;

      const averageTimePerQuestion =
        answeredQuestions > 0
          ? Math.round(timeSpentSeconds / answeredQuestions)
          : 0;

      // Transform responses for Firebase before submission
      const transformedResponses: Record<string, any> = {};
      questionnaire.sections.forEach((section) => {
        section.questions.forEach((question) => {
          const response = responses[question.id];
          if (response !== undefined) {
            transformedResponses[question.id] = transformResponseForFirebase(
              question.id,
              response,
              question.type
            );
          }
        });
      });

      // Calculate total characters written using transformed responses
      const totalCharactersWritten = Object.values(transformedResponses).reduce(
        (sum, value) => {
          if (typeof value === "string") {
            return sum + value.length;
          }
          if (typeof value === "object" && value !== null) {
            // Handle complex objects (like matrix responses)
            return sum + JSON.stringify(value).length;
          }
          return sum;
        },
        0
      );

      // Count text responses and map selections
      let textResponsesCount = 0;
      let mapSelectionsCount = 0;

      questionnaire.sections.forEach((section) => {
        section.questions.forEach((question) => {
          const response = responses[question.id];
          if (response) {
            if (["text", "textarea", "email"].includes(question.type)) {
              textResponsesCount++;
            } else if (question.type === "map") {
              mapSelectionsCount++;
            }
          }
        });
      });

      const response: QuestionnaireResponse = {
        id: `${questionnaire.id}-${user.id}-${Date.now()}`,
        questionnaireId: questionnaire.id,
        userId: user.id,
        responses: transformedResponses,
        submittedAt: new Date().toISOString(),
        completedSections: questionnaire.sections
          .slice(0, currentSectionIndex + 1)
          .map((s) => s.id),
        status: "completed" as const,
        startedAt: new Date(startTime).toISOString(),
        updatedAt: new Date().toISOString(),
        // Enhanced tracking data
        totalCharactersWritten,
        timeSpentSeconds,
        totalQuestions,
        answeredQuestions,
        averageTimePerQuestion,
        deviceType,
        completionPercentage,
        textResponsesCount,
        mapSelectionsCount,
        revisitCount,
      };

      console.log("📊 Submitting questionnaire with enhanced metrics:", {
        timeSpentSeconds,
        totalCharactersWritten,
        completionPercentage,
        deviceType,
        revisitCount,
      });

      // Double-check user authentication before submission
      if (!user || !user.id) {
        throw new Error("User authentication lost before submission");
      }

      console.log("🔐 Verified user before submission:", {
        id: user.id,
        email: user.email,
      });

      // Submit the questionnaire response first
      await submitQuestionnaireResponse(user.id, response);

      // Store the completed response and show completion modal
      setCompletedResponse(response);
      setShowCompletionModal(true);

      // Show success toast
      toast({
        title: "🎉 提交成功",
        description: "問卷已成功提交，感謝您的參與！",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error submitting questionnaire:", error);

      // Show error toast
      toast({
        title: "❌ 提交失敗",
        description: "提交問卷時發生錯誤，請稍後再試",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateResponse = (questionId: string, value: any) => {
    setResponses((prev) => {
      const newResponses = {
        ...prev,
        [questionId]: value,
      };

      // Clear responses for questions that are now hidden due to conditional logic
      // Check ALL sections, not just current section
      questionnaire.sections.forEach((section) => {
        section.questions.forEach((question: any) => {
          if (question.conditional) {
            const { dependsOn, showWhen } = question.conditional;
            const dependentValue = newResponses[dependsOn];

            let shouldShow = false;
            if (Array.isArray(showWhen)) {
              shouldShow = showWhen.includes(dependentValue);
            } else {
              shouldShow = dependentValue === showWhen;
            }

            // If question should not be shown, clear its response
            if (!shouldShow && newResponses[question.id]) {
              delete newResponses[question.id];
            }
          }
        });
      });

      return newResponses;
    });

    // Clear error when user starts typing
    if (errors[questionId]) {
      setErrors((prev) => ({
        ...prev,
        [questionId]: "",
      }));
    }
  };

  const visibleQuestions = getVisibleQuestions(currentSection, responses);
  const willEndEarly =
    currentSection.id === "train-service-b" && shouldEndQuestionnaire();
  const hasPreviousSection = currentSectionIndex > 0;

  // Calculate effective total sections for progress display
  // If we're in train-service-b and will end early, treat it as the final section
  const getEffectiveTotalSections = () => {
    if (willEndEarly) {
      return currentSectionIndex + 1; // Current section becomes the last section
    }

    // If user selected "否" in train-service-a, exclude train-service-c from count
    const trainServiceUsage = responses["train-used"];
    if (trainServiceUsage === "否") {
      // Find the index of train-service-c and exclude it from total count
      const trainServiceCIndex = questionnaire.sections.findIndex(
        (s) => s.id === "train-service-c"
      );
      if (trainServiceCIndex !== -1) {
        return questionnaire.sections.length - 1; // Exclude train-service-c
      }
    }

    return questionnaire.sections.length;
  };

  const effectiveTotalSections = getEffectiveTotalSections();
  const progress = ((currentSectionIndex + 1) / effectiveTotalSections) * 100;

  // Check if this is effectively the last section
  const isLastSection = currentSectionIndex + 1 === effectiveTotalSections;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl text-gray-800 font-bold mb-2">
          {questionnaire.title}
        </h1>
        <p className="text-muted-foreground mb-4 drop-shadow-sm">
          {questionnaire.description}
        </p>
        <Progress value={progress} className="w-full" />
        <p className="text-sm text-muted-foreground mt-2">
          第 {currentSectionIndex + 1} 部分，共 {effectiveTotalSections} 部分
        </p>

        {/* Error Summary Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>還有 {Object.keys(errors).length} 個問題需要完成</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowValidationModal(true)}
                className="ml-2"
              >
                查看詳細
              </Button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      <Card className="rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle>{currentSection.title}</CardTitle>
          {currentSection.description && (
            <CardDescription>{currentSection.description}</CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-6">
          {visibleQuestions.map((question: Question) => (
            <QuestionRenderer
              key={question.id}
              question={question}
              value={responses[question.id]}
              onChange={(value) => updateResponse(question.id, value)}
              error={errors[question.id]}
              allResponses={responses}
              questionnaireId={questionnaire.id}
            />
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={!hasPreviousSection}
          className="w-auto bg-gradient-to-b from-white to-gray-100 
                  hover:from-gray-50 hover:to-white transition-all duration-500 
                  shadow-md transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
        >
          上一步
        </Button>

        {isLastSection || willEndEarly ? (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "提交"}
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="w-auto bg-gradient-to-b from-slate-700 to-slate-800 
                  hover:from-slate-600 hover:to-slate-700 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
          >
            {willEndEarly ? "提交" : "下一步"}
          </Button>
        )}
      </div>

      {/* Show early completion message if applicable */}
      {willEndEarly && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            感謝您的回答！由於您未曾使用兩鐵列車服務，問卷將在此結束。
          </p>
        </div>
      )}

      {/* Validation Summary Modal */}
      <ValidationSummaryModal
        isOpen={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        errors={errors}
        questions={visibleQuestions}
        onScrollToQuestion={scrollToQuestion}
      />

      {/* Questionnaire Completion Modal */}
      {completedResponse && (
        <QuestionnaireCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          onContinue={() => router.push("/dashboard?submitted=true")}
          questionnaire={questionnaire}
          response={completedResponse}
          selectedRouteName={
            responses[
              questionnaire.routeTracking?.routeSelectionQuestionId || ""
            ]
          }
        />
      )}
    </div>
  );
}
