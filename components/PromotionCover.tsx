"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

interface PromotionContent {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  title?: string;
  description?: string;
  active: boolean;
  isDisplayTitle: boolean;
  isDisplayDescription: boolean;
}

interface PromotionCoverProps {
  promotions: PromotionContent[];
  onClose: () => void;
  onDismissPermanently: () => void;
}

const PROMOTION_COVER_STORAGE_KEY = "fleet-trace-promotion-cover-dismissed";

export function PromotionCover({
  promotions,
  onClose,
  onDismissPermanently,
}: PromotionCoverProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [transitionState, setTransitionState] = useState<"out" | "in" | null>(
    null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const currentPromotion = promotions[currentIndex];
  const hasMultiplePromotions = promotions.length > 1;

  useEffect(() => {
    // Check if user has dismissed the promotion cover
    const isDismissed =
      localStorage.getItem(PROMOTION_COVER_STORAGE_KEY) === "true";

    if (isDismissed) {
      onClose();
      return;
    }

    // Fade in animation with a slight delay for smooth entrance
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    // Wait for fade out animation to complete
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const handleDismissPermanently = () => {
    localStorage.setItem(PROMOTION_COVER_STORAGE_KEY, "true");
    handleClose();
    onDismissPermanently();
  };

  const handleBackgroundClick = (e: React.MouseEvent) => {
    // Only close if clicking the background, not the media content
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const goToNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTransitionState("out");

    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
      setTransitionState("in");
      setTimeout(() => {
        setTransitionState(null);
        setIsAnimating(false);
      }, 400);
    }, 400);
  };

  const goToPrevious = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTransitionState("out");

    setTimeout(() => {
      setCurrentIndex(
        (prev) => (prev - 1 + promotions.length) % promotions.length
      );
      setTransitionState("in");
      setTimeout(() => {
        setTransitionState(null);
        setIsAnimating(false);
      }, 400);
    }, 400);
  };

  const goToPromotion = (index: number) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTransitionState("out");

    setTimeout(() => {
      setCurrentIndex(index);
      setTransitionState("in");
      setTimeout(() => {
        setTransitionState(null);
        setIsAnimating(false);
      }, 400);
    }, 400);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-out ${
        isVisible && !isClosing ? "opacity-100" : "opacity-0"
      }`}
      onClick={handleBackgroundClick}
    >
      {/* Backdrop with blur effect */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-md transition-all duration-1000 ease-out ${
          isVisible && !isClosing ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Main content container */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4 md:p-6">
        {/* Media container */}
        <div
          className={`relative w-full max-w-4xl md:max-w-5xl lg:max-w-6xl rounded-xl md:rounded-2xl overflow-hidden shadow-xl md:shadow-2xl transform transition-all duration-1000 ease-out ${
            isVisible && !isClosing
              ? "opacity-100 scale-100"
              : "opacity-0 scale-95"
          }`}
        >
          {/* Soft transition animation container */}
          <div
            className={`w-full aspect-video ${
              transitionState === "out"
                ? "animate-fade-blur-out"
                : transitionState === "in"
                ? "animate-fade-blur-in"
                : ""
            }`}
          >
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-xl md:rounded-2xl animate-promotion-glow" />

            {currentPromotion.mediaType === "video" ? (
              <video
                key={currentPromotion.id}
                autoPlay
                muted
                loop
                playsInline
                className="w-full h-full object-contain relative z-10"
                style={{
                  maxHeight: "calc(70vh - 2rem)",
                  maxWidth: "calc(100vw - 2rem)",
                }}
              >
                <source src={currentPromotion.mediaUrl} type="video/mp4" />
                您目前瀏覽器不支援此影片格式，請使用其他瀏覽器或更新瀏覽器版本。
              </video>
            ) : (
              <img
                key={currentPromotion.id}
                src={currentPromotion.mediaUrl}
                alt={currentPromotion.title || "活動橫幅"}
                className="w-full h-full object-contain relative z-10"
                style={{
                  maxHeight: "calc(70vh - 2rem)",
                  maxWidth: "calc(100vw - 2rem)",
                }}
              />
            )}

            {/* Promotion title and description overlay */}
            {/*{(currentPromotion.title ||
              (currentPromotion.description &&
                currentPromotion.isDisplayDescription)) && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 md:p-6 z-20">
                {currentPromotion.title && currentPromotion.isDisplayTitle && (
                  <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                    {currentPromotion.title}
                  </h2>
                )}
                {currentPromotion.description &&
                  currentPromotion.isDisplayDescription && (
                    <p className="text-white/90 text-base md:text-lg">
                      {currentPromotion.description}
                    </p>
                  )}
              </div>
            )}*/}
          </div>
        </div>

        {/* Buttons below media container */}
        <div
          className={`mt-4 md:mt-6 flex gap-4 md:gap-6 transition-all duration-1000 delay-300 ease-out ${
            isVisible && !isClosing
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4"
          }`}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
          >
            稍後再說
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDismissPermanently}
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105"
          >
            不再顯示
          </Button>
        </div>
      </div>

      {/* Navigation arrows for multiple promotions */}
      {hasMultiplePromotions && (
        <>
          <button
            onClick={goToPrevious}
            disabled={isAnimating}
            aria-label="上一個活動"
            className={`absolute left-4 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isVisible && !isClosing
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-4"
            }`}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            disabled={isAnimating}
            aria-label="下一個活動"
            className={`absolute right-4 transform -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/30 text-white hover:bg-white/30 transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
              isVisible && !isClosing
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-4"
            }`}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Promotion indicators */}
      {hasMultiplePromotions && (
        <div
          className={`absolute top-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-20 transition-all duration-1000 delay-200 ease-out ${
            isVisible && !isClosing
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          {promotions.map((_, index) => (
            <button
              key={index}
              onClick={() => goToPromotion(index)}
              disabled={isAnimating}
              aria-label={`切換到第 ${index + 1} 個活動`}
              className={`w-3 h-3 rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${
                index === currentIndex
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              }`}
            />
          ))}
        </div>
      )}

      {/* Promotion counter */}
      {hasMultiplePromotions && (
        <div
          className={`absolute top-4 left-4 z-20 text-white/80 text-sm font-medium transition-all duration-1000 delay-300 ease-out ${
            isVisible && !isClosing
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4"
          }`}
        >
          {currentIndex + 1} / {promotions.length}
        </div>
      )}
    </div>
  );
}
