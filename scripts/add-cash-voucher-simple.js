// Simple migration script for adding cashVoucher field to users
// Uses Firebase client SDK with explicit configuration
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  updateDoc,
  doc,
  writeBatch,
} = require("firebase/firestore");

// Firebase configuration - matches your existing config
const firebaseConfig = {
  apiKey: "AIzaSyAV3Nk3hVLy4OB9sB_vDZPiGNYqjhiEDPo",
  authDomain: "velo-trace.firebaseapp.com",
  projectId: "velo-trace",
  storageBucket: "velo-trace.firebasestorage.app",
  messagingSenderId: "503949053734",
  appId: "1:503949053734:web:00d82f21b825b3b99b0b58",
  measurementId: "G-2LTJF76YVS",
};

async function addCashVoucherToUsers() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("🚀 User Migration Tool - Add cashVoucher Field");
  console.log("=============================================\n");
  console.log(
    `Mode: ${dryRun ? "🔍 DRY RUN (Preview Only)" : "✅ LIVE MIGRATION"}\n`
  );

  try {
    // Initialize Firebase
    console.log("🔥 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // Get all users
    console.log("👥 Fetching all users...");
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs;

    console.log(`📊 Found ${users.length} users to process\n`);

    if (users.length === 0) {
      console.log("✅ No users found. Migration complete.");
      return;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    // Process users in batches
    const batchSize = 100;
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchUsers = users.slice(i, i + batchSize);
      let batchUpdates = 0;

      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}...`);

      for (const userDoc of batchUsers) {
        try {
          const userId = userDoc.id;
          const userData = userDoc.data();

          // Check if cashVoucher already exists
          if (userData.cashVoucher !== undefined) {
            console.log(
              `⏭️  User ${userId}: cashVoucher already exists (${userData.cashVoucher})`
            );
            skipped++;
            continue;
          }

          // Prepare update data
          const updateData = {
            cashVoucher: 0,
            updatedAt: new Date(),
            migrations: {
              ...userData.migrations,
              "add-cash-voucher-v1": {
                appliedAt: new Date(),
                version: "1.0.0",
              },
            },
          };

          if (dryRun) {
            console.log(
              `✅ [DRY RUN] Would update user ${userId}: Add cashVoucher: 0`
            );
            updated++;
          } else {
            batch.update(doc(db, "users", userId), updateData);
            batchUpdates++;
            updated++;
            console.log(`✅ User ${userId}: Will add cashVoucher: 0`);
          }
        } catch (error) {
          console.error(`❌ Error processing user ${userDoc.id}:`, error);
          errors++;
        }
      }

      // Commit batch if not dry run
      if (!dryRun && batchUpdates > 0) {
        await batch.commit();
        console.log(
          `💾 Committed batch ${
            Math.floor(i / batchSize) + 1
          } (${batchUpdates} updates)`
        );
      }
    }

    // Summary
    console.log("\n🎉 Migration Summary:");
    console.log("====================");
    console.log(`📈 Users updated: ${updated}`);
    console.log(`⏭️  Users skipped: ${skipped}`);
    console.log(`❌ Errors: ${errors}`);
    console.log(`📊 Total processed: ${users.length}`);

    if (dryRun) {
      console.log("\n🔍 This was a dry run. No changes were made.");
      console.log("To apply changes, run: npm run add-cash-voucher:live");
    } else {
      console.log("\n✅ Migration completed successfully!");
      console.log("All users now have the cashVoucher field.");
    }
  } catch (error) {
    console.error("💥 Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
addCashVoucherToUsers();
