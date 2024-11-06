pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/bitify.circom";
include "../node_modules/circomlib/circuits/escalarmulfix.circom";

// I know private key sk such that corresponding public key is pk
// without revealing privKey

template Pubkey() {
    signal input sk;
    signal output pk[2];
    pk <== PointMulBase()(sk);
}

template PointMulBase() {
    signal input scalar;
    signal output outpoint[2];

    // babyjub base point, ref: https://eips.ethereum.org/EIPS/eip-2494
    var BASE8[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];
    var i;

    component scalar_bits = Num2Bits(253);
    scalar_bits.in <== scalar;

    component mulFix = EscalarMulFix(253, BASE8);
    for (i=0; i<253; i++) {
        mulFix.e[i] <== scalar_bits.out[i];
    }
    outpoint[0]  <== mulFix.out[0];
    outpoint[1]  <== mulFix.out[1];
}

component main = Pubkey();