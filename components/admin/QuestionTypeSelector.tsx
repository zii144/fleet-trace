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
import {
  Type,
  Hash,
  Mail,
  ChevronDown,
  Circle,
  Square,
  AlignLeft,
  Grid3X3,
  Map,
  Clock,
  MessageSquare,
} from "lucide-react";
import type { QuestionType } from "@/types/questionnaire";

interface QuestionTypeOption {
  type: QuestionType;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: "basic" | "choice" | "advanced";
  features?: string[];
}

const questionTypes: QuestionTypeOption[] = [
  // Basic Input Types
  {
    type: "text",
    title: "文字輸入",
    description: "單行文字輸入欄位",
    icon: <Type className="w-5 h-5" />,
    category: "basic",
    features: ["驗證規則", "字數限制"],
  },
  {
    type: "textarea",
    title: "長文本",
    description: "多行文字輸入區域",
    icon: <AlignLeft className="w-5 h-5" />,
    category: "basic",
    features: ["字數限制", "行數設定"],
  },
  {
    type: "number",
    title: "數字",
    description: "數字輸入欄位",
    icon: <Hash className="w-5 h-5" />,
    category: "basic",
    features: ["最小/最大值", "小數位數"],
  },
  {
    type: "email",
    title: "電子郵件",
    description: "電子郵件地址輸入",
    icon: <Mail className="w-5 h-5" />,
    category: "basic",
    features: ["自動驗證", "格式檢查"],
  },

  // Choice Types
  {
    type: "select",
    title: "下拉選單",
    description: "從下拉清單中選擇一個選項",
    icon: <ChevronDown className="w-5 h-5" />,
    category: "choice",
    features: ["單選", "可搜尋"],
  },
  {
    type: "radio",
    title: "單選題",
    description: "從多個選項中選擇一個",
    icon: <Circle className="w-5 h-5" />,
    category: "choice",
    features: ["單選", "清楚顯示"],
  },
  {
    type: "checkbox",
    title: "多選題",
    description: "可以選擇多個選項",
    icon: <Square className="w-5 h-5" />,
    category: "choice",
    features: ["多選", "全選功能"],
  },

  // Advanced Types
  {
    type: "matrix",
    title: "矩陣題",
    description: "多個問題使用相同的評分量表",
    icon: <Grid3X3 className="w-5 h-5" />,
    category: "advanced",
    features: ["量表評分", "批量問題"],
  },
  {
    type: "map",
    title: "地圖選擇",
    description: "在地圖上選擇地點或路線",
    icon: <Map className="w-5 h-5" />,
    category: "advanced",
    features: ["KML 支援", "多點選擇"],
  },
  {
    type: "time",
    title: "時間選擇",
    description: "日期或時間選擇器",
    icon: <Clock className="w-5 h-5" />,
    category: "advanced",
    features: ["多種格式", "範圍限制"],
  },
  {
    type: "radio-number",
    title: "單選+數字",
    description: "單選選項加上數字輸入",
    icon: <Circle className="w-5 h-5" />,
    category: "advanced",
    features: ["混合輸入", "條件顯示"],
  },
  {
    type: "radio-text",
    title: "單選+文字",
    description: "單選選項加上文字輸入",
    icon: <MessageSquare className="w-5 h-5" />,
    category: "advanced",
    features: ["混合輸入", "其他選項"],
  },
  {
    type: "region-long-answer",
    title: "地區長回答",
    description: "地區選擇加上長文本回答",
    icon: <AlignLeft className="w-5 h-5" />,
    category: "advanced",
    features: ["地區分類", "多區塊回答"],
  },
];

interface QuestionTypeSelectorProps {
  onSelect: (type: QuestionType) => void;
  onCancel: () => void;
}

export function QuestionTypeSelector({
  onSelect,
  onCancel,
}: QuestionTypeSelectorProps) {
  const categories = [
    { id: "basic", title: "基本輸入", description: "常用的基本輸入類型" },
    { id: "choice", title: "選擇題", description: "單選和多選問題" },
    { id: "advanced", title: "進階功能", description: "複雜的問題類型" },
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "basic":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "choice":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "advanced":
        return "bg-purple-50 border-purple-200 hover:bg-purple-100";
      default:
        return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "choice":
        return "bg-green-100 text-green-800";
      case "advanced":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 pb-4">
      {categories.map((category) => (
        <div key={category.id}>
          <div className="mb-4">
            <h3 className="text-lg font-semibold">{category.title}</h3>
            <p className="text-sm text-gray-600">{category.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questionTypes
              .filter((type) => type.category === category.id)
              .map((questionType) => (
                <Card
                  key={questionType.type}
                  className={`cursor-pointer transition-all ${getCategoryColor(
                    questionType.category
                  )}`}
                  onClick={() => onSelect(questionType.type)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-lg shadow-sm">
                          {questionType.icon}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {questionType.title}
                          </CardTitle>
                          <Badge
                            className={`text-xs ${getCategoryBadgeColor(
                              questionType.category
                            )}`}
                          >
                            {questionType.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="mb-3">
                      {questionType.description}
                    </CardDescription>
                    {questionType.features && (
                      <div className="flex flex-wrap gap-1">
                        {questionType.features.map((feature, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs"
                          >
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
