#!/usr/bin/env tsx

/**
 * Simple Firestore Questionnaire Inspector
 * 
 * This script shows the actual structure and content of questionnaires
 * currently in Firestore for manual inspection.
 */

// Load environment variables first
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log("🔍 Inspecting Firestore Questionnaire Content...");
console.log("=" .repeat(60));

import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
} from "firebase/firestore";

// Firebase configuration
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

async function inspectFirestoreQuestionnaires() {
  try {
    console.log("📋 Loading questionnaires from Firestore...");
    const querySnapshot = await getDocs(collection(db, "questionnaires"));
    
    console.log(`✅ Found ${querySnapshot.size} questionnaires in Firestore\n`);

    querySnapshot.docs.forEach((doc, index) => {
      const data = doc.data();
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📝 QUESTIONNAIRE ${index + 1}: ${data.title}`);
      console.log(`   Document ID: ${doc.id}`);
      console.log(`   Questionnaire ID: ${data.id}`);
      console.log(`   Version: ${data.version}`);
      console.log(`   Organization: ${data.organize}`);
      console.log(`   Created: ${data.createdAt}`);
      console.log(`   Updated: ${data.updatedAt ? (typeof data.updatedAt === 'object' ? '[ServerTimestamp]' : data.updatedAt) : 'N/A'}`);

      if (data.sections && Array.isArray(data.sections)) {
        console.log(`\n   📂 SECTIONS (${data.sections.length}):`);
        
        data.sections.forEach((section: any, sIndex: number) => {
          console.log(`\n   ${sIndex + 1}. Section: "${section.title}" (ID: ${section.id})`);
          if (section.description) {
            console.log(`      Description: "${section.description}"`);
          }
          
          if (section.questions && Array.isArray(section.questions)) {
            console.log(`      Questions: ${section.questions.length}`);
            
            // Show first few questions in detail
            section.questions.slice(0, 3).forEach((question: any, qIndex: number) => {
              console.log(`        ${qIndex + 1}. ${question.label} (ID: ${question.id}, Type: ${question.type})`);
              if (question.options && Array.isArray(question.options)) {
                console.log(`           Options: ${question.options.length} items`);
              }
              if (question.kmlFiles && Array.isArray(question.kmlFiles)) {
                console.log(`           KML Files: ${question.kmlFiles.length} files`);
                console.log(`           First KML: ${question.kmlFiles[0]?.name} (${question.kmlFiles[0]?.id})`);
              }
            });
            
            if (section.questions.length > 3) {
              console.log(`        ... and ${section.questions.length - 3} more questions`);
            }
            
            // Check for specific questions mentioned by user
            const trainQuestion = section.questions.find((q: any) => q.id === 'train-station-friendliness');
            if (trainQuestion) {
              console.log(`        🎯 FOUND 'train-station-friendliness': ${trainQuestion.type}`);
              console.log(`           Label: "${trainQuestion.label.substring(0, 100)}..."`);
              console.log(`           Required: ${trainQuestion.required}`);
            }
            
            const routeSignQuestion = section.questions.find((q: any) => q.id === 'route-sign');
            if (routeSignQuestion) {
              console.log(`        🎯 FOUND 'route-sign': ${routeSignQuestion.type}`);
              console.log(`           Options: ${routeSignQuestion.options?.length || 0} items`);
            }
          } else {
            console.log(`      Questions: NONE or INVALID`);
          }
          
          // Special check for continuity section
          if (section.id === 'continuity') {
            console.log(`        🎯 THIS IS THE CONTINUITY SECTION!`);
            console.log(`           Title: "${section.title}"`);
            console.log(`           Description: "${section.description || 'NONE'}"`);
            console.log(`           Question count: ${section.questions?.length || 0}`);
          }
        });
      } else {
        console.log(`\n   ❌ NO SECTIONS FOUND or INVALID FORMAT`);
      }
    });

    console.log(`\n${'='.repeat(80)}`);
    console.log("🎯 KEY FINDINGS SUMMARY:");
    console.log(`   • Total questionnaires: ${querySnapshot.size}`);
    
    let foundTrainQuestion = false;
    let foundContinuitySection = false;
    let totalSections = 0;
    let totalQuestions = 0;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.sections) {
        totalSections += data.sections.length;
        data.sections.forEach((section: any) => {
          if (section.id === 'continuity') {
            foundContinuitySection = true;
          }
          if (section.questions) {
            totalQuestions += section.questions.length;
            section.questions.forEach((question: any) => {
              if (question.id === 'train-station-friendliness') {
                foundTrainQuestion = true;
              }
            });
          }
        });
      }
    });
    
    console.log(`   • Total sections: ${totalSections}`);
    console.log(`   • Total questions: ${totalQuestions}`);
    console.log(`   • 'continuity' section found: ${foundContinuitySection ? '✅ YES' : '❌ NO'}`);
    console.log(`   • 'train-station-friendliness' question found: ${foundTrainQuestion ? '✅ YES' : '❌ NO'}`);

  } catch (error: any) {
    console.error("❌ Inspection failed:", error);
    throw error;
  }
}

// Run the inspection
inspectFirestoreQuestionnaires()
  .then(() => {
    console.log("\n🎯 Inspection complete! Review the content above.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Inspection failed:", error.message);
    process.exit(1);
  });
