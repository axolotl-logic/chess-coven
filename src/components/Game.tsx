"use client";

// React
import { useState, useEffect } from "react";

// NextJS
import { useRouter } from "next/navigation";

// Chess.js
import { Chess, BLACK, type Square } from "chess.js";

// Components
import { Chessboard } from "@/components/Chessboard";
import { GameHUD } from "@/components/GameHUD";
import { ActionBar } from "@/components/ActionBar";

// Types
import type { PlayerStatus, GameLogic, GameFlavor, GameLevel } from "@/types";

type GameProps = {
  id: string;
  flavor: GameFlavor;
  logic: GameLogic;
  level: GameLevel;
};
const MAX_HEALTH = 3;

const ANIMATION_SPEED = 1000;

export const Game = ({ logic, flavor, level, id }: GameProps) => {
  const router = useRouter();

  const [goodGuesses, setGoodGuesses] = useState<string[]>([]);
  const [badGuesses, setBadGuesses] = useState<string[]>([]);
  const [health, setHealth] = useState(MAX_HEALTH);
  const [currentScore, setCurrentScore] = useState(0);
  const [playerStatus, setPlayerStatus] = useState<PlayerStatus>("idle");

  const [fenPosition, setFenPosition] = useState(0);
  const [highlightPosition, setHighlightPosition] = useState(0);
  const [puzzleIdx, setPuzzleIdx] = useState<number>(0);

  const { autoAdvance, solutionType, supportNoSolution } = logic;
  const { title, rules } = flavor;

  const {
    fens,
    highlights: perFenHighlights,
    site: gameUrl,
    solutionAliases: solutionAliasesRecord,
    solutions: solutionsRaw,
  } = level.puzzles[puzzleIdx];
  const solutionAliases = new Map(Object.entries(solutionAliasesRecord));
  const solutions = solutionsRaw.map((s) => s.toString());

  let flipped = false;
  try {
    const chess = new Chess(fens[0]);
    flipped = chess.turn() === BLACK;
  } catch (e) {
    // We support invalid FENs
  }

  useEffect(() => {
    if (fens && fenPosition <= fens.length - 1) {
      const interval = setInterval(() => {
        if (highlightPosition < fenPosition) {
          setHighlightPosition((position) => position + 1);
        } else {
          setFenPosition((position) => position + 1);
        }
      }, ANIMATION_SPEED);
      return () => clearInterval(interval);
    }
  }, [fens, fenPosition, highlightPosition]);

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
    if (puzzleIdx >= level.puzzles.length - 1) {
      router.push(`/games/${id}/${level.nextLevel ?? "all"}`);
      return;
    }

    setPuzzleIdx((idx) => idx + 1);
    resetBoard();
  };

  const loseHealth = () => {
    const newHealth = health - 1;
    setHealth(newHealth);
    if (newHealth < 1) {
      router.push(`/games/${id}/game-over`);
    }
  };

  const gainPoints = () => {
    setCurrentScore((score) => score + 1);
  };

  const checkCompleted = async () => {
    if (playerStatus === "gave-up" || readyToAdvance) {
      await gotoNextPuzzle();
      setPlayerStatus("playing");
      gainPoints();
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
      loseHealth();
      setBadGuesses([...badGuesses, guess]);
      setPlayerStatus("wrong-guess");
    }
    return isCorrect;
  };

  const replay = () => {
    loseHealth();
    resetBoard();
  };

  const giveUp = async () => {
    loseHealth();

    setPlayerStatus("gave-up");
    solutions.forEach((solution) => {
      const alias = solutionAliases.get(solution) ?? solution;
      if (!goodGuesses.includes(solution) && !goodGuesses.includes(alias)) {
        setGoodGuesses((guesses) => [...guesses, alias]);
      }
    });
  };

  return (
    <div className="flex flex-col justify-between h-full">
      <div>
        <div className="text-center font-header text-2xl font-bold pt-4">
          {title}
        </div>
        <div className="p-4 text-center">{rules}</div>
      </div>
      <div className="flex flex-col gap-1">
        <ActionBar
          showGiveUp={supportNoSolution || !readyToAdvance}
          showReplay={fens.length > 1 && health > 1}
          showAdvance={!autoAdvance || playerStatus == "gave-up"}
          showNoSolution={supportNoSolution}
          solutionType={solutionType}
          onAdvance={checkCompleted}
          onSanEntry={(san) => checkGuess(san)}
          onNumberEntry={(number) => checkGuess(number.toString())}
          onGiveUp={giveUp}
          onReplay={replay}
          pulseNoSolution={playerStatus == "gave-up" && solutions.length == 0}
          playerStatus={playerStatus}
        />
        <Chessboard
          viewOnly={solutionType == "number"}
          movable={solutionType == "move"}
          fen={fens?.[fenPosition]}
          gameUrl={gameUrl}
          goodSquares={
            solutionType == "square" ? (goodGuesses as Square[]) : []
          }
          badSquares={solutionType == "square" ? (badGuesses as Square[]) : []}
          highlightedSquares={highlightedSquares}
          onSelect={checkGuess}
          onMove={checkGuess}
          flipped={flipped}
        >
          <div className="flex h-full flex-wrap items-center justify-between gap-2">
            <div>
              {goodGuesses && goodGuesses.length > 0 && (
                <div className="flex gap-2 bg-gray-800/50 px-2">
                  {goodGuesses.map((guess) => (
                    <div className="text-green-500" key={guess}>
                      {guess}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              {badGuesses && badGuesses.length > 0 && (
                <div className="flex gap-2 bg-gray-800/50 px-2 line-through">
                  {badGuesses.map((guess) => (
                    <div className="text-red-500" key={guess}>
                      {guess}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Chessboard>
      </div>
      <div>
        <GameHUD
          score={currentScore}
          health={health}
          highScore={0}
          maxHealth={MAX_HEALTH}
        />
      </div>
    </div>
  );
};
