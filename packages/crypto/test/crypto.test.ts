import { expect } from "chai";
import { BigNumber } from "ethers";
import { EddsaAccount, EddsaSignature } from "../src/eddsaAccount";

describe("Eddsa account", () => {
  let eddsaAccount: EddsaAccount;
  let message: BigNumber;
  let signature: EddsaSignature;

  beforeAll(async () => {
    eddsaAccount = await EddsaAccount.generateFromSeed(BigNumber.from(123));
    message = BigNumber.from(32);
  });

  it("Should get the pubKey", async () => {
    const pubKey = eddsaAccount.getPubKey();
    expect(pubKey[0].toHexString()).to.equal(
      "0x1fe9cbc6b7906cf8dc5ae8e12aa2cdbd6301d5356d95a50963de71518fd7b901"
    );
    expect(pubKey[1].toHexString()).to.equal(
      "0x27edbd40d949dba6b518c79ca4e88768c93bde75dd8e02cd47b954b69e1b0849"
    );
  });

  it("Should sign the message", async () => {
    signature = eddsaAccount.sign(message);
    expect(signature[0].toHexString()).to.equal(
      "0x020cc129a668c188e67493c80dc896c5bf3b030f999b8d8dc08fbcf6035f9e91"
    );
    expect(signature[1].toHexString()).to.equal(
      "0x21bfd95a895d40a4782133060708d54f28325629606959c2e9809ffd73f9b421"
    );
    expect(signature[2].toHexString()).to.equal(
      "0x04ff9a08f6af650d485a2b5c720db96eec5f5c0bef664314ab185f4dc1c77414"
    );
  });

  it("Should verify a correct signature", async () => {
    const isValid = await EddsaAccount.verify(
      message,
      signature,
      eddsaAccount.getPubKey()
    );
    expect(isValid).to.equal(true);
  });

  it("Should verify an incorrect signature with wrong message", async () => {
    const wrongMessage = BigNumber.from(33);
    const isValid = await EddsaAccount.verify(
      wrongMessage,
      signature,
      eddsaAccount.getPubKey()
    );
    expect(isValid).to.equal(false);
  });
});
