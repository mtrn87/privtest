import { readFileSync } from "fs";
import { resolve } from "path";

export class Circuit {
    
	circuit: string;
	wasmPath: string;
	zkeyPath: string;
	vkey: any;

	constructor(circuit: string) {
		this.circuit = circuit;
		this.vkey = JSON.parse(
			readFileSync(resolve(__dirname, `../build/circuits/${circuit}/${circuit}.vkey.json`), `utf-8`)
		);
		this.zkeyPath = resolve(__dirname, `../build/circuits/${circuit}/${circuit}.zkey`);
		this.wasmPath = resolve(__dirname, `../build/circuits/${circuit}/${circuit}.wasm`);
	}

	async generateProofPlonk(inputs: any): Promise<any> {
        const snarkjs = require("snarkjs");
		const { proof, publicSignals } = await snarkjs.plonk.fullProve(inputs, this.wasmPath, this.zkeyPath);
		let proofCalldata = await snarkjs.plonk.exportSolidityCallData(proof, publicSignals);
		proofCalldata = proofCalldata.split(",")[0].toString();
		return { proofJson: proof, proofCalldata: proofCalldata, publicSignals: publicSignals };
	}

	async verifyProofPlonk(proofJson: any, publicSignals: any): Promise<boolean> {
		const snarkjs = require("snarkjs");
        const verify = await snarkjs.plonk.verify(this.vkey, publicSignals, proofJson);
		return verify;
	}

    async generateProofGrowth16(inputs: any): Promise<any> {
        const snarkjs = require("snarkjs");
		const { proof, publicSignals } = await snarkjs.groth16.fullProve(inputs, this.wasmPath, this.zkeyPath);
		let proofCalldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
		proofCalldata = proofCalldata.split(",")[0].toString();
		return { proofJson: proof, proofCalldata: proofCalldata, publicSignals: publicSignals };
	}

	async verifyProofGrowth16(proofJson: any, publicSignals: any): Promise<boolean> {
		const snarkjs = require("snarkjs");
        const verify = await snarkjs.groth16.verify(this.vkey, publicSignals, proofJson);
		return verify;
	}
}