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

// Debug: Log Firebase configuration (without sensitive data)
console.log("🔧 Firebase Config Debug:", {
  hasApiKey: !!firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  hasAppId: !!firebaseConfig.appId,
  configComplete: Object.values(firebaseConfig).every(
    (val) => val && val !== "undefined"
  ),
});

// Check if all required config values are present
const missingConfig = Object.entries(firebaseConfig).filter(
  ([key, value]) => !value || value === "undefined"
);

if (missingConfig.length > 0) {
  console.error(
    "❌ Missing Firebase configuration:",
    missingConfig.map(([key]) => key)
  );
  console.error(
    "Please check your .env file and ensure all Firebase config values are set."
  );
  process.exit(1);
}

async function testFirebaseConnection() {
  try {
    console.log("🚀 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    console.log("✅ Firebase app initialized successfully");

    console.log("🔗 Initializing Firestore...");
    const db = getFirestore(app);
    console.log("✅ Firestore initialized successfully");

    console.log("🧪 Testing Firestore connection...");

    // Try to access a collection (this will test the connection)
    const testCollection = collection(db, "test");
    console.log("✅ Firestore collection access test passed");

    console.log("🎉 Firebase connection test completed successfully!");
    return true;
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
    return false;
  }
}

// Run the test
testFirebaseConnection()
  .then((success) => {
    if (success) {
      console.log(
        "✅ Ready to proceed with route completion tracking initialization"
      );
      process.exit(0);
    } else {
      console.log("❌ Cannot proceed due to Firebase connection issues");
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
