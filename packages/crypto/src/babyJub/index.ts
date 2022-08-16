// Highly inspired from https://github.com/iden3/circomlibjs/blob/main/src/babyjub.js
import { Scalar } from "ffjavascript";
import { FiniteField } from "../field";
import { Point } from "../point";
export * from "./build";

export class BabyJub {
  F: FiniteField;
  p: bigint;
  pm1d2: bigint;
  Generator: Point;
  Base8: Point;
  order: bigint;
  subOrder: bigint;
  A: bigint;
  D: bigint;

  constructor(F: FiniteField) {
    this.F = F;
    this.p = Scalar.fromString(
      "21888242871839275222246405745257275088548364400416034343698204186575808495617"
    );
    this.pm1d2 = Scalar.div(Scalar.sub(this.p, Scalar.e(1)), Scalar.e(2));

    this.Generator = new Point(
      F.e(
        "995203441582195749578291179787384436505546430278305826713579947235728471134"
      ),
      F.e(
        "5472060717959818805561601436314318772137091100104008585924551046643952123905"
      )
    );
    this.Base8 = new Point(
      F.e(
        "5299619240641551281634865583518297030282874472190772894086521144482721001553"
      ),
      F.e(
        "16950150798460657717958625567821834550301663161624707787222815936182638968203"
      )
    );
    this.order = Scalar.fromString(
      "21888242871839275222246405745257275088614511777268538073601725287587578984328"
    );
    this.subOrder = Scalar.shiftRight(this.order, 3);
    this.A = F.e("168700");
    this.D = F.e("168696");
  }

  addPoint(a: Point, b: Point): Point {
    const F = this.F;

    /* does the equivalent of:
        res[0] = bigInt((a[0]*b[1] + b[0]*a[1]) *  bigInt(bigInt("1") + d*a[0]*b[0]*a[1]*b[1]).inverse(q)).affine(q);
        res[1] = bigInt((a[1]*b[1] - cta*a[0]*b[0]) * bigInt(bigInt("1") - d*a[0]*b[0]*a[1]*b[1]).inverse(q)).affine(q);
        */

    const beta = F.mul(a.x, b.y);
    const gamma = F.mul(a.y, b.x);
    const delta = F.mul(F.sub(a.y, F.mul(this.A, a.x)), F.add(b.x, b.y));
    const tau = F.mul(beta, gamma);
    const dtau = F.mul(this.D, tau);

    const xCoord = F.div(F.add(beta, gamma), F.add(F.one, dtau));

    const yCoord = F.div(
      F.add(delta, F.sub(F.mul(this.A, beta), gamma)),
      F.sub(F.one, dtau)
    );

    return new Point(xCoord, yCoord);
  }

  mulPointEscalar(base: Point, e: bigint): Point {
    const F = this.F;
    let res = new Point(F.e("0"), F.e("1"));
    let rem = e;
    let exp = base;

    while (!Scalar.isZero(rem)) {
      if (Scalar.isOdd(rem)) {
        res = this.addPoint(res, exp);
      }
      exp = this.addPoint(exp, exp);
      rem = Scalar.shiftRight(rem, 1);
    }

    return res;
  }

  inCurve(P: Point): boolean {
    const F = this.F;
    const x2 = F.square(P.x);
    const y2 = F.square(P.y);

    if (
      !F.eq(
        F.add(F.mul(this.A, x2), y2),
        F.add(F.one, F.mul(F.mul(x2, y2), this.D))
      )
    )
      return false;

    return true;
  }
}
