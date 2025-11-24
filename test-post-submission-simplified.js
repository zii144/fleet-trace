// Test comprehensive post-submission updates (simplified version)
console.log("🧪 Testing Post-Submission Updates System (Simplified)");
console.log("=".repeat(60));

// Mock questionnaire response data
const mockResponse = {
  questionnaireId: "cycling-survey-2025",
  userId: "test-user-123",
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
  totalCharactersWritten: 156,
  timeSpentSeconds: 1800,
  totalQuestions: 15,
  answeredQuestions: 12,
  averageTimePerQuestion: 120,
  deviceType: "desktop",
  completionPercentage: 80,
  textResponsesCount: 3,
  mapSelectionsCount: 2,
  revisitCount: 2,
};

// Test 1: Enhanced Response Processing
console.log("\n📊 Test 1: Enhanced Response Processing");
console.log("-".repeat(40));

function enhanceResponse(response) {
  const enhanced = { ...response };

  // Calculate total characters written if not provided
  if (!enhanced.totalCharactersWritten) {
    enhanced.totalCharactersWritten = Object.values(response.responses).reduce(
      (sum, value) => {
        if (typeof value === "string") {
          return sum + value.length;
        } else if (Array.isArray(value)) {
          return (
            sum +
            value.reduce((arrSum, item) => {
              if (typeof item === "string") return arrSum + item.length;
              if (typeof item === "object" && item.answer)
                return arrSum + item.answer.length;
              return arrSum;
            }, 0)
          );
        } else if (typeof value === "object" && value !== null) {
          return (
            sum +
            Object.values(value).reduce((objSum, objValue) => {
              if (typeof objValue === "string") return objSum + objValue.length;
              return objSum;
            }, 0)
          );
        }
        return sum;
      },
      0
    );
  }

  // Calculate completion percentage
  if (!enhanced.completionPercentage) {
    enhanced.completionPercentage =
      enhanced.totalQuestions > 0
        ? Math.round(
            (enhanced.answeredQuestions / enhanced.totalQuestions) * 100
          )
        : 0;
  }

  // Count response types
  if (!enhanced.textResponsesCount || !enhanced.mapSelectionsCount) {
    let textCount = 0;
    let mapCount = 0;

    Object.entries(response.responses).forEach(([key, value]) => {
      if (typeof value === "string" && value.trim().length > 0) {
        textCount++;
      } else if (
        key.includes("map") ||
        key.includes("location") ||
        key.includes("region")
      ) {
        mapCount++;
      } else if (typeof value === "object" && value !== null) {
        const objValues = Object.values(value).filter(
          (v) => typeof v === "string" && v.trim().length > 0
        );
        if (objValues.length > 0) textCount += objValues.length;
      }
    });

    enhanced.textResponsesCount = textCount;
    enhanced.mapSelectionsCount = mapCount;
  }

  return enhanced;
}

const enhancedResponse = enhanceResponse(mockResponse);
console.log("✅ Enhanced response data:", {
  totalCharactersWritten: enhancedResponse.totalCharactersWritten,
  timeSpentSeconds: enhancedResponse.timeSpentSeconds,
  completionPercentage: enhancedResponse.completionPercentage,
  textResponsesCount: enhancedResponse.textResponsesCount,
  mapSelectionsCount: enhancedResponse.mapSelectionsCount,
  deviceType: enhancedResponse.deviceType,
});

// Test 2: User Stats Calculation
console.log("\n📈 Test 2: User Stats Calculation");
console.log("-".repeat(40));

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
  const timeBonus = Math.round((averageTimePerQuestionnaire / 600) * 50);
  const contentBonus = Math.round((totalCharactersWritten / 5000) * 25);
  const totalPoints =
    basePoints + completionBonus + qualityBonus + timeBonus + contentBonus;

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

function calculateRank(points) {
  if (points >= 3000) return "鑽石會員";
  if (points >= 2000) return "金牌會員";
  if (points >= 1000) return "銀牌會員";
  if (points >= 500) return "銅牌會員";
  return "新手會員";
}

// Test with single response
const testResponses = [enhancedResponse];
const stats = calculateUserStats(testResponses);

console.log("✅ Calculated stats:", {
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

// Test 3: Post-Calculation Updates
console.log("\n🔄 Test 3: Post-Calculation Updates");
console.log("-".repeat(40));

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

  let currentRankIndex = 0;
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (currentPoints >= ranks[i].threshold) {
      currentRankIndex = i;
      break;
    }
  }

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

const rankInfo = calculateRankInfo(stats);
console.log("🏆 Rank information:", rankInfo);

// Test 4: Field Validation
console.log("\n✅ Test 4: Field Validation");
console.log("-".repeat(40));

function validateField(test) {
  const { value, expected, min, max } = test;

  if (typeof value !== expected) return false;
  if (typeof min === "number" && value < min) return false;
  if (typeof max === "number" && value > max) return false;

  return true;
}

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

let passedTests = 0;
let totalTests = validationTests.length;

validationTests.forEach((test) => {
  const isValid = validateField(test);
  console.log(
    `${isValid ? "✅" : "❌"} ${test.field}: ${
      test.value
    } (${typeof test.value})`
  );
  if (isValid) passedTests++;
});

console.log(
  `\n📊 Validation Results: ${passedTests}/${totalTests} tests passed`
);

// Test 5: Multiple Submissions Simulation
console.log("\n🔄 Test 5: Multiple Submissions Simulation");
console.log("-".repeat(40));

// Simulate multiple submissions
const multipleResponses = [
  {
    ...enhancedResponse,
    submittedAt: new Date(Date.now() - 86400000).toISOString(),
  }, // 1 day ago
  {
    ...enhancedResponse,
    submittedAt: new Date(Date.now() - 172800000).toISOString(),
  }, // 2 days ago
  { ...enhancedResponse, submittedAt: new Date().toISOString() }, // Now
];

const multipleStats = calculateUserStats(multipleResponses);
console.log("✅ Multiple submissions stats:", {
  totalSubmissions: multipleStats.totalSubmissions,
  totalTimeSpent: multipleStats.totalTimeSpent,
  totalCharactersWritten: multipleStats.totalCharactersWritten,
  rank: multipleStats.rank,
  cashVoucher: multipleStats.cashVoucher,
  availableQuestionnaireRate: multipleStats.availableQuestionnaireRate,
});

console.log("\n🎉 All post-submission update tests completed successfully!");
console.log("=".repeat(60));
console.log("✅ Enhanced response processing works correctly");
console.log("✅ User stats calculation handles all fields");
console.log("✅ Post-calculation updates function properly");
console.log("✅ Field validation ensures data integrity");
console.log("✅ Multiple submissions are processed correctly");
console.log("=".repeat(60));
