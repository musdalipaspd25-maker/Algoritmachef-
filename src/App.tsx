import { useEffect, useState } from 'react';
import { LEVELS_CONFIG } from './data/levels';
import {
  GameProgressState,
  ProgramBlock,
  ScreenId,
  SimulationSnapshot,
} from './types/game';
import {
  calculateLevelScore,
  countTotalBlocks,
  ScoreCalculation,
} from './engine/interpreter';
import {
  loadProgress,
  resetProgressStorage,
  saveProgress,
} from './utils/storage';
import { playClick, setSoundEnabled } from './utils/sound';
import { TopNav } from './components/TopNav';
import { TeacherRecapModal } from './components/TeacherRecapModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { OrderBoardScreen } from './components/screens/OrderBoardScreen';
import { DecompositionScreen } from './components/screens/DecompositionScreen';
import { EditorScreen } from './components/screens/EditorScreen';
import { SimulationScreen } from './components/screens/SimulationScreen';
import { ScoreReflectionScreen } from './components/screens/ScoreReflectionScreen';
import { ClosingScreen } from './components/screens/ClosingScreen';

export default function App() {
  const [progress, setProgress] = useState<GameProgressState>(() =>
    loadProgress()
  );
  const [screen, setScreen] = useState<ScreenId>('home');
  const [activeLevelId, setActiveLevelId] = useState<number>(1);
  const [showTeacherRecap, setShowTeacherRecap] = useState<boolean>(false);

  // State per sesi level: dekomposisi & program blok
  const [decompositionPassed, setDecompositionPassed] = useState<
    Record<number, boolean>
  >({});
  const [programsByLevel, setProgramsByLevel] = useState<
    Record<number, ProgramBlock[]>
  >({});

  // Hasil skor sesi terakhir
  const [lastScoreResult, setLastScoreResult] = useState<{
    score: ScoreCalculation;
    usedBlocks: number;
    previousBestBlocks: number | null;
  } | null>(null);

  // Sinkronkan pengaturan suara ke Web Audio synthesizer & simpan progres ke localStorage
  useEffect(() => {
    setSoundEnabled(progress.soundEnabled);
    saveProgress(progress);
  }, [progress]);

  const activeLevel =
    LEVELS_CONFIG.find((l) => l.id === activeLevelId) ?? LEVELS_CONFIG[0];

  const handleToggleSound = () => {
    setProgress((prev) => {
      const nextEnabled = !prev.soundEnabled;
      setSoundEnabled(nextEnabled);
      if (nextEnabled) playClick();
      return { ...prev, soundEnabled: nextEnabled };
    });
  };

  const handleToggleTeacherUnlock = () => {
    setProgress((prev) => ({
      ...prev,
      teacherUnlockAll: !prev.teacherUnlockAll,
    }));
  };

  const handleResetProgress = () => {
    const fresh = resetProgressStorage();
    setProgress(fresh);
    setDecompositionPassed({});
    setProgramsByLevel({});
    setActiveLevelId(1);
    setScreen('home');
  };

  const handleStartLevel = (levelId: number) => {
    setActiveLevelId(levelId);
    setScreen('order_board');
  };

  const handleRunSimulation = () => {
    // Catat jumlah percobaan saat menjalankan simulasi
    const currentProg = programsByLevel[activeLevel.id] ?? [];
    const blockCount = countTotalBlocks(currentProg);

    setProgress((prev) => {
      const prevLvl = prev.levels[activeLevel.id];
      return {
        ...prev,
        levels: {
          ...prev.levels,
          [activeLevel.id]: {
            ...prevLvl,
            attempts: (prevLvl?.attempts ?? 0) + 1,
            lastBlockCount: blockCount,
          },
        },
      };
    });

    setScreen('simulation');
  };

  const handleCompleteSuccess = (finalSnapshot: SimulationSnapshot) => {
    const currentProg = programsByLevel[activeLevel.id] ?? [];
    const usedBlocks = countTotalBlocks(currentProg);
    const prevLvl = progress.levels[activeLevel.id];
    const previousBestBlocks = prevLvl?.bestBlockCount ?? null;

    const score = calculateLevelScore(activeLevel, finalSnapshot, usedBlocks);

    setLastScoreResult({
      score,
      usedBlocks,
      previousBestBlocks,
    });

    setProgress((prev) => {
      const existing = prev.levels[activeLevel.id];
      const nextBestBlocks =
        existing?.bestBlockCount === null ||
        existing?.bestBlockCount === undefined
          ? usedBlocks
          : Math.min(existing.bestBlockCount, usedBlocks);

      const nextLevelId = activeLevel.id + 1;
      const hasNext = LEVELS_CONFIG.some((l) => l.id === nextLevelId);
      const nextUnlocked = hasNext
        ? Array.from(new Set([...prev.unlockedLevelIds, nextLevelId]))
        : prev.unlockedLevelIds;

      return {
        ...prev,
        unlockedLevelIds: nextUnlocked,
        levels: {
          ...prev.levels,
          [activeLevel.id]: {
            ...existing,
            completed: true,
            bestScore: Math.max(existing?.bestScore ?? 0, score.totalScore),
            stars: Math.max(existing?.stars ?? 0, score.stars),
            bestBlockCount: nextBestBlocks,
            lastBlockCount: usedBlocks,
          },
        },
      };
    });

    setScreen('score');
  };

  const handleAnswerQuizCorrect = () => {
    setProgress((prev) => ({
      ...prev,
      levels: {
        ...prev.levels,
        [activeLevel.id]: {
          ...prev.levels[activeLevel.id],
          quizAnsweredCorrectly: true,
        },
      },
    }));
  };

  const nextLevelExists = LEVELS_CONFIG.some(
    (l) => l.id === activeLevel.id + 1
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FFF8EE] text-[#14284B]">
      <TopNav
        currentScreen={screen}
        activeLevelId={activeLevel.id}
        soundEnabled={progress.soundEnabled}
        onToggleSound={handleToggleSound}
        onGoHome={() => setScreen('home')}
        onOpenTeacherRecap={() => setShowTeacherRecap(true)}
      />

      <div className="flex-1">
        {screen === 'home' && (
          <HomeScreen
            progress={progress}
            selectedLevelId={activeLevelId}
            onSelectLevel={setActiveLevelId}
            onStartLevel={handleStartLevel}
            onToggleSound={handleToggleSound}
            onResetProgress={handleResetProgress}
            onToggleTeacherUnlock={handleToggleTeacherUnlock}
            onGoClosing={() => setScreen('closing')}
          />
        )}

        {screen === 'order_board' && (
          <OrderBoardScreen
            level={activeLevel}
            onStartDecomposition={() => setScreen('decomposition')}
            onBackHome={() => setScreen('home')}
          />
        )}

        {screen === 'decomposition' && (
          <DecompositionScreen
            level={activeLevel}
            alreadyPassed={Boolean(decompositionPassed[activeLevel.id])}
            onPassDecomposition={() =>
              setDecompositionPassed((prev) => ({
                ...prev,
                [activeLevel.id]: true,
              }))
            }
            onGoToEditor={() => setScreen('editor')}
            onBackToOrders={() => setScreen('order_board')}
          />
        )}

        {screen === 'editor' && (
          <EditorScreen
            level={activeLevel}
            program={programsByLevel[activeLevel.id] ?? []}
            previousBlockCount={
              progress.levels[activeLevel.id]?.bestBlockCount ?? null
            }
            onChangeProgram={(nextProg) =>
              setProgramsByLevel((prev) => ({
                ...prev,
                [activeLevel.id]: nextProg,
              }))
            }
            onRunSimulation={handleRunSimulation}
            onBackToDecomposition={() => setScreen('decomposition')}
          />
        )}

        {screen === 'simulation' && (
          <SimulationScreen
            level={activeLevel}
            program={programsByLevel[activeLevel.id] ?? []}
            onBackToEditor={() => setScreen('editor')}
            onCompleteSuccess={handleCompleteSuccess}
          />
        )}

        {screen === 'score' && lastScoreResult && (
          <ScoreReflectionScreen
            level={activeLevel}
            scoreData={lastScoreResult.score}
            usedBlocks={lastScoreResult.usedBlocks}
            previousBestBlocks={lastScoreResult.previousBestBlocks}
            hasNextLevel={nextLevelExists}
            progress={progress}
            onAnswerQuizCorrect={handleAnswerQuizCorrect}
            onNextLevel={() => {
              const nextId = activeLevel.id + 1;
              setActiveLevelId(nextId);
              setScreen('order_board');
            }}
            onReplayLevel={() => setScreen('order_board')}
            onFinishToClosing={() => setScreen('closing')}
            onOpenTeacherRecap={() => setShowTeacherRecap(true)}
          />
        )}

        {screen === 'closing' && (
          <ClosingScreen
            progress={progress}
            onPlayAgainHome={() => setScreen('home')}
          />
        )}
      </div>

      <TeacherRecapModal
        isOpen={showTeacherRecap}
        progress={progress}
        onClose={() => setShowTeacherRecap(false)}
        onToggleTeacherUnlock={handleToggleTeacherUnlock}
      />
    </div>
  );
}
