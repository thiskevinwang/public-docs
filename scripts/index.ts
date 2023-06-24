import { execSync } from "node:child_process";
import * as path from "node:path";

import inquirer from "inquirer";
import { Test, findDownAll } from "vfile-find-down";

import L from "../lib/logger.js";

async function main() {
  const cwd = process.cwd();
  const dir = path.join(cwd, "scripts");

  let test: Test = (file) => {
    return {
      include: !!file.path.match(/\.m?ts$/),
      skip: file.path.endsWith("index.ts"),
      exclude: file.path.includes("helpers"),
    };
  };
  const files = await findDownAll(test, dir);

  const choices = files.map((e) =>
    e.path.replace(process.cwd(), "").replace(/^\//, ""),
  );

  L.event("scripts...");

  inquirer
    .prompt({
      name: "_script",
      message: "Pick a script to execute",
      type: "list",
      choices: choices,
    })
    .then(({ _script }) => {
      L.event("running", _script);
      execSync(`node --loader ts-node/esm ${_script}`, {
        stdio: "inherit",
      });
    })
    .catch((error) => {
      L.error("caught", error);
      if (error.isTtyError) {
        // Prompt couldn't be rendered in the current environment
      } else {
        // Something else went wrong
      }
    });
}

main();
