#!/usr/bin/env node

/**
 * PNG Banner Generator for bike-life.net
 * Generates a professional social media banner in PNG format
 */

const fs = require("fs");
const path = require("path");

// Simple banner generation using HTML/CSS that can be converted to PNG
function generateBannerHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
    }
    .banner {
      width: 1200px;
      height: 630px;
      background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 50%, #1a1a1a 100%);
      position: relative;
      overflow: hidden;
      display: flex;
      align-items: center;
      padding: 60px;
      box-sizing: border-box;
    }
    .content {
      z-index: 2;
      position: relative;
    }
    .title {
      font-size: 72px;
      font-weight: 700;
      color: #00ff88;
      margin: 0 0 20px 0;
      text-shadow: 0 0 20px rgba(0, 255, 136, 0.5);
    }
    .subtitle {
      font-size: 36px;
      font-weight: 500;
      color: #ffffff;
      margin: 0 0 15px 0;
    }
    .description {
      font-size: 24px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.8);
      margin: 0 0 20px 0;
    }
    .tagline {
      font-size: 18px;
      font-weight: 400;
      color: rgba(0, 255, 136, 0.7);
      margin: 0;
    }
    .decoration {
      position: absolute;
      right: 60px;
      top: 50%;
      transform: translateY(-50%);
      width: 200px;
      height: 200px;
      opacity: 0.3;
    }
    .circle {
      border: 3px solid #00ff88;
      border-radius: 50%;
      position: absolute;
    }
    .circle-1 {
      width: 160px;
      height: 160px;
      top: 20px;
      left: 20px;
    }
    .circle-2 {
      width: 120px;
      height: 120px;
      top: 40px;
      left: 40px;
      border-width: 2px;
    }
    .circle-3 {
      width: 80px;
      height: 80px;
      top: 60px;
      left: 60px;
      border-width: 1px;
    }
    .accent-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 8px;
      background: linear-gradient(90deg, #00ff88 0%, #00cc6a 100%);
    }
    .url {
      position: absolute;
      bottom: 30px;
      right: 40px;
      font-size: 16px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Roboto', sans-serif;
    }
    .dots {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.1;
    }
    .dot {
      position: absolute;
      background: #00ff88;
      border-radius: 50%;
    }
    .dot-1 { width: 4px; height: 4px; top: 100px; left: 100px; }
    .dot-2 { width: 3px; height: 3px; top: 150px; left: 300px; }
    .dot-3 { width: 2px; height: 2px; top: 80px; left: 500px; }
    .dot-4 { width: 5px; height: 5px; top: 200px; left: 700px; }
    .dot-5 { width: 3.6px; height: 3.6px; top: 120px; left: 900px; }
    .dot-6 { width: 2.4px; height: 2.4px; top: 180px; left: 1100px; }
  </style>
</head>
<body>
  <div class="banner">
    <div class="dots">
      <div class="dot dot-1"></div>
      <div class="dot dot-2"></div>
      <div class="dot dot-3"></div>
      <div class="dot dot-4"></div>
      <div class="dot dot-5"></div>
      <div class="dot dot-6"></div>
    </div>
    
    <div class="content">
      <h1 class="title">乘跡</h1>
      <h2 class="subtitle">台灣單車文化軌跡</h2>
      <p class="description">騎行體驗分享平台</p>
      <p class="tagline">讓每一段旅程都成為台灣單車文化的軌跡</p>
    </div>
    
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="accent-line"></div>
    <div class="url">bike-life.net</div>
  </div>
</body>
</html>`;
}

// Generate banner
function createBanner() {
  console.log("🎨 Creating PNG banner for bike-life.net...");

  const html = generateBannerHTML();
  const outputPath = path.join(__dirname, "../public/social-share-banner.html");

  try {
    fs.writeFileSync(outputPath, html);
    console.log("✅ HTML banner created successfully!");
    console.log(`📁 Location: ${outputPath}`);
    console.log("\n📋 Next steps:");
    console.log("1. Open the HTML file in a browser");
    console.log("2. Take a screenshot or use browser dev tools to save as PNG");
    console.log("3. Save as /public/social-share-banner.png (1200x630px)");
    console.log("4. Optimize the image for web (compress if needed)");
    console.log("\n🔧 Alternative methods:");
    console.log("• Use online HTML to PNG converters");
    console.log("• Use browser extensions for screenshot capture");
    console.log("• Use design tools like Figma or Canva");
    console.log("\n🧪 Test your banner:");
    console.log("• Facebook: https://developers.facebook.com/tools/debug/");
    console.log("• Twitter: https://cards-dev.twitter.com/validator");
    console.log("• LinkedIn: https://www.linkedin.com/post-inspector/");
  } catch (error) {
    console.error("❌ Error creating banner:", error);
  }
}

// Run the script
if (require.main === module) {
  createBanner();
}

module.exports = { generateBannerHTML, createBanner };
