import { Button } from "@/components/ui/button";
import { CircleUser, LogOut, Settings, Gift } from "lucide-react";
import Link from "next/link";
import type { AuthUser } from "@/types/auth";

interface DashboardHeaderProps {
  user: AuthUser | null;
  onLogout: () => void;
  onShowPromo?: () => void;
}

export function DashboardHeader({
  user,
  onLogout,
  onShowPromo,
}: DashboardHeaderProps) {
  return (
    <header className="bg-white/5 backdrop-blur-sm border-b border-gray-200 sticky top-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-6 min-w-0">
          <div className="min-w-0 flex-1 pr-4">
            {/* Desktop title */}
            <h1 className="hidden lg:block text-3xl font-bold text-gray-900 truncate">
              書寫乘跡
            </h1>
            {/* Mobile/Tablet logo/short title */}
            <h1 className="lg:hidden text-xl sm:text-2xl font-bold text-gray-900 truncate">
              書寫乘跡
            </h1>
            {/* Desktop welcome message */}
            <p className="hidden lg:block text-gray-600 truncate mt-1">
              {(() => {
                // Define your welcome messages here
                const messages = [
                  "很高興再次見到你！",
                  "歡迎回來，以下是為您準備好的問卷",
                  "感謝你的參與，希望您有美好的體驗！",
                ];
                // Pick one at random
                const randomMsg =
                  messages[Math.floor(Math.random() * messages.length)];
                // Show user name/email + random message
                return (
                  <>
                    {user?.displayName || user?.email}，{randomMsg}
                  </>
                );
              })()}
            </p>
            {/* Mobile/Tablet short welcome */}
            <p className="lg:hidden text-sm text-gray-600 truncate">
              {user?.displayName?.split(" ")[0] ||
                user?.email?.split("@")[0] ||
                "歡迎回來"}
            </p>
          </div>
          <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-3 flex-shrink-0">
            {/* Member information button */}
            <Link href="/profile">
              <Button
                variant="outline"
                size="sm"
                className="whitespace-nowrap px-2 sm:px-3"
              >
                {/* Mobile: icon only */}
                <CircleUser className="w-4 h-4 sm:mr-1" />
                {/* Desktop: icon + text */}
                <span className="hidden sm:inline text-xs sm:text-sm">
                  會員資訊
                </span>
              </Button>
            </Link>

            {/* Promotional button */}
            {onShowPromo && (
              <Button
                variant="default"
                size="sm"
                onClick={onShowPromo}
                className="whitespace-nowrap px-2 sm:px-3 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {/* Mobile: icon only */}
                <Gift className="w-4 h-4 sm:mr-1" />
                {/* Desktop: icon + text */}
                <span className="hidden sm:inline text-xs sm:text-sm">
                  獎勵活動
                </span>
              </Button>
            )}

            {user?.role === "admin" && (
              <Link href="/admin">
                <Button
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap px-2 sm:px-3"
                >
                  {/* Mobile: icon only */}
                  <Settings className="w-4 h-4 sm:mr-1" />
                  {/* Desktop: icon + text */}
                  <span className="hidden sm:inline text-xs sm:text-sm">
                    管理面板
                  </span>
                </Button>
              </Link>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="whitespace-nowrap px-2 sm:px-3"
            >
              {/* Mobile: icon only */}
              <LogOut className="w-4 h-4 sm:mr-1 lg:mr-2" />
              {/* Desktop: text */}
              <span className="hidden sm:inline text-xs sm:text-sm">登出</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
