import * as assert from "assert";
import _ from "lodash";

import L from "../lib/logger";
import { getPathsFromMdx } from "./helpers/get-paths-from-mdx";
import { getPathsFromYml } from "./helpers/get-paths-from-yml";

/**
 * npx chokidar-cli . -c "node --loader ts-node/esm scripts/yml-mdx.ts"
 */
async function main() {
  L.event("gathering paths in /wiki/sidebar.yml");
  const a = getPathsFromYml().sort();
  L.event("gathering paths from wiki/");
  const b = getPathsFromMdx().sort();

  const ymlDiff = _.difference(a, b);
  const mdxDiff = _.difference(b, a);

  assert.ok(
    _.isEmpty(ymlDiff),
    `YML list contains extra paths: [${ymlDiff.join(",")}]`,
  );
  assert.ok(
    _.isEmpty(mdxDiff),
    `MDX list contains extra paths: [${mdxDiff.join(",")}]`,
  );

  for (let i = 0; i < a.length; i++) {
    assert.equal(
      a[i],
      b[i],
      `Uneven paths:` +
        `\n` +
        `- YML: ${a[i]}` +
        `\n` +
        `- MDX: ${b[i]}` +
        `\n\n` +
        `- If the YML is correct, a new MDX file may need to be created with the same path` +
        `\n` +
        `- If the YML is incorrect, the associate _node_ may need to be removed`,
    );
  }

  //   info(a);
  L.ready("YML and MDX paths match");
}

main().catch((err) => {
  L.error(err.message);
});
