import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  bgOpacity?: number;
  glass?: boolean;
  animate?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    { className, bgOpacity = 1, glass = false, animate = false, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border shadow-sm",
        {
          "bg-card text-card-foreground": bgOpacity === 1 && !glass,
          "bg-card/95 text-card-foreground": bgOpacity === 0.95 && !glass,
          "bg-card/90 text-card-foreground": bgOpacity === 0.9 && !glass,
          "bg-card/85 text-card-foreground": bgOpacity === 0.85 && !glass,
          "bg-card/80 text-card-foreground": bgOpacity === 0.8 && !glass,
          "bg-card/75 text-card-foreground": bgOpacity === 0.75 && !glass,
          "bg-card/70 text-card-foreground": bgOpacity === 0.7 && !glass,
          // Glassmorphism styles
          "backdrop-blur-md bg-white/80 border-white/100 shadow-lg": glass,
          // Animation styles
          "transition-all duration-1000 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4":
            animate,
        },
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
