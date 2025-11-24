"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  MapPin,
  Clock,
  Trophy,
  Star,
  ArrowRight,
  Bike,
  Calendar,
  Route,
} from "lucide-react";
import type {
  Questionnaire,
  QuestionnaireResponse,
} from "@/types/questionnaire";

interface QuestionnaireCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinue: () => void;
  questionnaire: Questionnaire;
  response: QuestionnaireResponse;
  selectedRouteName?: string;
}

export function QuestionnaireCompletionModal({
  isOpen,
  onClose,
  onContinue,
  questionnaire,
  response,
  selectedRouteName,
}: QuestionnaireCompletionModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Stagger the content animation
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setShowContent(false);
    }
  }, [isOpen]);

  const handleContinue = () => {
    onContinue();
    onClose();
  };

  // Calculate completion time in a readable format
  const formatCompletionTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} 秒`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return `${minutes} 分 ${remainingSeconds} 秒`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours} 小時 ${minutes} 分`;
    }
  };

  // Get route information if available (simplified - no KML files)
  const getRouteInfo = (): { name: string } | null => {
    if (!selectedRouteName) return null;
    return { name: selectedRouteName };
  };

  const routeInfo = getRouteInfo();

  // Custom DialogContent without close button
  const CustomDialogContent = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  >(
    (
      { className, children, onEscapeKeyDown, onPointerDownOutside, ...props },
      ref
    ) => (
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          ref={ref}
          className={cn(
            "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
            className
          )}
          onEscapeKeyDown={onEscapeKeyDown}
          onPointerDownOutside={onPointerDownOutside}
          {...props}
        >
          {children}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    )
  );
  CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <CustomDialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center transition-all duration-700 ${
                isVisible ? "scale-100 opacity-100" : "scale-0 opacity-0"
              }`}
            >
              <CheckCircle className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
            <div
              className={`transition-all duration-700 delay-200 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
            >
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                評鑑調查完成！
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                感謝您的參與，您的意見對我們非常重要
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Questionnaire Information */}
          <Card
            className={` bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-700/50 transition-all duration-700 delay-300 ${
              showContent
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Bike className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {questionnaire.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {questionnaire.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 pointer-events-none select-none"
                    >
                      {questionnaire.organize}
                    </Badge>
                    <Badge variant="outline">
                      版本 {questionnaire.version}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          {routeInfo && (
            <Card
              className={` bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200/50 dark:border-green-700/50 transition-all duration-700 delay-400 ${
                showContent
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-8 scale-95"
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center flex-shrink-0">
                    <Route className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      選擇的路線
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-200">
                        {routeInfo.name}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Completion Statistics */}
          <Card
            className={` bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-900/20 dark:to-violet-900/20 border border-purple-200/50 dark:border-purple-700/50 transition-all duration-700 delay-500 ${
              showContent
                ? "opacity-100 translate-y-0 scale-100"
                : "opacity-0 translate-y-8 scale-95"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    完成統計
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          完成時間
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCompletionTime(response.timeSpentSeconds || 0)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          完成度
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {response.completionPercentage || 100}%
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          提交時間
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(response.submittedAt).toLocaleString(
                            "zh-TW"
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bike className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          回答問題
                        </p>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {response.answeredQuestions || 0} /{" "}
                          {response.totalQuestions || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-6" />

          {/* Action Buttons */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-4 transition-all duration-700 delay-600 ${
              showContent
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                交通部運輸研究所敬上
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Institute of Transportation, MOTC
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                onClick={handleContinue}
                className="w-full sm:w-auto bg-gradient-to-b from-green-600 to-green-700 
                  hover:from-green-500 hover:to-green-600 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl text-white"
              >
                回到主頁面
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
