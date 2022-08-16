import { getCurveFromName } from "ffjavascript";
import { BabyJub } from ".";

let babyJub: BabyJub;

export async function buildBabyjub() {
  if (!babyJub) {
    const bn128 = await getCurveFromName("bn128", true);
    babyJub = new BabyJub(bn128.Fr);
  }
  return babyJub;
}