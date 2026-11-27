import React, { useEffect, useState } from 'react';
import {
  ShoppingBasket,
  Scissors,
  Flame,
  Utensils,
  BellRing,
  GitBranch,
  Repeat,
  Play,
  RotateCcw,
  ArrowLeft,
  Trash2,
  ArrowUp,
  ArrowDown,
  Plus,
  Minus,
  Clock,
  Layers,
  Target,
} from 'lucide-react';
import {
  ActionType,
  ConditionType,
  IngredientType,
  LevelConfig,
  ProgramBlock,
} from '../../types/game';
import {
  ACTION_LABELS,
  CONDITION_LABELS,
  countTotalBlocks,
} from '../../engine/interpreter';
import { ChefRobotSvg } from '../ChefRobotSvg';
import { playClick, playDrop } from '../../utils/sound';

interface EditorScreenProps {
  level: LevelConfig;
  program: ProgramBlock[];
  previousBlockCount: number | null;
  onChangeProgram: (next: ProgramBlock[]) => void;
  onRunSimulation: () => void;
  onBackToDecomposition: () => void;
}

type PaletteTemplate =
  | {
      kind: 'action';
      action: ActionType;
      ingredient?: IngredientType;
      label: string;
    }
  | {
      kind: 'condition';
      condition: ConditionType;
      label: string;
    }
  | {
      kind: 'loop_count';
      count: number;
      label: string;
    }
  | {
      kind: 'loop_while';
      condition: ConditionType;
      label: string;
    };

const PALETTE_ITEMS: PaletteTemplate[] = [
  { kind: 'action', action: 'ambil_bahan', ingredient: 'Utama', label: 'Ambil Bahan' },
  { kind: 'action', action: 'potong', label: 'Potong' },
  { kind: 'action', action: 'masak', label: 'Masak' },
  { kind: 'action', action: 'tata_piring', label: 'Tata di Piring' },
  { kind: 'action', action: 'sajikan', label: 'Sajikan' },
  {
    kind: 'condition',
    condition: 'bahan_tersedia',
    label: 'Jika ... Jika Tidak ...',
  },
  { kind: 'loop_count', count: 3, label: 'Ulangi [n] kali' },
  {
    kind: 'loop_while',
    condition: 'pesanan_ada',
    label: 'Ulangi selama [kondisi]',
  },
];

let uidCounter = 1;
function createBlockFromTemplate(tpl: PaletteTemplate): ProgramBlock {
  const id = `blk-${Date.now()}-${uidCounter++}`;
  if (tpl.kind === 'action') {
    return {
      id,
      category: 'action',
      action: tpl.action,
      ingredient: tpl.action === 'ambil_bahan' ? tpl.ingredient ?? 'Utama' : undefined,
    };
  }
  if (tpl.kind === 'condition') {
    return {
      id,
      category: 'condition',
      condition: tpl.condition,
      thenBlocks: [],
      elseBlocks: [],
    };
  }
  if (tpl.kind === 'loop_count') {
    return {
      id,
      category: 'loop',
      loopMode: 'count',
      count: tpl.count,
      children: [],
    };
  }
  return {
    id,
    category: 'loop',
    loopMode: 'while',
    count: 1,
    condition: tpl.condition,
    children: [],
  };
}

function getActionIcon(action: ActionType) {
  switch (action) {
    case 'ambil_bahan':
      return <ShoppingBasket className="w-4 h-4 shrink-0" />;
    case 'potong':
      return <Scissors className="w-4 h-4 shrink-0" />;
    case 'masak':
      return <Flame className="w-4 h-4 shrink-0" />;
    case 'tata_piring':
      return <Utensils className="w-4 h-4 shrink-0" />;
    case 'sajikan':
      return <BellRing className="w-4 h-4 shrink-0" />;
  }
}

/**
 * Target penempatan blok: 'root' atau '<blockId>:then' / '<blockId>:else' / '<blockId>:loop'
 */
type ContainerTarget = string;

function insertIntoTree(
  blocks: ProgramBlock[],
  target: ContainerTarget,
  newBlock: ProgramBlock
): ProgramBlock[] {
  if (target === 'root') {
    return [...blocks, newBlock];
  }
  const [targetId, branch] = target.split(':');
  return blocks.map((b) => {
    if (b.id === targetId) {
      if (b.category === 'condition') {
        if (branch === 'then') {
          return { ...b, thenBlocks: [...b.thenBlocks, newBlock] };
        }
        return { ...b, elseBlocks: [...b.elseBlocks, newBlock] };
      }
      if (b.category === 'loop') {
        return { ...b, children: [...b.children, newBlock] };
      }
    }
    if (b.category === 'condition') {
      return {
        ...b,
        thenBlocks: insertIntoTree(b.thenBlocks, target, newBlock),
        elseBlocks: insertIntoTree(b.elseBlocks, target, newBlock),
      };
    }
    if (b.category === 'loop') {
      return {
        ...b,
        children: insertIntoTree(b.children, target, newBlock),
      };
    }
    return b;
  });
}

function updateBlockInTree(
  blocks: ProgramBlock[],
  id: string,
  updater: (b: ProgramBlock) => ProgramBlock
): ProgramBlock[] {
  return blocks.map((b) => {
    const updatedSelf = b.id === id ? updater(b) : b;
    if (updatedSelf.category === 'condition') {
      return {
        ...updatedSelf,
        thenBlocks: updateBlockInTree(updatedSelf.thenBlocks, id, updater),
        elseBlocks: updateBlockInTree(updatedSelf.elseBlocks, id, updater),
      };
    }
    if (updatedSelf.category === 'loop') {
      return {
        ...updatedSelf,
        children: updateBlockInTree(updatedSelf.children, id, updater),
      };
    }
    return updatedSelf;
  });
}

function removeBlockFromTree(
  blocks: ProgramBlock[],
  id: string
): ProgramBlock[] {
  return blocks
    .filter((b) => b.id !== id)
    .map((b) => {
      if (b.category === 'condition') {
        return {
          ...b,
          thenBlocks: removeBlockFromTree(b.thenBlocks, id),
          elseBlocks: removeBlockFromTree(b.elseBlocks, id),
        };
      }
      if (b.category === 'loop') {
        return {
          ...b,
          children: removeBlockFromTree(b.children, id),
        };
      }
      return b;
    });
}

function reorderInTree(
  blocks: ProgramBlock[],
  parentTarget: ContainerTarget,
  index: number,
  dir: -1 | 1
): ProgramBlock[] {
  if (parentTarget === 'root') {
    const nextIdx = index + dir;
    if (nextIdx < 0 || nextIdx >= blocks.length) return blocks;
    const copy = [...blocks];
    const tmp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = tmp;
    return copy;
  }

  const [targetId, branch] = parentTarget.split(':');
  return blocks.map((b) => {
    if (b.id === targetId) {
      if (b.category === 'condition') {
        const list = branch === 'then' ? [...b.thenBlocks] : [...b.elseBlocks];
        const nextIdx = index + dir;
        if (nextIdx >= 0 && nextIdx < list.length) {
          const tmp = list[index];
          list[index] = list[nextIdx];
          list[nextIdx] = tmp;
        }
        return branch === 'then'
          ? { ...b, thenBlocks: list }
          : { ...b, elseBlocks: list };
      }
      if (b.category === 'loop') {
        const list = [...b.children];
        const nextIdx = index + dir;
        if (nextIdx >= 0 && nextIdx < list.length) {
          const tmp = list[index];
          list[index] = list[nextIdx];
          list[nextIdx] = tmp;
        }
        return { ...b, children: list };
      }
    }
    if (b.category === 'condition') {
      return {
        ...b,
        thenBlocks: reorderInTree(b.thenBlocks, parentTarget, index, dir),
        elseBlocks: reorderInTree(b.elseBlocks, parentTarget, index, dir),
      };
    }
    if (b.category === 'loop') {
      return {
        ...b,
        children: reorderInTree(b.children, parentTarget, index, dir),
      };
    }
    return b;
  });
}

export const EditorScreen: React.FC<EditorScreenProps> = ({
  level,
  program,
  previousBlockCount,
  onChangeProgram,
  onRunSimulation,
  onBackToDecomposition,
}) => {
  const [activeTarget, setActiveTarget] = useState<ContainerTarget>('root');
  const [draggingTpl, setDraggingTpl] = useState<{
    template: PaletteTemplate;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null);

  const totalBlocks = countTotalBlocks(program);

  useEffect(() => {
    if (!draggingTpl) return;

    const handleMove = (e: PointerEvent) => {
      setDraggingTpl((prev) =>
        prev ? { ...prev, x: e.clientX, y: e.clientY } : null
      );
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const zoneEl = elem?.closest('[data-editor-drop]');
      setHoveredDropZone(zoneEl ? zoneEl.getAttribute('data-editor-drop') : null);
    };

    const handleUp = (e: PointerEvent) => {
      const elem = document.elementFromPoint(e.clientX, e.clientY);
      const zoneEl = elem?.closest('[data-editor-drop]');
      const target = zoneEl?.getAttribute('data-editor-drop');
      if (target) {
        const newBlock = createBlockFromTemplate(draggingTpl.template);
        playDrop();
        onChangeProgram(insertIntoTree(program, target, newBlock));
        if (newBlock.category === 'loop') {
          setActiveTarget(`${newBlock.id}:loop`);
        } else if (newBlock.category === 'condition') {
          setActiveTarget(`${newBlock.id}:then`);
        }
      }
      setDraggingTpl(null);
      setHoveredDropZone(null);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleUp);
    return () => {
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleUp);
    };
  }, [draggingTpl, program, onChangeProgram]);

  const handleAddClick = (tpl: PaletteTemplate) => {
    playDrop();
    const newBlock = createBlockFromTemplate(tpl);
    onChangeProgram(insertIntoTree(program, activeTarget, newBlock));
    if (newBlock.category === 'loop') {
      setActiveTarget(`${newBlock.id}:loop`);
    } else if (newBlock.category === 'condition') {
      setActiveTarget(`${newBlock.id}:then`);
    }
  };

  const renderBlockList = (
    blocks: ProgramBlock[],
    parentTarget: ContainerTarget
  ) => {
    if (blocks.length === 0) {
      return (
        <div className="p-3 rounded-xl border-2 border-dashed border-[#CBD5E1] text-center text-sm text-[#64748B]">
          Seret blok ke sini atau klik blok di palet
        </div>
      );
    }

    return (
      <div className="space-y-2.5">
        {blocks.map((block, index) => {
          if (block.category === 'action') {
            return (
              <div
                key={block.id}
                className="p-3 rounded-xl bg-[#EFF6FF] border-2 border-[#2563EB] text-[#1E3A8A] flex flex-wrap items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 font-bold text-base">
                  {getActionIcon(block.action)}
                  <span>{ACTION_LABELS[block.action]}</span>
                  {block.action === 'ambil_bahan' && (
                    <select
                      aria-label="Pilih jenis bahan"
                      value={block.ingredient ?? 'Utama'}
                      onChange={(e) => {
                        playClick();
                        const val = e.target.value as IngredientType;
                        onChangeProgram(
                          updateBlockInTree(program, block.id, (b) =>
                            b.category === 'action' ? { ...b, ingredient: val } : b
                          )
                        );
                      }}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white border-2 border-[#93C5FD] text-[#1E3A8A] font-bold text-sm cursor-pointer"
                    >
                      <option value="Utama">Utama</option>
                      <option value="Sayur">Sayur</option>
                      <option value="Cabai">Cabai</option>
                      <option value="Stok Gudang">Stok Gudang</option>
                      <option value="Garnish VIP">Garnish VIP</option>
                    </select>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onChangeProgram(reorderInTree(program, parentTarget, index, -1));
                    }}
                    disabled={index === 0}
                    aria-label="Geser ke atas"
                    className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onChangeProgram(reorderInTree(program, parentTarget, index, 1));
                    }}
                    disabled={index === blocks.length - 1}
                    aria-label="Geser ke bawah"
                    className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-[#93C5FD] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onChangeProgram(removeBlockFromTree(program, block.id));
                    }}
                    aria-label="Hapus blok"
                    className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-red-300 text-red-600 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }

          if (block.category === 'condition') {
            const thenTarget = `${block.id}:then`;
            const elseTarget = `${block.id}:else`;
            return (
              <div
                key={block.id}
                className="p-3.5 rounded-xl bg-[#F5F3FF] border-2 border-[#7C3AED] text-[#4C1D95] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2 font-bold text-base">
                    <GitBranch className="w-4 h-4 shrink-0" />
                    <span>Jika</span>
                    <select
                      aria-label="Pilih kondisi If-Else"
                      value={block.condition}
                      onChange={(e) => {
                        playClick();
                        const cond = e.target.value as ConditionType;
                        onChangeProgram(
                          updateBlockInTree(program, block.id, (b) =>
                            b.category === 'condition' ? { ...b, condition: cond } : b
                          )
                        );
                      }}
                      className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white border-2 border-[#C4B5FD] text-[#4C1D95] font-bold text-sm cursor-pointer"
                    >
                      <option value="bahan_tersedia">bahan tersedia</option>
                      <option value="bahan_habis">bahan habis</option>
                      <option value="pesanan_vip">pesanan VIP</option>
                      <option value="pesanan_pedas">pesanan pedas</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        onChangeProgram(reorderInTree(program, parentTarget, index, -1));
                      }}
                      disabled={index === 0}
                      aria-label="Geser kondisi ke atas"
                      className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-[#C4B5FD] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        onChangeProgram(reorderInTree(program, parentTarget, index, 1));
                      }}
                      disabled={index === blocks.length - 1}
                      aria-label="Geser kondisi ke bawah"
                      className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-[#C4B5FD] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        if (activeTarget === thenTarget || activeTarget === elseTarget) {
                          setActiveTarget('root');
                        }
                        onChangeProgram(removeBlockFromTree(program, block.id));
                      }}
                      aria-label="Hapus blok kondisi"
                      className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-red-300 text-red-600 flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Cabang Jika (Then) */}
                <div
                  data-editor-drop={thenTarget}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTarget(thenTarget);
                  }}
                  className={`p-3 rounded-xl bg-white/90 border-2 transition-colors cursor-pointer ${
                    hoveredDropZone === thenTarget || activeTarget === thenTarget
                      ? 'border-[#7C3AED] ring-2 ring-[#C4B5FD]'
                      : 'border-[#DDD6FE]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#5B21B6]">
                      Maka jalankan (Jika Benar):
                    </span>
                    {activeTarget === thenTarget && (
                      <span className="text-xs font-bold text-[#EA580C]">
                        Target Aktif
                      </span>
                    )}
                  </div>
                  {renderBlockList(block.thenBlocks, thenTarget)}
                </div>

                {/* Cabang Jika Tidak (Else) */}
                <div
                  data-editor-drop={elseTarget}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTarget(elseTarget);
                  }}
                  className={`p-3 rounded-xl bg-white/90 border-2 transition-colors cursor-pointer ${
                    hoveredDropZone === elseTarget || activeTarget === elseTarget
                      ? 'border-[#7C3AED] ring-2 ring-[#C4B5FD]'
                      : 'border-[#DDD6FE]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-extrabold text-[#5B21B6]">
                      Jika Tidak (opsional):
                    </span>
                    {activeTarget === elseTarget && (
                      <span className="text-xs font-bold text-[#EA580C]">
                        Target Aktif
                      </span>
                    )}
                  </div>
                  {renderBlockList(block.elseBlocks, elseTarget)}
                </div>
              </div>
            );
          }

          // Blok Perulangan (Loop)
          const loopTarget = `${block.id}:loop`;
          return (
            <div
              key={block.id}
              className="p-3.5 rounded-xl bg-[#ECFDF5] border-2 border-[#059669] text-[#064E3B] space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2 font-bold text-base">
                  <Repeat className="w-4 h-4 shrink-0" />
                  {block.loopMode === 'count' ? (
                    <>
                      <span>Ulangi</span>
                      <div className="inline-flex items-center bg-white border-2 border-[#6EE7B7] rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => {
                            playClick();
                            onChangeProgram(
                              updateBlockInTree(program, block.id, (b) =>
                                b.category === 'loop'
                                  ? { ...b, count: Math.max(1, b.count - 1) }
                                  : b
                              )
                            );
                          }}
                          aria-label="Kurangi jumlah pengulangan"
                          className="min-w-[34px] min-h-[34px] flex items-center justify-center hover:bg-emerald-50 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={20}
                          aria-label="Jumlah pengulangan"
                          value={block.count}
                          onChange={(e) => {
                            const n = Math.max(
                              1,
                              Math.min(20, Number(e.target.value) || 1)
                            );
                            onChangeProgram(
                              updateBlockInTree(program, block.id, (b) =>
                                b.category === 'loop' ? { ...b, count: n } : b
                              )
                            );
                          }}
                          className="w-12 text-center font-mono-num font-bold text-sm focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            playClick();
                            onChangeProgram(
                              updateBlockInTree(program, block.id, (b) =>
                                b.category === 'loop'
                                  ? { ...b, count: Math.min(20, b.count + 1) }
                                  : b
                              )
                            );
                          }}
                          aria-label="Tambah jumlah pengulangan"
                          className="min-w-[34px] min-h-[34px] flex items-center justify-center hover:bg-emerald-50 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span>kali</span>
                    </>
                  ) : (
                    <>
                      <span>Ulangi selama</span>
                      <select
                        aria-label="Kondisi perulangan"
                        value={block.condition ?? 'pesanan_ada'}
                        onChange={(e) => {
                          playClick();
                          const cond = e.target.value as ConditionType;
                          onChangeProgram(
                            updateBlockInTree(program, block.id, (b) =>
                              b.category === 'loop' ? { ...b, condition: cond } : b
                            )
                          );
                        }}
                        className="min-h-[36px] px-2.5 py-1 rounded-lg bg-white border-2 border-[#6EE7B7] text-[#064E3B] font-bold text-sm cursor-pointer"
                      >
                        <option value="pesanan_ada">
                          {CONDITION_LABELS.pesanan_ada}
                        </option>
                        <option value="bahan_tersedia">
                          {CONDITION_LABELS.bahan_tersedia}
                        </option>
                      </select>
                    </>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onChangeProgram(reorderInTree(program, parentTarget, index, -1));
                    }}
                    disabled={index === 0}
                    aria-label="Geser loop ke atas"
                    className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-[#6EE7B7] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      onChangeProgram(reorderInTree(program, parentTarget, index, 1));
                    }}
                    disabled={index === blocks.length - 1}
                    aria-label="Geser loop ke bawah"
                    className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-[#6EE7B7] flex items-center justify-center disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      playClick();
                      if (activeTarget === loopTarget) setActiveTarget('root');
                      onChangeProgram(removeBlockFromTree(program, block.id));
                    }}
                    aria-label="Hapus blok loop"
                    className="min-w-[34px] min-h-[34px] rounded-lg bg-white border border-red-300 text-red-600 flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Isi Loop */}
              <div
                data-editor-drop={loopTarget}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTarget(loopTarget);
                }}
                className={`p-3 rounded-xl bg-white/90 border-2 transition-colors cursor-pointer ${
                  hoveredDropZone === loopTarget || activeTarget === loopTarget
                    ? 'border-[#059669] ring-2 ring-[#6EE7B7]'
                    : 'border-[#A7F3D0]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold text-[#065F46]">
                    Langkah di dalam Perulangan:
                  </span>
                  {activeTarget === loopTarget && (
                    <span className="text-xs font-bold text-[#EA580C]">
                      Target Aktif
                    </span>
                  )}
                </div>
                {renderBlockList(block.children, loopTarget)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Header Editor */}
      <div className="chef-card p-5 bg-white flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-bold text-[#EA580C]">
            Tahap 2 · Editor Program Robot Koki (Level {level.id}: {level.title})
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-[#14284B]">
            Susun instruksi agar robot menyelesaikan pesanan tepat waktu.
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              playClick();
              onBackToDecomposition();
            }}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-base flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Dekomposisi</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onChangeProgram([]);
              setActiveTarget('root');
            }}
            className="chef-btn-secondary min-h-[44px] px-4 py-2 rounded-xl font-bold text-base flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            onClick={() => {
              playClick();
              onRunSimulation();
            }}
            className="chef-btn-primary min-h-[44px] px-6 py-2 rounded-xl font-display font-extrabold text-base flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Jalankan</span>
          </button>
        </div>
      </div>

      {/* Layout 3 Zona: Kiri Palet | Tengah Area Program | Kanan Robot & Metrik */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* KIRI: Palet Blok */}
        <aside className="lg:col-span-3 chef-card p-5 bg-white space-y-4">
          <div>
            <h2 className="font-display text-lg font-extrabold text-[#14284B]">
              Palet Blok Instruksi
            </h2>
            <p className="text-xs text-[#4A5B78] mt-0.5">
              Seret ke area program atau klik untuk menambahkan ke target aktif.
            </p>
          </div>

          {/* Blok Aksi (Biru) */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-[#1E3A8A]">
              Blok Aksi (Biru)
            </div>
            {PALETTE_ITEMS.filter((p) => p.kind === 'action').map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onPointerDown={(e) => {
                  // Mulai drag hanya jika digerakkan, atau klik biasa langsung tambah
                  const startX = e.clientX;
                  const startY = e.clientY;
                  let moved = false;
                  const onMove = (me: PointerEvent) => {
                    if (
                      Math.abs(me.clientX - startX) > 8 ||
                      Math.abs(me.clientY - startY) > 8
                    ) {
                      moved = true;
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      setDraggingTpl({
                        template: tpl,
                        x: me.clientX,
                        y: me.clientY,
                      });
                    }
                  };
                  const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    if (!moved) {
                      handleAddClick(tpl);
                    }
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
                className="touch-drag-item w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#EFF6FF] hover:bg-[#DBEAFE] border-2 border-[#2563EB] text-[#1E3A8A] font-bold text-sm flex items-center gap-2.5 text-left cursor-grab active:cursor-grabbing"
              >
                {tpl.kind === 'action' && getActionIcon(tpl.action)}
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>

          {/* Blok Kondisi (Ungu) */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-[#4C1D95]">
              Blok Kondisi (Ungu)
            </div>
            {PALETTE_ITEMS.filter((p) => p.kind === 'condition').map(
              (tpl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onPointerDown={(e) => {
                    const startX = e.clientX;
                    const startY = e.clientY;
                    let moved = false;
                    const onMove = (me: PointerEvent) => {
                      if (
                        Math.abs(me.clientX - startX) > 8 ||
                        Math.abs(me.clientY - startY) > 8
                      ) {
                        moved = true;
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                        setDraggingTpl({
                          template: tpl,
                          x: me.clientX,
                          y: me.clientY,
                        });
                      }
                    };
                    const onUp = () => {
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      if (!moved) {
                        handleAddClick(tpl);
                      }
                    };
                    window.addEventListener('pointermove', onMove);
                    window.addEventListener('pointerup', onUp);
                  }}
                  className="touch-drag-item w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#F5F3FF] hover:bg-[#EDE9FE] border-2 border-[#7C3AED] text-[#4C1D95] font-bold text-sm flex items-center gap-2.5 text-left cursor-grab active:cursor-grabbing"
                >
                  <GitBranch className="w-4 h-4 shrink-0" />
                  <span>{tpl.label}</span>
                </button>
              )
            )}
          </div>

          {/* Blok Perulangan (Hijau) */}
          <div className="space-y-2">
            <div className="text-xs font-extrabold text-[#064E3B]">
              Blok Perulangan (Hijau)
            </div>
            {PALETTE_ITEMS.filter(
              (p) => p.kind === 'loop_count' || p.kind === 'loop_while'
            ).map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onPointerDown={(e) => {
                  const startX = e.clientX;
                  const startY = e.clientY;
                  let moved = false;
                  const onMove = (me: PointerEvent) => {
                    if (
                      Math.abs(me.clientX - startX) > 8 ||
                      Math.abs(me.clientY - startY) > 8
                    ) {
                      moved = true;
                      window.removeEventListener('pointermove', onMove);
                      window.removeEventListener('pointerup', onUp);
                      setDraggingTpl({
                        template: tpl,
                        x: me.clientX,
                        y: me.clientY,
                      });
                    }
                  };
                  const onUp = () => {
                    window.removeEventListener('pointermove', onMove);
                    window.removeEventListener('pointerup', onUp);
                    if (!moved) {
                      handleAddClick(tpl);
                    }
                  };
                  window.addEventListener('pointermove', onMove);
                  window.addEventListener('pointerup', onUp);
                }}
                className="touch-drag-item w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] border-2 border-[#059669] text-[#064E3B] font-bold text-sm flex items-center gap-2.5 text-left cursor-grab active:cursor-grabbing"
              >
                <Repeat className="w-4 h-4 shrink-0" />
                <span>{tpl.label}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* TENGAH: Area Program Utama */}
        <section
          data-editor-drop="root"
          onClick={() => setActiveTarget('root')}
          className={`lg:col-span-6 chef-card p-5 transition-colors min-h-[440px] ${
            hoveredDropZone === 'root' || activeTarget === 'root'
              ? 'bg-white border-[#EA580C]'
              : 'bg-white'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b-2 border-[#E5D9C5]">
            <div>
              <h2 className="font-display text-lg font-extrabold text-[#14284B]">
                Area Program Robot
              </h2>
              <p className="text-xs text-[#4A5B78]">
                Klik bagian luar untuk memilih program utama, atau klik kotak di dalam Loop/If untuk bersarang.
              </p>
            </div>
            {activeTarget === 'root' ? (
              <span className="text-xs font-extrabold text-[#EA580C]">
                Target: Program Utama
              </span>
            ) : (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveTarget('root');
                }}
                className="text-xs font-bold text-[#2563EB] underline cursor-pointer"
              >
                Kembali ke Program Utama
              </button>
            )}
          </div>

          {renderBlockList(program, 'root')}
        </section>

        {/* KANAN: Atas (Robot & Pratinjau Dapur) + Bawah (Penghitung Blok & Timer) */}
        <aside className="lg:col-span-3 space-y-5">
          {/* Kanan Atas: Robot Koki & Pratinjau Dapur */}
          <div className="chef-card p-5 bg-[#FFF8EE] text-center space-y-3">
            <div className="text-sm font-extrabold text-[#14284B]">
              Pratinjau Robot &amp; Dapur
            </div>
            <div className="bg-white border-2 border-[#E5D9C5] rounded-2xl p-4 flex flex-col items-center">
              <ChefRobotSvg mood="idle" className="w-28 h-28" />
              <div className="mt-2 flex items-center gap-3 text-xl" aria-hidden="true">
                <span title="Rak Bahan">🧺</span>
                <span title="Talenan">🔪</span>
                <span title="Kompor">🍳</span>
                <span title="Piring">🍽️</span>
                <span title="Loket Saji">🛎️</span>
              </div>
            </div>
            <div className="text-xs text-[#4A5B78] font-semibold">
              Menu: {level.recipeEmoji} {level.recipeName} ({level.targetPortions} porsi)
            </div>
          </div>

          {/* Kanan Bawah: Penghitung Blok & Timer */}
          <div className="chef-card p-5 bg-white space-y-4">
            <h2 className="font-display text-lg font-extrabold text-[#14284B]">
              Penghitung &amp; Target
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#FFF8EE] border border-[#E5D9C5] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#4A5B78]">
                  <Layers className="w-4 h-4 text-[#EA580C]" />
                  <span>Jumlah Blok</span>
                </div>
                <span className="font-mono-num text-xl font-black text-[#14284B]">
                  {totalBlocks}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#064E3B]">
                  <Target className="w-4 h-4 text-[#059669]" />
                  <span>Blok Optimal</span>
                </div>
                <span className="font-mono-num text-xl font-black text-[#064E3B]">
                  &le; {level.optimalBlockCount}
                </span>
              </div>

              {previousBlockCount !== null && (
                <div className="p-3 rounded-xl bg-[#EFF6FF] border border-[#BFDBFE] text-xs font-bold text-[#1E3A8A]">
                  Percobaan sebelumnya: <span className="font-mono-num">{previousBlockCount} blok</span>.{' '}
                  {totalBlocks < previousBlockCount
                    ? 'Lebih ringkas!'
                    : totalBlocks === previousBlockCount
                      ? 'Sama seperti sebelumnya.'
                      : 'Coba ringkas lagi dengan Loop!'}
                </div>
              )}

              <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-[#4A5B78]">
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <span>Batas Waktu</span>
                </div>
                <span className="font-mono-num text-xl font-black text-[#14284B]">
                  {level.timeLimitSeconds} dtk
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Floating Ghost Saat Dragging Blok dari Palet */}
      {draggingTpl && (
        <div
          className="fixed z-50 pointer-events-none px-4 py-2 rounded-xl bg-[#14284B] text-white font-bold shadow-lg text-sm"
          style={{ left: draggingTpl.x + 12, top: draggingTpl.y + 12 }}
        >
          + {draggingTpl.template.label}
        </div>
      )}
    </main>
  );
};
