import { Point } from "@zk-kit/baby-jubjub";

export interface Proof {
  proofType: string;
  proofValue: any;
}

export interface Input {
  nullifier: string;
  ownershipProof: any;
}

export interface Token {
  ownerAddress: any;
  type: string;
  amount: any;
  nonce: any;
}

export interface UTXO {
  owner: any;
  type: string;
  amount: number;
  nonce: string;
}

export interface Output {
  secret: string;
  rangeOrigin: any;
  rangeDestiny: any;
}

export interface OutputTrade {
  secret: string;
  proof: Proof;
}

export interface OutputDeposit {
  secret: string;
}

export interface Transfer {
  inputs: Input[];
  outputs: Output[];
  secretAudit: string;
  massConservationProof: Proof;
  nonRepudiationProof: Proof;
}

export interface Deposit {
  inputs: Input[];
  outputs: OutputDeposit[];
  secretAudit: string;
  massConservationProof: Proof;
  nonRepudiationProof: Proof;
}

export interface TradeProposalSale {
  depositOwnershipProof: Proof;
  seller: String;
  matchSecret: String;
}

export interface TradeProposalExecute {
  outputs: OutputTrade[];
  depositOwnershipProof: Proof;
  massConservationProof: Proof;
  matchProof: Proof;
  secretAudit: string;
  nonRepudiationProof: Proof;
}

export interface PublicKey {
  packed: bigint;
  unpacked: Point<bigint>;
}

export interface KeyPair {
  privateKey: bigint;
  publicKey: PublicKey;
}
