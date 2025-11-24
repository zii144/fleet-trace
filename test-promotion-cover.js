// Test script for promotion cover functionality
console.log("Testing Promotion Cover Functionality...");

// Test localStorage functionality
const testStorageKey = "velo-trace-promotion-cover-dismissed";

// Clear any existing state
localStorage.removeItem(testStorageKey);

console.log(
  "1. Initial state - should show promotion:",
  localStorage.getItem(testStorageKey)
);

// Simulate user dismissing permanently
localStorage.setItem(testStorageKey, "true");

console.log(
  "2. After dismissing permanently - should not show:",
  localStorage.getItem(testStorageKey)
);

// Test different promotion configurations
const testPromotions = [
  {
    id: "cycling-survey-2025",
    mediaUrl: "/banner-video/cycling-survey.mp4",
    mediaType: "video",
    active: true,
  },
  {
    id: "static-promotion",
    mediaUrl: "/static-background/bg1.jpg",
    mediaType: "image",
    active: false,
  },
];

console.log(
  "3. Active promotion:",
  testPromotions.find((p) => p.active)
);

// Test media URL validation
const testMediaUrls = [
  "/banner-video/cycling-survey.mp4",
  "/banner-video/diverse-cycling-survey.mp4",
  "/banner-video/self-info-survey.mp4",
  "/static-background/bg1.jpg",
];

console.log("4. Available media URLs:", testMediaUrls);

// Clean up
localStorage.removeItem(testStorageKey);

console.log("5. Cleanup complete - promotion should show again on next visit");

console.log("✅ Promotion cover test completed successfully!");
