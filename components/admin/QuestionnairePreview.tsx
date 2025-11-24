"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Questionnaire, Question } from "@/types/questionnaire";

interface QuestionnairePreviewProps {
  questionnaire: Questionnaire;
}

export function QuestionnairePreview({
  questionnaire,
}: QuestionnairePreviewProps) {
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const currentSection = questionnaire.sections[currentSectionIndex];

  const handleResponseChange = (questionId: string, value: any) => {
    setResponses((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const renderQuestion = (question: Question) => {
    const questionId = question.id;
    const currentValue = responses[questionId];

    switch (question.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={
              question.type === "number"
                ? "number"
                : question.type === "email"
                ? "email"
                : "text"
            }
            placeholder={question.placeholder}
            value={currentValue || ""}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            min={question.validation?.min}
            max={question.validation?.max}
          />
        );

      case "textarea":
        return (
          <Textarea
            placeholder={question.placeholder}
            value={currentValue || ""}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            rows={4}
          />
        );

      case "select":
        return (
          <Select
            value={currentValue || ""}
            onValueChange={(value) => handleResponseChange(questionId, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={question.placeholder || "請選擇..."} />
            </SelectTrigger>
            <SelectContent>
              {(question as any).options?.map(
                (option: string, index: number) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <RadioGroup
            value={currentValue || ""}
            onValueChange={(value) => handleResponseChange(questionId, value)}
          >
            {(question as any).options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${questionId}-${index}`} />
                <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        return (
          <div className="space-y-2">
            {(question as any).options?.map((option: string, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox
                  id={`${questionId}-${index}`}
                  checked={(currentValue || []).includes(option)}
                  onCheckedChange={(checked) => {
                    const currentArray = currentValue || [];
                    if (checked) {
                      handleResponseChange(questionId, [
                        ...currentArray,
                        option,
                      ]);
                    } else {
                      handleResponseChange(
                        questionId,
                        currentArray.filter((v: string) => v !== option)
                      );
                    }
                  }}
                />
                <Label htmlFor={`${questionId}-${index}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "matrix":
        return (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b"></th>
                    {(question as any).scale?.map(
                      (scale: string, index: number) => (
                        <th
                          key={index}
                          className="text-center p-2 border-b text-sm"
                        >
                          {scale}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {(question as any).options?.map(
                    (option: string, rowIndex: number) => (
                      <tr key={rowIndex}>
                        <td className="p-2 border-b text-sm font-medium">
                          {option}
                        </td>
                        {(question as any).scale?.map(
                          (scale: string, colIndex: number) => (
                            <td
                              key={colIndex}
                              className="text-center p-2 border-b"
                            >
                              <input
                                type="radio"
                                name={`${questionId}-${rowIndex}`}
                                value={scale}
                                checked={
                                  (currentValue?.[option] || "") === scale
                                }
                                onChange={(e) => {
                                  const newValue = { ...currentValue };
                                  newValue[option] = e.target.value;
                                  handleResponseChange(questionId, newValue);
                                }}
                                aria-label={`${option} - ${scale}`}
                              />
                            </td>
                          )
                        )}
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "time":
        const timeFormat = (question as any).timeFormat || "YYYY-MM-DD";
        let inputType = "date";
        if (timeFormat.includes("HH:mm")) {
          inputType = "datetime-local";
        } else if (timeFormat === "HH:mm") {
          inputType = "time";
        } else if (timeFormat === "YYYY-MM") {
          inputType = "month";
        }

        return (
          <Input
            type={inputType}
            value={currentValue || ""}
            onChange={(e) => handleResponseChange(questionId, e.target.value)}
            min={(question as any).minDate}
            max={(question as any).maxDate}
          />
        );

      case "map":
        return (
          <div className="border rounded-lg p-4 bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">
              地圖選擇功能（預覽模式）
            </p>
            <div className="space-y-2">
              {(question as any).options?.map((option: any, index: number) => (
                <div key={index} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${questionId}-map-${index}`}
                    checked={(currentValue || []).includes(option.value)}
                    onCheckedChange={(checked) => {
                      const currentArray = currentValue || [];
                      if (checked) {
                        handleResponseChange(questionId, [
                          ...currentArray,
                          option.value,
                        ]);
                      } else {
                        handleResponseChange(
                          questionId,
                          currentArray.filter((v: string) => v !== option.value)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={`${questionId}-map-${index}`}>
                    {option.label || option.value}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        );

      case "radio-number":
        return (
          <div className="space-y-3">
            {(question as any).options?.map((option: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={questionId}
                    value={option.value}
                    checked={(currentValue?.selected || "") === option.value}
                    onChange={(e) => {
                      handleResponseChange(questionId, {
                        ...currentValue,
                        selected: e.target.value,
                      });
                    }}
                    aria-label={option.label}
                  />
                  <Label>{option.label}</Label>
                </div>
                {option.hasNumberInput &&
                  (currentValue?.selected || "") === option.value && (
                    <div className="ml-6">
                      <Label className="text-sm">{option.numberLabel}</Label>
                      <Input
                        type="number"
                        value={currentValue?.number || ""}
                        onChange={(e) => {
                          handleResponseChange(questionId, {
                            ...currentValue,
                            number: e.target.value,
                          });
                        }}
                        min={option.numberMin}
                        max={option.numberMax}
                        className="mt-1"
                      />
                    </div>
                  )}
              </div>
            ))}
          </div>
        );

      case "radio-text":
        return (
          <div className="space-y-3">
            {(question as any).options?.map((option: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name={questionId}
                    value={option.value}
                    checked={(currentValue?.selected || "") === option.value}
                    onChange={(e) => {
                      handleResponseChange(questionId, {
                        ...currentValue,
                        selected: e.target.value,
                      });
                    }}
                    aria-label={option.label}
                  />
                  <Label>{option.label}</Label>
                </div>
                {option.hasTextInput &&
                  (currentValue?.selected || "") === option.value && (
                    <div className="ml-6">
                      <Label className="text-sm">{option.textLabel}</Label>
                      <Input
                        type="text"
                        value={currentValue?.text || ""}
                        onChange={(e) => {
                          handleResponseChange(questionId, {
                            ...currentValue,
                            text: e.target.value,
                          });
                        }}
                        placeholder={option.textPlaceholder}
                        minLength={option.textMinLength}
                        maxLength={option.textMaxLength}
                        className="mt-1"
                      />
                    </div>
                  )}
              </div>
            ))}
          </div>
        );

      case "region-long-answer":
        const blocks = currentValue?.blocks || [
          { region: "", location: "", reason: "" },
        ];
        return (
          <div className="space-y-4">
            {blocks.map((block: any, blockIndex: number) => (
              <Card key={blockIndex} className="p-4">
                <div className="space-y-3">
                  <div>
                    <Label>地區選擇</Label>
                    <Select
                      value={block.region || ""}
                      onValueChange={(value) => {
                        const newBlocks = [...blocks];
                        newBlocks[blockIndex] = { ...block, region: value };
                        handleResponseChange(questionId, { blocks: newBlocks });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="請選擇地區" />
                      </SelectTrigger>
                      <SelectContent>
                        {(question as any).regions?.map(
                          (region: string, index: number) => (
                            <SelectItem key={index} value={region}>
                              {region}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>具體地點</Label>
                    <Input
                      value={block.location || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[blockIndex] = {
                          ...block,
                          location: e.target.value,
                        };
                        handleResponseChange(questionId, { blocks: newBlocks });
                      }}
                      placeholder={
                        (question as any).locationPlaceholder ||
                        "請輸入具體地點"
                      }
                    />
                  </div>
                  <div>
                    <Label>說明理由</Label>
                    <Textarea
                      value={block.reason || ""}
                      onChange={(e) => {
                        const newBlocks = [...blocks];
                        newBlocks[blockIndex] = {
                          ...block,
                          reason: e.target.value,
                        };
                        handleResponseChange(questionId, { blocks: newBlocks });
                      }}
                      placeholder={
                        (question as any).reasonPlaceholder ||
                        "請說明選擇此地點的理由"
                      }
                      rows={3}
                    />
                  </div>
                </div>
              </Card>
            ))}
            <div className="flex space-x-2">
              {blocks.length < ((question as any).maxBlocks || 5) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newBlocks = [
                      ...blocks,
                      { region: "", location: "", reason: "" },
                    ];
                    handleResponseChange(questionId, { blocks: newBlocks });
                  }}
                >
                  新增區塊
                </Button>
              )}
              {blocks.length > ((question as any).minBlocks || 1) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newBlocks = blocks.slice(0, -1);
                    handleResponseChange(questionId, { blocks: newBlocks });
                  }}
                >
                  移除區塊
                </Button>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-gray-50 rounded border">
            <p className="text-sm text-gray-600">問題類型暫不支援預覽</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Questionnaire Header */}
      <div className="mb-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            {questionnaire.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {questionnaire.description}
          </p>
          <div className="flex justify-center space-x-4">
            <Badge variant="outline">版本 {questionnaire.version}</Badge>
            <Badge variant="outline">{questionnaire.organize}</Badge>
          </div>
        </div>
      </div>

      {/* Section Navigation */}
      {questionnaire.sections.length > 1 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{currentSection?.title}</h2>
            <Badge variant="secondary">
              {currentSectionIndex + 1} / {questionnaire.sections.length}
            </Badge>
          </div>
          {currentSection?.description && (
            <p className="text-gray-600 mb-4">{currentSection.description}</p>
          )}
          <Separator />
        </div>
      )}

      {/* Questions */}
      <div className="space-y-6 mb-8">
        {currentSection?.questions.map((question, index) => (
          <Card key={question.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    <span className="text-sm text-gray-500 mr-2">
                      {index + 1}.
                    </span>
                    {question.label}
                    {question.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </CardTitle>
                  {question.placeholder && (
                    <CardDescription className="mt-1">
                      {question.placeholder}
                    </CardDescription>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  {question.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>{renderQuestion(question)}</CardContent>
          </Card>
        ))}
      </div>

      {/* Navigation */}
      {questionnaire.sections.length > 1 && (
        <div className="flex justify-between items-center pt-6 border-t">
          <Button
            variant="outline"
            onClick={() =>
              setCurrentSectionIndex(Math.max(0, currentSectionIndex - 1))
            }
            disabled={currentSectionIndex === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            上一頁
          </Button>

          <div className="text-sm text-gray-500">
            第 {currentSectionIndex + 1} 頁，共 {questionnaire.sections.length}{" "}
            頁
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setCurrentSectionIndex(
                Math.min(
                  questionnaire.sections.length - 1,
                  currentSectionIndex + 1
                )
              )
            }
            disabled={currentSectionIndex === questionnaire.sections.length - 1}
          >
            下一頁
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}

      <div className="text-center pt-8">
        <Button size="lg">提交評鑑調查（預覽模式）</Button>
      </div>
    </div>
  );
}
