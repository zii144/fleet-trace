export interface PromotionContent {
  id: string;
  mediaUrl: string;
  mediaType: "image" | "video";
  title?: string;
  description?: string;
  active: boolean;
  isDisplayTitle: boolean;
  isDisplayDescription: boolean;
}

export const promotionContents: PromotionContent[] = [
  {
    id: "promotion-bike-visual",
    mediaUrl: "/promotion-cover/bike-visual.png",
    mediaType: "image",
    title: "自行車路網調查",
    description: "與大家一起分享您騎乘過的自行車路線",
    active: true,
    isDisplayTitle: false,
    isDisplayDescription: false,
  },
  {
    id: "promotion-glass-visual",
    mediaUrl: "/promotion-cover/glass-visual.png",
    mediaType: "image",
    title: "LINE POINTS 兌換活動",
    description: "完成每條路線回饋，即可獲得 25 元 LINE POINTS",
    active: true,
    isDisplayTitle: false,
    isDisplayDescription: false,
  },
];

export function getActivePromotion(): PromotionContent | null {
  return promotionContents.find(promo => promo.active) || null;
}

export function getAllActivePromotions(): PromotionContent[] {
  return promotionContents.filter(promo => promo.active);
}

export function getPromotionById(id: string): PromotionContent | null {
  return promotionContents.find(promo => promo.id === id) || null;
} 