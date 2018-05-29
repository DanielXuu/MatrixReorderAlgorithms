
function mean_row_moments(matrix){
    var n = matrix.length;
    var ret = [];
    for (var i = 0; i < n; i++){
        var jm = 0;
        var m = 0;
        for (var j = 0; j < n; j++){
            jm += (j+1) * matrix[i][j];
            m += matrix[i][j];
        }
        ret.push(jm/m);
    }
    return ret;
}

function mean_col_moments(matrix){
    var n = matrix.length;
    var ret = [];
    for (var j = 0; j < n; j++){
        var im = 0;
        var m = 0;
        for (var i = 0; i < n; i++){
            im += (i+1) * matrix[i][j];
            m += matrix[i][j];
        }
        ret.push(im/m);
    }
    return ret;
}

function permute_mrm(matrix, order){
    var ret = [];
    var n = matrix.length;

    for (var i = 0; i < n; i++){
        ret[i] = [];
        for (var j = 0; j < n; j++){
            ret[i][j] = matrix[order[i]][order[j]];
        }
    }
    return ret
}

function checkEqual(a, b){
    for (var i = 0; i < a.length; i++){
        if (a[i]!=b[i]) return false;
    }
    return true;
}
function mrm(M){
    n = M.length;
    var row_moments = mean_row_moments(M);

    // get order by row moments
    var order_temp = [];
    for (var i = 0; i < n; i++){
        order_temp.push([row_moments[i], i]);
    }
    order_temp = order_temp.sort(function(a, b){
        return a[0] - b[0];
    });
    var order = order_temp.map(x => x[1]);

    var matrix_temp = permute_mrm(M, order);

    var order_new = [];
    var turn = false;
    var count = 0;
    do {
        if (count) order = order_new;

        var moments;
        if (turn) moments = mean_row_moments(matrix_temp);
        else moments = mean_col_moments(matrix_temp);

        order_temp = [];
        for (var i = 0; i < n; i++){
            order_temp.push([moments[i], order[i]]);
        }
        order_temp = order_temp.sort(function(a, b){
            return a[0] - b[0];
        });
        order_new = order_temp.map(x => x[1]);

        matrix_temp = permute_mrm(M, order_new);

        turn = !turn;
        count ++;
        console.log(count);

        if (count > 200000) {
            alert('Running for too long: Orders cannot converge in the given time.');
            return;
        }
        
    }
    while(!checkEqual(order, order_new));
    console.log(order);
    return order

}