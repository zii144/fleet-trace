#!/usr/bin/env node

/**
 * Update Questionnaires in Firestore Script
 *
 * This script uploads the questionnaires to Firestore with the corrected
 * route-1.kml ordering. Use this when you need to sync the updated questionnaire
 * configuration to the production database.
 */

// Load environment variables first
require("dotenv").config({ path: ".env.local" });

console.log("🔄 Starting Questionnaire Upload to Firestore...");
console.log("=".repeat(60));

// Validate required environment variables
const requiredVars = [
  "NEXT_PUBLIC_FIREBASE_API_KEY",
  "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
  "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
];

const missingVars = requiredVars.filter((varName) => !process.env[varName]);
if (missingVars.length > 0) {
  console.error("❌ Missing required environment variables:");
  missingVars.forEach((varName) => {
    console.error(`  ${varName}: ✗`);
  });
  console.error("\nPlease check your .env.local file");
  process.exit(1);
}

console.log("✅ Environment variables validated");

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} = require("firebase/firestore");

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

console.log(`🔧 Connecting to Firebase project: ${firebaseConfig.projectId}`);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Import the corrected questionnaires (embedded data with route-1.kml first)
async function getUpdatedQuestionnaires() {
  console.log(`📋 Loading questionnaires with corrected KML ordering...`);

  // KML files with route-1.kml positioned FIRST
  const roundIslandKML = [
    {
      id: "route-1",
      name: "環島 1 號線",
      url: "/kml/route-1.kml",
      visible: true,
      color: "#ff6b6b",
    },
    {
      id: "route-1-1",
      name: "環島 1-1 號線",
      url: "/kml/route-1-1.kml",
      visible: true,
      color: "#ff6b6b",
    },
    {
      id: "route-1-2",
      name: "環島 1-2 號線",
      url: "/kml/route-1-2.kml",
      visible: false,
      color: "#4ecdc4",
    },
    {
      id: "route-1-3",
      name: "環島 1-3 號線",
      url: "/kml/route-1-3.kml",
      visible: false,
      color: "#45b7d1",
    },
    {
      id: "route-1-4",
      name: "環島 1-4 號線",
      url: "/kml/route-1-4.kml",
      visible: false,
      color: "#96ceb4",
    },
    {
      id: "route-1-5",
      name: "環島 1-5 號線",
      url: "/kml/route-1-5.kml",
      visible: false,
      color: "#feca57",
    },
    {
      id: "route-1-6",
      name: "環島 1-6 號線",
      url: "/kml/route-1-6.kml",
      visible: false,
      color: "#ff9ff3",
    },
    {
      id: "route-1-7",
      name: "環島 1-7 號線",
      url: "/kml/route-1-7.kml",
      visible: false,
      color: "#54a0ff",
    },
    {
      id: "route-1-8",
      name: "環島 1-8 號線",
      url: "/kml/route-1-8.kml",
      visible: false,
      color: "#5f27cd",
    },
    {
      id: "route-1-9",
      name: "環島 1-9 號線",
      url: "/kml/route-1-9.kml",
      visible: false,
      color: "#00d2d3",
    },
    {
      id: "route-1-10",
      name: "環島 1-10 號線",
      url: "/kml/route-1-10.kml",
      visible: false,
      color: "#ff6348",
    },
    {
      id: "route-1-11",
      name: "環島 1-11 號線",
      url: "/kml/route-1-11.kml",
      visible: false,
      color: "#2ed573",
    },
    {
      id: "route-1-12",
      name: "環島 1-12 號線",
      url: "/kml/route-1-12.kml",
      visible: false,
      color: "#ffa502",
    },
    {
      id: "route-1-13",
      name: "環島 1-13 號線",
      url: "/kml/route-1-13.kml",
      visible: false,
      color: "#2f3542",
    },
    {
      id: "route-1-14",
      name: "環島 1-14 號線",
      url: "/kml/route-1-14.kml",
      visible: false,
      color: "#4ecdc4",
    },
    {
      id: "route-1-replace-s-q",
      name: "環1替代路線(松山-七堵)",
      url: "/kml/route-1-replace-s-q.kml",
      visible: false,
      color: "#2f3542",
    },
    {
      id: "route-1-2-replace-g-g",
      name: "環1-2替代路線(高原-關西)",
      url: "/kml/route-1-2-replace-g-g.kml",
      visible: false,
      color: "#4ecdc4",
    },
  ];

  const diverseKML = [
    {
      id: "route-chiayi-sugarrail",
      name: "嘉義糖鐵、夕鹽",
      url: "/kml/route-chiayi-sugarrail.kml",
      visible: false,
      color: "#ff6b6b",
    },
    {
      id: "route-dapengbay",
      name: "大鵬灣",
      url: "/kml/route-dapengbay.kml",
      visible: false,
      color: "#2f3542",
    },
    {
      id: "route-gamalan",
      name: "噶瑪蘭",
      url: "/kml/route-gamalan.kml",
      visible: false,
      color: "#2f3542",
    },
    {
      id: "route-guashan-triathlon",
      name: "卦山三鐵",
      url: "/kml/route-guashan-triathlon.kml",
      visible: false,
      color: "#4ecdc4",
    },
    {
      id: "route-hot-spring",
      name: "溫泉巡禮、板塊騎遇、森林遊蹤",
      url: "/kml/route-hot-spring.kml",
      visible: false,
      color: "#4ecdc4",
    },
    {
      id: "route-huangginsanhai",
      name: "黃金山海",
      url: "/kml/route-huangginsanhai.kml",
      visible: false,
      color: "#45b7d1",
    },
    {
      id: "route-huilan-wave",
      name: "洄瀾漫波",
      url: "/kml/route-huilan-wave.kml",
      visible: false,
      color: "#96ceb4",
    },
    {
      id: "route-indigenous",
      name: "原鄉尋音、波光稻浪、觀山親水",
      url: "/kml/route-indigenous.kml",
      visible: false,
      color: "#feca57",
    },
    {
      id: "route-jhudao",
      name: "菊島",
      url: "/kml/route-jhudao.kml",
      visible: false,
      color: "#ff9ff3",
    },
    {
      id: "route-kaohsiung-hill",
      name: "高雄山城",
      url: "/kml/route-kaohsiung-hill.kml",
      visible: false,
      color: "#54a0ff",
    },
    {
      id: "route-lingbo-guantian",
      name: "菱波官田",
      url: "/kml/route-lingbo-guantian.kml",
      visible: false,
      color: "#5f27cd",
    },
    {
      id: "route-madaochenggong",
      name: "馬到成功",
      url: "/kml/route-madaochenggong.kml",
      visible: false,
      color: "#00d2d3",
    },
    {
      id: "route-shitou",
      name: "獅頭山",
      url: "/kml/route-shitou.kml",
      visible: false,
      color: "#ff6348",
    },
    {
      id: "route-sunmoonlake",
      name: "日月潭",
      url: "/kml/route-sunmoonlake.kml",
      visible: false,
      color: "#2ed573",
    },
    {
      id: "route-taijiang",
      name: "台江",
      url: "/kml/route-taijiang.kml",
      visible: false,
      color: "#ffa502",
    },
  ];

  console.log(
    `📍 Round Island KML files: ${roundIslandKML.length} (route-1.kml is first)`
  );
  console.log(`📍 Diverse KML files: ${diverseKML.length}`);

  return [
    {
      id: "cycling-survey-2025",
      title: "「環島自行車路線」使用情形及滿意度問卷",
      description:
        "本問卷目的在了解您曾經騎乘或本次騎乘「環島自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
      version: "1.0.0",
      organize: "交通部運輸研究所",
      createdAt: "2025-07-03T00:00:00+08:00",
      updatedAt: new Date().toISOString(),
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
              options: [],
              defaultCenter: [23.8, 121.0],
              defaultZoom: 7,
              showLayerControl: true,
              kmlFiles: roundIslandKML,
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
      updatedAt: new Date().toISOString(),
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
              options: [],
              defaultCenter: [23.8, 121.0],
              defaultZoom: 7,
              showLayerControl: true,
              kmlFiles: diverseKML,
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
}

async function uploadQuestionnairesInFirestore() {
  try {
    // Get the questionnaires to upload
    const questionnaires = await getUpdatedQuestionnaires();
    console.log(
      `\n📊 Preparing to upload ${questionnaires.length} questionnaires`
    );

    // Check current state in Firestore
    console.log("\n🔍 Checking current questionnaires in Firestore...");
    const querySnapshot = await getDocs(collection(db, "questionnaires"));
    console.log(
      `📋 Found ${querySnapshot.size} existing questionnaires in Firestore`
    );

    // Upload each questionnaire
    let uploadCount = 0;
    for (const questionnaire of questionnaires) {
      console.log(`\n📝 Uploading questionnaire: ${questionnaire.title}`);

      // Show KML file information for verification
      const mapQuestions = [];
      questionnaire.sections?.forEach((section) => {
        section.questions?.forEach((question) => {
          if (question.type === "map" && question.kmlFiles) {
            mapQuestions.push(question);
          }
        });
      });

      if (mapQuestions.length > 0) {
        mapQuestions.forEach((question) => {
          console.log(
            `  📍 Map question has ${question.kmlFiles.length} KML files:`
          );
          console.log(
            `     First file: ${question.kmlFiles[0]?.name} (${question.kmlFiles[0]?.id})`
          );

          // Verify route-1.kml is first
          const firstFile = question.kmlFiles[0];
          if (firstFile?.id === "route-1") {
            console.log(`  ✅ route-1.kml is correctly positioned first`);
          } else {
            console.log(
              `  ⚠️  route-1.kml is NOT first (found: ${firstFile?.id})`
            );
          }
        });
      }

      // Prepare document for Firestore (preserve existing timestamps if available)
      const docData = {
        ...questionnaire,
        updatedAt: serverTimestamp(),
      };

      // Upload to Firestore
      await setDoc(doc(db, "questionnaires", questionnaire.id), docData);
      console.log(`  ✅ Successfully uploaded: ${questionnaire.id}`);
      uploadCount++;
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Questionnaire upload completed successfully!");
    console.log(`✅ Uploaded ${uploadCount} questionnaires to Firestore`);
    console.log(
      `📊 All questionnaires include the corrected route-1.kml ordering`
    );

    // Verify the upload
    console.log("\n🔍 Verifying upload...");
    const verifySnapshot = await getDocs(collection(db, "questionnaires"));
    console.log(
      `📋 Verification: ${verifySnapshot.size} questionnaires now in Firestore`
    );

    verifySnapshot.docs.forEach((doc) => {
      const data = doc.data();
      console.log(`  • ${data.title} (ID: ${doc.id})`);
    });

    console.log(
      "\n🎯 Ready! Your application can now use the updated questionnaires from Firestore."
    );
  } catch (error) {
    console.error("❌ Upload failed:", error);

    if (error.message.includes("Missing or insufficient permissions")) {
      console.error("\n💡 Possible solutions:");
      console.error("  1. Check your Firebase authentication");
      console.error("  2. Verify Firestore security rules allow writing");
      console.error("  3. Ensure your Firebase configuration is correct");
    } else if (error.message.includes("PERMISSION_DENIED")) {
      console.error("\n💡 This might be a Firestore security rules issue");
      console.error(
        "  Check that your rules allow writing to the questionnaires collection"
      );
    }

    throw error;
  }
}

// Run the upload
uploadQuestionnairesInFirestore()
  .then(() => {
    console.log(
      "\n🎉 All done! Your questionnaires have been uploaded to Firestore."
    );
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Upload failed:", error.message);
    process.exit(1);
  });
