import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Crown,
} from 'lucide-react';
import {
  LevelConfig,
  ProgramBlock,
  RobotStation,
  SimulationSnapshot,
} from '../../types/game';
import {
  buildSimulationTrace,
  formatBlockLabel,
} from '../../engine/interpreter';
import { ChefRobotSvg } from '../ChefRobotSvg';
import { playClick, playCook, playError, playSuccess } from '../../utils/sound';

interface SimulationScreenProps {
  level: LevelConfig;
  program: ProgramBlock[];
  onBackToEditor: () => void;
  onCompleteSuccess: (finalSnapshot: SimulationSnapshot) => void;
}

const STATIONS: { id: RobotStation; title: string; icon: string }[] = [
  { id: 'rak_bahan', title: 'Rak Bahan', icon: '🧺' },
  { id: 'talenan', title: 'Talenan', icon: '🔪' },
  { id: 'kompor', title: 'Kompor', icon: '🍳' },
  { id: 'meja_tata', title: 'Meja Tata', icon: '🍽️' },
  { id: 'loket_saji', title: 'Loket Saji', icon: '🛎️' },
];

export const SimulationScreen: React.FC<SimulationScreenProps> = ({
  level,
  program,
  onBackToEditor,
  onCompleteSuccess,
}) => {
  const trace = useMemo(
    () => buildSimulationTrace(level, program),
    [level, program]
  );

  const [stepCursor, setStepCursor] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<1 | 2>(1);

  const current = trace[Math.min(stepCursor, trace.length - 1)];

  // Reset saat trace berubah
  useEffect(() => {
    setStepCursor(0);
    setIsPlaying(true);
  }, [trace]);

  // Timer otomatis untuk simulasi berjalan
  useEffect(() => {
    if (!isPlaying) return;
    if (stepCursor >= trace.length - 1) {
      setIsPlaying(false);
      return;
    }

    const delayMs = speedMultiplier === 2 ? 420 : 800;
    const timer = window.setTimeout(() => {
      setStepCursor((prev) => {
        const next = Math.min(trace.length - 1, prev + 1);
        const snap = trace[next];
        if (snap.isFinished) {
          if (snap.isSuccess) {
            playSuccess();
          } else {
            playError();
          }
        } else if (snap.station === 'kompor' || snap.station === 'loket_saji') {
          playCook();
        }
        return next;
      });
    }, delayMs);

    return () => window.clearTimeout(timer);
  }, [isPlaying, stepCursor, trace, speedMultiplier]);

  const handleStepForward = () => {
    playClick();
    setIsPlaying(false);
    setStepCursor((prev) => {
      const next = Math.min(trace.length - 1, prev + 1);
      const snap = trace[next];
      if (snap.isFinished) {
        if (snap.isSuccess) playSuccess();
        else playError();
      } else {
        playCook();
      }
      return next;
    });
  };

  const handleRestartSim = () => {
    playClick();
    setStepCursor(0);
    setIsPlaying(true);
  };

  const timePercent = Math.min(
    100,
    Math.round((current.elapsedSeconds / level.timeLimitSeconds) * 100)
  );

  const renderProgramHighlighter = (blocks: ProgramBlock[], depth = 0) => (
    <div className={`space-y-1.5 ${depth > 0 ? 'pl-4 border-l-2 border-[#CBD5E1] mt-1.5' : ''}`}>
      {blocks.map((b) => {
        const isActive = current.activeBlockId === b.id;
        const baseColor =
          b.category === 'action'
            ? 'bg-[#EFF6FF] border-[#93C5FD] text-[#1E3A8A]'
            : b.category === 'condition'
              ? 'bg-[#F5F3FF] border-[#C4B5FD] text-[#4C1D95]'
              : 'bg-[#ECFDF5] border-[#6EE7B7] text-[#064E3B]';

        return (
          <div key={b.id}>
            <div
              className={`px-3 py-2 rounded-lg border-2 text-sm font-bold transition-transform ${baseColor} ${
                isActive
                  ? 'ring-3 ring-[#EA580C] border-[#EA580C] scale-[1.02] shadow-sm'
                  : 'opacity-85'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span>{formatBlockLabel(b)}</span>
                {isActive && (
                  <span className="text-xs font-extrabold text-[#EA580C] whitespace-nowrap">
                    Sedang jalan
                  </span>
                )}
              </div>
            </div>

            {b.category === 'condition' && (
              <div className="mt-1 space-y-1">
                {b.thenBlocks.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#5B21B6] pl-2">
                      Maka:
                    </div>
                    {renderProgramHighlighter(b.thenBlocks, depth + 1)}
                  </div>
                )}
                {b.elseBlocks.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-[#5B21B6] pl-2">
                      Jika Tidak:
                    </div>
                    {renderProgramHighlighter(b.elseBlocks, depth + 1)}
                  </div>
                )}
              </div>
            )}

            {b.category === 'loop' && b.children.length > 0 && (
              <div>{renderProgramHighlighter(b.children, depth + 1)}</div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header Kontrol Simulasi */}
      <div className="chef-card p-5 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-[#EA580C]">
            Tahap 3 · Simulasi Dapur &amp; Debug (Level {level.id})
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#14284B]">
            {level.title}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              playClick();
              setIsPlaying((p) => !p);
            }}
            disabled={stepCursor >= trace.length - 1}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Jeda</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Lanjut</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleStepForward}
            disabled={stepCursor >= trace.length - 1}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <SkipForward className="w-4 h-4" />
            <span>Langkah demi Langkah</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              setSpeedMultiplier((s) => (s === 1 ? 2 : 1));
            }}
            className="chef-btn-secondary min-h-[44px] px-3 py-2 rounded-xl font-mono-num font-bold text-sm cursor-pointer"
          >
            {speedMultiplier}x
          </button>

          <button
            type="button"
            onClick={handleRestartSim}
            className="chef-btn-secondary min-h-[44px] px-3.5 py-2 rounded-xl font-bold text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ulang</span>
          </button>
        </div>
      </div>

      {/* Grid: Dapur Animasi (Kiri 7 col) | Program Highlighter (Kanan 5 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 space-y-5">
          {/* Bar Timer & Progres Porsi */}
          <div className="chef-card p-5 bg-white space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-bold">
              <span className="text-[#14284B]">
                Waktu Berjalan:{' '}
                <span className="font-mono-num text-[#EA580C]">
                  {current.elapsedSeconds}s
                </span>{' '}
                / {level.timeLimitSeconds}s
              </span>
              <span className="text-[#14284B]">
                Pesanan Selesai:{' '}
                <span className="font-mono-num text-[#059669]">
                  {current.completedOrders} / {level.orders.length}
                </span>
              </span>
            </div>

            <div className="w-full h-4 rounded-full bg-[#E2E8F0] overflow-hidden border border-[#CBD5E1]">
              <div
                className={`h-full transition-all duration-300 ${
                  timePercent > 85 ? 'bg-[#DC2626]' : 'bg-[#EA580C]'
                }`}
                style={{ width: `${timePercent}%` }}
              />
            </div>

            <div className="p-3 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5] font-semibold text-base text-[#14284B]">
              Status Robot: {current.statusMessage}
            </div>
          </div>

          {/* Panggung Dapur Otomatis */}
          <div className="chef-card p-5 bg-[#FFF8EE] space-y-5">
            {/* 5 Stasiun Dapur + Robot yang berpindah ke stasiun aktif */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {STATIONS.map((st) => {
                const isHere = current.station === st.id;
                return (
                  <div
                    key={st.id}
                    className={`rounded-2xl border-2 p-2.5 sm:p-3 text-center flex flex-col items-center justify-between min-h-[140px] transition-colors ${
                      isHere
                        ? 'bg-white border-[#EA580C] shadow-[0_3px_0_#EA580C]'
                        : 'bg-white/70 border-[#E5D9C5]'
                    }`}
                  >
                    <div className="text-xs font-extrabold text-[#14284B]">
                      {st.title}
                    </div>

                    <div className="relative my-1 flex items-center justify-center">
                      {isHere ? (
                        <div className="relative">
                          {st.id === 'kompor' && (
                            <span
                              className="absolute -top-3 left-1/2 -translate-x-1/2 text-lg animate-steam"
                              aria-hidden="true"
                            >
                              💨
                            </span>
                          )}
                          <ChefRobotSvg
                            mood={current.mood}
                            holdingLabel={current.holdingIngredient}
                            className="w-16 h-16 sm:w-20 sm:h-20"
                          />
                        </div>
                      ) : (
                        <span className="text-3xl sm:text-4xl" aria-hidden="true">
                          {st.icon}
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-bold text-[#4A5B78]">
                      {isHere ? 'Aktif' : 'Siap'}
                    </div>
                  </div>
                );
              })}
            </div>

            {current.station === 'idle' && (
              <div className="flex flex-col items-center py-2">
                <ChefRobotSvg mood={current.mood} className="w-24 h-24" />
              </div>
            )}

            {/* Stok Bahan & Antrean Tiket */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Stok Bahan */}
              <div className="p-4 rounded-xl bg-white border-2 border-[#E5D9C5] space-y-2">
                <div className="text-sm font-extrabold text-[#14284B]">
                  Stok Bahan Rak Dapur
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div
                    className={`p-2 rounded-lg border ${
                      current.stock.Utama === 0
                        ? 'bg-red-50 border-red-300 text-red-900 font-bold'
                        : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E3A8A]'
                    }`}
                  >
                    Utama: <span className="font-mono-num font-bold">{current.stock.Utama}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#064E3B]">
                    Sayur: <span className="font-mono-num font-bold">{current.stock.Sayur}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-red-50 border border-red-200 text-red-900">
                    Cabai: <span className="font-mono-num font-bold">{current.stock.Cabai}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#F5F3FF] border border-[#DDD6FE] text-[#4C1D95]">
                    VIP: <span className="font-mono-num font-bold">{current.stock['Garnish VIP']}</span>
                  </div>
                </div>
              </div>

              {/* Antrean Tiket */}
              <div className="p-4 rounded-xl bg-white border-2 border-[#E5D9C5] space-y-2">
                <div className="text-sm font-extrabold text-[#14284B]">
                  Antrean Tiket Pesanan
                </div>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {level.orders.map((ord, idx) => {
                    const done = idx < current.completedOrders;
                    const active =
                      idx === current.currentOrderIndex && !current.isFinished;
                    return (
                      <div
                        key={ord.id}
                        className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center justify-between gap-2 ${
                          done
                            ? 'bg-[#ECFDF5] border-[#6EE7B7] text-[#064E3B] line-through'
                            : active
                              ? 'bg-[#FFEDD5] border-[#EA580C] text-[#9A3412]'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="truncate">
                          #{idx + 1} {ord.emoji} {ord.dishName}
                        </span>
                        <span className="flex items-center gap-1 shrink-0">
                          {ord.isSpicy && <Flame className="w-3.5 h-3.5 text-red-600" />}
                          {ord.isVip && <Crown className="w-3.5 h-3.5 text-purple-600" />}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Banner Hasil / Error Ramah */}
          {current.isFinished && current.errorMessage && (
            <div
              role="alert"
              className="p-5 rounded-2xl bg-red-50 border-2 border-red-400 text-red-950 flex items-start gap-3"
            >
              <AlertTriangle className="w-7 h-7 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-display font-extrabold text-lg">
                  Ups, Ada Bug di Dapur!
                </div>
                <p className="text-base font-semibold">{current.errorMessage}</p>
              </div>
            </div>
          )}

          {current.isFinished && current.isSuccess && (
            <div
              role="status"
              className="p-5 rounded-2xl bg-[#ECFDF5] border-2 border-[#059669] text-[#064E3B] flex items-start gap-3"
            >
              <CheckCircle2 className="w-7 h-7 text-[#059669] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-display font-extrabold text-lg">
                  Simulasi Berhasil!
                </div>
                <p className="text-base font-semibold">{current.statusMessage}</p>
              </div>
            </div>
          )}
        </section>

        {/* KANAN: Penanda Blok yang Sedang Dieksekusi */}
        <aside className="lg:col-span-5 chef-card p-5 bg-white space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E5D9C5]">
            <h2 className="font-display text-lg font-extrabold text-[#14284B]">
              Pelacak Eksekusi Blok
            </h2>
            <span className="font-mono-num text-xs font-bold text-[#4A5B78]">
              Langkah {stepCursor}/{trace.length - 1}
            </span>
          </div>

          {program.length === 0 ? (
            <p className="text-sm text-[#4A5B78]">Program masih kosong.</p>
          ) : (
            <div className="max-h-[460px] overflow-y-auto pr-1">
              {renderProgramHighlighter(program)}
            </div>
          )}
        </aside>
      </div>

      {/* Navigasi Bawah */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            onBackToEditor();
          }}
          className="chef-btn-secondary min-h-[48px] px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
        >
          <Wrench className="w-5 h-5 text-[#EA580C]" />
          <span>Perbaiki Program</span>
        </button>

        <button
          type="button"
          disabled={!current.isFinished || !current.isSuccess}
          onClick={() => {
            playClick();
            onCompleteSuccess(current);
          }}
          className="chef-btn-primary min-h-[48px] px-7 py-3 rounded-xl font-display font-extrabold text-lg flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Selesai &amp; Lihat Skor</span>
        </button>
      </div>
    </main>
  );
};
