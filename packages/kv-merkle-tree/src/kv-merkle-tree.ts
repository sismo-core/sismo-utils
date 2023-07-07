import pako from "pako";
import { BigNumber } from "ethers";
import { KV } from "./kv-store";
import { HashFunction, MerkleTreeData, JsonMerkleTree, MerklePath } from "./types";

const ERROR_NO_HASH_FUNCTION = "Must define an hash function.";

const HASH_NULL_DICT = {
  "0x00": "0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864",
  "0x2098f5fb9e239eab3ceac3f27b81e481dc3124d55ffed523a839ee8446b64864":
    "0x1069673dcdb12263df301a6ff584a7ec261a44cb9dc68df067a4774460b1f1e1",
  "0x1069673dcdb12263df301a6ff584a7ec261a44cb9dc68df067a4774460b1f1e1":
    "0x18f43331537ee2af2e3d758d50f72106467c6eea50371dd528d57eb2b856d238",
  "0x18f43331537ee2af2e3d758d50f72106467c6eea50371dd528d57eb2b856d238":
    "0x07f9d837cb17b0d36320ffe93ba52345f1b728571a568265caac97559dbc952a",
  "0x07f9d837cb17b0d36320ffe93ba52345f1b728571a568265caac97559dbc952a":
    "0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55",
  "0x2b94cf5e8746b3f5c9631f4c5df32907a699c58c94b2ad4d7b5cec1639183f55":
    "0x2dee93c5a666459646ea7d22cca9e1bcfed71e6951b953611d11dda32ea09d78",
  "0x2dee93c5a666459646ea7d22cca9e1bcfed71e6951b953611d11dda32ea09d78":
    "0x078295e5a22b84e982cf601eb639597b8b0515a88cb5ac7fa8a4aabe3c87349d",
  "0x078295e5a22b84e982cf601eb639597b8b0515a88cb5ac7fa8a4aabe3c87349d":
    "0x2fa5e5f18f6027a6501bec864564472a616b2e274a41211a444cbe3a99f3cc61",
  "0x2fa5e5f18f6027a6501bec864564472a616b2e274a41211a444cbe3a99f3cc61":
    "0x0e884376d0d8fd21ecb780389e941f66e45e7acce3e228ab3e2156a614fcd747",
  "0x0e884376d0d8fd21ecb780389e941f66e45e7acce3e228ab3e2156a614fcd747":
    "0x1b7201da72494f1e28717ad1a52eb469f95892f957713533de6175e5da190af2",
  "0x1b7201da72494f1e28717ad1a52eb469f95892f957713533de6175e5da190af2":
    "0x1f8d8822725e36385200c0b201249819a6e6e1e4650808b5bebc6bface7d7636",
  "0x1f8d8822725e36385200c0b201249819a6e6e1e4650808b5bebc6bface7d7636":
    "0x2c5d82f66c914bafb9701589ba8cfcfb6162b0a12acf88a8d0879a0471b5f85a",
  "0x2c5d82f66c914bafb9701589ba8cfcfb6162b0a12acf88a8d0879a0471b5f85a":
    "0x14c54148a0940bb820957f5adf3fa1134ef5c4aaa113f4646458f270e0bfbfd0",
  "0x14c54148a0940bb820957f5adf3fa1134ef5c4aaa113f4646458f270e0bfbfd0":
    "0x190d33b12f986f961e10c0ee44d8b9af11be25588cad89d416118e4bf4ebe80c",
  "0x190d33b12f986f961e10c0ee44d8b9af11be25588cad89d416118e4bf4ebe80c":
    "0x22f98aa9ce704152ac17354914ad73ed1167ae6596af510aa5b3649325e06c92",
  "0x22f98aa9ce704152ac17354914ad73ed1167ae6596af510aa5b3649325e06c92":
    "0x2a7c7c9b6ce5880b9f6f228d72bf6a575a526f29c66ecceef8b753d38bba7323",
  "0x2a7c7c9b6ce5880b9f6f228d72bf6a575a526f29c66ecceef8b753d38bba7323":
    "0x2e8186e558698ec1c67af9c14d463ffc470043c9c2988b954d75dd643f36b992",
  "0x2e8186e558698ec1c67af9c14d463ffc470043c9c2988b954d75dd643f36b992":
    "0x0f57c5571e9a4eab49e2c8cf050dae948aef6ead647392273546249d1c1ff10f",
  "0x0f57c5571e9a4eab49e2c8cf050dae948aef6ead647392273546249d1c1ff10f":
    "0x1830ee67b5fb554ad5f63d4388800e1cfe78e310697d46e43c9ce36134f72cca",
};

export class KVMerkleTree {
  private tree: KV;
  private pointers: KV;
  private root: string | null = null;
  private hashFunction: HashFunction | null = null;
  private height: number = 0;
  private forceHeight: number | null = null;
  private hashLeaves: boolean = true;

  /**
   * @param data Data used to generate your Merkle tree
   * @param hashFunction Hash function used to generate your Merkle tree
   * @param forceHeight Force the number of levels in your Merkle tree
   * @param hashLeaves Define if your leaf will be hashed or not
   * @param jsonMerkleTree Used only by fromJson function
   * @param leaves Used only by fromLeaves function
   */
  constructor(
    data: MerkleTreeData | null,
    hashFunction: HashFunction | null = null,
    forceHeight: number | null = null,
    hashLeaves: boolean = true,
    jsonMerkleTree: JsonMerkleTree | null = null,
    leaves: string[] | null = null
  ) {
    if (forceHeight) this.forceHeight = forceHeight;

    this.hashFunction = hashFunction;
    this.tree = new KV();
    this.pointers = new KV();
    this.hashLeaves = hashLeaves;

    if (data) {
      if (!this.hashFunction) throw new Error(ERROR_NO_HASH_FUNCTION);
      this.initFromData(data);
    } else if (jsonMerkleTree) {
      this.tree.importJson(jsonMerkleTree.tree);
      if (jsonMerkleTree.pointers) this.pointers.importJson(jsonMerkleTree.pointers);
      this.height = jsonMerkleTree.height;
      this.root = jsonMerkleTree.root;
    } else if (leaves) {
      if (!this.hashFunction) throw new Error(ERROR_NO_HASH_FUNCTION);
      this.initFromLeaves(leaves);
    }
  }

  private initFromLeaves(leaves: string[]) {
    if (!this.hashFunction) throw new Error(ERROR_NO_HASH_FUNCTION);
    if (this.hashLeaves) {
      let leavesHashed: string[] = [];
      for (const leaf of leaves) {
        leavesHashed.push(this.hashFunction([BigNumber.from(leaf)]).toHexString());
      }
      this.createNodes(this.fillNodesWithPowerOf2Length(leavesHashed));
      return;
    }
    this.createNodes(this.fillNodesWithPowerOf2Length(leaves));
  }

  private initFromData(data: MerkleTreeData) {
    if (!this.hashFunction) throw new Error(ERROR_NO_HASH_FUNCTION);
    let leaves: string[] = [];

    for (const key in data) {
      const value = BigNumber.from(data[key]);
      if (BigNumber.from(key).eq(0) && BigNumber.from(value).eq(0)) {
        // We should not use key 0 and value 0 otherwise it will create a hash(0, 0)
        // leaf that corresponds to a specific value of the HASH_NULL_DICT
        continue;
      }
      let leaf;

      if (this.hashLeaves) {
        leaf = this.hashFunction([BigNumber.from(key), value]).toHexString();
      } else {
        leaf = key.concat(value.toString());
      }

      this.pointers.put(key.toLowerCase(), {
        leaf,
        value: value.toHexString(),
      });
      leaves.push(leaf);
    }

    this.createNodes(this.fillNodesWithPowerOf2Length(leaves));
  }

  private createNodes(nodeValues: string[]): BigNumber[] {
    if (!this.hashFunction) throw new Error(ERROR_NO_HASH_FUNCTION);
    if (nodeValues.length == 1) {
      this.root = nodeValues[0];
      return [];
    }
    const parentNodeValues: string[] = [];

    for (let i = 0; i < nodeValues.length; i += 2) {
      const leftNodeValue = nodeValues[i];
      const rightNodeValue = nodeValues[i + 1];

      let parentNodeValue;
      if (leftNodeValue == rightNodeValue && HASH_NULL_DICT[leftNodeValue]) {
        parentNodeValue = HASH_NULL_DICT[leftNodeValue];
      } else {
        parentNodeValue = this.hashFunction([leftNodeValue, rightNodeValue]).toHexString();
      }

      this.tree.patch(leftNodeValue, { p: parentNodeValue });
      this.tree.patch(rightNodeValue, { p: parentNodeValue });

      this.tree.put(parentNodeValue, {
        l: leftNodeValue,
        r: rightNodeValue,
      });

      parentNodeValues.push(parentNodeValue);
    }

    this.height += 1;
    return this.createNodes(parentNodeValues);
  }

  private fillNodesWithPowerOf2Length(leaves: string[]): string[] {
    let next = 0;

    if (this.forceHeight) {
      next = 2 ** this.forceHeight;
    } else {
      next = Math.pow(2, Math.ceil(Math.log(leaves.length) / Math.log(2)));
    }

    return [...leaves, ...new Array(next - leaves.length).fill(BigNumber.from(0).toHexString())];
  }

  public getMerklePathFromKey(key: string): MerklePath {
    if (this.pointers.isEmpty())
      throw new Error(
        "Your tree is generate from leaves. No key / values available. Please use getMerklePathFromLeaf instead."
      );
    let node = this.pointers.get(key.toLowerCase());
    if (!node) throw new Error("Key not found in the Merkle tree");
    return this.getMerklePathFromLeaf(node.leaf);
  }

  public getMerklePathFromLeaf(leaf: string): MerklePath {
    const merklePath: MerklePath = {
      elements: new Array<BigNumber>(),
      indices: new Array<number>(),
    };

    let currentNodeValue = leaf;
    let currentNode = this.tree.get(currentNodeValue);

    if (!currentNode) throw new Error("Leaf not found in the Merkle tree");

    while (currentNode.p) {
      const parentValue = currentNode.p;
      const parentNode = this.tree.get(parentValue);

      if (parentNode.l === currentNodeValue) {
        // If the left child of the parent is the currentNode we register the right child in the merklePath
        merklePath.elements.push(BigNumber.from(parentNode.r));
        merklePath.indices.push(0);
      } else if (parentNode.r === currentNodeValue) {
        // Else we register the left child
        merklePath.elements.push(BigNumber.from(parentNode.l));
        merklePath.indices.push(1);
      }

      currentNodeValue = parentValue;
      currentNode = parentNode;
    }

    return merklePath;
  }

  public verifyMerklePath(merklePath: MerklePath, leaf: string): boolean {
    if (!this.hashFunction) throw new Error(ERROR_NO_HASH_FUNCTION);
    let currentNodeValue = leaf;

    let currentNode = this.tree.get(currentNodeValue);
    if (!currentNode) throw new Error("Leaf not found in the Merkle tree");

    for (let i = 0; i < merklePath.indices.length; i++) {
      if (merklePath.indices[i] == 0) {
        currentNodeValue = this.hashFunction([
          currentNodeValue,
          merklePath.elements[i].toHexString(),
        ]).toHexString();
      } else {
        currentNodeValue = this.hashFunction([
          merklePath.elements[i].toHexString(),
          currentNodeValue,
        ]).toHexString();
      }
    }
    return currentNodeValue == this.getRoot().toHexString();
  }

  public getValue(key: string): BigNumber {
    if (this.pointers.isEmpty())
      throw new Error("Your tree is generate from leaves. No key / values available.");
    const node = this.pointers.get(key.toLowerCase());
    if (!node) throw new Error("Key not found in the Merkle tree");
    return BigNumber.from(node.value);
  }

  public getLeaf(key: string): BigNumber {
    if (this.pointers.isEmpty())
      throw new Error("Your tree is generate from leaves. No key / values available.");
    const node = this.pointers.get(key.toLowerCase());
    if (!node) throw new Error("Key not found in the Merkle tree");
    return BigNumber.from(node.leaf);
  }

  public getPosition(key: string): number {
    if (this.pointers.isEmpty())
      throw new Error("Your tree is generate from leaves. No key / values available.");
    const MerklePath = this.getMerklePathFromKey(key);
    let positionBinaryArray = MerklePath.indices.reverse();
    let positionBinaryString = positionBinaryArray.join("");
    const positionNumber = parseInt(positionBinaryString, 2);
    return positionNumber;
  }

  public getRoot(): BigNumber {
    return BigNumber.from(this.root);
  }

  public getHeight(): number {
    return this.height;
  }

  static fromLeaves(
    leaves: string[],
    hashFunction: HashFunction,
    forceHeight: number | null = null,
    hashLeaves: boolean = false
  ): KVMerkleTree {
    return new KVMerkleTree(null, hashFunction, forceHeight, hashLeaves, null, leaves);
  }

  static fromJson(jsonMerkleTree: JsonMerkleTree): KVMerkleTree {
    return new KVMerkleTree(null, null, null, true, jsonMerkleTree);
  }

  public toJson(): JsonMerkleTree {
    if (!this.root) throw new Error("The Merkle tree is not yet initialized.");
    let json: JsonMerkleTree = {
      root: this.root,
      height: this.height,
      tree: this.tree.store,
    };

    if (!this.pointers.isEmpty()) json["pointers"] = this.pointers.store;

    return json;
  }

  public toTreeOptimizedFormatV1(): string[][] {
    // Check that the tree has been initialized
    if (!this.root) throw new Error("The Merkle tree is not yet initialized.");

    let treeLevels: string[][] = []; // This will hold the compressed tree
    let currentLevelNodes: string[] = [this.root]; // Start with the root

    while (currentLevelNodes.length) {
      let nextLevelNodes: string[] = [];
      let currentLevelValues: string[] = [];

      for (const currentNode of currentLevelNodes) {
        const node = this.tree.get(currentNode);

        currentLevelValues.push(currentNode);

        // Continue if there are no children
        if (node.l === node.r) continue;

        // Add left and right children to the next level
        if (node.l && !HASH_NULL_DICT[node.l]) {
          nextLevelNodes.push(node.l);
        }
        if (node.r && node.r != node.l && !HASH_NULL_DICT[node.r]) {
          nextLevelNodes.push(node.r);
        }
      }

      treeLevels.push(currentLevelValues); // Add the current level to the tree
      currentLevelNodes = nextLevelNodes; // Move to the next level
    }

    // Add an additional level for each data pointer
    const leaves = treeLevels[treeLevels.length - 1];
    let compressedPointers = new Array<string>(leaves.length);
    const pointersDict = this.pointers.toDict();

    // Reverse the indexation of the leaves
    let leavesToPointers: { [key: string]: string } = {};
    for (const pointer of Object.keys(pointersDict)) {
      leavesToPointers[pointersDict[pointer].leaf] = pointer;
    }

    for (const i in leaves) {
      const leaf = leaves[i];
      compressedPointers[i] = `${leavesToPointers[leaf]}#${
        pointersDict[leavesToPointers[leaf]]?.value
      }`;
    }

    treeLevels.push(compressedPointers); // Add the compressed pointers to the tree
    return treeLevels; // Return the compressed tree
  }

  static fromTreeOptimizedFormatV1(treeLevels: string[][]): KVMerkleTree {
    const treeHeight = treeLevels.length - 2;
    const pointers: {
      [key: string]: {
        leaf: string; // hash(key, value);
        value: string;
      };
    } = {};
    const tree: {
      [nodeValue: string]: {
        p?: string; // Parent value
        r?: string; // Right child value
        l?: string; // Left child value
      };
    } = {};

    // Check that the input is valid
    if (!treeLevels || treeLevels.length === 0) throw new Error("Invalid tree data.");

    let root = treeLevels[0][0]; // Root is the first element of the first level

    // Loop over tree levels and reconstruct the tree
    for (let i = 0; i < treeLevels.length - 1; i++) {
      let previousLevel = treeLevels[i - 1];
      let currentLevel = treeLevels[i];
      let nextLevel = treeLevels[i + 1];
      const zeroHashForPreviousLevel =
        i != 0 ? Object.keys(HASH_NULL_DICT)[treeHeight + 1 - i] : null;
      const zeroHashForCurrentLevel = Object.keys(HASH_NULL_DICT)[treeHeight - i];
      const zeroHashForNextLevel = Object.keys(HASH_NULL_DICT)[treeHeight - 1 - i];

      for (let j = 0; j < 2 ** i; j++) {
        let currentNode;
        if (j < currentLevel.length) {
          currentNode = currentLevel[j];
        } else {
          currentNode = zeroHashForCurrentLevel;
        }
        let parentNode;
        if (previousLevel) {
          parentNode = previousLevel[Math.floor(j / 2)] ?? zeroHashForPreviousLevel;
        }
        let leftChild = nextLevel[j * 2] ?? zeroHashForNextLevel;
        let rightChild = nextLevel[j * 2 + 1] ?? zeroHashForNextLevel;

        let node = {};
        if (parentNode) {
          node["p"] = parentNode;
        }
        if (leftChild && i < treeHeight) {
          node["l"] = leftChild;
        }
        if (rightChild && i < treeHeight) {
          node["r"] = rightChild;
        }

        tree[currentNode] = node; // Add the node to the tree
      }
    }

    let formattedPointers = treeLevels[treeLevels.length - 1];
    for (let i = 0; i < formattedPointers.length; i++) {
      let [key, value] = formattedPointers[i].split("#");
      pointers[key] = {
        leaf: treeLevels[treeHeight][i],
        value,
      };
    }

    const jsonMerkleTree: JsonMerkleTree = {
      root,
      height: treeHeight,
      pointers,
      tree,
    };

    return new KVMerkleTree(null, null, null, true, jsonMerkleTree);
  }

  public toCompressedTreeV1(): string {
    return pako.deflate(JSON.stringify(this.toTreeOptimizedFormatV1()));
  }

  static fromCompressedTreeV1(compressedTree: string | ArrayBuffer): KVMerkleTree {
    return KVMerkleTree.fromTreeOptimizedFormatV1(
      JSON.parse(pako.inflate(compressedTree, { to: "string" }))
    );
  }
}
