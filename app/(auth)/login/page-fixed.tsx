"use client";

import type React from "react";
import { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { FirebaseDebug } from "@/components/debug/FirebaseDebug";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Login form submitted");
    console.log("📧 Email:", email);
    console.log("🔒 Password length:", password.length);

    setError("");
    setIsLoading(true);

    try {
      console.log("⏳ Calling login function...");
      const success = await login(email, password);

      console.log("🎯 Login result:", success);

      if (success) {
        console.log("✅ Login successful, redirecting to dashboard...");
        router.push("/dashboard");
      } else {
        console.log("❌ Login failed, showing error message");
        setError("帳號或密碼錯誤，請重試。");
      }
    } catch (err: any) {
      console.error("💥 Login form error:");
      console.error("🔍 Error details:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });

      // Provide more specific error messages based on Firebase error codes
      let errorMessage = "發生錯誤，請重試。";

      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            errorMessage = "找不到此電子郵件對應的帳號";
            break;
          case "auth/wrong-password":
            errorMessage = "密碼錯誤，請重試";
            break;
          case "auth/invalid-email":
            errorMessage = "電子郵件格式不正確";
            break;
          case "auth/user-disabled":
            errorMessage = "此帳號已被停用";
            break;
          case "auth/too-many-requests":
            errorMessage = "登入嘗試次數過多，請稍後再試";
            break;
          case "auth/network-request-failed":
            errorMessage = "網路連線失敗，請檢查網路連線";
            break;
          case "auth/invalid-credential":
            errorMessage = "登入憑證無效，請檢查電子郵件和密碼";
            break;
        }
      }

      setError(errorMessage);
    } finally {
      console.log("🏁 Login process completed, setting loading to false");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            乘跡｜騎行體驗分享平台
          </CardTitle>
          <CardDescription>登入以存取您的體驗</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">電子郵件</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="請輸入電子郵件"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="請輸入密碼"
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "登入中..." : "登入"}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">Firebase 登入</h3>
            <p className="text-sm text-blue-700">
              請使用您的 Firebase 帳號登入
              <br />
              <strong>註意:</strong> 需要先在 Firebase 中建立帳號
            </p>
          </div>

          {/* Debug panel - remove this in production */}
          <FirebaseDebug />
        </CardContent>
      </Card>
    </div>
  );
}
