const admin = require("firebase-admin");
const fs = require("fs");

// Initialize Firebase Admin SDK with service account
// For now, let's try with default credentials
try {
  admin.initializeApp({
    projectId: "velo-trace",
  });
  console.log("✅ Firebase Admin initialized successfully");
} catch (error) {
  console.log("ℹ️  Firebase Admin already initialized");
}

const db = admin.firestore();

// Route configuration
const ROUTES = [
  {
    id: "route-1",
    name: "環島 1 號線",
    category: "round-island-main",
    limit: 70,
  },
  {
    id: "route-1-1",
    name: "環島 1-1 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-2",
    name: "環島 1-2 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-3",
    name: "環島 1-3 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-4",
    name: "環島 1-4 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-5",
    name: "環島 1-5 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-6",
    name: "環島 1-6 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-7",
    name: "環島 1-7 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-10",
    name: "環島 1-10 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-11",
    name: "環島 1-11 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-13",
    name: "環島 1-13 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-15",
    name: "環島 1-15 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-18",
    name: "環島 1-18 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-19",
    name: "環島 1-19 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-20",
    name: "環島 1-20 號線",
    category: "round-island",
    limit: 35,
  },
  {
    id: "route-1-replace-t-l",
    name: "環1替代路線(土城-龍潭)",
    category: "round-island-alternative",
    limit: 35,
  },
  {
    id: "route-1-replace-s-q",
    name: "環1替代路線(松山-七堵)",
    category: "round-island-alternative",
    limit: 35,
  },
  {
    id: "route-1-2-replace-g-g",
    name: "環1-2替代路線(高原-關西)",
    category: "round-island-alternative",
    limit: 35,
  },
  {
    id: "route-chiayi-sugarrail",
    name: "嘉義糖鐵、夕鹽",
    category: "diverse",
    limit: 40,
  },
  { id: "route-dapengbay", name: "大鵬灣", category: "diverse", limit: 40 },
  { id: "route-gamalan", name: "噶瑪蘭", category: "diverse", limit: 40 },
  {
    id: "route-guashan-triathlon",
    name: "卦山三鐵",
    category: "diverse",
    limit: 40,
  },
  {
    id: "route-hot-spring",
    name: "溫泉巡禮、板塊騎遇、森林遊蹤",
    category: "diverse",
    limit: 40,
  },
  {
    id: "route-huangginsanhai",
    name: "黃金山海",
    category: "diverse",
    limit: 40,
  },
  { id: "route-huilan-wave", name: "洄瀾漫波", category: "diverse", limit: 40 },
  {
    id: "route-indigenous",
    name: "原鄉尋音、波光稻浪、觀山親水",
    category: "diverse",
    limit: 40,
  },
  { id: "route-jhudao", name: "菊島", category: "diverse", limit: 40 },
  {
    id: "route-kaohsiung-hill",
    name: "高雄山城",
    category: "diverse",
    limit: 40,
  },
  {
    id: "route-lingbo-guantian",
    name: "菱波官田",
    category: "diverse",
    limit: 40,
  },
  {
    id: "route-madaochenggong",
    name: "馬到成功",
    category: "diverse",
    limit: 40,
  },
  { id: "route-shitou", name: "獅頭山", category: "diverse", limit: 40 },
  { id: "route-sunmoonlake", name: "日月潭", category: "diverse", limit: 40 },
  { id: "route-taijiang", name: "台江", category: "diverse", limit: 40 },
];

const QUESTIONNAIRES = [
  "cycling-survey-2025",
  "diverse-cycling-survey-2025",
  "self-info-survey",
];

async function createRouteTrackingData() {
  console.log("🚀 Creating route completion tracking data...");

  let totalCreated = 0;
  let totalErrors = 0;

  for (const questionnaire of QUESTIONNAIRES) {
    console.log(`\n📋 Processing questionnaire: ${questionnaire}`);

    for (const route of ROUTES) {
      try {
        const docId = `${questionnaire}-${route.id}`;

        const trackingData = {
          routeId: route.id,
          routeName: route.name,
          category: route.category,
          questionnaireId: questionnaire,
          completionLimit: route.limit,
          currentCompletions: 0,
          lastUpdated: admin.firestore.Timestamp.now(),
          isActive: true,
          metadata: {
            totalSubmissions: 0,
            uniqueUsers: 0,
          },
        };

        await db
          .collection("route_completion_tracking")
          .doc(docId)
          .set(trackingData);
        console.log(`✅ Created: ${docId} (limit: ${route.limit})`);
        totalCreated++;

        // Small delay to avoid overwhelming Firestore
        await new Promise((resolve) => setTimeout(resolve, 100));
      } catch (error) {
        console.error(
          `❌ Error creating ${questionnaire}-${route.id}:`,
          error.message
        );
        totalErrors++;
      }
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`📊 Created: ${totalCreated} records`);
  console.log(`❌ Errors: ${totalErrors} records`);
  console.log(`📈 Total processed: ${totalCreated + totalErrors} records`);
}

// Run the import
createRouteTrackingData()
  .then(() => {
    console.log("✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
