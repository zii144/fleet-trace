// Test script for QuestionnaireResponseManager
const { getAllQuestionnaires } = require("./public/questionnaires/index.ts");

console.log("🧪 Testing QuestionnaireResponseManager...");

try {
  // Test loading questionnaires
  const questionnaires = getAllQuestionnaires();
  console.log("✅ Successfully loaded questionnaires:", questionnaires.length);

  questionnaires.forEach((q) => {
    console.log(`  - ${q.id}: ${q.title}`);
    console.log(`    Sections: ${q.sections.length}`);
    console.log(
      `    Total questions: ${q.sections.reduce(
        (sum, s) => sum + s.questions.length,
        0
      )}`
    );
  });

  console.log("✅ All tests passed!");
} catch (error) {
  console.error("❌ Test failed:", error);
  process.exit(1);
}
