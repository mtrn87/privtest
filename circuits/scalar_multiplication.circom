pragma circom 2.1.6;


template ScalarMultiplication() {
    signal input Gx; 
    signal input Gy;
    signal input r; 
    signal output rGx; 
    signal output rGy;
    
    var pointX = Gx;
    var pointY = Gy;

    for (var i = 0; i < 254; i++) { 
        if ((r >> i) & 1 == 1) {            
            var [newX, newY] = BabyAdd(pointX, pointY, Gx, Gy);
            pointX <== newX;
            pointY <== newY;
        }        
        var [doubleX, doubleY] = BabyDbl(pointX, pointY);
        pointX <== doubleX;
        pointY <== doubleY;
    }
    
    rGx <== pointX;
    rGy <== pointY;
}