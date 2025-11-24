const { initializeApp } = require("firebase/app");
const { getFirestore } = require("firebase/firestore");

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import the service (we'll need to create a simple version for testing)
async function testRouteCompletionService() {
  console.log("🧪 Testing RouteCompletionService methods...\n");

  try {
    // Test with a known route from the Firestore console
    const routeId = "route-jhudao";
    const questionnaireId = "self-info-survey";

    console.log(
      `Testing with route: ${routeId}, questionnaire: ${questionnaireId}`
    );

    // Test getRouteCompletionTracking
    console.log("\n📊 Test 1: getRouteCompletionTracking");
    const { collection, query, where, getDocs } = require("firebase/firestore");

    const trackingQuery = query(
      collection(db, "route_completion_tracking"),
      where("routeId", "==", routeId),
      where("questionnaireId", "==", questionnaireId)
    );

    const trackingSnapshot = await getDocs(trackingQuery);

    if (!trackingSnapshot.empty) {
      const trackingData = trackingSnapshot.docs[0].data();
      console.log("✅ Tracking data found:");
      console.log(`  - Route: ${trackingData.routeName}`);
      console.log(`  - Category: ${trackingData.category}`);
      console.log(`  - Completion Limit: ${trackingData.completionLimit}`);
      console.log(
        `  - Current Completions: ${trackingData.currentCompletions}`
      );
      console.log(
        `  - Remaining: ${
          trackingData.completionLimit - trackingData.currentCompletions
        }`
      );
    } else {
      console.log("❌ No tracking data found");
    }

    // Test getRouteRemainingQuota (simulated)
    console.log("\n📊 Test 2: getRouteRemainingQuota (simulated)");
    if (!trackingSnapshot.empty) {
      const trackingData = trackingSnapshot.docs[0].data();
      const remaining =
        trackingData.completionLimit - trackingData.currentCompletions;
      console.log(`✅ Remaining quota: ${remaining}`);
    }

    console.log("\n🎉 Service test completed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testRouteCompletionService()
  .then(() => {
    console.log("\n✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
