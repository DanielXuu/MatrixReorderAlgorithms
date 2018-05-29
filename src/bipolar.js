function get_L2_Distance(matrix){
    // initialization
    var d_matrix = [];
    var n = matrix.length;
    var i, j, k;

    for (i = 0; i < n; i++){
        d_matrix[i] = [];
        for (j = 0; j < n; j++){
            d_matrix[i][j] = 0;
        }
    }
    // calculate distance
    for (i = 0; i < n; i++){
        for (j = 0; j < n; j++){
            var d = 0;
            for (k = 0; k < n; k++){
                d += Math.pow(matrix[i][k] - matrix[j][k], 2);
            }
            d_matrix[i][j] = Math.sqrt(d);
        }
    }
    return d_matrix;
}

function maxUpperTriangle(matrix){
    var max = 0, max_row = 0, max_col = 0;
    var n = matrix.length;

    for (var i = 0; i < n; i++) {
        for (var j = i+1; j < n; j++){
            if (matrix[i][j] > max) {
                max = matrix[i][j];
                max_row = i;
                max_col = j;
            }
        }
    }
    return [max, max_row, max_col];
}


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


function bipolar_partition(graph){

    var order = []
    var comps = graph.components();
    var dist_adjacency = reorder.graph2valuemats(graph);

    for (var x = 0; x < comps.length; x++){
        var D = dist_adjacency[x];
        var n = D.length;
        var [max, max_row, max_col] = maxUpperTriangle(D);

        var pair_dist = [];

        for (var i = 0; i < n; i++) {
            for (var j = i + 1; j < n; j++){
                pair_dist.push([[comps[x][i], comps[x][j]], D[i][j]]);
            }
        }

        pair_dist.sort(function(a, b){
            return b[1] - a[1];
        });

        var left = [comps[x][max_col]];
        var right = [comps[x][max_row]];

        var end = false;
        var idx = 0;

        console.log();

        while (!end){

            if (left.includes(pair_dist[idx][0][0]) && !right.includes(pair_dist[idx][0][1]) && !left.includes(pair_dist[idx][0][1])){
                right.push(pair_dist[idx][0][1]);
            }
            else if (left.includes(pair_dist[idx][0][1]) && !right.includes(pair_dist[idx][0][0]) && !left.includes(pair_dist[idx][0][0])){
                right.push(pair_dist[idx][0][0]);
            }
            else if (!left.includes(pair_dist[idx][0][1]) && right.includes(pair_dist[idx][0][0]) && !right.includes(pair_dist[idx][0][1])){
                left.push(pair_dist[idx][0][1]);
            }
            else if (!left.includes(pair_dist[idx][0][0]) && right.includes(pair_dist[idx][0][1]) && !right.includes(pair_dist[idx][0][0])){
                left.push(pair_dist[idx][0][0]);
            }
            else {
                idx++;
                continue;
            }
            idx++;

            if (left.length + right.length == n) end = true;
        }

        var order_temp = left.concat(right.reverse());
        order = order.concat(order_temp);

    }

    return order;
}

function test(){
    var M = [
        [1, 0.564, 0.429, 0.577, 0.742, 0.472],
        [0.564, 1, 0.389, 0.476, 0.621, 0.394],
        [0.429, 0.389, 1, 0.548, 0.411, 0.639],
        [0.577, 0.476, 0.548, 1, 0.503, 0.688],
        [0.742, 0.621, 0.411, 0.503, 1, 0.461],
        [0.472, 0.394, 0.639, 0.688, 0.461, 1]
    ]

    var n = M.length;

    var D = [];
    for (var i = 0; i < n; i++) {
        D[i] = [];
        for (var j = 0; j < n; j++){
            D[i][j] = 1-M[i][j];
        }
    }

    console.log(D);

    
    var [max, max_row, max_col] = maxUpperTriangle(D);

    var pair_dist = [];

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++){
            pair_dist.push([[i, j], D[i][j]]);
        }
    }

    pair_dist.sort(function(a, b){
        return b[1] - a[1];
    });

    var left = [max_col];
    var right = [max_row];

    var end = false;
    var idx = 0;
    while (!end){

        if (left.includes(pair_dist[idx][0][0]) && !right.includes(pair_dist[idx][0][1]) && !left.includes(pair_dist[idx][0][1])){
            right.push(pair_dist[idx][0][1]);
        }
        else if (left.includes(pair_dist[idx][0][1]) && !right.includes(pair_dist[idx][0][0]) && !left.includes(pair_dist[idx][0][0])){
            right.push(pair_dist[idx][0][0]);
        }
        else if (!left.includes(pair_dist[idx][0][1]) && right.includes(pair_dist[idx][0][0]) && !right.includes(pair_dist[idx][0][1])){
            left.push(pair_dist[idx][0][1]);
        }
        else if (!left.includes(pair_dist[idx][0][0]) && right.includes(pair_dist[idx][0][1]) && !right.includes(pair_dist[idx][0][0])){
            left.push(pair_dist[idx][0][0]);
        }
        else {
            idx++;
            continue;
        }
        idx++;

        if (left.length + right.length == n) end = true;
    }

    var order = left.concat(right.reverse());
    console.log(order);
}


function test_old(){
    var M = [
        [1, 0.564, 0.429, 0.577, 0.742, 0.472],
        [0.564, 1, 0.389, 0.476, 0.621, 0.394],
        [0.429, 0.389, 1, 0.548, 0.411, 0.639],
        [0.577, 0.476, 0.548, 1, 0.503, 0.688],
        [0.742, 0.621, 0.411, 0.503, 1, 0.461],
        [0.472, 0.394, 0.639, 0.688, 0.461, 1]
    ]

    var n = M.length;

    var D = [];
    for (var i = 0; i < n; i++) {
        D[i] = [];
        for (var j = 0; j < n; j++){
            D[i][j] = 1-M[i][j];
        }
    }

    console.log(D);

    
    var [max, max_row, max_col] = maxUpperTriangle(D);

    var pair_row = [];
    var pair_col = [];
    var dist_row = [];
    var dist_col = [];

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++){
            if (i == max_row && j != max_col && j != max_row){
                pair_row.push([i, j]);
                dist_row.push(D[i][j]);
            }
            if (j == max_col && i != max_row && i != max_col){
                pair_col.push([i, j]);
                dist_col.push(D[i][j]);
            }
        }
    }

    // step one
    // Note the order
    var left = [max_col];
    var right = [max_row];

    // step 2
    var turn;

    var idx_r = indexOfMax(dist_row);
    var idx_c = indexOfMax(dist_col);

    if (dist_row[idx_r] > dist_col[idx_c]){
        left.push(pair_row[idx_r][1]);
        turn = true;
        dist_row.splice(idx_r, 1);
        pair_row.splice(idx_r, 1);
    }
    else{
        right.push(pair_col[idx_c][0]);
        turn = false;
        dist_col.splice(idx_c, 1);
        pair_col.splice(idx_c, 1);
    }

    // step 3
    var end = false;
    var idx;
    while (!end){

        if (!turn){
            idx = indexOfMax(dist_row);
            if (!right.includes(pair_row[idx][1])){
                left.push(pair_row[idx][1]);
                turn = true;
            }
            dist_row.splice(idx, 1);
            pair_row.splice(idx, 1);
        } else {
            idx = indexOfMax(dist_col);
            if (!left.includes(pair_col[idx][0])){
                right.push(pair_col[idx][0]);
                turn = false;
            }
            dist_col.splice(idx, 1);
            pair_col.splice(idx, 1);
        }

        if (left.length + right.length == n) end = true;
    }

    var order = left.concat(right.reverse());

    console.log(order);
}


function bipolar(M){

    var D = get_L2_Distance(M);
    var n = D.length;
    var [max, max_row, max_col] = maxUpperTriangle(D);

    var pair_dist = [];

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++){
            pair_dist.push([[i, j], D[i][j]]);
        }
    }
    console.log(pair_dist);

    pair_dist.sort(function(a, b){
        return b[1] - a[1];
    });

    var left = [max_col];
    var right = [max_row];

    var end = false;
    var idx = 0;
    while (!end){

        if (left.includes(pair_dist[idx][0][0]) && !right.includes(pair_dist[idx][0][1]) && !left.includes(pair_dist[idx][0][1])){
            right.push(pair_dist[idx][0][1]);
        }
        else if (left.includes(pair_dist[idx][0][1]) && !right.includes(pair_dist[idx][0][0]) && !left.includes(pair_dist[idx][0][0])){
            right.push(pair_dist[idx][0][0]);
        }
        else if (!left.includes(pair_dist[idx][0][1]) && right.includes(pair_dist[idx][0][0]) && !right.includes(pair_dist[idx][0][1])){
            left.push(pair_dist[idx][0][1]);
        }
        else if (!left.includes(pair_dist[idx][0][0]) && right.includes(pair_dist[idx][0][1]) && !right.includes(pair_dist[idx][0][0])){
            left.push(pair_dist[idx][0][0]);
        }
        else {
            idx++;
            continue;
        }
        idx++;

        if (left.length + right.length == n) end = true;
    }

    var order = left.concat(right.reverse());

    return order;
}


function bipolar_old(M){
    // old ones
    //test();

    var D = get_L2_Distance(M);
    var n = M.length;
    var [max, max_row, max_col] = maxUpperTriangle(D);

    var pair_row = [];
    var pair_col = [];
    var dist_row = [];
    var dist_col = [];

    for (var i = 0; i < n; i++) {
        for (var j = 0; j < n; j++){
            if (i == max_row && j != max_col && j != max_row){
                pair_row.push([i, j]);
                dist_row.push(D[i][j]);
            }
            if (j == max_col && i != max_row && i != max_col){
                pair_col.push([i, j]);
                dist_col.push(D[i][j]);
            }
        }
    }

    // step one
    // Note the order
    var left = [max_col];
    var right = [max_row];

    // step 2
    var turn;

    var idx_r = indexOfMax(dist_row);
    var idx_c = indexOfMax(dist_col);

    if (dist_row[idx_r] > dist_col[idx_c]){
        left.push(pair_row[idx_r][1]);
        turn = true;
        dist_row.splice(idx_r, 1);
        pair_row.splice(idx_r, 1);
    }
    else{
        right.push(pair_col[idx_c][0]);
        turn = false;
        dist_col.splice(idx_c, 1);
        pair_col.splice(idx_c, 1);
    }

    // step 3
    var end = false;
    var idx;
    while (!end){

        if (!turn){
            idx = indexOfMax(dist_row);
            if (!right.includes(pair_row[idx][1])){
                left.push(pair_row[idx][1]);
                turn = true;
            }
            dist_row.splice(idx, 1);
            pair_row.splice(idx, 1);
        } else {
            idx = indexOfMax(dist_col);
            if (!left.includes(pair_col[idx][0])){
                right.push(pair_col[idx][0]);
                turn = false;
            }
            dist_col.splice(idx, 1);
            pair_col.splice(idx, 1);
        }

        if (left.length + right.length == n) end = true;
    }

    var order = left.concat(right.reverse());

    //console.log(order);
    return order;
}
