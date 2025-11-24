"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { QuestionnaireForm } from "@/components/questionnaire/QuestionnaireForm";
import { getQuestionnaireById } from "@/lib/questionnaire";
import type { Questionnaire } from "@/types/questionnaire";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function QuestionnairePage() {
  const params = useParams();
  const router = useRouter();
  const [questionnaire, setQuestionnaire] = useState<Questionnaire | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadQuestionnaire = async () => {
      try {
        const id = params.id as string;
        console.log("📋 Loading questionnaire with ID:", id);
        setLoading(true);

        const found = getQuestionnaireById(id);
        console.log("✅ Questionnaire loaded:", found);
        setQuestionnaire(found);

        if (!found) {
          console.log("❌ Questionnaire not found, redirecting to dashboard");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("❌ Error loading questionnaire:", error);
        router.push("/dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadQuestionnaire();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen animated-gradient-background">
        <div className="relative">
          {/* Outer ring with breathing animation */}
          <div className="absolute inset-0 rounded-full h-32 w-32 border-2 border-gray-300/30 animate-pulse"></div>

          {/* Main spinner with enhanced animation */}
          <div className="relative rounded-full h-32 w-32 border-4 border-transparent border-t-orange-600 border-r-orange-400 animate-spin"></div>

          {/* Inner glow effect */}
          <div className="absolute inset-2 rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 animate-pulse-glow"></div>

          {/* Loading text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700 animate-pulse">
              載入中...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (!questionnaire) {
    return null;
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen animated-gradient-background">
        <div className="max-w-4xl mx-auto py-6">
          <div className="mb-2 px-5">
            <Link href="/dashboard">
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-gradient-to-b from-gray-50 to-gray-100 
                  hover:from-gray-50 hover:to-white transition-all duration-500 
                  shadow-md transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl text-gray-800 animate-pulse-glow hover:animate-none"
              >
                返回儀表板
              </Button>
            </Link>
          </div>
          <QuestionnaireForm questionnaire={questionnaire} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
