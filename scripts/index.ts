import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

// Use inquirer v8 to avoid ESM
import inquirer from "inquirer";
import walk from "klaw-sync";

import L from "@lib/logger";

function main() {
  const cwd = process.cwd();
  const dir = path.join(cwd, "scripts");

  const files = walk(dir, {
    filter: (file) =>
      // all .ts files
      !!file.path.match(/\.m?ts$/) &&
      // except index.ts
      !file.path.endsWith("index.ts") &&
      !file.path.includes("helpers"),
    traverseAll: true,
  }).map((e) => e.path.replace(process.cwd(), "").replace(/^\//, ""));

  L.event("scripts...");

  inquirer
    .prompt({
      name: "_script",
      message: "Pick a script to execute",
      type: "list",
      choices: files,
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
