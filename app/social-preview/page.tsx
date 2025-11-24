import { Metadata } from "next";
import { SocialMediaPreview } from "@/components/SocialMediaPreview";
import { getPageMeta } from "@/lib/social-media-meta";

export const metadata: Metadata = getPageMeta("home", {
  title: "社交媒體預覽工具 - 騎跡",
  description:
    "測試和預覽你的內容在各大社交媒體平台上的顯示效果。優化你的分享體驗，讓每次分享都更加吸引人。",
  image: "/social-share-banner.png",
});

export default function SocialPreviewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <SocialMediaPreview />
    </div>
  );
}
