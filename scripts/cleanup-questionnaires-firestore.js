// Clean up Firestore questionnaires collection since we're using local data only
const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
} = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV3Nk3hVLy4OB9sB_vDZPiGNYqjhiEDPo",
  authDomain: "velo-trace.firebaseapp.com",
  projectId: "velo-trace",
  storageBucket: "velo-trace.firebasestorage.app",
  messagingSenderId: "503949053734",
  appId: "1:503949053734:web:00d82f21b825b3b99b0b58",
  measurementId: "G-2LTJF76YVS",
};

async function cleanupQuestionnairesCollection() {
  try {
    console.log("🔥 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log("🗑️  Cleaning up questionnaires collection...");
    const questionnairesRef = collection(db, "questionnaires");
    const existingDocs = await getDocs(questionnairesRef);

    if (existingDocs.empty) {
      console.log(
        "✅ No questionnaires found in Firestore - collection is already clean"
      );
      return;
    }

    for (const docSnapshot of existingDocs.docs) {
      await deleteDoc(docSnapshot.ref);
      console.log(`✅ Deleted questionnaire: ${docSnapshot.id}`);
    }

    console.log("🎉 Successfully cleaned up questionnaires collection!");
    console.log(
      "📝 Your app now uses only local questionnaire data from lib/questionnaire.ts"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the cleanup
cleanupQuestionnairesCollection();
