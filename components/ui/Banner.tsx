import React from "react";
import { cn } from "@/lib/utils";

interface BannerProps {
  className?: string;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  backgroundVideo?: string;
  videoOpacity?: number;
  children?: React.ReactNode;
}

export function Banner({
  className,
  title,
  subtitle,
  backgroundImage,
  backgroundVideo,
  videoOpacity = 0.8,
  children,
}: BannerProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        "min-h-[200px] md:min-h-[250px] lg:min-h-[300px]",
        "bg-gradient-to-r from-primary/90 to-primary/70",
        className
      )}
      style={
        backgroundImage && !backgroundVideo
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }
          : undefined
      }
    >
      {/* Video Background */}
      {backgroundVideo && (
        <div className="absolute inset-0 w-full h-full">
          <video
            autoPlay
            muted
            loop
            playsInline
            className={cn(
              "absolute inset-0 w-full h-full object-cover",
              `opacity-${Math.round(videoOpacity * 100)}`
            )}
          >
            <source src={backgroundVideo} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
      )}

      {/* Static image overlay */}
      {backgroundImage && !backgroundVideo && (
        <div className="absolute inset-0 bg-black/40" />
      )}

      {/* Content container */}
      <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center">
        {children ? (
          children
        ) : (
          <>
            {title && (
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-lg md:text-xl text-white/90 max-w-2xl">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
