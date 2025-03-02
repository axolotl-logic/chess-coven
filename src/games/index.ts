// Ours
import type { GameInfo, PuzzleCollection } from "@/types";

// Assets
import knightForks from "@/assets/puzzles/knight-forks.json";
import checksCaptures from "@/assets/puzzles/checks-captures.json";
import undefended from "@/assets/puzzles/undefended.json";
import counting from "@/assets/puzzles/counting.json";

export const games: Record<
  string,
  GameInfo & { collection: PuzzleCollection }
> = {
  "knight-forks": {
    logic: {
      autoAdvance: true,
      solutionType: "square",
      supportNoSolution: true,
    },
    flavor: {
      title: "Catapult Knights",
      shortRules: "Click squares where a knight would fork all pieces",
      rules:
        "Click all squares that attack all pieces simultaneously. Otherwise click No Solution.",
      story:
        "The king and queen of the enemy army think they're safe chilling at the local outdoor pub. Catapult a knight across the kingdom (it's a Chess Coven brand catapult) and cause mayhem!",
    },
    collection: knightForks as PuzzleCollection,
  },
  "checks-captures": {
    logic: {
      autoAdvance: false,
      solutionType: "move",
      supportNoSolution: false,
    },
    flavor: {
      title: "Checks/Captures",
      rules: "Perform all legal captures and checks for either side.",
      shortRules: "Perform all legal captures and checks for either side.",
      story:
        "Tomorrow the war reaches your small village. Analyze the crawling battlefield to determine where destruction is inevitable.",
    },
    collection: checksCaptures as PuzzleCollection,
  },
  undefended: {
    logic: {
      solutionType: "square",
      autoAdvance: false,
      supportNoSolution: false,
    },
    flavor: {
      title: "Enchant the Undefended",
      rules:
        "Click undefended pieces. A piece is considered undefended if there are no allies who have sight on its square.",
      shortRules: "Click all undefended pieces",
      story:
        "The battlefield is littered with fallen chesspersons. Opposing forces clash, blinded by mutual hatred and pricked on by a thirst for blood. There is however a chance for peace. Find the chesspersons who are most vulnerable and pacify them to quell the cycle of violence.",
    },
    collection: undefended as PuzzleCollection,
  },
};

export function getFlavor(id: string) {
  const game = games[id];

  return game?.flavor ?? null;
}

export function getLogic(id: string) {
  const game = games[id];

  return game?.logic ?? null;
}
