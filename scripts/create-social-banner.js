#!/usr/bin/env node

/**
 * Social Media Banner Generator for bike-life.net
 * This script creates a professional banner for social media sharing
 */

const fs = require("fs");
const path = require("path");

// Banner configuration
const bannerConfig = {
  width: 1200,
  height: 630,
  backgroundColor: "#1a1a1a",
  primaryColor: "#00ff88",
  secondaryColor: "#ffffff",
  title: "騎跡",
  subtitle: "台灣單車文化軌跡",
  description: "騎行體驗分享平台",
  tagline: "讓每一段旅程都成為台灣單車文化的軌跡",
  logo: "/icon-512x512.png",
  backgroundPattern: "gradient",
};

// Generate SVG banner
function generateSVGBanner() {
  const svg = `
<svg width="${bannerConfig.width}" height="${
    bannerConfig.height
  }" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#00ff88;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#00cc6a;stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
      <feMerge> 
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bgGradient)"/>
  
  <!-- Background Pattern -->
  <g opacity="0.1">
    <circle cx="100" cy="100" r="2" fill="${bannerConfig.primaryColor}"/>
    <circle cx="300" cy="150" r="1.5" fill="${bannerConfig.primaryColor}"/>
    <circle cx="500" cy="80" r="1" fill="${bannerConfig.primaryColor}"/>
    <circle cx="700" cy="200" r="2.5" fill="${bannerConfig.primaryColor}"/>
    <circle cx="900" cy="120" r="1.8" fill="${bannerConfig.primaryColor}"/>
    <circle cx="1100" cy="180" r="1.2" fill="${bannerConfig.primaryColor}"/>
  </g>
  
  <!-- Main Content Area -->
  <g transform="translate(60, 120)">
    <!-- Title -->
    <text x="0" y="0" font-family="'Noto Sans TC', sans-serif" font-size="72" font-weight="700" fill="${
      bannerConfig.primaryColor
    }" filter="url(#glow)">
      ${bannerConfig.title}
    </text>
    
    <!-- Subtitle -->
    <text x="0" y="80" font-family="'Noto Sans TC', sans-serif" font-size="36" font-weight="500" fill="${
      bannerConfig.secondaryColor
    }">
      ${bannerConfig.subtitle}
    </text>
    
    <!-- Description -->
    <text x="0" y="140" font-family="'Noto Sans TC', sans-serif" font-size="24" font-weight="400" fill="${
      bannerConfig.secondaryColor
    }" opacity="0.8">
      ${bannerConfig.description}
    </text>
    
    <!-- Tagline -->
    <text x="0" y="200" font-family="'Noto Sans TC', sans-serif" font-size="18" font-weight="400" fill="${
      bannerConfig.primaryColor
    }" opacity="0.7">
      ${bannerConfig.tagline}
    </text>
  </g>
  
  <!-- Decorative Elements -->
  <g transform="translate(800, 200)">
    <!-- Bike Icon -->
    <g fill="${bannerConfig.primaryColor}" opacity="0.3">
      <circle cx="0" cy="0" r="80" stroke="${
        bannerConfig.primaryColor
      }" stroke-width="3" fill="none"/>
      <circle cx="0" cy="0" r="60" stroke="${
        bannerConfig.primaryColor
      }" stroke-width="2" fill="none"/>
      <circle cx="0" cy="0" r="40" stroke="${
        bannerConfig.primaryColor
      }" stroke-width="1" fill="none"/>
    </g>
  </g>
  
  <!-- Bottom Accent Line -->
  <rect x="0" y="${
    bannerConfig.height - 8
  }" width="100%" height="8" fill="url(#accentGradient)"/>
  
  <!-- URL -->
  <text x="${bannerConfig.width - 40}" y="${
    bannerConfig.height - 30
  }" font-family="'Roboto', sans-serif" font-size="16" font-weight="400" fill="${
    bannerConfig.secondaryColor
  }" opacity="0.6" text-anchor="end">
    bike-life.net
  </text>
</svg>`;

  return svg;
}

// Generate banner
function createBanner() {
  console.log("🎨 Creating social media banner for bike-life.net...");

  const svg = generateSVGBanner();
  const outputPath = path.join(__dirname, "../public/social-share-banner.svg");

  try {
    fs.writeFileSync(outputPath, svg);
    console.log("✅ SVG banner created successfully!");
    console.log(`📁 Location: ${outputPath}`);
    console.log("\n📋 Next steps:");
    console.log("1. Convert SVG to PNG using online tools or ImageMagick");
    console.log("2. Optimize the PNG for web (recommended size: 1200x630px)");
    console.log("3. Place the PNG file as /public/social-share-banner.png");
    console.log("4. Test the social media preview using:");
    console.log("   - Facebook: https://developers.facebook.com/tools/debug/");
    console.log("   - Twitter: https://cards-dev.twitter.com/validator");
    console.log("   - LinkedIn: https://www.linkedin.com/post-inspector/");
  } catch (error) {
    console.error("❌ Error creating banner:", error);
  }
}

// Run the script
if (require.main === module) {
  createBanner();
}

module.exports = { generateSVGBanner, createBanner };
