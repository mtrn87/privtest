pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";

template PoseidonHasher() {
    signal input x[2];
    signal output y;
    y <== Poseidon(2)(x);
}

component main = PoseidonHasher();