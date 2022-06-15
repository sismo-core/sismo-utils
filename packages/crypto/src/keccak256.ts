import { BigNumber, ethers } from "ethers";

export type Keccak256 = (inputs: any[]) => BigNumber;

export function keccak256(inputs: any[]): BigNumber {
    return BigNumber.from(ethers.utils.keccak256(ethers.utils.solidityPack([ "uint256", "uint256" ], [ inputs[0], inputs[1] ])));
}