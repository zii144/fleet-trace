"use client";

import { useEffect } from "react";

export default function ImageTestPage() {
  useEffect(() => {
    // Set the page title dynamically
    document.title = "Image Test - 騎跡";
  }, []);

  const images = [
    "/social-share-banner.png",
    "/placeholder.jpg",
    "/icon-512x512.png",
    "/bike-visual.png",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">圖片載入測試</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {images.map((imagePath, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <h3 className="font-semibold mb-2">測試圖片 {index + 1}</h3>
              <p className="text-sm text-gray-600 mb-2">路徑: {imagePath}</p>

              <div className="relative">
                <img
                  src={imagePath}
                  alt={`Test ${index + 1}`}
                  className="w-full h-48 object-cover rounded border"
                  onError={(e) => {
                    console.error(
                      `Image ${index + 1} failed to load:`,
                      imagePath
                    );
                    e.currentTarget.src = "/placeholder.jpg";
                    e.currentTarget.classList.add("border-red-500");
                  }}
                  onLoad={() => {
                    console.log(
                      `Image ${index + 1} loaded successfully:`,
                      imagePath
                    );
                  }}
                />

                <div className="mt-2 text-xs text-gray-500">
                  <div>
                    狀態: <span id={`status-${index}`}>載入中...</span>
                  </div>
                  <div>
                    尺寸: <span id={`size-${index}`}>-</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold mb-2">除錯資訊</h3>
          <div className="text-sm space-y-1">
            <div>當前環境: {process.env.NODE_ENV}</div>
            <div>Base URL: {process.env.NEXT_PUBLIC_BASE_URL || "未設定"}</div>
            <div>
              User Agent:{" "}
              {typeof window !== "undefined"
                ? window.navigator.userAgent
                : "伺服器端"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
