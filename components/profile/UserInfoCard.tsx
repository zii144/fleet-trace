"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { AuthUser, User } from "@/types/auth";
import type { UserStats } from "@/types/user";
import { getRankColor } from "@/lib/user-profile";

interface UserInfoCardProps {
  user: User | AuthUser | null;
  stats: UserStats | null;
  className?: string;
}

// Type guard for User type
function isUser(user: User | AuthUser): user is User {
  return "name" in user;
}

// Type guard for AuthUser type
function isAuthUser(user: User | AuthUser): user is AuthUser {
  return "displayName" in user;
}

function getUserInitials(user: User | AuthUser | null): string {
  if (!user) return "U";

  if (isAuthUser(user)) {
    if (user.displayName) {
      const names = user.displayName.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.displayName[0].toUpperCase();
    }
    return user.email?.[0]?.toUpperCase() || "U";
  }

  if (isUser(user)) {
    if (user.name) {
      const names = user.name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return user.name[0].toUpperCase();
    }
    return user.email[0].toUpperCase();
  }

  return "U";
}

function getUserDisplayName(user: User | AuthUser | null): string {
  if (!user) return "數據未提供";

  if (isAuthUser(user)) {
    return user.displayName || "數據未提供";
  }

  if (isUser(user)) {
    return user.name || user.email || "數據未提供";
  }

  return "數據未提供";
}

function getUserEmail(user: User | AuthUser | null): string {
  if (!user) return "未提供";

  if (isAuthUser(user)) {
    return user.email || "未提供";
  }

  if (isUser(user)) {
    return user.email;
  }

  return "未提供";
}

export function UserInfoCard({
  user,
  stats,
  className = "",
}: UserInfoCardProps) {
  const [showEmail, setShowEmail] = useState(false);

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="flex-1 flex flex-col justify-center">
        <div className="flex flex-col items-center space-y-6 h-full justify-center">
          <Avatar
            className="h-20 w-20 flex-shrink-0"
            style={{
              background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
            }}
          >
            <AvatarFallback className="text-xl font-semibold drop-shadow-lg">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>

          <div className="text-center flex flex-col items-center space-y-3">
            <CardTitle className="text-2xl md:text-3xl font-bold text-gray- truncate drop-shadow-sm">
              {getUserDisplayName(user)}
            </CardTitle>

            {stats && (
              <Badge
                className={`${getRankColor(
                  stats.rank
                )} bg-primary/90 text-white mt-2 opacity-100 mb-1 text-sm md:text-sm pointer-events-none select-none`}
              >
                <Trophy className="w-4 h-4 mr-1" />
                {stats.rank}
              </Badge>
            )}

            {/* Email */}
            {/*
            <div
              className="text-sm md:text-base text-gray-600 truncate cursor-pointer select-none"
              onClick={() => setShowEmail((prev) => !prev)}
              title="點擊以顯示/隱藏電子郵件"
            >
              電子郵件：
              {showEmail ? getUserEmail(user) : "點擊顯示"}
            </div>
            */}
          </div>

          {/* Cash Voucher */}
          {/*<div className="text-center flex flex-col items-center">
            <p className="text-3xl md:text-4xl font-bold text-gray-800">
              ${stats?.cashVoucher || "數據未提供"}
            </p>
            <p className="text-sm md:text-base text-gray-600 whitespace-nowrap mt-2">
              從平台獲取現金劵
            </p>
          </div>*/}
        </div>
      </CardHeader>
    </Card>
  );
}
