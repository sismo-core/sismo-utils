import { BigNumber, BigNumberish } from "ethers";
import { buildBabyjub } from "./babyJub";
import { buildEddsa } from "./eddsa";

export type EddsaPrivateKey = Buffer
export type EddsaPublicKey = [BigNumber, BigNumber];
export type EddsaSignature = [BigNumber, BigNumber, BigNumber];

export class EddsaAccount {
  private eddsa: any;
  private babyJub: any;
  
  private pubKey: EddsaPublicKey;
  private privKey: EddsaPrivateKey;

  constructor(
    pubKey: EddsaPublicKey, 
    privKey: EddsaPrivateKey,
    eddsa: any,
    babyjub: any
  ){
    this.pubKey = pubKey;
    this.privKey = privKey;
    this.eddsa = eddsa;
    this.babyJub = babyjub;
  }

  public static async generateFromSeed(seed: BigNumberish) {
    const eddsa =  await buildEddsa();
    const babyjub =  await buildBabyjub();
    const privKey = Buffer.from(BigNumber.from(seed).toHexString().slice(2), "hex");
    const pubKey = eddsa.prv2pub(privKey);
    return new EddsaAccount(pubKey, privKey, eddsa, babyjub);
  }

  public sign(msg: BigNumberish): EddsaSignature {
    const msgF = this.babyJub.F.e(BigNumber.from(msg));
    const signature = this.eddsa.signPoseidon(this.privKey, msgF);
    return [
      BigNumber.from(this.babyJub.F.toObject(signature.R8[0])), 
      BigNumber.from(this.babyJub.F.toObject(signature.R8[1])), 
      BigNumber.from(signature.S)
    ];
  }

  public static async verify(msg: BigNumberish, signature: [BigNumberish, BigNumberish, BigNumberish], pubKey: [BigNumberish, BigNumberish]): Promise<boolean> {
    const babyJub = await buildBabyjub();
    const eddsa = await buildEddsa();
    const msgF = babyJub.F.e(BigNumber.from(msg));
    const sigPoseidon = {
      R8: [
        babyJub.F.e(BigNumber.from(signature[0])),
        babyJub.F.e(BigNumber.from(signature[1]))
      ],
      S: BigNumber.from(signature[2]).toBigInt()
    }
    const pubKeyPoseidon = [
      babyJub.F.e(BigNumber.from(pubKey[0])),
      babyJub.F.e(BigNumber.from(pubKey[1])),
    ];
    return eddsa.verifyPoseidon(msgF, sigPoseidon, pubKeyPoseidon);
  }

  public getPubKey(): EddsaPublicKey {
    return [
      BigNumber.from(this.babyJub.F.toObject(this.pubKey[0])), 
      BigNumber.from(this.babyJub.F.toObject(this.pubKey[1]))
    ];
  }  
}
