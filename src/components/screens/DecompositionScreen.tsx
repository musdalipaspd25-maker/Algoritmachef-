import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  BookOpen,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  X,
} from 'lucide-react';
import { DecompositionStep, LevelConfig } from '../../types/game';
import { playClick, playDrop, playError, playSuccess } from '../../utils/sound';

interface DecompositionScreenProps {
  level: LevelConfig;
  alreadyPassed: boolean;
  onPassDecomposition: () => void;
  onGoToEditor: () => void;
  onBackToOrders: () => void;
}

function shuffleDeterministic(
  items: DecompositionStep[],
  seed: number
): DecompositionStep[] {
  const arr = [...items];
  if (arr.length <= 1) return arr;
  let s = seed * 9301 + 49297;
  for (let i = arr.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = s % (i + 1);
    const tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  }
  // Pastikan urutan teracak tidak sama persis dengan jawaban benar
  const isSame = arr.every((item, idx) => item.id === items[idx].id);
  if (isSame && arr.length >= 2) {
    const first = arr[0];
    arr[0] = arr[arr.length - 1];
    arr[arr.length - 1] = first;
  }
  return arr;
}

export const DecompositionScreen: React.FC<DecompositionScreenProps> = ({
  level,
  alreadyPassed,
  onPassDecomposition,
  onGoToEditor,
  onBackToOrders,
}) => {
  const shuffledInitial = useMemo(
    () => shuffleDeterministic(level.decompositionSteps, level.id),
    [level]
  );

  const [bankSteps, setBankSteps] = useState<DecompositionStep[]>(
    alreadyPassed ? [] : shuffledInitial
  );
  const [columns, setColumns] = useState<Record<string, DecompositionStep[]>>(
    () => {
      const init: Record<string, DecompositionStep[]> = {};
      for (const col of level.subtaskColumns) {
        init[col] = alreadyPassed
          ? level.decompositionSteps.filter((s) => s.subtaskGroup === col)
          : [];
      }
      return init;
    }
  );

  const [revealedHints, setRevealedHints] = useState<number>(1);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(
    alreadyPassed
      ? {
          type: 'success',
          message: 'Dekomposisi sudah benar! Kamu siap menyusun program robot.',
        }
      : null
  );
  const [isVerified, setIsVerified] = useState<boolean>(alreadyPassed);
  const [showRecipeModal, setShowRecipeModal] = useState(false);

  // State Pointer-Events Drag-and-Drop
  const [draggingItem, setDraggingItem] = useState<{
    step: DecompositionStep;
    from: 'bank' | string;
    pointerX: number;
    pointerY: number;
  } | null>(null);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  useEffect(() => {
    setBankSteps(alreadyPassed ? [] : shuffledInitial);
    const initCols: Record<string, DecompositionStep[]> = {};
    for (const col of level.subtaskColumns) {
      initCols[col] = alreadyPassed
        ? level.decompositionSteps.filter((s) => s.subtaskGroup === col)
        : [];
    }
    setColumns(initCols);
    setRevealedHints(1);
    setIsVerified(alreadyPassed);
    setFeedback(
      alreadyPassed
        ? {
            type: 'success',
            message: 'Dekomposisi sudah benar! Kamu siap lanjut ke Editor.',
          }
        : null
    );
  }, [level, alreadyPassed, shuffledInitial]);

  // Move helper
  const moveStepToColumn = (
    step: DecompositionStep,
    from: 'bank' | string,
    targetCol: string
  ) => {
    playDrop();
    setIsVerified(false);
    setFeedback(null);

    if (from === targetCol) return;

    if (from === 'bank') {
      setBankSteps((prev) => prev.filter((s) => s.id !== step.id));
    } else {
      setColumns((prev) => ({
        ...prev,
        [from]: prev[from].filter((s) => s.id !== step.id),
      }));
    }

    if (targetCol === 'bank') {
      setBankSteps((prev) => [...prev, step]);
    } else {
      setColumns((prev) => ({
        ...prev,
        [targetCol]: [...(prev[targetCol] ?? []), step],
      }));
    }
  };

  const reorderInColumn = (colName: string, index: number, dir: -1 | 1) => {
    const list = columns[colName] ?? [];
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= list.length) return;
    playClick();
    setIsVerified(false);
    setFeedback(null);
    const updated = [...list];
    const tmp = updated[index];
    updated[index] = updated[nextIdx];
    updated[nextIdx] = tmp;
    setColumns((prev) => ({ ...prev, [colName]: updated }));
  };

  // Pointer Events handler untuk touch & mouse drag-drop
  useEffect(() => {
    if (!draggingItem) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDraggingItem((prev) =>
        prev ? { ...prev, pointerX: e.clientX, pointerY: e.clientY } : null
      );
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const zoneEl = elem?.closest('[data-drop-zone]');
      setHoveredZone(zoneEl ? zoneEl.getAttribute('data-drop-zone') : null);
    };

    const handlePointerUp = (e: PointerEvent) => {
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const zoneEl = elem?.closest('[data-drop-zone]');
      const target = zoneEl?.getAttribute('data-drop-zone');
      if (target) {
        moveStepToColumn(draggingItem.step, draggingItem.from, target);
      }
      setDraggingItem(null);
      setHoveredZone(null);
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingItem]);

  const handleCheck = () => {
    if (bankSteps.length > 0) {
      playError();
      setFeedback({
        type: 'error',
        message: `Masih ada ${bankSteps.length} potongan langkah yang belum dimasukkan ke kolom Sub-tugas!`,
      });
      setIsVerified(false);
      return;
    }

    // Validasi setiap kolom sub-tugas dan urutan langkahnya
    for (const colName of level.subtaskColumns) {
      const expected = level.decompositionSteps.filter(
        (s) => s.subtaskGroup === colName
      );
      const actual = columns[colName] ?? [];

      if (actual.length !== expected.length) {
        playError();
        setFeedback({
          type: 'error',
          message: `Jumlah langkah pada "${colName}" belum tepat (${actual.length} dari ${expected.length} langkah). Periksa kembali pengelompokannya!`,
        });
        setIsVerified(false);
        return;
      }

      for (let i = 0; i < expected.length; i++) {
        if (actual[i].id !== expected[i].id) {
          playError();
          setFeedback({
            type: 'error',
            message: `Urutan atau kelompok langkah di "${colName}" belum tepat pada posisi ke-${i + 1}. Gunakan tombol panah atau seret ulang, lalu cek Kotak Petunjuk!`,
          });
          setIsVerified(false);
          return;
        }
      }
    }

    playSuccess();
    setIsVerified(true);
    onPassDecomposition();
    setFeedback({
      type: 'success',
      message:
        'Hebat, Chef! Dekomposisi sub-tugasmu benar dan terurut rapi. Klik "Lanjut ke Editor"!',
    });
  };

  const handleResetBoard = () => {
    playClick();
    setBankSteps(shuffledInitial);
    const resetCols: Record<string, DecompositionStep[]> = {};
    for (const col of level.subtaskColumns) {
      resetCols[col] = [];
    }
    setColumns(resetCols);
    setIsVerified(false);
    setFeedback(null);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Header Instruksi */}
      <div className="chef-card p-5 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-[#EA580C]">
            Tahap 1 · Dekomposisi Masalah
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#14284B]">
            Pecah resep ini menjadi langkah-langkah kecil.
          </h1>
          <p className="text-base text-[#4A5B78] mt-1">
            {level.decompositionPrompt}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              setShowRecipeModal(true);
            }}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-[#EA580C]" />
            <span>Lihat Resep</span>
          </button>
          <button
            type="button"
            onClick={handleResetBoard}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Acak Ulang</span>
          </button>
        </div>
      </div>

      {/* Layout 3 Kolom: Kiri (Resep & Tiket) | Tengah (Papan Sub-tugas) | Kanan (Petunjuk Bertahap) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KIRI: Kartu Resep dan Tiket */}
        <aside className="lg:col-span-3 chef-card p-5 bg-white space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#E5D9C5]">
            <span className="text-3xl" aria-hidden="true">
              {level.recipeEmoji}
            </span>
            <div>
              <div className="text-xs font-bold text-[#4A5B78]">Resep Level {level.id}</div>
              <h2 className="font-display text-lg font-extrabold text-[#14284B]">
                {level.recipeName}
              </h2>
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#14284B]">
            <div className="font-bold text-[#4A5B78]">Ringkasan Tiket:</div>
            <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5] space-y-1">
              <div>Target: <strong>{level.targetPortions} porsi</strong></div>
              <div>Batas waktu: <strong>{level.timeLimitSeconds} detik</strong></div>
              <div>Stok Utama: <strong>{level.initialStock.Utama} porsi</strong></div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-[#4A5B78]">Alur Resep:</div>
            <ul className="space-y-1.5 text-sm text-[#14284B]">
              {level.recipeVisualSteps.map((s, idx) => (
                <li key={idx} className="p-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* TENGAH: Papan Seret-dan-Lepas Sub-tugas */}
        <section className="lg:col-span-6 space-y-5">
          {/* Bank Potongan Langkah */}
          <div
            data-drop-zone="bank"
            className={`chef-card p-5 transition-colors ${
              hoveredZone === 'bank'
                ? 'bg-[#FFEDD5]/60 border-[#EA580C]'
                : 'bg-white'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display text-lg font-extrabold text-[#14284B]">
                Potongan Langkah ({bankSteps.length} tersisa)
              </h2>
              <span className="text-xs font-semibold text-[#4A5B78]">
                Seret atau klik tombol kolom tujuan
              </span>
            </div>

            {bankSteps.length === 0 ? (
              <div className="p-4 rounded-xl border-2 border-dashed border-[#CBD5E1] text-center text-[#4A5B78] text-sm">
                Semua potongan langkah sudah dipindahkan ke kolom Sub-tugas.
              </div>
            ) : (
              <div className="space-y-2.5">
                {bankSteps.map((step) => (
                  <div
                    key={step.id}
                    className="p-3 rounded-xl bg-[#FFF8EE] border-2 border-[#E5D9C5] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div
                      onPointerDown={(e) => {
                        e.preventDefault();
                        setDraggingItem({
                          step,
                          from: 'bank',
                          pointerX: e.clientX,
                          pointerY: e.clientY,
                        });
                      }}
                      className="touch-drag-item flex items-center gap-2.5 cursor-grab active:cursor-grabbing flex-1"
                    >
                      <GripVertical className="w-5 h-5 text-[#94A3B8] shrink-0" />
                      <span className="font-semibold text-base text-[#14284B]">
                        {step.label}
                      </span>
                    </div>

                    {/* Tombol aksesibel cepat untuk HP / non-drag */}
                    <div className="flex flex-wrap gap-1.5 shrink-0">
                      {level.subtaskColumns.map((col, idx) => (
                        <button
                          key={col}
                          type="button"
                          onClick={() => moveStepToColumn(step, 'bank', col)}
                          className="min-h-[38px] px-3 py-1 rounded-lg bg-white border border-[#CBD5E1] hover:border-[#EA580C] hover:text-[#EA580C] text-xs font-bold text-[#14284B] cursor-pointer"
                        >
                          + {level.subtaskColumns.length > 1 ? `Sub ${idx + 1}` : 'Sub-tugas'}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kolom Sub-tugas */}
          <div className="space-y-4">
            {level.subtaskColumns.map((colName) => {
              const items = columns[colName] ?? [];
              const isDropActive = hoveredZone === colName;
              return (
                <div
                  key={colName}
                  data-drop-zone={colName}
                  className={`chef-card p-5 transition-colors ${
                    isDropActive
                      ? 'bg-[#EFF6FF] border-[#2563EB]'
                      : 'bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-display text-lg font-extrabold text-[#14284B]">
                      {colName}
                    </h3>
                    <span className="font-mono-num text-sm font-bold text-[#4A5B78]">
                      {items.length} langkah
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-5 rounded-xl border-2 border-dashed border-[#CBD5E1] text-center text-[#4A5B78] text-sm">
                      Seret potongan langkah ke sini (atau klik tombol + di atas).
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {items.map((step, idx) => (
                        <div
                          key={step.id}
                          className="p-3 rounded-xl bg-[#EFF6FF] border-2 border-[#93C5FD] flex items-center justify-between gap-2"
                        >
                          <div
                            onPointerDown={(e) => {
                              e.preventDefault();
                              setDraggingItem({
                                step,
                                from: colName,
                                pointerX: e.clientX,
                                pointerY: e.clientY,
                              });
                            }}
                            className="touch-drag-item flex items-center gap-2.5 cursor-grab flex-1"
                          >
                            <span className="w-7 h-7 rounded-lg bg-[#2563EB] text-white font-mono-num font-bold text-sm flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="font-semibold text-base text-[#1E3A8A]">
                              {step.label}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => reorderInColumn(colName, idx, -1)}
                              disabled={idx === 0}
                              aria-label="Naikkan langkah"
                              className="min-w-[36px] min-h-[36px] rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowUp className="w-4 h-4 text-[#1E3A8A]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => reorderInColumn(colName, idx, 1)}
                              disabled={idx === items.length - 1}
                              aria-label="Turunkan langkah"
                              className="min-w-[36px] min-h-[36px] rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                            >
                              <ArrowDown className="w-4 h-4 text-[#1E3A8A]" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                moveStepToColumn(step, colName, 'bank')
                              }
                              aria-label="Keluarkan dari sub-tugas"
                              className="min-w-[36px] min-h-[36px] rounded-lg bg-white border border-red-200 text-red-600 flex items-center justify-center cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Umpan Balik Pemeriksaan */}
          {feedback && (
            <div
              role="status"
              className={`p-4 rounded-xl border-2 flex items-start gap-3 ${
                feedback.type === 'success'
                  ? 'bg-[#ECFDF5] border-[#059669] text-[#064E3B]'
                  : 'bg-red-50 border-red-400 text-red-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-6 h-6 text-[#059669] shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
              )}
              <p className="font-semibold text-base">{feedback.message}</p>
            </div>
          )}
        </section>

        {/* KANAN: Kotak Petunjuk Bertahap */}
        <aside className="lg:col-span-3 chef-card p-5 bg-white space-y-4">
          <div className="flex items-center gap-2 font-display text-lg font-extrabold text-[#14284B]">
            <Lightbulb className="w-5 h-5 text-[#D97706]" />
            <span>Petunjuk Bertahap</span>
          </div>

          <div className="space-y-2.5">
            {level.hints.slice(0, revealedHints).map((hint, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FCD34D] text-sm text-[#78350F] font-semibold"
              >
                {hint}
              </div>
            ))}
          </div>

          {revealedHints < level.hints.length && (
            <button
              type="button"
              onClick={() => {
                playClick();
                setRevealedHints((r) => Math.min(level.hints.length, r + 1));
              }}
              className="chef-btn-secondary w-full min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm cursor-pointer"
            >
              Buka Petunjuk Berikutnya ({revealedHints}/{level.hints.length})
            </button>
          )}
        </aside>
      </div>

      {/* Tombol Navigasi Bawah */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            onBackToOrders();
          }}
          className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Papan Pesanan</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCheck}
            className="chef-btn-secondary min-h-[48px] px-6 py-3 rounded-xl font-display font-extrabold text-base border-[#2563EB] text-[#1E3A8A] cursor-pointer"
          >
            Periksa
          </button>

          <button
            type="button"
            disabled={!isVerified}
            onClick={() => {
              playClick();
              onGoToEditor();
            }}
            className="chef-btn-primary min-h-[48px] px-6 py-3 rounded-xl font-display font-extrabold text-base flex items-center gap-2 cursor-pointer"
          >
            <span>Lanjut ke Editor</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Ghost Dragging Preview (Pointer Events) */}
      {draggingItem && (
        <div
          className="fixed z-50 pointer-events-none px-4 py-2.5 rounded-xl bg-[#EA580C] text-white font-bold shadow-lg text-sm"
          style={{
            left: draggingItem.pointerX + 12,
            top: draggingItem.pointerY + 12,
          }}
        >
          {draggingItem.step.label}
        </div>
      )}

      {/* Modal Lihat Resep */}
      {showRecipeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14284B]/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="chef-card w-full max-w-lg bg-white p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5D9C5]">
              <h2 className="font-display text-xl font-extrabold text-[#14284B]">
                {level.recipeEmoji} Resep: {level.recipeName}
              </h2>
              <button
                type="button"
                onClick={() => setShowRecipeModal(false)}
                className="min-w-[44px] min-h-[44px] rounded-xl border border-[#CBD5E1] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {level.recipeVisualSteps.map((st, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5] font-semibold text-[#14284B]">
                  {st}
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowRecipeModal(false)}
                className="chef-btn-primary min-h-[44px] px-5 py-2 rounded-xl font-bold cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
