# Pawns vs. Peices 

A simplified chess-style game built to help learn how chess pieces move and how positions work.

## What it is
Two sides play with different goals:

- **Pawn Team (White):** a row of pawns trying to reach the last rank.
- **Pieces Team (Black):** a custom set of pieces (any mix of queens, rooks, bishops, knights).

## Win conditions
- **Pawn Team wins** if:
  - any pawn reaches the last rank, **or**
  - all Pieces Team pieces are captured.
- **Pieces Team wins** if:
  - all pawns are captured, **or**
  - the Pawn Team has **no legal moves**.

## Features
- Choose the number of pawns (1–8)
- Choose the Pieces Team loadout (at least 1 piece, up to 8 total)
- Optional **Stockfish** mode to play against the computer (choose which side you control)
- Works on desktop and mobile

## Tech
- Vite + Vanilla JS
- `chess.js` for rules / legal moves
- Lichess `chessground` for the board UI
- Stockfish (Web Worker) for AI

## Run locally
Requirements: Node.js (recommended 22+)

```bash
npm install
npm run dev