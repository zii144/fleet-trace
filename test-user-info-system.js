#!/usr/bin/env node
/**
 * Test script for UserInfo system
 * Tests the submission, retrieval, and voucher claiming functionality
 */

const admin = require("firebase-admin");
const path = require("path");

// Initialize Firebase Admin
if (!admin.apps.length) {
  const serviceAccountPath = path.join(
    __dirname,
    "../service-account-key.json"
  );

  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId:
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
        serviceAccount.project_id,
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing Firebase Admin:", error.message);
    console.log(
      "ℹ️  Make sure service-account-key.json exists in the project root"
    );
    process.exit(1);
  }
}

const db = admin.firestore();

// Test data
const testUserId = "test-user-" + Date.now();
const testUserInfo = {
  userId: testUserId,
  name: "測試用戶",
  gender: "男",
  birthDate: "1990-01-01",
  city: "台北市",
  submittedAt: admin.firestore.FieldValue.serverTimestamp(),
  questionnaireId: "self-info-survey",
  responseId: "test-response-" + Date.now(),
  isValid: true,
  lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
  voucherEligible: true,
  voucherAmount: 50,
};

async function testUserInfoSystem() {
  console.log("🧪 Starting UserInfo system tests...\n");

  try {
    // Test 1: Create user info
    console.log("1️⃣ Testing user info creation...");
    const userInfoRef = await db.collection("user_info").add(testUserInfo);
    console.log(`✅ User info created with ID: ${userInfoRef.id}`);

    // Test 2: Query user info by userId
    console.log("\n2️⃣ Testing user info retrieval...");
    const userInfoQuery = await db
      .collection("user_info")
      .where("userId", "==", testUserId)
      .where("isValid", "==", true)
      .orderBy("submittedAt", "desc")
      .limit(1)
      .get();

    if (!userInfoQuery.empty) {
      const userData = userInfoQuery.docs[0].data();
      console.log("✅ User info retrieved successfully:");
      console.log(`   Name: ${userData.name}`);
      console.log(`   Gender: ${userData.gender}`);
      console.log(`   City: ${userData.city}`);
      console.log(`   Voucher Eligible: ${userData.voucherEligible}`);
    } else {
      throw new Error("User info not found");
    }

    // Test 3: Create voucher claim
    console.log("\n3️⃣ Testing voucher claim creation...");
    const voucherClaim = {
      userId: testUserId,
      userInfoId: userInfoRef.id,
      amount: 50,
      claimedAt: admin.firestore.FieldValue.serverTimestamp(),
      status: "approved",
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    };

    const claimRef = await db.collection("voucher_claims").add(voucherClaim);
    console.log(`✅ Voucher claim created with ID: ${claimRef.id}`);

    // Test 4: Update user info to mark voucher as claimed
    console.log("\n4️⃣ Testing user info update...");
    await userInfoRef.update({
      voucherEligible: false,
      voucherClaimedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ User info updated successfully");

    // Test 5: Query voucher claims
    console.log("\n5️⃣ Testing voucher claims retrieval...");
    const claimsQuery = await db
      .collection("voucher_claims")
      .where("userId", "==", testUserId)
      .orderBy("claimedAt", "desc")
      .get();

    console.log(`✅ Found ${claimsQuery.size} voucher claim(s)`);
    claimsQuery.forEach((doc) => {
      const claimData = doc.data();
      console.log(`   Amount: NT$${claimData.amount}`);
      console.log(`   Status: ${claimData.status}`);
    });

    // Test 6: Test indexes (simulate complex queries)
    console.log("\n6️⃣ Testing Firestore indexes...");

    // Test user_info index
    const indexTest1 = await db
      .collection("user_info")
      .where("userId", "==", testUserId)
      .where("isValid", "==", true)
      .orderBy("submittedAt", "desc")
      .get();
    console.log(`✅ User info index test passed (${indexTest1.size} results)`);

    // Test voucher_claims index
    const indexTest2 = await db
      .collection("voucher_claims")
      .where("userId", "==", testUserId)
      .orderBy("claimedAt", "desc")
      .get();
    console.log(
      `✅ Voucher claims index test passed (${indexTest2.size} results)`
    );

    // Test 7: Statistics aggregation
    console.log("\n7️⃣ Testing statistics aggregation...");
    const [userInfoSnapshot, voucherClaimsSnapshot] = await Promise.all([
      db.collection("user_info").where("isValid", "==", true).get(),
      db.collection("voucher_claims").get(),
    ]);

    const totalUsers = userInfoSnapshot.size;
    const totalVouchersEligible = userInfoSnapshot.docs.filter(
      (doc) => doc.data().voucherEligible && !doc.data().voucherClaimedAt
    ).length;
    const totalVouchersClaimed = voucherClaimsSnapshot.size;
    const totalVoucherAmount = voucherClaimsSnapshot.docs.reduce(
      (sum, doc) => sum + (doc.data().amount || 0),
      0
    );

    console.log("✅ Statistics calculated:");
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Vouchers Eligible: ${totalVouchersEligible}`);
    console.log(`   Vouchers Claimed: ${totalVouchersClaimed}`);
    console.log(`   Total Amount: NT$${totalVoucherAmount}`);

    console.log("\n🎉 All tests passed successfully!");
  } catch (error) {
    console.error("\n❌ Test failed:", error);
    throw error;
  } finally {
    // Cleanup: Remove test data
    console.log("\n🧹 Cleaning up test data...");
    try {
      // Delete user info
      const userInfoQuery = await db
        .collection("user_info")
        .where("userId", "==", testUserId)
        .get();

      const deletePromises = [];
      userInfoQuery.forEach((doc) => {
        deletePromises.push(doc.ref.delete());
      });

      // Delete voucher claims
      const claimsQuery = await db
        .collection("voucher_claims")
        .where("userId", "==", testUserId)
        .get();

      claimsQuery.forEach((doc) => {
        deletePromises.push(doc.ref.delete());
      });

      await Promise.all(deletePromises);
      console.log("✅ Test data cleaned up successfully");
    } catch (cleanupError) {
      console.warn("⚠️ Cleanup error (non-critical):", cleanupError.message);
    }
  }
}

async function testSecurityRules() {
  console.log("\n🔒 Testing security rules...");

  try {
    // Test unauthorized access (should fail)
    console.log("Testing unauthorized access...");

    // This would normally require authenticated context
    // For now, we'll just log that security rules need to be tested manually
    console.log(
      "ℹ️  Security rules should be tested in the frontend with authenticated users"
    );
    console.log("   - Users should only access their own user_info documents");
    console.log("   - Users should only read their own voucher_claims");
    console.log("   - Only admins should be able to read all documents");
  } catch (error) {
    console.log("✅ Unauthorized access properly blocked");
  }
}

// Main execution
async function main() {
  try {
    await testUserInfoSystem();
    await testSecurityRules();

    console.log("\n📋 Manual Testing Checklist:");
    console.log("□ Fill out self-info-survey questionnaire");
    console.log("□ Check that user_info record is created");
    console.log("□ Verify voucher eligibility shows in profile");
    console.log("□ Test voucher claiming functionality");
    console.log("□ Verify admin can see all user info");
    console.log("□ Test security rules with different user roles");
  } catch (error) {
    console.error("💥 Test suite failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { testUserInfoSystem, testSecurityRules };
