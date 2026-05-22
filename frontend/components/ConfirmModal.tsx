'use client';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning' | 'default';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  variant = 'default',
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const variantClass = {
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    default: 'bg-slate-950 hover:bg-slate-800',
  }[variant];

  const icon = {
    danger: '🗑️',
    success: '✅',
    warning: '⚠️',
    default: 'ℹ️',
  }[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <button
        aria-label="Fechar modal"
        onClick={onCancel}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-4">
          {icon}
        </div>

        <h2 className="text-2xl font-black text-slate-900">
          {title}
        </h2>

        <p className="text-slate-500 mt-3 leading-relaxed">
          {message}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">
          <button
            onClick={onCancel}
            className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-5 py-3 rounded-2xl font-semibold transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`${variantClass} text-white px-5 py-3 rounded-2xl font-semibold transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}