'use client';

type ConfirmModalProps = {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'success' | 'warning' | 'default';

  /**
   * Usado em modais de confirmação, exemplo: excluir registro.
   * Se não for informado, o botão principal apenas fecha o modal.
   */
  onConfirm?: () => void | Promise<void>;

  /**
   * Mantido para compatibilidade com as páginas atuais.
   */
  onCancel?: () => void;

  /**
   * Mantido para compatibilidade com páginas onde usamos onClose.
   */
  onClose?: () => void;
};

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Fechar',
  variant = 'default',
  onConfirm,
  onCancel,
  onClose,
}: ConfirmModalProps) {
  if (!open) return null;

  const handleClose = () => {
    if (onCancel) {
      onCancel();
      return;
    }

    if (onClose) {
      onClose();
    }
  };

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
      return;
    }

    handleClose();
  };

  const variantClass = {
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
    warning: 'bg-yellow-500 hover:bg-yellow-600',
    default: 'bg-[var(--cdb-blue)] hover:brightness-95',
  }[variant];

  const icon = {
    danger: '🗑️',
    success: '✅',
    warning: '⚠️',
    default: 'ℹ️',
  }[variant];

  const shouldShowCancelButton = Boolean(cancelText) && cancelText !== confirmText;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Fechar modal"
        onClick={handleClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          aria-label="Fechar modal"
          onClick={handleClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-xl font-bold text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          ×
        </button>

        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
          {icon}
        </div>

        <h2 className="pr-10 text-2xl font-black text-slate-900">
          {title}
        </h2>

        <p className="mt-3 leading-relaxed text-slate-500">
          {message}
        </p>

        <div
          className={`mt-6 grid grid-cols-1 gap-3 ${
            shouldShowCancelButton ? 'sm:grid-cols-2' : ''
          }`}
        >
          {shouldShowCancelButton && (
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl bg-slate-100 px-5 py-3 font-semibold text-slate-800 transition hover:bg-slate-200"
            >
              {cancelText}
            </button>
          )}

          <button
            type="button"
            onClick={handleConfirm}
            className={`${variantClass} rounded-2xl px-5 py-3 font-semibold text-white transition`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
