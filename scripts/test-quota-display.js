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

async function testQuotaDisplay() {
  console.log("🧪 Testing Quota Display Functionality...\n");

  try {
    // Test 1: Check route quotas for cycling survey
    console.log("📊 Test 1: Checking route quotas for cycling-survey-2025...");
    const cyclingQuery = query(
      collection(db, "route_completion_tracking"),
      where("questionnaireId", "==", "cycling-survey-2025")
    );
    const cyclingSnapshot = await getDocs(cyclingQuery);

    console.log(`✅ Found ${cyclingSnapshot.size} routes for cycling survey`);

    // Display first 5 routes with their quotas
    console.log("\n📋 Sample route quotas:");
    let count = 0;
    cyclingSnapshot.forEach((doc) => {
      if (count < 5) {
        const data = doc.data();
        const remaining = data.completionLimit - data.currentCompletions;
        console.log(
          `  - ${data.routeName}: ${remaining}/${data.completionLimit} remaining`
        );
        count++;
      }
    });

    // Test 2: Check diverse cycling survey
    console.log(
      "\n📊 Test 2: Checking route quotas for diverse-cycling-survey-2025..."
    );
    const diverseQuery = query(
      collection(db, "route_completion_tracking"),
      where("questionnaireId", "==", "diverse-cycling-survey-2025")
    );
    const diverseSnapshot = await getDocs(diverseQuery);

    console.log(
      `✅ Found ${diverseSnapshot.size} routes for diverse cycling survey`
    );

    // Test 3: Check for any full routes
    console.log("\n📊 Test 3: Checking for full routes...");
    let fullRoutes = [];
    cyclingSnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.currentCompletions >= data.completionLimit) {
        fullRoutes.push({
          name: data.routeName,
          completions: data.currentCompletions,
          limit: data.completionLimit,
        });
      }
    });

    if (fullRoutes.length > 0) {
      console.log(`⚠️  Found ${fullRoutes.length} full routes:`);
      fullRoutes.forEach((route) => {
        console.log(
          `  - ${route.name}: ${route.completions}/${route.limit} (FULL)`
        );
      });
    } else {
      console.log("✅ No routes are currently full");
    }

    // Test 4: Calculate overall statistics
    console.log("\n📊 Test 4: Overall quota statistics...");
    let totalRoutes = 0;
    let totalSlots = 0;
    let totalCompletions = 0;
    let availableSlots = 0;

    cyclingSnapshot.forEach((doc) => {
      const data = doc.data();
      totalRoutes++;
      totalSlots += data.completionLimit;
      totalCompletions += data.currentCompletions;
      availableSlots += data.completionLimit - data.currentCompletions;
    });

    console.log(`📈 Cycling Survey Statistics:`);
    console.log(`  - Total Routes: ${totalRoutes}`);
    console.log(`  - Total Slots: ${totalSlots}`);
    console.log(`  - Total Completions: ${totalCompletions}`);
    console.log(`  - Available Slots: ${availableSlots}`);
    console.log(
      `  - Completion Rate: ${((totalCompletions / totalSlots) * 100).toFixed(
        2
      )}%`
    );

    console.log("\n🎉 Quota display test completed successfully!");
    console.log(
      "✅ The LeafletMap component should now show real-time quota information!"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testQuotaDisplay()
  .then(() => {
    console.log("\n✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
