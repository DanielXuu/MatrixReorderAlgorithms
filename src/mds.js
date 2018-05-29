function mds(M) {
    var D = get_L2_Distance(M);
    var n = D.length;
    var i, j;

    // Squared distance matrix
    var DD = [];
    for (i = 0; i < n; i++){
        DD[i] = [];
        for (j = 0; j < n; j++){
            DD[i][j] = -0.5 * D[i][j] * D[i][j];
        }
    }

    var row_mean = [];
    var col_mean = [];

    for (i = 0; i < n; i++){
        var acc = 0;
        for (j = 0; j < n; j++){
            acc += DD[i][j];
        }
        row_mean.push(acc/n);
    }

    for (j = 0; j < n; j++){
        var acc = 0;
        for (i = 0; i < n; i++){
            acc += DD[i][j];
        }
        col_mean.push(acc/n);
    }

    var total_mean = 0;
    for (i = 0; i < n; i++){
        total_mean += row_mean[i];
    }
    total_mean = total_mean/n;

    // double centring
    for (i = 0; i < n; i++) {
        for (j = 0; j < n; j++) {
            DD[i][j] += total_mean - row_mean[i] - col_mean[j];
        }
    }

    // svd
    var usv = numeric.svd(M);
    var eigenval = [];
    for (i = 0; i < n; i++){
        eigenval.push(Math.sqrt(usv.S[i]));
    }

    // eigen norm
    var U = [];
    for (i = 0; i < n; i++){
        U.push(usv.U[i][0] * eigenval[0]);
    }
    console.log(U);

    // permute
    var perm = [];
    for (i = 0; i < n; i++){
        perm.push([U[i], i]);
    }
    perm = perm.sort(function(a, b){
        return a[0] - b[0];
    });
    var order = perm.map(x => x[1]);

    return order;
};