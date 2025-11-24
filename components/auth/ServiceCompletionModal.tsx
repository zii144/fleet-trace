"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";

interface ServiceCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function ServiceCompletionModal({
  isOpen,
  onClose,
  onLogout,
}: ServiceCompletionModalProps) {
  const handleClose = () => {
    onClose();
    onLogout();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}} modal>
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
              感謝您對乘跡平台的支持與參與！我們的評鑑調查活動已經成功完成，
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
                href="mailto:support@taxi-life.net"
                className="font-medium underline"
              >
                support@taxi-life.net
              </a>
            </p>
          </div>

          {/* Close button */}
          <div className="pt-4">
            <Button
              onClick={handleClose}
              className="w-full bg-gradient-to-r from-gray-800 to-gray-900 
                  transition-all duration-300 
                  shadow-lg
                  rounded-xl py-3 text-base font-medium"
            >
              我知道了
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
