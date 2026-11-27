import React from 'react';
import { ArrowLeft, ArrowRight, Clock, Package, Utensils, Flame, Crown } from 'lucide-react';
import { LevelConfig } from '../../types/game';
import { playClick } from '../../utils/sound';

interface OrderBoardScreenProps {
  level: LevelConfig;
  onStartDecomposition: () => void;
  onBackHome: () => void;
}

export const OrderBoardScreen: React.FC<OrderBoardScreenProps> = ({
  level,
  onStartDecomposition,
  onBackHome,
}) => {
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header Papan Pesanan */}
      <div className="chef-card p-6 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="text-sm font-bold text-[#EA580C]">
            Level {level.id} · {level.conceptTag} · Tingkat {level.difficulty}
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#14284B]">
            Papan Pesanan &amp; Resep: {level.title}
          </h1>
          <p className="text-base text-[#4A5B78] max-w-2xl">
            {level.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 shrink-0">
          <div className="px-4 py-2.5 rounded-xl bg-[#FFF8EE] border-2 border-[#E5D9C5] text-center">
            <div className="text-xs font-bold text-[#4A5B78]">Target Porsi</div>
            <div className="font-mono-num text-xl font-extrabold text-[#14284B] flex items-center justify-center gap-1.5">
              <Utensils className="w-4 h-4 text-[#EA580C]" />
              <span>{level.targetPortions}</span>
            </div>
          </div>
          <div className="px-4 py-2.5 rounded-xl bg-[#FFF8EE] border-2 border-[#E5D9C5] text-center">
            <div className="text-xs font-bold text-[#4A5B78]">Batas Waktu</div>
            <div className="font-mono-num text-xl font-extrabold text-[#14284B] flex items-center justify-center gap-1.5">
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>{level.timeLimitSeconds} dtk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Tiket Pesanan (Kiri) + Kartu Resep & Stok Bahan (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Daftar Tiket Pesanan */}
        <section className="lg:col-span-6 chef-card p-6 bg-white space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-extrabold text-[#14284B]">
              Daftar Tiket Pesanan ({level.orders.length})
            </h2>
            {level.randomSeed && (
              <span className="text-xs font-mono-num font-bold text-[#4A5B78]">
                Seed: {level.randomSeed}
              </span>
            )}
          </div>

          <div className="space-y-3">
            {level.orders.map((ord, idx) => (
              <div
                key={ord.id}
                className="p-4 rounded-xl bg-[#FFF8EE] border-2 border-[#E5D9C5] flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-lg bg-white border border-[#E5D9C5] flex items-center justify-center font-mono-num font-bold text-[#14284B] shrink-0">
                    #{idx + 1}
                  </span>
                  <span className="text-3xl shrink-0" aria-hidden="true">
                    {ord.emoji}
                  </span>
                  <div>
                    <div className="font-bold text-base text-[#14284B]">
                      {ord.dishName}
                    </div>
                    <div className="text-sm text-[#4A5B78]">
                      Bahan Utama: <strong>{ord.mainIngredient}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-xs font-bold shrink-0">
                  {ord.isSpicy && (
                    <span className="flex items-center gap-1 text-[#DC2626]">
                      <Flame className="w-4 h-4" />
                      Pedas (+Cabai)
                    </span>
                  )}
                  {ord.isVip && (
                    <span className="flex items-center gap-1 text-[#7C3AED]">
                      <Crown className="w-4 h-4" />
                      VIP (+Garnish)
                    </span>
                  )}
                  {!ord.isSpicy && !ord.isVip && (
                    <span className="text-[#059669]">Standar</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Kartu Resep & Stok Bahan */}
        <section className="lg:col-span-6 space-y-6">
          <div className="chef-card p-6 bg-white space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl" aria-hidden="true">
                {level.recipeEmoji}
              </span>
              <div>
                <div className="text-sm font-bold text-[#4A5B78]">Kartu Resep Resmi</div>
                <h2 className="font-display text-xl font-extrabold text-[#14284B]">
                  {level.recipeName}
                </h2>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5] space-y-2">
              {level.recipeVisualSteps.map((step, i) => (
                <p
                  key={i}
                  className="text-base text-[#14284B] font-semibold leading-snug"
                >
                  {step}
                </p>
              ))}
            </div>
          </div>

          <div className="chef-card p-6 bg-white space-y-3">
            <div className="flex items-center gap-2 font-display text-lg font-extrabold text-[#14284B]">
              <Package className="w-5 h-5 text-[#EA580C]" />
              <span>Stok Awal Rak Dapur</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE]">
                <div className="text-xs font-bold text-[#1E3A8A]">Bahan Utama</div>
                <div className="font-mono-num text-xl font-black text-[#1E3A8A]">
                  {level.initialStock.Utama}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]">
                <div className="text-xs font-bold text-[#064E3B]">Sayuran</div>
                <div className="font-mono-num text-xl font-black text-[#064E3B]">
                  {level.initialStock.Sayur}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-red-50 border border-red-200">
                <div className="text-xs font-bold text-red-900">Cabai</div>
                <div className="font-mono-num text-xl font-black text-red-900">
                  {level.initialStock.Cabai}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE]">
                <div className="text-xs font-bold text-[#4C1D95]">Garnish VIP</div>
                <div className="font-mono-num text-xl font-black text-[#4C1D95]">
                  {level.initialStock['Garnish VIP']}
                </div>
              </div>
            </div>

            {level.initialStock.Utama < level.targetPortions && (
              <p className="text-sm font-bold text-[#DC2626]">
                Perhatian: Stok Bahan Utama ({level.initialStock.Utama}) lebih sedikit dari target porsi ({level.targetPortions})! Robot perlu mengambil Stok Gudang saat bahan habis.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Tombol Navigasi Bawah */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => {
            playClick();
            onBackHome();
          }}
          className="chef-btn-secondary min-h-[48px] px-6 py-3 rounded-xl font-bold text-base flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Kembali</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playClick();
            onStartDecomposition();
          }}
          className="chef-btn-primary min-h-[48px] px-7 py-3 rounded-xl font-display font-extrabold text-lg flex items-center gap-2 cursor-pointer"
        >
          <span>Kerjakan Pesanan</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </main>
  );
};
