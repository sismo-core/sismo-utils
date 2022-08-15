import { expect } from "chai";
import { buildPoseidon, Poseidon } from "../src/poseidon";

describe("Poseidon Hash", () => {
  it("Should hash inputs", async () => {
    const poseidon: Poseidon = await buildPoseidon();
    const hash = poseidon([1, 2, 3]);
    expect(hash.toHexString()).to.equal(
      "0x0e7732d89e6939c0ff03d5e58dab6302f3230e269dc5b968f725df34ab36d732"
    );
  });
});
