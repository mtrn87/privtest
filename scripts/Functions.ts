import { buildBabyjub, buildPoseidon, Point } from "circomlibjs";
import { randomBytes } from "crypto";
import { genKeypair } from "maci-crypto";
import { UTXO } from "./Interfaces";
import { poseidon2 } from "poseidon-lite";

export const getSecret = async (
  utxo: object,
  pubkey: Point,
  nonce: bigint
): Promise<any> => {
  return await encryptMessage(
    pubkey,
    hexToBigInt(objectToHex(utxo)), //fazer isso fora e ja receber bigint
    nonce
  );
};

export const generatePrivKey = (): string => {
  const ff = require("ffjavascript");
  return ff.Scalar.e(
    BigInt(`0x${randomBytes(31).toString("hex")}`).toString()
  ).toString();
};

export const generateCommitment = async (secret: any) => {
  const poseidon = await buildPoseidon();
  return bigIntToHex(
    uint8R2bigInt(
      poseidon([
        uint8R2bigInt(secret.c1[0].buffer),
        uint8R2bigInt(secret.c1[1].buffer),
        secret.c2,
      ])
    )
  );
};

export const generateCommitment5 = async (secret: any) => {
  return poseidon2([uint8R2bigInt(secret.c1), secret.c2]);
};

export const encryptMessage = async (
  publicKey: any,
  message: bigint,
  nonce: bigint
): Promise<any> => {
  console.log(`message -> ${message}\n`);
  const ff = require("ffjavascript");

  const poseidon = await buildPoseidon();
  const babyJub = await buildBabyjub();

  // c1 = nonce * G, onde G é o gerador da BabyJubJub
  const c1 = babyJub.mulPointEscalar(babyJub.Base8, nonce);
  console.log(`C1 -> ${c1}\n`);
  // P = nonce * PublicKey
  const sharedPoint = babyJub.mulPointEscalar(publicKey, nonce);
  console.log(`sharedPoint -> ${sharedPoint}\n`);
  // Usa a coordenada x do ponto compartilhado como uma "chave" e a mistura com a mensagem
  const sharedKey = poseidon([sharedPoint[0]]);
  console.log(`sharedKey -> ${sharedKey}\n`);

  let bigint = method1(sharedKey); // 42n

  const c2 = ff.Scalar.add(message, bigint);

  return { c1, c2 };
};

export type BabyJubJubPoint = {
  x: string;
  y: string;
};

export const pointMulBase = async (
  scalar: string
): Promise<BabyJubJubPoint> => {
  const babyjubjub = await buildBabyjub();
  const field = babyjubjub.F;
  const base8 = [
    field.e(
      "5299619240641551281634865583518297030282874472190772894086521144482721001553"
    ),
    field.e(
      "16950150798460657717958625567821834550301663161624707787222815936182638968203"
    ),
  ];
  const result = babyjubjub.mulPointEscalar(babyjubjub.Base8, scalar);
  return {
    x: field.toObject(result[0]).toString(),
    y: field.toObject(result[1]).toString(),
  };
};

export const method1 = (arr: any) => {
  let buf = arr.buffer;
  let bits = 8n;
  if (ArrayBuffer.isView(buf)) {
    bits = BigInt(64);
  } else {
    buf = new Uint8Array(buf);
  }

  let ret = 0n;
  for (const i of buf.values()) {
    const bi = BigInt(i);
    ret = (ret << bits) + bi;
  }
  return ret;
};
export const bigIntToHex = (bigInt: bigint): string => {
  let hexString = bigInt.toString(16);
  if (hexString.length % 2 !== 0) {
    hexString = "0" + hexString;
  }
  return `0x${hexString}`;
};

export const stringToHex = (str: string): string => {
  const hexString = Array.from(str)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  return `0x${hexString}`;
};

export const objectToHex = (obj: object): string => {
  const jsonString = JSON.stringify(obj);
  const hexString = Array.from(jsonString)
    .map((char) => char.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("");
  return `0x${hexString}`;
};

export const hexToBigInt = (hexString: string): bigint => {
  return BigInt(hexString);
};

export const decryptMessage = async (
  privateKey: bigint,
  ciphertext: any
): Promise<string> => {
  const ff = require("ffjavascript");
  const poseidon = await buildPoseidon();
  const babyJub = await buildBabyjub();
  // P = privateKey * c1
  const sharedPoint = babyJub.mulPointEscalar(ciphertext.c1, privateKey);

  // Usa a coordenada x do ponto compartilhado como a "chave"
  const sharedKey = poseidon([sharedPoint[0]]);
  console.log(`sharedKey -> ${sharedKey}\n`);

  let bigint = uint8R2bigInt(sharedKey);
  // Recupera a mensagem original
  const message = ff.Scalar.sub(ciphertext.c2, bigint);

  return bigIntToHex(message);
};
/*
export default function hexToObject<T>(hexString: string):T  {
    const strippedHex = hexString.startsWith("0x")
      ? hexString.slice(2)
      : hexString;
  
    const jsonString = Array.from({ length: strippedHex.length / 2 }, (_, i) =>
      String.fromCharCode(parseInt(strippedHex.slice(i * 2, i * 2 + 2), 16))
    ).join("");
    return JSON.parse(jsonString);
  }*/

export default function hexToObject<T>(hexString: string): T {
  try {
    const strippedHex = hexString.startsWith("0x")
      ? hexString.slice(2)
      : hexString;

    // Converte cada par de caracteres hexadecimais em um caractere ASCII, ignorando caracteres de controle
    const jsonString = Array.from(
      { length: strippedHex.length / 2 },
      (_, i) => {
        const charCode = parseInt(strippedHex.slice(i * 2, i * 2 + 2), 16);
        return charCode >= 32 && charCode <= 126 // ASCII imprimível
          ? String.fromCharCode(charCode)
          : ""; // Ignora caracteres de controle
      }
    ).join("");

    // Tenta fazer o parse da string JSON
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error("Erro ao converter hexadecimal para objeto JSON:", error);
    return {} as T;
  }
}

export const generateNullifier = async (
  commitment: bigint,
  privKey: BigInt
) => {
  const poseidon = await buildPoseidon();
  return bigIntToHex(
    uint8R2bigInt(
      poseidon([commitment, BigInt(privKey.toString())])
    )
  );
};

export const uint8R2bigInt = (arr: any) => {
  let buf = arr.buffer;
  let bits = 8n;
  if (ArrayBuffer.isView(buf)) {
    bits = BigInt(64);
  } else {
    buf = new Uint8Array(buf);
  }

  let ret = 0n;
  for (const i of buf.values()) {
    const bi = BigInt(i);
    ret = (ret << bits) + bi;
  }
  return ret;
};
