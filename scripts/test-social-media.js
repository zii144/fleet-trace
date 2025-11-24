#!/usr/bin/env node

/**
 * Social Media Meta Tags Testing Script
 * Tests and validates social media optimization for bike-life.net
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://bike-life.net";

// Test URLs for different social media platforms
const testUrls = {
  facebook: `https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(
    BASE_URL
  )}`,
  twitter: `https://cards-dev.twitter.com/validator?url=${encodeURIComponent(
    BASE_URL
  )}`,
  linkedin: `https://www.linkedin.com/post-inspector/inspect/${encodeURIComponent(
    BASE_URL
  )}`,
  pinterest: `https://developers.pinterest.com/tools/url-debugger/?link=${encodeURIComponent(
    BASE_URL
  )}`,
};

// Expected meta tags
const expectedMetaTags = {
  "og:title": "騎跡｜騎行體驗分享平台 - 台灣單車文化軌跡",
  "og:description": /騎跡，台灣首創的騎行體驗分享平台/,
  "og:type": "website",
  "og:url": BASE_URL,
  "og:image": /social-share-banner\.png/,
  "og:image:width": "1200",
  "og:image:height": "630",
  "og:locale": "zh_TW",
  "og:site_name": "騎跡｜騎行體驗分享平台",
  "twitter:card": "summary_large_image",
  "twitter:site": "@bikelife_tw",
  "twitter:creator": "@bikelife_tw",
  "twitter:title": "騎跡｜騎行體驗分享平台 - 台灣單車文化軌跡",
  "twitter:description": /騎跡，台灣首創的騎行體驗分享平台/,
  "twitter:image": /social-share-banner\.png/,
};

/**
 * Fetch HTML content from URL
 */
function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith("https") ? https : http;

    client
      .get(url, (res) => {
        let data = "";

        res.on("data", (chunk) => {
          data += chunk;
        });

        res.on("end", () => {
          resolve(data);
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

/**
 * Extract meta tags from HTML
 */
function extractMetaTags(html) {
  const metaTags = {};
  const metaRegex =
    /<meta[^>]+(?:property|name)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  const linkRegex =
    /<link[^>]+rel=["']([^"']+)["'][^>]+href=["']([^"']+)["'][^>]*>/gi;

  let match;

  // Extract meta tags
  while ((match = metaRegex.exec(html)) !== null) {
    const [, property, content] = match;
    metaTags[property] = content;
  }

  // Extract link tags (for canonical, etc.)
  while ((match = linkRegex.exec(html)) !== null) {
    const [, rel, href] = match;
    if (rel === "canonical") {
      metaTags["canonical"] = href;
    }
  }

  return metaTags;
}

/**
 * Validate meta tags against expected values
 */
function validateMetaTags(metaTags) {
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
    details: [],
  };

  for (const [tag, expectedValue] of Object.entries(expectedMetaTags)) {
    const actualValue = metaTags[tag];

    if (!actualValue) {
      results.failed++;
      results.details.push({
        tag,
        status: "FAILED",
        expected: expectedValue,
        actual: "MISSING",
        message: `Missing required meta tag: ${tag}`,
      });
    } else if (expectedValue instanceof RegExp) {
      if (expectedValue.test(actualValue)) {
        results.passed++;
        results.details.push({
          tag,
          status: "PASSED",
          expected: expectedValue.toString(),
          actual: actualValue,
        });
      } else {
        results.failed++;
        results.details.push({
          tag,
          status: "FAILED",
          expected: expectedValue.toString(),
          actual: actualValue,
          message: `Value does not match expected pattern`,
        });
      }
    } else if (actualValue === expectedValue) {
      results.passed++;
      results.details.push({
        tag,
        status: "PASSED",
        expected: expectedValue,
        actual: actualValue,
      });
    } else {
      results.failed++;
      results.details.push({
        tag,
        status: "FAILED",
        expected: expectedValue,
        actual: actualValue,
        message: `Value does not match expected value`,
      });
    }
  }

  return results;
}

/**
 * Test social media platforms
 */
async function testSocialMediaPlatforms() {
  console.log("🔍 Testing Social Media Optimization for bike-life.net\n");

  try {
    console.log("📡 Fetching website content...");
    const html = await fetchHTML(BASE_URL);
    console.log("✅ Website content fetched successfully\n");

    console.log("🔍 Extracting meta tags...");
    const metaTags = extractMetaTags(html);
    console.log(`✅ Found ${Object.keys(metaTags).length} meta tags\n`);

    console.log("✅ Validating meta tags...");
    const validation = validateMetaTags(metaTags);

    // Display results
    console.log("\n📊 Validation Results:");
    console.log(`✅ Passed: ${validation.passed}`);
    console.log(`❌ Failed: ${validation.failed}`);
    console.log(`⚠️  Warnings: ${validation.warnings}`);

    console.log("\n📋 Detailed Results:");
    validation.details.forEach((detail) => {
      const icon = detail.status === "PASSED" ? "✅" : "❌";
      console.log(`${icon} ${detail.tag}: ${detail.status}`);
      if (detail.message) {
        console.log(`   ${detail.message}`);
      }
      if (detail.expected !== detail.actual) {
        console.log(`   Expected: ${detail.expected}`);
        console.log(`   Actual: ${detail.actual}`);
      }
    });

    // Display test URLs
    console.log("\n🔗 Social Media Testing URLs:");
    Object.entries(testUrls).forEach(([platform, url]) => {
      console.log(`${platform.toUpperCase()}: ${url}`);
    });

    // Generate report
    const report = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      results: validation,
      metaTags: metaTags,
      testUrls: testUrls,
    };

    const reportPath = path.join(__dirname, "../social-media-test-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to: ${reportPath}`);

    // Recommendations
    console.log("\n💡 Recommendations:");
    if (validation.failed > 0) {
      console.log("• Fix failed meta tags before deploying");
    }
    console.log(
      "• Test with actual social media platforms using the URLs above"
    );
    console.log("• Consider adding structured data (JSON-LD) for better SEO");
    console.log("• Optimize images for different platform requirements");
    console.log(
      "• Monitor social media analytics to track sharing performance"
    );
  } catch (error) {
    console.error("❌ Error testing social media optimization:", error.message);
    process.exit(1);
  }
}

/**
 * Check if required files exist
 */
function checkRequiredFiles() {
  const requiredFiles = [
    "../public/social-share-banner.png",
    "../app/layout.tsx",
    "../lib/social-media-meta.ts",
  ];

  console.log("🔍 Checking required files...");

  requiredFiles.forEach((file) => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file} (missing)`);
    }
  });

  console.log("");
}

// Run the script
if (require.main === module) {
  checkRequiredFiles();
  testSocialMediaPlatforms();
}

module.exports = {
  testSocialMediaPlatforms,
  validateMetaTags,
  extractMetaTags,
};
