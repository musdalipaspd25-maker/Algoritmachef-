import React, { useState } from 'react';
import {
  Star,
  ArrowRight,
  RotateCcw,
  Award,
  CheckCircle2,
  XCircle,
  Download,
  ClipboardList,
} from 'lucide-react';
import { GameProgressState, LevelConfig } from '../../types/game';
import { ScoreCalculation } from '../../engine/interpreter';
import { ChefRobotSvg } from '../ChefRobotSvg';
import { downloadTeacherCsv } from '../../utils/storage';
import { playClick, playError, playSuccess } from '../../utils/sound';

interface ScoreReflectionScreenProps {
  level: LevelConfig;
  scoreData: ScoreCalculation;
  usedBlocks: number;
  previousBestBlocks: number | null;
  hasNextLevel: boolean;
  progress: GameProgressState;
  onAnswerQuizCorrect: () => void;
  onNextLevel: () => void;
  onReplayLevel: () => void;
  onFinishToClosing: () => void;
  onOpenTeacherRecap: () => void;
}

export const ScoreReflectionScreen: React.FC<ScoreReflectionScreenProps> = ({
  level,
  scoreData,
  usedBlocks,
  previousBestBlocks,
  hasNextLevel,
  progress,
  onAnswerQuizCorrect,
  onNextLevel,
  onReplayLevel,
  onFinishToClosing,
  onOpenTeacherRecap,
}) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const isCorrect = selectedOption === level.reflectionQuiz.correctIndex;

  const handleSelectOption = (idx: number) => {
    setSelectedOption(idx);
    if (idx === level.reflectionQuiz.correctIndex) {
      playSuccess();
      onAnswerQuizCorrect();
    } else {
      playError();
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Kartu Skor & Bintang Utama */}
      <section className="chef-card p-6 sm:p-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-4 flex flex-col items-center text-center bg-[#FFF8EE] border-2 border-[#E5D9C5] rounded-2xl p-6">
            <ChefRobotSvg mood="success" className="w-28 h-28" />
            <div className="flex items-center gap-2 mt-3" aria-label={`Meraih ${scoreData.stars} dari 3 bintang`}>
              {[1, 2, 3].map((s) => (
                <Star
                  key={s}
                  className={`w-10 h-10 ${
                    s <= scoreData.stars
                      ? 'fill-[#F59E0B] text-[#D97706]'
                      : 'text-[#CBD5E1]'
                  }`}
                />
              ))}
            </div>
            <div className="font-mono-num text-4xl font-black text-[#14284B] mt-2">
              {scoreData.totalScore}
            </div>
            <div className="text-sm font-bold text-[#4A5B78]">
              Total Skor Level {level.id}
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5">
            <div>
              <div className="text-sm font-bold text-[#059669]">
                Level {level.id} Selesai · {level.conceptTag}
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-black text-[#14284B]">
                Kerja Bagus, Chef! {level.title} Tuntas!
              </h1>
            </div>

            {/* Rincian Skor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="text-xs font-bold text-[#1E3A8A]">Ketepatan Resep</div>
                <div className="font-mono-num text-2xl font-black text-[#1E3A8A]">
                  +{scoreData.accuracyScore}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <div className="text-xs font-bold text-[#9A3412]">
                  Sisa Waktu ({scoreData.remainingSeconds} dtk)
                </div>
                <div className="font-mono-num text-2xl font-black text-[#EA580C]">
                  +{scoreData.timeBonus}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <div className="text-xs font-bold text-[#064E3B]">Bonus Efisiensi Blok</div>
                <div className="font-mono-num text-2xl font-black text-[#059669]">
                  +{scoreData.efficiencyBonus}
                </div>
              </div>
            </div>

            {/* Perbandingan Jumlah Blok dengan Percobaan Sebelumnya */}
            <div className="p-4 rounded-xl bg-[#F8FAFC] border-2 border-[#CBD5E1] flex flex-wrap items-center justify-between gap-3">
              <div className="text-base text-[#14284B]">
                Blok dipakai: <strong className="font-mono-num">{usedBlocks} blok</strong>{' '}
                (target optimal: <strong className="font-mono-num">&le; {level.optimalBlockCount} blok</strong>)
              </div>
              <div className="text-sm font-bold text-[#4A5B78]">
                {previousBestBlocks !== null ? (
                  usedBlocks < previousBestBlocks ? (
                    <span className="text-[#059669]">
                      Meningkat! Lebih ringkas dari rekor sebelumnya ({previousBestBlocks} blok).
                    </span>
                  ) : usedBlocks === previousBestBlocks ? (
                    <span>Sama dengan rekor terbaikmu ({previousBestBlocks} blok).</span>
                  ) : (
                    <span>
                      Rekor terbaikmu sebelumnya {previousBestBlocks} blok — bisa dioptimalkan lagi!
                    </span>
                  )
                ) : (
                  <span>Percobaan pertama tercatat!</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kuis Refleksi & Ringkasan Guru */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Kuis Refleksi Pilihan Ganda */}
        <section className="lg:col-span-7 chef-card p-6 bg-white space-y-4">
          <div>
            <div className="text-sm font-bold text-[#7C3AED]">
              Kuis Refleksi Algoritma (1 Soal)
            </div>
            <h2 className="font-display text-xl font-extrabold text-[#14284B] mt-1">
              {level.reflectionQuiz.question}
            </h2>
          </div>

          <div className="space-y-2.5">
            {level.reflectionQuiz.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isRight = idx === level.reflectionQuiz.correctIndex;
              let btnStyle =
                'bg-[#FFF8EE] border-[#E5D9C5] text-[#14284B] hover:border-[#EA580C]';

              if (selectedOption !== null) {
                if (isRight) {
                  btnStyle = 'bg-[#ECFDF5] border-[#059669] text-[#064E3B]';
                } else if (isSelected && !isRight) {
                  btnStyle = 'bg-red-50 border-red-400 text-red-900';
                }
              }

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full min-h-[48px] p-4 rounded-xl border-2 text-left font-semibold text-base flex items-start gap-3 transition-colors cursor-pointer ${btnStyle}`}
                >
                  <span className="font-mono-num font-bold shrink-0">
                    {String.fromCharCode(65 + idx)}.
                  </span>
                  <span className="flex-1">{opt}</span>
                  {selectedOption !== null && isRight && (
                    <CheckCircle2 className="w-5 h-5 text-[#059669] shrink-0 mt-0.5" />
                  )}
                  {selectedOption !== null && isSelected && !isRight && (
                    <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div
              role="status"
              className={`p-4 rounded-xl border-2 text-sm font-semibold ${
                isCorrect
                  ? 'bg-[#ECFDF5] border-[#059669] text-[#064E3B]'
                  : 'bg-[#FFFBEB] border-[#F59E0B] text-[#78350F]'
              }`}
            >
              {isCorrect
                ? level.reflectionQuiz.explanation
                : 'Belum tepat. Coba perhatikan kembali alasan logisnya dan pilih jawaban yang paling tepat!'}
            </div>
          )}
        </section>

        {/* Ringkasan Capaian untuk Guru */}
        <section className="lg:col-span-5 chef-card p-6 bg-white space-y-4">
          <h2 className="font-display text-xl font-extrabold text-[#14284B]">
            Ringkasan Capaian untuk Guru
          </h2>
          <div className="space-y-2 text-base text-[#14284B]">
            <div className="flex justify-between py-2 border-b border-[#E5D9C5]">
              <span className="text-[#4A5B78]">Level Dikerjakan</span>
              <strong className="font-mono-num">Level {level.id}</strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5D9C5]">
              <span className="text-[#4A5B78]">Skor Terbaik</span>
              <strong className="font-mono-num">
                {progress.levels[level.id]?.bestScore ?? scoreData.totalScore}
              </strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5D9C5]">
              <span className="text-[#4A5B78]">Jumlah Blok Terbaik</span>
              <strong className="font-mono-num">
                {progress.levels[level.id]?.bestBlockCount ?? usedBlocks} blok
              </strong>
            </div>
            <div className="flex justify-between py-2 border-b border-[#E5D9C5]">
              <span className="text-[#4A5B78]">Total Percobaan</span>
              <strong className="font-mono-num">
                {progress.levels[level.id]?.attempts ?? 1}x
              </strong>
            </div>
          </div>

          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => {
                playClick();
                onOpenTeacherRecap();
              }}
              className="chef-btn-secondary flex-1 min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-[#EA580C]" />
              <span>Tabel Lengkap</span>
            </button>
            <button
              type="button"
              onClick={() => {
                playClick();
                downloadTeacherCsv(progress);
              }}
              className="chef-btn-secondary flex-1 min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#059669]" />
              <span>Unduh CSV</span>
            </button>
          </div>
        </section>
      </div>

      {/* Tombol Navigasi Bawah */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            onReplayLevel();
          }}
          className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Ulangi Level</span>
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playClick();
              onFinishToClosing();
            }}
            className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
          >
            <Award className="w-5 h-5 text-[#EA580C]" />
            <span>Selesai</span>
          </button>

          {hasNextLevel && (
            <button
              type="button"
              onClick={() => {
                playClick();
                onNextLevel();
              }}
              className="chef-btn-primary min-h-[48px] px-7 py-3 rounded-xl font-display font-extrabold text-lg flex items-center gap-2 cursor-pointer"
            >
              <span>Level Berikutnya</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </main>
  );
};
