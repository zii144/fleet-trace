"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Calendar,
  Zap,
  Bug,
  Shield,
  Star,
  AlertTriangle,
  CheckCircle,
  Plus,
  Minus,
  Settings,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { APP_VERSION } from "@/lib/version-check";
import { loadChangelog, type ChangelogEntry } from "@/lib/changelog-parser";

function getTypeIcon(type: string) {
  switch (type) {
    case "major":
      return <Star className="w-4 h-4 text-yellow-500" />;
    case "minor":
      return <Plus className="w-4 h-4 text-blue-500" />;
    case "patch":
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    case "hotfix":
      return <AlertTriangle className="w-4 h-4 text-red-500" />;
    default:
      return <Zap className="w-4 h-4 text-purple-500" />;
  }
}

function getTypeBadge(type: string) {
  const variants = {
    major: "default",
    minor: "secondary",
    patch: "outline",
    hotfix: "destructive",
  } as const;

  return (
    <Badge variant={variants[type as keyof typeof variants] || "outline"}>
      {type.toUpperCase()}
    </Badge>
  );
}

export default function PatchNotesPage() {
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [changelogEntries, setChangelogEntries] = useState<ChangelogEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadChangelogData = async () => {
      try {
        const entries = await loadChangelog();
        setChangelogEntries(entries);
      } catch (error) {
        console.error("Error loading changelog:", error);
        setChangelogEntries([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadChangelogData();
  }, []);

  const latestVersion = changelogEntries[0];
  const isLatestVersion = latestVersion?.version === APP_VERSION;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">載入更新記錄中...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (changelogEntries.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">無法載入更新記錄</h2>
              <p className="text-muted-foreground">
                無法從 CHANGELOG.md 載入更新記錄，請稍後再試。
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回儀表板
            </Button>
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                更新日誌
              </h1>
              <p className="text-muted-foreground">
                查看騎跡平台的所有版本更新和功能改進
              </p>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">當前版本</Badge>
                <Badge variant="default">v{APP_VERSION}</Badge>
              </div>
              {isLatestVersion && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  已是最新版本
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Latest Version Highlight */}
        <Card className="mb-8 border-2 border-white-200 bg-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTypeIcon(latestVersion.type)}
                <div>
                  <CardTitle className="text-xl">
                    v{latestVersion.version} - {latestVersion.title}
                  </CardTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {new Date(latestVersion.date).toLocaleDateString("zh-TW")}
                    </span>
                    {getTypeBadge(latestVersion.type)}
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {latestVersion.description}
            </p>

            <Tabs defaultValue="features" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="features">新功能</TabsTrigger>
                <TabsTrigger value="improvements">改進</TabsTrigger>
                <TabsTrigger value="fixes">修復</TabsTrigger>
                <TabsTrigger value="security">安全</TabsTrigger>
              </TabsList>

              <TabsContent value="features" className="mt-4">
                <div className="space-y-2">
                  {latestVersion.features.length > 0 ? (
                    latestVersion.features.map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Plus className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-2">
                      <Plus className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        此版本無新功能
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="improvements" className="mt-4">
                <div className="space-y-2">
                  {latestVersion.improvements.length > 0 ? (
                    latestVersion.improvements.map((improvement, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Zap className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{improvement}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-2">
                      <Zap className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        此版本無改進項目
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="fixes" className="mt-4">
                <div className="space-y-2">
                  {latestVersion.fixes.length > 0 ? (
                    latestVersion.fixes.map((fix, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Bug className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{fix}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-2">
                      <Bug className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        此版本無錯誤修復
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="security" className="mt-4">
                <div className="space-y-2">
                  {latestVersion.security.length > 0 ? (
                    latestVersion.security.map((security, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <Shield className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{security}</span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-2">
                      <Shield className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-muted-foreground">
                        此版本無安全更新
                      </span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Version History */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-foreground">版本歷史</h2>
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                資料來源：CHANGELOG.md
              </span>
            </div>
          </div>

          {changelogEntries.slice(1).map((patch, index) => (
            <Card
              key={patch.version}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(patch.type)}
                    <div>
                      <CardTitle className="text-lg">
                        v{patch.version} - {patch.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(patch.date).toLocaleDateString("zh-TW")}
                        </span>
                        {getTypeBadge(patch.type)}
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      setSelectedVersion(
                        selectedVersion === patch.version ? null : patch.version
                      )
                    }
                  >
                    {selectedVersion === patch.version ? "收起" : "詳情"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-muted-foreground mb-4">
                  {patch.description}
                </p>

                {selectedVersion === patch.version && (
                  <div className="space-y-4">
                    {patch.features.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center">
                          <Plus className="w-4 h-4 text-green-500 mr-2" />
                          新功能
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {patch.features.map((feature, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {patch.improvements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center">
                          <Zap className="w-4 h-4 text-blue-500 mr-2" />
                          改進
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {patch.improvements.map((improvement, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {patch.fixes.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center">
                          <Bug className="w-4 h-4 text-orange-500 mr-2" />
                          修復
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {patch.fixes.map((fix, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {fix}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {patch.security.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center">
                          <Shield className="w-4 h-4 text-green-500 mr-2" />
                          安全更新
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {patch.security.map((security, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {security}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {patch.deprecated && patch.deprecated.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center">
                          <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                          已棄用
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {patch.deprecated.map((deprecated, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {deprecated}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {patch.removed && patch.removed.length > 0 && (
                      <div>
                        <h4 className="font-medium text-foreground mb-2 flex items-center">
                          <Minus className="w-4 h-4 text-red-500 mr-2" />
                          已移除
                        </h4>
                        <ul className="space-y-1 ml-6">
                          {patch.removed.map((removed, idx) => (
                            <li
                              key={idx}
                              className="text-sm text-muted-foreground"
                            >
                              {removed}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Separator className="mb-6" />
          <p className="text-sm text-muted-foreground">
            需要技術支援或有任何問題？請聯絡我們的開發團隊
          </p>
          <div className="flex justify-center space-x-4 mt-2">
            <a
              href="mailto:zii@iactor.com.tw"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              support@bike-life.net
            </a>
            <a
              href="https://github.com/zii144/fleet-trace/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              GitHub Issues
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
