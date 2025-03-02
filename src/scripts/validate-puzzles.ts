#!/usr/bin/env tsx

import { PuzzleCollectionSchema } from "@/types";
import { parseArgs } from "node:util";
import { readFile } from "fs/promises";
import { exit } from "node:process";
import { join as pathJoin } from "node:path";
import { globSync } from "node:fs";

async function validateOne(path: string): Promise<boolean> {
  const msg = `Validating ${path}...`;
  const raw = await readFile(path, "utf8");
  const obj: unknown = JSON.parse(raw);
  const res = PuzzleCollectionSchema.safeParse(obj);
  if (res.success) {
    console.log(msg + " ok.");
    return true;
  }

  console.error(msg + " error!");
  let max_issues = 10;
  for (const issue of res.error.issues) {
    if (max_issues <= 0) {
      console.error("And more!");
      break;
    }
    const path = issue.path.join(".");
    console.error(`Path: ${path}. Error: ${issue.message}`);
    max_issues -= 1;
  }

  return false;
}

function getPuzzlePaths(): string[] {
  const puzzlesPath = pathJoin(__dirname, "..", "..", "assets", "puzzles", "*");

  return globSync(puzzlesPath);
}

async function main() {
  const options = { path: { type: "string" } } as const;
  const {
    values: { path },
  } = parseArgs({ options });

  let paths: string[] = [];
  if (path) {
    paths = [path];
  } else {
    paths = getPuzzlePaths();
  }

  let success = true;
  for (const path of paths) {
    success = (await validateOne(path)) && success;
  }

  exit(success ? 0 : 1);
}

main()
  .then()
  .catch((err) => console.error(err));
