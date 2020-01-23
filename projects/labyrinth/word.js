
 /*
Only touch the variables, slides0, slides1, slides2, ...
Those are going to be displayed on the box.
Note! ADD them to the slides ARRAY or they won't be displayed!
*/

//sets element with id a to b
function set(a, b) {
    document.getElementById(a).innerHTML = b;
}

var help = {
    door: 'Doors are locked and require a key to be able to walk through.',
    key: 'Keys are able to unlock doors only of the same color. Most levels do not have more than one color.',
    coin: 'CS is the currency used to buy upgrades or improvements'
};

var slideNumber = 0; //the current slide being displayed
var i = 0; //the number of letters to compare to length

//the words for the buttons
var buttonWords = ['Continue','Continue','Continue'];

//Put words inside these variables
var slides0 = 'Tommy Is Awesome';
var slides1 = 'Issac Is Less Awesome';
var slides2 = 'Mr. Tenyotkin Is The Least Awesome';

//array with every slide, manually update when adding new slides
var slides = [slides0, slides1, slides2];

//shows the button
function showButton(){
        document.getElementById('theButton').style.display = 'block';
}
//hides the button
function hideButton(){
    document.getElementById('theButton').style.display = 'none';
}

//starts with the first slides
var x = slides[0];
function nextSlide(){

        // no button
        hideButton();
        
        //if it is finished with the whatever
        if (i == (x.length+1)){
                //after a delay... do stuff
                window.setTimeout( function(){
                        //changes the button's words
                        set('theButton',buttonWords[slideNumber]);
                        //display the button
                        showButton();
                        //if it reached the end of the slides
                        if (slideNumber == slides.length - 1){
                                // restarts the slides from the vary beginning
                                slideNumber = 0;
                        } else { //if there is still more to go
                                // goes to the next slide
                                slideNumber++;
                        }
                        // sets it to either the next slide or the first
                        x = slides[slideNumber];
                        //starts at the first letter
                        i = 0;
                }
                ,100);
                //stops so that the button must be used to continue
                return;
        }
        // actual display
        window.setTimeout( function (){
                
                // x.substring(0,1) displays the first letter to the i letter
                set('story',x.substring(0,i)); //displays the substring of x
                
                i++;//adds to the number of letters
                
                nextSlide();}// self-calling function
        ,30);// every thirty milliseconds, it adds a letter
}

// same as above, but with given parameters
function say(text){

        // no button
        hideButton();
        
        //if it is finished with the whatever
        if (i == (text.length+1)){
            i = 0;
            //stops the function
            return;
                
        }
        
        // adds the display
        
        // x.substring(0,1) displays the first letter to the i letter
        set('story', text.substring(0, i)); //displays the substring of x
        //adds to the number of letters
        i++;
        window.setTimeout( function (){
            say(text);}// self-calling function
        ,30);// every thirty milliseconds, it adds a letter
}
// same as above, but instant
function state(text){

        // no button
        hideButton();
        
        set('story', text); //displays the substring of x
        
        window.setTimeout(function (){set('story','You are on Map ' +mapNum+ ' out of ' + maps.length)},2000);
}