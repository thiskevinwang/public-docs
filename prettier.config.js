module.exports = {
  printWidth: 80,
  tabWidth: 2,
  trailingComma: "all",
  singleQuote: false,
  semi: true,
  importOrder: [
    // node stdlib
    "^(path|fs)$",
    // node_modules
    "<THIRD_PARTY_MODULES>",
    // local lib imports
    "^@lib/(.*)$",
    // relative imports
    "^[./]",
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};
