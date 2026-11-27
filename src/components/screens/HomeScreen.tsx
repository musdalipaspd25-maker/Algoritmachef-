import React, { useState } from 'react';
import {
  Play,
  HelpCircle,
  Settings,
  Lock,
  Star,
  Award,
  Volume2,
  VolumeX,
  RotateCcw,
  X,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { LEVELS_CONFIG } from '../../data/levels';
import { GameProgressState } from '../../types/game';
import { ChefLogoSvg, ChefRobotSvg } from '../ChefRobotSvg';
import { playClick } from '../../utils/sound';

interface HomeScreenProps {
  progress: GameProgressState;
  selectedLevelId: number;
  onSelectLevel: (levelId: number) => void;
  onStartLevel: (levelId: number) => void;
  onToggleSound: () => void;
  onResetProgress: () => void;
  onToggleTeacherUnlock: () => void;
  onGoClosing: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  progress,
  selectedLevelId,
  onSelectLevel,
  onStartLevel,
  onToggleSound,
  onResetProgress,
  onToggleTeacherUnlock,
  onGoClosing,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const isLevelUnlocked = (id: number) =>
    progress.teacherUnlockAll || progress.unlockedLevelIds.includes(id);

  const completedCount = LEVELS_CONFIG.filter(
    (l) => progress.levels[l.id]?.completed
  ).length;

  const scrollToLevels = () => {
    playClick();
    const el = document.getElementById('peta-level-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-10">
      {/* Bagian Hero Beranda */}
      <section className="chef-card p-6 sm:p-10 bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center gap-3">
              <ChefLogoSvg className="w-14 h-14 shrink-0" />
              <div>
                <p className="text-sm font-bold text-[#EA580C]">
                  Informatika Fase E · Kelas X SMK
                </p>
                <h1 className="font-display text-3xl sm:text-4xl lg:text-[2.65rem] font-black text-[#14284B] leading-tight">
                  Algorithm Chef: Resto Automation
                </h1>
              </div>
            </div>

            <p className="text-lg font-bold text-[#EA580C]">
              Selamat datang, Chef! Pilih level dan mulai tugasmu.
            </p>

            <p className="text-base text-[#4A5B78] max-w-2xl leading-relaxed">
              Kendalikan robot koki pintar di dapur restoran modern! Pecah resep
              menjadi sub-tugas kecil, susun blok algoritma (sekuens, if-else, dan
              perulangan), lalu uji simulasinya sebelum waktu habis.
            </p>

            {/* Tombol Utama Beranda */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  onStartLevel(selectedLevelId);
                }}
                className="chef-btn-primary min-h-[48px] px-6 py-3 rounded-xl font-display font-extrabold text-lg flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>Mulai Level {selectedLevelId}</span>
              </button>

              <button
                type="button"
                onClick={scrollToLevels}
                className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <span>Pilih Level</span>
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowHowToPlay(true);
                }}
                className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <HelpCircle className="w-5 h-5 text-[#2563EB]" />
                <span>Cara Bermain</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowSettings(true);
                }}
                className="chef-btn-secondary min-h-[48px] px-5 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer whitespace-nowrap"
              >
                <Settings className="w-5 h-5 text-[#4A5B78]" />
                <span>Pengaturan</span>
              </button>
            </div>
          </div>

          {/* Maskot Robot Koki & Ringkasan Progres */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#FFF8EE] border-2 border-[#E5D9C5] rounded-2xl p-6 text-center">
            <ChefRobotSvg mood="idle" className="w-36 h-36 sm:w-44 sm:h-44" />
            <div className="mt-4 space-y-1">
              <div className="font-display font-extrabold text-xl text-[#14284B]">
                Robot Koki Siap Masak!
              </div>
              <div className="text-base text-[#4A5B78]">
                Progres: <span className="font-mono-num font-bold text-[#14284B]">{completedCount}/6</span> Level Selesai
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                playClick();
                onGoClosing();
              }}
              className="mt-4 min-h-[44px] px-4 py-2 rounded-xl border-2 border-[#E5D9C5] bg-white hover:bg-[#FFFBF4] text-[#14284B] font-bold text-sm flex items-center gap-2 cursor-pointer"
            >
              <Award className="w-4 h-4 text-[#EA580C]" />
              <span>Lihat Rekap Akhir &amp; Penutup</span>
            </button>
          </div>
        </div>
      </section>

      {/* Peta Kartu Level Bernomor 1-6 */}
      <section id="peta-level-section" className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-[#14284B]">
              Peta Level Dapur Otomatis
            </h2>
            <p className="text-base text-[#4A5B78] mt-1">
              Level 1–3 terbuka di awal. Selesaikan level sebelumnya untuk membuka level tantangan berikutnya!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {LEVELS_CONFIG.map((lvl) => {
            const unlocked = isLevelUnlocked(lvl.id);
            const lvlProg = progress.levels[lvl.id];
            const isSelected = selectedLevelId === lvl.id;
            const stars = lvlProg?.stars ?? 0;

            return (
              <div
                key={lvl.id}
                className={`rounded-2xl border-2 p-5 transition-transform duration-150 flex flex-col justify-between ${
                  unlocked
                    ? isSelected
                      ? 'bg-white border-[#EA580C] shadow-[0_4px_0_#EA580C]'
                      : 'bg-white border-[#E5D9C5] shadow-[0_4px_0_rgba(20,40,75,0.08)] hover:-translate-y-0.5'
                    : 'bg-[#E2E8F0]/75 border-[#CBD5E1] text-[#64748B] opacity-85'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-display font-black text-xl border-2 shrink-0 ${
                          unlocked
                            ? 'bg-[#FFEDD5] text-[#EA580C] border-[#FDBA74]'
                            : 'bg-[#CBD5E1] text-[#475569] border-[#94A3B8]'
                        }`}
                      >
                        {unlocked ? lvl.id : <Lock className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#4A5B78]">
                          Level {lvl.id} · {lvl.conceptTag}
                        </div>
                        <h3 className="font-display text-xl font-extrabold text-[#14284B] leading-snug">
                          {lvl.title}
                        </h3>
                      </div>
                    </div>
                    <span className="text-3xl shrink-0" aria-hidden="true">
                      {lvl.recipeEmoji}
                    </span>
                  </div>

                  <p className="text-base text-[#4A5B78] mt-3 line-clamp-2">
                    {lvl.description}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#4A5B78]">
                    <span>Target: <strong className="font-mono-num text-[#14284B]">{lvl.targetPortions} porsi</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Waktu: <strong className="font-mono-num text-[#14284B]">{lvl.timeLimitSeconds} dtk</strong></span>
                    <span aria-hidden="true">·</span>
                    <span>Optimal: <strong className="font-mono-num text-[#14284B]">{lvl.optimalBlockCount} blok</strong></span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-[#E5D9C5] flex items-center justify-between gap-3">
                  {/* Bintang Capaian */}
                  <div className="flex items-center gap-1" aria-label={`Perolehan ${stars} dari 3 bintang`}>
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-5 h-5 ${
                          s <= stars
                            ? 'fill-[#F59E0B] text-[#D97706]'
                            : 'text-[#CBD5E1]'
                        }`}
                      />
                    ))}
                    {lvlProg?.completed && (
                      <span className="ml-1.5 text-sm font-mono-num font-bold text-[#059669] flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        {lvlProg.bestScore}
                      </span>
                    )}
                  </div>

                  {unlocked ? (
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        onSelectLevel(lvl.id);
                        onStartLevel(lvl.id);
                      }}
                      className="chef-btn-primary min-h-[44px] px-4 py-2 rounded-xl font-bold text-base cursor-pointer whitespace-nowrap"
                    >
                      {lvlProg?.completed ? 'Main Lagi' : 'Mainkan'}
                    </button>
                  ) : (
                    <span className="min-h-[44px] px-3 py-2 rounded-xl bg-[#CBD5E1]/70 text-[#475569] font-bold text-sm flex items-center gap-1.5 whitespace-nowrap">
                      <Lock className="w-4 h-4" />
                      <span>Terkunci</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal Cara Bermain */}
      {showHowToPlay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14284B]/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="howto-title"
        >
          <div className="chef-card w-full max-w-2xl bg-white p-6 sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5D9C5]">
              <h2 id="howto-title" className="font-display text-2xl font-extrabold text-[#14284B]">
                Cara Bermain Algorithm Chef
              </h2>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowHowToPlay(false);
                }}
                aria-label="Tutup panduan"
                className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#CBD5E1] flex items-center justify-center hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="space-y-4 my-5 text-base text-[#14284B]">
              <li className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <strong>1. Baca Papan Pesanan &amp; Resep:</strong> Cek menu apa yang dipesan pelanggan, jumlah porsi, batas waktu, dan stok bahan di rak.
              </li>
              <li className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <strong>2. Dekomposisi Resep:</strong> Pecah resep kompleks menjadi langkah kecil pada kolom Sub-tugas dengan cara seret-dan-lepas (drag-drop) atau klik.
              </li>
              <li className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <strong>3. Susun Blok Program:</strong> Pilih blok <span className="font-bold text-[#2563EB]">Aksi (Biru)</span>, <span className="font-bold text-[#7C3AED]">Kondisi If-Else (Ungu)</span>, dan <span className="font-bold text-[#059669]">Perulangan Loop (Hijau)</span> tanpa perlu mengetik kode.
              </li>
              <li className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <strong>4. Simulasi &amp; Debug:</strong> Amati robot bekerja di dapur langkah demi langkah. Jika muncul pesan error, kembali ke Editor dan perbaiki algoritmamu!
              </li>
              <li className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <strong>5. Raih Bintang &amp; Jawab Refleksi:</strong> Gunakan jumlah blok seefisien mungkin agar meraih 3 bintang!
              </li>
            </ol>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowHowToPlay(false);
                }}
                className="chef-btn-primary min-h-[44px] px-6 py-2.5 rounded-xl font-bold cursor-pointer"
              >
                Siap Mengerti!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Pengaturan */}
      {showSettings && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#14284B]/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
        >
          <div className="chef-card w-full max-w-lg bg-white p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#E5D9C5]">
              <h2 id="settings-title" className="font-display text-2xl font-extrabold text-[#14284B]">
                Pengaturan Game
              </h2>
              <button
                type="button"
                onClick={() => {
                  playClick();
                  setShowSettings(false);
                  setConfirmReset(false);
                }}
                aria-label="Tutup pengaturan"
                className="min-w-[44px] min-h-[44px] rounded-xl border-2 border-[#CBD5E1] flex items-center justify-center hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <div>
                  <div className="font-bold text-[#14284B]">Efek Suara Dapur</div>
                  <div className="text-sm text-[#4A5B78]">
                    Sintesis suara tombol, memasak, dan hasil simulasi
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onToggleSound}
                  className={`min-h-[44px] px-4 py-2 rounded-xl font-bold flex items-center gap-2 border-2 cursor-pointer whitespace-nowrap ${
                    progress.soundEnabled
                      ? 'bg-[#ECFDF5] border-[#059669] text-[#064E3B]'
                      : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  {progress.soundEnabled ? (
                    <>
                      <Volume2 className="w-5 h-5" />
                      <span>Aktif</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-5 h-5" />
                      <span>Mati</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5]">
                <div>
                  <div className="font-bold text-[#14284B]">Mode Uji Guru</div>
                  <div className="text-sm text-[#4A5B78]">
                    Buka semua level (1–6) langsung untuk demonstrasi kelas
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    onToggleTeacherUnlock();
                  }}
                  className={`min-h-[44px] px-4 py-2 rounded-xl font-bold border-2 cursor-pointer whitespace-nowrap ${
                    progress.teacherUnlockAll
                      ? 'bg-[#F5F3FF] border-[#7C3AED] text-[#4C1D95]'
                      : 'bg-white border-slate-300 text-[#14284B]'
                  }`}
                >
                  {progress.teacherUnlockAll ? 'Aktif' : 'Nonaktif'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-red-50 border border-red-200 space-y-3">
                <div className="font-bold text-red-900">Reset Progres Siswa</div>
                <p className="text-sm text-red-800">
                  Menghapus skor, bintang, dan mengembalikan level terbuka ke awal (Level 1–3).
                </p>
                {!confirmReset ? (
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      setConfirmReset(true);
                    }}
                    className="min-h-[44px] px-4 py-2 rounded-xl bg-white border-2 border-red-300 text-red-700 font-bold text-sm flex items-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset Semua Progres</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        onResetProgress();
                        setConfirmReset(false);
                        setShowSettings(false);
                      }}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm cursor-pointer"
                    >
                      Ya, Hapus Progres
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmReset(false)}
                      className="min-h-[44px] px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-sm cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
