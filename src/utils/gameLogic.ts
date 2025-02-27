// セルの型定義
interface Cell {
	row: number;
	col: number;
	isMine: boolean;
	isRevealed: boolean;
	isFlagged: boolean;
	neighborMines: number;
}

// ボードを生成する関数
export const generateBoard = (
	rows: number,
	cols: number,
	mines: number,
): Cell[][] => {
	// 空のボードを作成
	const board: Cell[][] = Array(rows)
		.fill(null)
		.map((_, rowIndex) =>
			Array(cols)
				.fill(null)
				.map((_, colIndex) => ({
					row: rowIndex,
					col: colIndex,
					isMine: false,
					isRevealed: false,
					isFlagged: false,
					neighborMines: 0,
				})),
		);

	// 地雷をランダムに配置
	let minesPlaced = 0;
	while (minesPlaced < mines) {
		const randomRow = Math.floor(Math.random() * rows);
		const randomCol = Math.floor(Math.random() * cols);

		if (!board[randomRow][randomCol].isMine) {
			board[randomRow][randomCol].isMine = true;
			minesPlaced++;
		}
	}

	// 各セルの周囲の地雷数を計算
	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			if (!board[row][col].isMine) {
				board[row][col].neighborMines = countNeighborMines(board, row, col);
			}
		}
	}

	return board;
};

// 周囲の地雷数を数える関数
const countNeighborMines = (
	board: Cell[][],
	row: number,
	col: number,
): number => {
	const directions = [
		[-1, -1],
		[-1, 0],
		[-1, 1],
		[0, -1],
		[0, 1],
		[1, -1],
		[1, 0],
		[1, 1],
	];

	return directions.reduce((count, [dx, dy]) => {
		const newRow = row + dx;
		const newCol = col + dy;

		if (
			newRow >= 0 &&
			newRow < board.length &&
			newCol >= 0 &&
			newCol < board[0].length &&
			board[newRow][newCol].isMine
		) {
			return count + 1;
		}

		return count;
	}, 0);
};

// セルを開く関数
export const revealCell = (
	board: Cell[][],
	row: number,
	col: number,
): Cell[][] => {
	// ディープコピーを作成
	const newBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

	// すでに開かれているか、フラグが立っている場合は何もしない
	if (newBoard[row][col].isRevealed || newBoard[row][col].isFlagged) {
		return newBoard;
	}

	// セルを開く
	newBoard[row][col].isRevealed = true;

	// 地雷の場合はここで終了
	if (newBoard[row][col].isMine) {
		return newBoard;
	}

	// 周囲に地雷がない場合は、周囲のセルも再帰的に開く
	if (newBoard[row][col].neighborMines === 0) {
		const directions = [
			[-1, -1],
			[-1, 0],
			[-1, 1],
			[0, -1],
			[0, 1],
			[1, -1],
			[1, 0],
			[1, 1],
		];

		directions.forEach(([dx, dy]) => {
			const newRow = row + dx;
			const newCol = col + dy;

			if (
				newRow >= 0 &&
				newRow < newBoard.length &&
				newCol >= 0 &&
				newCol < newBoard[0].length &&
				!newBoard[newRow][newCol].isRevealed &&
				!newBoard[newRow][newCol].isFlagged
			) {
				// 再帰的に周囲のセルを開く
				const updatedBoard = revealCell(newBoard, newRow, newCol);
				// 更新されたボードの状態をコピー
				for (let r = 0; r < newBoard.length; r++) {
					for (let c = 0; c < newBoard[0].length; c++) {
						newBoard[r][c] = updatedBoard[r][c];
					}
				}
			}
		});
	}

	return newBoard;
};

// フラグを立てる/外す関数
export const flagCell = (
	board: Cell[][],
	row: number,
	col: number,
): Cell[][] => {
	// ディープコピーを作成
	const newBoard = JSON.parse(JSON.stringify(board)) as Cell[][];

	// すでに開かれている場合は何もしない
	if (newBoard[row][col].isRevealed) {
		return newBoard;
	}

	// フラグを切り替える
	newBoard[row][col].isFlagged = !newBoard[row][col].isFlagged;

	return newBoard;
};

// 勝利条件をチェックする関数
export const checkWin = (board: Cell[][]): boolean => {
	for (let row = 0; row < board.length; row++) {
		for (let col = 0; col < board[0].length; col++) {
			// 地雷以外のセルで、まだ開かれていないものがある場合は勝利していない
			if (!board[row][col].isMine && !board[row][col].isRevealed) {
				return false;
			}
		}
	}

	return true;
};
