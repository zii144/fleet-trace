/**
 * Data Migration Script for Enhanced Questionnaire Tracking
 *
 * This script helps migrate existing questionnaire responses to include
 * the new enhanced tracking fields. Run this script to update existing
 * Firebase documents with default values for the new fields.
 */

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  getDoc,
} = require("firebase/firestore");

// Firebase configuration (replace with your actual config)
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

async function migrateQuestionnaireData() {
  console.log("🚀 Starting questionnaire data migration...");

  try {
    // Get all questionnaire responses
    const responsesRef = collection(db, "questionnaire_responses");
    const querySnapshot = await getDocs(responsesRef);

    console.log(
      `📊 Found ${querySnapshot.size} questionnaire responses to migrate`
    );

    let migratedCount = 0;
    let skippedCount = 0;

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();

      // Check if document already has enhanced fields
      if (data.totalCharactersWritten !== undefined) {
        console.log(`⏭️  Skipping ${docSnap.id} - already migrated`);
        skippedCount++;
        continue;
      }

      // Calculate enhanced fields based on existing data
      const responses = data.responses || {};

      // Calculate total characters written
      const totalCharactersWritten = Object.values(responses).reduce(
        (sum, value) => {
          if (typeof value === "string") {
            return sum + value.length;
          }
          return sum;
        },
        0
      );

      // Calculate response type counts
      let textResponsesCount = 0;
      let mapSelectionsCount = 0;

      Object.values(responses).forEach((value) => {
        if (typeof value === "string" && value.trim().length > 0) {
          textResponsesCount++;
        } else if (typeof value === "object" && value !== null) {
          mapSelectionsCount++;
        }
      });

      // Default values for fields that can't be calculated retroactively
      const enhancedFields = {
        totalCharactersWritten,
        timeSpentSeconds: 300, // Default to 5 minutes
        deviceType: "desktop", // Default to desktop
        completionPercentage: data.completedSections
          ? (data.completedSections.length / 6) * 100
          : 100,
        revisitCount: 0,
        interactionCount: Object.keys(responses).length,
        textResponsesCount,
        mapSelectionsCount,
        averageTimePerQuestion: 50, // Default to 50 seconds per question
        qualityScore: 75, // Default quality score
      };

      // Update the document
      await updateDoc(
        doc(db, "questionnaire_responses", docSnap.id),
        enhancedFields
      );

      console.log(
        `✅ Migrated ${docSnap.id} - added ${
          Object.keys(enhancedFields).length
        } fields`
      );
      migratedCount++;
    }

    console.log("\n🎉 Migration completed successfully!");
    console.log(`✅ Migrated: ${migratedCount} documents`);
    console.log(`⏭️  Skipped: ${skippedCount} documents (already migrated)`);
    console.log(
      `📊 Total processed: ${migratedCount + skippedCount} documents`
    );
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  }
}

// Helper function to verify migration
async function verifyMigration() {
  console.log("🔍 Verifying migration...");

  try {
    const responsesRef = collection(db, "questionnaire_responses");
    const querySnapshot = await getDocs(responsesRef);

    let migratedCount = 0;
    let unmigrated = [];

    for (const docSnap of querySnapshot.docs) {
      const data = docSnap.data();

      if (data.totalCharactersWritten !== undefined) {
        migratedCount++;
      } else {
        unmigrated.push(docSnap.id);
      }
    }

    console.log(
      `✅ Verified: ${migratedCount}/${querySnapshot.size} documents have enhanced fields`
    );

    if (unmigrated.length > 0) {
      console.log(`⚠️  Unmigrated documents: ${unmigrated.join(", ")}`);
    }

    return {
      total: querySnapshot.size,
      migrated: migratedCount,
      unmigrated: unmigrated.length,
    };
  } catch (error) {
    console.error("❌ Verification failed:", error);
    throw error;
  }
}

// Main execution
async function main() {
  const command = process.argv[2];

  if (command === "verify") {
    await verifyMigration();
  } else if (command === "migrate") {
    await migrateQuestionnaireData();
  } else {
    console.log("Usage:");
    console.log(
      "  node scripts/migrate-questionnaire-data.js migrate  - Run migration"
    );
    console.log(
      "  node scripts/migrate-questionnaire-data.js verify   - Verify migration"
    );
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateQuestionnaireData, verifyMigration };
