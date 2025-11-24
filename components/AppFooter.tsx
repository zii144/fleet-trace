"use client";

import { APP_VERSION } from "@/lib/version-check";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Mail, ExternalLink, Info, Shield, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface AppFooterProps {
  className?: string;
  showVersion?: boolean;
  showLinks?: boolean;
  hideOnQuestionnaire?: boolean;
}

export function AppFooter({
  className = "",
  showVersion = true,
  showLinks = true,
  hideOnQuestionnaire = true,
}: AppFooterProps) {
  const pathname = usePathname();
  const currentYear = new Date().getFullYear();

  // Hide footer on questionnaire pages if hideOnQuestionnaire is true
  if (hideOnQuestionnaire && pathname?.startsWith("/questionnaire/")) {
    return null;
  }

  return (
    <footer
      className={`w-full bg-background/95 backdrop-blur-sm border-t ${className}`}
    >
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* App Info */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div>
                <h3 className="font-semibold text-foreground">乘跡</h3>
                <p className="text-xs text-muted-foreground">
                  計程車服務品質評核平台
                </p>
              </div>
            </div>

            {showVersion && (
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  v{APP_VERSION}
                </Badge>
                <Link href="/patch-notes">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                  >
                    <Info className="w-3 h-3 mr-1" />
                    更新日誌
                  </Button>
                </Link>
              </div>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed">
              計程車服務品質評核平台，結合數據分析與問卷回饋，
              提升計程車服務品質。
            </p>
          </div>

          {/* Quick Links */}
          {showLinks && (
            <div className="space-y-3">
              <h4 className="font-medium text-foreground">快速連結</h4>
              <div className="space-y-2">
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 justify-start w-full"
                  >
                    <ExternalLink className="w-3 h-3 mr-2" />
                    儀表板
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 justify-start w-full"
                  >
                    <User className="w-3 h-3 mr-2" />
                    個人資料
                  </Button>
                </Link>
                <Link href="/patch-notes">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 justify-start w-full"
                  >
                    <Info className="w-3 h-3 mr-2" />
                    更新日誌
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Contact & Support */}
          <div className="space-y-3">
            <h4 className="font-medium text-foreground">支援與聯絡</h4>
            <div className="space-y-2">
              <a
                href="mailto:support@bike-life.net"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-3 h-3 mr-2" />
                support@bike-life.net
              </a>
              <a
                href="https://github.com/zii144/fleet-trace/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Github className="w-3 h-3 mr-2" />
                回報問題
              </a>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <Shield className="w-3 h-3 text-green-500" />
              <span className="text-xs text-muted-foreground">
                企業級安全保護
              </span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
            <span>© {currentYear} ITSmart Co. Ltd.</span>
            <span>•</span>
            <span>專有軟體</span>
            <span>•</span>
            <span>未經授權禁止使用</span>
          </div>

          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>Made in Taiwan</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
