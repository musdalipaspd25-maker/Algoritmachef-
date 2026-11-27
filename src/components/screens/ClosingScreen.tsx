import React, { useState } from 'react';
import {
  Award,
  Star,
  Download,
  ExternalLink,
  RotateCcw,
  LogOut,
  CheckCircle2,
} from 'lucide-react';
import { LEVELS_CONFIG } from '../../data/levels';
import { GameProgressState } from '../../types/game';
import { ChefLogoSvg, ChefRobotSvg } from '../ChefRobotSvg';
import { downloadTeacherCsv } from '../../utils/storage';
import { playClick } from '../../utils/sound';

interface ClosingScreenProps {
  progress: GameProgressState;
  onPlayAgainHome: () => void;
}

export const ClosingScreen: React.FC<ClosingScreenProps> = ({
  progress,
  onPlayAgainHome,
}) => {
  const [hasExited, setHasExited] = useState(false);

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

  if (hasExited) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="chef-card p-8 bg-white text-center space-y-5">
          <ChefRobotSvg mood="success" className="w-32 h-32 mx-auto" />
          <h1 className="font-display text-3xl font-black text-[#14284B]">
            Terima Kasih Telah Bermain!
          </h1>
          <p className="text-base text-[#4A5B78] max-w-lg mx-auto">
            Progres belajarmu sudah tersimpan aman di peramban ini. Sampai jumpa
            di tantangan algoritma berikutnya, Chef!
          </p>
          <button
            type="button"
            onClick={() => {
              playClick();
              setHasExited(false);
              onPlayAgainHome();
            }}
            className="chef-btn-primary min-h-[48px] px-7 py-3 rounded-xl font-display font-extrabold text-lg inline-flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
      {/* Banner Penutup & Motivasi */}
      <section className="chef-card p-6 sm:p-8 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-3">
              <ChefLogoSvg className="w-12 h-12 shrink-0" />
              <div>
                <div className="text-sm font-bold text-[#EA580C]">
                  Halaman Penutup · Rekap Capaian Keseluruhan
                </div>
                <h1 className="font-display text-2xl sm:text-3xl font-black text-[#14284B]">
                  Selamat atas Perjalanan Algoritmamu, Chef!
                </h1>
              </div>
            </div>

            <p className="text-base text-[#14284B] leading-relaxed">
              Belajar algoritma bukan sekadar menghafal kode—kamu baru saja
              mempraktikkan <strong>dekomposisi masalah</strong>, menyusun{' '}
              <strong>sekuens</strong>, mengambil keputusan dengan{' '}
              <strong>If-Else</strong>, menghemat langkah lewat{' '}
              <strong>Perulangan (Loop)</strong>, dan melatih ketelitian saat{' '}
              <strong>debugging</strong>. Terus asah logikamu untuk menjadi
              kreator teknologi masa depan!
            </p>

            {/* 3 Angka Capaian */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <div className="text-xs font-bold text-[#4A5B78]">Level Tuntas</div>
                <div className="font-mono-num text-2xl font-black text-[#14284B]">
                  {completedCount} / {LEVELS_CONFIG.length}
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <div className="text-xs font-bold text-[#4A5B78]">Total Bintang</div>
                <div className="font-mono-num text-2xl font-black text-[#EA580C]">
                  {totalStars} / {LEVELS_CONFIG.length * 3} ★
                </div>
              </div>
              <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <div className="text-xs font-bold text-[#064E3B]">Total Skor</div>
                <div className="font-mono-num text-2xl font-black text-[#059669]">
                  {totalScore}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center bg-[#FFF8EE] border-2 border-[#E5D9C5] rounded-2xl p-6 text-center">
            <ChefRobotSvg mood="success" className="w-32 h-32" />
            <div className="mt-2 font-display font-extrabold text-lg text-[#14284B] flex items-center gap-1.5">
              <Award className="w-5 h-5 text-[#EA580C]" />
              <span>Master Dapur Algoritma</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabel Rekap Capaian Lengkap */}
      <section className="chef-card p-6 bg-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-extrabold text-[#14284B]">
            Rekap Capaian Per Level
          </h2>
          <button
            type="button"
            onClick={() => {
              playClick();
              downloadTeacherCsv(progress);
            }}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#059669]" />
            <span>Unduh CSV (Rekap Guru)</span>
          </button>
        </div>

        <div className="overflow-x-auto border-2 border-[#E5D9C5] rounded-xl">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-[#FFF8EE] border-b-2 border-[#E5D9C5] text-sm font-bold text-[#14284B]">
                <th className="py-3 px-4">Level</th>
                <th className="py-3 px-4">Materi</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Skor</th>
                <th className="py-3 px-4">Bintang</th>
                <th className="py-3 px-4">Blok Terbaik</th>
                <th className="py-3 px-4">Percobaan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5D9C5] text-base">
              {LEVELS_CONFIG.map((lvl) => {
                const p = progress.levels[lvl.id];
                return (
                  <tr key={lvl.id}>
                    <td className="py-3 px-4 font-bold text-[#14284B]">
                      {lvl.id}. {lvl.title}
                    </td>
                    <td className="py-3 px-4 text-[#4A5B78]">{lvl.conceptTag}</td>
                    <td className="py-3 px-4">
                      {p?.completed ? (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-[#059669]">
                          <CheckCircle2 className="w-4 h-4" />
                          Selesai
                        </span>
                      ) : (
                        <span className="text-sm text-[#64748B]">Belum</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono-num font-bold">
                      {p?.bestScore ?? 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3].map((s) => (
                          <Star
                            key={s}
                            className={`w-4 h-4 ${
                              s <= (p?.stars ?? 0)
                                ? 'fill-[#F59E0B] text-[#D97706]'
                                : 'text-[#CBD5E1]'
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono-num">
                      {p?.bestBlockCount ?? '-'} / {lvl.optimalBlockCount}
                    </td>
                    <td className="py-3 px-4 font-mono-num">
                      {p?.attempts ?? 0}x
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Kredit & Sumber Aset */}
      <section className="chef-card p-6 bg-[#FFF8EE] space-y-2">
        <h2 className="font-display text-lg font-extrabold text-[#14284B]">
          Kredit &amp; Sumber Aset
        </h2>
        <p className="text-base font-bold text-[#14284B]">
          Dikembangkan oleh Musdalipa, UPT SMKN 4 Palopo
        </p>
        <p className="text-sm text-[#4A5B78]">
          Sumber aset: Grafis karakter &amp; logo SVG orisinal internal, ikon UI
          oleh Lucide Icons, tipografi Google Fonts (Nunito &amp; Open Sans), serta
          efek suara disintesis secara lokal menggunakan Web Audio API.
        </p>
      </section>

      {/* Tombol Navigasi Penutup: Angket, Main Lagi, Keluar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <a
          href="https://docs.google.com/forms/d/e/1FAIpQLSf_PLACEHOLDER_ANGKET_ALGORITHM_CHEF/viewform"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => playClick()}
          className="chef-btn-secondary min-h-[48px] px-6 py-3 rounded-xl font-bold text-base inline-flex items-center gap-2 no-underline"
        >
          <ExternalLink className="w-5 h-5 text-[#2563EB]" />
          <span>Isi Angket Siswa (Google Forms)</span>
        </a>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              playClick();
              setHasExited(true);
            }}
            className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-5 h-5 text-[#64748B]" />
            <span>Keluar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onPlayAgainHome();
            }}
            className="chef-btn-primary min-h-[48px] px-7 py-3 rounded-xl font-display font-extrabold text-lg flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Main Lagi</span>
          </button>
        </div>
      </div>
    </main>
  );
};
