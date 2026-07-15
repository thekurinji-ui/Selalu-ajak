"use client";

import { useState } from "react";
import { GripVertical, Eye, EyeOff, Copy, Trash2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { SECTION_LIBRARY, type SectionInstance } from "@/lib/invitation-sections";

interface LayersPanelProps {
  sections: SectionInstance[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onReorder: (nextOrder: SectionInstance[]) => void;
  onToggleVisible: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onOpenAddSection: () => void;
}

// BAB 10.3 — Setiap section dapat: Ditambah, Dihapus, Dipindahkan, Diduplikasi,
// Disembunyikan. Reorder memakai native HTML5 drag-and-drop agar tidak
// bergantung pada library eksternal.
export function LayersPanel({
  sections,
  selectedId,
  onSelect,
  onReorder,
  onToggleVisible,
  onDuplicate,
  onDelete,
  onOpenAddSection,
}: LayersPanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  function handleDrop(targetIndex: number) {
    if (dragIndex === null || dragIndex === targetIndex) {
      setDragIndex(null);
      setOverIndex(null);
      return;
    }
    const next = [...sections];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    onReorder(next);
    setDragIndex(null);
    setOverIndex(null);
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-champagne-100 px-4 py-3">
        <p className="font-heading text-sm font-semibold text-forest-700">Sections</p>
        <button
          onClick={onOpenAddSection}
          className="flex items-center gap-1 rounded-md bg-forest-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-soft hover:bg-forest-700"
        >
          <Plus size={14} /> Tambah
        </button>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto p-2">
        {sections.map((section, index) => {
          const meta = SECTION_LIBRARY[section.type];
          const isSelected = section.id === selectedId;
          const isDragOver = overIndex === index && dragIndex !== null && dragIndex !== index;
          return (
            <li
              key={section.id}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragEnter={() => setOverIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onClick={() => onSelect(section.id)}
              className={cn(
                "group flex cursor-pointer items-center gap-2 rounded-md border px-2 py-2 transition",
                isSelected
                  ? "border-forest-300 bg-forest-50"
                  : "border-transparent hover:border-champagne-100 hover:bg-champagne-50/60",
                isDragOver && "border-t-2 border-t-forest-500",
                !section.visible && "opacity-50",
              )}
            >
              <span className="cursor-grab text-slate-300 group-hover:text-slate-400">
                <GripVertical size={16} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-forest-700">{meta.label}</p>
              </div>
              <button
                title={section.visible ? "Sembunyikan" : "Tampilkan"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisible(section.id);
                }}
                className="rounded p-1 text-slate-400 hover:bg-white hover:text-forest-600"
              >
                {section.visible ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                title="Duplikasi"
                onClick={(e) => {
                  e.stopPropagation();
                  onDuplicate(section.id);
                }}
                className="rounded p-1 text-slate-400 hover:bg-white hover:text-forest-600"
              >
                <Copy size={15} />
              </button>
              <button
                title="Hapus"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(section.id);
                }}
                className="rounded p-1 text-slate-400 hover:bg-white hover:text-danger"
              >
                <Trash2 size={15} />
              </button>
            </li>
          );
        })}
        {sections.length === 0 && (
          <li className="mt-6 px-2 text-center text-sm text-slate-400">
            Belum ada section. Klik &ldquo;Tambah&rdquo; untuk memulai.
          </li>
        )}
      </ul>
    </div>
  );
}
