export type ScreenId =
  | 'home'
  | 'order_board'
  | 'decomposition'
  | 'editor'
  | 'simulation'
  | 'score'
  | 'closing';

export type IngredientType =
  | 'Utama'
  | 'Sayur'
  | 'Cabai'
  | 'Stok Gudang'
  | 'Garnish VIP';

export type ActionType =
  | 'ambil_bahan'
  | 'potong'
  | 'masak'
  | 'tata_piring'
  | 'sajikan';

export type ConditionType =
  | 'bahan_tersedia'
  | 'bahan_habis'
  | 'pesanan_vip'
  | 'pesanan_pedas'
  | 'pesanan_ada';

export type BlockCategory = 'action' | 'condition' | 'loop';

export interface ActionBlock {
  id: string;
  category: 'action';
  action: ActionType;
  ingredient?: IngredientType;
}

export interface ConditionBlock {
  id: string;
  category: 'condition';
  condition: ConditionType;
  thenBlocks: ProgramBlock[];
  elseBlocks: ProgramBlock[];
}

export interface LoopBlock {
  id: string;
  category: 'loop';
  loopMode: 'count' | 'while';
  count: number;
  condition?: ConditionType;
  children: ProgramBlock[];
}

export type ProgramBlock = ActionBlock | ConditionBlock | LoopBlock;

export interface DecompositionStep {
  id: string;
  label: string;
  subtaskGroup: string;
}

export interface OrderTicket {
  id: string;
  dishName: string;
  emoji: string;
  isSpicy: boolean;
  isVip: boolean;
  mainIngredient: 'Utama' | 'Sayur';
  requiresPlating: boolean;
}

export interface ReflectionQuiz {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LevelConfig {
  id: number;
  title: string;
  conceptTag: string;
  difficulty: 'Dasar' | 'Menengah' | 'Tantangan';
  recipeName: string;
  recipeEmoji: string;
  description: string;
  targetPortions: number;
  timeLimitSeconds: number;
  initialStock: {
    Utama: number;
    Sayur: number;
    Cabai: number;
    'Garnish VIP': number;
  };
  optimalBlockCount: number;
  requireLoop?: boolean;
  requireCondition?: boolean;
  randomSeed?: number;
  orders: OrderTicket[];
  recipeVisualSteps: string[];
  decompositionPrompt: string;
  subtaskColumns: string[];
  decompositionSteps: DecompositionStep[];
  hints: string[];
  reflectionQuiz: ReflectionQuiz;
}

export type RobotStation =
  | 'idle'
  | 'rak_bahan'
  | 'talenan'
  | 'kompor'
  | 'meja_tata'
  | 'loket_saji';

export type RobotMood = 'idle' | 'working' | 'success' | 'error';

export interface SimulationSnapshot {
  stepIndex: number;
  activeBlockId: string | null;
  activeBlockLabel: string;
  station: RobotStation;
  mood: RobotMood;
  statusMessage: string;
  elapsedSeconds: number;
  completedOrders: number;
  currentOrderIndex: number;
  stock: {
    Utama: number;
    Sayur: number;
    Cabai: number;
    'Garnish VIP': number;
  };
  holdingIngredient: IngredientType | null;
  hasCut: boolean;
  hasCooked: boolean;
  hasPlated: boolean;
  hasAddedChili: boolean;
  hasAddedVipGarnish: boolean;
  errorMessage: string | null;
  isFinished: boolean;
  isSuccess: boolean;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  bestScore: number;
  stars: number;
  bestBlockCount: number | null;
  lastBlockCount: number | null;
  attempts: number;
  quizAnsweredCorrectly: boolean;
}

export interface GameProgressState {
  unlockedLevelIds: number[];
  levels: Record<number, LevelProgress>;
  soundEnabled: boolean;
  teacherUnlockAll: boolean;
}
