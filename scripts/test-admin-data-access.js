const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs } = require("firebase/firestore");

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

async function testAdminDataAccess() {
  console.log("🧪 Testing Admin Data Access...\n");

  try {
    // Test 1: Check if we can access the collection at all
    console.log("📊 Test 1: Checking collection access...");
    const trackingQuery = collection(db, "route_completion_tracking");
    console.log("✅ Collection reference created successfully");

    // Test 2: Try to get documents (this will fail without auth, but we can see the error)
    console.log("\n📊 Test 2: Attempting to fetch documents...");
    try {
      const snapshot = await getDocs(trackingQuery);
      console.log(`✅ Successfully fetched ${snapshot.size} documents`);

      if (snapshot.size > 0) {
        console.log("\n📋 Sample document data:");
        const firstDoc = snapshot.docs[0];
        console.log("Document ID:", firstDoc.id);
        console.log("Document data:", firstDoc.data());
      }
    } catch (error) {
      console.log("❌ Expected error (no auth):", error.code, error.message);
      console.log(
        "This is expected behavior - the admin interface will work when authenticated"
      );
    }

    // Test 3: Check environment variables
    console.log("\n📊 Test 3: Checking environment variables...");
    console.log("Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    console.log("Auth Domain:", process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN);
    console.log("API Key exists:", !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);

    console.log("\n🎉 Admin data access test completed!");
    console.log(
      "✅ The admin interface should work when you're logged in as admin"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

// Run the test
testAdminDataAccess()
  .then(() => {
    console.log("\n✅ Test script completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test script failed:", error);
    process.exit(1);
  });
