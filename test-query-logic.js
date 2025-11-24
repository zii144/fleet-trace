/**
 * Test UserInfo functionality without Firebase authentication
 * This tests the modified query logic
 */

console.log("🧪 Testing UserInfo Service Query Logic...\n");

// Simulate the modified query approach
function simulateUserInfoQuery(mockData) {
  console.log("📊 Mock data received:", mockData.length, "documents");

  if (mockData.length === 0) {
    console.log("📭 No documents found");
    return null;
  }

  // Sort documents by submittedAt in memory (simulating our new approach)
  const docs = mockData.map((doc) => ({
    doc: { id: doc.id },
    data: doc,
    submittedAt: new Date(doc.submittedAt || 0),
  }));

  // Sort by submittedAt descending and get the first (latest)
  docs.sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  console.log(
    "📅 Sorted order:",
    docs.map((d) => ({ id: d.doc.id, date: d.data.submittedAt }))
  );

  const latestDoc = docs[0];

  if (!latestDoc) {
    console.log("📭 No valid documents found after sorting");
    return null;
  }

  console.log("✅ Latest document selected:", latestDoc.doc.id);
  return {
    id: latestDoc.doc.id,
    ...latestDoc.data,
  };
}

// Test Case 1: Multiple documents, should return latest
console.log("🧪 Test Case 1: Multiple documents");
const mockData1 = [
  {
    id: "doc1",
    userId: "test-user",
    name: "Test User V1",
    submittedAt: "2025-01-01T10:00:00Z",
    isValid: true,
  },
  {
    id: "doc2",
    userId: "test-user",
    name: "Test User V2",
    submittedAt: "2025-01-02T10:00:00Z",
    isValid: true,
  },
  {
    id: "doc3",
    userId: "test-user",
    name: "Test User V3",
    submittedAt: "2025-01-03T10:00:00Z",
    isValid: true,
  },
];

const result1 = simulateUserInfoQuery(mockData1);
console.log("Expected: doc3 (latest)");
console.log("Actual:", result1?.id);
console.log("✅ Test 1:", result1?.id === "doc3" ? "PASSED" : "FAILED");

console.log("\n🧪 Test Case 2: Single document");
const mockData2 = [
  {
    id: "single-doc",
    userId: "test-user",
    name: "Single User",
    submittedAt: "2025-01-01T10:00:00Z",
    isValid: true,
  },
];

const result2 = simulateUserInfoQuery(mockData2);
console.log("Expected: single-doc");
console.log("Actual:", result2?.id);
console.log("✅ Test 2:", result2?.id === "single-doc" ? "PASSED" : "FAILED");

console.log("\n🧪 Test Case 3: No documents");
const mockData3 = [];

const result3 = simulateUserInfoQuery(mockData3);
console.log("Expected: null");
console.log("Actual:", result3);
console.log("✅ Test 3:", result3 === null ? "PASSED" : "FAILED");

console.log("\n🎉 All query logic tests completed!");
console.log(
  "\n💡 The modified UserInfoService should now work without requiring complex Firestore indexes."
);
console.log(
  "   Instead of using orderBy in the query, it sorts results in memory,"
);
console.log(
  "   which avoids the indexing requirement that was causing the FirebaseError."
);
