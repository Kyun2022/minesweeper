'use client';

import { useState, useEffect } from 'react';
import Cell from './Cell';

// セルの状態を表す型
type CellState = {
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
};

// ゲームの難易度設定
type Difficulty = {
  rows: number;
  cols: number;
  mines: number;
};

const difficulties: Record<string, Difficulty> = {
  easy: { rows: 9, cols: 9, mines: 10 },
  medium: { rows: 16, cols: 16, mines: 40 },
  hard: { rows: 16, cols: 30, mines: 99 },
};

export default function Minesweeper() {
  const [difficulty, setDifficulty] = useState<string>('easy');
  const [board, setBoard] = useState<CellState[][]>([]);
  const [gameStatus, setGameStatus] = useState<'ready' | 'playing' | 'won' | 'lost'>('ready');
  const [minesLeft, setMinesLeft] = useState<number>(difficulties[difficulty].mines);
  const [timer, setTimer] = useState<number>(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  const [flagMode, setFlagMode] = useState<boolean>(false);

  // ゲームの初期化
  const initializeGame = () => {
    const { rows, cols, mines } = difficulties[difficulty];

    // 空のボードを作成
    const newBoard: CellState[][] = Array(rows).fill(null).map(() =>
      Array(cols).fill(null).map(() => ({
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      }))
    );

    // 地雷をランダムに配置
    let minesPlaced = 0;
    while (minesPlaced < mines) {
      const row = Math.floor(Math.random() * rows);
      const col = Math.floor(Math.random() * cols);

      if (!newBoard[row][col].isMine) {
        newBoard[row][col].isMine = true;
        minesPlaced++;
      }
    }

    // 各セルの周囲の地雷数を計算
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (newBoard[row][col].isMine) continue;

        let count = 0;
        // 周囲8マスをチェック
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
            if (r === row && c === col) continue;
            if (newBoard[r][c].isMine) count++;
          }
        }

        newBoard[row][col].neighborMines = count;
      }
    }

    setBoard(newBoard);
    setGameStatus('ready');
    setMinesLeft(mines);
    setTimer(0);
    setFlagMode(false);

    // タイマーをリセット
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  // ゲームを開始する
  const startGame = () => {
    if (gameStatus !== 'ready') return;

    setGameStatus('playing');

    // タイマーを開始
    const interval = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);

    setTimerInterval(interval);
  };

  // コンポーネントがマウントされたときにゲームを初期化
  useEffect(() => {
    initializeGame();

    // クリーンアップ関数
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [difficulty]);

  // セルをクリックした時の処理
  const handleCellClick = (row: number, col: number) => {
    // フラグモードがオンの場合はフラグを切り替える
    if (flagMode) {
      toggleFlag(row, col);
      return;
    }

    // 通常モードではセルを開く
    revealCell(row, col);
  };

  // セルを開く処理
  const revealCell = (row: number, col: number) => {
    // ゲームがready状態の場合、最初のクリックでゲームを開始
    if (gameStatus === 'ready') {
      startGame();
    }

    if (gameStatus !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    const newBoard = [...board];

    // 地雷を踏んだ場合
    if (newBoard[row][col].isMine) {
      // すべての地雷を表示
      for (let r = 0; r < newBoard.length; r++) {
        for (let c = 0; c < newBoard[0].length; c++) {
          if (newBoard[r][c].isMine) {
            newBoard[r][c].isRevealed = true;
          }
        }
      }

      setBoard(newBoard);
      setGameStatus('lost');

      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      return;
    }

    // セルを開く
    revealCellRecursive(newBoard, row, col);

    setBoard(newBoard);

    // 勝利条件をチェック
    checkWinCondition(newBoard);
  };

  // 再帰的にセルを開く（周囲に地雷がない場合）
  const revealCellRecursive = (board: CellState[][], row: number, col: number) => {
    const { rows, cols } = difficulties[difficulty];

    if (row < 0 || row >= rows || col < 0 || col >= cols || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    board[row][col].isRevealed = true;

    // 周囲に地雷がない場合は周囲のセルも開く
    if (board[row][col].neighborMines === 0) {
      for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
        for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
          if (r === row && c === col) continue;
          revealCellRecursive(board, r, c);
        }
      }
    }
  };

  // フラグを立てる/外す処理
  const toggleFlag = (row: number, col: number) => {
    if ((gameStatus !== 'playing' && gameStatus !== 'ready') || board[row][col].isRevealed) {
      return;
    }

    // ゲームがready状態の場合、最初のアクションでゲームを開始
    if (gameStatus === 'ready') {
      startGame();
    }

    const newBoard = [...board];
    const cell = newBoard[row][col];

    // フラグを切り替え
    cell.isFlagged = !cell.isFlagged;

    // 残りの地雷数を更新
    setMinesLeft(prev => cell.isFlagged ? prev - 1 : prev + 1);

    setBoard(newBoard);
  };

  // フラグモードを切り替える
  const toggleFlagMode = () => {
    setFlagMode(prev => !prev);
  };

  // 勝利条件のチェック
  const checkWinCondition = (board: CellState[][]) => {
    const { rows, cols, mines } = difficulties[difficulty];

    // 地雷以外のすべてのセルが開かれているかチェック
    let revealedCount = 0;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (board[row][col].isRevealed && !board[row][col].isMine) {
          revealedCount++;
        }
      }
    }

    // 地雷以外のすべてのセルが開かれていれば勝利
    if (revealedCount === rows * cols - mines) {
      setGameStatus('won');

      // すべての地雷にフラグを立てる
      const newBoard = [...board];
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (newBoard[row][col].isMine) {
            newBoard[row][col].isFlagged = true;
          }
        }
      }

      setBoard(newBoard);
      setMinesLeft(0);

      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  // 難易度変更ハンドラ
  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDifficulty(e.target.value);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="mb-4 flex items-center justify-between w-full max-w-md">
        <div className="bg-gray-800 text-white px-3 py-1 rounded">
          残り地雷: {minesLeft}
        </div>

        <select
          value={difficulty}
          onChange={handleDifficultyChange}
          className="px-3 py-1 rounded border border-gray-300"
        >
          <option value="easy">初級</option>
          <option value="medium">中級</option>
          <option value="hard">上級</option>
        </select>

        <div className="bg-gray-800 text-white px-3 py-1 rounded">
          時間: {timer}秒
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <button
          onClick={initializeGame}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          type="button"
        >
          リセット
        </button>

        {gameStatus === 'ready' && (
          <button
            onClick={startGame}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            type="button"
          >
            スタート
          </button>
        )}

        <button
          onClick={toggleFlagMode}
          className={`px-4 py-2 rounded ${flagMode ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'} text-white`}
          type="button"
        >
          {flagMode ? '🚩 フラグモード: オン' : '🚩 フラグモード: オフ'}
        </button>
      </div>

      {gameStatus === 'won' && (
        <div className="mb-4 text-green-600 font-bold text-xl">
          おめでとうございます！勝利しました！
        </div>
      )}

      {gameStatus === 'lost' && (
        <div className="mb-4 text-red-600 font-bold text-xl">
          ゲームオーバー！地雷を踏みました！
        </div>
      )}

      <div className="border-4 border-gray-700 bg-gray-200">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="flex">
            {row.map((cell, colIndex) => (
              <Cell
                key={`${rowIndex}-${colIndex}`}
                state={cell}
                onClick={() => handleCellClick(rowIndex, colIndex)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  toggleFlag(rowIndex, colIndex);
                }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
