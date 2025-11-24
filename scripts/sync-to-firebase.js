#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });

// Simple KML configuration for backup (in case import fails)
const KML_FILES = [
  // Round Island Routes
  {
    id: "route-1",
    filename: "route-1.kml",
    name: "環島 1 號線",
    category: "round-island",
    url: "/kml/route-1.kml",
    color: "#ff6b6b",
    visible: true,
  },
  {
    id: "route-1-1",
    filename: "route-1-1.kml",
    name: "環島 1-1 號線",
    category: "round-island",
    url: "/kml/route-1-1.kml",
    color: "#ff6b6b",
    visible: true,
  },
  {
    id: "route-1-2",
    filename: "route-1-2.kml",
    name: "環島 1-2 號線",
    category: "round-island",
    url: "/kml/route-1-2.kml",
    color: "#4ecdc4",
    visible: false,
  },
  {
    id: "route-1-3",
    filename: "route-1-3.kml",
    name: "環島 1-3 號線",
    category: "round-island",
    url: "/kml/route-1-3.kml",
    color: "#45b7d1",
    visible: false,
  },
  {
    id: "route-1-4",
    filename: "route-1-4.kml",
    name: "環島 1-4 號線",
    category: "round-island",
    url: "/kml/route-1-4.kml",
    color: "#96ceb4",
    visible: false,
  },
  {
    id: "route-1-5",
    filename: "route-1-5.kml",
    name: "環島 1-5 號線",
    category: "round-island",
    url: "/kml/route-1-5.kml",
    color: "#feca57",
    visible: false,
  },
  {
    id: "route-1-6",
    filename: "route-1-6.kml",
    name: "環島 1-6 號線",
    category: "round-island",
    url: "/kml/route-1-6.kml",
    color: "#ff9ff3",
    visible: false,
  },
  {
    id: "route-1-7",
    filename: "route-1-7.kml",
    name: "環島 1-7 號線",
    category: "round-island",
    url: "/kml/route-1-7.kml",
    color: "#54a0ff",
    visible: false,
  },
  {
    id: "route-1-10",
    filename: "route-1-10.kml",
    name: "環島 1-10 號線",
    category: "round-island",
    url: "/kml/route-1-10.kml",
    color: "#5f27cd",
    visible: false,
  },
  {
    id: "route-1-11",
    filename: "route-1-11.kml",
    name: "環島 1-11 號線",
    category: "round-island",
    url: "/kml/route-1-11.kml",
    color: "#00d2d3",
    visible: false,
  },
  {
    id: "route-1-13",
    filename: "route-1-13.kml",
    name: "環島 1-13 號線",
    category: "round-island",
    url: "/kml/route-1-13.kml",
    color: "#ff6348",
    visible: false,
  },
  {
    id: "route-1-15",
    filename: "route-1-15.kml",
    name: "環島 1-15 號線",
    category: "round-island",
    url: "/kml/route-1-15.kml",
    color: "#2ed573",
    visible: false,
  },
  {
    id: "route-1-18",
    filename: "route-1-18.kml",
    name: "環島 1-18 號線",
    category: "round-island",
    url: "/kml/route-1-18.kml",
    color: "#ffa502",
    visible: false,
  },
  {
    id: "route-1-19",
    filename: "route-1-19.kml",
    name: "環島 1-19 號線",
    category: "round-island",
    url: "/kml/route-1-19.kml",
    color: "#3742fa",
    visible: false,
  },
  {
    id: "route-1-20",
    filename: "route-1-20.kml",
    name: "環島 1-20 號線",
    category: "round-island",
    url: "/kml/route-1-20.kml",
    color: "#2f3542",
    visible: false,
  },
  {
    id: "route-1-replace-t-l",
    filename: "route-1-replace-t-l.kml",
    name: "環1替代路線(土城-龍潭)",
    category: "round-island",
    url: "/kml/route-1-replace-t-l.kml",
    color: "#2f3542",
    visible: false,
  },
  {
    id: "route-1-replace-s-q",
    filename: "route-1-replace-s-q.kml",
    name: "環1替代路線(松山-七堵)",
    category: "round-island",
    url: "/kml/route-1-replace-s-q.kml",
    color: "#2f3542",
    visible: false,
  },
  {
    id: "route-1-2-replace-g-g",
    filename: "route-1-2-replace-g-g.kml",
    name: "環1-2替代路線(高原-關西)",
    category: "round-island",
    url: "/kml/route-1-2-replace-g-g.kml",
    color: "#4ecdc4",
    visible: false,
  },
  // Diverse Routes
  {
    id: "route-chiayi-sugarrail",
    filename: "route-chiayi-sugarrail.kml",
    name: "嘉義糖鐵、夕鹽",
    category: "diverse",
    url: "/kml/route-chiayi-sugarrail.kml",
    color: "#ff6b6b",
    visible: false,
  },
  {
    id: "route-dapengbay",
    filename: "route-dapengbay.kml",
    name: "大鵬灣",
    category: "diverse",
    url: "/kml/route-dapengbay.kml",
    color: "#2f3542",
    visible: false,
  },
  {
    id: "route-gamalan",
    filename: "route-gamalan.kml",
    name: "噶瑪蘭",
    category: "diverse",
    url: "/kml/route-gamalan.kml",
    color: "#2f3542",
    visible: false,
  },
  {
    id: "route-guashan-triathlon",
    filename: "route-guashan-triathlon.kml",
    name: "卦山三鐵",
    category: "diverse",
    url: "/kml/route-guashan-triathlon.kml",
    color: "#4ecdc4",
    visible: false,
  },
  {
    id: "route-hot-spring",
    filename: "route-hot-spring.kml",
    name: "溫泉巡禮、板塊騎遇、森林遊蹤",
    category: "diverse",
    url: "/kml/route-hot-spring.kml",
    color: "#4ecdc4",
    visible: false,
  },
  {
    id: "route-huangginsanhai",
    filename: "route-huangginsanhai.kml",
    name: "黃金山海",
    category: "diverse",
    url: "/kml/route-huangginsanhai.kml",
    color: "#45b7d1",
    visible: false,
  },
  {
    id: "route-huilan-wave",
    filename: "route-huilan-wave.kml",
    name: "洄瀾漫波",
    category: "diverse",
    url: "/kml/route-huilan-wave.kml",
    color: "#96ceb4",
    visible: false,
  },
  {
    id: "route-indigenous",
    filename: "route-indigenous.kml",
    name: "原鄉尋音、波光稻浪、觀山親水",
    category: "diverse",
    url: "/kml/route-indigenous.kml",
    color: "#feca57",
    visible: false,
  },
  {
    id: "route-jhudao",
    filename: "route-jhudao.kml",
    name: "菊島",
    category: "diverse",
    url: "/kml/route-jhudao.kml",
    color: "#ff9ff3",
    visible: false,
  },
  {
    id: "route-kaohsiung-hill",
    filename: "route-kaohsiung-hill.kml",
    name: "高雄山城",
    category: "diverse",
    url: "/kml/route-kaohsiung-hill.kml",
    color: "#54a0ff",
    visible: false,
  },
  {
    id: "route-lingbo-guantian",
    filename: "route-lingbo-guantian.kml",
    name: "菱波官田",
    category: "diverse",
    url: "/kml/route-lingbo-guantian.kml",
    color: "#5f27cd",
    visible: false,
  },
  {
    id: "route-madaochenggong",
    filename: "route-madaochenggong.kml",
    name: "馬到成功",
    category: "diverse",
    url: "/kml/route-madaochenggong.kml",
    color: "#00d2d3",
    visible: false,
  },
  {
    id: "route-shitou",
    filename: "route-shitou.kml",
    name: "獅頭山",
    category: "diverse",
    url: "/kml/route-shitou.kml",
    color: "#ff6348",
    visible: false,
  },
  {
    id: "route-sunmoonlake",
    filename: "route-sunmoonlake.kml",
    name: "日月潭",
    category: "diverse",
    url: "/kml/route-sunmoonlake.kml",
    color: "#2ed573",
    visible: false,
  },
  {
    id: "route-taijiang",
    filename: "route-taijiang.kml",
    name: "台江",
    category: "diverse",
    url: "/kml/route-taijiang.kml",
    color: "#ffa502",
    visible: false,
  },
];

// Questionnaire configurations (using KML_FILES defined above)
// Dynamic questionnaire generation function (mirroring lib/questionnaire.ts)
function generateDefaultQuestionnaires() {
  return [
    {
      id: "cycling-experience",
      title: "騎行體驗問卷",
      description: "評估您的騎行體驗和安全感受",
      estimatedTime: 5,
      sections: [
        {
          id: "general-info",
          title: "基本資訊",
          description: "關於您的基本騎行資訊",
          questions: [
            {
              id: "age-group",
              type: "single-choice",
              title: "年齡層",
              subtitle: "請選擇您的年齡層",
              required: true,
              options: [
                { id: "under-18", label: "18歲以下" },
                { id: "18-25", label: "18-25歲" },
                { id: "26-35", label: "26-35歲" },
                { id: "36-45", label: "36-45歲" },
                { id: "46-55", label: "46-55歲" },
                { id: "over-55", label: "55歲以上" },
              ],
            },
          ],
        },
        {
          id: "route-experience",
          title: "路線體驗",
          description: "針對特定路線的騎行體驗",
          questions: [
            {
              id: "route-selection",
              type: "map",
              title: "路線選擇",
              subtitle: "請在地圖上選擇您騎過的路線，並提供相關體驗",
              required: true,
              kmlFiles: KML_FILES.map((kml) => ({
                id: kml.id,
                name: kml.name,
                filename: kml.filename,
                url: kml.url,
                color: kml.color,
                visible: kml.visible,
                category: kml.category,
              })),
              followUpQuestions: [
                {
                  id: "safety-rating",
                  type: "rating",
                  title: "安全評分",
                  subtitle: "請為這條路線的安全性評分",
                  required: true,
                  scale: 5,
                  minLabel: "非常不安全",
                  maxLabel: "非常安全",
                },
                {
                  id: "experience-rating",
                  type: "rating",
                  title: "騎行體驗",
                  subtitle: "請為這條路線的整體騎行體驗評分",
                  required: true,
                  scale: 5,
                  minLabel: "非常差",
                  maxLabel: "非常好",
                },
                {
                  id: "feedback",
                  type: "text",
                  title: "意見回饋",
                  subtitle: "請分享您對這條路線的詳細意見或建議",
                  required: false,
                  placeholder: "例如：路況、標示、安全設施等...",
                },
              ],
            },
          ],
        },
      ],
    },
  ];
}

// Try to get dynamic questionnaires, fallback to generated ones
function getQuestionnaires() {
  try {
    // Try to use the imported function first
    return getDefaultQuestionnaires();
  } catch (error) {
    console.log(
      "⚠️  Unable to import dynamic questionnaires, generating locally"
    );
    return generateDefaultQuestionnaires();
  }
}

// Import questionnaire function
let getDefaultQuestionnaires;
try {
  const questionnaireModule = require("../lib/questionnaire.ts");
  getDefaultQuestionnaires = questionnaireModule.getDefaultQuestionnaires;
} catch (error) {
  console.log(
    "⚠️  Could not import questionnaire module, will use local generation"
  );
}

const DEFAULT_QUESTIONNAIRES = [
  {
    id: "cycling-survey-2025",
    title: "「環島自行車路線」使用情形及滿意度問卷",
    description:
      "本問卷目的在了解您曾經騎乘或本次騎乘「環島自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
    version: "1.0.0",
    organize: "交通部運輸研究所",
    createdAt: "2025-07-03T00:00:00+08:00",
    updatedAt: "2025-07-03T00:00:00+08:00",
    sections: [
      {
        id: "basic-info",
        title: "受訪者基本資料",
        questions: [
          {
            id: "gender",
            type: "radio",
            label: "您的性別",
            required: true,
            options: ["男", "女", "其他"],
          },
          {
            id: "age",
            type: "radio",
            label: "您的年齡",
            required: true,
            options: [
              "12歲以下",
              "13~20歲",
              "21~30歲",
              "31~40歲",
              "41~50歲",
              "51~60歲",
              "61~64歲",
              "65歲以上",
            ],
          },
          {
            id: "city",
            type: "select",
            label: "您居住的縣市",
            required: true,
            options: [
              "新北市",
              "宜蘭縣",
              "花蓮縣",
              "臺東縣",
              "基隆市",
              "臺北市",
              "桃園市",
              "苗栗縣",
              "新竹縣",
              "新竹市",
              "臺中市",
              "彰化縣",
              "雲林縣",
              "南投縣",
              "嘉義縣",
              "嘉義市",
              "臺南市",
              "高雄市",
              "屏東縣",
              "澎湖縣",
              "金門縣",
              "連江縣",
              "外國",
            ],
          },
        ],
      },
      {
        id: "route-usage",
        title: "環島自行車路線騎乘情形",
        questions: [
          {
            id: "recent-route",
            type: "map",
            label: "請選擇一年內曾騎乘過的環島自行車路線",
            required: true,
            options: [], // Empty options array for map type
            defaultCenter: [23.8, 121.0],
            defaultZoom: 7,
            showLayerControl: true,
            kmlFiles: KML_FILES.filter(
              (kml) => kml.category === "round-island"
            ),
          },
          {
            id: "recent-route-date",
            type: "time",
            label: "最近一次騎乘該路線的時間",
            timeFormat: "YYYY-MM",
            required: true,
            minDate: "2020-01",
            maxDate: "2025-12",
          },
        ],
      },
    ],
  },
  {
    id: "diverse-cycling-survey-2025",
    title: "「多元自行車路線」使用情形及滿意度問卷",
    description:
      "本問卷目的在了解您曾經騎乘或本次騎乘「多元自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
    version: "1.0.0",
    organize: "交通部運輸研究所",
    createdAt: "2025-07-03T00:00:00+08:00",
    updatedAt: "2025-07-03T00:00:00+08:00",
    sections: [
      {
        id: "basic-info",
        title: "受訪者基本資料",
        questions: [
          {
            id: "recent-route",
            type: "map",
            label: "請選擇一條您近一年內曾騎乘過的多元自行車路線",
            required: true,
            options: [], // Empty options array for map type
            defaultCenter: [23.8, 121.0],
            defaultZoom: 7,
            showLayerControl: true,
            kmlFiles: KML_FILES.filter((kml) => kml.category === "diverse"),
          },
          {
            id: "recent-route-date",
            type: "time",
            label: "最近一次騎乘該路線的時間",
            timeFormat: "YYYY-MM",
            required: true,
            minDate: "2020-01",
            maxDate: "2025-12",
          },
        ],
      },
    ],
  },
];

async function syncToFirebase() {
  console.log("🔍 Starting questionnaire sync process...\n");

  const CLOUD_FUNCTION_URL = process.env.SYNC_CLOUD_FUNCTION_URL;
  const SECRET_KEY = process.env.SYNC_SECRET_KEY;

  if (!CLOUD_FUNCTION_URL || !SECRET_KEY) {
    console.error("❌ Missing environment variables:");
    console.error(
      "  SYNC_CLOUD_FUNCTION_URL:",
      !!CLOUD_FUNCTION_URL ? "✓" : "✗"
    );
    console.error("  SYNC_SECRET_KEY:", !!SECRET_KEY ? "✓" : "✗");
    console.error("\nTo set up the sync system:");
    console.error("1. Copy environment variables:");
    console.error(
      '   echo "SYNC_CLOUD_FUNCTION_URL=https://us-central1-velo-trace.cloudfunctions.net/syncQuestionnaires" >> .env.local'
    );
    console.error(
      '   echo "SYNC_SECRET_KEY=your-secret-key-here" >> .env.local'
    );
    console.error("2. Deploy the cloud function:");
    console.error(
      "   cd functions && npm install && cd .. && firebase deploy --only functions:syncQuestionnaires"
    );
    console.error("3. Run this script again");
    console.error("\n📁 Running in demo mode...");

    // Demo mode - show what would be synced
    console.log("\n🎯 Demo: Data that would be synced to Firebase:");

    let questionnaires;
    try {
      // Try to use dynamic questionnaires
      questionnaires = getQuestionnaires();
      console.log("✅ Using dynamic questionnaire generation");
    } catch (error) {
      // Fallback to local generation if import fails
      questionnaires = generateDefaultQuestionnaires();
      console.log("⚠️  Using local questionnaire generation");
    }

    console.log(`  • Questionnaires: ${questionnaires.length}`);
    questionnaires.forEach((q) => {
      console.log(`    - ${q.id}: ${q.title}`);

      // Show KML files for map questions
      q.sections?.forEach((section) => {
        section.questions?.forEach((question) => {
          if (question.type === "map" && question.kmlFiles) {
            console.log(
              `      📍 Map question has ${question.kmlFiles.length} KML files:`
            );
            question.kmlFiles.slice(0, 3).forEach((kml, idx) => {
              console.log(
                `        ${idx + 1}. ${kml.name} (${kml.filename || kml.id})`
              );
            });
            if (question.kmlFiles.length > 3) {
              console.log(
                `        ... and ${question.kmlFiles.length - 3} more files`
              );
            }
          }
        });
      });
    });
    console.log(`  • KML files: ${KML_FILES.length}`);
    const categories = [...new Set(KML_FILES.map((kml) => kml.category))];
    categories.forEach((category) => {
      const count = KML_FILES.filter((kml) => kml.category === category).length;
      const firstFiles = KML_FILES.filter(
        (kml) => kml.category === category
      ).slice(0, 3);
      console.log(`    - ${category}: ${count} files`);
      console.log(
        `      First 3: ${firstFiles.map((f) => f.filename).join(", ")}`
      );
    });
    console.log(
      `\n📊 Updated totals: ${KML_FILES.length} KML files (including new route-1.kml)`
    );
    console.log(
      "\n✅ Demo completed! Set up the environment variables to enable real syncing."
    );
    process.exit(0);
  }

  try {
    console.log("📁 Validating configuration...");

    let questionnaires;
    try {
      questionnaires = getQuestionnaires();
      console.log("✅ Using dynamic questionnaire generation");
    } catch (error) {
      questionnaires = generateDefaultQuestionnaires();
      console.log("⚠️  Using local questionnaire generation");
    }

    console.log(`  • Questionnaires: ${questionnaires.length}`);
    console.log(`  • KML files: ${KML_FILES.length}`);

    // Step 2: Sync to Firebase
    console.log("\n🚀 Syncing to Firebase...");
    console.log(`  • Endpoint: ${CLOUD_FUNCTION_URL}`);

    const response = await fetch(CLOUD_FUNCTION_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        questionnaires: questionnaires,
        kmlFiles: KML_FILES,
        secretKey: SECRET_KEY,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status}: ${
          result.error || result.message || "Unknown error"
        }`
      );
    }

    if (result.success) {
      console.log("\n✅ Sync completed successfully!");
      console.log(`  • Timestamp: ${result.timestamp}`);
      console.log(`  • Message: ${result.message}`);
      console.log("\n🎉 Ready for deployment!");
    } else {
      throw new Error(result.error || "Unknown sync error");
    }
  } catch (error) {
    console.error("\n❌ Sync failed:", error.message);

    if (error.message.includes("401")) {
      console.error("\n💡 Possible solutions:");
      console.error("  1. Check your SYNC_SECRET_KEY in .env.local");
      console.error("  2. Verify the cloud function is deployed");
      console.error(
        "  3. Ensure the secret key matches the function configuration"
      );
    } else if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("fetch")
    ) {
      console.error("\n💡 Possible solutions:");
      console.error("  1. Check your SYNC_CLOUD_FUNCTION_URL");
      console.error("  2. Verify you have internet connection");
      console.error(
        "  3. Ensure the cloud function is deployed and accessible"
      );
    } else if (error.message.includes("fetch is not defined")) {
      console.error(
        "\n💡 Note: This script requires Node.js 18+ for fetch support"
      );
      console.error("  Or install node-fetch: npm install node-fetch");
    }

    process.exit(1);
  }
}

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n⚠️  Sync interrupted by user");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n⚠️  Sync terminated");
  process.exit(0);
});

// Run the sync
syncToFirebase().catch((error) => {
  console.error("\n💥 Unexpected error:", error.message);
  process.exit(1);
});
