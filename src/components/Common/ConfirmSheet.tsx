import React from 'react';

interface ConfirmSheetProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  destructive?: boolean;
  /** Optional third action (e.g. "Save what I did"). */
  secondaryLabel?: string;
  onSecondary?: () => void;
  cancelLabel?: string;
}

/**
 * In-app replacement for window.confirm(): a bottom sheet that matches the
 * theme, can't block the WebView, and offers more than two choices.
 */
export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  open, title, message, confirmLabel, onConfirm, onCancel, destructive, secondaryLabel, onSecondary, cancelLabel = 'Cancel',
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-black/60 p-3" role="dialog" aria-modal="true" aria-label={title}>
      <div className="w-full max-w-sm rounded-3xl bg-hy-elevated border border-hy-border p-5 space-y-4 animate-fadeIn">
        <div>
          <h3 className="text-lg font-heading font-black text-hy-text">{title}</h3>
          {message && <p className="text-sm text-hy-text-2 mt-1">{message}</p>}
        </div>
        <div className="flex flex-col gap-2">
          {secondaryLabel && onSecondary && (
            <button type="button" onClick={onSecondary} className="min-h-[44px] rounded-2xl bg-hy-primary text-hy-on-primary font-bold text-sm">
              {secondaryLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            className={`min-h-[44px] rounded-2xl font-bold text-sm ${
              destructive ? 'bg-hy-danger text-hy-on-primary' : secondaryLabel ? 'bg-hy-surface border border-hy-border text-hy-text' : 'bg-hy-primary text-hy-on-primary'
            }`}
          >
            {confirmLabel}
          </button>
          <button type="button" onClick={onCancel} className="min-h-[44px] rounded-2xl text-hy-text-2 font-semibold text-sm">
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
