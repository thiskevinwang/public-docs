import * as lyra from "@lyrasearch/lyra";
import * as persistence from "@lyrasearch/plugin-data-persistence";

/**
 * node --loader ts-node/esm scripts/lyra.ts
 */
async function main() {
  const instance = persistence.restoreFromFile("json", "lyra.json");

  const res = lyra.search(instance, {
    term: "terraform",
    tolerance: 1,
    properties: "*",
  });
  console.log(res);
}

main();
