import { useCallback } from "react";

export function useQuestionScroll() {
  const scrollToQuestion = useCallback((questionId: string) => {
    // Try to find the question element by ID
    const questionElement = document.getElementById(questionId);
    
    if (questionElement) {
      // Calculate the offset to account for any fixed headers
      const headerHeight = 80; // Adjust this value based on your header height
      const elementTop = questionElement.offsetTop - headerHeight;
      
      // Smooth scroll to the question
      window.scrollTo({
        top: Math.max(0, elementTop),
        behavior: "smooth",
      });
      
      // Add a visual highlight effect
      questionElement.classList.add("ring-2", "ring-red-500", "ring-opacity-50");
      
      // Remove the highlight after a few seconds
      setTimeout(() => {
        questionElement.classList.remove("ring-2", "ring-red-500", "ring-opacity-50");
      }, 3000);
      
      return true;
    }
    
    // If element not found by ID, try to find by data attribute
    const questionByData = document.querySelector(`[data-question-id="${questionId}"]`);
    if (questionByData) {
      const elementTop = (questionByData as HTMLElement).offsetTop - 80;
      
      window.scrollTo({
        top: Math.max(0, elementTop),
        behavior: "smooth",
      });
      
      (questionByData as HTMLElement).classList.add("ring-2", "ring-red-500", "ring-opacity-50");
      
      setTimeout(() => {
        (questionByData as HTMLElement).classList.remove("ring-2", "ring-red-500", "ring-opacity-50");
      }, 3000);
      
      return true;
    }
    
    // If still not found, scroll to top and show a toast or alert
    console.warn(`Question element with ID "${questionId}" not found`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    
    return false;
  }, []);

  const scrollToFirstError = useCallback((errors: Record<string, string>) => {
    const firstErrorId = Object.keys(errors)[0];
    if (firstErrorId) {
      return scrollToQuestion(firstErrorId);
    }
    return false;
  }, [scrollToQuestion]);

  return {
    scrollToQuestion,
    scrollToFirstError,
  };
} 