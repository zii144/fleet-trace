"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, AlertCircle } from "lucide-react";
import {
  checkAppVersion,
  clearAppCache,
  dismissUpdate,
  hasUserDismissedUpdate,
  performComprehensiveUpgrade,
} from "@/lib/version-check";

interface UpdateNotificationProps {
  className?: string;
}

export default function UpdateNotification({
  className,
}: UpdateNotificationProps) {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [versionInfo, setVersionInfo] = useState<{
    currentVersion: string;
    cachedVersion: string | null;
  } | null>(null);

  useEffect(() => {
    // Check version on component mount
    const checkVersion = () => {
      const { needsUpdate, currentVersion, cachedVersion } = checkAppVersion();

      setVersionInfo({ currentVersion, cachedVersion });

      // Show update notification if:
      // 1. Version needs update
      // 2. User hasn't dismissed this version
      if (needsUpdate && !hasUserDismissedUpdate()) {
        setShowUpdate(true);
        console.log("📢 Showing update notification");
      }
    };

    checkVersion();
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);

    try {
      console.log("🚀 Starting app upgrade process...");

      // Perform comprehensive upgrade that clears all caches and session data
      await performComprehensiveUpgrade();

      // Small delay for user feedback and to ensure upgrade process completes
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("✅ Upgrade process completed, reloading application...");

      // Reload the page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error("❌ Update failed:", error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    dismissUpdate();
    setShowUpdate(false);
    console.log("👤 User dismissed update notification");
  };

  if (!showUpdate) {
    return null;
  }

  return (
    <div
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4 ${
        className || ""
      }`}
    >
      <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        {/*<AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />*/}
        <div className="flex items-start justify-between w-full">
          <div className="flex-1 pr-2">
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <div className="font-medium mb-1">本應用程式更新可用</div>
              <div className="text-sm mb-3">
                發現新版本 ({versionInfo?.currentVersion}
                )，需要立即更新以獲得最佳體驗
                <br />
                <span className="text-xs text-orange-600 dark:text-orange-400">
                  ⚠️ 更新會清除所有暫存資料和登入狀態，請放心更新
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      更新中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      立即更新
                    </>
                  )}
                </Button>
                {/*<Button
                  size="sm"
                  variant="outline"
                  onClick={handleDismiss}
                  disabled={isUpdating}
                  className="text-orange-700 border-orange-300 hover:bg-orange-100 dark:text-orange-300 dark:border-orange-700 dark:hover:bg-orange-900"
                >
                  稍後提醒
                </Button>*/}
              </div>
            </AlertDescription>
          </div>
          {/*<Button
            size="sm"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isUpdating}
            className="h-6 w-6 p-0 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
          >
            <X className="h-4 w-4" />
          </Button>*/}
        </div>
      </Alert>
    </div>
  );
}
