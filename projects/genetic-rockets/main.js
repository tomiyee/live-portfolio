/* ============================================== */
/* # EVOLUTION SIMULATOR (WITH ROCKETS)         # */
/* #                                 By Tommy H # */
/* #                               Nov 29, 2016 # */
/* ============================================== */
/* #                                            # */
/* #     This is a genetic algorithm using      # */
/* # rockets that are aiming to reach a target. # */
/* #                                            # */
/* #     This program calculates the fitness    # */
/* # according to the distance from the target  # */
/* # location, multiplied by 10 if the rocket   # */
/* # reached the target, divided by 10 if the   # */
/* # it crashed, and increases with the time to # */
/* # reach the target.                          # */
/* #                                            # */
/* #     To reproduce, the program throws the   # */
/* # rocket with the highest fitness level into # */
/* # a mating pool 100 times, and the rest are  # */
/* # added proportionally (half the fitness     # */
/* # means half the entries). Each parent is    # */
/* # chosen at random from the mating pool and  # */
/* # the genes are crossed over (see function). # */
/* #                                            # */
/* #     The genes are simply an array of a num # */
/* # of vectors which are applied in sequential # */
/* # order each simulation tick.                # */
/* #                                            # */
/* # - - - - - - - - - - - - - - - - - - - - -  # */
/* #     Similar to the Maze Generator, this    # */
/* # project was inspired by Daniel Shiffman.   # */
/* #                                            # */
/* # Youtube Link To Be Provided:               # */
/* # https://youtu.be/bGz7mv2vD6g               # */
/* ============================================== */



/* global $ */

// the dimensions of the canvas
var W = 640*3/4;
var H = 480*3/4;
// Adjustable settings
var Settings = {
    // the dimensions of the canvas
    WIDTH: W,
    HEIGHT: H,
    // Mutation rate in decimal
    MUTATION_RATE: 0.1,
    // the number of ticks that the rocket will last
    LIFE_SPAN: 200,
    // the size of the population
    POPULATION_SIZE: 100,
    // the dimensions of the rocket (collision not affected)
    ROCKET_WIDTH: 5,
    ROCKET_HEIGHT: 25,
    // the fps for the loop
    FRAMES_PER_SECOND: 100,
};
// variables which the user need not be concerned with
var Global = {
    // the canvas element
    canvasElement: null,
    // the context of the canvas given above
    canvasContext: null,
    // the number of generations that have passed
    generationNumber: 0,
    // the Vector which will represent the target location
    target: null,
    // the object that will contain the population and have them evolve
    population: null,
    // the number of ticks which have passed
    count: 0,
    // tracks all of the obstacles which the user places
    obstacles: [],
    // will contain the ID of the draw function Interval
    drawLoopIntervalID: null,
    // the placeholder for when you draw
    wallGhost: null,
    // the current obstacle placement mode: 0 is placeableObstacle, 1 is drawable Obstacle
    obstaclePlacementMode: 1,
};


var DrawableObstacle = {
    mouseDown: function (e) {
        var mouse = relativeCoords(e, Global.canvasElement);
        if(dragging) {
            Global.wallGhost.alpha = 1;
            Global.obstacles.push(Global.wallGhost);
            Global.wallGhost = null;
            dragging = false;
        } else {
            Global.wallGhost = new Obstacle(0, 0);
            Global.wallGhost.x = mouse.x;
            Global.wallGhost.y = mouse.y;
            Global.wallGhost.alpha = 0.5;
            dragging = true;
        }
    }, // where the ghost wall starts
    mouseMove: function (e) {
        if(!Global.wallGhost)
            return;
        var mouse = relativeCoords(e, Global.canvasElement);
        Global.wallGhost.width = mouse.x - Global.wallGhost.x;
        Global.wallGhost.height = mouse.y - Global.wallGhost.y;
    }, // determines the width and height
    mouseUp  : function (e) {
        Global.wallGhost.alpha = 1;
        Global.obstacles.push(Global.wallGhost);
        Global.wallGhost = null;
        dragging = false;
    }, // makes the ghost wall permanent
}
var PlaceableObstacle = {
    mouseDown: function (e) {
        var x = e.clientX - $(Global.canvasElement).offset().left + document.getElementsByTagName('body')[0].scrollLeft;
        var y = e.clientY - $(Global.canvasElement).offset().top + document.getElementsByTagName('body')[0].scrollTop;
        var obst = new Obstacle(x, y);
        obst.draw();
        Global.obstacles.push(obst);
    }, // makes the ghost permanent
    mouseMove: function (e) {
        var mouse = relativeCoords(e, Global.canvasElement);
        Global.wallGhost = new Obstacle(mouse.x, mouse.y);
        Global.wallGhost.alpha = 0.5;
    }, // draws the ghost wall
    mouseLeave:function (e) {
        Global.wallGhost = null;
    }, // disappears the ghost wall
}



var dragging = false;


/*
 * The Setup function
 */
function start () {
    // NEW CODE
    $('.tabs').tabs();
    $('.btn').bind('click', evolutionClickHandler);
    // initializes the canvas which will contain the rockets
    initCanvas();
    // initializes the settings options
    initAccordion();
    // initializes the tool tips that appear
    initToolTips();
    // initializes the sliders
    initSliders();
    // binds the key down handler
    window.addEventListener('keydown', keyDownHandler);
}



/**
 * The click handler for the button that starts the genetic algorithm
 */
function evolutionClickHandler () {
  if(!Global.evolutionInProgress){
    beginEvolution();
    this.innerHTML = "Stop Evolution";
  }
  else {
    pauseEvolution();
    this.innerHTML = "Begin Evolution";
  }
}



/*
 * The Loop or tick function
 */
function draw () {
    Global.canvasContext.fillStyle = 'black';
    Global.canvasContext.fillRect(0,0, Settings.WIDTH, Settings.HEIGHT);
    // updates the population
    Global.population.update();
    // draws all of the obstacles
    for(var o = 0; o < Global.obstacles.length; o++)
        Global.obstacles[o].draw();

    if(Global.wallGhost)
    {
        Global.wallGhost.draw();
    }

    // draws the target
    drawTarget();

    // updates the count variable and displays the count
    Global.count ++;
    if(Global.count == Settings.LIFE_SPAN)
    {
        Global.population.evaluate();
        Global.population.breed();
    }
    $(".counter").html(Global.count);

}



/*
 * Prepares the accordian properties
 */
function initAccordion() {
    var accordion = $('.accordion');
    accordion.accordion({
        collapsible: true,
        active: false
    });
    accordion.find( $('h3') ).css({
        'padding': '5px',
        'border-width':'2px',
        'border-radius':'10px',
        'font-family':'"bree serif", serif',
        "font-size":"1em"
    });
    accordion.find( $('div') ).css({
        'padding': '5px',
        'border-width':'2px',
        'font-family':'"Libre Baskerville", serif',
        'font-size': '0.9em',
        'font-weight': 'bold'
    });
    accordion.css('font-size', '1em');
}



/*
 * Initializes each of the slider options on the screen
 */
function initSliders() {

    // setup the sliders
    $( "#properties > div" ).each(function() {
      // read initial values from markup and remove that
      var value = parseInt( $( this ).text(), 10 );
      $( this ).empty().slider({
        value: value,
        max: 200,
        range: "min",
        animate: true,
        orientation: "horizontal",
        height: '4',
        create: function() {
            $(this).children('.ui-slider-handle').text( $( this ).slider( "value" ) );
        },
        slide: function( event, ui ) {
            $(this).children('.ui-slider-handle').text( ui.value);
        }
      });
    });
    // the sliders themselves
    $('.ui-slider').css({
        "height": "4px",
        "padding": "4px",
        "margin-bottom": "1em",
        "margin-top": "1em",
        "text-align": "center"
    });
    // the sliders' handles
    $('.ui-slider-handle').css({
        "width": "2em",
        "height": "1.25em",
    });


    $('.populationSizeSlider').slider({
        max: 500,
    });
    // the fps slider
    $('.fpsSlider').slider({
        slide: function( event, ui ) {
            $(this).children('.ui-slider-handle').text( ui.value);
            Settings.FRAMES_PER_SECOND = ui.value;
            pauseEvolution();
            resumeEvolution();
        }
    });
    // the mutation rate slider
    $('.mutationRateSlider').slider({
        max:  100,
        step: 0.1,
        slide: function( event, ui ) {
            $(this).children('.ui-slider-handle').text( ui.value);
            Settings.MUTATION_RATE = ui.value/100;
        }
    });

}



/*
 * Prevents the user from entering anything other than numbers
 * in inputs of the given class or "numOnly" by default
 */
function numLockInputs(htmlClass) {
    var c = htmlClass || '.numOnly';
    $(c).keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
             // Allow: Ctrl+A
            (e.keyCode == 65 && e.ctrlKey === true) ||
             // Allow: Ctrl+C
            (e.keyCode == 67 && e.ctrlKey === true) ||
             // Allow: Ctrl+X
            (e.keyCode == 88 && e.ctrlKey === true) ||
             // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
                 // let it happen, don't do anything
                 return;
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}



/*
 * Prepares the tool tips properties
 */
function initToolTips() {
    $( "[title]" ).tooltip({
        position: {
            my: "left bottom",
            at: "left top-10",
            collision: "none"
        }
    });
}



/*
 * Actually begins the evolution process
 */
function beginEvolution () {
    getUserInput();

    console.log("Beginning the Evolution Process...");
    // don't begin a new evolution chain if already in progress
    if(Global.evolutionInProgress)
        return;
    Global.evolutionInProgress = true;
    // initializes the vector which represents the target
    initTarget();
    // generates a new random generation of rockets
    Global.population = new Population();
    // begins the loop and keeps track of the loop
    Global.drawLoopIntervalID = window.setInterval(draw, 1000 / Settings.FRAMES_PER_SECOND);

    var drag = true;

    if(Global.obstaclePlacementMode == 1)
    {
        Global.canvasElement.addEventListener('mousedown', DrawableObstacle.mouseDown);
        Global.canvasElement.addEventListener('mousemove', DrawableObstacle.mouseMove);
        Global.canvasElement.addEventListener('mouseup'  , DrawableObstacle.mouseUp  );
    } else {
        Global.canvasElement.addEventListener("mousemove" ,PlaceableObstacle.mouseMove );
        Global.canvasElement.addEventListener("mouseleave",PlaceableObstacle.mouseLeave);
        Global.canvasElement.addEventListener("mousedown" ,PlaceableObstacle.mouseDown );
    }
}



/**
 * Switches the mode for placing obstacles
 */
function switchObstacleMode (desiredMode) {
    // assigns the mode
    if(desiredMode) {
        if(desiredMode == 0)
        {
            Global.canvasElement.removeEventListener('mousedown', DrawableObstacle.mouseDown);
            Global.canvasElement.removeEventListener('mousemove', DrawableObstacle.mouseMove);
            Global.canvasElement.removeEventListener('mouseup'  , DrawableObstacle.mouseUp  );
            Global.canvasElement.addEventListener("mousemove" ,PlaceableObstacle.mouseMove );
            Global.canvasElement.addEventListener("mouseleave",PlaceableObstacle.mouseLeave);
            Global.canvasElement.addEventListener("mousedown" ,PlaceableObstacle.mouseDown );
            Global.obstaclePlacementMode = 0;
        } else {
            Global.canvasElement.removeEventListener("mousemove" ,PlaceableObstacle.mouseMove );
            Global.canvasElement.removeEventListener("mouseleave",PlaceableObstacle.mouseLeave);
            Global.canvasElement.removeEventListener("mousedown" ,PlaceableObstacle.mouseDown );
            Global.canvasElement.addEventListener('mousedown', DrawableObstacle.mouseDown);
            Global.canvasElement.addEventListener('mousemove', DrawableObstacle.mouseMove);
            Global.canvasElement.addEventListener('mouseup'  , DrawableObstacle.mouseUp  );
            Global.obstaclePlacementMode = 1;
        }
    }
    // toggles the mode
    else {

        if(Global.obstaclePlacementMode == 1)
        {
            Global.canvasElement.removeEventListener('mousedown', DrawableObstacle.mouseDown);
            Global.canvasElement.removeEventListener('mousemove', DrawableObstacle.mouseMove);
            Global.canvasElement.removeEventListener('mouseup'  , DrawableObstacle.mouseUp  );
            Global.canvasElement.addEventListener("mousemove" ,PlaceableObstacle.mouseMove );
            Global.canvasElement.addEventListener("mouseleave",PlaceableObstacle.mouseLeave);
            Global.canvasElement.addEventListener("mousedown" ,PlaceableObstacle.mouseDown );
            Global.obstaclePlacementMode = 0;
        } else {
            Global.canvasElement.removeEventListener("mousemove" ,PlaceableObstacle.mouseMove );
            Global.canvasElement.removeEventListener("mouseleave",PlaceableObstacle.mouseLeave);
            Global.canvasElement.removeEventListener("mousedown" ,PlaceableObstacle.mouseDown );
            Global.canvasElement.addEventListener('mousedown', DrawableObstacle.mouseDown);
            Global.canvasElement.addEventListener('mousemove', DrawableObstacle.mouseMove);
            Global.canvasElement.addEventListener('mouseup'  , DrawableObstacle.mouseUp  );
            Global.obstaclePlacementMode = 1;
        }
    }
}



/**
 * Returns a vector with the x and y coordinates to the given html element
 */
function relativeCoords (event, element) {
    var x = event.clientX - $(element).offset().left + document.getElementsByTagName('body')[0].scrollLeft;
    var y = event.clientY - $(element).offset().top + document.getElementsByTagName('body')[0].scrollTop;
    return new Vector(x, y);
}



/*
 * Assigns the Settings
 */
function getUserInput() {
    console.log("Getting the user inputs.");
}



/*
 * Stops the evolution
 */
function pauseEvolution () {
    console.log("Paused.");
    Global.evolutionInProgress = false;
    window.clearInterval(Global.drawLoopIntervalID);
}



/*
 * Resumes the evolution
 */
function resumeEvolution () {
    console.log("Resumed.");
    Global.evolutionInProgress = true;
    Global.drawLoopIntervalID = window.setInterval (draw, 1000/Settings.FRAMES_PER_SECOND);
}



/*
 * The function which handles all of the key presses
 */
function keyDownHandler (e) {
    switch(e.keyCode) {
        // pauses and resumes the evolution
        case Keyboard.SPACEBAR:
            if(Global.population)
                if(Global.evolutionInProgress)
                    pauseEvolution();
                else
                    resumeEvolution();
            break;
        // clears the obsacles from the screen
        case Keyboard.letter('c'):
            Global.obstacles = [];
            break;
    }
}



/*
 * creates a canvas and defines the global variable
 */
function initCanvas() {
    Global.canvasElement = document.createElement('canvas');
    $(Global.canvasElement).attr('width',Settings.WIDTH);
    $(Global.canvasElement).attr('height', Settings.HEIGHT);
    Global.canvasContext = Global.canvasElement.getContext('2d');
    $('.canvasLocation').append(Global.canvasElement);
    // makes the background black
    Global.canvasContext.fillRect(0, 0, W, H);
    $('.display').css('display', 'block').appendTo($('.canvasLocation'));
}



/*
 * Initializes a Target Vector variable
 */
function initTarget() {
    Global.target = new Vector();
        Global.target.x = Settings.WIDTH / 2;
        Global.target.y = 50;
}



/*
 * Draws the target thing onto the screen
 */
function drawTarget() {
    Global.canvasContext.beginPath();
    Global.canvasContext.fillStyle = 'red';
    Global.canvasContext.arc(Global.target.x, Global.target.y, 10, 0, 2 * Math.PI);
    Global.canvasContext.fill();
}



/*
 * My Vector Class
 */
function Vector (x, y) {
    this.x = x || 0;
    this.y = y || 0;

    // adds the given vector object
    this.add = function (vector) {
        this.x += vector.x;
        this.y += vector.y;
        return this;
    };
    // subtracts the given vector object
    this.subtract = function (vector) {
        this.x -= vector.x;
        this.y -= vector.y;
        return this;
    };
    // scales this vector
    this.scale = function (num) {
        this.x *= num;
        this.y *= num;
        return this;
    };
    // returns the dot product
    this.dot = function (vector) {
        return this.x*vector.x + this.y*vector.y;
    };
    // alternative names
    this.mult = this.scale;

    // radians is a boolean
    this.getAngle = function (degrees) {
        if(degrees)
            return Math.atan(this.y/this.x)*180/Math.PI;
        else
            return Math.atan(this.y/this.x);
    };
    // returns the hypotenuse
    this.getMagnitude = function () {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };
    this.getMag = this.getMagnitude;
    // sets the magnitude of this vector to the given number
    this.setMagnitude = function (magnitude) {
        this.scale(magnitude/this.getMagnitude());
        return this;
    };
    this.setMag = this.setMagnitude;
    // returns the distance between the two vectors
    this.distTo = function (vector) {
        return Math.sqrt((this.x-vector.x)*(this.x-vector.x) + (this.y-vector.y)*(this.y-vector.y));
    };
    // creates a copy of this vector and returns it
    this.copy = function () {
        var v = new Vector();
        v.x = this.x;
        v.y = this.y;
        return v;
    };
    // makes this vector a random vector with values between -1 and 1
    this.random = function (){
        this.x = randomFloat(-1, 1);
        this.y = randomFloat(-1, 1);
        this.setMag(1);
        return this;
    };
}



/*
 * The Population Class
 */
function Population () {

    this.generations = 0;
    this.rockets = [];
    this.popSize = Settings.POPULATION_SIZE;
    this.matingPool = [];

    for(var i = 0; i < this.popSize; i++)
        this.rockets[i] = new Rocket();

    /*
     * Updates the rockets
     */
    this.update = function () {
        for(var i = 0; i < this.popSize; i++)
        {
            this.rockets[i].update();
            this.rockets[i].draw();
        }
    };



    /*
     * Evaluates the fitness of each of the rockets
     */
    this.evaluate = function () {

        var maxFitness = Number.NEGATIVE_INFINITY;
        // calculates the fitness of each rocket
        for(var i = 0; i < this.popSize; i++)
        {
            this.rockets[i].calcFitness();
            if(this.rockets[i].fitness > maxFitness)
                maxFitness = this.rockets[i].fitness;
        }

        // normalizes the fitness of each rocket
        for( i = 0; i < this.popSize; i++)
            this.rockets[i].fitness /= maxFitness;

        // clears the mating pool
        this.matingPool = [];

        for(i = 0; i < this.popSize; i++)
        {
            var n = this.rockets[i].fitness * 100;
            for(var j = 0; j < n; j++)
                this.matingPool.push(this.rockets[i]);
        }
    };



    /*
     * Runs the breeding
     */
    this.breed = function () {
        Global.count = 0;

        // updates the number of rockets and their lifespans
        this.popSize = parseInt($('.populationSizeSlider').text(), 10);
        Settings.POPULATION_SIZE = this.popSize;

        // clears the data display for the new generation
        $('.numberCrashed').html(0);
        $('.numberReached').html(0);

        var newRockets = [];
        for(var i = 0; i < this.popSize; i++)
        {

            var p1 = random(this.matingPool).dna;
            var p2 = random(this.matingPool).dna;
            var child = p1.crossover(p2);
            newRockets[i] = new Rocket(child);
        }
        this.rockets = newRockets;
        this.generations ++;
        $('.generationNumber').html(this.generations);
    };
}



/*
 * The Rocket Class
 */
function Rocket (dna) {

    this.pos = new Vector(W/2, H-10);
    this.vel = new Vector();
    this.acc = new Vector();

    this.dna = dna || new DNA();

    this.fitness = 0;

    this.reachedTarget = false;
    this.timeToTarget = Settings.LIFE_SPAN;
    this.crashed = false;

    /*
     * Adds the force to the acceleration
     */
    this.applyForce = function (force) {
        this.acc.add(force);
    };



    /*
     * The Update Function for the Rocket
     */
    this.update = function () {
        if(this.reachedTarget || this.crashed)
            return;

        var d = this.pos.distTo(Global.target);

        if(d < 10) {
            this.reachedTarget = true;
            this.pos = Global.target.copy();
            this.timeToTarget = Global.count;
            $('.numberReached').html(
                parseInt($('.numberReached').html(), 10) + 1)
        }

        this.applyForce(this.dna.genes[Global.count]);
        this.vel.add(this.acc);
        if(this.vel.getMagnitude() > 15) this.vel.setMag(15);
        this.pos.add(this.vel);
        this.acc.mult(0);
        // checks for collisions or crashes
        this.checkCollision();
    };



    /*
     * Checks for collisions
     */
    this.checkCollision = function () {
        if(this.pos.x < 0 || this.pos.x > W)
            this.crashed = true;
        if(this.pos.y < 0 || this.pos.y > H)
            this.crashed = true;
        for(var o = 0; o < Global.obstacles.length; o++)
            if(Global.obstacles[o].checkCollision(this))
            {
                this.crashed = true;
                break;
            }
        if(this.crashed)
        {
            $('.numberCrashed').html(
                parseInt($('.numberCrashed').html(), 10) + 1);
            if(parseInt($('.numberCrashed').html(), 10) + parseInt($('.numberReached').html(), 10) == Settings.POPULATION_SIZE)
            {
                Global.population.evaluate();
                Global.population.breed();
            }
        }
    };


    /*
     * Draws the Rocket
     */
    this.draw = function () {
        var angle = this.vel.getAngle();
        Global.canvasContext.strokeStyle = 'rgba(255,255,255,0.5)';
        Global.canvasContext.lineWidth = Settings.ROCKET_WIDTH;
        Global.canvasContext.beginPath();
        Global.canvasContext.moveTo(
            this.pos.x+Settings.ROCKET_HEIGHT/2*Math.cos(angle),
            this.pos.y+Settings.ROCKET_HEIGHT/2*Math.sin(angle));
        Global.canvasContext.lineTo(
            this.pos.x-Settings.ROCKET_HEIGHT/2*Math.cos(angle),
            this.pos.y-Settings.ROCKET_HEIGHT/2*Math.sin(angle));
        Global.canvasContext.stroke();
    };



    /*
     * Calculates the fitness level of the rocket
     */
    this.calcFitness = function () {
        this.fitness = W - this.pos.distTo(Global.target) + Math.pow(Settings.LIFE_SPAN - this.timeToTarget, 4);
        if(this.reachedTarget)
            this.fitness *= 10;
        if(this.crashed)
            this.fitness /= 4;
    };
}



/*
 * The DNA which gets passed on from rocket to rocket
 */
function DNA (genes) {
    if(genes)
        this.genes = genes;
    else {
        this.genes = [];
        for( var i = 0; i < Settings.LIFE_SPAN; i++) {
            this.genes[i] = (new Vector()).random();
            this.genes[i].setMag(1);
        }
    }

    this.crossover = function (partner) {
        var newDNA = [];
        var mid = random(0, this.genes.length);
        for(var i = 0; i < this.genes.length; i++)
            if(i < mid)
                newDNA.push(this.genes[i]);
            else
                newDNA.push(partner.genes[i]);

        // five chances to mutate different genes
        for( i = 0; i < 5; i ++ )
            if(Math.random() < Settings.MUTATION_RATE)
                if(Math.random() < 0.1)
                    newDNA[random(0, 20)] = (new Vector()).random();
                else
                    newDNA[random(0, newDNA.length - 1)] = (new Vector()).random();

        return new DNA(newDNA);
    };
}



/*
 * The Obstacles which the rockets must avoid
 */
function Obstacle (cx, cy) {
    this.width = 20;
    this.height = 20;

    this.x = cx - this.width/2;
    this.y = cy - this.height/2;
    this.alpha = 1;


    this.checkCollision = function (rocket) {
        if(this.width < 0)
        {
            this.x += this.width;
            this.width = Math.abs(this.width);
        }
        if(this.height < 0)
        {
            this.y += this.height;
            this.height = Math.abs(this.height);
        }

        if(rocket.pos.x - this.x < this.width && rocket.pos.x - this.x >= 0)
            if(rocket.pos.y - this.y < this.height && rocket.pos.y - this.y >= 0)
                return true;
        return false;
    };

    this.draw = function () {
        Global.canvasContext.fillStyle = 'rgba(255, 165, 0, ' + this.alpha + ')';
        Global.canvasContext.fillRect(this.x, this.y, this.width, this.height);
    };
}



// generates a randomInt
function random (min, max) {
    if(typeof min == 'object')
        return min[random(0, min.length - 1)];
    return Math.round(Math.random() * (max - min)) + min;
}
// generates a random float
function randomFloat (min, max) {
    return Math.random() * (max - min) + min;
}
// a map with all of the keyboard keyCodes
var Keyboard = {
    ENTER: 13,
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT:39,
    SPACEBAR:32,
    letter: function (char) {
        char = char.toLowerCase();
        return 65 + "abcdefghijklmnopqrstuvwxyz".indexOf(char);
    }
};

// runs the start function asap
$(start);
