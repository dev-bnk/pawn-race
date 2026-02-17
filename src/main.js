import { Chess } from "chess.js";
import { Chessground } from "@lichess-org/chessground";
import StockfishWorker from "stockfish/bin/stockfish-18-lite-single.js?worker";

import "@picocss/pico/css/pico.min.css";
import "./style.css";
import "@lichess-org/chessground/assets/chessground.base.css";
import "@lichess-org/chessground/assets/chessground.brown.css";
import "@lichess-org/chessground/assets/chessground.cburnett.css";

const el = document.getElementById("app");
el.innerHTML = `
  <header class="topbar">
    <div class="topbarInner container">
      <div class="brand">
        <img class="brandLogo" src="/logo.png" alt="Pawns vs. Pieces Logo" />
        <div class="brandText">
          <div class="brandTitle">Pawns vs. Pieces</div>
          <div class="brandTag">An Epic Chess Variant for Learning</div>
        </div>
      </div>

      <div class="topbarActions">
        <a class="topbarLink" href="#" id="howToBtn">How to play</a>
        <a class="topbarLink" href="https://github.com/dev-bnk/pawn-race" target="_blank" rel="noreferrer">GitHub</a>
      </div>
    </div>
  </header>

  <!-- How to Play Modal -->
  <div class="modalOverlay" id="howToModal" aria-hidden="true">
    <div class="modalCard" role="dialog" aria-modal="true" aria-labelledby="howToTitle">
      <div class="modalHeader">
        <div>
          <div class="modalTitle" id="howToTitle">How to play</div>
          <div class="modalSub">Quick rules for Rae’s Pawn Race</div>
        </div>
        <button class="iconBtn" id="howToCloseBtn" aria-label="Close" type="button">✕</button>
      </div>

      <div class="modalBody">
        <ul class="modalList">
          <li><b>Pawn Team (White) wins</b> if any pawn reaches the last ran, or captures all Pieces Team pieces  .</li>
          <li><b>Pieces Team (Black) wins</b> if all pawns are captured <b>or</b> the Pawn Team has no legal moves.</li>
          <li>Use the right panel to set <b>pawn count</b> and the Pieces Team loadout.</li>
          <li>Optional: enable <b>Stockfish</b> and choose which side you want to play.</li>
        </ul>
      </div>

      <div class="modalFooter">
        <button class="btn" id="howToOkBtn" type="button">Got it</button>
      </div>
    </div>
  </div>

  <!-- Setup Error Modal -->
  <div class="modalOverlay" id="setupModal" aria-hidden="true">
    <div class="modalCard" role="dialog" aria-modal="true" aria-labelledby="setupTitle">
      <div class="modalHeader">
        <div>
          <div class="modalTitle" id="setupTitle">Can’t start game</div>
          <div class="modalSub" id="setupSub">Fix the setup and try again.</div>
        </div>
        <button class="iconBtn" id="setupCloseBtn" aria-label="Close" type="button">✕</button>
      </div>

      <div class="modalBody">
        <div id="setupMsg" style="font-size:14px; line-height:1.5;"></div>
      </div>

      <div class="modalFooter">
        <button class="btn" id="setupOkBtn" type="button">OK</button>
      </div>
    </div>
  </div>

  <main class="container appMain">
    <div class="layout">
      <div class="boardWrap" id="boardCard">
        <div class="confetti" id="confetti"></div>

        <!-- Pre-game overlay -->
        <div class="pregame" id="pregame">
          <div class="pregameCard">
            <h1 class="pregameTitle">Ready to Race?</h1>

            <h3 class="pregameH">Win conditions</h3>
            <ul class="pregameList">
              <li><b>Pawn Team (White) wins</b> if any pawn reaches the last rank, or captures all Pieces Team pieces.</li>
              <li><b>Pieces Team (Black) wins</b> if all pawns are captured <b>or</b> the Pawn Team has no legal moves.</li>
            </ul>

            <h3 class="pregameH">Setup</h3>
            <ul class="pregameList">
              <li>Choose how many White pawns to start with (1–8).</li>
              <li>Pick the Pieces Team (Black) loadout (queens/rooks/bishops/knights).</li>
              <li><b>Enable Stockfish</b> to play against the computer.</li>
            </ul>
          </div>
        </div>

        <div class="celebrate" id="celebrate">
          <div class="celebrateCard">
            <h1 class="winTitle" id="winTitle">Winner!</h1>
            <p class="winSub" id="winSub">Game over.</p>
            <button class="btn" id="playAgainBtn" type="button">Play Again</button>
          </div>
        </div>

        <div>
          <div id="board"></div>

          <div class="statusRow">
            <div id="status" class="status"></div>
            <a href="#" class="rulesLink" id="rulesLink">Win conditions</a>
          </div>

          <div id="error" class="error"></div>
        </div>
      </div>

      <div class="card panel">
        <h2>Pawn Team (White)</h2>

        <div class="row">
          <div class="field">
            <label for="pawnCount">Pawn Count</label>
            <input id="pawnCount" type="number" min="1" max="8" value="8">
          </div>
        </div>

        <div class="hint">
          Pawns are placed left-to-right on White’s 2nd rank.
        </div>

        <hr style="border:none;border-top:1px solid rgba(0,0,0,.12);margin:12px 0;">

        <h2>Pieces Team (Black)</h2>

        <div class="row">
          <div class="field">
            <label for="cntQ">Queens</label>
            <input id="cntQ" type="number" min="0" max="8" value="1">
          </div>

          <div class="field">
            <label for="cntR">Rooks</label>
            <input id="cntR" type="number" min="0" max="8" value="1">
          </div>

          <div class="field">
            <label for="cntB">Bishops</label>
            <input id="cntB" type="number" min="0" max="8" value="1">
          </div>

          <div class="field">
            <label for="cntN">Knights</label>
            <input id="cntN" type="number" min="0" max="8" value="1">
          </div>
        </div>

        <div class="hint">
          Pieces are placed left-to-right on Black’s back rank. Max 8 pieces total. At least 1 piece required.
        </div>

        <hr style="border:none;border-top:1px solid rgba(0,0,0,.12);margin:12px 0;">

        <h2>Play against the Computer</h2>

        <div class="row aiRow">
          <div class="field" style="min-width:220px; flex: 1 1 auto;">
            <label for="playerSide">You play as</label>
            <select id="playerSide">
              <option value="pawn">Pawn Team (White)</option>
              <option value="pieces" selected>Pieces Team (Black)</option>
            </select>
          </div>

          <div class="toggleRow">
            <span class="toggleLabel">Enable Stockfish</span>
            <label class="toggle">
              <input id="aiEnabled" type="checkbox" checked>
              <span class="toggleTrack" aria-hidden="true"></span>
            </label>
          </div>
        </div>

        <div class="row">
          <div class="field" style="min-width:180px;">
            <label for="aiMoveTime">Move time (ms)</label>
            <select id="aiMoveTime">
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="150">150</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="500">500</option>
              <option value="800">800</option>
              <option value="1200" selected>1200</option>
            </select>
          </div>

          <div class="field" style="min-width:180px;">
            <label for="aiDepth">Depth</label>
            <select id="aiDepth">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4" selected>4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>
        </div>

        <hr style="border:none;border-top:1px solid rgba(0,0,0,.12);margin:12px 0;">

        <div class="startRow">
          <button id="startBtn" class="btn" type="button">Start Game</button>
          <button id="resetBtn" class="btn resetBtn" type="button" aria-label="Reset game" title="Reset">
            ↻
          </button>
        </div>
      </div>
    </div>
  </main>
`;

const statusEl = document.getElementById("status");
const boardEl = document.getElementById("board");
const errorEl = document.getElementById("error");
const pregameEl = document.getElementById("pregame");

const pawnCountEl = document.getElementById("pawnCount");
const cntQEl = document.getElementById("cntQ");
const cntREl = document.getElementById("cntR");
const cntBEl = document.getElementById("cntB");
const cntNEl = document.getElementById("cntN");
const playerSideEl = document.getElementById("playerSide");
const aiEnabledEl = document.getElementById("aiEnabled");
const aiMoveTimeEl = document.getElementById("aiMoveTime");
const aiDepthEl = document.getElementById("aiDepth");
const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");

const rulesLinkEl = document.getElementById("rulesLink");

const celebrateEl = document.getElementById("celebrate");
const confettiEl = document.getElementById("confetti");
const winTitleEl = document.getElementById("winTitle");
const winSubEl = document.getElementById("winSub");
const playAgainBtn = document.getElementById("playAgainBtn");

// How to Play modal hooks
const howToBtn = document.getElementById("howToBtn");
const howToModal = document.getElementById("howToModal");
const howToCloseBtn = document.getElementById("howToCloseBtn");
const howToOkBtn = document.getElementById("howToOkBtn");

// Setup Error modal hooks
const setupModal = document.getElementById("setupModal");
const setupCloseBtn = document.getElementById("setupCloseBtn");
const setupOkBtn = document.getElementById("setupOkBtn");
const setupMsg = document.getElementById("setupMsg");
const setupSubEl = document.getElementById("setupSub");

const game = new Chess();
let gameOver = false;
let gameStarted = false;

// Fixed teams
const pawnColor = "w";
const piecesColor = "b";

// Who the user controls this game: "w" or "b"
let userColor = "b";
let aiColor = "w";

let aiThinking = false;

// Mobile helper: scroll to absolute top after start/reset
function isMobileLayout() {
  return window.matchMedia("(max-width: 900px)").matches;
}

function scrollToTopIfMobile() {
  if (!isMobileLayout()) return;

  requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "smooth" }), 120);
  });
}

// -----------------------------
// Modal behavior
// -----------------------------
function openHowTo() {
  howToModal.classList.add("show");
  howToModal.setAttribute("aria-hidden", "false");
  howToOkBtn.focus();
}

function closeHowTo() {
  howToModal.classList.remove("show");
  howToModal.setAttribute("aria-hidden", "true");
  howToBtn.focus();
}

function openSetupError(msg, sub = "Fix the setup and try again.") {
  setupMsg.textContent = msg;
  setupSubEl.textContent = sub;
  setupModal.classList.add("show");
  setupModal.setAttribute("aria-hidden", "false");
  setupOkBtn.focus();
}

function closeSetupError() {
  setupModal.classList.remove("show");
  setupModal.setAttribute("aria-hidden", "true");
}

howToBtn.addEventListener("click", (e) => {
  e.preventDefault();
  openHowTo();
});

rulesLinkEl.addEventListener("click", (e) => {
  e.preventDefault();
  openHowTo();
});

howToCloseBtn.addEventListener("click", closeHowTo);
howToOkBtn.addEventListener("click", closeHowTo);

howToModal.addEventListener("click", (e) => {
  if (e.target === howToModal) closeHowTo();
});

setupCloseBtn.addEventListener("click", closeSetupError);
setupOkBtn.addEventListener("click", closeSetupError);
setupModal.addEventListener("click", (e) => {
  if (e.target === setupModal) closeSetupError();
});

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && howToModal.classList.contains("show")) closeHowTo();
  if (e.key === "Escape" && setupModal.classList.contains("show")) closeSetupError();
});

// -----------------------------
// Celebration UI
// -----------------------------
function clearConfetti() {
  confettiEl.innerHTML = "";
}

function launchConfetti({ count = 120 } = {}) {
  clearConfetti();

  for (let i = 0; i < count; i++) {
    const p = document.createElement("i");
    const left = Math.random() * 100;
    const delay = Math.random() * 0.25;
    const dur = 1.2 + Math.random() * 1.3;
    const sizeW = 6 + Math.random() * 8;
    const sizeH = 10 + Math.random() * 10;

    p.style.left = `${left}%`;
    p.style.animationDuration = `${dur}s`;
    p.style.animationDelay = `${delay}s`;
    p.style.width = `${sizeW}px`;
    p.style.height = `${sizeH}px`;

    const hue = Math.floor(Math.random() * 360);
    p.style.background = `hsl(${hue} 90% 55%)`;

    confettiEl.appendChild(p);
  }

  setTimeout(clearConfetti, 3200);
}

function showWinOverlay(title, subtitle) {
  winTitleEl.textContent = title;
  winSubEl.textContent = subtitle;
  celebrateEl.classList.add("show");
  launchConfetti();
}

function hideWinOverlay() {
  celebrateEl.classList.remove("show");
  clearConfetti();
}

// -----------------------------
// Pre-game overlay
// -----------------------------
function showPregameOverlay() {
  pregameEl.classList.add("show");
}
function hidePregameOverlay() {
  pregameEl.classList.remove("show");
}

// -----------------------------
// Stockfish Worker (robust + queued, time-bounded)
// -----------------------------
let sf = null;
let sfUciOk = false;

let pendingReadyResolvers = [];
let pendingBestMoveResolver = null;
let pendingBestMoveRejecter = null;
let sfQueue = Promise.resolve();

function startStockfishIfNeeded() {
  if (sf) return;

  sf = new StockfishWorker();
  sfUciOk = false;

  sf.onmessage = (e) => {
    const line = typeof e.data === "string" ? e.data : String(e.data);

    if (line === "uciok") {
      sfUciOk = true;
      return;
    }
    if (line === "readyok") {
      const resolvers = pendingReadyResolvers;
      pendingReadyResolvers = [];
      resolvers.forEach((r) => r());
      return;
    }
    if (line.startsWith("bestmove ")) {
      const mv = line.split(" ")[1];
      if (pendingBestMoveResolver) {
        const res = pendingBestMoveResolver;
        pendingBestMoveResolver = null;
        pendingBestMoveRejecter = null;
        res(mv);
      }
      return;
    }
  };

  sf.postMessage("uci");
}

function sfSend(cmd) {
  if (!sf) return;
  sf.postMessage(cmd);
}

function waitForUciOk(timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const t = setInterval(() => {
      if (sfUciOk) {
        clearInterval(t);
        resolve(true);
        return;
      }
      if (Date.now() - start > timeoutMs) {
        clearInterval(t);
        reject(new Error("Stockfish did not respond with uciok."));
      }
    }, 25);
  });
}

function waitForReadyOk(timeoutMs = 2000) {
  return new Promise((resolve, reject) => {
    let settled = false;

    const wrappedResolve = () => {
      if (settled) return;
      settled = true;
      clearTimeout(t);
      resolve(true);
    };

    pendingReadyResolvers.push(wrappedResolve);
    sfSend("isready");

    const t = setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Stockfish did not respond with readyok."));
    }, timeoutMs);
  });
}

function sfGetBestMoveQueued({ fen, movetimeMs, depth, timeoutMs }) {
  sfQueue = sfQueue.then(async () => {
    startStockfishIfNeeded();
    await waitForUciOk();

    sfSend("stop");
    await waitForReadyOk();

    sfSend("ucinewgame");
    sfSend(`position fen ${fen}`);

    const useDepth = Number.isFinite(depth) && depth > 0;
    if (useDepth) sfSend(`go depth ${depth}`);
    else sfSend(`go movetime ${movetimeMs}`);

    return await new Promise((resolve, reject) => {
      pendingBestMoveResolver = resolve;
      pendingBestMoveRejecter = reject;

      const t = setTimeout(() => {
        sfSend("stop");
        if (pendingBestMoveRejecter) {
          const rej = pendingBestMoveRejecter;
          pendingBestMoveResolver = null;
          pendingBestMoveRejecter = null;
          rej(new Error("Stockfish timed out waiting for bestmove."));
        }
      }, timeoutMs);

      const origResolve = resolve;
      pendingBestMoveResolver = (mv) => {
        clearTimeout(t);
        origResolve(mv);
      };
    });
  });

  return sfQueue;
}

// -----------------------------
// Helpers: build ranks as arrays then convert to FEN
// -----------------------------
function rankArrayToFen(rankArr) {
  let fen = "";
  let empties = 0;
  for (const cell of rankArr) {
    if (!cell) empties++;
    else {
      if (empties) fen += String(empties);
      empties = 0;
      fen += cell;
    }
  }
  if (empties) fen += String(empties);
  return fen || "8";
}

function piecesToBackRank({ q, r, b, n }) {
  const backRank = Array(8).fill(null);
  const bag = [];
  for (let i = 0; i < q; i++) bag.push("q");
  for (let i = 0; i < r; i++) bag.push("r");
  for (let i = 0; i < b; i++) bag.push("b");
  for (let i = 0; i < n; i++) bag.push("n");
  if (bag.length > 8) throw new Error(`Too many pieces (${bag.length}). Max is 8.`);

  for (let i = 0; i < bag.length; i++) backRank[i] = bag[i];
  return backRank;
}

function pawnsToStartRank({ pawnCount }) {
  const rank = Array(8).fill(null);
  const count = Math.max(1, Math.min(8, pawnCount));
  for (let i = 0; i < count; i++) rank[i] = "P";
  return rank;
}

// -----------------------------
// FEN builder (variant start)
// -----------------------------
function buildFen({ pawnCount, q, r, b, n }) {
  const piecesBackRank = piecesToBackRank({ q, r, b, n });
  const pawnStartRank = pawnsToStartRank({ pawnCount });

  const r8 = piecesBackRank;
  const r7 = Array(8).fill(null);
  const r6 = Array(8).fill(null);
  const r5 = Array(8).fill(null);
  const r4 = Array(8).fill(null);
  const r3 = Array(8).fill(null);
  const r2 = pawnStartRank;
  const r1 = Array(8).fill(null);

  const turn = "w";
  return `${rankArrayToFen(r8)}/${rankArrayToFen(r7)}/${rankArrayToFen(
    r6
  )}/${rankArrayToFen(r5)}/${rankArrayToFen(r4)}/${rankArrayToFen(
    r3
  )}/${rankArrayToFen(r2)}/${rankArrayToFen(r1)} ${turn} - - 0 1`;
}

// -----------------------------
// Engine-safe FEN (adds kings only for Stockfish)
// -----------------------------
function engineFenFromVariantGame() {
  const board = game.board();
  const grid = Array.from({ length: 8 }, () => Array(8).fill(null));

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (!p) continue;
      const letter = p.type;
      grid[r][f] = p.color === "w" ? letter.toUpperCase() : letter;
    }
  }

  const files = "abcdefgh";
  const candidatesWhite = [
    "a1",
    "b1",
    "c1",
    "d1",
    "e1",
    "f1",
    "g1",
    "h1",
    "a2",
    "b2",
    "c2",
    "d2",
    "e2",
    "f2",
    "g2",
    "h2",
  ];
  const candidatesBlack = [
    "h8",
    "g8",
    "f8",
    "e8",
    "d8",
    "c8",
    "b8",
    "a8",
    "h7",
    "g7",
    "f7",
    "e7",
    "d7",
    "c7",
    "b7",
    "a7",
  ];

  function isEmpty(sq) {
    const f = files.indexOf(sq[0]);
    const rank = Number(sq[1]);
    const rr = 8 - rank;
    return !grid[rr][f];
  }
  function place(letter, sq) {
    const f = files.indexOf(sq[0]);
    const rank = Number(sq[1]);
    const rr = 8 - rank;
    grid[rr][f] = letter;
  }

  const wkSq = candidatesWhite.find(isEmpty);
  const bkSq = candidatesBlack.find(isEmpty);
  if (wkSq) place("K", wkSq);
  if (bkSq) place("k", bkSq);

  const placement = grid.map(rankArrayToFen).join("/");
  const turn = game.turn();
  return `${placement} ${turn} - - 0 1`;
}

// -----------------------------
// Win checks
// -----------------------------
function pawnTeamHasAnyPawn() {
  const b = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = b[r][f];
      if (p && p.type === "p" && p.color === pawnColor) return true;
    }
  }
  return false;
}

function piecesTeamHasAnyPiece() {
  const b = game.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = b[r][f];
      if (!p) continue;
      if (p.color !== piecesColor) continue;
      if (p.type !== "p") return true;
    }
  }
  return false;
}

function endGameWithCelebration(title, subtitle) {
  gameOver = true;
  aiThinking = false;
  syncBoard();
  showWinOverlay(title, subtitle);
}

function checkPawnTeamWin(lastMove) {
  if (gameOver) return true;

  if (lastMove && lastMove.piece === "p" && lastMove.color === pawnColor) {
    const toRank = lastMove.to?.[1];
    if (toRank === "8") {
      endGameWithCelebration("Pawn Team wins!", "A pawn reached the last rank.");
      return true;
    }
  }

  if (!piecesTeamHasAnyPiece()) {
    endGameWithCelebration("Pawn Team wins!", "All Pieces Team pieces were captured.");
    return true;
  }

  return false;
}

function checkPiecesTeamWinWhenPawnToMove() {
  if (gameOver) return true;
  if (game.turn() !== pawnColor) return false;

  if (!pawnTeamHasAnyPawn()) {
    endGameWithCelebration("Pieces Team wins!", "All pawns were captured.");
    return true;
  }

  const legal = game.moves();
  if (legal.length === 0) {
    endGameWithCelebration("Pieces Team wins!", "Pawn Team has no legal moves.");
    return true;
  }

  return false;
}

// -----------------------------
// Move legality + rendering
// -----------------------------
function setStatus(textOverride) {
  if (textOverride) {
    statusEl.textContent = textOverride;
    return;
  }
  if (!gameStarted) {
    statusEl.textContent = "Press Start Game to begin";
    return;
  }
  const turnName = game.turn() === "w" ? "White" : "Black";
  const extra = aiThinking ? " (Computer thinking...)" : "";
  statusEl.textContent = `Turn: ${turnName}${extra}`;
}

function legalDestsFor(square) {
  const moves = game.moves({ square, verbose: true });
  if (!moves.length) return null;
  return moves.map((m) => m.to);
}

function computeAllDests() {
  const dests = new Map();
  const board = game.board();

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      if (piece.color !== game.turn()) continue;

      const file = "abcdefgh"[f];
      const rank = 8 - r;
      const sq = `${file}${rank}`;

      const d = legalDestsFor(sq);
      if (d) dests.set(sq, d);
    }
  }
  return dests;
}

function userShouldBeLockedOut() {
  if (!gameStarted) return true;
  if (gameOver) return true;
  if (aiThinking) return true;
  if (aiEnabledEl.checked && game.turn() === aiColor) return true;
  return false;
}

function syncBoard() {
  const locked = userShouldBeLockedOut();
  const displayFen = gameStarted ? game.fen() : "8/8/8/8/8/8/8/8 w - - 0 1";

  ground.set({
    fen: displayFen,
    turnColor: game.turn() === "w" ? "white" : "black",
    orientation: userColor === "w" ? "white" : "black",
    draggable: { enabled: !locked },
    movable: locked
      ? { free: false, color: undefined, dests: new Map() }
      : {
          free: false,
          color: game.turn() === "w" ? "white" : "black",
          dests: computeAllDests(),
        },
  });

  if (!gameStarted) showPregameOverlay();
  else hidePregameOverlay();

  setStatus();
}

// -----------------------------
// AI move (time-bounded)
// -----------------------------
async function maybeAiMove() {
  if (!gameStarted) return;
  if (gameOver) return;
  if (!aiEnabledEl.checked) return;
  if (game.turn() !== aiColor) return;

  const legalVerbose = game.moves({ verbose: true });
  if (!legalVerbose.length) {
    aiThinking = false;
    syncBoard();
    return;
  }

  aiThinking = true;
  syncBoard();

  const movetimeMs = Number(aiMoveTimeEl.value || 1200);
  const depth = Number(aiDepthEl.value || 4);
  const timeoutMs = Math.max(1400, movetimeMs + 900);

  try {
    const fenForEngine = engineFenFromVariantGame();

    let best = null;
    try {
      best = await sfGetBestMoveQueued({
        fen: fenForEngine,
        movetimeMs,
        depth,
        timeoutMs,
      });
    } catch {
      best = null;
    }

    let result = null;

    if (best && best !== "(none)") {
      const from = best.slice(0, 2);
      const to = best.slice(2, 4);
      try {
        result = game.move({ from, to, promotion: "q" });
      } catch {
        result = null;
      }
    }

    if (!result) {
      const pick = legalVerbose[Math.floor(Math.random() * legalVerbose.length)];
      result = game.move({ from: pick.from, to: pick.to, promotion: "q" });
    }

    aiThinking = false;

    if (checkPawnTeamWin(result)) return;

    syncBoard();
    checkPiecesTeamWinWhenPawnToMove();
  } catch (err) {
    aiThinking = false;
    syncBoard();
    errorEl.textContent = err?.message || String(err);
  }
}

// -----------------------------
// Chessground init
// -----------------------------
const ground = Chessground(boardEl, {
  coordinates: true,
  fen: "8/8/8/8/8/8/8/8 w - - 0 1",
  turnColor: "white",
  orientation: "white",
  draggable: { enabled: false },
  movable: { free: false, color: undefined, dests: new Map() },
  events: {
    move: async (from, to) => {
      if (userShouldBeLockedOut()) return;

      errorEl.textContent = "";

      let result = null;
      try {
        result = game.move({ from, to, promotion: "q" });
      } catch {
        result = null;
      }
      if (!result) return;

      if (checkPawnTeamWin(result)) return;

      syncBoard();

      await maybeAiMove();

      checkPiecesTeamWinWhenPawnToMove();
    },
  },
});

// -----------------------------
// Start game / UI wiring
// -----------------------------
function setSideFromUI() {
  userColor = playerSideEl.value === "pieces" ? "b" : "w";
  aiColor = userColor === "w" ? "b" : "w";
}

function startGameFromUI({ scrollTop = false } = {}) {
  errorEl.textContent = "";
  hideWinOverlay();

  setSideFromUI();

  const pawnCount = Number(pawnCountEl.value || 1);
  const q = Number(cntQEl.value || 0);
  const r = Number(cntREl.value || 0);
  const b = Number(cntBEl.value || 0);
  const n = Number(cntNEl.value || 0);

  const totalPieces = q + r + b + n;

  // Enforce minimums
  if (!Number.isFinite(pawnCount) || pawnCount < 1) {
    openSetupError("Pawn Team must start with at least 1 pawn.");
    return;
  }
  if (!Number.isFinite(totalPieces) || totalPieces < 1) {
    openSetupError("Pieces Team must start with at least 1 piece (Q/R/B/N).");
    return;
  }

  try {
    const fen = buildFen({ pawnCount, q, r, b, n });

    gameOver = false;
    aiThinking = false;
    gameStarted = true;

    game.load(fen, { skipValidation: true });

    if (checkPawnTeamWin(null)) return;

    syncBoard();

    checkPiecesTeamWinWhenPawnToMove();

    // If user is black and AI is enabled, AI (white) moves first.
    maybeAiMove();

    if (scrollTop) scrollToTopIfMobile();
  } catch (err) {
    openSetupError(err?.message || String(err), "Please adjust your setup.");
  }
}

startBtn.addEventListener("click", () => startGameFromUI({ scrollTop: true }));
resetBtn.addEventListener("click", () => startGameFromUI({ scrollTop: true }));

playAgainBtn.addEventListener("click", () => {
  startGameFromUI({ scrollTop: true });
});

celebrateEl.addEventListener("click", (e) => {
  if (e.target === celebrateEl) hideWinOverlay();
});

aiEnabledEl.addEventListener("change", () => {
  syncBoard();
});

aiMoveTimeEl.addEventListener("change", () => {
  maybeAiMove();
});

aiDepthEl.addEventListener("change", () => {
  maybeAiMove();
});

playerSideEl.addEventListener("change", () => {
  setSideFromUI();
  syncBoard();
});

// Initial locked state: empty board + pregame overlay
setSideFromUI();
syncBoard();