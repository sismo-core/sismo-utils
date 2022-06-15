// @ts-ignore
import { buildPoseidon as build } from "circomlibjs";
import { BigNumber } from "ethers";

export type Poseidon = (inputs: any[]) => BigNumber

let poseidon: any;

export async function buildPoseidon() {
  if (!poseidon) poseidon = await build();

  return (inputs: any[]) => {
    const hash = poseidon(inputs.map((x) => BigNumber.from(x)));
    const hashStr = poseidon.F.toString(hash);
    return BigNumber.from(hashStr);
  }
}