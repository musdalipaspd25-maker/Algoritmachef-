import {
  ActionType,
  ConditionType,
  IngredientType,
  LevelConfig,
  ProgramBlock,
  SimulationSnapshot,
} from '../types/game';

export const ACTION_LABELS: Record<ActionType, string> = {
  ambil_bahan: 'Ambil Bahan',
  potong: 'Potong',
  masak: 'Masak',
  tata_piring: 'Tata di Piring',
  sajikan: 'Sajikan',
};

export const CONDITION_LABELS: Record<ConditionType, string> = {
  bahan_tersedia: 'bahan tersedia',
  bahan_habis: 'bahan habis',
  pesanan_vip: 'pesanan VIP',
  pesanan_pedas: 'pesanan pedas',
  pesanan_ada: 'pesanan ada',
};

export const INGREDIENT_LABELS: Record<IngredientType, string> = {
  Utama: 'Utama',
  Sayur: 'Sayur',
  Cabai: 'Cabai',
  'Stok Gudang': 'Stok Gudang',
  'Garnish VIP': 'Garnish VIP',
};

export function countTotalBlocks(blocks: ProgramBlock[]): number {
  let count = 0;
  for (const b of blocks) {
    count += 1;
    if (b.category === 'condition') {
      count += countTotalBlocks(b.thenBlocks) + countTotalBlocks(b.elseBlocks);
    } else if (b.category === 'loop') {
      count += countTotalBlocks(b.children);
    }
  }
  return count;
}

export function hasLoopBlock(blocks: ProgramBlock[]): boolean {
  for (const b of blocks) {
    if (b.category === 'loop') return true;
    if (b.category === 'condition') {
      if (hasLoopBlock(b.thenBlocks) || hasLoopBlock(b.elseBlocks)) return true;
    }
  }
  return false;
}

export function hasConditionBlock(blocks: ProgramBlock[]): boolean {
  for (const b of blocks) {
    if (b.category === 'condition') return true;
    if (b.category === 'loop') {
      if (hasConditionBlock(b.children)) return true;
    }
  }
  return false;
}

export function formatBlockLabel(block: ProgramBlock): string {
  if (block.category === 'action') {
    if (block.action === 'ambil_bahan') {
      return `Ambil Bahan [${block.ingredient ?? 'Utama'}]`;
    }
    return ACTION_LABELS[block.action];
  }
  if (block.category === 'condition') {
    return `Jika [${CONDITION_LABELS[block.condition]}]`;
  }
  if (block.loopMode === 'while') {
    return `Ulangi selama [${CONDITION_LABELS[block.condition ?? 'pesanan_ada']}]`;
  }
  return `Ulangi [${block.count}] kali`;
}

export interface ScoreCalculation {
  accuracyScore: number;
  timeBonus: number;
  efficiencyBonus: number;
  totalScore: number;
  stars: number;
  remainingSeconds: number;
}

export function calculateLevelScore(
  level: LevelConfig,
  finalSnapshot: SimulationSnapshot,
  blockCount: number
): ScoreCalculation {
  if (!finalSnapshot.isSuccess) {
    return {
      accuracyScore: 0,
      timeBonus: 0,
      efficiencyBonus: 0,
      totalScore: 0,
      stars: 0,
      remainingSeconds: Math.max(
        0,
        Math.round(level.timeLimitSeconds - finalSnapshot.elapsedSeconds)
      ),
    };
  }

  const remainingSeconds = Math.max(
    0,
    Math.round(level.timeLimitSeconds - finalSnapshot.elapsedSeconds)
  );
  const accuracyScore = 500;
  const timeBonus = Math.round(remainingSeconds * 8);
  const diff = Math.max(0, blockCount - level.optimalBlockCount);
  const efficiencyBonus =
    diff === 0 ? 300 : Math.max(0, 300 - diff * 50);

  const totalScore = accuracyScore + timeBonus + efficiencyBonus;

  let stars = 1;
  if (blockCount <= level.optimalBlockCount + 1 && remainingSeconds >= 5) {
    stars = 3;
  } else if (blockCount <= level.optimalBlockCount + 4 || remainingSeconds >= 3) {
    stars = 2;
  }

  return {
    accuracyScore,
    timeBonus,
    efficiencyBonus,
    totalScore,
    stars,
    remainingSeconds,
  };
}

/**
 * Interpreter nyata yang mengeksekusi pohon blok (termasuk nested If-Else & Loop)
 * dan menghasilkan daftar langkah (trace) untuk diputar otomatis maupun langkah demi langkah.
 */
export function buildSimulationTrace(
  level: LevelConfig,
  program: ProgramBlock[]
): SimulationSnapshot[] {
  const trace: SimulationSnapshot[] = [];

  const initialStock = { ...level.initialStock };
  let state: SimulationSnapshot = {
    stepIndex: 0,
    activeBlockId: null,
    activeBlockLabel: 'Siap Memulai',
    station: 'idle',
    mood: 'idle',
    statusMessage: 'Robot koki siap menerima instruksi.',
    elapsedSeconds: 0,
    completedOrders: 0,
    currentOrderIndex: 0,
    stock: { ...initialStock },
    holdingIngredient: null,
    hasCut: false,
    hasCooked: false,
    hasPlated: false,
    hasAddedChili: false,
    hasAddedVipGarnish: false,
    errorMessage: null,
    isFinished: false,
    isSuccess: false,
  };

  trace.push({ ...state, stock: { ...state.stock } });

  if (program.length === 0) {
    state = {
      ...state,
      stepIndex: 1,
      mood: 'error',
      errorMessage:
        'Program masih kosong! Kembali ke Editor dan susun blok instruksi terlebih dahulu.',
      statusMessage: 'Tidak ada blok untuk dijalankan.',
      isFinished: true,
      isSuccess: false,
    };
    trace.push({ ...state, stock: { ...state.stock } });
    return trace;
  }

  const MAX_STEPS = 220;
  let stepCounter = 0;

  const pushError = (blockId: string | null, blockLabel: string, msg: string) => {
    stepCounter += 1;
    state = {
      ...state,
      stepIndex: stepCounter,
      activeBlockId: blockId,
      activeBlockLabel: blockLabel,
      mood: 'error',
      errorMessage: msg,
      statusMessage: msg,
      isFinished: true,
      isSuccess: false,
    };
    trace.push({ ...state, stock: { ...state.stock } });
  };

  const evaluateCondition = (cond: ConditionType): boolean => {
    const currentOrder = level.orders[state.currentOrderIndex];
    switch (cond) {
      case 'bahan_tersedia':
        return state.stock.Utama > 0;
      case 'bahan_habis':
        return state.stock.Utama <= 0;
      case 'pesanan_vip':
        return Boolean(currentOrder?.isVip);
      case 'pesanan_pedas':
        return Boolean(currentOrder?.isSpicy);
      case 'pesanan_ada':
        return state.completedOrders < level.orders.length;
      default:
        return false;
    }
  };

  const executeBlocks = (blocks: ProgramBlock[]): boolean => {
    for (const block of blocks) {
      if (state.isFinished) return false;

      if (stepCounter >= MAX_STEPS) {
        pushError(
          block.id,
          formatBlockLabel(block),
          'Perulangan terlalu panjang (melebihi batas aman)! Periksa kondisi perulangan agar tidak terjadi infinite loop.'
        );
        return false;
      }

      if (block.category === 'loop') {
        const label = formatBlockLabel(block);
        if (block.children.length === 0) {
          pushError(
            block.id,
            label,
            'Blok Perulangan masih kosong! Masukkan blok aksi ke dalam blok Ulangi.'
          );
          return false;
        }

        if (block.loopMode === 'count') {
          const iterations = Math.max(0, Math.min(20, block.count));
          for (let i = 0; i < iterations; i++) {
            if (state.isFinished) return false;
            stepCounter += 1;
            state = {
              ...state,
              stepIndex: stepCounter,
              activeBlockId: block.id,
              activeBlockLabel: label,
              mood: 'working',
              elapsedSeconds: Number((state.elapsedSeconds + 0.3).toFixed(1)),
              statusMessage: `Putaran ke-${i + 1} dari ${iterations} (${label})`,
            };
            trace.push({ ...state, stock: { ...state.stock } });

            if (state.elapsedSeconds > level.timeLimitSeconds) {
              pushError(
                block.id,
                label,
                `Waktu habis (${level.timeLimitSeconds} detik)! Sederhanakan algoritmamu.`
              );
              return false;
            }

            if (!executeBlocks(block.children)) return false;
            if (state.isFinished) return false;
          }
        } else {
          const cond = block.condition ?? 'pesanan_ada';
          let guard = 0;
          while (evaluateCondition(cond)) {
            if (state.isFinished) return false;
            guard += 1;
            if (guard > 20 || stepCounter >= MAX_STEPS) {
              pushError(
                block.id,
                label,
                'Perulangan selama kondisi terus berjalan tanpa menyelesaikan pesanan! Pastikan ada blok Sajikan di dalamnya.'
              );
              return false;
            }
            stepCounter += 1;
            state = {
              ...state,
              stepIndex: stepCounter,
              activeBlockId: block.id,
              activeBlockLabel: label,
              mood: 'working',
              elapsedSeconds: Number((state.elapsedSeconds + 0.3).toFixed(1)),
              statusMessage: `Mengulang selama [${CONDITION_LABELS[cond]}] (putaran #${guard})`,
            };
            trace.push({ ...state, stock: { ...state.stock } });

            if (state.elapsedSeconds > level.timeLimitSeconds) {
              pushError(
                block.id,
                label,
                `Waktu habis (${level.timeLimitSeconds} detik)! Sederhanakan algoritmamu.`
              );
              return false;
            }

            if (!executeBlocks(block.children)) return false;
            if (state.isFinished) return false;
          }
        }
        continue;
      }

      if (block.category === 'condition') {
        const label = formatBlockLabel(block);
        const result = evaluateCondition(block.condition);
        stepCounter += 1;
        state = {
          ...state,
          stepIndex: stepCounter,
          activeBlockId: block.id,
          activeBlockLabel: label,
          mood: 'working',
          elapsedSeconds: Number((state.elapsedSeconds + 0.4).toFixed(1)),
          statusMessage: `Cek kondisi "${CONDITION_LABELS[block.condition]}" → ${
            result ? 'BENAR (masuk jalur Jika)' : 'TIDAK (masuk jalur Jika Tidak)'
          }`,
        };
        trace.push({ ...state, stock: { ...state.stock } });

        if (state.elapsedSeconds > level.timeLimitSeconds) {
          pushError(
            block.id,
            label,
            `Waktu habis (${level.timeLimitSeconds} detik)!`
          );
          return false;
        }

        const branch = result ? block.thenBlocks : block.elseBlocks;
        if (!executeBlocks(branch)) return false;
        continue;
      }

      // Blok Aksi
      const label = formatBlockLabel(block);
      const currentOrder = level.orders[state.currentOrderIndex];

      if (!currentOrder) {
        pushError(
          block.id,
          label,
          'Semua pesanan sudah selesai, tetapi masih ada blok ekstra yang dijalankan!'
        );
        return false;
      }

      if (block.action === 'ambil_bahan') {
        const ing = block.ingredient ?? 'Utama';

        if (ing === 'Cabai') {
          if (!currentOrder.isSpicy) {
            pushError(
              block.id,
              label,
              `Pesanan #${state.currentOrderIndex + 1} (${currentOrder.dishName}) tidak pedas! Gunakan blok "Jika [pesanan pedas]" agar Cabai hanya ditambahkan saat perlu.`
            );
            return false;
          }
          if (state.stock.Cabai <= 0) {
            pushError(block.id, label, 'Stok Cabai habis!');
            return false;
          }
          stepCounter += 1;
          state = {
            ...state,
            stepIndex: stepCounter,
            activeBlockId: block.id,
            activeBlockLabel: label,
            station: 'rak_bahan',
            mood: 'working',
            stock: { ...state.stock, Cabai: state.stock.Cabai - 1 },
            hasAddedChili: true,
            elapsedSeconds: Number((state.elapsedSeconds + 1.1).toFixed(1)),
            statusMessage: 'Menambahkan Cabai untuk pesanan pedas.',
          };
          trace.push({ ...state, stock: { ...state.stock } });
        } else if (ing === 'Garnish VIP') {
          if (!currentOrder.isVip) {
            pushError(
              block.id,
              label,
              `Pesanan #${state.currentOrderIndex + 1} bukan pesanan VIP! Gunakan blok "Jika [pesanan VIP]" sebelum menambah Garnish VIP.`
            );
            return false;
          }
          if (state.stock['Garnish VIP'] <= 0) {
            pushError(block.id, label, 'Stok Garnish VIP habis!');
            return false;
          }
          stepCounter += 1;
          state = {
            ...state,
            stepIndex: stepCounter,
            activeBlockId: block.id,
            activeBlockLabel: label,
            station: 'meja_tata',
            mood: 'working',
            stock: {
              ...state.stock,
              'Garnish VIP': state.stock['Garnish VIP'] - 1,
            },
            hasAddedVipGarnish: true,
            elapsedSeconds: Number((state.elapsedSeconds + 1.0).toFixed(1)),
            statusMessage: 'Menambahkan Garnish VIP spesial di piring.',
          };
          trace.push({ ...state, stock: { ...state.stock } });
        } else if (ing === 'Stok Gudang') {
          if (state.holdingIngredient) {
            pushError(
              block.id,
              label,
              'Robot sudah memegang bahan utama! Selesaikan dulu hidangan saat ini.'
            );
            return false;
          }
          stepCounter += 1;
          state = {
            ...state,
            stepIndex: stepCounter,
            activeBlockId: block.id,
            activeBlockLabel: label,
            station: 'rak_bahan',
            mood: 'working',
            holdingIngredient: 'Stok Gudang',
            elapsedSeconds: Number((state.elapsedSeconds + 1.6).toFixed(1)),
            statusMessage: 'Mengambil bahan cadangan dari Stok Gudang.',
          };
          trace.push({ ...state, stock: { ...state.stock } });
        } else {
          // Utama atau Sayur
          if (state.holdingIngredient) {
            pushError(
              block.id,
              label,
              'Robot masih memegang bahan! Selesaikan proses masak lalu Sajikan terlebih dahulu.'
            );
            return false;
          }
          if (currentOrder.mainIngredient !== ing) {
            pushError(
              block.id,
              label,
              `Bahan tidak sesuai resep! Pesanan "${currentOrder.dishName}" membutuhkan Bahan [${currentOrder.mainIngredient}], bukan [${ing}].`
            );
            return false;
          }
          if (state.stock[ing] <= 0) {
            pushError(
              block.id,
              label,
              'Bahan habis! Tambahkan kondisi if (Jika [bahan tersedia] / Jika [bahan habis]) untuk mengambil Stok Gudang.'
            );
            return false;
          }
          stepCounter += 1;
          state = {
            ...state,
            stepIndex: stepCounter,
            activeBlockId: block.id,
            activeBlockLabel: label,
            station: 'rak_bahan',
            mood: 'working',
            stock: { ...state.stock, [ing]: state.stock[ing] - 1 },
            holdingIngredient: ing,
            elapsedSeconds: Number((state.elapsedSeconds + 1.4).toFixed(1)),
            statusMessage: `Mengambil Bahan [${ing}] dari rak dapur.`,
          };
          trace.push({ ...state, stock: { ...state.stock } });
        }
      } else if (block.action === 'potong') {
        if (!state.holdingIngredient) {
          pushError(
            block.id,
            label,
            'Tidak ada bahan untuk dipotong! Letakkan blok Ambil Bahan sebelum Potong.'
          );
          return false;
        }
        stepCounter += 1;
        state = {
          ...state,
          stepIndex: stepCounter,
          activeBlockId: block.id,
          activeBlockLabel: label,
          station: 'talenan',
          mood: 'working',
          hasCut: true,
          elapsedSeconds: Number((state.elapsedSeconds + 1.4).toFixed(1)),
          statusMessage: 'Memotong bahan dengan rapi di talenan.',
        };
        trace.push({ ...state, stock: { ...state.stock } });
      } else if (block.action === 'masak') {
        if (!state.holdingIngredient) {
          pushError(
            block.id,
            label,
            'Wajan kosong! Ambil dan potong bahan terlebih dahulu sebelum memasak.'
          );
          return false;
        }
        if (!state.hasCut) {
          pushError(
            block.id,
            label,
            'Urutan salah! Potong bahan terlebih dahulu sebelum dimasak di kompor.'
          );
          return false;
        }
        stepCounter += 1;
        state = {
          ...state,
          stepIndex: stepCounter,
          activeBlockId: block.id,
          activeBlockLabel: label,
          station: 'kompor',
          mood: 'working',
          hasCooked: true,
          elapsedSeconds: Number((state.elapsedSeconds + 2.0).toFixed(1)),
          statusMessage: `Memasak ${currentOrder.dishName} di kompor otomatis...`,
        };
        trace.push({ ...state, stock: { ...state.stock } });
      } else if (block.action === 'tata_piring') {
        if (!state.hasCooked) {
          pushError(
            block.id,
            label,
            'Masakan belum matang! Masak bahan terlebih dahulu sebelum ditata di piring.'
          );
          return false;
        }
        stepCounter += 1;
        state = {
          ...state,
          stepIndex: stepCounter,
          activeBlockId: block.id,
          activeBlockLabel: label,
          station: 'meja_tata',
          mood: 'working',
          hasPlated: true,
          elapsedSeconds: Number((state.elapsedSeconds + 1.2).toFixed(1)),
          statusMessage: 'Menata hidangan hangat di atas piring saji.',
        };
        trace.push({ ...state, stock: { ...state.stock } });
      } else if (block.action === 'sajikan') {
        if (!state.holdingIngredient || !state.hasCooked) {
          pushError(
            block.id,
            label,
            'Hidangan belum siap disajikan! Pastikan bahan sudah diambil, dipotong, dan dimasak.'
          );
          return false;
        }
        if (currentOrder.requiresPlating && !state.hasPlated) {
          pushError(
            block.id,
            label,
            'Jangan lupa Tata di Piring sebelum menyajikan pesanan ke pelanggan!'
          );
          return false;
        }
        if (currentOrder.isSpicy && !state.hasAddedChili) {
          pushError(
            block.id,
            label,
            `Pesanan #${state.currentOrderIndex + 1} (${currentOrder.dishName}) meminta Pedas! Tambahkan kondisi "Jika [pesanan pedas]" lalu "Ambil Bahan [Cabai]".`
          );
          return false;
        }
        if (currentOrder.isVip && !state.hasAddedVipGarnish) {
          pushError(
            block.id,
            label,
            `Pesanan #${state.currentOrderIndex + 1} adalah pesanan VIP! Tambahkan kondisi "Jika [pesanan VIP]" lalu "Ambil Bahan [Garnish VIP]".`
          );
          return false;
        }

        const nextCompleted = state.completedOrders + 1;
        const nextOrderIdx = state.currentOrderIndex + 1;
        stepCounter += 1;
        state = {
          ...state,
          stepIndex: stepCounter,
          activeBlockId: block.id,
          activeBlockLabel: label,
          station: 'loket_saji',
          mood: nextCompleted >= level.orders.length ? 'success' : 'working',
          completedOrders: nextCompleted,
          currentOrderIndex: nextOrderIdx,
          holdingIngredient: null,
          hasCut: false,
          hasCooked: false,
          hasPlated: false,
          hasAddedChili: false,
          hasAddedVipGarnish: false,
          elapsedSeconds: Number((state.elapsedSeconds + 1.2).toFixed(1)),
          statusMessage: `Pesanan #${nextCompleted} (${currentOrder.dishName}) berhasil disajikan!`,
        };
        trace.push({ ...state, stock: { ...state.stock } });

        if (state.elapsedSeconds > level.timeLimitSeconds) {
          pushError(
            block.id,
            label,
            `Waktu habis (${level.timeLimitSeconds} detik)! Coba buat program lebih ringkas.`
          );
          return false;
        }

        if (nextCompleted >= level.orders.length) {
          if (level.requireLoop && !hasLoopBlock(program)) {
            pushError(
              block.id,
              label,
              'Pesanan memang selesai, tetapi level ini wajib memakai blok Perulangan (Ulangi) agar jumlah blok lebih efisien!'
            );
            return false;
          }
          if (level.requireCondition && !hasConditionBlock(program)) {
            pushError(
              block.id,
              label,
              'Level ini wajib memakai blok Kondisi (If-Else) agar algoritmamu bisa menangani kondisi yang berubah!'
            );
            return false;
          }

          stepCounter += 1;
          state = {
            ...state,
            stepIndex: stepCounter,
            activeBlockId: null,
            activeBlockLabel: 'Selesai',
            mood: 'success',
            isFinished: true,
            isSuccess: true,
            statusMessage: `Hebat, Chef! Semua ${level.orders.length} pesanan selesai tepat waktu!`,
          };
          trace.push({ ...state, stock: { ...state.stock } });
          return true;
        }
      }

      if (state.elapsedSeconds > level.timeLimitSeconds) {
        pushError(
          block.id,
          label,
          `Waktu habis (${level.timeLimitSeconds} detik)! Optimalkan langkah algoritmamu.`
        );
        return false;
      }
    }
    return true;
  };

  executeBlocks(program);

  if (!state.isFinished) {
    pushError(
      null,
      'Akhir Program',
      `Program berakhir, tetapi baru ${state.completedOrders} dari ${level.orders.length} pesanan yang selesai. Periksa kembali jumlah perulangan atau langkah yang kurang!`
    );
  }

  return trace;
}
