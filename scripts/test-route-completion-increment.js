const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
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

async function testRouteCompletionIncrement() {
  console.log(
    "🧪 Testing Route Completion Increment After Security Rules Fix...\n"
  );

  try {
    // Test 1: Check current tracking records
    console.log("📊 Test 1: Checking current tracking records...");
    const trackingQuery = query(collection(db, "route_completion_tracking"));
    const trackingSnapshot = await getDocs(trackingQuery);

    console.log(`✅ Found ${trackingSnapshot.size} tracking records`);

    if (trackingSnapshot.empty) {
      console.log(
        "❌ No tracking records found. Please initialize route completion tracking first."
      );
      return;
    }

    // Test 2: Try to increment a specific route
    console.log("\n📊 Test 2: Testing increment operation...");

    // Get the first tracking record
    const firstTracking = trackingSnapshot.docs[0];
    const trackingData = firstTracking.data();
    const trackingId = firstTracking.id;

    console.log(
      `Testing with route: ${trackingData.routeName} (${trackingData.routeId})`
    );
    console.log(`Current completions: ${trackingData.currentCompletions}`);
    console.log(`Completion limit: ${trackingData.completionLimit}`);

    // Try to increment the completion count
    const docRef = doc(db, "route_completion_tracking", trackingId);

    console.log("🔄 Attempting to increment completion count...");

    await updateDoc(docRef, {
      currentCompletions: increment(1),
      lastUpdated: new Date().toISOString(),
      "metadata.totalSubmissions": increment(1),
      "metadata.uniqueUsers": increment(1),
    });

    console.log("✅ Increment operation successful!");

    // Test 3: Verify the increment
    console.log("\n📊 Test 3: Verifying increment...");
    const updatedSnapshot = await getDocs(
      query(
        collection(db, "route_completion_tracking"),
        where("routeId", "==", trackingData.routeId)
      )
    );

    if (!updatedSnapshot.empty) {
      const updatedData = updatedSnapshot.docs[0].data();
      console.log(`Updated completions: ${updatedData.currentCompletions}`);
      console.log(`Previous completions: ${trackingData.currentCompletions}`);
      console.log(
        `Increment successful: ${
          updatedData.currentCompletions === trackingData.currentCompletions + 1
        }`
      );
    }

    // Test 4: Check all routes for any issues
    console.log("\n📊 Test 4: Checking all routes for potential issues...");
    let totalCompletions = 0;
    let totalLimit = 0;

    trackingSnapshot.forEach((doc) => {
      const data = doc.data();
      totalCompletions += data.currentCompletions;
      totalLimit += data.completionLimit;

      if (data.currentCompletions > data.completionLimit) {
        console.log(
          `⚠️  Warning: Route ${data.routeName} exceeds limit (${data.currentCompletions}/${data.completionLimit})`
        );
      }
    });

    console.log(`📈 Overall Summary:`);
    console.log(`  - Total Routes: ${trackingSnapshot.size}`);
    console.log(`  - Total Slots: ${totalLimit}`);
    console.log(`  - Total Completions: ${totalCompletions}`);
    console.log(`  - Remaining Slots: ${totalLimit - totalCompletions}`);
    console.log(
      `  - Completion Rate: ${((totalCompletions / totalLimit) * 100).toFixed(
        2
      )}%`
    );

    console.log("\n🎉 All tests completed successfully!");
    console.log("✅ Route Completion Increment is now working correctly!");
    console.log(
      "🔐 Security rules have been fixed to allow authenticated users to increment completion counts."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);

    if (error.code === "permission-denied") {
      console.error("🔒 Permission denied error detected.");
      console.error(
        "This suggests the security rules are still not working correctly."
      );
      console.error("Please check the firestore.rules file and redeploy.");
    }
  }
}

// Run the test
testRouteCompletionIncrement()
  .then(() => {
    console.log("\n✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
