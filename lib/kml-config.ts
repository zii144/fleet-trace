import type { KMLFile } from "@/types/questionnaire"

export interface KMLFileConfig extends KMLFile {
  description?: string
  category: 'round-island-main' | 'round-island' | 'round-island-alternative' | 'diverse' | 'scenic' | 'custom'
  addedDate: string
  filename: string
}

export const KML_FILES: KMLFileConfig[] = [
  // Round Island Routes
  {
    id: "route-1",
    name: "環島 1 號線",
    filename: "route-1.kml",
    url: "/kml/route-1.kml",
    color: "#ff6b6b",
    visible: true,
    category: "round-island-main",
    addedDate: "2025-07-19",
    description: "主要環島路線"
  },
  {
    id: "route-1-1",
    name: "環島 1-1 號線",
    filename: "route-1-1.kml",
    url: "/kml/route-1-1.kml",
    color: "#ff6b6b",
    visible: true,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "主要環島路線",
  },
  {
    id: "route-1-2",
    name: "環島 1-2 號線",
    filename: "route-1-2.kml",
    url: "/kml/route-1-2.kml",
    color: "#4ecdc4",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線",
  },
  {
    id: "route-1-3",
    name: "環島 1-3 號線",
    filename: "route-1-3.kml",
    url: "/kml/route-1-3.kml",
    color: "#45b7d1",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-4",
    name: "環島 1-4 號線",
    filename: "route-1-4.kml",
    url: "/kml/route-1-4.kml",
    color: "#96ceb4",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-5",
    name: "環島 1-5 號線",
    filename: "route-1-5.kml",
    url: "/kml/route-1-5.kml",
    color: "#feca57",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-6",
    name: "環島 1-6 號線",
    filename: "route-1-6.kml",
    url: "/kml/route-1-6.kml",
    color: "#ff9ff3",
    visible: false,
    category: "round-island",
    addedDate: "2025-01-15",
    description: "環島主要路線"
  },
  {
    id: "route-1-7",
    name: "環島 1-7 號線",
    filename: "route-1-7.kml",
    url: "/kml/route-1-7.kml",
    color: "#54a0ff",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-10",
    name: "環島 1-10 號線",
    filename: "route-1-10.kml",
    url: "/kml/route-1-10.kml",
    color: "#5f27cd",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-11",
    name: "環島 1-11 號線",
    filename: "route-1-11.kml",
    url: "/kml/route-1-11.kml",
    color: "#00d2d3",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-13",
    name: "環島 1-13 號線",
    filename: "route-1-13.kml",
    url: "/kml/route-1-13.kml",
    color: "#ff6348",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-15",
    name: "環島 1-15 號線",
    filename: "route-1-15.kml",
    url: "/kml/route-1-15.kml",
    color: "#2ed573",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-18",
    name: "環島 1-18 號線",
    filename: "route-1-18.kml",
    url: "/kml/route-1-18.kml",
    color: "#ffa502",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-19",
    name: "環島 1-19 號線",
    filename: "route-1-19.kml",
    url: "/kml/route-1-19.kml",
    color: "#3742fa",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-20",
    name: "環島 1-20 號線",
    filename: "route-1-20.kml",
    url: "/kml/route-1-20.kml",
    color: "#2f3542",
    visible: false,
    category: "round-island",
    addedDate: "2025-07-5",
    description: "環島主要路線"
  },
  {
    id: "route-1-replace-t-l",
    name: "環1替代路線(土城-龍潭)",
    filename: "route-1-replace-t-l.kml",
    url: "/kml/route-1-replace-t-l.kml",
    color: "#2f3542",
    visible: false,
    category: "round-island-alternative",
    addedDate: "2025-07-5",
    description: "環島替代路線"
  },
  {
    id: "route-1-replace-s-q",
    name: "環1替代路線(松山-七堵)",
    filename: "route-1-replace-s-q.kml",
    url: "/kml/route-1-replace-s-q.kml",
    color: "#2f3542",
    visible: false,
    category: "round-island-alternative",
    addedDate: "2025-07-5",
    description: "環島替代路線"
  },
    {
    id: "route-1-2-replace-g-g",
    name: "環1-2替代路線(高原-關西)",
    filename: "route-1-2-replace-g-g.kml",
    url: "/kml/route-1-2-replace-g-g.kml",
    color: "#4ecdc4",
    visible: false,
    category: "round-island-alternative",
    addedDate: "2025-07-5",
    description: "環島替代路線"
  },

  // Diverse Routes
  {
    id: "route-chiayi-sugarrail",
    name: "嘉義糖鐵、夕鹽",
    filename: "route-chiayi-sugarrail.kml",
    url: "/kml/route-chiayi-sugarrail.kml",
    color: "#ff6b6b",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-dapengbay",
    name: "大鵬灣",
    filename: "route-dapengbay.kml",
    url: "/kml/route-dapengbay.kml",
    color: "#2f3542",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-gamalan",
    name: "噶瑪蘭",
    filename: "route-gamalan.kml",
    url: "/kml/route-gamalan.kml",
    color: "#2f3542",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-guashan-triathlon",
    name: "卦山三鐵",
    filename: "route-guashan-triathlon.kml",
    url: "/kml/route-guashan-triathlon.kml",
    color: "#4ecdc4",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-hot-spring",
    name: "溫泉巡禮、板塊騎遇、森林遊蹤",
    filename: "route-hot-spring.kml",
    url: "/kml/route-hot-spring.kml",
    color: "#4ecdc4",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-huangginsanhai",
    name: "黃金山海",
    filename: "route-huangginsanhai.kml",
    url: "/kml/route-huangginsanhai.kml",
    color: "#45b7d1",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-huilan-wave",
    name: "洄瀾漫波",
    filename: "route-huilan-wave.kml",
    url: "/kml/route-huilan-wave.kml",
    color: "#96ceb4",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-indigenous",
    name: "原鄉尋音、波光稻浪、觀山親水",
    filename: "route-indigenous.kml",
    url: "/kml/route-indigenous.kml",
    color: "#feca57",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-jhudao",
    name: "菊島",
    filename: "route-jhudao.kml",
    url: "/kml/route-jhudao.kml",
    color: "#ff9ff3",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-kaohsiung-hill",
    name: "高雄山城",
    filename: "route-kaohsiung-hill.kml",
    url: "/kml/route-kaohsiung-hill.kml",
    color: "#54a0ff",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-lingbo-guantian",
    name: "菱波官田",
    filename: "route-lingbo-guantian.kml",
    url: "/kml/route-lingbo-guantian.kml",
    color: "#5f27cd",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-madaochenggong",
    name: "馬到成功",
    filename: "route-madaochenggong.kml",
    url: "/kml/route-madaochenggong.kml",
    color: "#00d2d3",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-shitou",
    name: "獅頭山",
    filename: "route-shitou.kml",
    url: "/kml/route-shitou.kml",
    color: "#ff6348",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-sunmoonlake",
    name: "日月潭",
    filename: "route-sunmoonlake.kml",
    url: "/kml/route-sunmoonlake.kml",
    color: "#2ed573",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  },
  {
    id: "route-taijiang",
    name: "台江",
    filename: "route-taijiang.kml",
    url: "/kml/route-taijiang.kml",
    color: "#ffa502",
    visible: false,
    category: "diverse",
    addedDate: "2025-07-5",
    description: "多元路線"
  }
]

// Helper functions
export function getKMLFilesByCategory(category: string): KMLFileConfig[] {
  return KML_FILES.filter(kml => kml.category === category)
}

export function getKMLFileById(id: string): KMLFileConfig | undefined {
  return KML_FILES.find(kml => kml.id === id)
}

export function getAllKMLFiles(): KMLFileConfig[] {
  return KML_FILES
}

export function getKMLCategories(): string[] {
  return [...new Set(KML_FILES.map(kml => kml.category))]
}

// Validation function
export async function validateKMLFile(kmlFile: KMLFileConfig): Promise<boolean> {
  try {
    const response = await fetch(kmlFile.url, { method: 'HEAD' })
    return response.ok
  } catch {
    return false
  }
}

export async function validateAllKMLFiles(): Promise<{
  valid: KMLFileConfig[]
  invalid: KMLFileConfig[]
  totalCount: number
}> {
  const results = await Promise.all(
    KML_FILES.map(async (kml) => {
      const isValid = await validateKMLFile(kml)
      return { kml, isValid }
    })
  )

  const valid = results.filter(r => r.isValid).map(r => r.kml)
  const invalid = results.filter(r => !r.isValid).map(r => r.kml)

  return {
    valid,
    invalid,
    totalCount: KML_FILES.length
  }
}
