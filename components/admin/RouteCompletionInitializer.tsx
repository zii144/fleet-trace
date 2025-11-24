"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Play,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Database,
} from "lucide-react";
import { routeCompletionService } from "@/lib/services/RouteCompletionService";

interface RouteCompletionInitializerProps {
  questionnaireId: string;
}

export function RouteCompletionInitializer({
  questionnaireId,
}: RouteCompletionInitializerProps) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<
    "idle" | "initializing" | "completed" | "error"
  >("idle");
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState<{
    created: number;
    skipped: number;
    errors: number;
  } | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setStatus("initializing");
    setProgress(0);
    setMessage("Starting initialization...");

    try {
      await routeCompletionService.initializeQuestionnaireTracking(
        questionnaireId
      );

      setStatus("completed");
      setProgress(100);
      setMessage("✅ Route completion tracking initialized successfully!");

      // Get some basic stats
      const quotas = await routeCompletionService.getAllRouteQuotas(
        questionnaireId
      );
      setStats({
        created: quotas.length,
        skipped: 0,
        errors: 0,
      });
    } catch (error) {
      setStatus("error");
      setMessage(
        `❌ Initialization failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.error("Initialization error:", error);
    } finally {
      setIsInitializing(false);
    }
  };

  const handleCheckStatus = async () => {
    try {
      const quotas = await routeCompletionService.getAllRouteQuotas(
        questionnaireId
      );
      setStats({
        created: quotas.length,
        skipped: 0,
        errors: 0,
      });
      setMessage(`📊 Found ${quotas.length} route tracking records`);
    } catch (error) {
      setMessage(
        `❌ Error checking status: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Route Completion Tracking Initializer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Initialize route completion tracking for questionnaire:{" "}
          <Badge variant="outline">{questionnaireId}</Badge>
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={handleInitialize}
            disabled={isInitializing}
            className="flex items-center gap-2"
          >
            {isInitializing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            {isInitializing ? "Initializing..." : "Initialize Tracking"}
          </Button>

          <Button
            onClick={handleCheckStatus}
            variant="outline"
            className="flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            Check Status
          </Button>
        </div>

        {isInitializing && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}

        {message && (
          <div
            className={`p-3 rounded-lg text-sm ${
              status === "completed"
                ? "bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200"
                : status === "error"
                ? "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200"
                : "bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {status === "completed" && <CheckCircle className="w-4 h-4" />}
              {status === "error" && <AlertCircle className="w-4 h-4" />}
              {status === "initializing" && (
                <RefreshCw className="w-4 h-4 animate-spin" />
              )}
              {message}
            </div>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stats.created}
              </div>
              <div className="text-xs text-gray-600">Created</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {stats.skipped}
              </div>
              <div className="text-xs text-gray-600">Skipped</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {stats.errors}
              </div>
              <div className="text-xs text-gray-600">Errors</div>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 pt-4 border-t">
          <p>
            <strong>Note:</strong> This will create tracking records for all
            routes in the questionnaire.
          </p>
          <p>Each route will have a completion limit based on its category:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>環島自行車路線（環島1號）: 70 completions</li>
            <li>環島自行車路線（環支線）: 35 completions</li>
            <li>環島自行車路線（替代路線）: 35 completions</li>
            <li>多元自行車路線: 40 completions</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
