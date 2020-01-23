function T (a, b){
    return Math.round(Math.random() * ( b - a )) + a;
}

var s = [];
function makeLanes(){
    // resets the s variable to store the spaces from exit to spawn
    // var s = [];
    //generate random coordinates for exit
    var exitX = T(1, 25);
    var exitY = T(1, 25);
    // for the spawn
    var spawnX;
    var spawnY;
    do{
        // create coordinates
        spawnX = T(1, 25);
        spawnY = T(1, 25);
        //as long as they are not the same
    } while (spawnX == exitX && spawnY == exitY);
    
    
    // create a series of numbers for x values
    for(var i = exitX; i <= spawnX; i + 0){
        //increasing the x value | 
        i++;
        //makes an array
        var t = [i, exitY];
        // moves it into an array
        s.push(t);
        // visual representation of "s"
        /* [
            [x, y],
            [x, y],
            [x, y]...
        ]; */
    }
    
    // create a series of numbers for x values
    for(var i = exitX; i >= spawnX && i != spawnX; i + 0){
        //increasing the x value | 
        i--;
        //makes an array
        var t = [i, exitY];
        // moves it into an array
        s.push(t);
        // visual representation of "s"
        /* [
            [x, y],
            [x, y],
            [x, y]...
        ]; */
    }
    
    // the corner
    s.push([spawnX, exitY]);
    
    // now creating the y values
    for(var i = exitY; i <= spawnY; i + 0){
        //increasing the x value | 
        i++;
        //makes an array
        var t = [spawnX, i];
        // moves it into an array
        s.push(t);
        // visual representation of "s"
        /* [
            [x, y],
            [x, y],
            [x, y]...
        ]; */
        
    }
    // create a series of decreasing numbers for y values
    for(var i = exitY; i >= spawnY; i + 0){
        //increasing the y value | 
        i--;
        //makes an array
        var t = [spawnX, i];
        // moves it into another array
        s.push(t);
        // visual representation of "s"
        /* [
            [x, y],
            [x, y],
            [x, y]...
        ]; */
    }
    
    return [ [spawnX, spawnY], [exitX, exitY]];
}

function makeMap(){
    
    //[[spawn coordinates],[ exit coordinates]]
    var t = makeLanes();
    
    for(var i = 0; i < s.length; i++){
        randomMap[s[i][1]][s[i][0]] = '1';
    }
    
    // map [y value] [x value]
    // the spawn
    randomMap[t[0][1]][t[0][0]] = '3';
    // the exit
    randomMap[t[1][1]][t[1][0]] = '2';
    
}
function reset(){
    for(var y =  0; y <  randomMap.length; y++){
        for(var x = 0; x < randomMap[1].length; x++){
            randomMap[y][x] = '0';
        }
    }
    
}
makeMap();