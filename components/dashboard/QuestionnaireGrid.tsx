import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import type { Questionnaire } from "@/types/questionnaire";
import type { User } from "@/types/auth";
import { QuestionnaireCard } from "./QuestionnaireCard";

interface QuestionnaireGridProps {
  questionnaires: Questionnaire[];
  user: User | null;
  className?: string;
  animateCards?: boolean;
}

export function QuestionnaireGrid({
  questionnaires,
  user,
  className = "",
  animateCards = false,
}: QuestionnaireGridProps) {
  if (questionnaires.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12 bg-red-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            沒有可用的評鑑調查
          </h3>
          <p className="text-gray-600">
            {user?.role === "admin"
              ? "在管理面板中建立您的第一個評鑑調查。"
              : "請稍後再查看新評鑑調查。"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div
      className={`grid gap-5 md:grid-cols-2 lg:grid-cols-3 items-stretch ${className}`}
    >
      {questionnaires.map((questionnaire, index) => (
        <div
          key={questionnaire.id}
          className={`transition-all duration-700 h-full ${
            animateCards
              ? `opacity-0 translate-y-8 animate-slide-in-up`
              : "opacity-100 translate-y-0"
          }`}
          style={
            animateCards
              ? {
                  animationDelay: `${index * 150}ms`,
                  animationFillMode: "forwards",
                }
              : {}
          }
        >
          <QuestionnaireCard questionnaire={questionnaire} />
        </div>
      ))}
    </div>
  );
}
