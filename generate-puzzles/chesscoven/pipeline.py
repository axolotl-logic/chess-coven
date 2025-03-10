# Core
import logging
import json
from dataclasses import asdict

# Pandas
import pandas as pd

# TQDM
from tqdm import tqdm

# Chess
import chess
import chess.pgn

# Ours
from chesscoven.common import get_site, count_pieces, print_stats


def from_positions(positions_path, generate_puzzles, **kv):
    reader = pd.read_json(positions_path, chunksize=1000, lines=True)

    puzzles = []
    for df in tqdm(reader):
        for fen, site in zip(df["fen"], df["site"]):
            for puzzle in generate_puzzles(fen):
                if not puzzle.site:
                    puzzle.site = site
                if not puzzle.fens:
                    puzzle.fens = [fen]

                puzzles.append(puzzle)

    return puzzles


def from_games(pgn_path, generate_puzzles, **kv):
    games = []
    with open(pgn_path) as f:
        while True:
            game = chess.pgn.read_game(f)
            if game is None:
                break  # end of file

            games.append(game)

    puzzles = []
    for game in tqdm(games):
        for puzzle in generate_puzzles(game):
            if puzzle.game_move_number and not puzzle.site:
                puzzle.site = get_site(game, puzzle.game_move_number)

            puzzles.append(puzzle)

    return puzzles


def from_self(generate_puzzles, **kv):
    return generate_puzzles()


def passthrough(df):
    return df


def to_camel(name):
    components = name.split("_")

    return "".join(
        [components[0]] +
        [c.capitalize() for c in components[1:]]
    )


def to_df(puzzles):
    rows = []
    for puzzle in puzzles:
        row = {}
        for k, v in asdict(puzzle).items():
            row[to_camel(k)] = v

        row["solutionCount"] = len(puzzle.solutions)
        row["pieceCount"] = count_pieces(fen=puzzle.fens[0])

        rows.append(row)

    return pd.DataFrame(rows)


def build_pruner(
    min_piece_count=4,
    max_piece_count=24,
    max_solution_count=4,
    min_solution_count=1,
    min_piece_per_solution=2,
    max_piece_per_solution=12
):
    def prune(df):
        df = df[
            (df["solutionCount"] <= max_solution_count) &
            (df["solutionCount"] >= min_solution_count) &
            (df["pieceCount"] >= min_piece_count) &
            (df["pieceCount"] <= max_piece_count) &
            (df["pieceCount"] / df["solutionCount"] >= min_piece_per_solution) &
            (df["pieceCount"] / df["solutionCount"] <= max_piece_per_solution)
        ]

        def is_worthy(fens):
            board = chess.Board(fens[0])
            return not board.is_game_over() and board.is_valid()

        df = df[df["fens"].apply(is_worthy)]

        logging.info(f'Found {len(df)} interesting puzzles')

        df = df.sample(min(len(df), 2000))

        return df

    return prune


def write_puzzles(df, out_path):
    by_level = df.groupby("level")
    out = {
        level: group.to_dict(orient="records")
        for level, group in by_level
    }

    with open(out_path, "w") as f:
        json.dump(out, f)

    logging.info(f"Wrote {len(df)} puzzles to {out_path}")


def run_pipeline(puzzle_name, manifest, should_overwrite):
    logging.info(f"### Running pipeline for {puzzle_name}")

    pgn_path = manifest["paths"]["source_games_path"]
    positions_path = manifest["paths"]["source_positions_path"]
    puzzles_dir = manifest["paths"]["puzzles_dir"]
    out_path = puzzles_dir / (puzzle_name + ".json")

    if out_path.exists() and not should_overwrite:
        logging.info(
            f"Skipping re-genearting {out_path}. Use --overwrite-assets to force.")
        return

    puzzle_manifest = manifest["puzzles"][puzzle_name]
    load = puzzle_manifest["load"]
    generate_puzzles = puzzle_manifest["generate_puzzles"]
    prune = puzzle_manifest["prune"]

    puzzles = load(
        pgn_path=pgn_path,
        positions_path=positions_path,
        generate_puzzles=generate_puzzles
    )

    if not puzzles:
        logging.error(
            f"Zero candidate puzzles generated! Skipping {out_path}")
        return
    else:
        logging.info(f"Generated {len(puzzles)} candidate puzzles")

    df = to_df(puzzles)
    df = prune(df)

    logging.info(f"Pruned {len(puzzles) - len(df)} puzzles.")

    before_dedup = len(df)
    df["fens"].drop_duplicates(inplace=True)
    dup_drop_count = before_dedup - len(df)
    if dup_drop_count:
        logging.warning(f"Dropped {dup_drop_count} duplicate positions")

    if len(df) == 0:
        logging.error(
            f"Zero puzzles left! Skipping {out_path}")
        return
    else:
        logging.info(f"Selected {len(puzzles)} puzzles")

    print_stats(df)

    write_puzzles(df, out_path)
