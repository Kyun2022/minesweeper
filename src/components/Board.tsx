import React from 'react';
import Cell from './Cell';
import './Board.css';

interface BoardProps {
  board: {
    row: number;
    col: number;
    isMine: boolean;
    isRevealed: boolean;
    isFlagged: boolean;
    neighborMines: number;
  }[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (e: React.MouseEvent, row: number, col: number) => void;
}

const Board: React.FC<BoardProps> = ({ board, onCellClick, onCellRightClick }) => {
  if (!board.length) return <div>ボードを読み込み中...</div>;

  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="board-row">
          {row.map((cell) => (
            <Cell
              key={`cell-${cell.row}-${cell.col}`}
              cell={cell}
              onClick={() => onCellClick(cell.row, cell.col)}
              onRightClick={(e) => onCellRightClick(e, cell.row, cell.col)}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Board;
