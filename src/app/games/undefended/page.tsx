// React
import React from "react";

// Components
import { SolutionClicker } from "@/components/SolutionClicker";

// Assets
import undefendedPieces from "@/assets/puzzles/undefended.json";

const TITLE = "Enchant the Undefended";

const RULES =
  "Click undefended pieces. A piece is considered defended if an ally has sight on its square.";

const STORY =
  "The battlefield is littered with fallen chesspersons. Opposing forces clash, blinded by mutual hatred and pricked on by a thirst for blood. There is however a chance for peace. Find the chesspersons who are most vulnerable and pacify them to quell the cycle of violence.";

export const metadata = {
  title: "Tactical Elements - " + TITLE,
  description: RULES,
};

export default function Page() {
  return (
    <SolutionClicker
      puzzles={undefendedPieces}
      title={TITLE}
      story={STORY}
      rules={RULES}
      autoAdvance={false}
      solutionType="square"
    />
  );
}
