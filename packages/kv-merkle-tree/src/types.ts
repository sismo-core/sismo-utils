import { BigNumber, BigNumberish } from "ethers";

export interface MerklePath {
    elements: BigNumber[]; 
    indices: number[]; // 0 if the node is on left, 1 if the node is on the right
  }
  
  export type JsonMerkleTree = {
    root: string,
    height: number,
    pointers?: {
      [key: string]: {
        leaf: string, // hash(key, value);
        value: string
      }
    }
    tree: {
      [nodeValue: string]: { 
        p?: string, // Parent value
        r?: string, // Right child value
        l?: string // Left child value
      }
    }
  }
  
  export type MerkleTreeData = { [key: string]: BigNumberish };
  
  export type HashFunction = (inputs: any[]) => BigNumber;
  