import * as path from "path";

import walk from "klaw-sync";

export function getPathsFromMdx() {
  const cwd = process.cwd();
  const dir = path.join(cwd, "wiki");

  const files = walk(dir, {
    filter: (file) => !!file.path.match(/\.mdx?$/),
    traverseAll: true,
  });

  // - remove `.mdx` extension
  // - remove `index` basename
  // - remove trailing `/`
  // - remove lone `/wiki` path
  const paths = files.map((file) =>
    file.path
      .replace(cwd, "")
      .replace(/(index)?\.mdx$/i, "")
      .replace(/\/$/i, ""),
  );

  return paths;
}
