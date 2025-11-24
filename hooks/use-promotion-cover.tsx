"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

interface PromotionCoverState {
  isVisible: boolean;
  showCover: () => void;
  hideCover: () => void;
  dismissPermanently: () => void;
}

const PROMOTION_COVER_STORAGE_KEY = "fleet-trace-promotion-cover-dismissed";
const PROMOTION_COVER_SHOW_DELAY = 1000; // 1 second after dashboard loads

export function usePromotionCover(): PromotionCoverState {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsVisible(false);
      return;
    }

    // Check if user has permanently dismissed the promotion cover
    const isDismissed =
      localStorage.getItem(PROMOTION_COVER_STORAGE_KEY) === "true";

    if (isDismissed) {
      setIsVisible(false);
      return;
    }

    // Show promotion cover after a delay to let the dashboard load
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, PROMOTION_COVER_SHOW_DELAY);

    return () => clearTimeout(timer);
  }, [user]);

  const showCover = () => {
    setIsVisible(true);
  };

  const hideCover = () => {
    setIsVisible(false);
  };

  const dismissPermanently = () => {
    localStorage.setItem(PROMOTION_COVER_STORAGE_KEY, "true");
    setIsVisible(false);
  };

  return {
    isVisible,
    showCover,
    hideCover,
    dismissPermanently,
  };
}
