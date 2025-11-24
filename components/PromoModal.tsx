"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Gift,
  MapPin,
  Star,
  Trophy,
  Users,
  Mail,
  ArrowRight,
  Bike,
  CreditCard,
  Divide,
} from "lucide-react";

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGetStarted?: () => void;
  onDismissPermanently?: () => void;
}

export function PromoModal({
  isOpen,
  onClose,
  onGetStarted,
  onDismissPermanently,
}: PromoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [quotaData, setQuotaData] = useState<any>(null);
  const [isLoadingQuota, setIsLoadingQuota] = useState(false);

  const steps = [
    {
      icon: <Users className="w-5 h-5" />,
      title: "建立個人資料",
      description: "點選個人資料問卷進行填寫",
      action: "完成個人檔案設定",
    },
    {
      icon: <Bike className="w-5 h-5" />,
      title: "填寫兩鐵使用經驗",
      description: "於個人資料問卷填寫兩鐵使用經驗",
      action: "分享騎乘體驗",
    },
    {
      icon: <MapPin className="w-5 h-5" />,
      title: "選擇路線回饋",
      description: "點選多元自行車路線或環島自行車路線問卷進行填寫",
      action: "提供路線評價",
    },
  ];

  const rewards = [
    { cash: 25, description: "完成一條路線即可獲" },
    { cash: 200, description: "每人最多可獲", highlight: true },
  ];

  // Load quota data when modal opens
  useEffect(() => {
    if (isOpen) {
      loadQuotaData();
    }
  }, [isOpen]);

  const loadQuotaData = async () => {
    setIsLoadingQuota(true);
    try {
      // Quota data loading removed - no longer using route-based quotas
      setQuotaData(null);
    } catch (error) {
      console.error("Error loading quota data:", error);
    } finally {
      setIsLoadingQuota(false);
    }
  };

  const handleGetStarted = () => {
    onGetStarted?.();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] max-h-[80vh] lg:h-auto rounded-xl bg-white overflow-y-auto lg:p-8 md:p-6 sm:p-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <Bike className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                乘跡旅程意見調查活動
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                分享您的騎乘經驗，獲得豐富獎勵
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Welcome Message */}
          <Card className="border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950">
            <CardContent className="p-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                感謝您使用環島自行車路線完成乘跡旅程！為了解您的使用感受，做為未來改善參考，
                請您撥空加入意見調查活動。
              </p>
            </CardContent>
          </Card>

          {/* Survey Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="w-5 h-5 text-green-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    調查範圍
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  全國的《環島自行車路線》 及《多元自行車路線》
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      總獎金額度
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadQuotaData}
                    disabled={isLoadingQuota}
                    className="text-xs h-6 px-2"
                  >
                    {isLoadingQuota ? "載入中..." : "重新整理"}
                  </Button>
                </div>
                <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  NT$ 32,000
                </p>
                {isLoadingQuota ? (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    載入中...
                  </div>
                ) : quotaData ? (
                  <>
                    {quotaData.map((category: any) => (
                      <p
                        key={category.category}
                        className="text-xs text-gray-600 dark:text-gray-400"
                      >
                        {category.categoryName}兌換名額度剩餘
                        <Badge
                          variant="secondary"
                          className={`mx-1 ${
                            category.totalRemaining === 0
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : category.totalRemaining <= 10
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                        >
                          {category.totalRemaining}
                        </Badge>
                        份
                        {category.totalRemaining === 0 && (
                          <span className="text-red-600 dark:text-red-400 ml-1">
                            (已額滿)
                          </span>
                        )}
                        {category.totalRemaining > 0 &&
                          category.totalRemaining <= 10 && (
                            <span className="text-orange-600 dark:text-orange-400 ml-1">
                              (即將額滿)
                            </span>
                          )}
                      </p>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    載入中...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          {/* Rewards Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  獎勵機制
                </h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className=" p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 ">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      每人最多可提交
                      <Badge
                        variant="default"
                        className="mx-1 bg-blue-500 text-white pointer-events-none select-none"
                      >
                        10
                      </Badge>
                      條路線回饋
                    </span>
                  </div>
                </div>
                <div className=" p-3 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800 ">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    完成每條路線回饋，即可獲得
                    <Badge
                      variant="default"
                      className="mx-1 bg-green-500 text-white pointer-events-none select-none"
                    >
                      25
                    </Badge>
                    元 Line Points
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Steps Section */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  參與步驟
                </h3>
              </div>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-blue-600 text-white`}
                      >
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {step.icon}
                        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {step.title}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {step.description}
                      </p>
                      {/* {index < steps.length - 1 && (
                        <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
                          <ArrowRight className="w-3 h-3" />
                          <span>{step.action}</span>
                        </div>
                        )} */}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {/* Voucher Distribution */}
          <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  禮券發送方式
                </h3>
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                工作團隊將於 <b>「結算期間」 </b>
                ，依據您當前累積達到兌換門檻，依據您所建立的會員 「
                <b>個人帳戶電子郵件</b>」 寄送電子禮券。
              </p>
            </CardContent>
          </Card>
          <Separator />
          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 ">
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                交通部運輸研究所敬上
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Institute of Transportation, MOTC
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 ">
              {onDismissPermanently && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDismissPermanently}
                  className="text-gray-500 text-xs"
                >
                  不再顯示
                </Button>
              )}
              <div className="flex gap-2 sm:gap">
                <Button
                  onClick={handleGetStarted}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  立即開始
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
