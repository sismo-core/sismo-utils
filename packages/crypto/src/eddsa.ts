// @ts-ignore
// Highly inspired from https://github.com/iden3/circomlibjs/blob/main/src/eddsa.js
import { Scalar } from "ffjavascript";
import { BabyJub } from "./babyjub";
import createBlakeHash from "blake-hash";
import { buildPoseidon, getPoseidonFiniteField } from "./poseidon";
import { Point } from "./point";

let eddsa: EdDSA;

export async function buildEddsa() {
  const poseidon = await buildPoseidon();
  const field = await getPoseidonFiniteField();

  const babyJub = new BabyJub(field);
  if (!eddsa) eddsa = new EdDSA(babyJub, poseidon);
  return eddsa;
}

export class EdDSA {
  babyJub: BabyJub;
  poseidon: any;

  constructor(babyJub, poseidon) {
    this.babyJub = babyJub;
    this.poseidon = poseidon;
  }

  pruneBuffer(buff) {
    buff[0] = buff[0] & 0xf8;
    buff[31] = buff[31] & 0x7f;
    buff[31] = buff[31] | 0x40;
    return buff;
  }

  prv2pub(prv) {
    const F = this.babyJub.F;
    const sBuff = this.pruneBuffer(
      createBlakeHash("blake512").update(Buffer.from(prv)).digest()
    );
    let s = Scalar.fromRprLE(sBuff, 0, 32);
    const A = this.babyJub.mulPointEscalar(
      this.babyJub.Base8,
      Scalar.shr(s, 3)
    );
    return A;
  }

  signPoseidon(prv, msg) {
    const F = this.babyJub.F;
    const sBuff = this.pruneBuffer(
      createBlakeHash("blake512").update(Buffer.from(prv)).digest()
    );
    const s = Scalar.fromRprLE(sBuff, 0, 32);
    const A = this.babyJub.mulPointEscalar(
      this.babyJub.Base8,
      Scalar.shr(s, 3)
    );

    const composeBuff = new Uint8Array(32 + msg.length);
    composeBuff.set(sBuff.slice(32), 0);
    F.toRprLE(composeBuff, 32, msg);
    const rBuff = createBlakeHash("blake512")
      .update(Buffer.from(composeBuff))
      .digest();
    let r = Scalar.mod(Scalar.fromRprLE(rBuff, 0, 64), this.babyJub.subOrder);
    const R8 = this.babyJub.mulPointEscalar(this.babyJub.Base8, r);

    const hm = this.poseidon(
      [R8.x, R8.y, A.x, A.y, msg].map((x) =>
        Scalar.e(this.babyJub.F.toObject(x))
      )
    );
    const hms = Scalar.e(this.babyJub.F.toObject(hm));
    const S = Scalar.mod(
      Scalar.add(r, Scalar.mul(hms, s)),
      this.babyJub.subOrder
    );
    return {
      R8: R8,
      S: S,
    };
  }

  verifyPoseidon(msg, sig: { R8: bigint[]; S: bigint }, A: bigint[]) {
    const R8 = new Point(sig.R8[0], sig.R8[1]);
    // Check parameters
    if (typeof sig != "object") return false;
    if (!Array.isArray(sig.R8)) return false;
    if (sig.R8.length != 2) return false;
    if (!this.babyJub.inCurve(R8)) return false;
    if (!Array.isArray(A)) return false;
    if (A.length != 2) return false;
    if (!this.babyJub.inCurve(Point.fromArray(A))) return false;
    if (sig.S >= this.babyJub.subOrder) return false;

    const hm = this.poseidon(
      [sig.R8[0], sig.R8[1], A[0], A[1], msg].map((x) =>
        Scalar.e(this.babyJub.F.toObject(x))
      )
    );
    const hms = Scalar.e(this.babyJub.F.toObject(hm));

    const Pleft = this.babyJub.mulPointEscalar(this.babyJub.Base8, sig.S);
    let Pright = this.babyJub.mulPointEscalar(
      Point.fromArray(A),
      Scalar.mul(hms, 8)
    );
    Pright = this.babyJub.addPoint(R8, Pright);

    if (!this.babyJub.F.eq(Pleft.x, Pright.x)) return false;
    if (!this.babyJub.F.eq(Pleft.y, Pright.y)) return false;
    return true;
  }
}
