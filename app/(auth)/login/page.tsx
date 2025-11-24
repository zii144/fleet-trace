"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRouter } from "next/navigation";
import { FirebaseDebug } from "@/components/debug/FirebaseDebug";
import {
  signUp,
  sendVerificationEmail,
  resetPassword,
} from "@/lib/firebase-auth";
import { Banner } from "@/components/ui/Banner";
import { Mail, Lock, CheckCircle2, AlertCircle, User } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [storedPassword, setStoredPassword] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showServiceCompletionModal, setShowServiceCompletionModal] =
    useState(false);
  const { login, logout, hasRememberMeSession, user, isLoading } = useAuth();
  const router = useRouter();
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isRegisterEmailFocused, setIsRegisterEmailFocused] = useState(false);
  const [isDisplayNameFocused, setIsDisplayNameFocused] = useState(false);
  const [isRegisterPasswordFocused, setIsRegisterPasswordFocused] =
    useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validations, setValidations] = useState({
    email: false,
    displayName: false,
    password: false,
    confirmPassword: false,
  });
  const [showIcons, setShowIcons] = useState({
    email: true,
    displayName: true,
    password: true,
    confirmPassword: true,
  });

  // Validation functions
  const validateEmail = (email: string) => {
    return email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateDisplayName = (name: string) => {
    return name.trim().length >= 2;
  };

  // Effect for validation checks
  useEffect(() => {
    const timer = setTimeout(() => {
      setValidations({
        email: validateEmail(email) ? true : false,
        displayName: validateDisplayName(displayName),
        password: validatePassword(password),
        confirmPassword:
          password === confirmPassword && confirmPassword.length > 0,
      });
    }, 500); // Delay validation check

    return () => clearTimeout(timer);
  }, [email, displayName, password, confirmPassword]);

  // Effect to restore pending verification state from localStorage
  useEffect(() => {
    const pendingVerification = localStorage.getItem(
      "fleet_trace_pending_verification"
    );
    if (pendingVerification) {
      try {
        const data = JSON.parse(pendingVerification);
        setPendingVerificationEmail(data.email);
        setStoredPassword(data.password);
        setResendCooldown(data.cooldown || 0);
        setActiveTab("login"); // Switch to login tab to show verification message
        console.log("📧 Restored pending verification state:", data.email);
      } catch (error) {
        console.error("❌ Error parsing pending verification data:", error);
        localStorage.removeItem("fleet_trace_pending_verification");
      }
    }

    // Cleanup function to clear pending verification state when component unmounts
    return () => {
      // Only clear if user is not actively in verification process
      if (!pendingVerificationEmail) {
        localStorage.removeItem("fleet_trace_pending_verification");
      }
    };
  }, [pendingVerificationEmail]);

  // Effect for resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Effect to redirect if admin user is already authenticated
  useEffect(() => {
    if (!isLoading && user && user.role === "admin") {
      console.log(
        "🔄 Admin user already authenticated, redirecting to dashboard"
      );
      router.push("/dashboard");
    }
  }, [user, isLoading, router]);

  // Effect to clear stored password when switching tabs or after successful login
  useEffect(() => {
    if (activeTab === "register") {
      setStoredPassword("");
      setPendingVerificationEmail("");
      setResendCooldown(0);
      // Also clear pending verification state when switching to register tab
      localStorage.removeItem("fleet_trace_pending_verification");
    }
  }, [activeTab]);

  // Effect to monitor auth state changes and clear pending verification when user logs in
  useEffect(() => {
    if (user && pendingVerificationEmail) {
      console.log("✅ User logged in, clearing pending verification state");
      clearPendingVerificationState();
    }
  }, [user, pendingVerificationEmail]);

  // Effect to show service completion modal for non-admin users after login
  useEffect(() => {
    if (user && !isLoading) {
      console.log("🔍 Checking user role after login:", user.role);
      if (user.role === "admin") {
        console.log("🔧 Admin user detected, redirecting to dashboard...");
        router.push("/dashboard");
      } else {
        console.log(
          "👤 Normal user detected, showing service completion modal and staying on login page..."
        );
        setShowServiceCompletionModal(true);
        // Normal users stay on the login page with the modal
      }
    }
  }, [user, isLoading, router]);

  // Handle icon transitions
  const handleInputChange = (
    field: keyof typeof validations,
    value: string
  ) => {
    if (field === "email") setEmail(value);
    if (field === "displayName") setDisplayName(value);
    if (field === "password") setPassword(value);
    if (field === "confirmPassword") setConfirmPassword(value);

    if (value) {
      // Start fade out animation of original icon
      setShowIcons((prev) => ({ ...prev, [field]: false }));
    } else {
      // Show original icon when input is empty
      setShowIcons((prev) => ({ ...prev, [field]: true }));
      setValidations((prev) => ({ ...prev, [field]: false }));
    }
  };

  // Handle icon transitions
  const renderInputIcon = (
    field: keyof typeof validations,
    DefaultIcon: React.ComponentType<any>,
    isFocused: boolean
  ) => {
    const isValid = validations[field];
    const showOriginalIcon = showIcons[field];
    const value =
      field === "email"
        ? email
        : field === "displayName"
        ? displayName
        : field === "password"
        ? password
        : confirmPassword;

    return (
      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5">
        {value ? (
          <>
            <DefaultIcon
              className={`w-5 h-5 transition-all duration-300 absolute top-0 left-0 ${
                showOriginalIcon
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-95"
              } ${isFocused ? "text-gray-600" : "text-gray-400"}`}
            />
            <CheckCircle2
              className={`w-5 h-5 transition-all duration-300 absolute top-0 left-0 ${
                isValid ? "opacity-100 scale-100" : "opacity-0 scale-95"
              } ${isFocused ? "text-green-500" : "text-green-400"}`}
            />
          </>
        ) : (
          <DefaultIcon
            className={`w-5 h-5 transition-all duration-300 ${
              isFocused ? "text-gray-600 scale-110" : "text-gray-400"
            }`}
          />
        )}
      </div>
    );
  };

  const clearPendingVerificationState = () => {
    localStorage.removeItem("fleet_trace_pending_verification");
    setPendingVerificationEmail("");
    setStoredPassword("");
    setResendCooldown(0);
    console.log("🗑️ Cleared pending verification state");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Login form submitted");
    console.log("📧 Email:", email);
    console.log("🔒 Password length:", password.length);

    setError("");
    setSuccess("");
    setIsFormLoading(true);

    try {
      console.log("⏳ Calling login function...");
      const success = await login(email, password, rememberMe);

      console.log("🎯 Login result:", success);

      if (success) {
        console.log("✅ Login successful");
        // Clear stored password and verification state on successful login
        clearPendingVerificationState();
        // Note: User role checking and redirect/modal logic is handled in useEffect
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

      console.log("🔍 Checking error message:", err.message);
      console.log("🔍 Error code:", err.code);

      if (err.message === "EMAIL_NOT_VERIFIED") {
        errorMessage = "請先驗證您的電子郵件。檢查您的收件箱並點擊驗證連結。";
        console.log("📧 Email not verified, storing credentials for resend");
        console.log("📧 Email:", email);
        console.log("🔒 Password length:", password.length);

        // Store pending verification state in localStorage
        const pendingVerificationData = {
          email: email,
          password: password,
          cooldown: 30,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(
          "fleet_trace_pending_verification",
          JSON.stringify(pendingVerificationData)
        );

        setPendingVerificationEmail(email);
        setStoredPassword(password); // Store password for resend functionality
        setResendCooldown(30); // Set initial cooldown for better UX
      } else if (err.code) {
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
            errorMessage = "請檢查電子郵件和密碼";
            break;
        }
      }

      setError(errorMessage);
    } finally {
      console.log("🏁 Login process completed, setting loading to false");
      setIsFormLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("📝 Register form submitted");
    console.log("📧 Email:", email);
    console.log("👤 Display Name:", displayName);

    setError("");
    setSuccess("");
    setIsFormLoading(true);

    // Validation
    if (password !== confirmPassword) {
      setError("密碼確認不一致");
      setIsFormLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("密碼長度至少需要 6 個字元");
      setIsFormLoading(false);
      return;
    }

    if (!displayName.trim()) {
      setError("請輸入顯示名稱");
      setIsFormLoading(false);
      return;
    }

    try {
      console.log("⏳ Calling signUp function...");
      const user = await signUp(email, password, displayName.trim());

      console.log("✅ Registration successful:", user);
      setSuccess("註冊成功！請檢查您的電子郵件並點擊驗證連結，然後即可登入。");
      setPendingVerificationEmail(email);
      setStoredPassword(password); // Store password for resend functionality
      setResendCooldown(30); // Set initial cooldown for better UX

      // Store pending verification state in localStorage to persist across page navigations
      const pendingVerificationData = {
        email: email,
        password: password,
        cooldown: 30,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(
        "fleet_trace_pending_verification",
        JSON.stringify(pendingVerificationData)
      );
      console.log("💾 Stored pending verification state in localStorage");

      // Clear form and switch to login tab
      setEmail("");
      setPassword("");
      setDisplayName("");
      setConfirmPassword("");
      setActiveTab("login");
    } catch (err: any) {
      console.error("💥 Registration error:");
      console.error("🔍 Error details:", {
        message: err.message,
        code: err.code,
        stack: err.stack,
      });

      // Provide specific error messages for registration
      let errorMessage = "註冊失敗，請重試。";

      if (err.code) {
        switch (err.code) {
          case "auth/email-already-in-use":
            errorMessage = "此電子郵件已被註冊";
            break;
          case "auth/invalid-email":
            errorMessage = "電子郵件格式不正確";
            break;
          case "auth/weak-password":
            errorMessage = "密碼強度不足，請選擇更強的密碼";
            break;
          case "auth/network-request-failed":
            errorMessage = "網路連線失敗，請檢查網路連線";
            break;
          default:
            errorMessage = `註冊失敗：${err.message}`;
        }
      }

      setError(errorMessage);
    } finally {
      console.log("🏁 Registration process completed");
      setIsFormLoading(false);
    }
  };

  const handleResendVerification = async () => {
    console.log("🔄 Resend verification button clicked");
    console.log("📧 pendingVerificationEmail:", pendingVerificationEmail);
    console.log("⏰ resendCooldown:", resendCooldown);
    console.log("🔒 storedPassword exists:", !!storedPassword);

    if (!pendingVerificationEmail || resendCooldown > 0 || !storedPassword) {
      console.log("❌ Early return - conditions not met");
      return;
    }

    console.log("✅ Proceeding with resend verification");
    setIsResendingVerification(true);
    setError("");
    setSuccess("");

    try {
      console.log("📧 Calling sendVerificationEmail...");
      await sendVerificationEmail(pendingVerificationEmail, storedPassword);
      console.log("✅ Verification email sent successfully");
      setSuccess("驗證郵件已重新發送，請檢查您的收件箱。");
      setResendCooldown(30);

      // Update the stored pending verification data with new cooldown
      if (pendingVerificationEmail && storedPassword) {
        const pendingVerificationData = {
          email: pendingVerificationEmail,
          password: storedPassword,
          cooldown: 30,
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(
          "fleet_trace_pending_verification",
          JSON.stringify(pendingVerificationData)
        );
        console.log("💾 Updated pending verification data in localStorage");
      }
    } catch (err: any) {
      console.error("💥 Resend verification error:", err);

      let errorMessage = "重新發送驗證郵件失敗，請稍後再試。";

      if (err.code) {
        switch (err.code) {
          case "auth/user-not-found":
            errorMessage = "找不到此電子郵件對應的帳號";
            break;
          case "auth/wrong-password":
            errorMessage = "密碼錯誤，請重新嘗試登入";
            setStoredPassword(""); // Clear stored password if it's wrong
            break;
          case "auth/too-many-requests":
            errorMessage = "請求過於頻繁，請稍後再試";
            break;
          case "auth/network-request-failed":
            errorMessage = "網路連線失敗，請檢查網路連線";
            break;
        }
      }

      setError(errorMessage);
    } finally {
      setIsResendingVerification(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("🔄 Forgot password form submitted");
    console.log("📧 Reset Email:", resetEmail);

    setError("");
    setSuccess("");
    setIsResettingPassword(true);

    try {
      await resetPassword(resetEmail);
      // Firebase doesn't throw error for non-existent emails for security reasons
      // So we show a generic success message
      setSuccess(
        `密碼重設郵件已發送至 ${resetEmail}。如果該電子郵件已註冊，您將收到重設密碼的指示。請檢查您的收件箱（包括垃圾郵件資料夾）。`
      );
      setShowForgotPassword(false);
      setResetEmail("");
    } catch (err: any) {
      console.error("💥 Password reset error:", err);

      let errorMessage = "發送密碼重設郵件失敗，請重試。";

      if (err.code) {
        switch (err.code) {
          case "auth/invalid-email":
            errorMessage = "電子郵件格式不正確";
            break;
          case "auth/too-many-requests":
            errorMessage = "請求過於頻繁，請稍後再試";
            break;
          case "auth/network-request-failed":
            errorMessage = "網路連線失敗，請檢查網路連線";
            break;
          default:
            errorMessage = `發送失敗：${err.message}`;
        }
      }

      setError(errorMessage);
    } finally {
      setIsResettingPassword(false);
    }
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <Banner
          className="absolute top-0 left-0 w-full h-full -z-10"
          backgroundVideo="/dynamic-background/lady-bike-grass.mp4"
        />
        <Card className="w-full max-w-2xl rounded-2xl" glass animate>
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">正在檢查登入狀態...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      <Banner
        className="absolute top-0 left-0 w-full h-full -z-10"
        backgroundVideo="/dynamic-background/lady-bike-grass.mp4"
      />
      <Card className="w-full max-w-2xl rounded-2xl" glass animate>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-gray-800">
            乘跡｜騎行體驗分享平台
          </CardTitle>
          <CardDescription>登入或註冊以存取您的體驗</CardDescription>
        </CardHeader>

        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-4"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl transition-colors duration-1000 relative bg-gray-100/50 p-1 overflow-hidden">
              <div
                className={`absolute transition-all duration-500 ease-in-out w-[calc(50%-4px)] h-[calc(100%-8px)] bg-white rounded-xl shadow-sm top-1 ${
                  activeTab === "login"
                    ? "left-1"
                    : "translate-x-[calc(100%+4px)]"
                }`}
              />
              <TabsTrigger
                value="login"
                className="rounded-xl transition-all duration-300 relative z-10 data-[state=active]:text-gray-800 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 px-2"
              >
                登入
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="rounded-xl transition-all duration-300 relative z-10 data-[state=active]:text-gray-800 data-[state=active]:font-bold data-[state=inactive]:text-gray-500 px-2"
              >
                註冊
              </TabsTrigger>
            </TabsList>

            <TabsContent
              value="login"
              className="space-y-4 transition-all duration-500 data-[state=inactive]:translate-x-[-100%] data-[state=active]:translate-x-0"
            >
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2 text-gray-800">
                  <Label htmlFor="login-email">電子郵件</Label>
                  <div className="relative flex items-center">
                    <Input
                      className="rounded-xl bg-gray-100 border-white-100 pr-10"
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      required
                      placeholder="請輸入電子郵件"
                    />
                    {renderInputIcon("email", Mail, isEmailFocused)}
                  </div>
                </div>

                <div className="space-y-2 text-gray-800">
                  <Label htmlFor="login-password">密碼</Label>
                  <div className="relative flex items-center">
                    <Input
                      className="rounded-xl bg-gray-100 border-white-100 pr-10"
                      id="login-password"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      required
                      placeholder="請輸入密碼"
                    />
                    {renderInputIcon("password", Lock, isPasswordFocused)}
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="remember-me"
                    checked={rememberMe}
                    onCheckedChange={(checked) =>
                      setRememberMe(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="remember-me"
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    記住我 (14天內自動登入)
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-b from-gray-800 to-gray-950 
                  hover:from-gray-700 hover:to-gray-800 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
                  disabled={isFormLoading}
                >
                  {isFormLoading ? "登入中..." : "登入"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    忘記密碼？
                  </button>
                </div>
              </form>
            </TabsContent>

            <TabsContent
              value="register"
              className="space-y-4 transition-all duration-500 data-[state=inactive]:translate-x-[100%] data-[state=active]:translate-x-0"
            >
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">電子郵件</Label>
                  <div className="relative flex items-center">
                    <Input
                      className="rounded-xl bg-gray-100 border-white-100 pr-10"
                      id="register-email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      onFocus={() => setIsRegisterEmailFocused(true)}
                      onBlur={() => setIsRegisterEmailFocused(false)}
                      required
                      placeholder="請輸入電子郵件"
                    />
                    {renderInputIcon("email", Mail, isRegisterEmailFocused)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-displayName">顯示名稱</Label>
                  <div className="relative flex items-center">
                    <Input
                      className="rounded-xl bg-gray-100 border-white-100 pr-10"
                      id="register-displayName"
                      type="text"
                      value={displayName}
                      onChange={(e) =>
                        handleInputChange("displayName", e.target.value)
                      }
                      onFocus={() => setIsDisplayNameFocused(true)}
                      onBlur={() => setIsDisplayNameFocused(false)}
                      required
                      placeholder="請輸入您的顯示姓名"
                    />
                    {renderInputIcon("displayName", User, isDisplayNameFocused)}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">密碼</Label>
                  <div className="relative flex items-center">
                    <Input
                      className="rounded-xl bg-gray-100 border-white-100 pr-10"
                      id="register-password"
                      type="password"
                      value={password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      onFocus={() => setIsRegisterPasswordFocused(true)}
                      onBlur={() => setIsRegisterPasswordFocused(false)}
                      required
                      placeholder="請輸入在這個網站使用的密碼，長度至少需要 6 個字元"
                      minLength={6}
                    />
                    {renderInputIcon(
                      "password",
                      Lock,
                      isRegisterPasswordFocused
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-confirmPassword">確認密碼</Label>
                  <div className="relative flex items-center">
                    <Input
                      className="rounded-xl bg-gray-100 border-white-100 pr-10"
                      id="register-confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      onFocus={() => setIsConfirmPasswordFocused(true)}
                      onBlur={() => setIsConfirmPasswordFocused(false)}
                      required
                      placeholder="請再次輸入相同的密碼，確保您輸入的密碼正確"
                    />
                    {renderInputIcon(
                      "confirmPassword",
                      Lock,
                      isConfirmPasswordFocused
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  className="w-full bg-gradient-to-b from-blue-500 to-blue-600 
                  hover:from-blue-500 hover:to-blue-600 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
                  onClick={() => setShowInfoModal(true)}
                >
                  為什麼要提供這些資料？
                </Button>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-b from-gray-800 to-gray-950 
                  hover:from-gray-700 hover:to-gray-800 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
                  disabled={isFormLoading}
                >
                  {isFormLoading ? "註冊中..." : "註冊帳號"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="rounded-2xl mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {pendingVerificationEmail && (
            <Alert className="rounded-2xl mt-4 border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-800">
                <div className="space-y-3">
                  <p className="font-medium">📧 等待郵件驗證</p>
                  <p className="text-sm">
                    驗證郵件已發送至 <strong>{pendingVerificationEmail}</strong>
                  </p>
                  <p className="text-sm">
                    請檢查您的收件箱（包括垃圾郵件資料夾），點擊驗證連結後即可登入。
                  </p>
                  <div className="pt-2">
                    <Button
                      onClick={handleResendVerification}
                      disabled={resendCooldown > 0 || isResendingVerification}
                      variant="outline"
                      size="sm"
                      className="text-blue-700 border-blue-300 hover:bg-blue-100"
                    >
                      {isResendingVerification
                        ? "發送中..."
                        : resendCooldown > 0
                        ? `重新發送 (${resendCooldown}s)`
                        : "重新發送驗證郵件"}
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {hasRememberMeSession && (
            <Alert className="rounded-2xl mt-4 border-green-200 bg-green-50">
              <AlertDescription className="text-green-800">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">已啟用自動登入</span>
                </div>
                <p className="text-sm mt-1">
                  您已啟用「記住我」功能，系統將在14天內保持登入狀態。
                </p>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>重設密碼</DialogTitle>
            <DialogDescription>
              輸入您的電子郵件地址，我們將發送密碼重設連結給您。
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-email">電子郵件</Label>
              <Input
                id="reset-email"
                type="email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                placeholder="請輸入您的電子郵件"
              />
            </div>

            {error && showForgotPassword && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetEmail("");
                  setError("");
                }}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isResettingPassword}
                className="flex-1"
              >
                {isResettingPassword ? "發送中..." : "發送重設郵件"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Info Modal Dialog */}
      <Dialog open={showInfoModal} onOpenChange={setShowInfoModal}>
        <DialogContent className="max-w-[90%] sm:max-w-md px-5 py-10 rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-800">
              📋 為什麼需要提供這些資料？
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              了解我們如何保護您的隱私並提供更好的服務
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm text-gray-700">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base">
                    電子郵件地址
                  </h4>
                  <p className="text-gray-600 pt-2">
                    您的電子郵件將用於接收我們發送的 Line Points
                    獎勵。這是我們回饋參與問卷調查活動的方式，確保您能及時收到應得的獎勵。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Lock className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base">
                    密碼安全
                  </h4>
                  <p className="text-gray-600 pt-2">
                    我們不會收集或儲存您的密碼。您需要記住自己的密碼，這樣才能持續參與問卷調查活動。請選擇一個安全且容易記住的密碼。
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-base">
                    個人資料
                  </h4>
                  <p className="text-gray-600 pt-2">
                    您的個人資料僅用於問卷調查活動的統計分析，我們承諾保護您的隱私，不會將資料提供給第三方。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-blue-800 text-xs">
                💡 <strong>小提醒：</strong>{" "}
                請確保您提供的電子郵件地址正確，這樣我們才能順利發送 Line Points
                給您！
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-2 rounded-2xl">
            <Button
              onClick={() => setShowInfoModal(false)}
              className="w-full bg-gradient-to-b from-blue-500 to-blue-600 
                  hover:from-blue-500 hover:to-blue-600 transition-all duration-500 
                  shadow-md hover:shadow-lg transform hover:-translate-y-0.5 hover:text-base
                  rounded-xl"
            >
              我了解了
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Completion Modal */}
      <Dialog open={showServiceCompletionModal} onOpenChange={() => {}} modal>
        <DialogContent
          className="max-w-[90%] sm:max-w-lg px-6 py-8 rounded-xl"
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center text-gray-800 mb-2">
              🎉 服務已完成
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 text-base">
              感謝您的參與與支持
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 text-center">
            {/* Main message */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                乘跡調查活動已圓滿結束
              </h3>

              <p className="text-gray-700 leading-relaxed mb-4">
                感謝您對乘跡平台的支持與參與！我們的問卷調查活動已經成功完成，
                目前系統暫時停止服務以進行數據整理與分析。
              </p>

              <p className="text-sm text-gray-600 mb-4">
                點擊下方按鈕後，您將被登出並回到登入頁面。
              </p>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-600">
                  💡 <strong>重要提醒：</strong>
                  <br />
                  如果您已參與調查，Line Points
                  獎勵將於數據處理完成後發送至您的電子郵件。 預計處理時間為 1-2
                  週，請耐心等候。
                </p>
              </div>
            </div>

            {/* Thank you message */}
            <div className="space-y-3">
              <p className="text-gray-700 font-medium">
                🙏 再次感謝您的寶貴意見與時間
              </p>
              <p className="text-sm text-gray-600">
                您的參與讓我們能夠更好地了解騎行需求，為未來的服務改進提供重要依據。
              </p>
            </div>

            {/* Contact information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                📧 如有任何問題，請聯繫：{" "}
                <a
                  href="mailto:support@bike-life.net"
                  className="font-medium underline hover:text-blue-900"
                >
                  support@bike-life.net
                </a>
              </p>
            </div>

            {/* Close button */}
            <div className="pt-4">
              <Button
                onClick={() => {
                  setShowServiceCompletionModal(false);
                  // Log out the user and stay on login page
                  logout();
                }}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 
                    hover:from-gray-700 hover:to-gray-800 transition-all duration-300 
                    shadow-lg hover:shadow-xl transform hover:-translate-y-0.5
                    rounded-xl py-3 text-base font-medium"
              >
                我知道了
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 px-4 text-center">
        <p className="text-sm text-white">
          需要協助？請聯繫我們：{" "}
          <a
            href="mailto:support@bike-life.net"
            className="text-blue-200 hover:text-blue-400 underline font-medium"
          >
            support@bike-life.net
          </a>
        </p>
      </footer>
    </div>
  );
}
