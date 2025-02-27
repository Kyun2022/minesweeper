'use client';

import React from 'react';

type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

type CellProps = {
  state: CellState;
  onClick: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
};

// 数字の色を決める関数
const getNumberColor = (num: number): string => {
  const colors = [
    '', // 0は表示しない
    'text-blue-600',       // 1
    'text-green-600',      // 2
    'text-red-600',        // 3
    'text-purple-800',     // 4
    'text-red-800',        // 5
    'text-teal-600',       // 6
    'text-black',          // 7
    'text-gray-600'        // 8
  ];

  return colors[num] || '';
};

export default function Cell({ state, onClick, onContextMenu }: CellProps) {
  const getCellContent = () => {
    if (state.isFlagged) {
      return <span className="text-red-600">🚩</span>;
    }

    if (!state.isRevealed) {
      return null;
    }

    if (state.isMine) {
      return <span>💣</span>;
    }

    if (state.neighborMines === 0) {
      return null;
    }

    return (
      <span className={`font-bold ${getNumberColor(state.neighborMines)}`}>
        {state.neighborMines}
      </span>
    );
  };

  const getCellClass = () => {
    let baseClass = "w-8 h-8 flex items-center justify-center text-center border border-gray-400 ";

    if (!state.isRevealed) {
      return baseClass + "bg-gray-300 hover:bg-gray-400 cursor-pointer";
    }

    if (state.isMine) {
      return baseClass + "bg-red-200";
    }

    return baseClass + "bg-gray-100";
  };

  return (
    <div
      className={getCellClass()}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {getCellContent()}
    </div>
  );
}
