"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Gift, ChevronRight } from "lucide-react";
import { getAllActivePromotions } from "@/lib/promotion-config";

interface PromotionIndicatorProps {
  onShowPromotions: () => void;
  className?: string;
}

export function PromotionIndicator({
  onShowPromotions,
  className = "",
}: PromotionIndicatorProps) {
  const [isVisible, setIsVisible] = useState(true);
  const activePromotions = getAllActivePromotions();

  // Don't show if there are no active promotions or only one
  if (activePromotions.length <= 1) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={`bg-gradient-to-r from-orange-500 to-pink-500 rounded-lg p-3 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1">
            <Gift className="w-5 h-5 text-white" />
            <span className="text-white font-medium text-sm">
              {activePromotions.length} 個活動進行中
            </span>
          </div>
          <div className="flex space-x-1">
            {activePromotions.slice(0, 3).map((_, index) => (
              <div key={index} className="w-2 h-2 bg-white/60 rounded-full" />
            ))}
            {activePromotions.length > 3 && (
              <div className="w-2 h-2 bg-white/40 rounded-full flex items-center justify-center">
                <span className="text-xs text-white font-bold">
                  +{activePromotions.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onShowPromotions}
            className="text-white hover:bg-white/20 px-3 py-1 h-auto"
          >
            <span className="text-sm">查看全部</span>
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/70 hover:text-white text-sm px-2 py-1"
            aria-label="關閉提示"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
