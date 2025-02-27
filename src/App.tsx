import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Board from './components/Board';
import { generateBoard, revealCell, flagCell, checkWin } from './utils/gameLogic';

// ゲームの難易度設定
const DIFFICULTY = {
  EASY: { rows: 9, cols: 9, mines: 10 },
  MEDIUM: { rows: 16, cols: 16, mines: 40 },
  HARD: { rows: 16, cols: 30, mines: 99 }
};

// ゲームの状態
type GameStatus = 'playing' | 'won' | 'lost';

function App() {
  const [difficulty, setDifficulty] = useState(DIFFICULTY.EASY);
  const [board, setBoard] = useState<any[][]>([]);
  const [gameStatus, setGameStatus] = useState<GameStatus>('playing');
  const [minesLeft, setMinesLeft] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  // 新しいゲームを開始
  const startNewGame = useCallback((diff = difficulty) => {
    const newBoard = generateBoard(diff.rows, diff.cols, diff.mines);
    setBoard(newBoard);
    setGameStatus('playing');
    setMinesLeft(diff.mines);
    setTimer(0);
    setIsFirstClick(true);

    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  }, [difficulty, timerInterval]);

  // 難易度変更時に新しいゲームを開始
  const changeDifficulty = (diff: keyof typeof DIFFICULTY) => {
    setDifficulty(DIFFICULTY[diff]);
    startNewGame(DIFFICULTY[diff]);
  };

  // セルをクリックした時の処理
  const handleCellClick = (row: number, col: number) => {
    if (gameStatus !== 'playing' || board[row][col].isRevealed || board[row][col].isFlagged) {
      return;
    }

    // 最初のクリック時にタイマーを開始
    if (isFirstClick) {
      setIsFirstClick(false);
      const interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
      setTimerInterval(interval);
    }

    const newBoard = revealCell(board, row, col);
    setBoard([...newBoard]);

    // 地雷をクリックした場合
    if (newBoard[row][col].isMine) {
      setGameStatus('lost');
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }

      // すべての地雷を表示
      const revealedBoard = newBoard.map(row =>
        row.map(cell => ({
          ...cell,
          isRevealed: cell.isMine ? true : cell.isRevealed
        }))
      );
      setBoard(revealedBoard);
      return;
    }

    // 勝利条件をチェック
    if (checkWin(newBoard)) {
      setGameStatus('won');
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
    }
  };

  // 右クリックでフラグを立てる
  const handleCellRightClick = (e: React.MouseEvent, row: number, col: number) => {
    e.preventDefault();
    if (gameStatus !== 'playing' || board[row][col].isRevealed) {
      return;
    }

    const newBoard = flagCell(board, row, col);
    setBoard([...newBoard]);

    // フラグの数を更新
    const flaggedCount = newBoard.flat().filter(cell => cell.isFlagged).length;
    setMinesLeft(difficulty.mines - flaggedCount);
  };

  // コンポーネントがマウントされた時に新しいゲームを開始
  useEffect(() => {
    startNewGame();
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [startNewGame, timerInterval]);

  return (
    <div className="App">
      <h1>マインスイーパー</h1>

      <div className="controls">
        <div className="difficulty-buttons">
          <button type="button" onClick={() => changeDifficulty('EASY')} className={difficulty === DIFFICULTY.EASY ? 'active' : ''}>
            初級
          </button>
          <button type="button" onClick={() => changeDifficulty('MEDIUM')} className={difficulty === DIFFICULTY.MEDIUM ? 'active' : ''}>
            中級
          </button>
          <button type="button" onClick={() => changeDifficulty('HARD')} className={difficulty === DIFFICULTY.HARD ? 'active' : ''}>
            上級
          </button>
        </div>

        <button type="button" className="new-game" onClick={() => startNewGame()}>
          新しいゲーム
        </button>
      </div>

      <div className="game-info">
        <div className="mines-left">🚩 {minesLeft}</div>
        <div className="game-status">
          {gameStatus === 'playing' ? '😊' : gameStatus === 'won' ? '😎' : '😵'}
        </div>
        <div className="timer">⏱️ {timer}</div>
      </div>

      <Board
        board={board}
        onCellClick={handleCellClick}
        onCellRightClick={handleCellRightClick}
      />

      {gameStatus === 'won' && <div className="message win">おめでとうございます！勝利しました！</div>}
      {gameStatus === 'lost' && <div className="message lose">ゲームオーバー！もう一度挑戦してください。</div>}
    </div>
  );
}

export default App;
