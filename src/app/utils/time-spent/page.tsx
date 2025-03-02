"use client";

// React
import React from "react";
import { useState } from "react";

// React hook form
import { useForm } from "react-hook-form";

// Utils
import { getLichessUserGames, type LichessGame } from "@/utils/lichess";

type FormValues = {
  username: string;
};

type TimeSpent = {
  id: string;
  timeControl: string;
  timeSpentByYou: string;
  timeSpentByOpponent: string;
  timeSpentByYouPerMove: string;
  timeSpentByOpponentPerMove: string;
  basetimeUsedByYou: string;
  basetimeUsedByOpponent: string;
  url: string;
};

export default function Page() {
  const [timeSpents, setTimeSpents] = useState<TimeSpent[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = async ({ username }: FormValues) => {
    const games = await getLichessUserGames(username);

    const timeDetails = (game: LichessGame, you: boolean) => {
      const whiteUsername = game.players.white.user.name;
      const isWhite = you
        ? whiteUsername == username
        : whiteUsername != username;
      const whitePlayedLast = game.moves.split(" ").length % 2 == 0;

      const clocks = game.clocks;
      const lastTime =
        clocks[clocks.length - (whitePlayedLast && isWhite ? 1 : 2)] / 60;

      const initial = game.clock.initial / 60;
      const increment = game.clock.increment;

      const timeSpent = initial - lastTime * 0.01;
      const moves = game.moves.split(" ").length;

      return {
        timeSpent,
        increment,
        initial,
        timeSpentPerMove: timeSpent / moves,
        basetimeUsed: (timeSpent / initial) * 100,
      };
    };

    const newTimeSpent: TimeSpent[] = games.map((game) => {
      const {
        increment,
        initial,
        timeSpent: timeSpentByYou,
        timeSpentPerMove: timeSpentByYouPerMove,
        basetimeUsed: basetimeUsedByYou,
      } = timeDetails(game, true);
      const {
        timeSpent: timeSpentByOpponent,
        timeSpentPerMove: timeSpentByOpponentPerMove,
        basetimeUsed: basetimeUsedByOpponent,
      } = timeDetails(game, false);

      return {
        id: game.id,
        timeControl: `${initial}+${increment}`,
        timeSpentByYou: `${timeSpentByYou.toFixed(2)} minutes`,
        timeSpentByOpponent: `${timeSpentByOpponent.toFixed(2)} minutes`,
        timeSpentByYouPerMove: `${timeSpentByYouPerMove.toFixed(2)} minutes`,
        timeSpentByOpponentPerMove: `${timeSpentByOpponentPerMove.toFixed(
          2,
        )} minutes`,
        basetimeUsedByYou: `%${basetimeUsedByYou.toFixed(2)}`,
        basetimeUsedByOpponent: `%${basetimeUsedByOpponent.toFixed(2)}`,
        url: `https://lichess.org/${game.id}`,
      };
    });

    setTimeSpents(newTimeSpent);
  };

  return (
    <div className="m-6 flex min-h-screen justify-center">
      <div className="flex flex-col gap-2 bg-gray-800/50 p-4">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex items-center gap-4"
        >
          <label className="text-black dark:text-white">
            Username
            <input
              {...register("username", { required: true })}
              className="ml-2 p-1 text-black"
            />
          </label>
          {errors.username && <span>This field is required</span>}
          <button
            type="submit"
            className="rounded-sm bg-amber-500 px-4 py-2 font-bold text-white hover:bg-amber-700"
          >
            Submit
          </button>
        </form>
        <table className="text-left text-sm text-gray-500 dark:text-gray-400">
          <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th className="px-4 py-3">Time Control</th>
              <th className="px-4 py-3">You Spent</th>
              <th className="px-4 py-3">They Spent</th>
            </tr>
          </thead>
          <tbody className="divide-y bg-white dark:divide-gray-700 dark:bg-gray-800">
            {(timeSpents || []).map((game) => (
              <tr className="text-gray-700 dark:text-gray-400" key={game.id}>
                <td className="px-4 py-3">
                  <a
                    href={game.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {game.timeControl}
                  </a>
                </td>
                <td className="px-4 py-3">
                  {game.timeSpentByYou} ({game.basetimeUsedByYou})
                </td>
                <td className="px-4 py-3">
                  {game.timeSpentByOpponent} ({game.basetimeUsedByOpponent})
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
