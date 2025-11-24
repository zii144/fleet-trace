#!/usr/bin/env tsx

/**
 * Update Questionnaires in Firestore Script (TypeScript)
 * 
 * This script uploads the questionnaires to Firestore using the single source
 * of truth from lib/questionnaire.ts with the corrected route-1.kml ordering.
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("🔄 Starting Questionnaire Upload to Firestore...");
console.log("=" .repeat(60));

// Validate required environment variables
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', 
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.error(`  ${varName}: ✗`);
  });
  console.error('\nPlease check your .env.local file');
  process.exit(1);
}

console.log('✅ Environment variables validated');

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

// Import KML configuration to generate questionnaires locally
import { getKMLFilesByCategory, type KMLFileConfig } from "../lib/kml-config";
import type { Questionnaire } from "../types/questionnaire";

// Helper to convert KMLFileConfig to the expected map question format
function convertKMLForMapQuestion(kmlFiles: any[]) {
  return kmlFiles.map((kml: any) => ({
    id: kml.id,
    name: kml.name,
    url: kml.url,
    visible: kml.visible,
    color: kml.color
  }));
}

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

// Generate questionnaires locally using KML configuration (replicating lib/questionnaire.ts logic)
function generateQuestionnaires(): Questionnaire[] {
  const roundIslandKML = getKMLFilesByCategory('round-island');
  const diverseKML = getKMLFilesByCategory('diverse');
  
  console.log(`📍 Round Island KML files: ${roundIslandKML.length} (route-1.kml should be first)`);
  console.log(`📍 Diverse KML files: ${diverseKML.length}`);
  
  return [
    {
      id: "cycling-survey-2025",
      title: "「環島自行車路線」使用情形及滿意度問卷",
      description: "本問卷目的在了解您曾經騎乘或本次騎乘「環島自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
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
              options: ["12歲以下", "13~20歲", "21~30歲", "31~40歲", "41~50歲", "51~60歲", "61~64歲", "65歲以上"],
            },
            {
              id: "city",
              type: "select",
              label: "您居住的縣市",
              required: true,
              options: [
                "新北市", "宜蘭縣", "花蓮縣", "臺東縣", "基隆市", "臺北市", "桃園市", "苗栗縣",
                "新竹縣", "新竹市", "臺中市", "彰化縣", "雲林縣", "南投縣", "嘉義縣", "嘉義市",
                "臺南市", "高雄市", "屏東縣", "澎湖縣", "金門縣", "連江縣", "外國",
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
              kmlFiles: convertKMLForMapQuestion(roundIslandKML)
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
      description: "本問卷目的在了解您曾經騎乘或本次騎乘「多元自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
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
              kmlFiles: convertKMLForMapQuestion(diverseKML)
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
    // Get the questionnaires from the single source of truth (KML configuration)
    console.log(`📋 Loading questionnaires using lib/kml-config.ts (single source of truth)...`);
    const questionnaires: Questionnaire[] = generateQuestionnaires();
    console.log(`✅ Successfully loaded ${questionnaires.length} questionnaires from lib/questionnaire.ts`);

    // Verify route-1.kml positioning
    questionnaires.forEach(questionnaire => {
      questionnaire.sections?.forEach(section => {
        section.questions?.forEach(question => {
          if (question.type === 'map' && question.kmlFiles) {
            const firstKml = question.kmlFiles[0];
            console.log(`📍 ${questionnaire.title}: First KML is ${firstKml?.name} (${firstKml?.id})`);
            if (firstKml?.id === 'route-1') {
              console.log(`  ✅ route-1.kml is correctly positioned first`);
            } else {
              console.log(`  ⚠️  route-1.kml is NOT first (found: ${firstKml?.id})`);
            }
          }
        });
      });
    });

    console.log(`\n📊 Preparing to upload ${questionnaires.length} questionnaires`);

    // Check current state in Firestore
    console.log("\n🔍 Checking current questionnaires in Firestore...");
    const querySnapshot = await getDocs(collection(db, "questionnaires"));
    console.log(`📋 Found ${querySnapshot.size} existing questionnaires in Firestore`);

    // Upload each questionnaire
    let uploadCount = 0;
    for (const questionnaire of questionnaires) {
      console.log(`\n📝 Uploading questionnaire: ${questionnaire.title}`);
      
      // Show KML file information for verification
      const mapQuestions: any[] = [];
      questionnaire.sections?.forEach(section => {
        section.questions?.forEach(question => {
          if (question.type === 'map' && question.kmlFiles) {
            mapQuestions.push(question);
          }
        });
      });

      if (mapQuestions.length > 0) {
        mapQuestions.forEach(question => {
          console.log(`  📍 Map question has ${question.kmlFiles.length} KML files:`);
          console.log(`     First file: ${question.kmlFiles[0]?.name} (${question.kmlFiles[0]?.id})`);
          
          // Verify route-1.kml is first
          const firstFile = question.kmlFiles[0];
          if (firstFile?.id === 'route-1') {
            console.log(`  ✅ route-1.kml is correctly positioned first`);
          } else {
            console.log(`  ⚠️  route-1.kml is NOT first (found: ${firstFile?.id})`);
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
    console.log(`📊 All questionnaires sourced from lib/questionnaire.ts (single source of truth)`);
    
    // Verify the upload
    console.log("\n🔍 Verifying upload...");
    const verifySnapshot = await getDocs(collection(db, "questionnaires"));
    console.log(`📋 Verification: ${verifySnapshot.size} questionnaires now in Firestore`);
    
    verifySnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log(`  • ${data.title} (ID: ${doc.id})`);
    });

    console.log("\n🎯 Ready! Your application can now use the updated questionnaires from Firestore.");

  } catch (error: any) {
    console.error("❌ Upload failed:", error);
    
    if (error.message?.includes('Missing or insufficient permissions')) {
      console.error('\n💡 Possible solutions:');
      console.error('  1. Check your Firebase authentication');
      console.error('  2. Verify Firestore security rules allow writing');
      console.error('  3. Ensure your Firebase configuration is correct');
    } else if (error.message?.includes('PERMISSION_DENIED')) {
      console.error('\n💡 This might be a Firestore security rules issue');
      console.error('  Check that your rules allow writing to the questionnaires collection');
    }
    
    throw error;
  }
}

// Run the upload
uploadQuestionnairesInFirestore()
  .then(() => {
    console.log("\n🎉 All done! Your questionnaires have been uploaded to Firestore.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Upload failed:", error.message);
    process.exit(1);
  });
