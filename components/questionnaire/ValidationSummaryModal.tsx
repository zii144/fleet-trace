"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import type { Question } from "@/types/questionnaire";
import {
  FileText,
  ListTodo,
  ClipboardList,
  Hash,
  Mail,
  Clock,
  Map,
  BarChart2,
  MapPin,
  HelpCircle,
} from "lucide-react";

interface ValidationError {
  questionId: string;
  questionLabel: string;
  error: string;
  questionType: string;
}

interface ValidationSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: Record<string, string>;
  questions: Question[];
  onScrollToQuestion: (questionId: string) => void;
}

export function ValidationSummaryModal({
  isOpen,
  onClose,
  errors,
  questions,
  onScrollToQuestion,
}: ValidationSummaryModalProps) {
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>(
    []
  );

  useEffect(() => {
    if (isOpen && errors) {
      const errorList: ValidationError[] = Object.entries(errors).map(
        ([questionId, error]) => {
          const question = questions.find((q) => q.id === questionId);
          return {
            questionId,
            questionLabel: question?.label || questionId,
            error,
            questionType: question?.type || "unknown",
          };
        }
      );
      setValidationErrors(errorList);
    }
  }, [isOpen, errors, questions]);

  const handleScrollToFirstError = () => {
    if (validationErrors.length > 0) {
      onScrollToQuestion(validationErrors[0].questionId);
      onClose();
    }
  };

  const handleScrollToQuestion = (questionId: string) => {
    onScrollToQuestion(questionId);
    onClose();
  };

  const getQuestionTypeIcon = (questionType: string) => {
    switch (questionType) {
      case "text":
      case "textarea":
        return <FileText className="w-5 h-5 inline-block text-gray-700" />;
      case "radio":
      case "checkbox":
        return <ListTodo className="w-5 h-5 inline-block text-gray-700" />;
      case "select":
        return <ClipboardList className="w-5 h-5 inline-block text-gray-700" />;
      case "number":
        return <Hash className="w-5 h-5 inline-block text-gray-700" />;
      case "email":
        return <Mail className="w-5 h-5 inline-block text-gray-700" />;
      case "time":
        return <Clock className="w-5 h-5 inline-block text-gray-700" />;
      case "map":
        return <Map className="w-5 h-5 inline-block text-gray-700" />;
      case "matrix":
        return <BarChart2 className="w-5 h-5 inline-block text-gray-700" />;
      case "region-long-answer":
        return <MapPin className="w-5 h-5 inline-block text-gray-700" />;
      default:
        return <HelpCircle className="w-5 h-5 inline-block text-gray-700" />;
    }
  };

  const getQuestionTypeLabel = (questionType: string) => {
    switch (questionType) {
      case "text":
        return "文字輸入";
      case "textarea":
        return "長文字輸入";
      case "radio":
        return "單選題";
      case "checkbox":
        return "複選題";
      case "select":
        return "下拉選單";
      case "number":
        return "數字輸入";
      case "email":
        return "電子郵件";
      case "time":
        return "時間輸入";
      case "map":
        return "地圖選擇";
      case "matrix":
        return "矩陣評分";
      case "region-long-answer":
        return "地區詳細回答";
      default:
        return "其他";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            請完成以下必填項目
          </DialogTitle>
          <DialogDescription>
            您還有 {validationErrors.length} 個問題需要完成才能繼續
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              請點擊下方項目直接跳轉到對應問題進行填寫
            </AlertDescription>
          </Alert>

          {validationErrors.map((error, index) => (
            <div
              key={error.questionId}
              className="flex items-start gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => handleScrollToQuestion(error.questionId)}
            >
              {/*<div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-sm font-medium text-red-600">
                {index + 1}
              </div>*/}

              <div className="flex-1 min-w-0 ml-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">
                    {getQuestionTypeIcon(error.questionType)}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {getQuestionTypeLabel(error.questionType)}
                  </span>
                </div>

                <h4 className="font-medium text-gray-900 mb-1">
                  {error.questionLabel}
                </h4>

                <p className="text-sm text-red-600">{error.error}</p>
              </div>

              <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
            </div>
          ))}
        </div>

        <DialogFooter className="">
          <Button
            onClick={handleScrollToFirstError}
            className="w-full bg-gradient-to-b from-gray-800 to-gray-950 
                  hover:from-gray-700 hover:to-gray-800 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
          >
            跳轉到第一個問題
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
