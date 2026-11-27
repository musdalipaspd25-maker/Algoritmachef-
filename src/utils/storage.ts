import { LEVELS_CONFIG } from '../data/levels';
import { GameProgressState, LevelProgress } from '../types/game';

const STORAGE_KEY = 'algorithm_chef_resto_progress_v1';

export function createInitialProgress(): GameProgressState {
  const levels: Record<number, LevelProgress> = {};
  for (const lvl of LEVELS_CONFIG) {
    levels[lvl.id] = {
      levelId: lvl.id,
      completed: false,
      bestScore: 0,
      stars: 0,
      bestBlockCount: null,
      lastBlockCount: null,
      attempts: 0,
      quizAnsweredCorrectly: false,
    };
  }

  return {
    unlockedLevelIds: [1, 2, 3], // Level 1-3 terbuka di awal sesuai spesifikasi
    levels,
    soundEnabled: true,
    teacherUnlockAll: false,
  };
}

export function loadProgress(): GameProgressState {
  const fallback = createInitialProgress();
  if (typeof window === 'undefined') return fallback;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<GameProgressState>;

    const mergedLevels: Record<number, LevelProgress> = { ...fallback.levels };
    if (parsed.levels && typeof parsed.levels === 'object') {
      for (const lvl of LEVELS_CONFIG) {
        const saved = parsed.levels[lvl.id];
        if (saved) {
          mergedLevels[lvl.id] = {
            ...fallback.levels[lvl.id],
            ...saved,
          };
        }
      }
    }

    const unlocked = Array.isArray(parsed.unlockedLevelIds)
      ? Array.from(new Set([1, 2, 3, ...parsed.unlockedLevelIds]))
      : fallback.unlockedLevelIds;

    return {
      unlockedLevelIds: unlocked,
      levels: mergedLevels,
      soundEnabled:
        typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
      teacherUnlockAll:
        typeof parsed.teacherUnlockAll === 'boolean'
          ? parsed.teacherUnlockAll
          : false,
    };
  } catch {
    return fallback;
  }
}

export function saveProgress(state: GameProgressState): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Abaikan kegagalan storage (misal mode private/kuota penuh)
  }
}

export function resetProgressStorage(): GameProgressState {
  const fresh = createInitialProgress();
  saveProgress(fresh);
  return fresh;
}

export function downloadTeacherCsv(progress: GameProgressState): void {
  const headers = [
    'Level',
    'Judul Level',
    'Konsep Algoritma',
    'Status',
    'Skor Terbaik',
    'Bintang (1-3)',
    'Blok Optimal',
    'Blok Terbaik Siswa',
    'Blok Terakhir',
    'Jumlah Percobaan',
    'Kuis Refleksi Benar',
  ];

  const rows = LEVELS_CONFIG.map((lvl) => {
    const p = progress.levels[lvl.id];
    return [
      lvl.id,
      `"${lvl.title}"`,
      `"${lvl.conceptTag}"`,
      p?.completed ? 'Selesai' : 'Belum Selesai',
      p?.bestScore ?? 0,
      p?.stars ?? 0,
      lvl.optimalBlockCount,
      p?.bestBlockCount ?? '-',
      p?.lastBlockCount ?? '-',
      p?.attempts ?? 0,
      p?.quizAnsweredCorrectly ? 'Ya' : 'Belum',
    ].join(',');
  });

  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'rekap_progres_algorithm_chef.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
