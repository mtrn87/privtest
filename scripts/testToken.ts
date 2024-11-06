import { viem } from "hardhat";
import path = require("path");

import { parseEther, formatEther } from "viem";
import { ethers } from "ethers";

import {
  genKeypair,
  formatPrivKeyForBabyJub,
  genRandomSalt,
} from "maci-crypto";
import {
  poseidonEncrypt,
  poseidonDecrypt,
  poseidonDecryptWithoutCheck,
} from "@zk-kit/poseidon-cipher";
import {
  BabyJub,
  buildBabyjub,
  Eddsa,
  buildPoseidon,
  Point,
} from "circomlibjs";
import { Input, Output, Proof, Transfer, UTXO } from "../model/interfaces";
import {
  BabyJubJubPoint,
  bigIntToHex,
  decryptMessage,
  generateCommitment,
  generateNullifier,
  generatePrivKey,
  getSecret,
  pointMulBase,
  uint8R2bigInt,
} from "./Functions";
//import { Scalar } from "@toruslabs/ffjavascript";
import { expect, assert } from "chai";
import { poseidon2 } from "poseidon-lite/poseidon2";
import { Circuit } from "./Circuit";
import { buildOutputs } from "./Outputs";
import { buildInputs } from "./Inputs";
const circom_tester = require("circom_tester");
const wasm_tester = circom_tester.wasm;

async function main() {
  const babyJub = await buildBabyjub();

  const privKeyBob: string = generatePrivKey();
  const privKeyAlice: string = generatePrivKey();

  const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, privKeyBob); // Chave pública correspondente
  const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, privKeyAlice);

  //const publicKeyBob : BabyJubJubPoint = await pointMulBase(privKeyBob);  // Chave pública correspondente
  //const publicKeyAlice : BabyJubJubPoint = await pointMulBase(privKeyAlice);
 
  console.log(`pk1 -> ${publicKeyBob}\n`);
  console.log(`pk2 -> ${publicKeyAlice.toString()}\n`);
 

  const utxo = {
    owner: publicKeyAlice.toString(),
    type: "DREX",
    amount: 15,
    nonce: genRandomSalt().toString(),
  };

  const utxoA: UTXO = {
    owner: publicKeyAlice,
    type: "DREX",
    amount: 10,
    nonce: genRandomSalt().toString(),
  };

  const utxoB: UTXO = {
    owner: publicKeyAlice,
    type: "DREX",
    amount: 10,
    nonce: genRandomSalt().toString(),
  };

  const utxoC: UTXO = {
    owner: publicKeyAlice.toString(),
    type: "DREX",
    amount: 5,
    nonce: genRandomSalt().toString(),
  };

  const utxoD: UTXO = {
    owner: publicKeyBob.toString(),
    type: "DREX",
    amount: 15,
    nonce: genRandomSalt().toString(),
  };
  const nonce0 = BigInt(genKeypair().privKey.toString());
  const secret0 = await getSecret(utxoA, publicKeyAlice, nonce0);
  const nonce1 = BigInt(genKeypair().privKey.toString());
  const secret1 = await getSecret(utxoB, publicKeyAlice, nonce1);
  
  let transfer0: Partial<Transfer> = {};

  transfer0.inputs = await buildInputs([secret0, secret1], privKeyAlice);  
  transfer0.outputs = await buildOutputs([utxoC, utxoD]);
  console.log(transfer0);

  /*const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    { x: x },
    "build/poseidon_hasher_js/poseidon_hasher.wasm",
    "circuits/circuit_0000.zkey"
  );
  console.log(publicSignals);
  console.log(proof);
  const vKey = JSON.parse(fs.readFileSync("circuits/verification_key.json"));
  const res = await snarkjs.groth16.verify(vKey, [commitment], proof);
  res === true ? console.log("Verification OK") : console.log("Invalid proof");*/
  //================================================================================================
 //TODO normalizar public keys
  const pk: BabyJubJubPoint = await pointMulBase(privKeyAlice);
  const Pubkey = new Circuit("pubkey");
  const { proofJson, publicSignals } = await Pubkey.generateProofGrowth16({ sk: privKeyAlice });
  // console.log(publicSignals);
  // console.log(publicSignals);
  console.log(proofJson);
  const resPubkey = await Pubkey.verifyProofGrowth16(proofJson, [babyJub.F.toObject(publicKeyAlice[0]).toString(), babyJub.F.toObject(publicKeyAlice[1]).toString()]);

  resPubkey === true ? console.log("Verification Pubkey OK") : console.log("Invalid Pubkey proof");

  //const { privKey, pubKey } = genKeypair();
  //const formattedPrivateKey = formatPrivKeyForBabyJub(privKey);

  //const privateKey = BigInt(privKey.toString());//ff.Scalar.random();  // Chave privada do receptor
  //console.log(`Private Key 2 ${privateKey}\n`);
  const field = babyJub.F;
  // const publicKey = babyJub.mulPointEscalar(babyJub.Base8, privKey);  // Chave pública correspondente
  //console.log(`Public Key ${publicKey}\n`);

  //console.log(`Public Key other print ${ field.toObject(publicKey[0]).toString(), field.toObject(publicKey[1]).toString() }\n`);
  
  //let keypairAlice = genKeypair();
  //let keypairBob = genKeypair();

  //const publicKeyAlice = babyJub.mulPointEscalar(babyJub.Base8, keypairAlice.privKey.toString());
  //const publicKeyBob = babyJub.mulPointEscalar(babyJub.Base8, keypairBob.privKey.toString());

  const nonce = BigInt(genKeypair().privKey.toString());
  const secret = await getSecret(utxo, publicKeyBob, nonce);
  // utxo, secret, chave privada -> secret + hash = commitment, commitment + privKey = nullifier
  /*  1 - dado o utxo o circuito deve verificar se a chave privada corresponde a chave publica
    2 - o circuito deve verificar se o nullifier informado corresponde ao gerado
 */

  /* describe("ECDSAPrivToPub", function () {
    this.timeout(1000 * 1000);

    // runs circom compilation
    let circuit: any;
    before(async function () {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "test_ecdsa.circom"));
    });

    // privkey, pub0, pub1
    var test_cases: Array<[bigint, bigint, bigint]> = [];

    // 4 randomly generated privkeys
    var privkeys: Array<bigint> = [88549154299169935420064281163296845505587953610183896504176354567359434168161n,
                                   37706893564732085918706190942542566344879680306879183356840008504374628845468n,
                                   90388020393783788847120091912026443124559466591761394939671630294477859800601n,
                                   110977009687373213104962226057480551605828725303063265716157300460694423838923n];
     

    var test_ecdsa_instance = function (keys: [bigint, bigint, bigint]) {
        let privkey = keys[0];
        let pub0 = keys[1];
        let pub1 = keys[2];

        var priv_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(privkey);
        var pub0_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub0);
        var pub1_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub1);

        it('Testing privkey: ' + privkey + ' pubkey.x: ' + pub0 + ' pubkey.y: ' + pub1, async function() {
            let witness = await circuit.calculateWitness({"privkey": priv_tuple});
            expect(witness[1]).to.equal(pub0_tuple[0]);
            expect(witness[2]).to.equal(pub0_tuple[1]);
            expect(witness[3]).to.equal(pub0_tuple[2]);
            expect(witness[4]).to.equal(pub0_tuple[3]);
            expect(witness[5]).to.equal(pub1_tuple[0]);
            expect(witness[6]).to.equal(pub1_tuple[1]);
            expect(witness[7]).to.equal(pub1_tuple[2]);
            expect(witness[8]).to.equal(pub1_tuple[3]);
            await circuit.checkConstraints(witness);
        });
    }

    test_cases.forEach(test_ecdsa_instance);
  });*/
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

async function generateCommitment2(secret: any) {
  const poseidon = await buildPoseidon();
  return poseidon([
    uint8R2bigInt(secret.c1[0].buffer),
    uint8R2bigInt(secret.c1[1].buffer),
    secret.c2,
  ]);
}

async function generateCommitment3(secret: string[]) {
  const poseidon = await buildPoseidon();
  const field = poseidon.F;
  const result = poseidon(secret);
  return field.toObject(result).toString();
}

async function generateCommitment4(secret: any) {
  const poseidon = await buildPoseidon();
  return uint8R2bigInt(
    poseidon([
      uint8R2bigInt(secret.c1[0].buffer),
      uint8R2bigInt(secret.c1[1].buffer),
      secret.c2,
    ])
  );
}

function hexToObject<T>(hexString: string): T {
  const strippedHex = hexString.startsWith("0x")
    ? hexString.slice(2)
    : hexString;

  const jsonString = Array.from({ length: strippedHex.length / 2 }, (_, i) =>
    String.fromCharCode(parseInt(strippedHex.slice(i * 2, i * 2 + 2), 16))
  ).join("");
  return JSON.parse(jsonString);
}

