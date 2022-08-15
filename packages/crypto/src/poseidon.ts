// @ts-ignore
import { buildPoseidon as build } from "circomlibjs";
import { BigNumber, BigNumberish } from "ethers";
import { FiniteField } from "./field";

export type Poseidon = (inputs: any[]) => BigNumber;

let poseidon: any;

export async function buildPoseidon() {
  if (!poseidon) poseidon = await build();

  return (inputs: BigNumberish[]) => {
    const hash = poseidon(inputs.map((x) => BigNumber.from(x)));
    const hashStr = poseidon.F.toString(hash);
    return BigNumber.from(hashStr);
  };
}

export async function getPoseidonFiniteField(): Promise<FiniteField> {
  if (!poseidon) poseidon = await buildPoseidon();
  return poseidon.F;
}
