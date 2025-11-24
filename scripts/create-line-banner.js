#!/usr/bin/env node

/**
 * LINE-Optimized Banner Generator for bike-life.net
 * Creates banners specifically optimized for LINE sharing in Taiwan
 */

const fs = require("fs");
const path = require("path");

// LINE-specific banner configuration
const lineBannerConfig = {
  width: 1200,
  height: 630,
  backgroundColor: "#1a1a1a",
  primaryColor: "#00ff88",
  secondaryColor: "#ffffff",
  accentColor: "#00c73c", // LINE green
  title: "乘跡",
  subtitle: "台灣單車文化軌跡",
  description: "騎行體驗分享平台",
  tagline: "讓每一段旅程都成為台灣單車文化的軌跡",
  lineTag: "分享你的騎行故事",
  ctaText: "立即體驗",
  backgroundPattern: "gradient",
};

// Generate LINE-optimized HTML banner
function generateLINEBannerHTML() {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Noto Sans TC', 'Microsoft JhengHei', 'PingFang TC', sans-serif;
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
      flex: 1;
    }
    .title {
      font-size: 80px;
      font-weight: 700;
      color: #00ff88;
      margin: 0 0 20px 0;
      text-shadow: 0 0 30px rgba(0, 255, 136, 0.6);
      letter-spacing: 2px;
    }
    .subtitle {
      font-size: 40px;
      font-weight: 600;
      color: #ffffff;
      margin: 0 0 15px 0;
      letter-spacing: 1px;
    }
    .description {
      font-size: 28px;
      font-weight: 400;
      color: rgba(255, 255, 255, 0.9);
      margin: 0 0 20px 0;
    }
    .tagline {
      font-size: 20px;
      font-weight: 400;
      color: rgba(0, 255, 136, 0.8);
      margin: 0 0 30px 0;
      line-height: 1.4;
    }
    .line-tag {
      display: inline-block;
      background: linear-gradient(90deg, #00c73c, #00ff88);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 20px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(90deg, #00ff88, #00cc6a);
      color: #1a1a1a;
      padding: 12px 24px;
      border-radius: 25px;
      font-size: 18px;
      font-weight: 600;
      text-decoration: none;
      box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
      transition: all 0.3s ease;
    }
    .cta-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 255, 136, 0.4);
    }
    .decoration {
      position: absolute;
      right: 60px;
      top: 50%;
      transform: translateY(-50%);
      width: 250px;
      height: 250px;
      opacity: 0.4;
    }
    .circle {
      border: 3px solid #00ff88;
      border-radius: 50%;
      position: absolute;
    }
    .circle-1 {
      width: 200px;
      height: 200px;
      top: 25px;
      left: 25px;
    }
    .circle-2 {
      width: 150px;
      height: 150px;
      top: 50px;
      left: 50px;
      border-width: 2px;
    }
    .circle-3 {
      width: 100px;
      height: 100px;
      top: 75px;
      left: 75px;
      border-width: 1px;
    }
    .accent-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 10px;
      background: linear-gradient(90deg, #00c73c 0%, #00ff88 50%, #00cc6a 100%);
    }
    .url {
      position: absolute;
      bottom: 30px;
      right: 40px;
      font-size: 18px;
      color: rgba(255, 255, 255, 0.7);
      font-family: 'Roboto', sans-serif;
      font-weight: 500;
    }
    .dots {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      opacity: 0.15;
    }
    .dot {
      position: absolute;
      background: #00ff88;
      border-radius: 50%;
    }
    .dot-1 { width: 6px; height: 6px; top: 80px; left: 120px; }
    .dot-2 { width: 4px; height: 4px; top: 180px; left: 350px; }
    .dot-3 { width: 3px; height: 3px; top: 120px; left: 550px; }
    .dot-4 { width: 7px; height: 7px; top: 220px; left: 750px; }
    .dot-5 { width: 5px; height: 5px; top: 100px; left: 950px; }
    .dot-6 { width: 4px; height: 4px; top: 160px; left: 1150px; }
    .line-icon {
      position: absolute;
      top: 40px;
      right: 40px;
      width: 40px;
      height: 40px;
      background: #00c73c;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 20px;
      font-weight: bold;
    }
    .bike-elements {
      position: absolute;
      bottom: 100px;
      right: 80px;
      opacity: 0.2;
    }
    .bike-wheel {
      width: 60px;
      height: 60px;
      border: 3px solid #00ff88;
      border-radius: 50%;
      position: relative;
    }
    .bike-wheel::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 20px;
      height: 20px;
      background: #00ff88;
      border-radius: 50%;
    }
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
    
    <div class="line-icon">L</div>
    
    <div class="content">
      <h1 class="title">${lineBannerConfig.title}</h1>
      <h2 class="subtitle">${lineBannerConfig.subtitle}</h2>
      <p class="description">${lineBannerConfig.description}</p>
      <p class="tagline">${lineBannerConfig.tagline}</p>
      <div class="line-tag">${lineBannerConfig.lineTag}</div>
      <div class="cta-button">${lineBannerConfig.ctaText}</div>
    </div>
    
    <div class="decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
    
    <div class="bike-elements">
      <div class="bike-wheel"></div>
    </div>
    
    <div class="accent-line"></div>
    <div class="url">bike-life.net</div>
  </div>
</body>
</html>`;
}

// Generate LINE-optimized SVG banner
function generateLINEBannerSVG() {
  return `
<svg width="${lineBannerConfig.width}" height="${
    lineBannerConfig.height
  }" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00c73c;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#00ff88;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00cc6a;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  
  <!-- Background Pattern -->
  <g opacity="0.15">
    <circle cx="120" cy="80" r="3" fill="${lineBannerConfig.primaryColor}"/>
    <circle cx="350" cy="180" r="2" fill="${lineBannerConfig.primaryColor}"/>
    <circle cx="550" cy="120" r="1.5" fill="${lineBannerConfig.primaryColor}"/>
    <circle cx="750" cy="220" r="3.5" fill="${lineBannerConfig.primaryColor}"/>
    <circle cx="950" cy="100" r="2.5" fill="${lineBannerConfig.primaryColor}"/>
    <circle cx="1150" cy="160" r="2" fill="${lineBannerConfig.primaryColor}"/>
  </g>
  
  <!-- Main Content Area -->
  <g transform="translate(60, 120)">
    <!-- Title -->
    <text x="0" y="0" font-family="'Noto Sans TC', sans-serif" font-size="80" font-weight="700" fill="${
      lineBannerConfig.primaryColor
    }" filter="url(#glow)" letter-spacing="2">
      ${lineBannerConfig.title}
    </text>
    
    <!-- Subtitle -->
    <text x="0" y="90" font-family="'Noto Sans TC', sans-serif" font-size="40" font-weight="600" fill="${
      lineBannerConfig.secondaryColor
    }" letter-spacing="1">
      ${lineBannerConfig.subtitle}
    </text>
    
    <!-- Description -->
    <text x="0" y="150" font-family="'Noto Sans TC', sans-serif" font-size="28" font-weight="400" fill="${
      lineBannerConfig.secondaryColor
    }" opacity="0.9">
      ${lineBannerConfig.description}
    </text>
    
    <!-- Tagline -->
    <text x="0" y="200" font-family="'Noto Sans TC', sans-serif" font-size="20" font-weight="400" fill="${
      lineBannerConfig.primaryColor
    }" opacity="0.8">
      ${lineBannerConfig.tagline}
    </text>
    
    <!-- LINE Tag -->
    <rect x="0" y="240" width="200" height="40" rx="20" fill="url(#accentGradient)"/>
    <text x="100" y="265" font-family="'Noto Sans TC', sans-serif" font-size="16" font-weight="500" fill="white" text-anchor="middle">
      ${lineBannerConfig.lineTag}
    </text>
    
    <!-- CTA Button -->
    <rect x="0" y="300" width="150" height="45" rx="22.5" fill="url(#accentGradient)"/>
    <text x="75" y="328" font-family="'Noto Sans TC', sans-serif" font-size="18" font-weight="600" fill="#1a1a1a" text-anchor="middle">
      ${lineBannerConfig.ctaText}
    </text>
  </g>
  
  <!-- LINE Icon -->
  <circle cx="1160" cy="80" r="20" fill="#00c73c"/>
  <text x="1160" y="88" font-family="'Arial', sans-serif" font-size="16" font-weight="bold" fill="white" text-anchor="middle">L</text>
  
  <!-- Decorative Elements -->
  <g transform="translate(900, 200)">
    <g fill="${lineBannerConfig.primaryColor}" opacity="0.4">
      <circle cx="0" cy="0" r="100" stroke="${
        lineBannerConfig.primaryColor
      }" stroke-width="3" fill="none"/>
      <circle cx="0" cy="0" r="75" stroke="${
        lineBannerConfig.primaryColor
      }" stroke-width="2" fill="none"/>
      <circle cx="0" cy="0" r="50" stroke="${
        lineBannerConfig.primaryColor
      }" stroke-width="1" fill="none"/>
    </g>
  </g>
  
  <!-- Bike Elements -->
  <g transform="translate(1100, 500)" opacity="0.2">
    <circle cx="0" cy="0" r="30" stroke="${
      lineBannerConfig.primaryColor
    }" stroke-width="3" fill="none"/>
    <circle cx="0" cy="0" r="10" fill="${lineBannerConfig.primaryColor}"/>
  </g>
  
  <!-- Bottom Accent Line -->
  <rect x="0" y="${
    lineBannerConfig.height - 10
  }" width="100%" height="10" fill="url(#accentGradient)"/>
  
  <!-- URL -->
  <text x="${lineBannerConfig.width - 40}" y="${
    lineBannerConfig.height - 30
  }" font-family="'Roboto', sans-serif" font-size="18" font-weight="500" fill="${
    lineBannerConfig.secondaryColor
  }" opacity="0.7" text-anchor="end">
    bike-life.net
  </text>
</svg>`;
}

// Generate LINE banner
function createLINEBanner() {
  console.log("🎨 Creating LINE-optimized banner for bike-life.net...");

  const html = generateLINEBannerHTML();
  const svg = generateLINEBannerSVG();

  const htmlPath = path.join(__dirname, "../public/line-share-banner.html");
  const svgPath = path.join(__dirname, "../public/line-share-banner.svg");

  try {
    fs.writeFileSync(htmlPath, html);
    fs.writeFileSync(svgPath, svg);

    console.log("✅ LINE banner created successfully!");
    console.log(`📁 HTML Location: ${htmlPath}`);
    console.log(`📁 SVG Location: ${svgPath}`);
    console.log("\n📋 LINE-specific optimizations:");
    console.log("• Enhanced typography for Chinese text");
    console.log("• LINE green accent color (#00c73c)");
    console.log("• Larger, more readable text sizes");
    console.log("• Call-to-action button for engagement");
    console.log("• LINE branding elements");
    console.log("• Optimized for mobile sharing");
    console.log("\n📋 Next steps:");
    console.log("1. Open line-share-banner.html in browser");
    console.log("2. Take screenshot and save as line-share-banner.png");
    console.log("3. Test sharing on LINE app");
    console.log("4. Update meta tags for LINE optimization");
    console.log("\n🧪 Test on LINE:");
    console.log("• Share the URL in LINE chat");
    console.log("• Check preview in LINE timeline");
    console.log("• Test on both iOS and Android");
  } catch (error) {
    console.error("❌ Error creating LINE banner:", error);
  }
}

// Run the script
if (require.main === module) {
  createLINEBanner();
}

module.exports = {
  generateLINEBannerHTML,
  generateLINEBannerSVG,
  createLINEBanner,
};
