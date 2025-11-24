"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { SessionManager } from "@/lib/session-manager";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, LogOut, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SessionStatus() {
  const { hasRememberMeSession, logout } = useAuth();
  const [remainingDays, setRemainingDays] = useState(0);
  const [expirationDate, setExpirationDate] = useState<Date | null>(null);

  useEffect(() => {
    if (hasRememberMeSession) {
      const days = SessionManager.getRemainingSessionDays();
      const expDate = SessionManager.getSessionExpirationDate();
      setRemainingDays(days);
      setExpirationDate(expDate);
    }
  }, [hasRememberMeSession]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!hasRememberMeSession) {
    return null;
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Shield className="w-5 h-5 text-green-600" />
          <span>登入狀態</span>
          <Badge variant="secondary" className="ml-auto">
            自動登入
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">剩餘時間</span>
            <span className="font-medium">{remainingDays} 天</span>
          </div>
          {expirationDate && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">到期時間</span>
              <span className="font-medium">{formatDate(expirationDate)}</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex-1">
                <LogOut className="w-4 h-4 mr-2" />
                登出
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>確認登出</AlertDialogTitle>
                <AlertDialogDescription>
                  您確定要登出嗎？這將清除您的自動登入設定。
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>取消</AlertDialogCancel>
                <AlertDialogAction onClick={handleLogout}>
                  確認登出
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
          <p>
            💡
            提示：自動登入功能會讓您在14天內保持登入狀態，無需重複輸入帳號密碼。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
