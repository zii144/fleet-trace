// Debug script to check the actual error and authentication state
console.log("🔍 Debugging Firestore permissions for user_info collection...");

// This should be run in the browser console where Firebase auth is available
if (typeof window !== "undefined") {
  // Get Firebase auth instance
  import("./lib/firebase.js").then(({ auth, db }) => {
    import("firebase/firestore").then(({ doc, setDoc, serverTimestamp }) => {
      console.log("🔐 Current auth state:", {
        currentUser: auth.currentUser
          ? {
              uid: auth.currentUser.uid,
              email: auth.currentUser.email,
              emailVerified: auth.currentUser.emailVerified,
            }
          : null,
      });

      if (!auth.currentUser) {
        console.log(
          "❌ No authenticated user - this explains the permissions error!"
        );
        return;
      }

      // Test minimal user_info write
      const testData = {
        id: `${auth.currentUser.uid}-test-${Date.now()}`,
        userId: auth.currentUser.uid,
        name: "Test",
        gender: "測試",
        genderDescription: "",
        birthDate: "1990-01-01",
        city: "測試",
        submittedAt: new Date().toISOString(),
        questionnaireId: "self-info-survey",
        responseId: "test",
        isValid: true,
        lastUpdatedAt: new Date().toISOString(),
        voucherEligible: true,
        voucherAmount: 50,
      };

      console.log("🧪 Testing write with data:", testData);

      setDoc(doc(db, "user_info", testData.id), {
        ...testData,
        submittedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
      })
        .then(() => {
          console.log("✅ SUCCESS: Write to user_info collection worked!");
        })
        .catch((error) => {
          console.log(
            "❌ FAILED: Write to user_info collection failed:",
            error
          );
          console.log("Error details:", {
            code: error.code,
            message: error.message,
          });
        });
    });
  });
} else {
  console.log("❌ This script must be run in a browser environment");
}

export {};
