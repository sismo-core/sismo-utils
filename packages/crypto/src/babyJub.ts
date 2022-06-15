// @ts-ignore
import { buildBabyjub as build } from "circomlibjs";

let babyJub: any;

export async function buildBabyjub() {
  if (!babyJub) babyJub = await build();
  return babyJub;
}



