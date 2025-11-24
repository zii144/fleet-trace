// Upload complete questionnaires from lib/questionnaire.ts to Firestore
// This script ensures we use the single source of truth for questionnaire content

const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  collection,
  getDocs,
  deleteDoc,
  addDoc,
} = require("firebase/firestore");

// Firebase configuration - matches your existing config
const firebaseConfig = {
  apiKey: "AIzaSyAV3Nk3hVLy4OB9sB_vDZPiGNYqjhiEDPo",
  authDomain: "velo-trace.firebaseapp.com",
  projectId: "velo-trace",
  storageBucket: "velo-trace.firebasestorage.app",
  messagingSenderId: "503949053734",
  appId: "1:503949053734:web:00d82f21b825b3b99b0b58",
  measurementId: "G-2LTJF76YVS",
};

// KML configuration helper - matches your lib/kml-config.ts
function getKMLFilesByCategory(category) {
  const roundIslandKML = [
    "route-1.kml",
    "route-1-1.kml",
    "route-1-2.kml",
    "route-1-3.kml",
    "route-1-4.kml",
    "route-1-5.kml",
    "route-1-6.kml",
    "route-1-7.kml",
    "route-1-8.kml",
    "route-1-9.kml",
    "route-1-10.kml",
    "route-1-11.kml",
    "route-1-12.kml",
    "route-1-13.kml",
    "route-1-14.kml",
    "route-1-15.kml",
    "route-1-16.kml",
    "route-1-17.kml",
  ];

  const diverseKML = [
    "route-2.kml",
    "route-3.kml",
    "route-4.kml",
    "route-5.kml",
    "route-6.kml",
    "route-7.kml",
    "route-8.kml",
    "route-9.kml",
    "route-10.kml",
    "route-11.kml",
    "route-12.kml",
    "route-13.kml",
    "route-14.kml",
    "route-15.kml",
    "route-16.kml",
  ];

  if (category === "round-island") {
    return roundIslandKML;
  } else if (category === "diverse") {
    return diverseKML;
  }
  return [];
}

// Convert KML files for map questions
function convertKMLForMapQuestion(kmlFiles) {
  return kmlFiles.map((filename) => ({
    name: filename.replace(".kml", ""),
    filename: filename,
    visible: true,
  }));
}

// Generate complete questionnaires - matches your lib/questionnaire.ts structure
function generateCompleteQuestionnaires() {
  const roundIslandKML = getKMLFilesByCategory("round-island");
  const diverseKML = getKMLFilesByCategory("diverse");

  return [
    {
      id: "cycling-survey-2025",
      title: "「環島自行車路線」使用情形及滿意度問卷",
      description:
        "本問卷目的在了解您曾經騎乘或本次騎乘「環島自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
      version: "1.0.0",
      organize: "交通部運輸研究所",
      createdAt: "2025-07-03T00:00:00+08:00",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: "basic-info",
          title: "受訪者基本資料",
          questions: [
            {
              id: "gender",
              type: "radio",
              label: "您的性別",
              required: true,
              options: ["男", "女", "其他"],
            },
            {
              id: "age",
              type: "radio",
              label: "您的年齡",
              required: true,
              options: [
                "12歲以下",
                "13~20歲",
                "21~30歲",
                "31~40歲",
                "41~50歲",
                "51~60歲",
                "61~64歲",
                "65歲以上",
              ],
            },
            {
              id: "city",
              type: "select",
              label: "您居住的縣市",
              required: true,
              options: [
                "基隆市",
                "臺北市",
                "新北市",
                "桃園市",
                "新竹市",
                "新竹縣",
                "苗栗縣",
                "臺中市",
                "彰化縣",
                "南投縣",
                "雲林縣",
                "嘉義市",
                "嘉義縣",
                "臺南市",
                "高雄市",
                "屏東縣",
                "宜蘭縣",
                "花蓮縣",
                "臺東縣",
                "澎湖縣",
                "金門縣",
                "連江縣",
                "其他",
              ],
            },
            {
              id: "recent-route",
              type: "map",
              label: "請選擇一條您近一年內曾騎乘過的環島自行車路線",
              required: true,
              options: [],
              defaultCenter: [23.8, 121.0],
              defaultZoom: 7,
              showLayerControl: true,
              kmlFiles: convertKMLForMapQuestion(roundIslandKML),
            },
            {
              id: "recent-route-date",
              type: "time",
              label: "最近一次騎乘該路線的時間",
              timeFormat: "YYYY-MM",
              required: true,
              minDate: "2020-01",
              maxDate: "2025-12",
            },
          ],
        },
        {
          id: "continuity",
          title: "一、連續性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "route-continuity",
              type: "radio",
              label: "路線連續性（例如：路線標示清楚、路段連接完整等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "signage-continuity",
              type: "radio",
              label: "指標連續性（例如：指標設置連續、方向指示明確等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "surface-continuity",
              type: "radio",
              label: "路面連續性（例如：路面平整、材質一致等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "safety",
          title: "二、安全性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "traffic-safety",
              type: "radio",
              label: "交通安全（例如：車道分隔明確、交通號誌適當等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "personal-safety",
              type: "radio",
              label: "人身安全（例如：照明充足、治安良好等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "road-safety",
              type: "radio",
              label: "道路安全（例如：護欄設置、危險路段警示等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "comfort",
          title: "三、舒適性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "riding-comfort",
              type: "radio",
              label: "騎乘舒適度（例如：路面平坦、坡度適中等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "weather-protection",
              type: "radio",
              label: "遮蔽設施（例如：涼亭、遮陽棚等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "rest-facilities",
              type: "radio",
              label: "休息設施（例如：座椅、休息區等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "accessibility",
          title: "四、無障礙性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "barrier-free-access",
              type: "radio",
              label: "無障礙通道（例如：斜坡道設置、通道寬度適當等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "facility-accessibility",
              type: "radio",
              label: "設施無障礙性（例如：廁所、停車場等設施可及性）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "information",
          title: "五、資訊提供",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "route-information",
              type: "radio",
              label: "路線資訊（例如：路線圖、距離標示等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "facility-information",
              type: "radio",
              label: "設施資訊（例如：服務設施位置、開放時間等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "scenic-information",
              type: "radio",
              label: "景點資訊（例如：景點介紹、文化說明等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "service-facilities",
          title: "六、服務設施",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "bike-parking",
              type: "radio",
              label: "自行車停車設施",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "restroom-facilities",
              type: "radio",
              label: "廁所設施",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "water-facilities",
              type: "radio",
              label: "飲水設施",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "repair-facilities",
              type: "radio",
              label: "維修設施（例如：打氣機、維修站等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "landscape",
          title: "七、景觀品質",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "natural-landscape",
              type: "radio",
              label: "自然景觀（例如：山景、海景、田園風光等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "cultural-landscape",
              type: "radio",
              label: "人文景觀（例如：歷史建築、文化遺址等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "environment-cleanliness",
              type: "radio",
              label: "環境整潔度",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "management",
          title: "八、管理維護",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "facility-maintenance",
              type: "radio",
              label: "設施維護狀況",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "route-maintenance",
              type: "radio",
              label: "路線維護狀況",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "signage-maintenance",
              type: "radio",
              label: "指標維護狀況",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "train-service",
          title: "九、台鐵服務",
          description:
            "請就您搭乘台鐵攜帶自行車的體驗，填答下列各項服務的滿意度：",
          questions: [
            {
              id: "bike-boarding",
              type: "radio",
              label: "自行車上下車便利性",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "bike-storage",
              type: "radio",
              label: "車廂內自行車放置空間",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "staff-service",
              type: "radio",
              label: "車站及車廢人員服務態度",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "train-station-friendliness",
              type: "textarea",
              label: "對於台鐵車站自行車友善環境的建議",
              required: false,
              placeholder: "請提供您的建議...",
            },
          ],
        },
        {
          id: "overall",
          title: "十、整體評價",
          questions: [
            {
              id: "overall-satisfaction",
              type: "radio",
              label: "整體滿意度",
              required: true,
              options: ["非常滿意", "滿意", "普通", "不滿意", "非常不滿意"],
            },
            {
              id: "recommendation",
              type: "radio",
              label: "推薦意願（您是否願意推薦親友使用此路線）",
              required: true,
              options: ["非常願意", "願意", "普通", "不願意", "非常不願意"],
            },
            {
              id: "suggestions",
              type: "textarea",
              label: "其他建議或意見",
              required: false,
              placeholder: "請提供您的建議或意見...",
            },
          ],
        },
      ],
    },
    {
      id: "diverse-cycling-survey-2025",
      title: "「多元自行車路線」使用情形及滿意度問卷",
      description:
        "本問卷目的在了解您曾經騎乘或本次騎乘「多元自行車路線」的感受及意見，做為後續路線規劃及改善參考，謝謝！",
      version: "1.0.0",
      organize: "交通部運輸研究所",
      createdAt: "2025-07-03T00:00:00+08:00",
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: "basic-info",
          title: "受訪者基本資料",
          questions: [
            {
              id: "gender",
              type: "radio",
              label: "您的性別",
              required: true,
              options: ["男", "女", "其他"],
            },
            {
              id: "age",
              type: "radio",
              label: "您的年齡",
              required: true,
              options: [
                "12歲以下",
                "13~20歲",
                "21~30歲",
                "31~40歲",
                "41~50歲",
                "51~60歲",
                "61~64歲",
                "65歲以上",
              ],
            },
            {
              id: "city",
              type: "select",
              label: "您居住的縣市",
              required: true,
              options: [
                "基隆市",
                "臺北市",
                "新北市",
                "桃園市",
                "新竹市",
                "新竹縣",
                "苗栗縣",
                "臺中市",
                "彰化縣",
                "南投縣",
                "雲林縣",
                "嘉義市",
                "嘉義縣",
                "臺南市",
                "高雄市",
                "屏東縣",
                "宜蘭縣",
                "花蓮縣",
                "臺東縣",
                "澎湖縣",
                "金門縣",
                "連江縣",
                "其他",
              ],
            },
            {
              id: "recent-route",
              type: "map",
              label: "請選擇一條您近一年內曾騎乘過的多元自行車路線",
              required: true,
              options: [],
              defaultCenter: [23.8, 121.0],
              defaultZoom: 7,
              showLayerControl: true,
              kmlFiles: convertKMLForMapQuestion(diverseKML),
            },
            {
              id: "recent-route-date",
              type: "time",
              label: "最近一次騎乘該路線的時間",
              timeFormat: "YYYY-MM",
              required: true,
              minDate: "2020-01",
              maxDate: "2025-12",
            },
          ],
        },
        {
          id: "continuity",
          title: "一、連續性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "route-continuity",
              type: "radio",
              label: "路線連續性（例如：路線標示清楚、路段連接完整等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "signage-continuity",
              type: "radio",
              label: "指標連續性（例如：指標設置連續、方向指示明確等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "surface-continuity",
              type: "radio",
              label: "路面連續性（例如：路面平整、材質一致等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "safety",
          title: "二、安全性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "traffic-safety",
              type: "radio",
              label: "交通安全（例如：車道分隔明確、交通號誌適當等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "personal-safety",
              type: "radio",
              label: "人身安全（例如：照明充足、治安良好等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "road-safety",
              type: "radio",
              label: "道路安全（例如：護欄設置、危險路段警示等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "comfort",
          title: "三、舒適性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "riding-comfort",
              type: "radio",
              label: "騎乘舒適度（例如：路面平坦、坡度適中等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "weather-protection",
              type: "radio",
              label: "遮蔽設施（例如：涼亭、遮陽棚等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "rest-facilities",
              type: "radio",
              label: "休息設施（例如：座椅、休息區等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "accessibility",
          title: "四、無障礙性",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "barrier-free-access",
              type: "radio",
              label: "無障礙通道（例如：斜坡道設置、通道寬度適當等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "facility-accessibility",
              type: "radio",
              label: "設施無障礙性（例如：廁所、停車場等設施可及性）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "information",
          title: "五、資訊提供",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "route-information",
              type: "radio",
              label: "路線資訊（例如：路線圖、距離標示等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "facility-information",
              type: "radio",
              label: "設施資訊（例如：服務設施位置、開放時間等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "scenic-information",
              type: "radio",
              label: "景點資訊（例如：景點介紹、文化說明等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "service-facilities",
          title: "六、服務設施",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "bike-parking",
              type: "radio",
              label: "自行車停車設施",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "restroom-facilities",
              type: "radio",
              label: "廁所設施",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "water-facilities",
              type: "radio",
              label: "飲水設施",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "repair-facilities",
              type: "radio",
              label: "維修設施（例如：打氣機、維修站等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "landscape",
          title: "七、景觀品質",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "natural-landscape",
              type: "radio",
              label: "自然景觀（例如：山景、海景、田園風光等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "cultural-landscape",
              type: "radio",
              label: "人文景觀（例如：歷史建築、文化遺址等）",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "environment-cleanliness",
              type: "radio",
              label: "環境整潔度",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "management",
          title: "八、管理維護",
          description: "請就您當次旅程體驗，填答下列各項設施及服務的滿意度：",
          questions: [
            {
              id: "facility-maintenance",
              type: "radio",
              label: "設施維護狀況",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "route-maintenance",
              type: "radio",
              label: "路線維護狀況",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "signage-maintenance",
              type: "radio",
              label: "指標維護狀況",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
          ],
        },
        {
          id: "train-service",
          title: "九、台鐵服務",
          description:
            "請就您搭乘台鐵攜帶自行車的體驗，填答下列各項服務的滿意度：",
          questions: [
            {
              id: "bike-boarding",
              type: "radio",
              label: "自行車上下車便利性",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "bike-storage",
              type: "radio",
              label: "車廂內自行車放置空間",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "staff-service",
              type: "radio",
              label: "車站及車廢人員服務態度",
              required: true,
              options: [
                "非常滿意",
                "滿意",
                "普通",
                "不滿意",
                "非常不滿意",
                "無意見",
              ],
            },
            {
              id: "train-station-friendliness",
              type: "textarea",
              label: "對於台鐵車站自行車友善環境的建議",
              required: false,
              placeholder: "請提供您的建議...",
            },
          ],
        },
        {
          id: "overall",
          title: "十、整體評價",
          questions: [
            {
              id: "overall-satisfaction",
              type: "radio",
              label: "整體滿意度",
              required: true,
              options: ["非常滿意", "滿意", "普通", "不滿意", "非常不滿意"],
            },
            {
              id: "recommendation",
              type: "radio",
              label: "推薦意願（您是否願意推薦親友使用此路線）",
              required: true,
              options: ["非常願意", "願意", "普通", "不願意", "非常不願意"],
            },
            {
              id: "suggestions",
              type: "textarea",
              label: "其他建議或意見",
              required: false,
              placeholder: "請提供您的建議或意見...",
            },
          ],
        },
      ],
    },
  ];
}

async function cleanAndUploadCompleteQuestionnaires() {
  try {
    console.log("🔥 Initializing Firebase...");
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    console.log("🗑️  Deleting existing questionnaires...");
    const questionnairesRef = collection(db, "questionnaires");
    const existingDocs = await getDocs(questionnairesRef);

    for (const docSnapshot of existingDocs.docs) {
      await deleteDoc(docSnapshot.ref);
      console.log(`✅ Deleted questionnaire: ${docSnapshot.id}`);
    }

    console.log(
      "📋 Generating complete questionnaires from lib/questionnaire.ts..."
    );
    const questionnaires = generateCompleteQuestionnaires();
    console.log(
      `✅ Generated ${questionnaires.length} complete questionnaires`
    );

    // Verify completeness
    questionnaires.forEach((q, index) => {
      console.log(
        `📊 Questionnaire ${index + 1}: "${q.title}" - ${
          q.sections.length
        } sections`
      );
      q.sections.forEach((section, sIndex) => {
        console.log(
          `   Section ${sIndex + 1}: "${section.title}" - ${
            section.questions.length
          } questions`
        );
      });
    });

    console.log("⬆️  Uploading complete questionnaires to Firestore...");
    for (const questionnaire of questionnaires) {
      const docRef = await addDoc(questionnairesRef, questionnaire);
      console.log(
        `✅ Uploaded questionnaire "${questionnaire.title}" with ID: ${docRef.id}`
      );
      console.log(`   - ${questionnaire.sections.length} sections`);
      console.log(
        `   - Total questions: ${questionnaire.sections.reduce(
          (total, section) => total + section.questions.length,
          0
        )}`
      );

      // Verify critical content
      const hasTrainStationFriendliness = questionnaire.sections.some(
        (section) =>
          section.questions.some((q) => q.id === "train-station-friendliness")
      );
      const hasContinuitySection = questionnaire.sections.some(
        (section) => section.id === "continuity"
      );

      console.log(
        `   - Has 'train-station-friendliness' question: ${hasTrainStationFriendliness}`
      );
      console.log(`   - Has 'continuity' section: ${hasContinuitySection}`);
    }

    console.log("🎉 Successfully uploaded complete questionnaires!");
    console.log(
      "📝 Please run: cp firestore.rules.backup firestore.rules && firebase deploy --only firestore:rules"
    );
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

// Run the script
cleanAndUploadCompleteQuestionnaires();
