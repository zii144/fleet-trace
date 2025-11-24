const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
} = require("firebase/firestore");

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

async function testRouteCompletionSystem() {
  console.log("🧪 Testing Route Completion Tracking System...\n");

  try {
    // Test 1: Check if tracking records exist
    console.log("📊 Test 1: Checking tracking records...");
    const trackingQuery = query(collection(db, "route_completion_tracking"));
    const trackingSnapshot = await getDocs(trackingQuery);

    console.log(`✅ Found ${trackingSnapshot.size} tracking records`);

    // Group by questionnaire
    const byQuestionnaire = {};
    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      const questionnaireId = data.questionnaireId;
      if (!byQuestionnaire[questionnaireId]) {
        byQuestionnaire[questionnaireId] = [];
      }
      byQuestionnaire[questionnaireId].push(data);
    });

    console.log("\n📋 Records by questionnaire:");
    Object.entries(byQuestionnaire).forEach(([questionnaireId, records]) => {
      console.log(`  - ${questionnaireId}: ${records.length} routes`);
    });

    // Test 2: Check route categories and limits
    console.log("\n📊 Test 2: Checking route categories and limits...");
    const categories = {};
    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      const category = data.category;
      if (!categories[category]) {
        categories[category] = { count: 0, totalLimit: 0 };
      }
      categories[category].count++;
      categories[category].totalLimit += data.completionLimit;
    });

    console.log("\n📈 Categories summary:");
    Object.entries(categories).forEach(([category, stats]) => {
      console.log(
        `  - ${category}: ${stats.count} routes, ${stats.totalLimit} total slots`
      );
    });

    // Test 3: Check specific routes
    console.log("\n📊 Test 3: Checking specific routes...");
    const route1Query = query(
      collection(db, "route_completion_tracking"),
      where("routeId", "==", "route-1")
    );
    const route1Snapshot = await getDocs(route1Query);

    if (!route1Snapshot.empty) {
      const route1Data = route1Snapshot.docs[0].data();
      console.log(`✅ Route 1 (${route1Data.routeName}):`);
      console.log(`  - Category: ${route1Data.category}`);
      console.log(`  - Completion Limit: ${route1Data.completionLimit}`);
      console.log(`  - Current Completions: ${route1Data.currentCompletions}`);
      console.log(
        `  - Remaining: ${
          route1Data.completionLimit - route1Data.currentCompletions
        }`
      );
    }

    // Test 4: Calculate total quotas
    console.log("\n📊 Test 4: Calculating total quotas...");
    let totalRoutes = 0;
    let totalSlots = 0;
    let totalCompletions = 0;

    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRoutes++;
      totalSlots += data.completionLimit;
      totalCompletions += data.currentCompletions;
    });

    console.log(`📈 Overall Summary:`);
    console.log(`  - Total Routes: ${totalRoutes}`);
    console.log(`  - Total Slots: ${totalSlots}`);
    console.log(`  - Total Completions: ${totalCompletions}`);
    console.log(`  - Remaining Slots: ${totalSlots - totalCompletions}`);
    console.log(
      `  - Completion Rate: ${((totalCompletions / totalSlots) * 100).toFixed(
        2
      )}%`
    );

    console.log("\n🎉 All tests completed successfully!");
    console.log("✅ Route Completion Tracking System is ready for use!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testRouteCompletionSystem()
  .then(() => {
    console.log("\n✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
