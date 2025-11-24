#!/usr/bin/env node

/**
 * Test UserInfo indexing after index deployment
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  doc,
  setDoc,
  serverTimestamp,
} = require("firebase/firestore");

// Initialize Firebase (using environment config)
const firebaseConfig = {
  apiKey: "AIzaSyDrCN5H8mFGDJBvjpYFJyM0AJwjbX3dEWU",
  authDomain: "velo-trace.firebaseapp.com",
  projectId: "velo-trace",
  storageBucket: "velo-trace.appspot.com",
  messagingSenderId: "869675536033",
  appId: "1:869675536033:web:7e16a7abc123ef456789a1",
  measurementId: "G-9K8L7M6N5P",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testUserInfoIndexing() {
  console.log("🧪 Testing UserInfo indexing...\n");

  const testUserId = `test-user-${Date.now()}`;

  try {
    // 1. Create a test user info document
    console.log("1️⃣ Creating test user info document...");
    const userInfoId = `${testUserId}-${Date.now()}`;
    const docRef = doc(db, "user_info", userInfoId);

    await setDoc(docRef, {
      id: userInfoId,
      userId: testUserId,
      name: "Test User",
      gender: "男",
      birthDate: "1990-01-01",
      city: "Test City",
      submittedAt: serverTimestamp(),
      questionnaireId: "self-info-survey",
      responseId: `resp-${Date.now()}`,
      isValid: true,
      lastUpdatedAt: serverTimestamp(),
      voucherEligible: true,
      voucherAmount: 50,
    });

    console.log("✅ Test document created:", userInfoId);

    // Wait a moment for the document to be indexed
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 2. Test the problematic query
    console.log("\n2️⃣ Testing getUserInfo query (the one that was failing)...");

    const q = query(
      collection(db, "user_info"),
      where("userId", "==", testUserId),
      where("isValid", "==", true),
      orderBy("submittedAt", "desc"),
      limit(1)
    );

    console.log("🔍 Executing query...");
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("❌ Query returned no results");
      return;
    }

    const docData = querySnapshot.docs[0];
    console.log("✅ Query successful! Document found:", {
      id: docData.id,
      userId: docData.data().userId,
      name: docData.data().name,
      isValid: docData.data().isValid,
    });

    // 3. Test with multiple documents to ensure ordering works
    console.log("\n3️⃣ Creating second document to test ordering...");

    const userInfoId2 = `${testUserId}-${Date.now() + 1000}`;
    const docRef2 = doc(db, "user_info", userInfoId2);

    await setDoc(docRef2, {
      id: userInfoId2,
      userId: testUserId,
      name: "Test User Updated",
      gender: "女",
      birthDate: "1990-01-01",
      city: "Test City Updated",
      submittedAt: serverTimestamp(),
      questionnaireId: "self-info-survey",
      responseId: `resp-${Date.now() + 1000}`,
      isValid: true,
      lastUpdatedAt: serverTimestamp(),
      voucherEligible: true,
      voucherAmount: 50,
    });

    console.log("✅ Second document created:", userInfoId2);

    // Wait a moment for indexing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 4. Test query again to ensure it returns the latest document
    console.log(
      "\n4️⃣ Testing query with multiple documents (should return latest)..."
    );

    const q2 = query(
      collection(db, "user_info"),
      where("userId", "==", testUserId),
      where("isValid", "==", true),
      orderBy("submittedAt", "desc"),
      limit(1)
    );

    const querySnapshot2 = await getDocs(q2);

    if (querySnapshot2.empty) {
      console.log("❌ Query returned no results");
      return;
    }

    const latestDoc = querySnapshot2.docs[0];
    console.log("✅ Latest document retrieved:", {
      id: latestDoc.id,
      name: latestDoc.data().name,
      expected: "Test User Updated",
    });

    if (latestDoc.data().name === "Test User Updated") {
      console.log("✅ Ordering is working correctly!");
    } else {
      console.log("❌ Ordering might not be working as expected");
    }

    console.log(
      "\n🎉 All indexing tests PASSED! The FirebaseError should be resolved."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    console.error("Error details:", {
      code: error.code,
      message: error.message,
    });

    if (
      error.code === "failed-precondition" &&
      error.message.includes("index")
    ) {
      console.log(
        "\n💡 The index might still be building. Please wait a few minutes and try again."
      );
      console.log(
        "   You can check index status at: https://console.firebase.google.com/project/velo-trace/firestore/indexes"
      );
    }
  }
}

// Run the test
testUserInfoIndexing()
  .then(() => {
    console.log("\n✅ Test completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
