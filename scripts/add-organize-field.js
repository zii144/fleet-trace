const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
} = require("firebase/firestore");

// Firebase configuration - Using actual project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBcFOFU8TMJWJV7p-kq3lyBQ4Zh_WKW9HY",
  authDomain: "velo-trace.firebaseapp.com",
  projectId: "velo-trace",
  storageBucket: "velo-trace.firebasestorage.app",
  messagingSenderId: "313996997364",
  appId: "1:313996997364:web:4363db1aaff7664ba924a1",
  measurementId: "G-YC5FE9CK1F",
};

console.log("🔧 Firebase Config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
});

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addOrganizeFieldToQuestionnaires() {
  try {
    console.log("🔄 Starting migration to add organize field...");

    // Get all questionnaires
    const querySnapshot = await getDocs(collection(db, "questionnaires"));
    console.log(`📋 Found ${querySnapshot.size} questionnaires to update`);

    for (const docSnapshot of querySnapshot.docs) {
      const data = docSnapshot.data();

      // Check if organize field already exists
      if (!data.organize) {
        console.log(`📝 Updating questionnaire: ${data.title}`);

        // Update document with organize field
        await updateDoc(doc(db, "questionnaires", docSnapshot.id), {
          organize: "交通部運輸研究所",
        });

        console.log(`✅ Updated questionnaire: ${docSnapshot.id}`);
      } else {
        console.log(
          `⏭️  Questionnaire ${data.title} already has organize field: ${data.organize}`
        );
      }
    }

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  }
}

// Run the migration
addOrganizeFieldToQuestionnaires();
