import { genKeypair } from "maci-crypto";
import { getSecret } from "./Functions";
import { UTXO } from "./Interfaces";

export const buildOutputs = async (utxos: UTXO[]): Promise<any[]> => {
  const result: any[] = [];
  for (const utxo of utxos) {
    const nonce = BigInt(genKeypair().privKey.toString());
    result.push(await getSecret(utxo, utxo.owner, nonce));
  }
  return result;
};
