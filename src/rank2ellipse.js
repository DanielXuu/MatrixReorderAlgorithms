function corr(x, y){
    var mean_x = x.reduce((a, b) => a + b, 0) / x.length;
    var mean_y = y.reduce((a, b) => a + b, 0) / y.length;

    var Vx = 0, Vy = 0, Vxy = 0;
    for (var i = 0; i < x.length; i++){
        Vx += (x[i] - mean_x)*(x[i] - mean_x);
        Vy += (y[i] - mean_y)*(y[i] - mean_y);
        Vxy += (x[i] - mean_x)*(y[i] - mean_y);
    }

    var p = Vxy/Math.sqrt(Vx*Vy);

    //return parseFloat(p.toFixed(12));
    return p;
}

function pearsonCorr(matrix){
    var n = matrix.length;
    var i, j;
    // init pc matrix
    var pc_matrix = []
    for (i = 0; i < n; i++){
        pc_matrix[i] = [];
        for (j = 0; j < n; j++){
            pc_matrix[i][j] = 1;
        }
    }

    // calculate pc matrix
    for (i = 0; i < (n-1); i++) {
        for (j = i+1; j < n; j++) {
            var p = corr(matrix[i], matrix[j]);
            // symetric
            pc_matrix[i][j] = p;
            pc_matrix[j][i] = p;
        }
    }

    return pc_matrix;
}

function upperTriangle(matrix){
    var n = matrix.length;
    var i, j;

    var ut_matrix = []
    for (i = 0; i < n; i++){
        ut_matrix[i] = [];
        for (j = 0; j < n; j++){
            ut_matrix[i][j] = 0;
        }
    }

    i = 1, j = 1;
    while (i <= n && j <= n) {
        if(matrix[i][i] == 0) {
            for(k = i+1; k <= n; k++) {
                if(matrix[k][i] != 0) {
                    M.components[i-1] = M.row(1).add(M.row(k));
                    break;
                }
            }
        }
        if(M.get(i,i) != 0) {
            for(k = i+1; k<=rows; k++) {
                var multiplier = M.get(k,i) / M.get(i,i);
                M.components[k-1] = M.row(k).subtract(M.row(i).multiplyBy(multiplier));
            }
        }
        i++;
        j++;
    }
    return M;

}

// function rank(matrix){
//     matrix 
//     var n = matrix.length;
//     var M = this.toUpperTriangular();
//     rank = 0;
//     for(i = 1; i <= n; i++) {
//         for(j = 1; j <= n; j++) {
//             if(Math.abs(M.get(i,j)) > Zero) {
//                 rank++;
//                 break;
//             }
//         }
//     }
//     return rank;
// }

function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

function rank2e(M){
    var n = M.length;
    var D = get_L2_Distance(M);
    var R_pre = pearsonCorr(D);
    var R_next = pearsonCorr(D);

    var M_ = new Matrix(R_next);
    var rank = M_.rank();

    var count = 0;
    while (rank > 2) {
        R_pre = R_next;
        R_next = pearsonCorr(R_pre);
        M_ = new Matrix(R_next);
        rank = M_.rank();
    }

    //console.log(rank);

    // get eigen vectors
    var eigen = numeric.eig(R_next);

    // var usv = numeric.svd(M);

    var eigenval_array = eigen.lambda.x;
    var eigen_vector = eigen.E.x;

    // eigenvalues
    //console.log(eigenval_array);

    var eigen_idx_1 = indexOfMax(eigenval_array);
    eigenval_array[eigen_idx_1] = -1000000000;
    var eigen_idx_2 = indexOfMax(eigenval_array);

    var eigenvec_1 = [];
    var eigenvec_2 = [];

    for (var i = 0; i < eigen_vector.length; i++){
        eigenvec_1.push(eigen_vector[i][eigen_idx_1]);
        eigenvec_2.push(eigen_vector[i][eigen_idx_2]);
    }
    // eigenvectors for first two components
    // console.log(eigenvec_1);
    // console.log(eigenvec_2);

    var right = []
    var left = []
    for (var i = 0; i < n; i++){
        if (eigenvec_1[i] >= 0){
            right.push([eigenvec_2[i], i]);
        }
        else {
            left.push([eigenvec_2[i], i]);
        }
    }
    right = right.sort(function(a, b){
        return a[0] - b[0];
    });

    left = left.sort(function(a, b){
        return b[0] - a[0];
    });
    //console.log(left);
    //console.log(right);
    var order = left.concat(right).map(x => x[1]);
    //console.log(order);
    return order;
}

function rank2e_svd(M){
    var n = M.length;
    var D = get_L2_Distance(M);
    var R_pre = pearsonCorr(D);
    var R_next = pearsonCorr(D);

    var M_ = new Matrix(R_next);
    var rank = M_.rank();

    var count = 0;
    while (rank > 2) {
        R_pre = R_next;
        R_next = pearsonCorr(R_pre);
        M_ = new Matrix(R_next);
        rank = M_.rank();
    }

    console.log(rank);
    if(rank!=2){
        alert('Rank calculation fails on this particular example due to precison error.');
        return;
    }


    // get first two PCs
    var usv = numeric.svd(R_next);
    var eigenvec_1 = [];
    var eigenvec_2 = [];
    var eigen_vector = usv.U;
    for (i = 0; i < n; i++){
        eigenvec_1.push(eigen_vector[i][0]);
        eigenvec_2.push(eigen_vector[i][1]);
    }
    //console.log(usv.U);


    // eigenvectors for first two components
    var right = []
    var left = []
    for (var i = 0; i < n; i++){
        if (eigenvec_1[i] >= 0){
            right.push([eigenvec_2[i], i]);
        }
        else {
            left.push([eigenvec_2[i], i]);
        }
    }

    right = right.sort(function(a, b){
        return a[0] - b[0];
    });

    left = left.sort(function(a, b){
        return b[0] - a[0];
    });

    var order = left.reverse().concat(right).map(x => x[1]);

    return order;
}