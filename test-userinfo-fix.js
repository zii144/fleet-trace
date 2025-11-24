// Test script to verify UserInfo undefined field fix
console.log("🧪 Testing UserInfo undefined field fix...");

// Simulate the data extraction that was causing issues
function extractGenderDescription(value) {
  if (typeof value === "object" && value?.textInput) {
    return value.textInput.trim();
  }
  return ""; // Return empty string instead of undefined
}

// Test scenarios
const testCases = [
  {
    name: "Gender with text input (其他 option)",
    data: { selectedOption: "其他", textInput: "非二元性別" },
    expected: "非二元性別",
  },
  {
    name: "Gender without text input (standard option)",
    data: { selectedOption: "男性" },
    expected: "",
  },
  {
    name: "Simple string gender",
    data: "女性",
    expected: "",
  },
  {
    name: "Undefined/null gender",
    data: undefined,
    expected: "",
  },
];

console.log("\n📋 Test Results:");
testCases.forEach((testCase, index) => {
  const result = extractGenderDescription(testCase.data);
  const passed = result === testCase.expected;
  console.log(`${index + 1}. ${testCase.name}`);
  console.log(`   Input: ${JSON.stringify(testCase.data)}`);
  console.log(`   Expected: "${testCase.expected}"`);
  console.log(`   Got: "${result}"`);
  console.log(`   Status: ${passed ? "✅ PASS" : "❌ FAIL"}`);
  console.log("");
});

// Test the object filtering to remove undefined values
console.log("🔍 Testing undefined value filtering:");

const userInfoWithUndefined = {
  id: "test-id",
  userId: "test-user",
  name: "Test User",
  gender: "男性",
  genderDescription: undefined, // This was causing the Firestore error
  birthDate: "1990-01-01",
  city: "台北市",
};

console.log("Before filtering:", userInfoWithUndefined);

const cleanUserInfo = Object.fromEntries(
  Object.entries(userInfoWithUndefined).filter(
    ([_, value]) => value !== undefined
  )
);

console.log("After filtering:", cleanUserInfo);
console.log(
  `✅ Undefined fields removed: ${!cleanUserInfo.hasOwnProperty(
    "genderDescription"
  )}`
);

console.log("\n🎯 Fix Summary:");
console.log(
  "1. extractGenderDescription() now returns empty string instead of undefined"
);
console.log(
  "2. Object filtering removes any remaining undefined values before Firestore save"
);
console.log(
  "3. UserInfo type updated to make genderDescription required (string)"
);
console.log("✅ This should resolve the Firestore setDoc() error!");
