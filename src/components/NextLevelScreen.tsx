import { GameHUD } from "./GameHUD";

type IncorrectScreenProps = {
  onContinue: () => void;
  levelName: string;
  currentScore: number;
  health: number;
  highScore: number;
  maxHealth: number;
};

export function LevelClearScreen({
  onContinue,
  levelName,
  maxHealth,
  currentScore,
  highScore,
  health,
}: IncorrectScreenProps) {
  return (
    <div className="flex size-full flex-col flex-wrap items-center justify-center gap-4">
      <div className="p-2 text-4xl">Level clear! Next up {levelName}</div>
      <div className="flex gap-2">
        <button
          onClick={onContinue}
          className="mt-2 self-center rounded-sm bg-amber-600 px-6 py-2 text-white hover:bg-amber-700"
        >
          Continue
        </button>
      </div>
      <GameHUD
        score={currentScore}
        health={health}
        highScore={highScore}
        maxHealth={maxHealth}
      />
    </div>
  );
}
