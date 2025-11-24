const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} = require("firebase/firestore");

// Load environment variables from .env.local
require("dotenv").config({ path: ".env.local" });

// Your Firebase config
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

// KML route configuration (simplified version)
const KML_FILES = [
  // Round Island Routes
  { id: "route-1", name: "環島 1 號線", category: "round-island-main" },
  { id: "route-1-1", name: "環島 1-1 號線", category: "round-island" },
  { id: "route-1-2", name: "環島 1-2 號線", category: "round-island" },
  { id: "route-1-3", name: "環島 1-3 號線", category: "round-island" },
  { id: "route-1-4", name: "環島 1-4 號線", category: "round-island" },
  { id: "route-1-5", name: "環島 1-5 號線", category: "round-island" },
  { id: "route-1-6", name: "環島 1-6 號線", category: "round-island" },
  { id: "route-1-7", name: "環島 1-7 號線", category: "round-island" },
  { id: "route-1-10", name: "環島 1-10 號線", category: "round-island" },
  { id: "route-1-11", name: "環島 1-11 號線", category: "round-island" },
  { id: "route-1-13", name: "環島 1-13 號線", category: "round-island" },
  { id: "route-1-15", name: "環島 1-15 號線", category: "round-island" },
  { id: "route-1-18", name: "環島 1-18 號線", category: "round-island" },
  { id: "route-1-19", name: "環島 1-19 號線", category: "round-island" },
  { id: "route-1-20", name: "環島 1-20 號線", category: "round-island" },
  {
    id: "route-1-replace-t-l",
    name: "環1替代路線(土城-龍潭)",
    category: "round-island-alternative",
  },
  {
    id: "route-1-replace-s-q",
    name: "環1替代路線(松山-七堵)",
    category: "round-island-alternative",
  },
  {
    id: "route-1-2-replace-g-g",
    name: "環1-2替代路線(高原-關西)",
    category: "round-island-alternative",
  },

  // Diverse Routes
  { id: "route-chiayi-sugarrail", name: "嘉義糖鐵、夕鹽", category: "diverse" },
  { id: "route-dapengbay", name: "大鵬灣", category: "diverse" },
  { id: "route-gamalan", name: "噶瑪蘭", category: "diverse" },
  { id: "route-guashan-triathlon", name: "卦山三鐵", category: "diverse" },
  {
    id: "route-hot-spring",
    name: "溫泉巡禮、板塊騎遇、森林遊蹤",
    category: "diverse",
  },
  { id: "route-huangginsanhai", name: "黃金山海", category: "diverse" },
  { id: "route-huilan-wave", name: "洄瀾漫波", category: "diverse" },
  {
    id: "route-indigenous",
    name: "原鄉尋音、波光稻浪、觀山親水",
    category: "diverse",
  },
  { id: "route-jhudao", name: "菊島", category: "diverse" },
  { id: "route-kaohsiung-hill", name: "高雄山城", category: "diverse" },
  { id: "route-lingbo-guantian", name: "菱波官田", category: "diverse" },
  { id: "route-madaochenggong", name: "馬到成功", category: "diverse" },
  { id: "route-shitou", name: "獅頭山", category: "diverse" },
  { id: "route-sunmoonlake", name: "日月潭", category: "diverse" },
  { id: "route-taijiang", name: "台江", category: "diverse" },
];

// Questionnaire IDs to initialize
const QUESTIONNAIRE_IDS = [
  "cycling-survey-2025",
  "diverse-cycling-survey-2025",
  "self-info-survey",
];

function getCompletionLimitForCategory(category) {
  switch (category) {
    case "round-island-main":
      return 70; // 環島自行車路線（環島1號）兌換名額度
    case "round-island":
      return 35; // 環島自行車路線（環支線每條35份）
    case "round-island-alternative":
      return 35; // 環島自行車路線（替代路線每條35份）
    case "diverse":
      return 40; // 多元自行車路線（每條40份）
    default:
      return 30; // Default limit for other categories
  }
}

async function checkExistingTracking(routeId, questionnaireId) {
  try {
    const q = query(
      collection(db, "route_completion_tracking"),
      where("routeId", "==", routeId),
      where("questionnaireId", "==", questionnaireId)
    );

    const snapshot = await getDocs(q);
    return !snapshot.empty;
  } catch (error) {
    console.error(`Error checking existing tracking for ${routeId}:`, error);
    return false;
  }
}

async function initializeRouteCompletionTracking() {
  console.log("🚀 Starting route completion tracking initialization...");

  let totalCreated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;

  for (const questionnaireId of QUESTIONNAIRE_IDS) {
    console.log(`\n📋 Processing questionnaire: ${questionnaireId}`);

    for (const route of KML_FILES) {
      try {
        // Create new tracking record directly (skip existence check for now)
        const completionLimit = getCompletionLimitForCategory(route.category);

        const trackingData = {
          routeId: route.id,
          routeName: route.name,
          category: route.category,
          questionnaireId: questionnaireId,
          completionLimit: completionLimit,
          currentCompletions: 0,
          lastUpdated: new Date().toISOString(),
          isActive: true,
          metadata: {
            totalSubmissions: 0,
            uniqueUsers: 0,
          },
        };

        await addDoc(collection(db, "route_completion_tracking"), trackingData);
        console.log(
          `✅ Created tracking for ${route.id} (limit: ${completionLimit})`
        );
        totalCreated++;

        // Small delay to avoid overwhelming Firestore
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `❌ Error creating tracking for ${route.id}:`,
          error.message
        );
        totalErrors++;

        // If we get permission denied, stop trying
        if (error.code === "permission-denied") {
          console.log("🛑 Permission denied - stopping initialization");
          console.log(
            "Please ensure you have admin access or update Firestore security rules"
          );
          break;
        }
      }
    }
  }

  console.log(`\n🎉 Initialization complete!`);
  console.log(`📊 Created: ${totalCreated} tracking records`);
  console.log(`⏭️  Skipped: ${totalSkipped} existing records`);
  console.log(`❌ Errors: ${totalErrors} failed attempts`);
  console.log(`📈 Total processed: ${totalCreated + totalSkipped} records`);
}

// Run the initialization
initializeRouteCompletionTracking()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
