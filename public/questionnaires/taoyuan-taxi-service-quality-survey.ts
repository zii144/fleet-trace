import type { QuestionnaireTemplate } from "./types";

export const taoyuanTaxiServiceQualitySurvey: QuestionnaireTemplate = {
  id: "taoyuan-taxi-service-quality-survey",
  title: "桃園市計程車服務品質評鑑調查",
  description:
    "本問卷目的在了解您對桃園市計程車服務品質的感受及意見，做為後續服務改善參考，謝謝！",
  banner: "/banner-video/cycling-survey.mp4",
  version: "1.0.0",
  organize: "桃園市政府",
  isRepeatable: true,
  createdAt: "2025-01-20T00:00:00+08:00",
  updatedAt: "2025-01-20T00:00:00+08:00",
  sections: [
    {
      id: "basic-info",
      title: "基本資料",
      questions: [
        {
          id: "taxi-usage-frequency",
          type: "radio",
          label: "您使用計程車的頻率",
          required: true,
          options: ["每天", "每週數次", "每月數次", "偶爾", "很少使用"],
        },
        {
          id: "taxi-usage-reason",
          type: "checkbox",
          label: "您使用計程車的主要原因（可複選）",
          required: true,
          options: ["通勤", "商務", "購物", "就醫", "旅遊", "緊急情況", "其他"],
        },
      ],
    },
    {
      id: "service-quality",
      title: "服務品質評鑑",
      questions: [
        {
          id: "driver-attitude",
          type: "radio",
          label: "司機服務態度",
          required: true,
          options: ["很不滿意", "不太滿意", "尚可", "還算滿意", "非常滿意"],
        },
        {
          id: "vehicle-cleanliness",
          type: "radio",
          label: "車輛整潔度",
          required: true,
          options: ["很不滿意", "不太滿意", "尚可", "還算滿意", "非常滿意"],
        },
        {
          id: "driving-safety",
          type: "radio",
          label: "駕駛安全",
          required: true,
          options: ["很不滿意", "不太滿意", "尚可", "還算滿意", "非常滿意"],
        },
        {
          id: "fare-reasonableness",
          type: "radio",
          label: "車資合理性",
          required: true,
          options: ["很不滿意", "不太滿意", "尚可", "還算滿意", "非常滿意"],
        },
        {
          id: "overall-satisfaction",
          type: "radio",
          label: "整體滿意度",
          required: true,
          options: ["很不滿意", "不太滿意", "尚可", "還算滿意", "非常滿意"],
        },
      ],
    },
    {
      id: "suggestions",
      title: "意見與建議",
      questions: [
        {
          id: "improvement-suggestions",
          type: "textarea",
          label: "您對桃園市計程車服務有何建議或意見？",
          required: false,
          placeholder: "請填寫您的建議...",
        },
      ],
    },
  ],
};

