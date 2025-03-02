// random
import random from "random";

// NextJS
import { notFound } from "next/navigation";

// Components
import { Game } from "@/components/Game";
import { games, getFlavor, getLogic } from "@/games";
import type { APIResponse, GameLevel, LevelId, Puzzle } from "@/types";
import { newError } from "@/types";

type HasParams = {
  params: Promise<{
    gameId: string;
  }>;
};

const PUZZLES_PER_LEVEL = 10;

async function getLevel(
  gameId: string,
  levelId: LevelId,
): Promise<APIResponse<GameLevel>> {
  "use server";

  const { collection } = games[gameId];
  if (collection === undefined) {
    return newError("Game not found");
  }
  let nextLevelId = levelId;
  let candidates: Puzzle[] = [];
  if (levelId === "all") {
    candidates = Object.values(collection).flat();
  } else {
    candidates = collection[levelId];

    nextLevelId = Number(levelId) + 1;
    if (!collection[nextLevelId]) {
      nextLevelId = "all";
    }
  }

  if (candidates === undefined) {
    return newError("Level not found");
  }

  const puzzles = [];
  for (let i = 0; i < PUZZLES_PER_LEVEL; i++) {
    const idx = random.int(0, candidates.length - 1);
    const [puzzle] = candidates.splice(idx, 1);
    if (puzzle === undefined) {
      break;
    }

    puzzles.push(puzzle);
  }

  const name = levelId == "all" ? "Random" : `Level ${levelId}`;

  return { success: true, data: { name, puzzles, nextLevelId } };
}
export default async function Page(props: HasParams) {
  const params = await props.params;

  const {
    gameId
  } = params;

  const flavor = getFlavor(gameId);
  if (flavor == null) {
    return notFound();
  }

  const logic = getLogic(gameId);
  if (flavor == null) {
    return notFound();
  }

  const levelResp = await getLevel(gameId, 1);
  if (!levelResp.success) {
    console.error(levelResp.error);
    return notFound();
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center">
      <Game
        id={gameId}
        flavor={flavor}
        logic={logic}
        getLevel={getLevel}
        defaultLevel={levelResp.data}
      />
    </main>
  );
}
