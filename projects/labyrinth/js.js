
 /*
KeyCodes
left  = 37
up    = 38
right = 39
down  = 40
tab = 9
*/
function playSound(x) {
 var sound = document.getElementById('sound');
 sound.src = x;
 }

var w = window.innerWidth;
var h = window.innerHeight;

var firstTime = {
    door: true,
    key: true,
    coin: true
};

// if you have the key
var gotKey = false;

// the current position, different from spawn
var currentPosition = [3,3];

//sets element with id a to b
function set(a, b) {
    document.getElementById(a).innerHTML = b;
}
// random number generater between a and b
function T(a, b){
    return Math.round(Math.random()*(b-a)) + a;
}

// the map Number
var mapNum = 0;
var m = maps[0];
var exit = [1, 1];
// the background
var back = document.getElementById('back');

function spawn(){
    // gets the maximum number, puts into var
    getMaxNumbers();
    // gets the maximum letter, puts into var
    getMaxLetters();

    var x;
    var y;
    do{
        x = T(1,maxLetters);// :D
        y = T(1,maxNumbers);
        x = l[x];
    } while(!spaces[x+y] || typeof spaces[x+y] == 'undefined');
}




// x is a letter, y is a number
function makeWall(x, y, borderColor){

    // the default border color is green
    if(typeof borderColor == 'undefined'){
        var borderColor = 'black';
    }
        // calculates margins
    var leftM = x * 50;
    var topM = y * 50;

    // creates a div
    var wall = document.createElement('div');

    var width = speed;
    var height = speed;

    //adds the margins
    wall.style.left = leftM + 'px';
    wall.style.top = topM + 'px';

    // left
    if(typeof m[y][x-1] !== 'undefined'){
        if(m[y][x-1] == 1|| m[y][x-1] == 4){
            wall.style.borderLeft = '1px solid ' + borderColor;
            width--;
        }
    }
    // right
    if(typeof m[y][x+1] !== 'undefined'){
        if(m[y][x+1] == 1|| m[y][x+1] == 4){
            wall.style.borderRight = '1px solid ' + borderColor;
            width--;
        }
    }
    // top
    if(typeof m[y-1] !== 'undefined'){
        if(m[y-1][x] == 1|| m[y-1][x] == 4){
            wall.style.borderTop = '1px solid ' + borderColor;
            height--;
        }
    }
    // bottom
    if(typeof m[y+1] !== 'undefined'){
        if(m[y+1][x] == 1|| m[y+1][x] == 4){
            wall.style.borderBottom = '1px solid ' + borderColor;
            height--;
        }
    }

    /* the radiuses (radii ?) */

    // bottom right
    if(typeof m[y+1] !== 'undefined' && typeof m[y][x+1] !== 'undefined'){
        if((m[y+1][x] != 0) && (m[y][x+1] != 0)){
            wall.style.borderBottomRightRadius = '1em';
        }
    }
    // bottom left
    if(typeof m[y+1] !== 'undefined' && typeof m[y][x-1] !== 'undefined'){
        if((m[y+1][x] != 0) &&(m[y][x-1] != 0)){
            wall.style.borderBottomLeftRadius = '1em';
        }
    }
    // top right
    if(typeof m[y-1] !== 'undefined' && typeof m[y][x+1] !== 'undefined'){
        if((m[y-1][x] != 0) &&(m[y][x+1] != 0)){
            wall.style.borderTopRightRadius = '1em';
        }
    }
    // top left
    if(typeof m[y-1] !== 'undefined' && typeof m[y][x-1] !== 'undefined'){
        if((m[y-1][x] != 0) &&(m[y][x-1] != 0)){
            wall.style.borderTopLeftRadius = '1em';
        }
    }


    // gives it the class so that no need for more js styling
    wall.classList.add('space');
    // sets the height and width to fit the borders
    wall.style.width = width;
    wall.style.height = height;

    //add the picture to the space
    document.getElementById('back').appendChild(wall);
}

// x is a letter, y is a number
function makeDoor(x, y, color){
    // calculates margins
    var leftM = x * 50 + 4;
    var topM = y * 50 + 4;

    // creates a div
    var wall = document.createElement('div');


    //adds the margins
    wall.style.left = (leftM-4) + 'px';
    wall.style.top = (topM-4) + 'px';

    // gives it the class so that no need for more js styling
    wall.className = 'door';
    wall.style.background = 'light' + color;
    wall.id = '('+ x +','+ y +')';

    //add the picture to the space
    document.getElementById('back').appendChild(wall);
}

// x , y
function makeExit(x, y){
        // calculates margins
    var leftM = x * 50;
    var topM = y * 50;

    // creates a div
    var wall = document.createElement('div');

    //adds the margins
    wall.style.left = (leftM + 50/4) + 'px';
    wall.style.top = (topM + 50/4) + 'px';
    // gives it the class so that no need for more js styling
    wall.className = 'exit';

    //add the picture to the space
    document.getElementById('back').appendChild(wall);

    console.log('Made an exit at (' +x+ ', ' +y+ ')');

    exit = [x , y];
}

var money = 0;
function giveMoney(){
    // randomized amount of money added
    var earnings = T(15, 100);
    money = money + earnings;
    set('currency', money);

    // for display
    state('You just found ' + earnings + 'cs.');
    window.setTimeout(function (){
        state('You are on Map '+ mapNum + ' out of ' + maps.length);
    }, 500)
}

// x , y
function makeCoin(x, y){
    // calculates margins
    var leftM = x * 50;
    var topM = y * 50;

    // creates a div
    var wall = document.createElement('div');

    //adds the margins
    wall.style.left = (leftM + 50/4) + 'px';
    wall.style.top = (topM + 50/4) + 'px';
    // gives it the class so that no need for more js styling

    wall.id = '(' + x + ',' + y + ')';

    wall.className = 'coin';
    //add the picture to the space
    document.getElementById('back').appendChild(wall);

}


var up = 0;
var left = 0;


// changes the map
function mapChoose(){
        // the first number is first map
        // the second number is the max number of
        if(mapNum == maps.length){
            mapNum = 1;
        }else{
        mapNum++;
        }

        m = maps[mapNum - 1];

        addWalls();
}
// used to move on to the next map
function exitting(a) {
    // empties the background
    set('back','');

    // moves on to the next Map
    mapChoose();

    /*
    if(mapNum == 2){
        // generates
        reset();
        makeMap();
    }
    */

    // "types" the words \/
    say('You are on Map ' + mapNum + ' out of ' + maps.length + '.');
}
// for preset walls
function addWalls(){
    // looks at one column, the y value
    for(var i = 0; i < m.length; i++){
        // each row square, the x value
        for(var c = 0; c < m[1].length; c++){

            // the letter
            // 0-t-1-o-2-m-3-m-4-y   \/ the row       \/ the column
            var value = m[i][c];
            /*
            0: wall
            1: path
            2: exit
            3: spawn
            4: coin
            5: door
            6: key
            */

            // if there is a wall
            if (value == 0){
                var t = T(2, 3);
                if(t < 3){
                    makeWall(c, i);
                    // Swag!
                }
                else{
                    makeWall(c,i)
                }
            }


            // if there is a path
            if (value == 1){
                var coinChances = T(1,10);
                if (coinChances == 1){
                    m[i][c] = '4';
                    value = 4;
                }
            }

            if (value == 2){
                makeExit(c, i);
            }

            if (value == 3){
                /* ====> spawn point making code here <==== */

                var back = document.getElementById('back');
                var xSpawn = 100 - c * 50;
                var ySpawn = 100 - i * 50;

                // the margin variables
                left = xSpawn;
                up = ySpawn;

                // adds the margins
                back.style.left = xSpawn + 'px';
                back.style.top = ySpawn + 'px';
                // changes the current position
                currentPosition = [c , i];
                // puts in the conole
                console.log('You spawned at ' + currentPosition);

                // for the move func. so they don't walk off the map
                var maxX = m[1].length;
                var maxY = m.length;

                back.style.width = maxX*50 +'px';
                back.style.height = maxY*50 +'px';
            }

            // if the space is a coin
            if(value == 4){
                makeCoin(c, i);
            }

            //
            if(value == 5 || value == 5.5){
                makeDoor(c, i, 'blue');
            }

            // key
            if(value == 6){
                // calculates margins
                var leftM = c * 50;
                var topM = i * 50;

                // creates a div
                var wall = document.createElement('div');

                //adds the margins
                wall.style.left = (leftM + 50/4) + 'px';
                wall.style.top = (topM + 50/4) + 'px';
                // gives it the class so that no need for more js styling
                wall.className = 'exit';
                wall.id = 'key';
                wall.style.background = 'lightblue';
                wall.style.height = '12px';

                //add the picture to the space
                document.getElementById('back').appendChild(wall);

            }
        }
    }
}
/* ######### UNFINISHED ######### */
function doorCheck(x, y){
    // id five is door
    if(m[y][x] == '5'){
        // checks for a key
        if(checkInv('1')){
            // move to place
        }
        return false;
    }
    return true;
}

// the number of pixels
var speed = 50;

var val=""
var counter="0"
themessage=new Array()
themessage[0]="Issac, you have an amazing body and a wonderful personality. Would you marry me?"
themessage[1]="Wow, Issac, I never realised what a freakin guru you were! Keep it up dude!"
themessage[2]="You're everything I have ever wanted in a man."
themessage[3]="I love your way with words, your pictures are fantastic, and you are modest, too, which is very rare in guys these days."
themessage[4]="Rumour has it that you are in fact a bit of a sex god. Can you confirm that?"
themessage[5]="Oh Issac, you are such a stud! Who would have thought a nice guy like yourself would be so well-hung?"
themessage[6]="I love you. You're the greatest...I want to have your baby."
themessage[7]="Issac, you are truly wonderful. I really have to meet you someday."
themessage[8]="You know, when I get to meet you in person the first thing I am going to do is give you all my money, seeing as you are so cool."
themessage[9]="Will you be my best man? I know you don't know me and stuff, but I would be honoured, I really would."
themessage[10]="Gosh, Issac, you get me so hot just looking at you...oh, I can't believe I just typed that!"
themessage[11]="You look really familiar...are you a supermodel or something?"
themessage[12]="Hey, Issac, I was wondering...if you're not doing anything tonight...um, would you wanna see a movie?"
themessage[13]="Do you sleep on your stomach, Issac? Can I?"
themessage[14]="I never thought I could love someone I didn't know...but you have proved me wrong."
themessage[15]="You're bad to the bone, b-b-b-b-bad, b-b-b-b-b-bad."
themessage[16]="You are seriously the nicest guy I have ever known. The way you make me feel is just out of this world."
themessage[17]="Was your father a terrorist, Issac? Because you da bomb."
themessage[18]="It's almost like you control my words, that's how much power you have over me..."
themessage[19]="I really dig you, Issac, I dig you with a big spade...I'll pay if that's what it takes."
themessage[20]="Tommy, you are SO much better than Issac. You are twice as smart as Issac."

x=Math.floor(Math.random()*themessage.length)

function changer(){
if(counter>=themessage[x].length){return false}
else{
val+=themessage[x].charAt(counter)
document.myform.mytext.value=val
counter++
return false
}
}
function resetit(){
alert("Thanks for your feedback. You really are too nice.")
document.myform.mytext.value=""
counter="0"
val=""
x=Math.floor(Math.random()*themessage.length)
}

function move(keyCode) {
    // vertical is numbers
    var y = currentPosition[1];
    // horixontal is letters
    var x = currentPosition[0];

    var player = document.getElementById('player');

    // letter b
    if(keyCode == 66){
        // already a blue border?
        if(player.style.border == '2px solid rgb(135, 206, 235)'){
            console.log('removing the border');
            // good bye border
            player.style.border = '';
        } else {
            console.log('adding a border to player');
            // hello border
            player.style.border = '2px solid skyblue';
        }
    }

    // letter n
    if (keyCode == 78) {
        console.log('You ressed N :O Secret mask achived.');
        //if player is blue make him nick
        if (player.style.background == 'rgb(173, 216, 230)') {
            player.style.background = 'url(http://i.imgur.com/HQHPnkP.jpg)';
            player.style.backgroundRepeat = 'no-repeat';
            player.style.backgroundSize = 'cover';
        }
        // already nicks awesome face?
        else {
            player.style.background = 'rgb(173, 216, 230)';
            // there were unnessecary return's here // yes there was
        }
    }
    // left
    if (keyCode == 37) {
        if (left !== 100) {
            //same y   decrease x value
            if(m[y][x - 1] !== '0'){
                // there is not door
                if( m[y][x - 1]!== '5' ){
                    // move
                    back.style.left = (left + speed) + 'px';
                    left = left + speed;
                    currentPosition = [(x - 1) , y];
                }
                /* -- there is a door \/ -- */
                // if got a key
                else if(gotKey){
                    gotKey = false;
                    var door = document.getElementById('('+ (x-1) +','+ y +')');
                    door.style.display = 'none';

                    back.style.left = (left + speed) + 'px';
                    left = left + speed;
                    currentPosition = [(x - 1) , y];

                    say('You used your key to unlock the door.');
                }

                else if(firstTime.door){
                    state(help.door);
                }

            }
        }
    }
    // up
    if (keyCode == 38) {
        if (y !== 0) {
            // current position above one   \/ the same x value
            if(m[y - 1][x] !== '0'){

                if(gotKey || ( m[y - 1][x]!== '5' ) ){

                    back.style.top = (up + speed) + 'px';
                    up = up + speed;
                    currentPosition = [x, (y - 1)];

                }else{
                    if(firstTime.door){
                        state(help.door);
                    }
                }
            }
        }
    }
    // right
    if (keyCode == 39) {
        // not equal to the length of the map
        if (x !== (m[y].length-1)) {
            //same y increase by one \/
            if(m[y][x + 1] !== '0'){

                if(gotKey || ( m[y][x + 1]!== '5' ) ){

                    back.style.left = (left - speed) + 'px';
                    left = left - speed;
                    currentPosition = [(x + 1), y];

                }else{
                    if(firstTime.door){
                        state(help.door);
                    }
                }
            }
        }
    }

    // down
    if (keyCode == 40) {
        if (y != (m.length - 1)) {
            //down one \/                same x \/
            if(m[y + 1][x] !== '0'){
                // if there is not a door
                if( m[y + 1][x]!== '5'  ){
                    // moving
                    back.style.top = (up - speed) + 'px';
                    up = up - speed;
                    currentPosition = [x , (y + 1)];
                }
                /* -- continuing means there is a door -- */
                // if you got a key for the door ahead
                else if(gotKey){

                }
                else if(firstTime.door){
                    // tutorial with door
                    state(help.door);
                }

            }
        }
    }
    //letter f
    if(keyCode == 70) {
            document.getElementById('feedback').style.top = (h/12)*2;
            document.getElementById('feedback').style.left = w/3;
        if (document.getElementById('feedback').style.display == 'none') {
            document.getElementById('feedback').style.display = 'block';
            field.style.display = 'none';
        }
        else {
            document.getElementById('feedback').style.display = 'none';
            field.style.display = 'block';
        }
    }

    // looks at the new coordinates

    // vertical is numbers
    y = currentPosition[1];
    // horixontal is letters
    x = currentPosition[0];

    /* If on the exit */
    // same x value
    if (currentPosition[0] == exit[0]){
        // same y value
        if(currentPosition[1] == exit[1]){
            exitting();
        }
    }


    if(m[y][x] == 4){
        giveMoney();
        m[currentPosition[1]][currentPosition[0]] = 1;
        document.getElementById('('+ currentPosition[0] +',' + currentPosition[1] + ')').style.display = 'none';
    }


    if(m[y][x] == '6'){
        state('You have obtained the BLUE key!');
        window.setTimeout(function () { state('You are on Map '+ mapNum +' out of ' + maps.length + '.') }, 1000 )
        m[y][x] = '1';
        gotKey = true;
        document.getElementById('key').style.display = 'none';
    }
    //if on the scary squqre
    if(m[y][x] == '9') {
        state('Was that scary?');
        document.getElementById('scary').style.display = 'block';
        window.setTimeout(function (){document.getElementById('scary').style.display = 'none'},2000);
    }

    set('cPosition',currentPosition);
}








function scoreBoard() {
    var feild = document.getElementById('field');
    var scoreboard = document.getElementById('scoreboard');
    set('mazeCurrent', mapNum);

    if (feild.style.display == 'block') {
        feild.style.display = 'none';
        scoreboard.style.display = 'block';
    }
    else if (feild.style.display == 'none') {
        feild.style.display = 'block';
        scoreboard.style.display = 'none';
    }
}

var menuKey = 69;


var ready = true;
window.onkeydown = function (e) {
    set('player', '');
    if (!e.ctrlKey){
        if(ready){
            ready = false;
            move(e.keyCode);
            window.setTimeout(function (){ready = true}, 100);
        }
    }

    // the D
    if(e.keyCode == 68){
        if(field.style.display != 'none'){
            document.getElementById('editorsGUI').style.display = 'block';
            field.style.display = 'none';
        }
        else{
            document.getElementById('editorsGUI').style.display = 'none';
            field.style.display = 'block';
        }
    }

    if (e.keyCode == menuKey) {
        scoreBoard();
    }
};

function controls(input,e){
    menuKey = (e.which) ? e.which : event.keyCode;
    document.getElementById('menuKey').value = e.keyCode;// Such SWAG; Issac Replies: Swag;
    console.log(menuKey);
}
