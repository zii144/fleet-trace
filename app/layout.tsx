import type React from "react";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_TC, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import UpdateNotification from "@/components/UpdateNotification";
import { Toaster } from "@/components/ui/toaster";
import { AppFooter } from "@/components/AppFooter";

const notoSansTC = Noto_Sans_TC({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto-sans-tc",
});

const roboto = Roboto({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-roboto",
});

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bike-life.net"),
  title: "乘跡｜計程車服務品質評核平台",
  description:
    "乘跡，計程車服務品質評核平台。結合數據分析與評鑑調查回饋，提升計程車服務品質。",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "乘跡｜計程車服務品質評核平台",
  },
  formatDetection: {
    telephone: false,
  },
  // Enhanced Open Graph for social media sharing
  openGraph: {
    type: "website",
    siteName: "乘跡｜計程車服務品質評核平台",
    title: "乘跡｜計程車服務品質評核平台",
    description:
      "乘跡，計程車服務品質評核平台。結合數據分析與評鑑調查回饋，提升計程車服務品質。",
    url: "https://bike-life.net",
    locale: "zh_TW",
    images: [
      {
        url: "/social-share-banner.png",
        width: 1200,
        height: 630,
        alt: "乘跡 - 台灣單車文化軌跡",
        type: "image/png",
      },
      {
        url: "/bike-visual.png",
        width: 800,
        height: 600,
        alt: "乘跡平台視覺設計",
        type: "image/png",
      },
    ],
  },
  // Twitter Card optimization
  twitter: {
    card: "summary_large_image",
    site: "@bikelife_tw",
    creator: "@bikelife_tw",
    title: "乘跡｜計程車服務品質評核平台",
    description:
      "乘跡，計程車服務品質評核平台。結合數據分析與評鑑調查回饋，提升計程車服務品質。",
    images: ["/social-share-banner.png"],
  },
  // Additional social media meta tags
  other: {
    "fb:app_id": "your-facebook-app-id", // Replace with your Facebook App ID
    "fb:pages": "your-facebook-page-id", // Replace with your Facebook Page ID
    "instagram:creator": "@bikelife_tw",
    "linkedin:owner": "your-linkedin-company-id", // Replace with your LinkedIn Company ID
    // LINE-specific optimizations
    "line:title": "乘跡｜計程車服務品質評核平台",
    "line:description":
      "乘跡，計程車服務品質評核平台。結合數據分析與評鑑調查回饋，提升計程車服務品質。",
    "line:image": "https://bike-life.net/social-share-banner.png",
    "line:url": "https://bike-life.net",
    // Additional LINE optimizations
    "line:site_name": "乘跡｜計程車服務品質評核平台",
    "line:type": "website",
    // WhatsApp Business API (if applicable)
    "whatsapp:business": "your-whatsapp-business-id",
  },
  keywords: [
    "單車",
    "騎行",
    "台灣",
    "評鑑調查",
    "數據分析",
    "乘跡",
    "bike-life",
    "cycling",
    "Taiwan",
    "survey",
    "data analysis",
  ],
  authors: [{ name: "乘跡團隊" }],
  creator: "乘跡團隊",
  publisher: "乘跡",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  generator: "Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-TW"
      className={`overflow-x-hidden ${notoSansTC.variable} ${roboto.variable}`}
    >
      <head>
        <meta name="application-name" content="評鑑調查平台" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="評鑑調查平台" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />

        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/icon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/icon-16x16.png"
        />
        <link rel="manifest" href="/manifest.json" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="overflow-x-hidden min-h-screen font-sans animated-gradient-background">
        <UpdateNotification />

        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">{children}</main>
            <AppFooter />
          </div>
        </AuthProvider>
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW 註冊成功: ', registration.scope);
                    }, function(err) {
                      console.log('SW 註冊失敗: ', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
