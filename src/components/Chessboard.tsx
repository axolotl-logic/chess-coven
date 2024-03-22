// React
import React, { useEffect, useRef, useState } from "react";

// NextJS
import Link from "next/link";

// Chessground
import { Chessground } from "chessground";
import { type Api as BoardApi } from "chessground/api";
import { type Key } from "chessground/types";
import { type Config } from "chessground/config";

type ChessboardProps = {
  viewOnly?: boolean;
  movable?: boolean;
  fen?: string;
  goodSquares?: Key[];
  badSquares?: Key[];
  highlightedSquares?: Key[];
  flipped?: boolean;
  gameUrl?: string | null;
  onMove?: (san: string) => boolean;
  onSelect?: (square: string) => void;
  children?: React.ReactNode;
};

function onSelectFactory(f: ((s: Key) => void) | undefined) {
  if (!f) {
    return undefined;
  }

  let last: number | null = null;
  return (s: Key) => {
    const now = Date.now();
    if (last == null || now - last > 300) {
      last = now;
      f(s);
    }
  };
}

export function Chessboard({
  gameUrl,
  fen,
  onMove,
  onSelect,
  children,
  viewOnly = false,
  goodSquares = [],
  badSquares = [],
  highlightedSquares = [],
  flipped = false,
  movable = false,
}: ChessboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<BoardApi | null>(null);

  useEffect(() => {
    if (!boardRef.current) {
      return;
    }

    let config: Config = {
      viewOnly,
      fen: fen,
      orientation: flipped ? "black" : "white",
      animation: { enabled: true },
    };

    if (movable) {
      config = {
        ...config,
        movable: {
          free: true,
          events: {
            after: (orig: Key, dest: Key) => {
              if (!onMove) {
                return;
              }

              const allow = onMove(orig + dest);
              if (!allow) {
                board?.cancelMove();
                board?.set(config);
              }
            },
          },
        },
      };
    } else {
      config = {
        ...config,
        events: {
          select: onSelectFactory(onSelect),
        },
        movable: { free: false },
        draggable: { enabled: false },
        drawable: {
          enabled: false,
          autoShapes: goodSquares
            .map((s) => ({ orig: s, brush: "green" }))
            .concat(badSquares.map((s) => ({ orig: s, brush: "red" })))
            .concat(
              highlightedSquares.map((s) => ({ orig: s, brush: "blue" })),
            ),
        },
      };
    }

    if (board) {
      board.set(config);
    } else {
      const chessgroundApi = Chessground(boardRef.current, {
        ...config,
        animation: { enabled: false },
      });
      setBoard(chessgroundApi);
    }
  }, [
    board,
    boardRef,
    viewOnly,
    fen,
    flipped,
    movable,
    goodSquares,
    badSquares,
    highlightedSquares,
    onMove,
    onSelect,
  ]);

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
    <div className="w-chessboard">
      <div className={`border-2 border-black ${topColor} min-h-8 text-black`}>
        {children}
      </div>
      <div className={`flex ${flipped ? "flex-col-reverse" : "flex-col"}`}>
        <div ref={boardRef} className="h-chessboard w-chessboard" />
      </div>
      <div
        className={`flex items-center justify-center border-2 border-black ${bottomColor} min-h-8 pr-6 text-black`}
      >
        {gameSourceEl}
      </div>
    </div>
  );
}
