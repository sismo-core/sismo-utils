import { BigNumberish } from "ethers";

export interface FiniteField {
  one: bigint;
  zero: bigint;

  mul(a: bigint, b: bigint): bigint;
  sub(a: bigint, b: bigint): bigint;
  div(a: bigint, b: bigint): bigint;
  add(a: bigint, b: bigint): bigint;
  eq(a: bigint, b: bigint): boolean;
  e(a: BigNumberish): bigint;
  isZero(a: bigint): boolean;
  square(a: bigint): bigint;
  toObject(a: BigNumberish): BigNumberish;
  toRprLE(a: Uint8Array, size: number, msg: any);
}
