import React from 'react';
import './Cell.css';

interface CellProps {
  cell: {
    row: number;
    col: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
  };
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
}

const Cell: React.FC<CellProps> = ({ cell, onClick, onRightClick }) => {
  const getCellContent = () => {
    if (cell.isFlagged) {
      return '🚩';
    }

    if (!cell.isRevealed) {
      return null;
    }

    if (cell.isMine) {
      return '💣';
    }

    if (cell.neighborMines === 0) {
      return null;
    }

    return cell.neighborMines;
  };

  const getCellClass = () => {
    let className = 'cell';

    if (cell.isRevealed) {
      className += ' revealed';

      if (cell.isMine) {
        className += ' mine';
      } else {
        className += ` neighbors-${cell.neighborMines}`;
      }
    }

    if (cell.isFlagged) {
      className += ' flagged';
    }

    return className;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      onClick();
    }
  };

  return (
    <div
      className={getCellClass()}
      onClick={onClick}
      onKeyDown={handleKeyPress}
      onContextMenu={onRightClick}
      role="button"
      tabIndex={0}
      aria-label={`セル ${cell.row + 1}行 ${cell.col + 1}列 ${cell.isRevealed ? (cell.isMine ? '地雷' : cell.neighborMines === 0 ? '空白' : `周囲に${cell.neighborMines}個の地雷`) : cell.isFlagged ? 'フラグ付き' : '未開封'}`}
    >
      {getCellContent()}
    </div>
  );
};

export default Cell;
