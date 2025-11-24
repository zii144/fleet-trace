"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Dynamically import the actual map to avoid SSR issues
const DynamicMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <Skeleton className="w-full h-64" />,
});

interface MapComponentProps {
  question: any;
  value: any;
  onChange: (value: any) => void;
  error?: string;
  questionnaireId?: string;
}

export function MapComponent({
  question,
  value,
  onChange,
  error,
  questionnaireId,
}: MapComponentProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <Skeleton className="w-full h-64" />;
  }

  return (
    <div className="space-y-2">
      <div
        className={`border rounded-lg overflow-hidden ${
          error ? "border-red-500" : "border-gray-200"
        }`}
      >
        <DynamicMap
          question={question}
          value={value}
          onChange={onChange}
          questionnaireId={questionnaireId}
        />
      </div>

      {/* Fallback radio buttons for accessibility and backup */}
      <div className="space-y-2 mt-4">
        {/* <p className="text-sm text-gray-600">或選擇以下選項：</p> */}
        {question.options?.map((option: any) => (
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
              className="text-sm"
            >
              {option.label}
              {option.description && (
                <span className="text-gray-500 ml-2">
                  ({option.description})
                </span>
              )}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
