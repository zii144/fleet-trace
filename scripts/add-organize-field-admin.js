const admin = require("firebase-admin");

// Initialize Firebase Admin SDK
// For development, we'll use the default credentials from environment
// Make sure you have GOOGLE_APPLICATION_CREDENTIALS set up or are running on a machine with default credentials
try {
  admin.initializeApp({
    projectId: "velo-trace",
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.log(
    "ℹ️  Firebase Admin already initialized or using default credentials"
  );
}

const db = admin.firestore();

async function addOrganizeFieldToQuestionnaires() {
  try {
    console.log("🔄 Starting migration to add organize field...");

    // Get all questionnaires
    const snapshot = await db.collection("questionnaires").get();
    console.log(`📋 Found ${snapshot.size} questionnaires to update`);

    const batch = db.batch();
    let updateCount = 0;

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Check if organize field already exists
      if (!data.organize) {
        console.log(`📝 Preparing update for questionnaire: ${data.title}`);

        // Add to batch update
        batch.update(doc.ref, {
          organize: "交通部運輸研究所",
        });
        updateCount++;
      } else {
        console.log(
          `⏭️  Questionnaire "${data.title}" already has organize field: ${data.organize}`
        );
      }
    });

    if (updateCount > 0) {
      console.log(
        `🚀 Executing batch update for ${updateCount} questionnaires...`
      );
      await batch.commit();
      console.log("🎉 Migration completed successfully!");
    } else {
      console.log("ℹ️  No questionnaires needed updating");
    }
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
addOrganizeFieldToQuestionnaires();
