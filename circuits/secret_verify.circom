pragma circom 2.1.6;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/babyjub.circom";
include "../node_modules/circomlib/circuits/mux1.circom";


template ScalarMultiplication() {
    signal input Gx; 
    signal input Gy;
    signal input r; 
    signal output rGx; 
    signal output rGy;
    
    var pointX = Gx;
    var pointY = Gy;

    var resultX = 0;
    var resultY = 1;

    component adder = BabyAdd();
    component doubler = BabyDbl();
    component selectX = Mux1();
    component selectY = Mux1();

    for (var i = 0; i < 254; i++) { 

        var bit = (r >> i) & 1;
        selectX.s <== bit;
        selectX.c[0] <== resultX;

        adder.x1 <== resultX;
        adder.y1 <== resultY;
        adder.x2 <== pointX;
        adder.y2 <== pointY;   

        selectX.c[1] <== adder.xout;

        selectY.s <== bit;
        selectY.c[0] <== resultY;

        adder.x1 <== resultX;
        adder.y1 <== resultY;
        adder.x2 <== pointX;
        adder.y2 <== pointY;   

        selectY.c[1] <== adder.yout;         

        resultX = selectX.out;
        resultY = selectY.out;               
        
        doubler.x <== pointX;
        doubler.y <== pointY;

        pointX = doubler.xout;
        pointY = doubler.yout;
    }
    
    rGx <== pointX;
    rGy <== pointY;
}

template SecretVerify() {
    signal input publicKeyX;    
    signal input publicKeyY;   
    signal input c1x;          
    signal input c1y;          
    signal input c2;      
    
    signal input message;       
    signal input r;

    var BASE8[2] = [
        5299619240641551281634865583518297030282874472190772894086521144482721001553,
        16950150798460657717958625567821834550301663161624707787222815936182638968203
    ];            
    
    var Gx = BASE8[0];
    var Gy = BASE8[1];
    
    signal rGx;
    signal rGy;

    component c1ScalarMult = ScalarMultiplication();

    c1ScalarMult.Gx <== Gx;
    c1ScalarMult.Gy <== Gy;
    c1ScalarMult.r <== r;
    rGx <== c1ScalarMult.rGx;
    rGy <== c1ScalarMult.rGy;   

    c1x === rGx;
    c1y === rGy;
   
    signal sharedPointX;
    signal sharedPointY;

    component sharedScalarMult = ScalarMultiplication();

    sharedScalarMult.Gx <== publicKeyX;
    sharedScalarMult.Gy <== publicKeyY;
    sharedScalarMult.r <== r;
    sharedPointX <== sharedScalarMult.rGx;
    sharedPointY <== sharedScalarMult.rGy;
    signal sharedKey;
    sharedKey <== Poseidon(1)([sharedPointX]);
   
    signal calculatedC2;
    calculatedC2 <== message + sharedKey;
    c2 === calculatedC2;
}

component main = SecretVerify();