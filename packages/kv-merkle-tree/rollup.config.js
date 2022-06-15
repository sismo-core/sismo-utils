import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import packageJson from "./package.json";
import dts from "rollup-plugin-dts";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: packageJson.main,
        format: "cjs",
        sourcemap: true,
      },
      {
        file: packageJson.module,
        format: "esm",
        sourcemap: true,
      },
    ],
    plugins: [
      resolve(),
      commonjs(),
      typescript({ tsconfig: "./tsconfig.json" }),
    ],
    external: ['ethers', '@sismo-core/crypto-lib', 'tslib']
  },
  {
    input: "lib/esm/types/index.d.ts",
    output: [
      { 
        file: "lib/index.d.ts", 
        format: "esm" 
      }
    ],
    plugins: [dts()],
  }
];