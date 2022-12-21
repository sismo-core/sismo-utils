<br />
<div align="center">
  <img src="https://static.sismo.io/readme/top-secondary.png" alt="Logo" width="150" height="150" style="borderRadius: 20px">

  <h3 align="center">
    Key Value Merkle tree
  </h3>

  <p align="center">
    Merkle tree implementation used in Sismo protocol
  </p>

  <p align="center">
    Made by <a href="https://www.sismo.io/" target="_blank">Sismo</a>
  </p>
  
  <p align="center">
    <a href="https://discord.gg/sismo" target="_blank">
        <img src="https://img.shields.io/badge/Discord-7289DA?style=for-the-badge&logo=discord&logoColor=white"/>
    </a>
    <a href="https://twitter.com/sismo_eth" target="_blank">
        <img src="https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white"/>
    </a>
  </p>
</div>

A KV Merkle tree is a key-value store enhanced with a merkle tree. The merkle tree stores in its leaves the following data: hash(key, value).

Merkle tree used in the [Sismo Hydra s1 proving scheme](https://github.com/sismo-core/hydra-s1-zkps) to build accounts and registry trees.

Find [here](https://accounts-registry-tree.docs.sismo.io) more informations on how KV Merkle trees are used for the Sismo Protocol.


## Install

```bash
yarn add @sismo-core/kv-merkle-tree
```


## Generate your Merkle tree

### From data

With the constructor you will be able to instanciate a KVMerkleTree from [MerkleTreeData](#MerkleTreeData). 

In the default beaviour this will create a tree where the leaves will be hash(key,value).

**For example** if we take the use case of an airdrop, this could allow you to store the amount of token (the value) associated to a user Ethereum account (the key) in the Merkle tree.

```typescript
import { KVMerkleTree } from "@sismo-core/kv-merkle-tree";

const merkleTree = new KVMerkleTree({
  "0xa76f290c490c70f2d816d286efe47fd64a35800a": 1,
  "0x0085560b24769daa4ed057f1b2ae40746aa9aab6": 1,
  "0x0294350d7cf2c145446358b6461c161a927b3a87": 1,
  "0x4f9c798553a207536b79e886b54f169264a7a155": 1,
  "0xa1b04c9cbb449d13c4fca9c7e6be1f810e6f35e9": 1,
}, poseidonHash);
```

|  Params |  Default |  Type |  Description |
|---|---|---|---|
| data | null |  [MerkleTreeData](#MerkleTreeData) | Data used to generate your Merkle tree.  | 
| hashFunction | null | [HashFunction](#HashFunction) | Hash function used to generate your Merkle tree. | 
| forceHeight | null | number | Force the number of levels in your Merkle tree. | 
| hashLeaves | true | boolean | Define if your leaf will be hashed or not. | 

The rest of params in the constructor are due to technicals needs, do not add them.

### From leaves

```typescript
const merkleTree = KVMerkleTree.fromLeaves([
  "0x1b1f552ecfaccc27b98bee59c3d6a05b7d0577878a16e596af333d92d30cddf3",
  "0x2b7f0fee9c5d6d14439ecbb8b957ad7bb47aed55e4b2ffeaa6a8837f97ac22e0",
  "0x19ba655c7d77f8ece9dceee1b3540c06424a067eba896dbcc706087860e28d95",
  "0x1ce55db377a85fe5bd4b876faa9abce3df63db2e5661db52736d5a60ec8223f0",
  "0x1f01ca4d7306f30daac2d5117eae0fff0daabfd020b51fc66e4c1625044733d0",
    ...
]);
```

|  Params |  Default |  Type |  Description |
|---|---|---|---|
| leaves | string[] | [MerkleTreeData](#MerkleTreeData) | Leaves used to generate your Merkle tree.  | 
| hashFunction | null | [HashFunction](#HashFunction) | hash function used to generate your Merkle tree. | 
| forceHeight | null | number | Force the height of your merkle tree. | 
| hashLeaves | false | boolean | Define if your leaf will be hashed or not. | 

## Usages

|  Functions |  Description |
|---|---|
| getHeight(): number | Return the height of your Merkle tree.  |  
| getRoot(): [BigNumber](https://docs.ethers.io/v5/api/utils/bignumber/)  |  Return the root of your Merkle tree. |   
| getValue(key: string): [BigNumber](https://docs.ethers.io/v5/api/utils/bignumber/)  |  Return the value associated to a key. Not available in a Merkle tree create from leaves. | 
| getMerklePathFromLeaf(leaf: string): [MerklePath](#MerklePath)  |  Return MerklePath of a leaf. |   
| getMerklePathFromKey(key: string): [MerklePath](#MerklePath) | Make the link between key and leaf. This allow you to retrieve the MerklePath without knowing the value associated to a key. Not available in a Merkle tree create from leaves. |  
| toJson(): [JsonMerkleTree](#JsonMerkleTree) | Export your Merkle tree in json format | 
| KVMerkleTree.fromJson(jsonMerkleTree: [JsonMerkleTree](#JsonMerkleTree)): KVMerkleTree  | Import your Merkle tree from json format.  | 

## Types 

### JsonMerkleTree 

<a name="JsonMerkleTree"></a>

```typescript
type JsonMerkleTree = {
    root: string,
    height: number,
    pointers?:
      [key: string]: {
        leafValue: string,
        value: number | null
      }
    }
    tree: {
      [nodeValue: string]: { 
        p?: string,
        r?: string,
        l?: string
      }
    }
}
```

<a name="pointers"></a>

|  |  Description |
|---|---|
| root | Merkle root or "top hash" of the Merkle tree ([see more](https://en.wikipedia.org/wiki/Merkle_tree)) |
| height | Number of level of the Merkle tree |
| pointers | Key store that allow you to retrieve a leaf from a key without knowing the value. For example in an airdrop, the user will be able to retrieve his leaf from his Ethereum account without knowing the amount of token he deserve |
| tree | Merkle tree where p is the parent of the current node, r the right child and l the left child |

### MerklePath 

<a name="MerklePath"></a>

```typescript
interface MerklePath {
    path: [BigNumber](https://docs.ethers.io/v5/api/utils/bignumber/)[]; 
    indices: number[]; // 0 if the has is on left, 1 if the has is on the right
}
```

|  |  Description |
|---|---|
| path[] | List of nodes to get the Merkle root from a leaf |
| indices[] | 0 if the node is on left, 1 if the node is on the right |

### MerkleTreeData 

<a name="MerkleTreeData"></a>

```typescript
type MerkleTreeData = { [key: string]: number | null };
```
  
### HashFunction 

<a name="HashFunction"></a>

```typescript
type HashFunction = (inputs: any[]) => BigNumber
```

## License

Distributed under the MIT License.

## Contribute

Please, feel free to open issues, PRs or simply provide feedback!

## Contact

Prefer [Discord](https://discord.gg/sismo) or [Twitter](https://twitter.com/sismo_eth)

<br/>
<img src="https://static.sismo.io/readme/bottom-secondary.png" alt="bottom" width="100%" >
