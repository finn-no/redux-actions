import typescript from "rollup-plugin-typescript";
import { terser } from "rollup-plugin-terser";
import pkg from "./package.json";

function minifiedName(name) {
  return name.replace(/\.js$/, ".min.js");
}

export default [
  {
    input: ["src/index.ts"],
    plugins: [typescript(), terser({ include: [/\.min\.js$/] })],
    output: [
      { file: pkg.main, format: "cjs" },
      { file: pkg.module, format: "es" },
      { file: minifiedName(pkg.main), format: "cjs", sourcemap: true },
      { file: minifiedName(pkg.module), format: "es", sourcemap: true }
    ]
  }
];
