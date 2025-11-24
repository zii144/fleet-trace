// Test script to debug Firestore permissions and authentication
import { auth, db } from "./lib/firebase.js";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

console.log("🔐 Testing Firestore permissions and authentication...");

// Check current authentication state
const currentUser = auth.currentUser;
console.log(
  "Current user:",
  currentUser
    ? {
        uid: currentUser.uid,
        email: currentUser.email,
        emailVerified: currentUser.emailVerified,
      }
    : "No authenticated user"
);

if (!currentUser) {
  console.log(
    "❌ No authenticated user - this explains the permissions error!"
  );
  console.log("💡 User must be signed in to write to user_info collection");
} else {
  console.log("✅ User is authenticated");

  // Test writing to user_info collection
  const testUserInfo = {
    id: `${currentUser.uid}-test-${Date.now()}`,
    userId: currentUser.uid,
    name: "Test User",
    gender: "測試",
    genderDescription: "",
    birthDate: "1990-01-01",
    city: "測試城市",
    submittedAt: new Date().toISOString(),
    questionnaireId: "self-info-survey",
    responseId: "test-response",
    isValid: true,
    lastUpdatedAt: new Date().toISOString(),
    voucherEligible: true,
    voucherAmount: 50,
  };

  try {
    console.log("🧪 Testing write to user_info collection...");
    await setDoc(doc(db, "user_info", testUserInfo.id), {
      ...testUserInfo,
      submittedAt: serverTimestamp(),
      lastUpdatedAt: serverTimestamp(),
    });
    console.log("✅ Successfully wrote to user_info collection!");
    console.log("🎉 Permissions are working correctly");
  } catch (error) {
    console.log("❌ Failed to write to user_info collection:", error.message);
    console.log("🔍 This suggests a permissions or authentication issue");
  }
}

console.log("\n📋 Debugging checklist:");
console.log("1. ✅ Firestore rules have been updated and deployed");
console.log("2. ❓ Check if user is properly authenticated");
console.log("3. ❓ Verify userId matches authenticated user");
console.log(
  "4. ❓ Ensure user document exists in /users collection (for admin check)"
);
