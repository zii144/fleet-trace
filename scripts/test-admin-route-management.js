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

async function testAdminRouteManagement() {
  console.log("🧪 Testing Admin Route Completion Management...\n");

  try {
    // Test 1: Check all tracking records
    console.log("📊 Test 1: Checking all route completion tracking records...");
    const trackingQuery = query(collection(db, "route_completion_tracking"));
    const trackingSnapshot = await getDocs(trackingQuery);

    console.log(`✅ Found ${trackingSnapshot.size} tracking records`);

    // Test 2: Analyze data quality issues
    console.log("\n📊 Test 2: Analyzing data quality issues...");
    const issues = [];
    const questionnaires = new Set();
    const categories = new Set();

    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      questionnaires.add(data.questionnaireId);
      categories.add(data.category);

      // Check for potential issues
      if (!data.questionnaireId || data.questionnaireId === "") {
        issues.push(
          `Missing questionnaireId for route ${data.routeName} (${data.routeId})`
        );
      }

      if (!data.routeName || data.routeName === "") {
        issues.push(`Missing routeName for route ${data.routeId}`);
      }

      if (data.completionLimit <= 0) {
        issues.push(
          `Invalid completion limit for route ${data.routeName} (${data.completionLimit})`
        );
      }

      if (data.currentCompletions < 0) {
        issues.push(
          `Negative completion count for route ${data.routeName} (${data.currentCompletions})`
        );
      }
    });

    console.log("\n📋 Data Analysis:");
    console.log(
      `  - Unique Questionnaires: ${Array.from(questionnaires).join(", ")}`
    );
    console.log(`  - Unique Categories: ${Array.from(categories).join(", ")}`);

    if (issues.length > 0) {
      console.log("\n⚠️  Data Quality Issues Found:");
      issues.forEach((issue) => console.log(`  - ${issue}`));
    } else {
      console.log("\n✅ No data quality issues found");
    }

    // Test 3: Check for incorrect questionnaireId entries
    console.log(
      "\n📊 Test 3: Checking for incorrect questionnaireId entries..."
    );
    const incorrectQuestionnaires = [];

    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      const validQuestionnaires = [
        "cycling-survey-2025",
        "diverse-cycling-survey-2025",
        "self-info-survey",
      ];

      if (!validQuestionnaires.includes(data.questionnaireId)) {
        incorrectQuestionnaires.push({
          routeName: data.routeName,
          routeId: data.routeId,
          currentQuestionnaireId: data.questionnaireId,
          docId: doc.id,
        });
      }
    });

    if (incorrectQuestionnaires.length > 0) {
      console.log(
        `⚠️  Found ${incorrectQuestionnaires.length} records with incorrect questionnaireId:`
      );
      incorrectQuestionnaires.forEach((item) => {
        console.log(
          `  - ${item.routeName} (${item.routeId}): "${item.currentQuestionnaireId}" (Doc ID: ${item.docId})`
        );
      });
    } else {
      console.log("✅ All questionnaireId entries are correct");
    }

    // Test 4: Statistics summary
    console.log("\n📊 Test 4: Statistics Summary...");
    let totalRoutes = 0;
    let totalSlots = 0;
    let totalCompletions = 0;
    let fullRoutes = 0;
    let lowAvailabilityRoutes = 0;
    let inactiveRoutes = 0;

    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRoutes++;
      totalSlots += data.completionLimit;
      totalCompletions += data.currentCompletions;

      if (data.currentCompletions >= data.completionLimit) {
        fullRoutes++;
      }

      if (
        data.currentCompletions < data.completionLimit &&
        data.completionLimit - data.currentCompletions <= 5
      ) {
        lowAvailabilityRoutes++;
      }

      if (!data.isActive) {
        inactiveRoutes++;
      }
    });

    console.log(`📈 Overall Statistics:`);
    console.log(`  - Total Routes: ${totalRoutes}`);
    console.log(`  - Total Slots: ${totalSlots}`);
    console.log(`  - Total Completions: ${totalCompletions}`);
    console.log(
      `  - Completion Rate: ${((totalCompletions / totalSlots) * 100).toFixed(
        2
      )}%`
    );
    console.log(`  - Full Routes: ${fullRoutes}`);
    console.log(`  - Low Availability Routes: ${lowAvailabilityRoutes}`);
    console.log(`  - Inactive Routes: ${inactiveRoutes}`);

    console.log("\n🎉 Admin Route Management test completed!");
    console.log(
      "✅ The admin interface should now be able to manage all route completion tracking data!"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAdminRouteManagement()
  .then(() => {
    console.log("\n✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
