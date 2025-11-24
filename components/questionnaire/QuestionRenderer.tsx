"use client";

import type { Question } from "@/types/questionnaire";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ChevronDown, Check } from "lucide-react";
import { MapComponent } from "./MapComponent";
import { EnhancedMapComponent } from "./EnhancedMapComponent";
import { useState } from "react";

// SearchableRegionSelect component for custom region input
function SearchableRegionSelect({
  regions,
  value,
  onValueChange,
  placeholder = "選擇或輸入縣市",
}: {
  regions: string[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [inputValue, setInputValue] = useState(value || "");

  // Filter regions based on search term
  const filteredRegions = regions.filter((region) =>
    region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue);
    setSearchTerm(newValue);
    onValueChange(newValue);
  };

  const handleSelectRegion = (region: string) => {
    setInputValue(region);
    setSearchTerm("");
    onValueChange(region);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          className="h-9 pr-8"
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-9 w-8 p-0"
          onClick={() => setIsOpen(!isOpen)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredRegions.length > 0 ? (
            filteredRegions.map((region) => (
              <button
                key={region}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                onClick={() => handleSelectRegion(region)}
              >
                <span>{region}</span>
                {inputValue === region && <Check className="h-4 w-4" />}
              </button>
            ))
          ) : searchTerm.length > 0 ? (
            <div className="px-3 py-2 text-sm text-gray-500">
              使用自定義輸入: "{searchTerm}"
            </div>
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              開始輸入以搜尋或新增項目
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}

interface QuestionRendererProps {
  question: Question;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  allResponses?: Record<string, any>; // Add this to access all responses for conditional logic
  questionnaireId?: string; // Add questionnaire ID for enhanced map functionality
}

// Data transformation function to clean responses before sending to Firebase
export function transformResponseForFirebase(
  questionId: string,
  value: any,
  questionType: string
): any {
  // Handle region-long-answer: convert array of objects to array of formatted objects
  if (questionType === "region-long-answer" && Array.isArray(value)) {
    return value.map((block: any) => ({
      Region: block.region || "",
      Location: block.location || "",
      Reason: block.reason || "",
    }));
  }

  // Handle select-text: if not "其他", return just the selected value
  if (questionType === "select-text" && value && typeof value === "object") {
    if (value.selected && value.selected !== "其他") {
      return value.selected;
    }
    // If "其他" is selected, return the object with text
    if (value.selected === "其他" && value.text) {
      return {
        selected: value.selected,
        text: value.text,
      };
    }
    // If "其他" is selected but no text, return just the selection
    if (value.selected === "其他") {
      return value.selected;
    }
  }

  // Handle checkbox-text: if not "其他", return just the selected array
  if (questionType === "checkbox-text" && value && typeof value === "object") {
    if (Array.isArray(value.selected) && !value.selected.includes("其他")) {
      return value.selected;
    }
    // If "其他" is included, return the object with text
    if (
      Array.isArray(value.selected) &&
      value.selected.includes("其他") &&
      value.text
    ) {
      return {
        selected: value.selected,
        text: value.text,
      };
    }
    // If "其他" is included but no text, return just the selection
    if (Array.isArray(value.selected) && value.selected.includes("其他")) {
      return value.selected;
    }
  }

  // For all other types, return the value as-is
  return value;
}

export function QuestionRenderer({
  question,
  value,
  onChange,
  error,
  allResponses = {},
  questionnaireId,
}: QuestionRendererProps) {
  // Check if this question should be shown based on conditional logic
  const shouldShowQuestion = () => {
    if (!question.conditional) return true;

    const { dependsOn, showWhen } = question.conditional;
    const dependentValue = allResponses[dependsOn];

    // Handle undefined/null values
    if (dependentValue === undefined || dependentValue === null) {
      return false;
    }

    if (Array.isArray(showWhen)) {
      return showWhen.includes(dependentValue);
    }

    return dependentValue === showWhen;
  };

  // Don't render if conditional logic says to hide
  if (!shouldShowQuestion()) {
    return null;
  }

  const renderInput = () => {
    switch (question.type) {
      case "text":
      case "email":
      case "number":
        return (
          <Input
            type={question.type}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className={error ? "border-red-500" : ""}
          />
        );

      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className={error ? "border-red-500" : ""}
          />
        );

      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder="請選擇選項" />
            </SelectTrigger>
            <SelectContent>
              {question.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "select-text":
        const selectTextQuestion = question as any;
        const selectTextValue = value || { selected: "", text: "" };
        const showTextInput = selectTextValue.selected === "其他";

        return (
          <div className="space-y-3">
            <Select
              value={selectTextValue.selected || ""}
              onValueChange={(selectedValue) => {
                const newValue = {
                  selected: selectedValue,
                  text: selectedValue === "其他" ? selectTextValue.text : "",
                };
                onChange(newValue);
              }}
            >
              <SelectTrigger className={error ? "border-red-500" : ""}>
                <SelectValue placeholder="請選擇選項" />
              </SelectTrigger>
              <SelectContent>
                {selectTextQuestion.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Show text input only when "其他" is selected */}
            {showTextInput && (
              <div className="mt-3">
                <Input
                  type="text"
                  placeholder={
                    selectTextQuestion.textPlaceholder ||
                    selectTextQuestion.textLabel ||
                    "請輸入其他選項"
                  }
                  minLength={selectTextQuestion.textMinLength}
                  maxLength={selectTextQuestion.textMaxLength}
                  value={selectTextValue.text || ""}
                  onChange={(e) => {
                    const newValue = {
                      ...selectTextValue,
                      text: e.target.value,
                    };
                    onChange(newValue);
                  }}
                  className={error ? "border-red-500" : ""}
                  required={
                    showTextInput &&
                    (selectTextQuestion.textMinLength > 0 || question.required)
                  }
                />
                {selectTextQuestion.textLabel && (
                  <Label className="text-xs text-gray-600 mt-1">
                    {selectTextQuestion.textLabel}
                  </Label>
                )}
              </div>
            )}
          </div>
        );

      case "radio":
        return (
          <RadioGroup value={value || ""} onValueChange={onChange}>
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <RadioGroupItem
                  value={option}
                  id={`${question.id}-${option}`}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "checkbox":
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${option}`}
                  checked={selectedValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      // Special handling for "未使用其他交通工具" - when selected, cull all other options
                      if (option === "未使用其他交通工具") {
                        onChange([option]);
                      } else {
                        // If selecting other options, remove "未使用其他交通工具" if present
                        const filteredValues = selectedValues.filter(
                          (v: string) => v !== "未使用其他交通工具"
                        );
                        onChange([...filteredValues, option]);
                      }
                    } else {
                      onChange(
                        selectedValues.filter((v: string) => v !== option)
                      );
                    }
                  }}
                />
                <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
              </div>
            ))}
          </div>
        );

      case "checkbox-text":
        const checkboxTextQuestion = question as any;
        const checkboxTextValue = value || { selected: [], text: "" };
        const selectedCheckboxValues = Array.isArray(checkboxTextValue.selected)
          ? checkboxTextValue.selected
          : [];
        const showCheckboxTextInput = selectedCheckboxValues.includes("其他");

        return (
          <div className="space-y-3">
            <div className="space-y-2">
              {checkboxTextQuestion.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${question.id}-${option}`}
                    checked={selectedCheckboxValues.includes(option)}
                    onCheckedChange={(checked) => {
                      let newSelected;
                      if (checked) {
                        // Special handling for "未使用其他交通工具" - when selected, cull all other options
                        if (option === "未使用其他交通工具") {
                          newSelected = [option];
                        } else {
                          // If selecting other options, remove "未使用其他交通工具" if present
                          const filteredValues = selectedCheckboxValues.filter(
                            (v: string) => v !== "未使用其他交通工具"
                          );
                          newSelected = [...filteredValues, option];
                        }
                      } else {
                        newSelected = selectedCheckboxValues.filter(
                          (v: string) => v !== option
                        );
                      }

                      const newValue = {
                        selected: newSelected,
                        text: newSelected.includes("其他")
                          ? checkboxTextValue.text
                          : "",
                      };
                      onChange(newValue);
                    }}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </div>

            {/* Show text input only when "其他" is selected */}
            {showCheckboxTextInput && (
              <div className="mt-3">
                <Input
                  type="text"
                  placeholder={
                    checkboxTextQuestion.textPlaceholder ||
                    checkboxTextQuestion.textLabel ||
                    "請輸入其他選項"
                  }
                  minLength={checkboxTextQuestion.textMinLength}
                  maxLength={checkboxTextQuestion.textMaxLength}
                  value={checkboxTextValue.text || ""}
                  onChange={(e) => {
                    const newValue = {
                      ...checkboxTextValue,
                      text: e.target.value,
                    };
                    onChange(newValue);
                  }}
                  className={error ? "border-red-500" : ""}
                  required={
                    showCheckboxTextInput &&
                    (checkboxTextQuestion.textMinLength > 0 ||
                      question.required)
                  }
                />
                {checkboxTextQuestion.textLabel && (
                  <Label className="text-xs text-gray-600 mt-1">
                    {checkboxTextQuestion.textLabel}
                  </Label>
                )}
              </div>
            )}
          </div>
        );

      case "matrix":
        const matrixQuestion = question as any;
        const matrixValue = value || {};
        return (
          <div className="space-y-3">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-2 border-b"></th>
                    {matrixQuestion.scale?.map((scaleItem: string) => (
                      <th
                        key={scaleItem}
                        className="text-center p-2 border-b text-xs whitespace-nowrap"
                      >
                        {scaleItem}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {matrixQuestion.options?.map((option: string) => (
                    <tr
                      key={option}
                      className={
                        !matrixValue[option] && error ? "bg-red-50" : ""
                      }
                    >
                      <td className="p-2 border-b text-sm font-medium">
                        {option}
                        {question.required && !matrixValue[option] && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </td>
                      {matrixQuestion.scale?.map((scaleItem: string) => (
                        <td
                          key={`${option}-${scaleItem}`}
                          className="text-center p-2 border-b"
                        >
                          <input
                            type="radio"
                            name={`${question.id}-${option}`}
                            value={scaleItem}
                            checked={matrixValue[option] === scaleItem}
                            onChange={() => {
                              const newValue = {
                                ...matrixValue,
                                [option]: scaleItem,
                              };
                              onChange(newValue);
                            }}
                            className="w-4 h-4"
                            aria-label={`${option} - ${scaleItem}`}
                            title={`${option} - ${scaleItem}`}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {error && (
              <div className="text-sm text-red-500 mt-2">
                <p>{error}</p>
                <p className="text-xs mt-1">請為每個項目選擇一個評分</p>
              </div>
            )}
          </div>
        );

      case "map":
        return questionnaireId ? (
          <EnhancedMapComponent
            question={question}
            value={value}
            onChange={onChange}
            error={error}
            questionnaireId={questionnaireId}
          />
        ) : (
          <MapComponent
            question={question}
            value={value}
            onChange={onChange}
            error={error}
            questionnaireId={questionnaireId}
          />
        );

      case "radio-number":
        const radioNumberQuestion = question as any;
        const radioNumberValue = value || {
          selected: "",
          numbers: {},
          texts: {},
        };
        return (
          <div className="space-y-3">
            {radioNumberQuestion.options?.map((option: any) => (
              <div key={option.value} className="flex items-center space-x-3">
                <input
                  type="radio"
                  id={`${question.id}-${option.value}`}
                  name={question.id}
                  value={option.value}
                  checked={radioNumberValue.selected === option.value}
                  onChange={(e) => {
                    const newValue = {
                      ...radioNumberValue,
                      selected: e.target.value,
                    };
                    onChange(newValue);
                  }}
                  className="w-4 h-4"
                  aria-label={option.label}
                  title={option.label}
                />
                <Label
                  htmlFor={`${question.id}-${option.value}`}
                  className="flex items-center space-x-2"
                >
                  <span>{option.label}</span>
                  {option.hasNumberInput && (
                    <Input
                      type="number"
                      placeholder={
                        option.numberPlaceholder || option.numberLabel || "人數"
                      }
                      min={option.numberMin || 1}
                      max={option.numberMax || 999}
                      value={radioNumberValue.numbers[option.value] || ""}
                      onChange={(e) => {
                        const newValue = {
                          ...radioNumberValue,
                          numbers: {
                            ...radioNumberValue.numbers,
                            [option.value]: e.target.value,
                          },
                        };
                        onChange(newValue);
                      }}
                      className="w-20 h-8 ml-2"
                      disabled={radioNumberValue.selected !== option.value}
                    />
                  )}
                  {option.hasTextInput && (
                    <Input
                      type="text"
                      placeholder={
                        option.textPlaceholder || option.textLabel || "請輸入"
                      }
                      minLength={option.textMinLength}
                      maxLength={option.textMaxLength}
                      value={radioNumberValue.texts[option.value] || ""}
                      onChange={(e) => {
                        const newValue = {
                          ...radioNumberValue,
                          texts: {
                            ...radioNumberValue.texts,
                            [option.value]: e.target.value,
                          },
                        };
                        onChange(newValue);
                      }}
                      className="w-32 h-8 ml-2"
                      disabled={radioNumberValue.selected !== option.value}
                    />
                  )}
                </Label>
              </div>
            ))}
          </div>
        );

      case "radio-text":
        const radioTextQuestion = question as any;
        const radioTextValue = value || { selected: "", texts: {} };

        // Check if any option has "其他" - this enables exclusive selection mode
        const hasOtherOption = radioTextQuestion.options?.some(
          (opt: any) => opt.label.includes("其他") || opt.value === "other"
        );

        return (
          <div className="space-y-3">
            {radioTextQuestion.options?.map((option: any) => {
              const isSelected = radioTextValue.selected === option.value;
              const isOtherOption =
                option.label.includes("其他") || option.value === "other";

              // If "其他" is selected and this is not the "其他" option, hide it
              const shouldHide =
                hasOtherOption &&
                radioTextValue.selected &&
                radioTextValue.selected !== option.value &&
                radioTextQuestion.options?.find(
                  (opt: any) =>
                    (opt.label.includes("其他") || opt.value === "other") &&
                    radioTextValue.selected === opt.value
                );

              if (shouldHide) return null;

              return (
                <div key={option.value} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id={`${question.id}-${option.value}`}
                      name={question.id}
                      value={option.value}
                      checked={isSelected}
                      onChange={(e) => {
                        const newValue = {
                          selected: e.target.value,
                          texts: { ...radioTextValue.texts },
                        };

                        // If selecting "其他" option, clear texts for other options
                        if (isOtherOption && hasOtherOption) {
                          newValue.texts = {
                            [option.value]:
                              radioTextValue.texts[option.value] || "",
                          };
                        }

                        onChange(newValue);
                      }}
                      className="w-4 h-4 mt-1"
                      aria-label={option.label}
                      title={option.label}
                    />
                    <Label
                      htmlFor={`${question.id}-${option.value}`}
                      className="flex-1"
                    >
                      {option.label}
                    </Label>
                  </div>

                  {/* Show text input only when this option is selected AND has text input */}
                  {isSelected && option.hasTextInput && (
                    <div className="ml-7 mt-2">
                      <Input
                        type="text"
                        placeholder={
                          option.textPlaceholder ||
                          option.textLabel ||
                          "請輸入文字"
                        }
                        minLength={option.textMinLength}
                        maxLength={option.textMaxLength}
                        value={radioTextValue.texts[option.value] || ""}
                        onChange={(e) => {
                          const newValue = {
                            ...radioTextValue,
                            texts: {
                              ...radioTextValue.texts,
                              [option.value]: e.target.value,
                            },
                          };
                          onChange(newValue);
                        }}
                        className="w-full"
                      />
                      {option.textMinLength && (
                        <p className="text-xs text-gray-500 mt-1">
                          最少需要 {option.textMinLength} 個字符
                          {option.textMaxLength &&
                            ` (最多 ${option.textMaxLength} 個字符)`}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show reset button when "其他" is selected */}
            {hasOtherOption &&
              radioTextValue.selected &&
              radioTextQuestion.options?.find(
                (opt: any) =>
                  (opt.label.includes("其他") || opt.value === "other") &&
                  radioTextValue.selected === opt.value
              ) && (
                <div className="mt-3 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => onChange({ selected: "", texts: {} })}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    重新選擇所有選項
                  </button>
                </div>
              )}
          </div>
        );

      case "region-long-answer":
        const regionQuestion = question as any;
        const regionValue = value || [];
        const minBlocks = regionQuestion.minBlocks || 1;
        const maxBlocks = regionQuestion.maxBlocks || 5;

        const addBlock = () => {
          if (regionValue.length < maxBlocks) {
            const newValue = [
              ...regionValue,
              {
                region: "",
                location: "",
                reason: "",
              },
            ];
            onChange(newValue);
          }
        };

        const removeBlock = (index: number) => {
          if (regionValue.length > minBlocks) {
            const newValue = regionValue.filter(
              (_: any, i: number) => i !== index
            );
            onChange(newValue);
          }
        };

        const updateBlock = (
          index: number,
          field: string,
          fieldValue: string
        ) => {
          const newValue = [...regionValue];
          if (!newValue[index]) {
            newValue[index] = { region: "", location: "", reason: "" };
          }
          newValue[index][field] = fieldValue;
          onChange(newValue);
        };

        // Initialize with minimum blocks if empty
        if (regionValue.length === 0) {
          const initialBlocks = Array(minBlocks)
            .fill(null)
            .map(() => ({ region: "", location: "", reason: "" }));
          onChange(initialBlocks);
          return null;
        }

        return (
          <div className="space-y-4">
            {regionValue.map((block: any, index: number) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-gray-700">
                    項目 {index + 1}
                  </h4>
                  {regionValue.length > minBlocks && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeBlock(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Region Dropdown */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">
                      {regionQuestion.regionLabel || "縣/市"}
                    </Label>
                    {regionQuestion.isPlainTextInput ? (
                      <Input
                        type="text"
                        placeholder={
                          regionQuestion.regionPlaceholder || "選擇或輸入縣市"
                        }
                        value={block.region || ""}
                        onChange={(e) =>
                          updateBlock(index, "region", e.target.value)
                        }
                        className="h-9"
                      />
                    ) : (
                      <SearchableRegionSelect
                        regions={regionQuestion.regions || []}
                        value={block.region || ""}
                        onValueChange={(val) =>
                          updateBlock(index, "region", val)
                        }
                        placeholder={
                          regionQuestion.regionPlaceholder || "選擇或輸入縣市"
                        }
                      />
                    )}
                  </div>

                  {/* Location Input */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">
                      {regionQuestion.locationLabel || "路段(或地點)"}
                    </Label>
                    <Input
                      type="text"
                      placeholder={
                        regionQuestion.locationPlaceholder || "請輸入路段或地點"
                      }
                      value={block.location || ""}
                      onChange={(e) =>
                        updateBlock(index, "location", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>

                  {/* Reason Input */}
                  <div className="space-y-1">
                    <Label className="text-xs text-gray-600">原因</Label>
                    <Input
                      type="text"
                      placeholder={
                        regionQuestion.reasonPlaceholder || "請輸入原因"
                      }
                      value={block.reason || ""}
                      onChange={(e) =>
                        updateBlock(index, "reason", e.target.value)
                      }
                      className="h-9"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add/Remove Controls */}
            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-gray-500">
                {regionValue.length} / {maxBlocks} 項目 (最少 {minBlocks}{" "}
                項，最多 {maxBlocks} 項)
              </div>
              {regionValue.length < maxBlocks && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addBlock}
                  className="text-blue-600 bg-transparent"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  新增項目
                </Button>
              )}
            </div>

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        );

      case "time":
        const timeQuestion = question as any;
        const timeFormat = timeQuestion.timeFormat || "YYYY-MM";

        const getInputType = () => {
          switch (timeFormat) {
            case "YYYY-MM":
              return "month";
            case "YYYY-MM-DD":
              return "date";
            case "YYYY":
              return "number";
            case "HH:mm":
              return "time";
            case "YYYY-MM-DD HH:mm":
              return "datetime-local";
            default:
              return "text";
          }
        };

        const getPlaceholder = () => {
          switch (timeFormat) {
            case "YYYY-MM":
              return question.placeholder || "2024-01";
            case "YYYY-MM-DD":
              return question.placeholder || "2024-01-15";
            case "YYYY":
              return question.placeholder || "2024";
            case "MM-DD":
              return question.placeholder || "01-15";
            case "HH:mm":
              return question.placeholder || "14:30";
            case "YYYY-MM-DD HH:mm":
              return question.placeholder || "2024-01-15T14:30";
            default:
              return question.placeholder || timeFormat;
          }
        };

        // Convert value for datetime-local input (needs T format)
        const getInputValue = () => {
          if (!value) return "";

          if (timeFormat === "YYYY-MM-DD HH:mm") {
            // Convert "YYYY-MM-DD HH:mm" to "YYYY-MM-DDTHH:mm" for datetime-local input
            return value.replace(" ", "T");
          }

          return value;
        };

        // Handle value change for datetime-local input
        const handleTimeChange = (inputValue: string) => {
          if (timeFormat === "YYYY-MM-DD HH:mm") {
            // Convert "YYYY-MM-DDTHH:mm" back to "YYYY-MM-DD HH:mm"
            const formattedValue = inputValue.replace("T", " ");
            onChange(formattedValue);
          } else {
            onChange(inputValue);
          }
        };

        if (timeFormat === "YYYY" || timeFormat === "MM-DD") {
          return (
            <Input
              type="text"
              value={value || ""}
              onChange={(e) => onChange(e.target.value)}
              placeholder={getPlaceholder()}
              className={error ? "border-red-500" : ""}
              pattern={timeFormat === "YYYY" ? "[0-9]{4}" : "[0-9]{2}-[0-9]{2}"}
            />
          );
        }

        return (
          <Input
            type={getInputType()}
            value={getInputValue()}
            onChange={(e) => handleTimeChange(e.target.value)}
            placeholder={getPlaceholder()}
            min={timeQuestion.minDate}
            max={timeQuestion.maxDate}
            className={error ? "border-red-500" : ""}
          />
        );

      case "train-schedule-request":
        const trainScheduleQuestion = question as any;
        const trainScheduleValue = value || { selected: "", schedules: [] };
        const showScheduleInput =
          trainScheduleValue.selected ===
          (trainScheduleQuestion.showScheduleWhen || "需要增加班次");
        const scheduleMinBlocks = trainScheduleQuestion.minBlocks || 1;
        const scheduleMaxBlocks = trainScheduleQuestion.maxBlocks || 5;

        const addScheduleBlock = () => {
          if (trainScheduleValue.schedules.length < scheduleMaxBlocks) {
            const newValue = {
              ...trainScheduleValue,
              schedules: [
                ...trainScheduleValue.schedules,
                {
                  startStation: "",
                  endStation: "",
                  schedule: "",
                },
              ],
            };
            onChange(newValue);
          }
        };

        const removeScheduleBlock = (index: number) => {
          if (trainScheduleValue.schedules.length > scheduleMinBlocks) {
            const newValue = {
              ...trainScheduleValue,
              schedules: trainScheduleValue.schedules.filter(
                (_: any, i: number) => i !== index
              ),
            };
            onChange(newValue);
          }
        };

        const updateScheduleBlock = (
          index: number,
          field: string,
          fieldValue: string
        ) => {
          const newSchedules = [...trainScheduleValue.schedules];
          if (!newSchedules[index]) {
            newSchedules[index] = {
              startStation: "",
              endStation: "",
              schedule: "",
            };
          }
          newSchedules[index][field] = fieldValue;

          const newValue = {
            ...trainScheduleValue,
            schedules: newSchedules,
          };
          onChange(newValue);
        };

        return (
          <div className="space-y-3">
            {/* Radio options */}
            <RadioGroup
              value={trainScheduleValue.selected || ""}
              onValueChange={(selectedValue) => {
                const newValue = {
                  selected: selectedValue,
                  schedules:
                    selectedValue ===
                    (trainScheduleQuestion.showScheduleWhen || "需要增加班次")
                      ? trainScheduleValue.schedules.length > 0
                        ? trainScheduleValue.schedules
                        : Array(scheduleMinBlocks)
                            .fill(null)
                            .map(() => ({
                              startStation: "",
                              endStation: "",
                              schedule: "",
                            }))
                      : [],
                };
                onChange(newValue);
              }}
            >
              {trainScheduleQuestion.options?.map((option: string) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${question.id}-${option}`}
                  />
                  <Label htmlFor={`${question.id}-${option}`}>{option}</Label>
                </div>
              ))}
            </RadioGroup>

            {/* Schedule input blocks */}
            {showScheduleInput && (
              <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700">
                  請填寫需要增加班次的路線：
                </h4>

                {trainScheduleValue.schedules.map(
                  (block: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-700">
                          路線 {index + 1}
                        </h5>
                        {trainScheduleValue.schedules.length >
                          scheduleMinBlocks && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeScheduleBlock(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Minus className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Start Station */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            {trainScheduleQuestion.startStationLabel ||
                              "站別（起點）"}
                          </Label>
                          <Input
                            type="text"
                            placeholder={
                              trainScheduleQuestion.startStationPlaceholder ||
                              "請輸入起點站名"
                            }
                            value={block.startStation || ""}
                            onChange={(e) =>
                              updateScheduleBlock(
                                index,
                                "startStation",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>

                        {/* End Station */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            {trainScheduleQuestion.endStationLabel ||
                              "站別（迄點）"}
                          </Label>
                          <Input
                            type="text"
                            placeholder={
                              trainScheduleQuestion.endStationPlaceholder ||
                              "請輸入終點站名"
                            }
                            value={block.endStation || ""}
                            onChange={(e) =>
                              updateScheduleBlock(
                                index,
                                "endStation",
                                e.target.value
                              )
                            }
                            className="h-9"
                          />
                        </div>

                        {/* Schedule Type */}
                        <div className="space-y-1">
                          <Label className="text-xs text-gray-600">
                            {trainScheduleQuestion.scheduleLabel || "日別"}
                          </Label>
                          <Select
                            value={block.schedule || ""}
                            onValueChange={(val) =>
                              updateScheduleBlock(index, "schedule", val)
                            }
                          >
                            <SelectTrigger className="h-9">
                              <SelectValue placeholder="選擇日別" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="週一至四">週一至四</SelectItem>
                              <SelectItem value="週五">週五</SelectItem>
                              <SelectItem value="假日班次">假日班次</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )
                )}

                {/* Add/Remove Controls */}
                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-gray-500">
                    {trainScheduleValue.schedules.length} / {scheduleMaxBlocks}{" "}
                    項目 (最少 {scheduleMinBlocks} 項，最多 {scheduleMaxBlocks}{" "}
                    項)
                  </div>
                  {trainScheduleValue.schedules.length < scheduleMaxBlocks && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addScheduleBlock}
                      className="text-blue-600 bg-transparent"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      新增項目
                    </Button>
                  )}
                </div>
              </div>
            )}

            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        );

      default:
        return <div>不支援的問題類型: {(question as any).type}</div>;
    }
  };

  return (
    <div
      id={question.id}
      data-question-id={question.id}
      className={`space-y-2 transition-all duration-300 ${
        error
          ? "ring-2 ring-red-500 ring-opacity-50 rounded-lg p-3 bg-red-50"
          : ""
      }`}
    >
      <Label htmlFor={question.id} className="text-sm font-medium">
        {question.label}
        {question.required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {renderInput()}
      {error && !["matrix", "region-long-answer"].includes(question.type) && (
        <p className="text-sm text-red-500 flex items-center gap-1">
          <span className="text-red-500">⚠️</span>
          {error}
        </p>
      )}
    </div>
  );
}
