"use client";

import { useState } from "react";
import { PromoModal } from "@/components/PromoModal";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, Gift, Smartphone, Monitor, Tablet } from "lucide-react";

export default function PromoPreviewPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [devicePreview, setDevicePreview] = useState<
    "desktop" | "tablet" | "mobile"
  >("desktop");

  const handleGetStarted = () => {
    alert("Get Started clicked! This would normally navigate to /profile");
    setIsModalOpen(false);
  };

  const handleDismiss = () => {
    alert("Modal dismissed permanently! This would set localStorage flag.");
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Promotional Modal Preview
          </h1>
          <p className="text-gray-600">
            Preview and test the cycling route survey promotional modal
          </p>
        </div>

        <div className="grid gap-6 mb-8">
          {/* Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Modal Controls
              </CardTitle>
              <CardDescription>
                Test the promotional modal functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                <Button onClick={() => setIsModalOpen(true)}>
                  <Gift className="w-4 h-4 mr-2" />
                  Show Promotional Modal
                </Button>
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Close Modal
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Device Preview Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Device Preview</CardTitle>
              <CardDescription>
                Preview how the modal appears on different devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button
                  variant={devicePreview === "desktop" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevicePreview("desktop")}
                >
                  <Monitor className="w-4 h-4 mr-1" />
                  Desktop
                </Button>
                <Button
                  variant={devicePreview === "tablet" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevicePreview("tablet")}
                >
                  <Tablet className="w-4 h-4 mr-1" />
                  Tablet
                </Button>
                <Button
                  variant={devicePreview === "mobile" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDevicePreview("mobile")}
                >
                  <Smartphone className="w-4 h-4 mr-1" />
                  Mobile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Information */}
          <Card>
            <CardHeader>
              <CardTitle>Modal Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Auto-Display Logic:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Shows to authenticated users after 3 seconds</li>
                    <li>• Respects permanent dismissal preference</li>
                    <li>• Can be manually triggered from dashboard</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Content Features:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Clear promotional message</li>
                    <li>• Step-by-step participation guide</li>
                    <li>• Reward information (NT$32,000)</li>
                    <li>• Professional MOTC branding</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">User Actions:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• "立即開始" - Navigate to profile</li>
                    <li>• "稍後再說" - Close temporarily</li>
                    <li>• "不再顯示" - Dismiss permanently</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Design Features:</h4>
                  <ul className="space-y-1 text-gray-600">
                    <li>• Responsive design</li>
                    <li>• Dark mode support</li>
                    <li>• Accessible UI components</li>
                    <li>• Mobile-optimized layout</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Device Preview Container */}
        <div className="flex justify-center">
          <div
            className={`
              ${devicePreview === "desktop" ? "w-full max-w-6xl" : ""}
              ${devicePreview === "tablet" ? "w-full max-w-3xl" : ""}
              ${devicePreview === "mobile" ? "w-full max-w-md" : ""}
              border-2 border-dashed border-gray-300 rounded-lg p-4 bg-white
            `}
          >
            <div className="text-center text-gray-500 text-sm mb-4">
              {devicePreview.charAt(0).toUpperCase() + devicePreview.slice(1)}{" "}
              Preview
              <br />
              {devicePreview === "desktop" && "1024px+ width"}
              {devicePreview === "tablet" && "768px-1023px width"}
              {devicePreview === "mobile" && "< 768px width"}
            </div>
            <div className="min-h-[200px] flex items-center justify-center">
              <Button
                size="lg"
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Gift className="w-5 h-5 mr-2" />
                Preview Modal on {devicePreview}
              </Button>
            </div>
          </div>
        </div>

        {/* Modal */}
        <PromoModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onGetStarted={handleGetStarted}
          onDismissPermanently={handleDismiss}
        />
      </div>
    </div>
  );
}
