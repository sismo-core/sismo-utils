import { buildPoseidon, Poseidon } from "@sismo-core/crypto";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { KVMerkleTree } from "../src/kv-merkle-tree";
import JsonDataMerkleTree from "./data-merkle-tree.json";
import JsonLeavesMerkleTree from "./leaves-merkle-tree.json";
import { MerklePath, MerkleTreeData } from "../src/types";

describe("Merkle tree lib", () => {
  let accountMerkleTree: KVMerkleTree;
  let merkleTreeRoot: BigNumber;
  let account: string;
  let dataMerkleTree: MerkleTreeData;
  let fromLeavesMerkleTree: KVMerkleTree;
  let merklePath: MerklePath;
  let leaf: string;
  let leaves: string[];
  let poseidon: Poseidon;

  describe("Merkle tree from data", () => {
    beforeAll(async () => {
      poseidon = await buildPoseidon();
  
      dataMerkleTree = {
        "0xa76f290c490c70f2d816d286efe47fd64a35800b": 1,
        "0x0085560b24769dac4ed057f1b2ae40746aa9aab6": 1,
        "0x0294350d7cf2c145446358b6461c1610927b3a87": 1,
        "0x4f9c798553d207536b79e886b54f169264a7a155": 1,
        "0xa1b04c9cbb449d13c4fc29c7e6be1f810e6f35e9": 1,
        "0xad9fbd38281f615e7df3def2aad18935a9e0ffee": 1,
        "0x0783094aadfb8ae9915fd712d28664c8d7d26afa": 1,
        "0xe860947813c207abf9bf6722c49cda515d24971a": 1,
        "0x8bffc896d42f07776561a5814d6e4240950d6d3a": 1,
        "0x4a9a2f31e2009045950df5aab36950609de93c78": 1,
        "0x8ab1760889f26cbbf33a75fd2cf1696bfccdc9e6": 1,
        "0xf61cabba1e6fc166a66bca0fcaa83762edb6d4bd": 1,
        "0x97d0bc262dfc2fbe2e6c62883a669e765fe3d83e": 1,
        "0x74184bff3cf29e82e4d8cb3b7f1d5a89fdd0eb15": 1,
        "0x26bbec292e5080ecfd36f38ff1619ff35826b113": 1,
        "0x8867c12738f4ca3b530afe7efc7ac4ee1d286cbc": 1
      };
  
      accountMerkleTree = new KVMerkleTree(dataMerkleTree, poseidon);

      account = "0xf61cabba1e6fc166a66bca0fcaa83762edb6d4bd";
    })
   
    it('Should get the root of the Merkle tree', async () => {
      merkleTreeRoot = BigNumber.from("4047207450062892694258929318783786787130166100928326367429339529679014639025");
      expect(accountMerkleTree.getRoot().toHexString()).to.equals(merkleTreeRoot.toHexString());
    });

    it('Should get a value from a key', async () => {
      expect(accountMerkleTree.getValue(account).toHexString()).to.equals(BigNumber.from(1).toHexString());
    });

    it('Should get the height of the Merkle tree', async () => {
      expect(accountMerkleTree.getHeight()).to.equals(4);
    });

    it('Should get the position of the leaf', async () => {
      expect(accountMerkleTree.getPosition(account)).to.equals(11);
    });

    it('Should get the the leaf with the key', async () => {
      expect(accountMerkleTree.getLeaf(account).toHexString()).to.equals("0x0b7a27b02df7b066ca2c682cbe126c9b47a7d42b87a85ada8e566e1b438e005f");
    });

    it('Should get the Merkle path from a key', async () => {
      merklePath = accountMerkleTree.getMerklePathFromKey(account);
      expect(merklePath.elements).to.deep.equal([
        BigNumber.from("0x07609bd8dafb73960a4af87a610d5599056267430ffc1446bad5ff6d30e0f0d7"),
        BigNumber.from("0x2e46508bf4c634a18ee73fcf248b4c4fae790b3263f999c0ed28c7224d3623b4"),
        BigNumber.from("0x1b50eaf3a456a813d0de9e77cba00b2cfa92d1160f75eb3ff2775c845ddbed20"),
        BigNumber.from("0x276b4af9833d7147146fb55cf3f472e1b341c54f5ed998b1a5bf74e4268cd189")
      ]);
      expect(merklePath.indices).to.eql([1, 1, 0, 1]); // 1 is for the right side. 0 for the left side.
      // Let's verify the merkle root to the root by hand
      const leaf = poseidon([account, 1]); // account and data 1
      const p1 = poseidon([merklePath.elements[0], leaf]); // I know the that my leaf is to the right of the hash because of the indices 1 
      const p2 = poseidon([merklePath.elements[1], p1]);
      const p3 = poseidon([p2, merklePath.elements[2]]);
      const p4 = poseidon([merklePath.elements[3], p3]);
      expect(p4.toHexString()).to.equals(merkleTreeRoot.toHexString());
    })

    it('Should verify correct Merkle path', async () => {
      const value = accountMerkleTree.getValue(account);
      const leaf = poseidon([account, value]).toHexString();
      const isValid = accountMerkleTree.verifyMerklePath(merklePath, leaf);
      expect(isValid).to.equals(true);
    })

    it('Should verify incorrect Merkle path', async () => {
      const value = accountMerkleTree.getValue(account);
      const leaf = poseidon([account, value]).toHexString();
      const wrongMerklePath = merklePath
      wrongMerklePath.indices[1] = 0;
      const isValid = accountMerkleTree.verifyMerklePath(merklePath, leaf);
      expect(isValid).to.equals(false);
    })

    it('Should force the height of the Merkle tree', async () => {
      const merkleTree = new KVMerkleTree(dataMerkleTree, poseidon, 20);
      expect(merkleTree.getHeight()).to.equals(20);
    });

    it('Should throw when trying to generate a Merkle tree without hash function.', async () => {
      try {
        new KVMerkleTree(dataMerkleTree);
      } catch (e: any) {
        expect(e.message).to.have.string("Must define an hash function.");
      }
    });

    it('Should not hash the leaves', async () => {
      const merkleTree = new KVMerkleTree(dataMerkleTree, poseidon, null, false);
      const leaf = "0xf61cabba1e6fc166a66bca0fcaa83762edb6d4bd" + "1";
      const merklePath = merkleTree.getMerklePathFromLeaf(leaf);
      expect(merklePath.elements).to.deep.equal([
        BigNumber.from("0x08ab1760889f26cbbf33a75fd2cf1696bfccdc9e61"),
        BigNumber.from("0x233d4f41eba57160c46aa59c76f3d702b76086ae59f1098d1475cdde9d41c9c5"),
        BigNumber.from("0x03c0cabbcea507b8be24ca17c7acbd8674b5437d16645b91f2f07eda534730a3"),
        BigNumber.from("0x2e7e03c36176bb68dd87a07e207c09b88b32947658594b3f99b340414f0a7e82")
      ]);
      expect(merklePath.indices).to.eql([1, 1, 0, 1]);
      const p1 = poseidon([merklePath.elements[0], leaf]); 
      const p2 = poseidon([merklePath.elements[1], p1]);
      const p3 = poseidon([p2, merklePath.elements[2]]);
      const p4 = poseidon([merklePath.elements[3], p3]);
      expect(p4.toHexString()).to.equals(merkleTree.getRoot().toHexString());
    })

    it('Should export the entire Merkle tree in json', async () => {
      expect(accountMerkleTree.toJson()).to.deep.equal(JsonDataMerkleTree);
    })

    it('Should import the Merkle tree in json and find a path', async () => {
      const testMerkleTree = KVMerkleTree.fromJson(JsonDataMerkleTree);
      const account2 = "0x74184bff3cf29e82e4d8cb3b7f1d5a89fdd0eb15";
      const merklePath = testMerkleTree.getMerklePathFromKey(account2);
      expect(merklePath.elements).to.deep.equal([
        BigNumber.from("0x1bc32bca26008b23a2aa1b5f1072c4b81f78f4e0a742609b659d3a164eb79432"),
        BigNumber.from("0x08556ba52d6895a9d7093a63cde646727f561c117a59d4e6513e17554fb18e44"),
        BigNumber.from("0x0abf6ae745d8c81b52764118d086a94f33df20477133890e2a016fec4cd61de5"),
        BigNumber.from("0x276b4af9833d7147146fb55cf3f472e1b341c54f5ed998b1a5bf74e4268cd189")
      ]);
    })
  })

  describe("Merkle tree from leaves", () => {
    beforeAll(async () => {
      leaf = BigNumber.from(123456789).toHexString();
      leaves = [
        "123",
        "457",
        "124",
        "458",
        "125",
        leaf, 
        "126",
        "456",
      ]
  
      fromLeavesMerkleTree = KVMerkleTree.fromLeaves(leaves, poseidon);
    })

    it('Should get the root of the Merkle tree', async () => {
      expect(fromLeavesMerkleTree.getRoot().toHexString()).to.equals("0x0aacb0fd8830bb75d9a5ef5b57fd658e60f06c8fa427cf9ab2eec06184bcc429");
    });

    it('Should throw when trying to get a value from a key', async () => {
      try {
        expect(fromLeavesMerkleTree.getValue("test")).to.equals(BigNumber.from(1));
      } catch (e: any) {
        expect(e.message).to.have.string("Your tree is generate from leaves. No key / values available.");
      }
    });

    it('Should get the height of the Merkle tree', async () => {
      expect(fromLeavesMerkleTree.getHeight()).to.equals(3);
    });

    it('Should throw when trying to get the position of the leaf', async () => {
      try {
        expect(accountMerkleTree.getPosition(account)).to.equals(11);
      } catch (e: any) {
        expect(e.message).to.have.string("Your tree is generate from leaves. No key / values available.");
      }
    });

    it('Should throw when trying to get the Merkle path from a key', async () => {
      try {
        fromLeavesMerkleTree.getMerklePathFromKey("test")
      } catch (e: any) {
        expect(e.message).to.have.string("Your tree is generate from leaves. No key / values available. Please use getMerklePathFromLeaf instead.");
      }
    })

    it('Should get the Merkle path from a leaf', async () => {
      merklePath = fromLeavesMerkleTree.getMerklePathFromLeaf(leaf);
      expect(merklePath.elements).to.deep.equal([
        BigNumber.from("0x7d"),
        BigNumber.from("0x203e61d9aae8be3bb472c820e912d9352f1bdd380a096920ce075ae2fa73cd24"),
        BigNumber.from("0x22ecbd118d496f26eecc542befba289b69789ae7486cc6d7b9698b9a04fd3f0e")
      ]);
      expect(merklePath.indices).to.eql([1, 0, 1]); 
      const p1 = poseidon([merklePath.elements[0], leaf]); 
      const p2 = poseidon([p1, merklePath.elements[1]]);
      const p3 = poseidon([merklePath.elements[2], p2]);
      expect(p3.toHexString()).to.equals(fromLeavesMerkleTree.getRoot().toHexString());
    })

    it('Should verify correct Merkle path', async () => {
      const isValid = fromLeavesMerkleTree.verifyMerklePath(merklePath, leaf);
      expect(isValid).to.equals(true);
    })

    it('Should verify incorrect Merkle path', async () => {
      const wrongMerklePath = merklePath
      wrongMerklePath.indices[1] = 1;
      const isValid = fromLeavesMerkleTree.verifyMerklePath(merklePath, leaf);
      expect(isValid).to.equals(false);
    })

    it('Should force the height of the Merkle tree', async () => {
      const merkleTree = KVMerkleTree.fromLeaves(leaves, poseidon, 12);
      expect(merkleTree.getHeight()).to.equals(12);
    })

    it('Should hash the leaves', async () => {
      const merkleTree = KVMerkleTree.fromLeaves(leaves, poseidon, null, true);
      const leafHased = poseidon([leaf]).toHexString();
      const merklePath = merkleTree.getMerklePathFromLeaf(leafHased);
      expect(merklePath.elements).to.deep.equal([
        BigNumber.from("0x069a2d200ecbee839736e872ca1db90e84c1c05e317a3be851b42a0d12e0b27c"),
        BigNumber.from("0x0bd1e97d394b763e9676df29996e7261de509ae106869a9e4432e30903b085e8"),
        BigNumber.from("0x163e9be77f5dfb4b75d96529c02fef3b9f67a82b6e6c62157be765032161dae8")
      ]);
      expect(merklePath.indices).to.eql([1, 0, 1]);
      const p1 = poseidon([merklePath.elements[0], leafHased]); 
      const p2 = poseidon([p1, merklePath.elements[1]]);
      const p3 = poseidon([merklePath.elements[2], p2]);
      expect(p3.toHexString()).to.equals(merkleTree.getRoot().toHexString());
    })

    it('Should export the Merkle tree in json', async () => {
      expect(fromLeavesMerkleTree.toJson()).to.deep.equal(JsonLeavesMerkleTree);
    })

    it('Should import the Merkle tree in json and find a path', async () => {
      const merkleTree = KVMerkleTree.fromJson(JsonLeavesMerkleTree);
      const merklePath = merkleTree.getMerklePathFromLeaf(leaf);
      expect(merklePath.elements).to.deep.equal([
        BigNumber.from("0x7d"),
        BigNumber.from("0x203e61d9aae8be3bb472c820e912d9352f1bdd380a096920ce075ae2fa73cd24"),
        BigNumber.from("0x22ecbd118d496f26eecc542befba289b69789ae7486cc6d7b9698b9a04fd3f0e")
      ]);
    })
  })

  describe("Merkle tree Errors", () => {
    it('Should throw when trying to get Merkle path from incorrect key', async () => {
      try {
        accountMerkleTree.getMerklePathFromKey("Abc");
      } catch(e: any) {
        expect(e.message).to.equal("Key not found in the Merkle tree");
      }
    })

    it('Should throw when trying to get Merkle path from incorrect leaf', async () => {
      try {
        accountMerkleTree.getMerklePathFromLeaf("Abc");
      } catch(e: any) {
        expect(e.message).to.equal("Leaf not found in the Merkle tree");
      }
    })

    it('Should throw when trying to get verify Merkle path with incorrect leaf', async () => {
      try {

        const value = accountMerkleTree.getValue(account);
        const leaf = poseidon([account, value]).toHexString();
        accountMerkleTree.verifyMerklePath(merklePath, "abc");
      } catch(e: any) {
        expect(e.message).to.equal("Leaf not found in the Merkle tree");
      }
    })

    it('Should throw when trying to get value with incorrect key', async () => {
      try {
        accountMerkleTree.getValue("abc");
      } catch(e: any) {
        expect(e.message).to.equal("Key not found in the Merkle tree");
      }
    })

    it('Should throw when trying to get position with incorrect key', async () => {
      try {
        accountMerkleTree.getPosition("abc");
      } catch(e: any) {
        expect(e.message).to.equal("Key not found in the Merkle tree");
      }
    })
  })
})
