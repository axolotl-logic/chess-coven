// React
import { useEffect, useRef, useState } from "react";

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
  children?: React.ReactNode;
  onMove?: (san: string) => void;
  onSelect?: (square: string) => void;
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
  fen,
  onMove,
  onSelect,
  viewOnly = false,
  goodSquares = [],
  badSquares = [],
  highlightedSquares = [],
  flipped = false,
  movable = false,
}: ChessboardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [board, setBoard] = useState<BoardApi | null>(null);

  if (!fen) {
    fen = "8/8/8/8/8/8/8/8 w - - 0 1";
  }

  useEffect(() => {
    if (!boardRef.current) {
      return;
    }

    const config: Config = {
      viewOnly,
      fen: fen,
      orientation: flipped ? "black" : "white",
      animation: { enabled: true },
      events: {
        select: movable ? undefined : onSelectFactory(onSelect),
        move: (orig: Key, dest: Key) => {
          if (!onMove) {
            return;
          }

          onMove(orig + dest);
        },
      },
      movable: { free: true },
      draggable: { enabled: movable },
      drawable: {
        enabled: false,
        autoShapes: goodSquares
          .map((s) => ({ orig: s, brush: "green" }))
          .concat(badSquares.map((s) => ({ orig: s, brush: "red" })))
          .concat(highlightedSquares.map((s) => ({ orig: s, brush: "blue" }))),
      },
    };

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

  return <div className="m-auto size-80" ref={boardRef} />;
}
