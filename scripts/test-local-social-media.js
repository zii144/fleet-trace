#!/usr/bin/env node

/**
 * Local Social Media Meta Tags Testing Script
 * Tests social media optimization for local development
 */

const fs = require("fs");
const path = require("path");

// Test the local files directly
function testLocalFiles() {
  console.log("🔍 Testing Local Social Media Optimization for bike-life.net\n");

  try {
    // Check if required files exist
    console.log("📁 Checking required files...");
    const requiredFiles = [
      "../public/social-share-banner.png",
      "../app/layout.tsx",
      "../lib/social-media-meta.ts",
      "../components/SocialMediaPreview.tsx",
    ];

    let allFilesExist = true;
    requiredFiles.forEach((file) => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        console.log(`✅ ${file}`);
      } else {
        console.log(`❌ ${file} (missing)`);
        allFilesExist = false;
      }
    });

    if (!allFilesExist) {
      console.log(
        "\n❌ Some required files are missing. Please create them first."
      );
      return;
    }

    console.log("\n📄 Analyzing layout.tsx metadata...");
    const layoutPath = path.join(__dirname, "../app/layout.tsx");
    const layoutContent = fs.readFileSync(layoutPath, "utf8");

    // Extract metadata configuration
    const metadataMatch = layoutContent.match(
      /export const metadata: Metadata = \{([\s\S]*?)\};/
    );

    if (metadataMatch) {
      const metadataContent = metadataMatch[1];

      // Check for required Open Graph tags
      const ogChecks = [
        { name: "og:title", pattern: /title:\s*"([^"]+)"/ },
        { name: "og:description", pattern: /description:\s*"([^"]+)"/ },
        { name: "og:type", pattern: /type:\s*"([^"]+)"/ },
        { name: "og:url", pattern: /url:\s*"([^"]+)"/ },
        { name: "og:locale", pattern: /locale:\s*"([^"]+)"/ },
        { name: "og:site_name", pattern: /siteName:\s*"([^"]+)"/ },
        { name: "og:image", pattern: /url:\s*"([^"]+)"/ },
        { name: "og:image:width", pattern: /width:\s*(\d+)/ },
        { name: "og:image:height", pattern: /height:\s*(\d+)/ },
      ];

      const twitterChecks = [
        { name: "twitter:card", pattern: /card:\s*"([^"]+)"/ },
        { name: "twitter:site", pattern: /site:\s*"([^"]+)"/ },
        { name: "twitter:creator", pattern: /creator:\s*"([^"]+)"/ },
        { name: "twitter:title", pattern: /title:\s*"([^"]+)"/ },
        { name: "twitter:description", pattern: /description:\s*"([^"]+)"/ },
        { name: "twitter:image", pattern: /images:\s*\["([^"]+)"\]/ },
      ];

      console.log("\n📊 Open Graph Tags Analysis:");
      let ogPassed = 0;
      let ogFailed = 0;

      ogChecks.forEach((check) => {
        const match = metadataContent.match(check.pattern);
        if (match) {
          console.log(`✅ ${check.name}: ${match[1]}`);
          ogPassed++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
          ogFailed++;
        }
      });

      console.log("\n📊 Twitter Card Tags Analysis:");
      let twitterPassed = 0;
      let twitterFailed = 0;

      twitterChecks.forEach((check) => {
        const match = metadataContent.match(check.pattern);
        if (match) {
          console.log(`✅ ${check.name}: ${match[1]}`);
          twitterPassed++;
        } else {
          console.log(`❌ ${check.name}: Missing`);
          twitterFailed++;
        }
      });

      console.log("\n📈 Summary:");
      console.log(`Open Graph: ${ogPassed}/${ogChecks.length} passed`);
      console.log(
        `Twitter Cards: ${twitterPassed}/${twitterChecks.length} passed`
      );
      console.log(
        `Total: ${ogPassed + twitterPassed}/${
          ogChecks.length + twitterChecks.length
        } passed`
      );
    } else {
      console.log("❌ Could not find metadata configuration in layout.tsx");
    }

    // Check social media preview component
    console.log("\n🔍 Checking Social Media Preview Component...");
    const previewPath = path.join(
      __dirname,
      "../components/SocialMediaPreview.tsx"
    );
    if (fs.existsSync(previewPath)) {
      console.log("✅ SocialMediaPreview.tsx exists");
    } else {
      console.log("❌ SocialMediaPreview.tsx missing");
    }

    // Check social media meta utility
    console.log("\n🔍 Checking Social Media Meta Utility...");
    const metaPath = path.join(__dirname, "../lib/social-media-meta.ts");
    if (fs.existsSync(metaPath)) {
      console.log("✅ social-media-meta.ts exists");
    } else {
      console.log("❌ social-media-meta.ts missing");
    }

    // Generate recommendations
    console.log("\n💡 Recommendations:");
    console.log("1. Start your development server: npm run dev");
    console.log(
      "2. Visit http://localhost:3000/social-preview to test the preview tool"
    );
    console.log("3. Test with actual social media platforms:");
    console.log("   - Facebook: https://developers.facebook.com/tools/debug/");
    console.log("   - Twitter: https://cards-dev.twitter.com/validator");
    console.log("   - LinkedIn: https://www.linkedin.com/post-inspector/");
    console.log("4. Convert the HTML banner to PNG:");
    console.log("   - Open public/social-share-banner.html in browser");
    console.log(
      "   - Take screenshot and save as public/social-share-banner.png"
    );
    console.log(
      "5. Update your Facebook App ID and other platform IDs in layout.tsx"
    );

    // Generate test report
    const report = {
      timestamp: new Date().toISOString(),
      testType: "local",
      files: requiredFiles.map((file) => ({
        path: file,
        exists: fs.existsSync(path.join(__dirname, file)),
      })),
      recommendations: [
        "Start development server and test locally",
        "Convert HTML banner to PNG",
        "Update platform-specific IDs",
        "Test with social media debugging tools",
      ],
    };

    const reportPath = path.join(
      __dirname,
      "../local-social-media-test-report.json"
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 Local test report saved to: ${reportPath}`);
  } catch (error) {
    console.error(
      "❌ Error testing local social media optimization:",
      error.message
    );
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  testLocalFiles();
}

module.exports = { testLocalFiles };
