// @ts-check

/**
 * @see https://prettier.io/docs/configuration
 * @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions & import('@ianvs/prettier-plugin-sort-imports').PrettierConfig}  */
module.exports = {
  plugins: ["@ianvs/prettier-plugin-sort-imports", "prettier-plugin-tailwindcss"],
  singleQuote: false,
  semi: true,
  trailingComma: "es5",
  tabWidth: 2,
  tailwindPreserveDuplicates: false,
  tailwindPreserveWhitespace: false,
  endOfLine: "lf",
  printWidth: 120,
  importOrder: [],
  overrides: [
    {
      files: "src/**/*",
      options: {
        importOrder: [
          "",
          "^zod$",
          "^type ",
          "^~/types",
          "^.*_zod",
          "",
          "^(react|react-dom)$",
          "^next/",
          "^~/server/",
          "^~/api/",
          "^~/lib/",
          "",
          "^~/services/",
          "",
          "^~/(tables|db)",
          "^drizzle-orm",
          "",
          "neverthrow",
          "<BUILTIN_MODULES>",
          "<THIRD_PARTY_MODULES>",
          "",
          "^~/shadcn/",
          "^~/components/",
          "^~/hooks/",
          "",
          "^~/public/",
          "^lucide-react",
          "",
          "^~/",
          "^[./]",
        ],
      },
    },
  ],
  importOrderParserPlugins: ["typescript", "jsx", "decorators-legacy"],
  importOrderCaseSensitive: false,
};
