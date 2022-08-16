import { expect } from "chai";
import { keccak256 } from "../src/keccak256";

describe("Keccak256 Hash", () => {
  it("Should hash inputs", async () => {
    const hash = keccak256([1, 2]);
    expect(hash.toHexString()).to.equal(
      "0xe90b7bceb6e7df5418fb78d8ee546e97c83a08bbccc01a0644d599ccd2a7c2e0"
    );
  });
});
