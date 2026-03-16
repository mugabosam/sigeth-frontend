import { AlertCircle, X } from "lucide-react";

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden animation-in">
        {/* Header */}
        <div
          className={`px-6 py-4 flex items-center justify-between ${
            isDangerous
              ? "bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100"
              : "bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-100"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDangerous ? "bg-red-100" : "bg-amber-100"
              }`}
            >
              <AlertCircle
                size={20}
                className={isDangerous ? "text-red-600" : "text-amber-600"}
              />
            </div>
            <h2
              className={`text-lg font-bold ${isDangerous ? "text-red-900" : "text-amber-900"}`}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
            aria-label="Close confirmation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 text-sm leading-relaxed">{message}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors font-medium text-sm"
            title="Cancel operation"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors ${
              isDangerous
                ? "bg-red-600 hover:bg-red-700"
                : "bg-amber-600 hover:bg-amber-700"
            }`}
            title={`Confirm ${title}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
