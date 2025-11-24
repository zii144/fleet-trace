"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { routeSubmissionService } from "@/lib/services/RouteSubmissionService";
import type { RouteAvailability } from "@/types/route-submission";
import { useAuth } from "@/components/auth/AuthProvider";
import styles from "./RouteIndicator.module.css";

// Dynamically import the actual map to avoid SSR issues
const DynamicMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-64" />,
});

interface EnhancedMapComponentProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  questionnaireId: string;
}

export function EnhancedMapComponent({
  question,
  value,
  onChange,
  error,
  questionnaireId,
}: EnhancedMapComponentProps) {
  const [mounted, setMounted] = useState(false);
  const [routeAvailability, setRouteAvailability] = useState<RouteAvailability>(
    {
      available: [],
      restricted: [],
      warnings: [],
    }
  );
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function loadRouteAvailability() {
      if (user?.id && questionnaireId && question.kmlFiles) {
        setLoading(true);
        try {
          const availability = await routeSubmissionService.getAvailableRoutes(
            user.id,
            questionnaireId,
            question.kmlFiles
          );
          setRouteAvailability(availability);
        } catch (error) {
          console.error("Error loading route availability:", error);
          // Fallback to all routes available
          setRouteAvailability({
            available: question.kmlFiles || [],
            restricted: [],
            warnings: [],
          });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }

    if (mounted) {
      loadRouteAvailability();
    }
  }, [mounted, user?.id, questionnaireId, question.kmlFiles]);

  const handleRouteSelect = async (routeName: string) => {
    // Find the route info by name
    const allRoutes = [
      ...routeAvailability.available,
      ...routeAvailability.warnings,
      ...routeAvailability.restricted,
    ];

    const selectedRoute = allRoutes.find((route) => route.name === routeName);
    if (!selectedRoute) {
      onChange(routeName);
      return;
    }

    // Check if route is restricted
    const restrictedRoute = routeAvailability.restricted.find(
      (r) => r.id === selectedRoute.id
    );
    if (restrictedRoute) {
      alert(restrictedRoute.reason);
      return;
    }

    // Show warning if applicable
    const warningRoute = routeAvailability.warnings.find(
      (r) => r.id === selectedRoute.id
    );
    if (warningRoute) {
      if (!confirm(`${warningRoute.warning}\n\n是否要繼續選擇此路線？`)) {
        return;
      }
    }

    onChange(routeName);
  };

  if (!mounted) {
    return <Skeleton className="w-full h-64" />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-64" />
        <div className="text-sm text-gray-500 text-center">
          正在檢查路線提交記錄...
        </div>
      </div>
    );
  }

  // Prepare enhanced question with route availability
  const enhancedQuestion = {
    ...question,
    kmlFiles: [
      ...routeAvailability.available,
      ...routeAvailability.warnings,
      ...routeAvailability.restricted.map((r) => ({
        ...r,
        disabled: true,
      })),
    ],
  };

  return (
    <div className="space-y-4">
      <div
        className={`border rounded-lg overflow-hidden ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        <DynamicMap
          question={enhancedQuestion}
          value={value}
          onChange={handleRouteSelect}
        />
      </div>

      {/* Route Status Information */}
      {(routeAvailability.restricted.length > 0 ||
        routeAvailability.warnings.length > 0) && (
        <div className="space-y-3">
          {routeAvailability.restricted.length > 0 && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium text-red-600 mb-2">
                    已填寫路線 (無法重複選擇)
                  </div>
                  <div className="space-y-1">
                    {routeAvailability.restricted.map((route) => (
                      <div
                        key={route.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center">
                          <div
                            className={`${styles.routeIndicator} ${styles.routeIndicatorRestricted}`}
                            data-color={route.color || "#cccccc"}
                          />
                          <span className="text-gray-600">{route.name}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          已填寫
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {routeAvailability.warnings.length > 0 && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium text-amber-700 mb-2">
                    需確認路線 (可重複填寫但會提醒)
                  </div>
                  <div className="space-y-1">
                    {routeAvailability.warnings.map((route) => (
                      <div key={route.id} className="flex items-center text-sm">
                        <div
                          className={`${styles.routeIndicator} ${styles.routeIndicatorWarning}`}
                          data-color={route.color || "#ff9900"}
                        />
                        <span className="text-amber-700">{route.name}</span>
                        <span className="ml-auto text-amber-500">⚠️</span>
                      </div>
                    ))}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Fallback radio buttons for accessibility and backup */}
      {question.options?.length > 0 && (
        <div className="space-y-2 mt-4">
          <p className="text-sm text-gray-600">或選擇以下選項：</p>
          {question.options.map((option: any) => (
            <div key={option.value} className="flex items-center space-x-2">
              <input
                type="radio"
                id={`${question.id}-${option.value}`}
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4"
              />
              <label
                htmlFor={`${question.id}-${option.value}`}
                className="text-sm cursor-pointer"
              >
                {option.label}
              </label>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default EnhancedMapComponent;
