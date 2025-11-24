#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Simple KML file configuration
const KML_FILES = [
  // Round Island Routes
  {
    id: "route-1",
    filename: "route-1.kml",
    name: "環島 1 號線",
    category: "round-island",
  },
  {
    id: "route-1-1",
    filename: "route-1-1.kml",
    name: "環島 1-1 號線",
    category: "round-island",
  },
  {
    id: "route-1-2",
    filename: "route-1-2.kml",
    name: "環島 1-2 號線",
    category: "round-island",
  },
  {
    id: "route-1-3",
    filename: "route-1-3.kml",
    name: "環島 1-3 號線",
    category: "round-island",
  },
  {
    id: "route-1-4",
    filename: "route-1-4.kml",
    name: "環島 1-4 號線",
    category: "round-island",
  },
  {
    id: "route-1-5",
    filename: "route-1-5.kml",
    name: "環島 1-5 號線",
    category: "round-island",
  },
  {
    id: "route-1-6",
    filename: "route-1-6.kml",
    name: "環島 1-6 號線",
    category: "round-island",
  },
  {
    id: "route-1-7",
    filename: "route-1-7.kml",
    name: "環島 1-7 號線",
    category: "round-island",
  },
  {
    id: "route-1-10",
    filename: "route-1-10.kml",
    name: "環島 1-10 號線",
    category: "round-island",
  },
  {
    id: "route-1-11",
    filename: "route-1-11.kml",
    name: "環島 1-11 號線",
    category: "round-island",
  },
  {
    id: "route-1-13",
    filename: "route-1-13.kml",
    name: "環島 1-13 號線",
    category: "round-island",
  },
  {
    id: "route-1-15",
    filename: "route-1-15.kml",
    name: "環島 1-15 號線",
    category: "round-island",
  },
  {
    id: "route-1-18",
    filename: "route-1-18.kml",
    name: "環島 1-18 號線",
    category: "round-island",
  },
  {
    id: "route-1-19",
    filename: "route-1-19.kml",
    name: "環島 1-19 號線",
    category: "round-island",
  },
  {
    id: "route-1-20",
    filename: "route-1-20.kml",
    name: "環島 1-20 號線",
    category: "round-island",
  },
  {
    id: "route-1-replace-t-l",
    filename: "route-1-replace-t-l.kml",
    name: "環1替代路線(土城-龍潭)",
    category: "round-island",
  },
  {
    id: "route-1-replace-s-q",
    filename: "route-1-replace-s-q.kml",
    name: "環1替代路線(松山-七堵)",
    category: "round-island",
  },
  {
    id: "route-1-2-replace-g-g",
    filename: "route-1-2-replace-g-g.kml",
    name: "環1-2替代路線(高原-關西)",
    category: "round-island",
  },

  // Diverse Routes
  {
    id: "route-chiayi-sugarrail",
    filename: "route-chiayi-sugarrail.kml",
    name: "嘉義糖鐵、夕鹽",
    category: "diverse",
  },
  {
    id: "route-dapengbay",
    filename: "route-dapengbay.kml",
    name: "大鵬灣",
    category: "diverse",
  },
  {
    id: "route-gamalan",
    filename: "route-gamalan.kml",
    name: "噶瑪蘭",
    category: "diverse",
  },
  {
    id: "route-guashan-triathlon",
    filename: "route-guashan-triathlon.kml",
    name: "卦山三鐵",
    category: "diverse",
  },
  {
    id: "route-hot-spring",
    filename: "route-hot-spring.kml",
    name: "溫泉巡禮、板塊騎遇、森林遊蹤",
    category: "diverse",
  },
  {
    id: "route-huangginsanhai",
    filename: "route-huangginsanhai.kml",
    name: "黃金山海",
    category: "diverse",
  },
  {
    id: "route-huilan-wave",
    filename: "route-huilan-wave.kml",
    name: "洄瀾漫波",
    category: "diverse",
  },
  {
    id: "route-indigenous",
    filename: "route-indigenous.kml",
    name: "原鄉尋音、波光稻浪、觀山親水",
    category: "diverse",
  },
  {
    id: "route-jhudao",
    filename: "route-jhudao.kml",
    name: "菊島",
    category: "diverse",
  },
  {
    id: "route-kaohsiung-hill",
    filename: "route-kaohsiung-hill.kml",
    name: "高雄山城",
    category: "diverse",
  },
  {
    id: "route-lingbo-guantian",
    filename: "route-lingbo-guantian.kml",
    name: "菱波官田",
    category: "diverse",
  },
  {
    id: "route-madaochenggong",
    filename: "route-madaochenggong.kml",
    name: "馬到成功",
    category: "diverse",
  },
  {
    id: "route-shitou",
    filename: "route-shitou.kml",
    name: "獅頭山",
    category: "diverse",
  },
  {
    id: "route-sunmoonlake",
    filename: "route-sunmoonlake.kml",
    name: "日月潭",
    category: "diverse",
  },
  {
    id: "route-taijiang",
    filename: "route-taijiang.kml",
    name: "台江",
    category: "diverse",
  },
];

async function validateKMLFiles() {
  console.log("🔍 Validating KML files...\n");

  const kmlDir = path.join(process.cwd(), "public", "kml");

  // Check if kml directory exists
  if (!fs.existsSync(kmlDir)) {
    console.error(`❌ KML directory not found: ${kmlDir}`);
    console.error(
      "Please create the public/kml/ directory and add your KML files."
    );
    process.exit(1);
  }

  const valid = [];
  const invalid = [];

  // Check each file
  for (const kml of KML_FILES) {
    const filePath = path.join(kmlDir, kml.filename);
    if (fs.existsSync(filePath)) {
      valid.push(kml);
    } else {
      invalid.push(kml);
    }
  }

  // Display results by category
  const categories = [...new Set(KML_FILES.map((kml) => kml.category))];

  for (const category of categories) {
    const categoryFiles = KML_FILES.filter((kml) => kml.category === category);
    const validInCategory = valid.filter((kml) => kml.category === category);
    const invalidInCategory = invalid.filter(
      (kml) => kml.category === category
    );

    console.log(
      `📂 ${category.toUpperCase()} (${validInCategory.length}/${
        categoryFiles.length
      })`
    );

    validInCategory.forEach((kml) => {
      console.log(`  ✅ ${kml.filename} - ${kml.name}`);
    });

    if (invalidInCategory.length > 0) {
      invalidInCategory.forEach((kml) => {
        console.log(`  ❌ ${kml.filename} - ${kml.name} (NOT FOUND)`);
      });
    }

    console.log("");
  }

  // Summary
  console.log("📊 Validation Summary:");
  console.log(`  • Total files: ${KML_FILES.length}`);
  console.log(`  • Valid files: ${valid.length} ✅`);
  console.log(`  • Missing files: ${invalid.length} ❌`);

  if (invalid.length > 0) {
    console.log("\n⚠️  Missing files details:");
    invalid.forEach((kml) => {
      console.log(
        `  • ${kml.filename} (${kml.category}) - Expected at: public/kml/${kml.filename}`
      );
    });

    console.log("\n💡 To fix missing files:");
    console.log("  1. Add the missing KML files to public/kml/");
    console.log("  2. Or remove their entries from lib/kml-config.ts");
    console.log("  3. Run this validation again");

    process.exit(1);
  } else {
    console.log("\n🎉 All KML files are valid and accessible!");
    process.exit(0);
  }
}

// Run the validation
validateKMLFiles().catch((error) => {
  console.error("💥 Unexpected error:", error.message);
  process.exit(1);
});
