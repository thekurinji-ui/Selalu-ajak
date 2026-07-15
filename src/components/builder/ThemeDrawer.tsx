"use client";

import { X, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  THEME_PRESETS,
  FONT_PAIR_LIST,
  resolveEventTheme,
  type EventThemeFields,
} from "@/lib/invitation-themes";

interface ThemeDrawerProps {
  open: boolean;
  onClose: () => void;
  theme: EventThemeFields;
  onChange: (patch: Partial<EventThemeFields>) => void;
}

// BAB 10.6-10.7 — Theme System & Customization tanpa kode: ganti warna,
// font, dan background tema langsung dari Invitation Builder. Perubahan di
// sini langsung tercermin di Live Preview (PreviewCanvas dibungkus
// ThemeProvider yang sama) sebelum ikut ter-Auto Save (BAB 10.9).
export function ThemeDrawer({ open, onClose, theme, onChange }: ThemeDrawerProps) {
  if (!open) return null;

  const resolved = resolveEventTheme(theme);
  const hasOverride = Boolean(theme.primaryColor || theme.secondaryColor || theme.backgroundColor);

  function selectPreset(presetId: string) {
    const preset = THEME_PRESETS.find((t) => t.id === presetId)!;
    // Pilih preset baru = mulai bersih dari kustomisasi warna sebelumnya,
    // tapi tetap ikuti pasangan font default preset tersebut.
    onChange({
      theme: presetId,
      primaryColor: null,
      secondaryColor: null,
      backgroundColor: null,
      fontId: preset.fontId,
    });
  }

  function resetOverrides() {
    onChange({ primaryColor: null, secondaryColor: null, backgroundColor: null });
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-forest-900/30" onClick={onClose}>
      <div
        className="flex h-full w-full max-w-sm flex-col bg-white shadow-floating animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-champagne-100 px-5 py-4">
          <div>
            <p className="font-heading text-base font-semibold text-forest-700">Tema Undangan</p>
            <p className="text-xs text-slate-500">Ganti warna, background, dan font tanpa mengubah isi.</p>
          </div>
          <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-champagne-50 hover:text-forest-600">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-7 overflow-y-auto px-5 py-5">
          {/* Preset tema */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-champagne-600">Pilih Tema</p>
            <div className="grid grid-cols-1 gap-2">
              {THEME_PRESETS.map((preset) => {
                const active = preset.id === theme.theme;
                return (
                  <button
                    key={preset.id}
                    onClick={() => selectPreset(preset.id)}
                    className={cn(
                      "flex items-center gap-3 rounded-md border px-3 py-2.5 text-left transition",
                      active
                        ? "border-forest-500 bg-forest-50"
                        : "border-champagne-100 hover:border-forest-300 hover:bg-forest-50",
                    )}
                  >
                    <div className="flex shrink-0 -space-x-1.5">
                      <span
                        className="h-6 w-6 rounded-full border-2 border-white shadow-soft"
                        style={{ backgroundColor: preset.colors.primary }}
                      />
                      <span
                        className="h-6 w-6 rounded-full border-2 border-white shadow-soft"
                        style={{ backgroundColor: preset.colors.secondary }}
                      />
                      <span
                        className="h-6 w-6 rounded-full border-2 border-white shadow-soft"
                        style={{ backgroundColor: preset.colors.background }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-forest-700">{preset.label}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{preset.description}</p>
                    </div>
                    {active && <Check size={16} className="shrink-0 text-forest-600" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kustomisasi warna */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-champagne-600">Kustomisasi Warna</p>
              {hasOverride && (
                <button
                  onClick={resetOverrides}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-forest-700"
                >
                  <RotateCcw size={12} /> Reset
                </button>
              )}
            </div>
            <div className="space-y-3">
              <ColorField
                label="Warna Utama"
                value={resolved.colors.primary}
                onChange={(v) => onChange({ primaryColor: v })}
              />
              <ColorField
                label="Warna Aksen"
                value={resolved.colors.secondary}
                onChange={(v) => onChange({ secondaryColor: v })}
              />
              <ColorField
                label="Warna Background"
                value={resolved.colors.background}
                onChange={(v) => onChange({ backgroundColor: v })}
              />
            </div>
          </div>

          {/* Font */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-champagne-600">Pasangan Font</p>
            <div className="space-y-2">
              {FONT_PAIR_LIST.map((pair) => {
                const active = pair.id === (theme.fontId || resolved.fontPair.id);
                return (
                  <button
                    key={pair.id}
                    onClick={() => onChange({ fontId: pair.id })}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left transition",
                      active
                        ? "border-forest-500 bg-forest-50"
                        : "border-champagne-100 hover:border-forest-300 hover:bg-forest-50",
                    )}
                  >
                    <span style={{ fontFamily: pair.heading }} className="text-base text-forest-700">
                      {pair.label}
                    </span>
                    {active && <Check size={16} className="shrink-0 text-forest-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-champagne-100 px-3 py-2">
      <label className="text-sm text-slate-700">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-7 w-9 cursor-pointer rounded border border-champagne-200 bg-transparent p-0.5"
        />
        <span className="w-16 font-mono text-xs text-slate-500">{value.toUpperCase()}</span>
      </div>
    </div>
  );
    }
