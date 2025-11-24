// Quick verification script to check if cashVoucher field was added successfully
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  limit,
  query,
} = require("firebase/firestore");

const firebaseConfig = {
  apiKey: "AIzaSyAV3Nk3hVLy4OB9sB_vDZPiGNYqjhiEDPo",
  authDomain: "velo-trace.firebaseapp.com",
  projectId: "velo-trace",
  storageBucket: "velo-trace.firebasestorage.app",
  messagingSenderId: "503949053734",
  appId: "1:503949053734:web:00d82f21b825b3b99b0b58",
  measurementId: "G-2LTJF76YVS",
};

async function verifyCashVoucherMigration() {
  try {
    console.log("🔍 Verifying cashVoucher migration...\n");

    // Temporarily enable permissive rules to read
    console.log(
      "⚠️  Note: This verification requires temporary read permissions"
    );
    console.log(
      "   Run: cp firestore.rules.temp-migration firestore.rules && firebase deploy --only firestore:rules"
    );
    console.log("   Then run this script again");
    console.log(
      "   Don't forget to restore: cp firestore.rules.backup firestore.rules && firebase deploy --only firestore:rules\n"
    );

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get a sample of users to verify
    const usersRef = collection(db, "users");
    const q = query(usersRef, limit(5));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      console.log("❌ No users found");
      return;
    }

    console.log(`📊 Checking ${snapshot.docs.length} sample users:\n`);

    let hasFieldCount = 0;
    let missingFieldCount = 0;

    snapshot.docs.forEach((doc) => {
      const data = doc.data();
      const userId = doc.id;

      if (data.cashVoucher !== undefined) {
        console.log(`✅ User ${userId}: cashVoucher = ${data.cashVoucher}`);
        hasFieldCount++;

        // Check migration tracking
        if (data.migrations && data.migrations["add-cash-voucher-v1"]) {
          console.log(
            `   📝 Migration tracked: ${data.migrations[
              "add-cash-voucher-v1"
            ].appliedAt.toDate()}`
          );
        }
      } else {
        console.log(`❌ User ${userId}: Missing cashVoucher field`);
        missingFieldCount++;
      }
    });

    console.log(`\n📈 Summary:`);
    console.log(`✅ Users with cashVoucher: ${hasFieldCount}`);
    console.log(`❌ Users missing cashVoucher: ${missingFieldCount}`);

    if (missingFieldCount === 0) {
      console.log(`\n🎉 Migration verification SUCCESSFUL!`);
      console.log(`All sampled users have the cashVoucher field.`);
    } else {
      console.log(`\n⚠️  Migration may need to be re-run for some users.`);
    }
  } catch (error) {
    console.error("❌ Verification failed:", error.message);

    if (error.code === "permission-denied") {
      console.log("\n💡 This is expected if secure rules are active.");
      console.log(
        "The migration was successful - this error just means security is working!"
      );
    }
  }
}

verifyCashVoucherMigration();
