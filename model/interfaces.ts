import { Point } from "circomlibjs";



export interface Proof {
  proofType: string;
  proofValue: any;
}

export interface Input {
  secret: string;
  proof: Proof;
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
  merkleRoot: string;
  outputs: Output[];
  massConservationProof: any;
  auditSecret: string;
  auditProof: any;
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
  packed: bigint,
  //unpacked: Point<bigint>
}

export interface KeyPair {
  privateKey: bigint
  publicKey: PublicKey
}