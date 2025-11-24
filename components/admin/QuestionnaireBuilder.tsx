"use client";

import { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  GripVertical,
  Save,
  Eye,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import {
  createQuestionnaire,
  updateQuestionnaire,
} from "@/lib/firebase-questionnaires";
import type {
  Questionnaire,
  QuestionnaireSection,
  Question,
  QuestionType,
} from "@/types/questionnaire";
import { QuestionBuilder } from "./QuestionBuilder";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { QuestionnairePreview } from "./QuestionnairePreview";

interface QuestionnaireBuilderProps {
  questionnaire?: Questionnaire;
  onSave: (questionnaire: Questionnaire) => void;
  onCancel: () => void;
}

export function QuestionnaireBuilder({
  questionnaire,
  onSave,
  onCancel,
}: QuestionnaireBuilderProps) {
  const [title, setTitle] = useState(questionnaire?.title || "");
  const [description, setDescription] = useState(
    questionnaire?.description || ""
  );
  const [version, setVersion] = useState(questionnaire?.version || "1.0");
  const [organize, setOrganize] = useState(
    questionnaire?.organize || "交通部運輸研究所"
  );
  const [sections, setSections] = useState<QuestionnaireSection[]>(
    questionnaire?.sections || [
      {
        id: `section-${Date.now()}`,
        title: "基本資料",
        description: "",
        questions: [],
      },
    ]
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    sections[0]?.id || ""
  );
  const [showQuestionTypeSelector, setShowQuestionTypeSelector] =
    useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedQuestionId, setDraggedQuestionId] = useState<string | null>(
    null
  );
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [originalQuestionnaire, setOriginalQuestionnaire] =
    useState<Questionnaire | null>(questionnaire || null);
  const [showBackConfirmation, setShowBackConfirmation] = useState(false);

  const selectedSection = sections.find((s) => s.id === selectedSectionId);

  // Update original questionnaire reference when prop changes
  useEffect(() => {
    if (questionnaire) {
      setOriginalQuestionnaire(questionnaire);
    }
  }, [questionnaire]);

  const getQuestionTypeLabel = (type: QuestionType): string => {
    const typeLabels: Record<QuestionType, string> = {
      text: "文字輸入",
      textarea: "長文字輸入",
      number: "數字輸入",
      email: "電子郵件",
      select: "下拉選單",
      radio: "單選",
      checkbox: "多選",
      matrix: "矩陣評量",
      time: "時間選擇",
      map: "地圖選點",
      "radio-number": "單選+數字",
      "radio-text": "單選+文字",
      "select-text": "下拉+文字",
      "checkbox-text": "多選+文字",
      "region-long-answer": "區域長答題",
      "train-schedule-request": "班次需求",
    };
    return typeLabels[type] || type;
  };

  const handleAddSection = () => {
    const newSection: QuestionnaireSection = {
      id: `section-${Date.now()}`,
      title: `Section ${sections.length + 1}`,
      description: "",
      questions: [],
    };
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.id);
  };

  const handleUpdateSection = (
    sectionId: string,
    updates: Partial<QuestionnaireSection>
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, ...updates } : section
      )
    );
  };

  const handleDeleteSection = (sectionId: string) => {
    if (sections.length <= 1) return; // Keep at least one section

    const newSections = sections.filter((s) => s.id !== sectionId);
    setSections(newSections);

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(newSections[0]?.id || "");
    }
  };

  const handleAddQuestion = (questionType: QuestionType) => {
    if (!selectedSection) return;

    const newQuestion: Question = {
      id: `question-${Date.now()}`,
      type: questionType,
      label: "請輸入問題標題",
      required: false,
    } as Question;

    // Add default properties based on question type
    if (
      questionType === "select" ||
      questionType === "radio" ||
      questionType === "checkbox"
    ) {
      (newQuestion as any).options = ["選項 1", "選項 2"];
    } else if (questionType === "matrix") {
      (newQuestion as any).options = ["Row 1", "Row 2"];
      (newQuestion as any).scale = ["1", "2", "3", "4", "5"];
    } else if (questionType === "map") {
      (newQuestion as any).options = [];
      (newQuestion as any).kmlFiles = [];
      (newQuestion as any).allowMultipleSelection = false;
    } else if (questionType === "radio-number") {
      (newQuestion as any).options = [
        { value: "option1", label: "Option 1", hasNumberInput: false },
      ];
    } else if (questionType === "radio-text") {
      (newQuestion as any).options = [
        { value: "option1", label: "Option 1", hasTextInput: false },
      ];
    } else if (questionType === "time") {
      (newQuestion as any).timeFormat = "YYYY-MM-DD";
    } else if (questionType === "region-long-answer") {
      (newQuestion as any).regions = ["台北市", "新北市", "桃園市"];
      (newQuestion as any).minBlocks = 1;
      (newQuestion as any).maxBlocks = 5;
    }

    const updatedSection = {
      ...selectedSection,
      questions: [...selectedSection.questions, newQuestion],
    };

    handleUpdateSection(selectedSectionId, updatedSection);
    setShowQuestionTypeSelector(false);

    // Track the change
    const changeDescription = `新增問題：${getQuestionTypeLabel(
      questionType
    )}類型`;
    setPendingChanges((prev) => [...prev, changeDescription]);
    setHasUnsavedChanges(true);
  };

  const handleUpdateQuestion = (
    questionId: string,
    updates: Partial<Question>
  ) => {
    if (!selectedSection) return;

    const updatedQuestions = selectedSection.questions.map((q) =>
      q.id === questionId ? ({ ...q, ...updates } as Question) : q
    );

    handleUpdateSection(selectedSectionId, { questions: updatedQuestions });

    // Track content changes
    if (originalQuestionnaire) {
      const originalQuestion = originalQuestionnaire.sections
        .find((s) => s.id === selectedSectionId)
        ?.questions.find((q) => q.id === questionId);

      if (originalQuestion) {
        // Track label changes
        if (updates.label && originalQuestion.label !== updates.label) {
          const changeDescription = `修改問題標題：「${originalQuestion.label}」→「${updates.label}」`;
          setPendingChanges((prev) => {
            const filtered = prev.filter(
              (change) =>
                !change.includes(`修改問題標題：「${originalQuestion.label}」`)
            );
            return [...filtered, changeDescription];
          });
          setHasUnsavedChanges(true);
        }

        // Track required status changes
        if (
          updates.required !== undefined &&
          originalQuestion.required !== updates.required
        ) {
          const changeDescription = `${
            updates.required ? "設定" : "取消"
          }問題必填：「${originalQuestion.label}」`;
          setPendingChanges((prev) => {
            const filtered = prev.filter(
              (change) =>
                !change.includes(`問題必填：「${originalQuestion.label}」`)
            );
            return [...filtered, changeDescription];
          });
          setHasUnsavedChanges(true);
        }
      }
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (!selectedSection) return;

    const questionToDelete = selectedSection.questions.find(
      (q) => q.id === questionId
    );
    const updatedQuestions = selectedSection.questions.filter(
      (q) => q.id !== questionId
    );
    handleUpdateSection(selectedSectionId, { questions: updatedQuestions });

    // Track the change
    if (questionToDelete) {
      const changeDescription = `刪除問題：「${questionToDelete.label}」`;
      setPendingChanges((prev) => [...prev, changeDescription]);
      setHasUnsavedChanges(true);
    }
  };

  const handleMoveQuestion = (questionId: string, direction: "up" | "down") => {
    if (!selectedSection) return;

    const currentIndex = selectedSection.questions.findIndex(
      (q) => q.id === questionId
    );
    if (currentIndex === -1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= selectedSection.questions.length) return;

    const question = selectedSection.questions[currentIndex];
    const directionText = direction === "up" ? "上移" : "下移";

    // Perform the move immediately
    const newQuestions = [...selectedSection.questions];
    [newQuestions[currentIndex], newQuestions[newIndex]] = [
      newQuestions[newIndex],
      newQuestions[currentIndex],
    ];
    handleUpdateSection(selectedSectionId, { questions: newQuestions });

    // Track the change
    const changeDescription = `將問題「${question.label}」${directionText}一個位置`;
    setPendingChanges((prev) => [...prev, changeDescription]);
    setHasUnsavedChanges(true);
  };

  const handleDragStart = (questionId: string) => {
    setDraggedQuestionId(questionId);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();

    if (!draggedQuestionId || !selectedSection) return;

    const sourceIndex = selectedSection.questions.findIndex(
      (q) => q.id === draggedQuestionId
    );
    if (sourceIndex === -1) {
      setDraggedQuestionId(null);
      setDragOverIndex(null);
      return;
    }

    // If dropping at the same position, do nothing
    if (
      sourceIndex === targetIndex ||
      (sourceIndex === targetIndex - 1 &&
        targetIndex === selectedSection.questions.length)
    ) {
      setDraggedQuestionId(null);
      setDragOverIndex(null);
      return;
    }

    const draggedQuestion = selectedSection.questions[sourceIndex];
    const targetPosition =
      targetIndex === selectedSection.questions.length
        ? "列表末尾"
        : `位置 ${targetIndex + 1}`;

    // Perform the move immediately
    const newQuestions = [...selectedSection.questions];
    const [question] = newQuestions.splice(sourceIndex, 1);

    // Adjust target index if we're dropping after removing the source
    const adjustedTargetIndex =
      targetIndex > sourceIndex ? targetIndex - 1 : targetIndex;
    newQuestions.splice(adjustedTargetIndex, 0, question);

    handleUpdateSection(selectedSectionId, { questions: newQuestions });

    // Track the change
    const changeDescription = `拖拽移動問題「${draggedQuestion.label}」到${targetPosition}`;
    setPendingChanges((prev) => [...prev, changeDescription]);
    setHasUnsavedChanges(true);

    setDraggedQuestionId(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedQuestionId(null);
    setDragOverIndex(null);
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowBackConfirmation(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmBack = () => {
    setShowBackConfirmation(false);
    onCancel();
  };

  const handleCancelBack = () => {
    setShowBackConfirmation(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !description.trim() || sections.length === 0) {
      alert("請填寫所有必填欄位並至少創建一個區段");
      return;
    }

    // Show confirmation if there are pending changes
    if (hasUnsavedChanges && pendingChanges.length > 0) {
      setShowSaveConfirmation(true);
      return;
    }

    await performSave();
  };

  const performSave = async () => {
    setIsLoading(true);
    try {
      const questionnaireData: Questionnaire = {
        id: questionnaire?.id || `questionnaire-${Date.now()}`,
        title: title.trim(),
        description: description.trim(),
        version,
        organize,
        sections,
        createdAt: questionnaire?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (questionnaire?.id) {
        await updateQuestionnaire(questionnaire.id, questionnaireData);
      } else {
        await createQuestionnaire(questionnaireData);
      }

      // Create success message
      const changeCount = pendingChanges.length;
      const successMessage =
        changeCount > 0
          ? `已順利保存問卷，共套用 ${changeCount} 項變更`
          : "已順利保存問卷";

      setHasUnsavedChanges(false);
      setPendingChanges([]);
      setOriginalQuestionnaire(questionnaireData);
      setSaveSuccess(successMessage);
      setShowSaveConfirmation(false);

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSaveSuccess(null);
      }, 5000);

      onSave(questionnaireData);
    } catch (error) {
      console.error("Error saving questionnaire:", error);
      alert("保存問卷時發生錯誤，請稍後再試");
    } finally {
      setIsLoading(false);
    }
  };

  const currentQuestionnaire: Questionnaire = {
    id: questionnaire?.id || `preview-${Date.now()}`,
    title,
    description,
    version,
    organize,
    sections,
    createdAt: questionnaire?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Button variant="outline" onClick={handleBackClick}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  返回
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">
                    {questionnaire ? "編輯問卷" : "創建新問卷"}
                  </h1>
                  <p className="text-gray-600">設計您的問卷結構和問題</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => setShowPreview(true)}>
                  <Eye className="w-4 h-4 mr-2" />
                  預覽
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className={
                    hasUnsavedChanges ? "bg-orange-600 hover:bg-orange-700" : ""
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading
                    ? "保存中..."
                    : hasUnsavedChanges
                    ? "保存變更"
                    : "保存問卷"}
                </Button>
              </div>
            </div>

            {/* Unsaved changes indicator */}
            {hasUnsavedChanges && (
              <div className="bg-orange-50 border-l-4 border-orange-400 p-3">
                <div className="flex items-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400 mr-3" />
                  <div className="ml-3">
                    <p className="text-sm text-orange-700">
                      <strong>您有未保存的變更</strong> - 請記得保存您的問卷修改
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Success message */}
            {saveSuccess && (
              <div className="bg-green-50 border-l-4 border-green-400 p-3">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3" />
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      <strong>{saveSuccess}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area with Proper Scrolling */}
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 sm:p-6 h-full">
            {/* Left Sidebar - Questionnaire Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-4 max-h-[calc(100vh-8rem)] overflow-y-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>問卷資訊</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="title">問卷標題</Label>
                      <Input
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="輸入問卷標題"
                      />
                    </div>
                    <div>
                      <Label htmlFor="description">問卷描述</Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="輸入問卷描述"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label htmlFor="version">版本</Label>
                      <Input
                        id="version"
                        value={version}
                        onChange={(e) => setVersion(e.target.value)}
                        placeholder="1.0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="organize">主辦機關</Label>
                      <Input
                        id="organize"
                        value={organize}
                        onChange={(e) => setOrganize(e.target.value)}
                        placeholder="交通部運輸研究所"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Sections List */}
                <Card className="mt-4">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>區段</CardTitle>
                      <Button size="sm" onClick={handleAddSection}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {sections.map((section, index) => (
                        <div
                          key={section.id}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            selectedSectionId === section.id
                              ? "bg-blue-50 border border-blue-200"
                              : "hover:bg-gray-50"
                          }`}
                          onClick={() => setSelectedSectionId(section.id)}
                        >
                          <div className="flex items-center space-x-2">
                            <GripVertical className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">
                                {section.title}
                              </div>
                              <div className="text-xs text-gray-500">
                                {section.questions.length} 個問題
                              </div>
                            </div>
                          </div>
                          {sections.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteSection(section.id);
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Main Content - Section Editor */}
            <div className="lg:col-span-3">
              {selectedSection && (
                <div className="h-[calc(100vh-8rem)] overflow-hidden">
                  <Card className="h-full flex flex-col">
                    <CardHeader className="flex-shrink-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>編輯區段問題</CardTitle>
                          <CardDescription className="mt-2">
                            設計「{selectedSection.title}」區段內的問題
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          目前共有 {selectedSection.questions.length} 個問題
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-y-auto pb-6">
                      {/* Section Info */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                          <Label htmlFor="section-title">區段標題</Label>
                          <Textarea
                            id="section-title"
                            value={selectedSection.title}
                            onChange={(e) =>
                              handleUpdateSection(selectedSectionId, {
                                title: e.target.value,
                              })
                            }
                            placeholder="區段標題"
                          />
                        </div>
                        <div>
                          <Label htmlFor="section-description">區段描述</Label>
                          <Textarea
                            id="section-description"
                            value={selectedSection.description || ""}
                            onChange={(e) =>
                              handleUpdateSection(selectedSectionId, {
                                description: e.target.value,
                              })
                            }
                            placeholder="區段描述（可選）"
                          />
                        </div>
                      </div>

                      <Separator className="mb-6" />

                      {/* Questions */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium">問題</h3>
                          <Button
                            onClick={() => setShowQuestionTypeSelector(true)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            新增問題
                          </Button>
                        </div>

                        {selectedSection.questions.length === 0 ? (
                          <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                            <p className="text-gray-500 mb-4">此區段尚無問題</p>
                            <Button
                              variant="outline"
                              onClick={() => setShowQuestionTypeSelector(true)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              新增第一個問題
                            </Button>
                          </div>
                        ) : (
                          <div className="space-y-6 pb-8">
                            {selectedSection.questions.map(
                              (question, index) => (
                                <div key={question.id}>
                                  {/* Drop indicator */}
                                  {dragOverIndex === index && (
                                    <div className="h-1 bg-blue-500 rounded-full mb-2 animate-pulse" />
                                  )}
                                  <div
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className={`transition-all duration-200 ${
                                      dragOverIndex === index
                                        ? "transform scale-[1.02]"
                                        : ""
                                    }`}
                                  >
                                    <QuestionBuilder
                                      question={question}
                                      index={index}
                                      onUpdate={(updates: Partial<Question>) =>
                                        handleUpdateQuestion(
                                          question.id,
                                          updates
                                        )
                                      }
                                      onDelete={() =>
                                        handleDeleteQuestion(question.id)
                                      }
                                      onDragStart={() =>
                                        handleDragStart(question.id)
                                      }
                                      onDragEnd={handleDragEnd}
                                      onMoveUp={() =>
                                        handleMoveQuestion(question.id, "up")
                                      }
                                      onMoveDown={() =>
                                        handleMoveQuestion(question.id, "down")
                                      }
                                      canMoveUp={index > 0}
                                      canMoveDown={
                                        index <
                                        selectedSection.questions.length - 1
                                      }
                                      isDragging={
                                        draggedQuestionId === question.id
                                      }
                                    />
                                  </div>
                                  {/* Drop indicator for last item */}
                                  {index ===
                                    selectedSection.questions.length - 1 &&
                                    dragOverIndex === index + 1 && (
                                      <div className="h-1 bg-blue-500 rounded-full mt-2 animate-pulse" />
                                    )}
                                </div>
                              )
                            )}
                            {/* Drop zone for the end of the list */}
                            <div
                              onDragOver={(e) =>
                                handleDragOver(
                                  e,
                                  selectedSection.questions.length
                                )
                              }
                              onDragLeave={handleDragLeave}
                              onDrop={(e) =>
                                handleDrop(e, selectedSection.questions.length)
                              }
                              className="h-4 transition-all duration-200"
                            >
                              {dragOverIndex ===
                                selectedSection.questions.length && (
                                <div className="h-1 bg-blue-500 rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Question Type Selector Dialog */}
      <Dialog
        open={showQuestionTypeSelector}
        onOpenChange={setShowQuestionTypeSelector}
      >
        <DialogContent className="max-w-4xl max-h-[85vh] p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle>選擇問題類型</DialogTitle>
            <DialogDescription>選擇最適合您問題的類型</DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6 py-4 max-h-[calc(85vh-120px)]">
            <QuestionTypeSelector
              onSelect={handleAddQuestion}
              onCancel={() => setShowQuestionTypeSelector(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>問卷預覽</DialogTitle>
            <DialogDescription>
              預覽您的問卷在用戶端的顯示效果
            </DialogDescription>
          </DialogHeader>
          <QuestionnairePreview questionnaire={currentQuestionnaire} />
        </DialogContent>
      </Dialog>

      {/* Save Confirmation Dialog */}
      <AlertDialog
        open={showSaveConfirmation}
        onOpenChange={setShowSaveConfirmation}
      >
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <AlertDialogTitle>確認保存變更</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base">
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 font-medium mb-2">
                  您即將保存以下 {pendingChanges.length} 項變更：
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-blue-700 max-h-32 overflow-y-auto">
                  {pendingChanges.map((change, index) => (
                    <li key={index}>{change}</li>
                  ))}
                </ul>
              </div>
              <p className="mt-3 text-sm text-gray-600">
                確認後將保存所有變更到資料庫中。
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowSaveConfirmation(false)}>
              取消保存
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={performSave}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              <Save className="w-4 h-4 mr-2" />
              {isLoading ? "保存中..." : "確認保存"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Back confirmation dialog */}
      <AlertDialog
        open={showBackConfirmation}
        onOpenChange={setShowBackConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>未保存的變更</AlertDialogTitle>
            <AlertDialogDescription>
              您目前有尚未保存的變更。若直接返回，這些修改將會遺失。
              <br />
              建議您先保存問卷，以確保所有內容不會遺漏。
              <br />
              <span className="text-gray-700">
                確定要放棄這些變更並返回嗎？
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelBack}>
              繼續編輯
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBack}>
              放棄變更並返回
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
