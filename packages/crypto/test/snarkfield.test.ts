import { expect } from "chai";
import { SNARK_FIELD } from "../src/snark-field";

describe("Snark field", () => {
  it("Should return the good snark field", async () => {
    expect(SNARK_FIELD.toHexString()).to.equal(
      "0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001"
    );
  });
});
