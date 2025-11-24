import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Download,
  Filter,
  RefreshCw,
} from "lucide-react";
import { QuestionnaireResponseManager } from "./QuestionnaireResponseManager";

// Import Firebase functions
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { updateUserRole, createUserProfile } from "@/lib/firebase-users";
import { useToast } from "@/hooks/use-toast";

interface AdminManagementTableProps {
  userRole: "admin" | "user";
}

interface TableData {
  id: string;
  [key: string]: any;
}

interface TableConfig {
  name: string;
  collection: string;
  displayName: string;
  icon: React.ReactNode;
  columns: {
    key: string;
    label: string;
    type:
      | "text"
      | "number"
      | "date"
      | "date-only"
      | "boolean"
      | "badge"
      | "json";
    editable?: boolean;
    width?: string;
  }[];
  searchableFields: string[];
  defaultSort?: { field: string; direction: "asc" | "desc" };
  isSpecialTab?: boolean; // Indicates if this tab uses a custom component
}

const tableConfigs: TableConfig[] = [
  {
    name: "users",
    collection: "users",
    displayName: "用戶管理",
    icon: <Search className="w-4 h-4" />,
    columns: [
      { key: "email", label: "電子郵件", type: "text", editable: true },
      { key: "displayName", label: "顯示名稱", type: "text", editable: true },
      { key: "role", label: "角色", type: "badge", editable: true },
      {
        key: "emailVerified",
        label: "郵件驗證",
        type: "boolean",
        editable: true,
      },
      {
        key: "totalSubmissions",
        label: "提交次數",
        type: "number",
        editable: true,
      },
      { key: "createdAt", label: "創建時間", type: "date-only" },
      { key: "updatedAt", label: "更新時間", type: "date-only" },
      { key: "lastActiveAt", label: "最後活動", type: "date-only" },
    ],
    searchableFields: ["email", "displayName", "role"],
    defaultSort: { field: "updatedAt", direction: "desc" },
  },
  {
    name: "questionnaire_responses",
    collection: "questionnaire_responses",
    displayName: "問卷回應",
    icon: <Eye className="w-4 h-4" />,
    columns: [
      { key: "documentId", label: "FireStore ID", type: "text" },
      { key: "userId", label: "用戶ID", type: "text" },
      { key: "timeSpentSeconds", label: "時間(秒)", type: "number" },
      { key: "submittedAt", label: "提交時間", type: "date" },
    ],
    searchableFields: ["documentId", "userId"],
    defaultSort: { field: "submittedAt", direction: "desc" },
  },
  {
    name: "user_stats",
    collection: "user_stats",
    displayName: "用戶統計",
    icon: <Filter className="w-4 h-4" />,
    columns: [
      { key: "id", label: "ID", type: "text", width: "200px" },
      { key: "userId", label: "用戶ID", type: "text" },
      { key: "totalSubmissions", label: "總提交數", type: "number" },
      { key: "qualityScore", label: "品質分數", type: "number" },
      { key: "completionStreak", label: "連續完成", type: "number" },
      { key: "rank", label: "等級", type: "badge" },
      { key: "updatedAt", label: "更新時間", type: "date" },
    ],
    searchableFields: ["userId"],
    defaultSort: { field: "updatedAt", direction: "desc" },
  },
  {
    name: "questionnaires",
    collection: "questionnaires",
    displayName: "問卷回應",
    icon: <Edit className="w-4 h-4" />,
    columns: [
      { key: "title", label: "標題", type: "text", editable: true },
      { key: "description", label: "描述", type: "text", editable: true },
      { key: "createdAt", label: "創建時間", type: "date-only" },
      { key: "updatedAt", label: "更新時間", type: "date-only" },
    ],
    searchableFields: ["title", "description"],
    defaultSort: { field: "createdAt", direction: "desc" },
    isSpecialTab: true, // Mark this as a special tab that uses custom component
  },
];

export function AdminManagementTable({ userRole }: AdminManagementTableProps) {
  const { toast } = useToast();
  const [selectedTable, setSelectedTable] = useState<string>("users");
  const [data, setData] = useState<TableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState<TableData | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<TableData | null>(null);
  const [newUserData, setNewUserData] = useState({
    email: "",
    displayName: "",
    role: "user" as "admin" | "user",
    emailVerified: false,
    totalSubmissions: 0,
  });

  const currentConfig = tableConfigs.find(
    (config) => config.name === selectedTable
  );

  // Check if user is admin
  if (userRole !== "admin") {
    return (
      <div className="container mx-auto p-6">
        <Alert>
          <AlertDescription>
            您沒有權限訪問此頁面。僅管理員可以查看管理表格。
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const loadData = async () => {
    if (!currentConfig) return;

    setLoading(true);
    setError(null);

    try {
      const collectionRef = collection(db, currentConfig.collection);
      let q = query(collectionRef);

      // Apply default sorting if configured
      if (currentConfig.defaultSort) {
        q = query(
          q,
          orderBy(
            currentConfig.defaultSort.field,
            currentConfig.defaultSort.direction
          )
        );
      }

      // Limit results for performance
      q = query(q, limit(100));

      const querySnapshot = await getDocs(q);
      const items: TableData[] = [];

      querySnapshot.forEach((doc) => {
        items.push({
          id: doc.id,
          documentId: doc.id,
          ...doc.data(),
        });
      });

      setData(items);
    } catch (err) {
      console.error("Error loading data:", err);
      setError("加載數據失敗");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTable]);

  const handleEdit = (item: TableData) => {
    setEditingItem({ ...item });
    setShowEditDialog(true);
  };

  const handleDelete = (item: TableData) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingItem || !currentConfig) return;

    setLoading(true);
    setError(null);

    try {
      const { id, ...updateData } = editingItem;

      // Remove any undefined or null values from updateData
      const cleanUpdateData = Object.fromEntries(
        Object.entries(updateData).filter(
          ([_, value]) => value !== undefined && value !== null
        )
      );

      // Special handling for user role updates
      if (currentConfig.collection === "users" && cleanUpdateData.role) {
        await updateUserRole(editingItem.id, cleanUpdateData.role);

        // For users, also update other fields if they exist
        if (Object.keys(cleanUpdateData).length > 1) {
          const { role, ...otherFields } = cleanUpdateData;
          if (Object.keys(otherFields).length > 0) {
            const docRef = doc(db, currentConfig.collection, editingItem.id);
            await updateDoc(docRef, otherFields);
          }
        }
      } else {
        // For other collections or non-role updates, use standard updateDoc
        const docRef = doc(db, currentConfig.collection, editingItem.id);
        await updateDoc(docRef, cleanUpdateData);
      }

      // Reload data from Firestore to ensure we have the latest state
      await loadData();

      setShowEditDialog(false);
      setEditingItem(null);

      // Show success toast
      toast({
        title: "更新成功",
        description: "數據已成功更新到資料庫",
        variant: "default",
      });
    } catch (err) {
      console.error("❌ Error updating document:", err);
      const errorMessage = err instanceof Error ? err.message : "未知錯誤";
      setError(`更新失敗: ${errorMessage}`);

      // Show error toast
      toast({
        title: "更新失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !currentConfig) return;

    setLoading(true);
    setError(null);

    try {
      await deleteDoc(doc(db, currentConfig.collection, itemToDelete.id));

      // Reload data from Firestore to ensure we have the latest state
      await loadData();

      setShowDeleteDialog(false);
      setItemToDelete(null);

      // Show success toast
      toast({
        title: "刪除成功",
        description: "項目已成功從資料庫中刪除",
        variant: "default",
      });
    } catch (err) {
      console.error("❌ Error deleting document:", err);
      const errorMessage = err instanceof Error ? err.message : "未知錯誤";
      setError(`刪除失敗: ${errorMessage}`);

      // Show error toast
      toast({
        title: "刪除失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUserData.email || !newUserData.displayName) {
      setError("請填寫所有必填欄位");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Generate a unique user ID (you might want to use a better method)
      const userId = `user_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      await createUserProfile(userId, {
        email: newUserData.email,
        displayName: newUserData.displayName,
        role: newUserData.role,
        emailVerified: newUserData.emailVerified,
        totalSubmissions: newUserData.totalSubmissions,
        lastActiveAt: new Date().toISOString(),
      });

      // Reset form and close dialog
      setNewUserData({
        email: "",
        displayName: "",
        role: "user",
        emailVerified: false,
        totalSubmissions: 0,
      });
      setShowAddDialog(false);

      // Reload data from Firestore to show the new user
      await loadData();

      // Show success toast
      toast({
        title: "用戶創建成功",
        description: `用戶 ${newUserData.displayName} 已成功創建`,
        variant: "default",
      });
    } catch (err) {
      console.error("❌ Error adding user:", err);
      const errorMessage = err instanceof Error ? err.message : "未知錯誤";
      setError(`新增用戶失敗: ${errorMessage}`);

      // Show error toast
      toast({
        title: "新增用戶失敗",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    if (!searchTerm || !currentConfig) return true;

    return currentConfig.searchableFields.some((field) =>
      String(item[field] || "")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const formatCellValue = (value: any, type: string, key?: string) => {
    if (value === null || value === undefined) return "-";

    switch (type) {
      case "date":
        // Handle both Firestore timestamp and ISO string with full date and time
        if (value && typeof value === "object" && value.toDate) {
          return value.toDate().toLocaleString("zh-TW");
        }
        return new Date(value).toLocaleString("zh-TW");
      case "date-only":
        // Handle both Firestore timestamp and ISO string with date only
        if (value && typeof value === "object" && value.toDate) {
          return value.toDate().toLocaleDateString("zh-TW");
        }
        return new Date(value).toLocaleDateString("zh-TW");
      case "boolean":
        return value ? (
          <span className="whitespace-nowrap items-center px-2 py-1 rounded-full text-xs font-medium border bg-blue-100 text-blue-800 border-blue-200">
            是
          </span>
        ) : (
          <span className="whitespace-nowrap items-center px-2 py-1 rounded-full text-xs font-medium border bg-red-100 text-red-800 border-red-200">
            否
          </span>
        );
      case "badge":
        if (key === "role") {
          const roleLabels = { admin: "管理員", user: "用戶" };
          const label = roleLabels[value as keyof typeof roleLabels] || value;
          const isAdmin = value === "admin";
          return (
            <Badge
              variant={isAdmin ? "destructive" : "secondary"}
              className={`pointer-events-none font-medium ${
                isAdmin
                  ? "bg-blue-100 text-blue-800 border-blue-200"
                  : "bg-gray-100 text-gray-700 border-gray-300"
              }`}
            >
              {label}
            </Badge>
          );
        }
        // Enhanced status mapping with better colors and labels
        const statusMap: Record<
          string,
          {
            label: string;
            variant: "default" | "secondary" | "destructive" | "outline";
            className?: string;
          }
        > = {
          // Positive states
          completed: {
            label: "完成",
            variant: "default",
            className: "bg-green-100 text-green-800 border-green-200",
          },
          approved: {
            label: "通過",
            variant: "default",
            className: "bg-green-100 text-green-800 border-green-200",
          },
          active: {
            label: "啟用",
            variant: "default",
            className: "bg-blue-100 text-blue-800 border-blue-200",
          },

          // Neutral states
          pending: {
            label: "待處理",
            variant: "secondary",
            className: "bg-yellow-100 text-yellow-800 border-yellow-200",
          },
          draft: {
            label: "草稿",
            variant: "outline",
            className: "bg-gray-100 text-gray-700 border-gray-300",
          },

          // Negative states
          rejected: {
            label: "拒絕",
            variant: "destructive",
            className: "bg-red-100 text-red-800 border-red-200",
          },
          inactive: {
            label: "停用",
            variant: "destructive",
            className: "bg-red-100 text-red-800 border-red-200",
          },
          failed: {
            label: "失敗",
            variant: "destructive",
            className: "bg-red-100 text-red-800 border-red-200",
          },

          // Process states
          processing: {
            label: "處理中",
            variant: "secondary",
            className: "bg-blue-100 text-blue-800 border-blue-200",
          },
          submitted: {
            label: "已提交",
            variant: "secondary",
            className: "bg-indigo-100 text-indigo-800 border-indigo-200",
          },
        };

        const status = statusMap[value as string];
        return (
          <Badge
            variant={status ? status.variant : "secondary"}
            className={`whitespace-nowrap pointer-events-none font-medium ${
              status?.className || "bg-gray-100 text-gray-700"
            }`}
          >
            {status ? status.label : value}
          </Badge>
        );

      case "json":
        return <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>;
      default:
        return String(value);
    }
  };

  const exportData = () => {
    const csvContent = [
      currentConfig?.columns.map((col) => col.label).join(","),
      ...filteredData.map((item) =>
        currentConfig?.columns.map((col) => item[col.key] || "").join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedTable}_export.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto p-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">管理員數據管理</h1>
        <p className="text-muted-foreground">管理雲端資料庫中的所有數據表格</p>
      </div>

      <Tabs value={selectedTable} onValueChange={setSelectedTable}>
        <TabsList className="grid w-full grid-cols-4">
          {tableConfigs.map((config) => (
            <TabsTrigger key={config.name} value={config.name}>
              <div className="flex items-center space-x-2">
                {config.icon}
                <span>{config.displayName}</span>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {tableConfigs.map((config) => (
          <TabsContent key={config.name} value={config.name}>
            {config.isSpecialTab && config.name === "questionnaires" ? (
              <QuestionnaireResponseManager />
            ) : (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="mb-2">
                        {config.displayName}
                      </CardTitle>
                      <CardDescription>
                        檢查
                        {(() => {
                          const collectionNameMap: { [key: string]: string } = {
                            users: "用戶",
                            questionnaires: "問卷",
                            questionnaire_responses: "問卷回應",
                            user_stats: "用戶統計",
                            // Add more mappings as needed
                          };

                          return (
                            collectionNameMap[config.collection] ||
                            config.collection
                          );
                        })()}
                        群集中的數據 ( 共{filteredData.length} 項)
                      </CardDescription>
                    </div>
                    <div className="flex space-x-2">
                      {config.name === "users" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAddDialog(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          新增用戶
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        刷新
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={exportData}
                        disabled={filteredData.length === 0}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        導出 CSV
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert className="mb-4">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <Search className="w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="搜索..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64"
                      />
                    </div>
                  </div>

                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {config.columns.map((column) => (
                            <TableHead
                              key={column.key}
                              style={{ width: column.width }}
                            >
                              {column.label}
                            </TableHead>
                          ))}
                          <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loading ? (
                          <TableRow>
                            <TableCell
                              colSpan={config.columns.length + 1}
                              className="text-center"
                            >
                              加載中...
                            </TableCell>
                          </TableRow>
                        ) : filteredData.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={config.columns.length + 1}
                              className="text-center"
                            >
                              雲端問卷功能持續開發中
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredData.map((item) => (
                            <TableRow key={item.id}>
                              {config.columns.map((column) => (
                                <TableCell key={column.key}>
                                  {formatCellValue(
                                    item[column.key],
                                    column.type,
                                    column.key
                                  )}
                                </TableCell>
                              ))}
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDelete(item)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>編輯項目</DialogTitle>
            <DialogDescription>修改選定項目的信息</DialogDescription>
          </DialogHeader>
          {editingItem && currentConfig && (
            <div className="space-y-4">
              {currentConfig.columns
                .filter((col) => col.editable)
                .map((column) => (
                  <div key={column.key}>
                    <Label htmlFor={column.key}>{column.label}</Label>
                    {column.type === "text" ? (
                      <Input
                        id={column.key}
                        value={editingItem[column.key] || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            [column.key]: e.target.value,
                          })
                        }
                      />
                    ) : column.type === "number" ? (
                      <Input
                        id={column.key}
                        type="number"
                        value={editingItem[column.key] || ""}
                        onChange={(e) =>
                          setEditingItem({
                            ...editingItem,
                            [column.key]: Number(e.target.value),
                          })
                        }
                      />
                    ) : column.type === "boolean" ? (
                      <Select
                        value={editingItem[column.key] ? "true" : "false"}
                        onValueChange={(value) =>
                          setEditingItem({
                            ...editingItem,
                            [column.key]: value === "true",
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">是</SelectItem>
                          <SelectItem value="false">否</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : column.type === "badge" && column.key === "role" ? (
                      <Select
                        value={editingItem[column.key] || "user"}
                        onValueChange={(value) =>
                          setEditingItem({
                            ...editingItem,
                            [column.key]: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">用戶</SelectItem>
                          <SelectItem value="admin">管理員</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                ))}
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={loading}
                >
                  取消
                </Button>
                <Button onClick={handleSaveEdit} disabled={loading}>
                  {loading ? "保存中..." : "保存"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>確認刪除</DialogTitle>
            <DialogDescription>
              您確定要刪除此項目嗎？此操作無法撤銷。
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={loading}
            >
              {loading ? "刪除中..." : "刪除"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新增用戶</DialogTitle>
            <DialogDescription>創建新的用戶帳戶</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-email">電子郵件 *</Label>
              <Input
                id="new-email"
                type="email"
                placeholder="user@example.com"
                value={newUserData.email}
                onChange={(e) =>
                  setNewUserData({ ...newUserData, email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="new-displayName">顯示名稱 *</Label>
              <Input
                id="new-displayName"
                placeholder="用戶名稱"
                value={newUserData.displayName}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    displayName: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label htmlFor="new-role">角色</Label>
              <Select
                value={newUserData.role}
                onValueChange={(value: "admin" | "user") =>
                  setNewUserData({ ...newUserData, role: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">用戶</SelectItem>
                  <SelectItem value="admin">管理員</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-emailVerified">郵件驗證</Label>
              <Select
                value={newUserData.emailVerified ? "true" : "false"}
                onValueChange={(value) =>
                  setNewUserData({
                    ...newUserData,
                    emailVerified: value === "true",
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">是</SelectItem>
                  <SelectItem value="false">否</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-totalSubmissions">初始提交次數</Label>
              <Input
                id="new-totalSubmissions"
                type="number"
                min="0"
                value={newUserData.totalSubmissions}
                onChange={(e) =>
                  setNewUserData({
                    ...newUserData,
                    totalSubmissions: Number(e.target.value),
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
                disabled={loading}
              >
                取消
              </Button>
              <Button onClick={handleAddUser} disabled={loading}>
                {loading ? "創建中..." : "新增"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
