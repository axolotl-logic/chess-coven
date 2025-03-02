"use client";

// React
import { useState, useEffect, useMemo } from "react";

// Chess.js
import { Chess, BLACK, type Square } from "chess.js";

// Components
import { Chessboard } from "@/components/Chessboard";
import { GameHUD } from "@/components/GameHUD";
import { ActionBar } from "@/components/ActionBar";

// Types
import type {
  PlayerStatus,
  GameLogic,
  GameFlavor,
  GameLevel,
  LevelId,
  APIResponse,
} from "@/types";
import { Overlay } from "./Overlay";
import { GameOverScreen } from "./GameOverScreen";
import { IncorrectScreen } from "./IncorrectScreen";

// Ours
import {
  getHealth,
  getHighScore,
  getScore,
  resetGameSession,
  storeHighScore,
  updateGameSession,
} from "@/utils/storage";
import { LevelClearScreen } from "./NextLevelScreen";
import Link from "next/link";

type GameProps = {
  id: string;
  flavor: GameFlavor;
  logic: GameLogic;
  defaultLevel: GameLevel;
  getLevel: (
    gameId: string,
    levelId: LevelId,
  ) => Promise<APIResponse<GameLevel>>;
};
const MAX_HEALTH = 3;

const ANIMATION_SPEED = 1000;

export function Game({ logic, flavor, defaultLevel, id, getLevel }: GameProps) {
  const [goodGuesses, setGoodGuesses] = useState<string[]>([]);
  const [badGuesses, setBadGuesses] = useState<string[]>([]);
  const [health, setHealth] = useState(getHealth(id));
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");
  const [currentScore, setCurrentScore] = useState<number>(getScore(id));
  const [previousHighScore, setPreviousHighScore] = useState<number>(
    getHighScore(id),
  );
  const [level, setLevel] = useState(defaultLevel);

  const [fenPosition, setFenPosition] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState(0);
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);

  const { autoAdvance, solutionType, supportNoSolution } = logic;
  const { title, rules, shortRules } = flavor;

  const { nextLevelId, puzzles } = level;

  const {
    fens,
    highlights: perFenHighlights,
    site: gameUrl,
    solutionAliases: solutionAliasesRecord,
    solutions: solutionsRaw,
  } = puzzles[puzzleIdx];
  const solutionAliases = new Map(Object.entries(solutionAliasesRecord));
  const solutions = solutionsRaw.map((s) => s.toString());

  let flipped = false;
  try {
    const chess = new Chess(fens[0]);
    flipped = chess.turn() === BLACK;
  } catch (err) {
    // We support invalid FENs
  }

  useEffect(() => {
    if (
      ["gave-up", "playing", "idle"].includes(playerStatus) &&
      fens &&
      fenPosition <= fens.length - 1
    ) {
      const interval = setInterval(() => {
        if (highlightPosition < fenPosition) {
          setHighlightPosition((position) => position + 1);
        } else if (fenPosition < fens.length - 1) {
          setFenPosition((position) => position + 1);
        }
      }, ANIMATION_SPEED);
      return () => clearInterval(interval);
    }
  }, [fens, fenPosition, highlightPosition, playerStatus]);

  useEffect(() => {
    updateGameSession(id, { score: currentScore });
  }, [id, currentScore]);

  useEffect(() => {
    updateGameSession(id, { health });
  }, [id, health]);

  useEffect(() => {
    if (playerStatus == "dead") {
      resetGameSession(id);
    }
  }, [id, playerStatus]);

  useMemo(() => {
    if (health < 1) {
      setPlayerStatus("dead");
    }
  }, [health]);

  useMemo(() => {
    if (playerStatus == "dead") {
      const highScore = getHighScore(id);
      setPreviousHighScore(highScore);

      if (currentScore > highScore) {
        storeHighScore(id, currentScore);
      }
    }
  }, [id, playerStatus, currentScore]);

  const readyToAdvance = goodGuesses.length == solutions.length;

  const replayAnimation = () => {
    setFenPosition(0);
    setHighlightPosition(0);
  };

  let highlightedSquares = perFenHighlights[highlightPosition] || [];
  if (solutionType == "square" && playerStatus == "gave-up") {
    highlightedSquares = [...Object.keys(solutions)] as Square[];
  }

  const resetBoard = () => {
    setGoodGuesses([]);
    setBadGuesses([]);
    replayAnimation();
    setFenPosition(0);
    setHighlightPosition(0);
  };

  const gotoNextPuzzle = async () => {
    if (puzzleIdx >= puzzles.length - 1) {
      const nextLevel = await getLevel(id, nextLevelId);
      if (nextLevel.success) {
        setPuzzleIdx(0);
        setLevel(nextLevel.data);
        setPlayerStatus("level-clear");
      } else {
        console.error(nextLevel.error);
      }
    } else {
      setPuzzleIdx((idx) => idx + 1);
      setPlayerStatus("playing");
    }

    resetBoard();
  };

  const loseHealth = () => {
    setHealth((health) => health - 1);
  };

  const gainPoints = () => {
    setCurrentScore((score) => score + 1);
  };

  const advance = async () => {
    if (playerStatus === "gave-up") {
      await gotoNextPuzzle();
    } else {
      await checkCompleted();
    }
  };

  const checkCompleted = async () => {
    if (readyToAdvance) {
      await gotoNextPuzzle();
      gainPoints();
      setPlayerStatus("playing");
    } else {
      loseHealth();
    }
  };

  const checkGuess = (guess: string) => {
    setPlayerStatus("playing");

    const guessAlias = solutionAliases.get(guess) ?? guess;

    if (
      goodGuesses.includes(guess) ||
      goodGuesses.includes(guessAlias) ||
      badGuesses.includes(guess)
    ) {
      return false;
    }

    const isCorrect = solutions.includes(guess);

    if (isCorrect) {
      const newGoodGuesses = [...goodGuesses, guessAlias];
      setGoodGuesses(newGoodGuesses);

      // Check if puzzle is complete
      if (newGoodGuesses.length === solutions.length && autoAdvance) {
        gotoNextPuzzle()
          .then(() => gainPoints())
          .catch((err) => console.error(err));
      } else {
        gainPoints();
      }
    } else {
      setBadGuesses([...badGuesses, guess]);
      setPlayerStatus("wrong-guess");
      loseHealth();
    }
  };

  const replay = () => {
    resetBoard();
    if (!["gave-up", "wrong-guess"].includes(playerStatus)) {
      loseHealth();
    }
  };

  const giveUp = async (shouldLoseHealth = true) => {
    if (shouldLoseHealth) {
      loseHealth();
    }

    setPlayerStatus("gave-up");
    showSolutions();
  };

  const tryAgain = () => {
    setPlayerStatus("playing");
  };

  const showSolutions = () => {
    solutions.forEach((solution) => {
      const alias = solutionAliases.get(solution) ?? solution;
      if (!goodGuesses.includes(solution) && !goodGuesses.includes(alias)) {
        setGoodGuesses((guesses) => [...guesses, alias]);
      }
    });
  };

  let gameSourceEl = null;
  if (gameUrl) {
    gameSourceEl = (
      <Link
        href={gameUrl}
        className="bg-backdrop px-2 text-white"
        target="_blank"
      >
        View Game
      </Link>
    );
  }

  const topColor = flipped ? "bg-red-100" : "bg-red-400";
  const bottomColor = flipped ? "bg-red-400" : "bg-red-100";

  return (
    <div className="relative mx-auto flex w-full max-w-2xl flex-col justify-center bg-backdrop">
      <div className="p-4">
        <Link
          href="/"
          className="float-right ml-2 rounded bg-red-600 px-2 py-1 font-bold text-white hover:bg-red-700"
        >
          Exit
        </Link>
        <div className="font-header text-lg">{shortRules}</div>
      </div>

      {playerStatus == "wrong-guess" && (
        <Overlay>
          <IncorrectScreen
            tryAgain={tryAgain}
            showSolutions={() => giveUp(false)}
            currentScore={currentScore}
            highScore={previousHighScore}
            maxHealth={MAX_HEALTH}
            health={health}
          />
        </Overlay>
      )}
      {playerStatus == "dead" && (
        <Overlay>
          <GameOverScreen
            previousHighScore={previousHighScore}
            finalScore={currentScore}
            rules={rules}
            title={title}
            to={`/games/${id}/start`}
          />
        </Overlay>
      )}
      {playerStatus == "level-clear" && (
        <Overlay>
          <LevelClearScreen
            highScore={previousHighScore}
            currentScore={currentScore}
            levelName={level.name}
            health={health}
            maxHealth={MAX_HEALTH}
            onContinue={() => setPlayerStatus("playing")}
          />
        </Overlay>
      )}
      <ActionBar
        showGiveUp={
          playerStatus != "gave-up" && (supportNoSolution || !readyToAdvance)
        }
        showReplay={fens.length > 1 && health > 1}
        showAdvance={!autoAdvance || playerStatus == "gave-up"}
        showNoSolution={supportNoSolution}
        solutionType={solutionType}
        onAdvance={advance}
        onSanEntry={(san) => checkGuess(san)}
        onNumberEntry={(number) => checkGuess(number.toString())}
        onGiveUp={() => giveUp()}
        onReplay={replay}
        pulseNoSolution={playerStatus == "gave-up" && solutions.length == 0}
        playerStatus={playerStatus}
      />

      <div className={`border-2 border-black ${topColor} min-h-9 text-black`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="p-1">
            {goodGuesses && goodGuesses.length > 0 && (
              <div className="flex gap-2 bg-backdrop px-2">
                {goodGuesses.map((guess) => (
                  <div className="text-green-500" key={guess}>
                    {guess}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="p-1">
            {badGuesses && badGuesses.length > 0 && (
              <div className="flex gap-2 bg-backdrop px-2 line-through">
                {badGuesses.map((guess) => (
                  <div className="text-red-500" key={guess}>
                    {guess}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <Chessboard
        viewOnly={solutionType == "number"}
        movable={solutionType == "move"}
        fen={fens?.[fenPosition]}
        gameUrl={gameUrl}
        goodSquares={solutionType == "square" ? (goodGuesses as Square[]) : []}
        badSquares={solutionType == "square" ? (badGuesses as Square[]) : []}
        highlightedSquares={highlightedSquares}
        onSelect={checkGuess}
        onMove={checkGuess}
        flipped={flipped}
      />
      <div
        className={`flex items-center justify-center border-2 border-black ${bottomColor} min-h-9 pr-6 text-black`}
      >
        {gameSourceEl}
      </div>
      <GameHUD
        score={currentScore}
        health={health}
        highScore={previousHighScore}
        maxHealth={MAX_HEALTH}
      />
    </div>
  );
}
