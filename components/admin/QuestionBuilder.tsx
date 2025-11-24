"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Plus,
  Trash2,
  Edit,
  GripVertical,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import type { Question } from "@/types/questionnaire";

interface QuestionBuilderProps {
  question: Question;
  index: number;
  onUpdate: (updates: Partial<Question>) => void;
  onDelete: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
  isDragging?: boolean;
}

export function QuestionBuilder({
  question,
  index,
  onUpdate,
  onDelete,
  onDragStart,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  canMoveUp = true,
  canMoveDown = true,
  isDragging = false,
}: QuestionBuilderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getQuestionTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      text: "文字輸入",
      email: "電子郵件",
      number: "數字",
      select: "下拉選單",
      radio: "單選題",
      checkbox: "多選題",
      textarea: "長文本",
      matrix: "矩陣題",
      map: "地圖選擇",
      "radio-number": "單選+數字",
      "radio-text": "單選+文字",
      time: "時間選擇",
      "region-long-answer": "地區長回答",
    };
    return typeLabels[type] || type;
  };

  const handleOptionsUpdate = (options: string[]) => {
    onUpdate({ options } as any);
  };

  const handleAddOption = () => {
    const currentOptions = (question as any).options || [];
    handleOptionsUpdate([
      ...currentOptions,
      `選項 ${currentOptions.length + 1}`,
    ]);
  };

  const handleUpdateOption = (index: number, value: string) => {
    const currentOptions = (question as any).options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    handleOptionsUpdate(newOptions);
  };

  const handleDeleteOption = (index: number) => {
    const currentOptions = (question as any).options || [];
    if (currentOptions.length <= 1) return;
    const newOptions = currentOptions.filter(
      (_: any, i: number) => i !== index
    );
    handleOptionsUpdate(newOptions);
  };

  const renderQuestionSpecificFields = () => {
    switch (question.type) {
      case "select":
      case "radio":
      case "checkbox":
        return (
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <Label className="text-xs sm:text-sm font-medium">選項</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={handleAddOption}
                className="text-xs px-2 py-1 h-7 sm:h-8 w-fit"
              >
                <Plus className="w-3 h-3 mr-1" />
                新增選項
              </Button>
            </div>
            <div className="space-y-1 sm:space-y-2 max-w-full">
              {((question as any).options || []).map(
                (option: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 max-w-full"
                  >
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleUpdateOption(index, e.target.value)
                      }
                      placeholder={`選項 ${index + 1}`}
                      className="text-xs sm:text-sm flex-1 min-w-0 h-8 sm:h-9"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteOption(index)}
                      disabled={((question as any).options || []).length <= 1}
                      className="flex-shrink-0 px-1 sm:px-2 h-8 sm:h-9"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                )
              )}
            </div>
          </div>
        );

      case "matrix":
        return (
          <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
            <div>
              <Label className="text-xs sm:text-sm font-medium">
                行項目（問題）
              </Label>
              <div className="space-y-1 sm:space-y-2 mt-2">
                {((question as any).options || []).map(
                  (option: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 max-w-full"
                    >
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [
                            ...((question as any).options || []),
                          ];
                          newOptions[index] = e.target.value;
                          onUpdate({ options: newOptions } as any);
                        }}
                        placeholder={`行項目 ${index + 1}`}
                        className="text-xs sm:text-sm flex-1 min-w-0 h-8 sm:h-9"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newOptions = (
                            (question as any).options || []
                          ).filter((_: any, i: number) => i !== index);
                          onUpdate({ options: newOptions } as any);
                        }}
                        className="flex-shrink-0 px-1 sm:px-2 h-8 sm:h-9"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentOptions = (question as any).options || [];
                    onUpdate({
                      options: [
                        ...currentOptions,
                        `行項目 ${currentOptions.length + 1}`,
                      ],
                    } as any);
                  }}
                  className="text-xs px-2 py-1 h-7 sm:h-8 w-fit"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  新增行項目
                </Button>
              </div>
            </div>

            <div>
              <Label className="text-xs sm:text-sm font-medium">
                評分量表（列）
              </Label>
              <div className="space-y-1 sm:space-y-2 mt-2">
                {((question as any).scale || []).map(
                  (scale: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 max-w-full"
                    >
                      <Input
                        value={scale}
                        onChange={(e) => {
                          const newScale = [...((question as any).scale || [])];
                          newScale[index] = e.target.value;
                          onUpdate({ scale: newScale } as any);
                        }}
                        placeholder={`量表 ${index + 1}`}
                        className="text-xs sm:text-sm flex-1 min-w-0 h-8 sm:h-9"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newScale = (
                            (question as any).scale || []
                          ).filter((_: any, i: number) => i !== index);
                          onUpdate({ scale: newScale } as any);
                        }}
                        className="flex-shrink-0 px-1 sm:px-2 h-8 sm:h-9"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentScale = (question as any).scale || [];
                    onUpdate({
                      scale: [...currentScale, `${currentScale.length + 1}`],
                    } as any);
                  }}
                  className="text-xs px-2 py-1 h-7 sm:h-8 w-fit"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  新增量表
                </Button>
              </div>
            </div>
          </div>
        );

      case "time":
        return (
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            <div>
              <Label
                htmlFor="timeFormat"
                className="text-xs sm:text-sm font-medium"
              >
                時間格式
              </Label>
              <Select
                value={(question as any).timeFormat || "YYYY-MM-DD"}
                onValueChange={(value) =>
                  onUpdate({ timeFormat: value } as any)
                }
              >
                <SelectTrigger className="text-xs sm:text-sm h-8 sm:h-9 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="YYYY">年份 (YYYY)</SelectItem>
                  <SelectItem value="YYYY-MM">年月 (YYYY-MM)</SelectItem>
                  <SelectItem value="YYYY-MM-DD">
                    年月日 (YYYY-MM-DD)
                  </SelectItem>
                  <SelectItem value="MM-DD">月日 (MM-DD)</SelectItem>
                  <SelectItem value="HH:mm">時間 (HH:mm)</SelectItem>
                  <SelectItem value="YYYY-MM-DD HH:mm">完整日期時間</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="min-w-0">
                <Label
                  htmlFor="minDate"
                  className="text-xs sm:text-sm font-medium"
                >
                  最小日期
                </Label>
                <Input
                  id="minDate"
                  type="date"
                  value={(question as any).minDate || ""}
                  onChange={(e) => onUpdate({ minDate: e.target.value } as any)}
                  className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                />
              </div>
              <div className="min-w-0">
                <Label
                  htmlFor="maxDate"
                  className="text-xs sm:text-sm font-medium"
                >
                  最大日期
                </Label>
                <Input
                  id="maxDate"
                  type="date"
                  value={(question as any).maxDate || ""}
                  onChange={(e) => onUpdate({ maxDate: e.target.value } as any)}
                  className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                />
              </div>
            </div>
          </div>
        );

      case "region-long-answer":
        return (
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            <div>
              <Label className="text-xs sm:text-sm font-medium">地區選項</Label>
              <div className="space-y-1 sm:space-y-2 mt-2">
                {((question as any).regions || []).map(
                  (region: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center space-x-2 max-w-full"
                    >
                      <Input
                        value={region}
                        onChange={(e) => {
                          const newRegions = [
                            ...((question as any).regions || []),
                          ];
                          newRegions[index] = e.target.value;
                          onUpdate({ regions: newRegions } as any);
                        }}
                        placeholder={`地區 ${index + 1}`}
                        className="text-xs sm:text-sm flex-1 min-w-0 h-8 sm:h-9"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newRegions = (
                            (question as any).regions || []
                          ).filter((_: any, i: number) => i !== index);
                          onUpdate({ regions: newRegions } as any);
                        }}
                        className="flex-shrink-0 px-1 sm:px-2 h-8 sm:h-9"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  )
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const currentRegions = (question as any).regions || [];
                    onUpdate({
                      regions: [
                        ...currentRegions,
                        `地區 ${currentRegions.length + 1}`,
                      ],
                    } as any);
                  }}
                  className="text-xs px-2 py-1 h-7 sm:h-8 w-fit"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  新增地區
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="min-w-0">
                <Label
                  htmlFor="minBlocks"
                  className="text-xs sm:text-sm font-medium"
                >
                  最少區塊數
                </Label>
                <Input
                  id="minBlocks"
                  type="number"
                  value={(question as any).minBlocks || 1}
                  onChange={(e) =>
                    onUpdate({ minBlocks: parseInt(e.target.value) } as any)
                  }
                  min="1"
                  className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                />
              </div>
              <div className="min-w-0">
                <Label
                  htmlFor="maxBlocks"
                  className="text-xs sm:text-sm font-medium"
                >
                  最多區塊數
                </Label>
                <Input
                  id="maxBlocks"
                  type="number"
                  value={(question as any).maxBlocks || 5}
                  onChange={(e) =>
                    onUpdate({ maxBlocks: parseInt(e.target.value) } as any)
                  }
                  min="1"
                  className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                />
              </div>
            </div>
          </div>
        );

      case "map":
        return (
          <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={(question as any).allowMultipleSelection || false}
                  onCheckedChange={(checked) =>
                    onUpdate({ allowMultipleSelection: checked } as any)
                  }
                />
                <Label className="text-xs sm:text-sm font-medium">
                  允許多選
                </Label>
              </div>
            </div>
            <div>
              <Label className="text-xs sm:text-sm font-medium">地圖選項</Label>
              <p className="text-xs text-gray-500 mt-1">
                地圖問題需要在問題詳細設定中配置 KML 檔案和選項
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card
      className={`border-l-4 w-full overflow-hidden mb-4 transition-all duration-200 ${
        isDragging
          ? "opacity-50 scale-95 shadow-lg border-l-blue-300 bg-blue-50"
          : "border-l-blue-500 hover:shadow-md hover:border-l-blue-600"
      }`}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <CardHeader className="pb-2 sm:pb-3">
        <div className="flex flex-col sm:flex-row sm:items-start md:items-center lg:justify-between space-y-2 sm:space-y-3 md:space-y-0">
          <div className="flex items-start sm:items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
            <div className="flex flex-col items-center space-y-1">
              <div
                className="flex items-center justify-center cursor-grab hover:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
                onMouseDown={(e) => (e.currentTarget.style.cursor = "grabbing")}
                onMouseUp={(e) => (e.currentTarget.style.cursor = "grab")}
                title="拖動以重新排序"
              >
                <GripVertical className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-gray-600 transition-colors" />
              </div>
              <div className="flex flex-col space-y-1">
                {onMoveUp && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onMoveUp}
                    disabled={!canMoveUp}
                    className="h-4 w-4 p-0 hover:bg-gray-100"
                    title="向上移動"
                  >
                    <ChevronUp className="w-3 h-3" />
                  </Button>
                )}
                {onMoveDown && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={onMoveDown}
                    disabled={!canMoveDown}
                    className="h-4 w-4 p-0 hover:bg-gray-100"
                    title="向下移動"
                  >
                    <ChevronDown className="w-3 h-3" />
                  </Button>
                )}
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                <Badge
                  variant="outline"
                  className="flex-shrink-0 text-xs px-1 sm:px-2"
                >
                  {index + 1}
                </Badge>
                <Badge
                  variant="secondary"
                  className="flex-shrink-0 text-xs px-1 sm:px-2"
                >
                  {getQuestionTypeLabel(question.type)}
                </Badge>
              </div>
              <CardTitle className="text-sm sm:text-base md:text-lg truncate leading-tight">
                {question.label || "未命名問題"}
              </CardTitle>
            </div>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0 self-start sm:self-center">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs px-1 sm:px-2 h-7 sm:h-8"
            >
              <Edit className="w-3 h-3" />
              <span className="hidden sm:inline ml-1">編輯</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onDelete}
              className="text-xs px-1 sm:px-2 h-7 sm:h-8"
            >
              <Trash2 className="w-3 h-3" />
              <span className="hidden sm:inline ml-1">刪除</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0 px-2 sm:px-3 lg:px-6 pb-4 max-h-[50vh] overflow-y-auto">
          <Separator className="mb-3 sm:mb-4" />
          <div className="space-y-3 sm:space-y-4 max-w-full overflow-hidden">
            {/* Basic Question Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              <div className="min-w-0">
                <Label
                  htmlFor="question-label"
                  className="text-xs sm:text-sm font-medium"
                >
                  問題標題 *
                </Label>
                <Input
                  id="question-label"
                  value={question.label}
                  onChange={(e) => onUpdate({ label: e.target.value })}
                  placeholder="輸入問題標題"
                  className="text-xs sm:text-sm mt-1"
                />
              </div>
              <div className="min-w-0">
                <Label
                  htmlFor="question-placeholder"
                  className="text-xs sm:text-sm font-medium"
                >
                  提示文字
                </Label>
                <Input
                  id="question-placeholder"
                  value={question.placeholder || ""}
                  onChange={(e) => onUpdate({ placeholder: e.target.value })}
                  placeholder="輸入提示文字"
                  className="text-xs sm:text-sm mt-1"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={question.required || false}
                  onCheckedChange={(checked) => onUpdate({ required: checked })}
                />
                <Label className="text-xs sm:text-sm font-medium">
                  必填問題
                </Label>
              </div>
            </div>

            {/* Question Type Specific Fields */}
            {renderQuestionSpecificFields()}

            {/* Validation Rules */}
            {(question.type === "text" ||
              question.type === "textarea" ||
              question.type === "number") && (
              <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
                <Label className="text-xs sm:text-sm font-medium">
                  驗證規則
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                  {question.type === "number" && (
                    <>
                      <div className="min-w-0">
                        <Label
                          htmlFor="min-value"
                          className="text-xs sm:text-sm"
                        >
                          最小值
                        </Label>
                        <Input
                          id="min-value"
                          type="number"
                          value={question.validation?.min || ""}
                          onChange={(e) =>
                            onUpdate({
                              validation: {
                                ...question.validation,
                                min: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label
                          htmlFor="max-value"
                          className="text-xs sm:text-sm"
                        >
                          最大值
                        </Label>
                        <Input
                          id="max-value"
                          type="number"
                          value={question.validation?.max || ""}
                          onChange={(e) =>
                            onUpdate({
                              validation: {
                                ...question.validation,
                                max: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                        />
                      </div>
                    </>
                  )}
                  {(question.type === "text" ||
                    question.type === "textarea") && (
                    <>
                      <div className="min-w-0">
                        <Label
                          htmlFor="min-length"
                          className="text-xs sm:text-sm"
                        >
                          最小長度
                        </Label>
                        <Input
                          id="min-length"
                          type="number"
                          value={question.validation?.min || ""}
                          onChange={(e) =>
                            onUpdate({
                              validation: {
                                ...question.validation,
                                min: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                        />
                      </div>
                      <div className="min-w-0">
                        <Label
                          htmlFor="max-length"
                          className="text-xs sm:text-sm"
                        >
                          最大長度
                        </Label>
                        <Input
                          id="max-length"
                          type="number"
                          value={question.validation?.max || ""}
                          onChange={(e) =>
                            onUpdate({
                              validation: {
                                ...question.validation,
                                max: e.target.value
                                  ? parseInt(e.target.value)
                                  : undefined,
                              },
                            })
                          }
                          className="text-xs sm:text-sm h-8 sm:h-9 mt-1"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
