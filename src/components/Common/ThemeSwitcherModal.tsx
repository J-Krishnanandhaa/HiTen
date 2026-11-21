import React, { useState, useEffect } from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { THEME_OPTIONS, ThemeId, getActiveTheme, setActiveTheme } from '../../utils/theme';

interface ThemeSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeSwitcherModal: React.FC<ThemeSwitcherModalProps> = ({ isOpen, onClose }) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeId>(() => getActiveTheme());

  useEffect(() => {
    if (isOpen) {
      setCurrentTheme(getActiveTheme());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelect = (id: ThemeId) => {
    setCurrentTheme(id);
    setActiveTheme(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-hy-surface border border-hy-elevated rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-hy-elevated flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-hy-primary/10 border border-hy-primary/30 flex items-center justify-center text-hy-primary">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-black text-hy-text tracking-tight">App Color Aesthetic</h3>
              <p className="text-xs text-hy-text-2">Tap any theme to see your app transform live</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-hy-bg hover:bg-hy-elevated border border-hy-border flex items-center justify-center text-hy-text-2 hover:text-white transition-all"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Theme List */}
        <div className="p-4 sm:p-5 space-y-3 overflow-y-auto flex-1">
          {THEME_OPTIONS.map((t) => {
            const isSelected = currentTheme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelect(t.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden group flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-hy-primary bg-hy-elevated ring-2 ring-hy-primary/40 shadow-xl'
                    : 'border-hy-border/60 bg-hy-bg/60 hover:bg-hy-surface-hover hover:border-hy-border'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  {/* Color Swatch Preview Pill */}
                  <div
                    className="w-12 h-12 rounded-2xl border border-white/10 shadow-inner flex flex-col p-1.5 justify-between shrink-0"
                    style={{ backgroundColor: t.previewBg }}
                  >
                    <div className="flex items-center gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-full shadow-sm"
                        style={{ backgroundColor: t.previewPrimary }}
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-sm"
                        style={{ backgroundColor: t.previewAccent }}
                      />
                    </div>
                    <div className="flex gap-1">
                      <span className="w-2 h-1 rounded-full bg-white/20" />
                      <span className="w-4 h-1 rounded-full bg-white/40" />
                    </div>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-hy-text tracking-wide">{t.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-hy-text-2">
                        {t.badge}
                      </span>
                    </div>
                    <p className="text-xs text-hy-text-2 mt-0.5">{t.tagline}</p>
                  </div>
                </div>

                {/* Selection state */}
                <div className="flex items-center justify-between sm:justify-end gap-2 pt-1 sm:pt-0 border-t sm:border-0 border-hy-elevated/40">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.previewPrimary }}
                    />
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-sm"
                      style={{ backgroundColor: t.previewAccent }}
                    />
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? 'bg-hy-primary border-hy-primary text-hy-on-primary'
                      : 'border-hy-border bg-hy-surface text-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-hy-elevated bg-hy-bg/50 flex items-center justify-between">
          <div className="text-xs text-hy-text-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-hy-primary" />
            <span>Instant live preview active</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-hy-primary hover:bg-hy-primary-hover text-hy-on-primary text-xs font-black transition-all shadow-md"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
