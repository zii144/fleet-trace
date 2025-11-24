"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SocialMediaPreviewProps {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultImage?: string;
  defaultUrl?: string;
}

export function SocialMediaPreview({
  defaultTitle = "騎跡｜騎行體驗分享平台 - 台灣單車文化軌跡",
  defaultDescription = "騎跡，台灣首創的騎行體驗分享平台。結合數據分析與問卷回饋，讓每一段旅程都成為台灣單車文化的軌跡。",
  defaultImage = "/social-share-banner.png",
  defaultUrl = "https://bike-life.net",
}: SocialMediaPreviewProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [image, setImage] = useState(defaultImage);
  const [url, setUrl] = useState(defaultUrl);

  // Fix image URL construction for both development and production
  const fullImageUrl = image.startsWith("http")
    ? image
    : image.startsWith("/")
    ? `${image}?t=${Date.now()}` // Add cache-busting parameter
    : `/${image}?t=${Date.now()}`; // Ensure it starts with / and add cache-busting

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">社交媒體預覽工具</h1>
        <p className="text-muted-foreground">
          預覽你的內容在各大社交媒體平台上的顯示效果
        </p>
      </div>

      <Tabs defaultValue="facebook" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="facebook">Facebook</TabsTrigger>
          <TabsTrigger value="twitter">Twitter</TabsTrigger>
          <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
          <TabsTrigger value="line">LINE</TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Input Form */}
          <Card>
            <CardHeader>
              <CardTitle>內容設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">標題</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="輸入標題..."
                  maxLength={60}
                />
                <div className="text-xs text-muted-foreground">
                  {title.length}/60 字元
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">描述</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="輸入描述..."
                  rows={3}
                  maxLength={160}
                />
                <div className="text-xs text-muted-foreground">
                  {description.length}/160 字元
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">圖片 URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="/path/to/image.png"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">網址</Label>
                <Input
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://bike-life.net"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>建議的圖片尺寸</Label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Badge variant="outline">Facebook: 1200x630px</Badge>
                  <Badge variant="outline">Twitter: 1200x600px</Badge>
                  <Badge variant="outline">LinkedIn: 1200x627px</Badge>
                  <Badge variant="outline">WhatsApp: 300x300px</Badge>
                </div>
              </div>

              <Button
                onClick={() => {
                  setTitle(defaultTitle);
                  setDescription(defaultDescription);
                  setImage(defaultImage);
                  setUrl(defaultUrl);
                }}
                variant="outline"
                className="w-full"
              >
                重置為預設值
              </Button>

              {/* Debug section for image troubleshooting */}
              <Separator />
              <div className="space-y-2">
                <Label>除錯資訊</Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>圖片路徑: {image}</div>
                  <div>完整 URL: {fullImageUrl}</div>
                  <div>環境: {process.env.NODE_ENV}</div>
                </div>

                {/* Image test */}
                <div className="mt-2">
                  <Label>圖片測試</Label>
                  <div className="mt-1">
                    <img
                      src={fullImageUrl}
                      alt="Test"
                      className="w-20 h-20 object-cover border rounded"
                      onError={(e) => {
                        console.error("Test image failed:", fullImageUrl);
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                      onLoad={() => {
                        console.log("Test image loaded:", fullImageUrl);
                      }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>預覽效果</CardTitle>
            </CardHeader>
            <CardContent>
              <TabsContent value="facebook" className="mt-0">
                <FacebookPreview
                  title={title}
                  description={description}
                  image={fullImageUrl}
                  url={url}
                />
              </TabsContent>
              <TabsContent value="twitter" className="mt-0">
                <TwitterPreview
                  title={title}
                  description={description}
                  image={fullImageUrl}
                  url={url}
                />
              </TabsContent>
              <TabsContent value="linkedin" className="mt-0">
                <LinkedInPreview
                  title={title}
                  description={description}
                  image={fullImageUrl}
                  url={url}
                />
              </TabsContent>
              <TabsContent value="whatsapp" className="mt-0">
                <WhatsAppPreview
                  title={title}
                  description={description}
                  image={fullImageUrl}
                  url={url}
                />
              </TabsContent>
              <TabsContent value="line" className="mt-0">
                <LINEPreview
                  title={title}
                  description={description}
                  image={fullImageUrl}
                  url={url}
                />
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}

// Facebook Preview Component
function FacebookPreview({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white max-w-sm">
      <div className="aspect-[1.91/1] bg-gray-200 relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.error("Image failed to load:", image);
            e.currentTarget.src = "/placeholder.jpg";
          }}
          onLoad={() => {
            console.log("Image loaded successfully:", image);
          }}
        />
      </div>
      <div className="p-3 space-y-2">
        <div className="text-xs text-blue-600 uppercase tracking-wide">
          bike-life.net
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
}

// Twitter Preview Component
function TwitterPreview({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white max-w-sm">
      <div className="aspect-[2/1] bg-gray-200 relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
        <div className="text-xs text-gray-500">bike-life.net</div>
      </div>
    </div>
  );
}

// LinkedIn Preview Component
function LinkedInPreview({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white max-w-sm">
      <div className="aspect-[1.91/1] bg-gray-200 relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        <div className="text-xs text-gray-500">bike-life.net</div>
      </div>
    </div>
  );
}

// WhatsApp Preview Component
function WhatsAppPreview({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white max-w-sm">
      <div className="aspect-square bg-gray-200 relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />
      </div>
      <div className="p-3 space-y-2">
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-2">{description}</p>
        <div className="text-xs text-blue-600">bike-life.net</div>
      </div>
    </div>
  );
}

// LINE Preview Component
function LINEPreview({
  title,
  description,
  image,
  url,
}: {
  title: string;
  description: string;
  image: string;
  url: string;
}) {
  return (
    <div className="border rounded-lg overflow-hidden bg-white max-w-sm">
      <div className="aspect-[1.91/1] bg-gray-200 relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />
        {/* LINE icon overlay */}
        <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold">L</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600 font-medium">LINE</span>
        </div>
        <h3 className="font-semibold text-sm leading-tight line-clamp-2">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-3">{description}</p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">bike-life.net</span>
          <div className="flex items-center gap-1">
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
