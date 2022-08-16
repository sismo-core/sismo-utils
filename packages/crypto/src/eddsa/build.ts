import { EdDSA } from ".";
import { BabyJub } from "../babyJub";
import { buildPoseidon, getPoseidonFiniteField } from "../poseidon";

let eddsa: EdDSA;

export async function buildEddsa() {
  const poseidon = await buildPoseidon();
  const field = await getPoseidonFiniteField();

  const babyJub = new BabyJub(field);
  if (!eddsa) eddsa = new EdDSA(babyJub, poseidon);
  return eddsa;
}