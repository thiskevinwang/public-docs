import * as z from "zod";

import gitTreeJson from "./git-tree.json";

const SingleNode = z.object({
  name: z.string(),
  href: z.string(),
  singleFile: z.literal(true),
});
interface SingleNode extends z.infer<typeof SingleNode> {}

const SeparatorNode = z.object({
  name: z.string(),
  separator: z.literal(true),
});
interface SeparatorNode extends z.infer<typeof SeparatorNode> {}

const LeafNode = z.object({
  name: z.string(),
  href: z.string(),
});
interface LeafNode extends z.infer<typeof LeafNode> {}

// For recursive types, define TS type manually first
// - https://github.com/colinhacks/zod#recursive-types
interface CategoryNode {
  name: string;
  href: string;
  posts: (CategoryNode | LeafNode)[];
}
const CategoryNode: z.ZodType<CategoryNode> = z.lazy(() =>
  z.object({
    name: z.string(),
    href: z.string(),
    posts: z.array(CategoryNode.or(LeafNode)),
  }),
);

export type NavNode = SingleNode | SeparatorNode | LeafNode | CategoryNode;

// npx ts-node --esm ./scripts/unflat-git-tree.ts
(() => {
  const tree: NavNode[] = [];
  const list = gitTreeJson.tree
    // include entries that in the 'wiki' directory
    .filter((e) => /^wiki\//.test(e.path))
    // .filter((e) => !/\.ya?ml$/.test(e.path))
    .filter((e) => /\.mdx?$/.test(e.path))
    // we technically don't need `tree` objects because the tree shape can be
    // inferred from the files' path
    .map(({ path, type }) => ({ path, type }));

  for (const entry of list) {
    if (entry.type === "tree") {
      tree.push({
        href: entry.path,
        name: entry.path,
        posts: [],
      } as CategoryNode);
    }
    if (entry.type === "blob") {
    }
  }
  console.log(list);
})();
