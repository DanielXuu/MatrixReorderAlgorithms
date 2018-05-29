function sp(adjMatrix) {
    var n = adjMatrix.length;

    //degree matrix
    var degMatrix = new Array(n);
    for (var i = 0; i < n; i++) {
        degMatrix[i] = new Array(n);
        for (var j=0; j<n; j++){
            degMatrix[i][j] = 0;
        }
    }

    function getSum(total, num) {
        return total + num;
    }

    for (var i = 0; i < n; i++) {
        var degree = adjMatrix[i].reduce(getSum);
        degMatrix[i][i]= degree;
    }

    //laplacian matrix D-A
    var lapMatrix = new Array(n);
    for (var i = 0; i < n; i++) {
        lapMatrix[i] = new Array(n);
    }

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++) {
            var item = degMatrix[i][j]-adjMatrix[i][j];
            lapMatrix[i][j]= item;
        }
    }

    //gershgorin bound
    function gershgorin(B) {
        var max = 0;
        for (var i = 0; i < n; i++) {
            var Bii = B[i][i];
            for (var j = 0; j < n; j++)
                if (j != i)
                    Bii += Math.abs(B[i][j]);
            if (Bii > max)
                max = Bii;
        }
        return max;
    }

    //Bˆ = g · I − B
    var g = gershgorin(lapMatrix);
    var B2 = new Array(n);
    for (var i = 0; i < n; i++) {
        B2[i] = new Array(n);
    }

    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            if (i == j)
                B2[i][j] = g - lapMatrix[i][j];
            else
                B2[i][j] = 0 - lapMatrix[i][j];
        }
    }

    //poweriteration
    //dot product
    function dot(a, b) {
        var c = 0,
            i = -1,
            n = Math.min(a.length, b.length);
        while (++i < n) c += a[i] * b[i];
        return c;
    };

    // normalizing vector v/|v|
    function normalize(v) {
        var norm = Math.sqrt(dot(v,v)), //|v|
            i = v.length;
        if (norm === 0 || Math.abs(norm - 1) < 1e-9) return 1;
        while (i-- > 0)
            v[i] /= norm;
        return norm;
    }

    var eps = 1e-9,
        n = B2.length,
        b = Array(2),
        eigenvalue = Array(2),
        init = [],
        bk, d,
        xhat = Array(n),
        s = 100;

    init[0] = Array.apply(null, Array(n)).map(Number.prototype.valueOf,1);
    init[1] = [];
    for (var j = 0; j < n; j++) {
        init[1].push(Math.random());
    }

    for (var i = 0; i < 2; i++) {
        b[i] = init[i].slice(); // copy
        eigenvalue[i] = normalize(b[i]);

   }


    for (var k = 0; k < 2; k++) {
        bk = b[k];
        while (s-- > 0) {
            // Orthogonalize vector
            for (var j = 0; j < k; j++) {
                d = dot(bk, b[j]);
                for (var i = 0; i < n; i++)
                    bk[i] -= d*b[j][i]; //xi = xi - (xi*xj)xj
            }

            for(var i=0; i<n; i++) {
                xhat[i] = 0;
                for (var j=0; j<n; j++)
                    xhat[i] += B2[i][j] * bk[j]; //power iteration xi^ = M*xi
            }
            console.log(xhat,k,s);
            eigenvalue[k] = normalize(xhat);
            if (dot(xhat, bk) < (1 - eps)) {//% halt when direction change is negligible
                bk = xhat;
                xhat = b[k];
                b[k] = bk;  // swap b/xhat
            }else{
                break;
            }
        }
    }


    var eig = b[1];

    // permute
    var perm = [];
    for (i = 0; i < n; i++){
        perm.push([eig[i], i]);
    }
    perm = perm.sort(function(a, b){
        return a[0] - b[0];
    });
    var order = perm.map(x => x[1]);
    return order;
    
};