"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getAllUserInfo,
  getAllVoucherClaims,
  getUserInfoStats,
} from "@/lib/firebase-user-info";
import { getUserProfile } from "@/lib/firebase-users";
import type { UserInfo, VoucherClaim } from "@/types/userInfo";
import type { UserProfile } from "@/types/user";
import {
  Search,
  User,
  Gift,
  Calendar,
  MapPin,
  Loader2,
  TrendingUp,
} from "lucide-react";

interface UserInfoManagementProps {
  className?: string;
}

// Extended UserInfo with display name
interface UserInfoWithDisplayName extends UserInfo {
  displayName?: string;
}

export default function UserInfoManagement({
  className,
}: UserInfoManagementProps) {
  const [userInfos, setUserInfos] = useState<UserInfoWithDisplayName[]>([]);
  const [voucherClaims, setVoucherClaims] = useState<VoucherClaim[]>([]);
  const [stats, setStats] = useState<{
    totalUsers: number;
    totalVouchersEligible: number;
    totalVouchersClaimed: number;
    totalVoucherAmount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<"users" | "claims" | "stats">(
    "users"
  );

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 UserInfoManagement: Starting data load...");

      const [userInfoData, voucherClaimsData, statsData] = await Promise.all([
        getAllUserInfo(),
        getAllVoucherClaims(),
        getUserInfoStats(),
      ]);

      // Fetch display names for all users
      const userInfosWithDisplayNames = await Promise.all(
        userInfoData.map(async (userInfo) => {
          try {
            const userProfile = await getUserProfile(userInfo.userId);
            return {
              ...userInfo,
              displayName: userProfile?.displayName || "未設定",
            };
          } catch (error) {
            console.warn(
              `Failed to fetch display name for user ${userInfo.userId}:`,
              error
            );
            return {
              ...userInfo,
              displayName: "載入失敗",
            };
          }
        })
      );

      console.log("✅ UserInfoManagement: Data loaded successfully", {
        userInfos: userInfosWithDisplayNames.length,
        voucherClaims: voucherClaimsData.length,
        stats: statsData,
      });

      setUserInfos(userInfosWithDisplayNames);
      setVoucherClaims(voucherClaimsData);
      setStats(statsData);
    } catch (err) {
      console.error(
        "❌ UserInfoManagement: Failed to load user info data:",
        err
      );
      const errorMessage = err instanceof Error ? err.message : "Unknown error";

      if (errorMessage.includes("index") || errorMessage.includes("Index")) {
        setError("資料庫索引正在建立中，請稍等幾分鐘後重新載入頁面");
      } else if (errorMessage.includes("timeout")) {
        setError("載入數據超時，請檢查網路連接後重試");
      } else {
        setError("載入數據時發生錯誤: " + errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredUserInfos = userInfos.filter(
    (userInfo) =>
      userInfo.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userInfo.userId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVoucherClaims = voucherClaims.filter((claim) =>
    claim.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              使用者資料管理
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                總用戶數
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                可領取現金券
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalVouchersEligible}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                已領取現金券
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalVouchersClaimed}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                現金券總額
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                NT${stats.totalVoucherAmount.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === "users" ? "default" : "outline"}
          onClick={() => setActiveTab("users")}
        >
          <User className="h-4 w-4 mr-2" />
          用戶資料
        </Button>
        <Button
          variant={activeTab === "claims" ? "default" : "outline"}
          onClick={() => setActiveTab("claims")}
        >
          <Gift className="h-4 w-4 mr-2" />
          現金券記錄
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜尋顯示名稱、評鑑調查姓名、縣市或用戶ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={loadData} variant="outline">
          重新載入
        </Button>
      </div>

      {/* User Info Table */}
      {activeTab === "users" && (
        <Card>
          <CardHeader>
            <CardTitle>用戶基本資料</CardTitle>
            <CardDescription>
              共 {filteredUserInfos.length} 筆記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>顯示名稱</TableHead>
                    <TableHead>性別</TableHead>
                    <TableHead>出生日期</TableHead>
                    <TableHead>居住縣市</TableHead>
                    <TableHead>提交時間</TableHead>
                    <TableHead>現金券狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUserInfos.map((userInfo) => (
                    <TableRow key={userInfo.id}>
                      <TableCell className="text-sm text-gray-600">
                        {userInfo.id?.slice(0, 4)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        {userInfo.displayName || "未設定"}
                      </TableCell>
                      <TableCell>
                        {userInfo.gender}
                        {userInfo.genderDescription &&
                          userInfo.genderDescription.trim() && (
                            <span className="text-xs text-gray-500 block">
                              ({userInfo.genderDescription})
                            </span>
                          )}
                      </TableCell>
                      <TableCell>{userInfo.birthDate}</TableCell>
                      <TableCell>{userInfo.city}</TableCell>
                      <TableCell>
                        {new Date(userInfo.submittedAt).toLocaleDateString(
                          "zh-TW"
                        )}
                      </TableCell>
                      <TableCell>
                        {userInfo.voucherEligible ? (
                          <Badge variant="outline" className="text-green-600">
                            可領取
                          </Badge>
                        ) : userInfo.voucherClaimedAt ? (
                          <Badge variant="secondary">已領取</Badge>
                        ) : (
                          <Badge variant="outline">不符合</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Voucher Claims Table */}
      {activeTab === "claims" && (
        <Card>
          <CardHeader>
            <CardTitle>現金券領取記錄</CardTitle>
            <CardDescription>
              共 {filteredVoucherClaims.length} 筆記錄
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>用戶ID</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>領取時間</TableHead>
                    <TableHead>到期時間</TableHead>
                    <TableHead>狀態</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVoucherClaims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-mono text-xs">
                        {claim.userId.substring(0, 8)}...
                      </TableCell>
                      <TableCell className="font-medium">
                        NT${claim.amount}
                      </TableCell>
                      <TableCell>
                        {new Date(claim.claimedAt).toLocaleDateString("zh-TW")}
                      </TableCell>
                      <TableCell>
                        {new Date(claim.expiresAt).toLocaleDateString("zh-TW")}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            claim.status === "approved"
                              ? "default"
                              : claim.status === "claimed"
                              ? "secondary"
                              : claim.status === "expired"
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {claim.status === "approved" && "已核准"}
                          {claim.status === "claimed" && "已使用"}
                          {claim.status === "expired" && "已過期"}
                          {claim.status === "pending" && "待處理"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
