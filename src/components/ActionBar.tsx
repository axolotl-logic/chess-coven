// Components
import { NumberEntryForm } from "./NumberEntryForm";
import { SanInputForm } from "./SanInputForm";

// Types
import type { PlayerStatus, SolutionType } from "@/types";

export type ActionBarProps = {
  playerStatus: PlayerStatus;
  solutionType: SolutionType;
  showNoSolution: boolean;
  pulseNoSolution: boolean;
  showReplay: boolean;
  showAdvance: boolean;
  showGiveUp: boolean;
  onAdvance: () => void;
  onGiveUp: () => void;
  onSanEntry: (san: string) => void;
  onNumberEntry: (number: number) => void;
  onReplay: () => void;
};

export const ActionBar = ({
  playerStatus,
  solutionType,
  pulseNoSolution,
  showNoSolution,
  showAdvance,
  showReplay,
  showGiveUp,
  onSanEntry,
  onGiveUp,
  onAdvance,
  onNumberEntry,
  onReplay,
}: ActionBarProps) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 px-2 py-1">
      <div className="flex items-center gap-1">
        <div className="flex gap-2">
          {showAdvance && (
            <button
              onClick={onAdvance}
              className="rounded-sm bg-amber-600 px-2 py-1 font-bold text-white hover:bg-amber-700"
            >
              Advance
            </button>
          )}
          {showGiveUp && (
            <button
              className="whitespace-nowrap rounded-sm bg-amber-600 px-2 py-1 font-bold text-white hover:bg-amber-700"
              onClick={onGiveUp}
            >
              Give Up
            </button>
          )}
          {showReplay && (
            <button
              className="rounded-sm bg-amber-600 px-2 py-1 font-bold text-white hover:bg-amber-700"
              onClick={onReplay}
            >
              Replay
            </button>
          )}
          {showNoSolution && (
            <button
              className={`${
                pulseNoSolution ? "animate-pulse" : ""
              } rounded bg-amber-600 px-2 py-1 font-bold text-white hover:bg-amber-700`}
              onClick={onAdvance}
            >
              No Solution
            </button>
          )}
        </div>
      </div>
      {solutionType == "number" && (
        <NumberEntryForm
          label="Total value"
          onSubmit={onNumberEntry}
          isWrong={playerStatus == "wrong-guess"}
        />
      )}
      {solutionType == "move" && (
        <SanInputForm
          onSubmit={onSanEntry}
          isWrong={playerStatus == "wrong-guess"}
        />
      )}
    </div>
  );
};
