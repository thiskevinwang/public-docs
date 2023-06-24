import { NextDocsTree } from "./common.js";

/**
 * A util to find an object in a tree by a key-value pair.
 * https://stackoverflow.com/a/39896763/9823455
 */
export function getObject(
  array: any[],
  key: string,
  value: string,
): NextDocsTree | undefined {
  var o;
  array.some(function iter(a) {
    if (a[key] === value) {
      o = a;
      return true;
    }
    return Array.isArray(a.children) && a.children.some(iter);
  });
  return o;
}
