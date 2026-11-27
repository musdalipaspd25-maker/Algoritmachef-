import React from 'react';
import { Download, Star, X, Unlock } from 'lucide-react';
import { LEVELS_CONFIG } from '../data/levels';
import { GameProgressState } from '../types/game';
import { downloadTeacherCsv } from '../utils/storage';
import { playClick } from '../utils/sound';

interface TeacherRecapModalProps {
  isOpen: boolean;
  progress: GameProgressState;
  onClose: () => void;
  onToggleTeacherUnlock: () => void;
}

export const TeacherRecapModal: React.FC<TeacherRecapModalProps> = ({
  isOpen,
  progress,
  onClose,
  onToggleTeacherUnlock,
}) => {
  if (!isOpen) return null;

  const completedCount = LEVELS_CONFIG.filter(
    (l) => progress.levels[l.id]?.completed
  ).length;
  const totalStars = LEVELS_CONFIG.reduce(
    (sum, l) => sum + (progress.levels[l.id]?.stars ?? 0),
    0
  );
  const totalScore = LEVELS_CONFIG.reduce(
    (sum, l) => sum + (progress.levels[l.id]?.bestScore ?? 0),
    0
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14284B]/60 p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="teacher-recap-title"
    >
      <div className="chef-card w-full max-w-4xl bg-white p-5 sm:p-7 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-4 pb-4 border-b-2 border-[#E5D9C5]">
          <div>
            <h2
              id="teacher-recap-title"
              className="font-display text-2xl font-extrabold text-[#14284B]"
            >
              Panel Rekap Progres Guru
            </h2>
            <p className="text-[#4A5B78] text-base mt-1">
              Pantau capaian siswa per level: skor, bintang, efisiensi jumlah blok, dan jumlah percobaan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              playClick();
              onClose();
            }}
            aria-label="Tutup panel rekap"
            className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#CBD5E1] flex items-center justify-center hover:bg-slate-100 cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 text-[#14284B]" />
          </button>
        </div>

        {/* Ringkasan Angka */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
          <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
            <div className="text-sm text-[#4A5B78] font-semibold">Level Selesai</div>
            <div className="font-mono-num text-2xl font-bold text-[#14284B] mt-1">
              {completedCount} / {LEVELS_CONFIG.length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
            <div className="text-sm text-[#4A5B78] font-semibold">Total Bintang</div>
            <div className="font-mono-num text-2xl font-bold text-[#EA580C] mt-1">
              {totalStars} / {LEVELS_CONFIG.length * 3} ★
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
            <div className="text-sm text-[#4A5B78] font-semibold">Akumulasi Skor</div>
            <div className="font-mono-num text-2xl font-bold text-[#059669] mt-1">
              {totalScore}
            </div>
          </div>
        </div>

        {/* Tabel Progres per Level */}
        <div className="overflow-x-auto border-2 border-[#E5D9C5] rounded-xl">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-[#FFF8EE] border-b-2 border-[#E5D9C5] text-sm font-bold text-[#14284B]">
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Konsep</th>
                <th className="py-3 px-4">Skor</th>
                <th className="py-3 px-4">Bintang</th>
                <th className="py-3 px-4">Blok (Optimal)</th>
                <th className="py-3 px-4">Percobaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D9C5] text-base">
              {LEVELS_CONFIG.map((lvl) => {
                const p = progress.levels[lvl.id];
                return (
                  <tr key={lvl.id} className="hover:bg-[#FFFBF4]">
                    <td className="py-3 px-4 font-bold text-[#14284B]">
                      {lvl.id}. {lvl.title}
                    </td>
                    <td className="py-3 px-4 text-[#4A5B78]">{lvl.conceptTag}</td>
                    <td className="py-3 px-4 font-mono-num font-bold text-[#14284B]">
                      {p?.bestScore ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1" aria-label={`${p?.stars ?? 0} dari 3 bintang`}>
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-5 h-5 ${
                              s <= (p?.stars ?? 0)
                                ? 'fill-[#F59E0B] text-[#D97706]'
                                : 'text-[#CBD5E1]'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-num">
                      {p?.bestBlockCount !== null && p?.bestBlockCount !== undefined ? (
                        <span
                          className={
                            p.bestBlockCount <= lvl.optimalBlockCount
                              ? 'text-[#059669] font-bold'
                              : 'text-[#14284B] font-semibold'
                          }
                        >
                          {p.bestBlockCount} blok
                        </span>
                      ) : (
                        <span className="text-[#94A3B8]">-</span>
                      )}{' '}
                      <span className="text-sm text-[#4A5B78]">
                        (target {lvl.optimalBlockCount})
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-num text-[#14284B]">
                      {p?.attempts ?? 0}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Tombol Aksi */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
          <button
            type="button"
            onClick={() => {
              playClick();
              onToggleTeacherUnlock();
            }}
            className="min-h-[44px] px-4 py-2 rounded-xl border-2 border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#14284B] font-semibold text-sm flex items-center gap-2 cursor-pointer"
          >
            <Unlock className="w-4 h-4 text-[#7C3AED]" />
            <span>
              {progress.teacherUnlockAll
                ? 'Mode Uji Guru: Semua Level Terbuka (Klik untuk Normal)'
                : 'Mode Uji Guru: Buka Semua Level (1–6)'}
            </span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                playClick();
                downloadTeacherCsv(progress);
              }}
              className="chef-btn-primary min-h-[44px] px-5 py-2.5 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-5 h-5" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
