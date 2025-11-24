import { Metadata } from 'next';

export interface SocialMediaMetaConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

/**
 * Generate comprehensive social media meta tags
 */
export function generateSocialMediaMeta(config: SocialMediaMetaConfig): Metadata {
  const {
    title,
    description,
    image = '/social-share-banner.png',
    url = 'https://bike-life.net',
    type = 'website',
    author,
    publishedTime,
    modifiedTime,
    section,
    tags = [],
  } = config;

  const baseUrl = 'https://bike-life.net';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: [
      '單車',
      '騎行',
      '台灣',
      '問卷',
      '數據分析',
      '騎跡',
      'bike-life',
      'cycling',
      'Taiwan',
      'survey',
      'data analysis',
      ...tags,
    ],
    authors: [{ name: author || '騎跡團隊' }],
    creator: '騎跡團隊',
    publisher: '騎跡',
    openGraph: {
      type,
      siteName: '騎跡｜騎行體驗分享平台',
      title,
      description,
      url: fullUrl,
      locale: 'zh_TW',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(author && { authors: [author] }),
      ...(section && { section }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bikelife_tw',
      creator: '@bikelife_tw',
      title,
      description,
      images: [fullImageUrl],
    },
    other: {
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id',
      'fb:pages': process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || 'your-facebook-page-id',
      'instagram:creator': '@bikelife_tw',
      'linkedin:owner': process.env.NEXT_PUBLIC_LINKEDIN_COMPANY_ID || 'your-linkedin-company-id',
      // LINE-specific optimizations
      'line:title': title,
      'line:description': description,
      'line:image': fullImageUrl,
      'line:url': fullUrl,
      'line:site_name': '騎跡｜騎行體驗分享平台',
      'line:type': type,
      // WhatsApp Business API (if applicable)
      'whatsapp:business': process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID || 'your-whatsapp-business-id',
    },
  };
}

/**
 * Generate LINE-optimized meta tags specifically for Taiwan market
 */
export function generateLINEMeta(config: SocialMediaMetaConfig): Metadata {
  const {
    title,
    description,
    image = '/line-share-banner.png',
    url = 'https://bike-life.net',
    type = 'website',
    author,
    tags = [],
  } = config;

  const baseUrl = 'https://bike-life.net';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`;

  return {
    title,
    description,
    keywords: [
      '單車',
      '騎行',
      '台灣',
      '問卷',
      '數據分析',
      '騎跡',
      'bike-life',
      'cycling',
      'Taiwan',
      'survey',
      'data analysis',
      'LINE',
      '分享',
      ...tags,
    ],
    authors: [{ name: author || '騎跡團隊' }],
    creator: '騎跡團隊',
    publisher: '騎跡',
    openGraph: {
      type,
      siteName: '騎跡｜騎行體驗分享平台',
      title,
      description,
      url: fullUrl,
      locale: 'zh_TW',
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@bikelife_tw',
      creator: '@bikelife_tw',
      title,
      description,
      images: [fullImageUrl],
    },
    other: {
      // LINE-specific optimizations
      'line:title': title,
      'line:description': description,
      'line:image': fullImageUrl,
      'line:url': fullUrl,
      'line:site_name': '騎跡｜騎行體驗分享平台',
      'line:type': type,
      // Additional LINE-specific tags
      'line:locale': 'zh_TW',
      'line:author': author || '騎跡團隊',
      // Other social platforms
      'fb:app_id': process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-facebook-app-id',
      'fb:pages': process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || 'your-facebook-page-id',
      'instagram:creator': '@bikelife_tw',
      'linkedin:owner': process.env.NEXT_PUBLIC_LINKEDIN_COMPANY_ID || 'your-linkedin-company-id',
      'whatsapp:business': process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_ID || 'your-whatsapp-business-id',
    },
  };
}

/**
 * Predefined meta configurations for common pages
 */
export const pageMetaConfigs = {
  home: {
    title: '騎跡｜騎行體驗分享平台 - 台灣單車文化軌跡',
    description: '騎跡，台灣首創的騎行體驗分享平台。結合數據分析與問卷回饋，讓每一段旅程都成為台灣單車文化的軌跡。探索台灣最美的單車路線，分享你的騎行故事。',
    image: '/social-share-banner.png',
    tags: ['首頁', '平台介紹'],
  },
  dashboard: {
    title: '個人儀表板 - 騎跡',
    description: '查看你的騎行數據、問卷完成狀況和個人統計。追蹤你的騎行軌跡，發現更多台灣單車路線。',
    image: '/dashboard-preview.png',
    tags: ['儀表板', '個人數據'],
  },
  questionnaire: {
    title: '騎行問卷調查 - 騎跡',
    description: '參與台灣單車文化研究，分享你的騎行體驗。你的回饋將幫助改善台灣的單車環境和路線規劃。',
    image: '/questionnaire-preview.png',
    tags: ['問卷', '調查', '回饋'],
  },
  profile: {
    title: '個人檔案 - 騎跡',
    description: '管理你的個人資料、查看騎行歷史和成就。與其他騎行者分享你的單車故事。',
    image: '/profile-preview.png',
    tags: ['個人檔案', '騎行歷史'],
  },
  admin: {
    title: '管理後台 - 騎跡',
    description: '騎跡平台管理系統，管理問卷、用戶數據和平台內容。',
    image: '/admin-preview.png',
    tags: ['管理', '後台'],
  },
};

/**
 * Generate meta tags for specific pages
 */
export function getPageMeta(page: keyof typeof pageMetaConfigs, customConfig?: Partial<SocialMediaMetaConfig>): Metadata {
  const baseConfig = pageMetaConfigs[page];
  const config = { ...baseConfig, ...customConfig };
  return generateSocialMediaMeta(config);
}

/**
 * Generate article meta tags for blog posts or news
 */
export function generateArticleMeta(article: {
  title: string;
  description: string;
  image?: string;
  url?: string;
  author?: string;
  publishedTime: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}): Metadata {
  return generateSocialMediaMeta({
    ...article,
    type: 'article',
  });
}

/**
 * Generate profile meta tags for user profiles
 */
export function generateProfileMeta(profile: {
  name: string;
  bio: string;
  image?: string;
  url?: string;
  username?: string;
}): Metadata {
  return generateSocialMediaMeta({
    title: `${profile.name} - 騎跡用戶`,
    description: profile.bio,
    image: profile.image,
    url: profile.url,
    type: 'profile',
    author: profile.name,
    tags: ['用戶檔案', profile.name],
  });
}
