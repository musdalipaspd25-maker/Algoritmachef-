import React from 'react';
import { Volume2, VolumeX, Home, ClipboardList } from 'lucide-react';
import { ScreenId } from '../types/game';
import { ChefLogoSvg } from './ChefRobotSvg';
import { playClick } from '../utils/sound';

interface TopNavProps {
  currentScreen: ScreenId;
  activeLevelId: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onGoHome: () => void;
  onOpenTeacherRecap: () => void;
}

const SCREEN_TITLES: Record<ScreenId, string> = {
  home: 'Beranda',
  order_board: 'Papan Pesanan',
  decomposition: 'Dekomposisi Resep',
  editor: 'Editor Robot',
  simulation: 'Simulasi Dapur',
  score: 'Skor & Refleksi',
  closing: 'Penutup',
};

export const TopNav: React.FC<TopNavProps> = ({
  currentScreen,
  activeLevelId,
  soundEnabled,
  onToggleSound,
  onGoHome,
  onOpenTeacherRecap,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b-2 border-[#E5D9C5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zona 1: Brand wordmark & logo */}
        <button
          type="button"
          onClick={() => {
            playClick();
            onGoHome();
          }}
          className="flex items-center gap-2.5 text-left shrink-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EA580C]"
        >
          <ChefLogoSvg className="w-10 h-10 shrink-0" />
          <span className="font-display font-extrabold text-lg sm:text-xl text-[#14284B] whitespace-nowrap">
            Algorithm Chef
          </span>
        </button>

        {/* Zona 2: Indikator alur aktif */}
        <nav
          aria-label="Tahap Permainan"
          className="hidden md:flex items-center gap-4 text-sm font-semibold text-[#4A5B78] whitespace-nowrap"
        >
          {currentScreen !== 'home' && currentScreen !== 'closing' ? (
            <>
              <span className="text-[#14284B] font-bold">
                Level {activeLevelId}
              </span>
              <span aria-hidden="true">/</span>
              <span className="text-[#EA580C] font-bold">
                {SCREEN_TITLES[currentScreen]}
              </span>
            </>
          ) : (
            <span>Resto Automation · Informatika Fase E</span>
          )}
        </nav>

        {/* Zona 3: Aksi utilitas (Suara, Rekap Guru, Beranda) */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              playClick();
              onOpenTeacherRecap();
            }}
            className="min-h-[44px] px-3 py-2 rounded-xl border-2 border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#14284B] font-semibold text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            title="Rekap Progres untuk Guru"
          >
            <ClipboardList className="w-4 h-4 text-[#EA580C]" aria-hidden="true" />
            <span className="hidden sm:inline">Rekap Guru</span>
          </button>

          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Matikan suara' : 'Nyalakan suara'}
            title={soundEnabled ? 'Suara Aktif' : 'Suara Mati'}
            className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl border-2 border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#14284B] flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-5 h-5 text-[#059669]" aria-hidden="true" />
            ) : (
              <VolumeX className="w-5 h-5 text-[#64748B]" aria-hidden="true" />
            )}
            <span className="hidden lg:inline text-sm font-semibold">
              {soundEnabled ? 'Suara On' : 'Suara Off'}
            </span>
          </button>

          {currentScreen !== 'home' && (
            <button
              type="button"
              onClick={() => {
                playClick();
                onGoHome();
              }}
              aria-label="Kembali ke Beranda"
              className="min-w-[44px] min-h-[44px] px-3 py-2 rounded-xl border-2 border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#14284B] font-semibold text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:inline">Beranda</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
