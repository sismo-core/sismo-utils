// @ts-ignore
import { buildEddsa as build } from "circomlibjs";

let eddsa: any;

export async function buildEddsa() {
  if (!eddsa) eddsa = await build();
  return eddsa;
}