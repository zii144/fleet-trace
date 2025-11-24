import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, CheckCircle } from "lucide-react";
import { getScoreColor, type SubmissionWithDetails } from "@/lib/user-profile";

interface SubmissionHistoryProps {
  submissions: SubmissionWithDetails[];
}

export function SubmissionHistory({ submissions }: SubmissionHistoryProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (submissions.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            尚無提交記錄
          </h3>
          <p className="text-gray-600">開始填寫問卷來查看您的提交歷史</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission, index) => (
        <Card key={submission.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg mb-1">
                  {submission.questionnaireName}
                </CardTitle>
                <CardDescription className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(submission.submittedAt)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(submission.submittedAt)}
                  </span>
                </CardDescription>
              </div>
              <Badge
                variant="secondary"
                className={`${getScoreColor(submission.score)} font-semibold`}
              >
                {submission.score}分（整體完成率：
                {submission.completionPercentage}
                %）
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">完成部分：</span>
                <span className="text-gray-600">
                  {submission.completedSections.length}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">問卷ID：</span>
                <span className="text-gray-600 font-mono text-xs">
                  {submission.questionnaireId}
                </span>
              </div>
            </div>

            {/* Show completed sections */}
            {submission.completedSections.length > 0 && (
              <div className="mt-3">
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  已完成部分：
                </span>
                <div className="flex flex-wrap gap-1">
                  {submission.completedSections.map((sectionId) => (
                    <Badge
                      key={sectionId}
                      variant="outline"
                      className="text-xs"
                    >
                      {sectionId.replace("section", "第")}部分
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Show sample responses if available */}
            {Object.keys(submission.responses).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm font-medium text-gray-700 block mb-2">
                  部分回答：
                </span>
                <div className="text-sm text-gray-600 space-y-1">
                  {Object.entries(submission.responses)
                    .slice(0, 2)
                    .map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium mr-2">{key}:</span>
                        <span className="truncate">{String(value)}</span>
                      </div>
                    ))}
                  {Object.keys(submission.responses).length > 2 && (
                    <div className="text-xs text-gray-500">
                      ...還有 {Object.keys(submission.responses).length - 2}{" "}
                      個回答
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
