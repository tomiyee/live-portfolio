/*
0: empty space
1: a key
*/

// the inventory has four spaces
var inventory = ['0', '0', '0', '0'];

// the parameter is what you are seaching for
// it returns the first space with the given id
function checkInv(theItemId) {
    // looks through all of the inventory
    for (var i = 0; i < inventory.length; i++) {
        // finds a match
        if (inventory[i] == theItemId) {
            // returns the first match as a string
            return '' + i + '';
        }
    }
    // if no match was found, returns a boolean
    return false;
}

/*
 display
*/
function display() {
    var inv = document.getElementById('inv');
    inv.innerHTML = '';
    // creates a div conatianing each item
    for (var i = 0; i < inventory.length; i++) {
        var t = document.createElement('div');
        t.innerHTML = inventory[i];
        inv.appendChild(t);
    }
}

// adds an item to the inventory
function add(itemId) {
    // uses the function to find first empty space
    var free = checkInv('0');
    if (free) {
        alert(free);
        inventory[free] = itemId;
        // temp
        document.getElementById('inv').innerHTML = '';
        display();
    } else {
        alert('No more room!')
    }
}
// replaces an item
function replace(itemId, where){
    // makes the specific space an item
    inventory[where] = itemId;    
}
