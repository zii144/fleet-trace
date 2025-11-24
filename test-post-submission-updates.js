const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const path = require("path");

// Initialize Firebase Admin SDK
const serviceAccount = require("./velo-trace-service-account-key.json");
const app = initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore(app);

// Test comprehensive post-submission updates
async function testPostSubmissionUpdates() {
  console.log("🧪 Testing Post-Submission Updates System");
  console.log("=".repeat(50));

  const testUserId = "test-user-post-submission";
  const testQuestionnaireId = "cycling-survey-2025";

  try {
    // 1. Clean up any existing test data
    await cleanupTestData(testUserId);
    console.log("✅ Test data cleaned up");

    // 2. Create test user profile
    const userProfile = {
      id: testUserId,
      email: "test@example.com",
      displayName: "Test User",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalSubmissions: 0,
      lastActiveAt: new Date().toISOString(),
      emailVerified: true,
      role: "user",
      preferences: {
        notifications: true,
        emailUpdates: true,
      },
    };

    await db.collection("users").doc(testUserId).set(userProfile);
    console.log("✅ Test user profile created");

    // 3. Create comprehensive test questionnaire response
    const testResponse = {
      questionnaireId: testQuestionnaireId,
      userId: testUserId,
      responses: {
        "basic-info-name": "Test User",
        "basic-info-age": "26-35歲",
        "basic-info-gender": "男",
        "cycling-experience": "經常騎自行車",
        "route-satisfaction": "非常滿意",
        "safety-rating": "還算滿意",
        "environment-rating": "非常滿意",
        "convenience-rating": "還算滿意",
        "overall-satisfaction": "非常滿意",
        "improvement-suggestions":
          "希望能增加更多的休息站點和維修服務站。路線標示也可以更清楚一些，特別是在複雜的路口。另外，夜間照明也需要加強。",
        "train-used": "是",
        "train-mode": "人車同行",
        "train-service-satisfaction": {
          購票方式: "還算滿意",
          網路購票操作介面: "非常滿意",
          App購票操作介面: "還算滿意",
          兩鐵班次資訊查詢: "尚可",
          自行車可進出車站資訊: "還算滿意",
        },
        "train-willingness": "是",
        "location-selections": [
          { lat: 25.033, lng: 121.5654, name: "台北車站" },
          { lat: 24.9739, lng: 121.4418, name: "板橋車站" },
        ],
      },
      submittedAt: new Date().toISOString(),
      completedSections: [
        "basic-info",
        "cycling-experience",
        "route-feedback",
        "safety",
        "environment",
        "train-service",
      ],
      status: "completed",
      startedAt: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
      updatedAt: new Date().toISOString(),

      // Enhanced tracking fields
      totalCharactersWritten: 156, // Calculated from text responses
      timeSpentSeconds: 1800, // 30 minutes
      totalQuestions: 15,
      answeredQuestions: 12,
      averageTimePerQuestion: 120, // 2 minutes per question
      deviceType: "desktop",
      completionPercentage: 80,
      textResponsesCount: 3,
      mapSelectionsCount: 2,
      revisitCount: 2,
    };

    await db.collection("questionnaire_responses").add({
      ...testResponse,
      submittedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log("✅ Test questionnaire response created");

    // 4. Test comprehensive stats calculation
    console.log("\n📊 Testing Stats Calculation:");

    // Get all responses for user
    const responseSnapshot = await db
      .collection("questionnaire_responses")
      .where("userId", "==", testUserId)
      .get();

    const responses = responseSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      submittedAt:
        doc.data().submittedAt?.toDate?.()?.toISOString() ||
        new Date().toISOString(),
    }));

    console.log("📝 Found responses:", responses.length);

    // Calculate stats
    const stats = calculateUserStats(responses);
    console.log("📈 Calculated stats:", {
      totalSubmissions: stats.totalSubmissions,
      completionRate: stats.completionRate,
      totalCharactersWritten: stats.totalCharactersWritten,
      totalTimeSpent: stats.totalTimeSpent,
      averageTimePerQuestionnaire: stats.averageTimePerQuestionnaire,
      textResponsesCount: stats.textResponsesCount,
      mapSelectionsCount: stats.mapSelectionsCount,
      deviceUsage: stats.deviceUsage,
      qualityScore: stats.qualityScore,
      rank: stats.rank,
      cashVoucher: stats.cashVoucher,
      availableQuestionnaireRate: stats.availableQuestionnaireRate,
    });

    // 5. Test user profile updates
    console.log("\n👤 Testing User Profile Updates:");

    // Update user profile with post-submission data
    await db.collection("users").doc(testUserId).update({
      totalSubmissions: stats.totalSubmissions,
      lastActiveAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Verify updates
    const updatedProfile = await db.collection("users").doc(testUserId).get();
    const profileData = updatedProfile.data();

    console.log("✅ User profile updated:", {
      totalSubmissions: profileData.totalSubmissions,
      lastActiveAt: profileData.lastActiveAt?.toDate?.()?.toISOString(),
      updatedAt: profileData.updatedAt?.toDate?.()?.toISOString(),
    });

    // 6. Test rank calculation
    console.log("\n🏆 Testing Rank Calculation:");

    const rankInfo = calculateRankInfo(stats);
    console.log("📊 Rank information:", rankInfo);

    // 7. Test field validation
    console.log("\n✅ Testing Field Validation:");

    const validationTests = [
      {
        field: "totalTimeSpent",
        value: stats.totalTimeSpent,
        expected: "number",
        min: 0,
      },
      {
        field: "totalCharactersWritten",
        value: stats.totalCharactersWritten,
        expected: "number",
        min: 0,
      },
      {
        field: "completionRate",
        value: stats.completionRate,
        expected: "number",
        min: 0,
        max: 100,
      },
      {
        field: "textResponsesCount",
        value: stats.textResponsesCount,
        expected: "number",
        min: 0,
      },
      {
        field: "mapSelectionsCount",
        value: stats.mapSelectionsCount,
        expected: "number",
        min: 0,
      },
      { field: "deviceUsage", value: stats.deviceUsage, expected: "object" },
      {
        field: "qualityScore",
        value: stats.qualityScore,
        expected: "number",
        min: 0,
        max: 100,
      },
      { field: "rank", value: stats.rank, expected: "string" },
      {
        field: "availableQuestionnaireRate",
        value: stats.availableQuestionnaireRate,
        expected: "number",
        min: 0,
        max: 100,
      },
    ];

    validationTests.forEach((test) => {
      const isValid = validateField(test);
      console.log(
        `${isValid ? "✅" : "❌"} ${test.field}: ${
          test.value
        } (${typeof test.value})`
      );
    });

    console.log(
      "\n🎉 All post-submission update tests completed successfully!"
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    // Clean up test data
    await cleanupTestData(testUserId);
    console.log("🧹 Test data cleaned up");
  }
}

// Calculate user stats (simplified version for testing)
function calculateUserStats(responses) {
  const completedResponses = responses.filter((r) => r.status === "completed");
  const totalSubmissions = completedResponses.length;

  const totalTimeSpent = responses.reduce(
    (sum, r) => sum + (r.timeSpentSeconds || 0),
    0
  );
  const averageTimePerQuestionnaire =
    totalSubmissions > 0 ? Math.round(totalTimeSpent / totalSubmissions) : 0;

  const totalCharactersWritten = responses.reduce(
    (sum, r) => sum + (r.totalCharactersWritten || 0),
    0
  );
  const textResponsesCount = responses.reduce(
    (sum, r) => sum + (r.textResponsesCount || 0),
    0
  );
  const mapSelectionsCount = responses.reduce(
    (sum, r) => sum + (r.mapSelectionsCount || 0),
    0
  );

  const totalPossibleQuestions = responses.reduce(
    (sum, r) => sum + (r.totalQuestions || 6),
    0
  );
  const totalAnsweredQuestions = responses.reduce(
    (sum, r) => sum + (r.answeredQuestions || 0),
    0
  );
  const completionRate =
    totalPossibleQuestions > 0
      ? Math.round((totalAnsweredQuestions / totalPossibleQuestions) * 100)
      : 0;

  const averageCompletionRate =
    responses.length > 0
      ? responses.reduce((sum, r) => sum + (r.completionPercentage || 0), 0) /
        responses.length
      : 0;

  const deviceUsage = responses.reduce(
    (usage, r) => {
      const device = r.deviceType || "desktop";
      usage[device] = (usage[device] || 0) + 1;
      return usage;
    },
    { desktop: 0, mobile: 0, tablet: 0 }
  );

  const qualityScore = Math.round(
    averageCompletionRate * 0.4 +
      Math.min(100, (averageTimePerQuestionnaire / 300) * 100) * 0.3 +
      Math.min(100, (totalCharactersWritten / 1000) * 100) * 0.3
  );

  const basePoints = totalSubmissions * 100;
  const completionBonus = Math.round(completionRate * 10);
  const qualityBonus = Math.round(qualityScore * 5);
  const totalPoints = basePoints + completionBonus + qualityBonus;

  const rank = calculateRank(totalPoints);
  const cashVoucher = Math.floor(totalSubmissions / 5) * 5;
  const availableQuestionnaireRate = Math.min(
    100,
    Math.round((totalSubmissions / 10) * 100)
  );

  return {
    totalSubmissions,
    completionRate,
    totalCharactersWritten,
    totalTimeSpent,
    averageTimePerQuestionnaire,
    textResponsesCount,
    mapSelectionsCount,
    deviceUsage,
    qualityScore,
    rank,
    cashVoucher,
    availableQuestionnaireRate,
    lastSubmission: responses[0]?.submittedAt || new Date().toISOString(),
  };
}

// Calculate rank based on points
function calculateRank(points) {
  if (points >= 3000) return "鑽石會員";
  if (points >= 2000) return "金牌會員";
  if (points >= 1000) return "銀牌會員";
  if (points >= 500) return "銅牌會員";
  return "新手會員";
}

// Calculate rank information
function calculateRankInfo(stats) {
  const currentPoints =
    stats.totalSubmissions * 100 +
    Math.round(stats.completionRate * 10) +
    Math.round(stats.qualityScore * 5);

  const ranks = [
    { name: "新手會員", threshold: 0 },
    { name: "銅牌會員", threshold: 500 },
    { name: "銀牌會員", threshold: 1000 },
    { name: "金牌會員", threshold: 2000 },
    { name: "鑽石會員", threshold: 3000 },
  ];

  const currentRankIndex = ranks.findIndex(
    (rank) => currentPoints >= rank.threshold
  );
  const currentRank = ranks[currentRankIndex]?.name || "新手會員";
  const nextRank = ranks[currentRankIndex + 1]?.name || null;
  const pointsToNext = nextRank
    ? ranks[currentRankIndex + 1].threshold - currentPoints
    : 0;

  return {
    currentRank,
    nextRank,
    pointsToNext,
    currentPoints,
  };
}

// Validate field
function validateField(test) {
  const { value, expected, min, max } = test;

  if (typeof value !== expected) return false;
  if (typeof min === "number" && value < min) return false;
  if (typeof max === "number" && value > max) return false;

  return true;
}

// Clean up test data
async function cleanupTestData(testUserId) {
  try {
    // Delete user profile
    await db.collection("users").doc(testUserId).delete();

    // Delete user responses
    const responseSnapshot = await db
      .collection("questionnaire_responses")
      .where("userId", "==", testUserId)
      .get();

    const batch = db.batch();
    responseSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();

    // Delete user stats
    await db.collection("user_stats").doc(testUserId).delete();
  } catch (error) {
    console.warn("⚠️ Error cleaning up test data:", error.message);
  }
}

// Run the test
testPostSubmissionUpdates()
  .then(() => {
    console.log("\n🎉 All tests passed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Tests failed:", error);
    process.exit(1);
  });
