/**
 *    @author Luke Aaron Reynolds
 *    @email lreynolds188@gmail.com
 *    @website http://lukereynolds.net/
 */

// general game variables
var ballXDirection = null;
var ballYDirection = null;
var playing = null;
var ballX = null;
var ballY = null;
var playerX = 30;
var playerY = 240;
var enemyX = 690;
var enemyY = 240;
var enemySpeed = 4;
var lives = 10;
var level = 1;
var shootPlasma = false;
var suckPlasma = false;
var holdingBall = false;
var multiplier = 0;
var charge = 0;

// particle variables
var particleTexture = null;
var particleColor = null;
var playerColor = null;
var enemyColor = null;
var force = null;

// array containing all particles
var particleSystem = null;

function preload() {
    particleTexture = loadImage("particle_texture.png");
    defaultFont = loadFont('repetition.otf');
    myFont = loadFont('space.otf');
}

function setup() {
    createCanvas(720, 480);
    updateColors();
    // initialize the particle system sending it the start location and the image
    particleSystem = new ParticleSystem(createVector(ballX, ballY), particleTexture);
  	
}

function draw() {
    background(0);
    generateParticleForce();
    drawScoreboard();
  	drawChargeIndicators();
		drawText();
		drawGameObjects();
    update();
}

function update() {
    if (mouseY < height - 10 && mouseY > 10) {
        playerY = mouseY; // player follows mouse
    }

    if (playing) {
        if (mouseIsPressed) {
            if (charge <= 148) {
                charge += 2;
            }
            if (mouseButton == LEFT) {
                if (holdingBall) {
                    holdBall();
                }
                if (collisionDetect(ballX, ballY, playerX, playerY)) {
                    holdingBall = true;
                }
            }
        }

        // update ball location
        ballX = ballX + ballXDirection;
        ballY = ballY + ballYDirection;

        // detect win
        if (ballX >= width) {
            level++;
            playing = false;
            updateColors();
        }

        // detect loss
        if (ballX <= 0) {
            lives--;
            playing = false;
            updateColors();
        }

        // ball border collision
        if (ballY <= 10) {
            ballYDirection = abs(ballYDirection);
        } else if (ballY >= height - 10) {
            ballYDirection = -abs(ballYDirection);
        }

        // ball player collision
        if (collisionDetect(ballX, ballY, playerX, playerY)) {
            reboundBall(true);
        }
      	if (collisionDetect(ballX, ballY, enemyX, enemyY)) {
            reboundBall(false);
        }

        // enemy AI
        if (enemyY - ballY < -8) {
            enemyY += enemySpeed;
        } else if (enemyY - ballY > 8) {
            enemyY -= enemySpeed;
        }
    } else {
        holdBall();
				// start game
        if (mouseIsPressed) {
            playing = true;
            ballXDirection = 10;
            reboundBall(true);
        }
    }
}

function mouseReleased() {
    if (mouseButton == LEFT) {
        charge = 0;
        if (holdingBall) {
            suckPlasma = false;
            holdingBall = false;
            ballXDirection = 10;
            ballYDirection = mouseY - pmouseY;
        }
    }
}

function updateColors() {
    playerColor = color(random(255), random(255), random(255));
    enemyColor = color(random(255), random(255), random(255));
    particleColor = [random(255), random(255), random(255)];
}

function drawScoreboard() {
 		fill(0, 0);
    stroke(0, 255, 0);
    quad(70, 5, 50, 30, 200, 30, 220, 5);
    quad(230, 5, 210, 30, 520, 30, 500, 5);
    quad(510, 5, 530, 30, 670, 30, 650, 5); 
}

function drawChargeIndicators()	{
    fill(charge, 180 - charge, 0);
    noStroke();
    quad(70, 5, 50, 30, 50 + charge, 30, 70 + charge, 5);
}

function drawText() {
  	// lives
    fill(255, 255, 255);
  	textFont(defaultFont);
    stroke(0);
    textSize(14);
    text("Lives: " + lives, 270, 24);
  
  	// level
    fill(255, 0, 0);
    textFont(myFont);
    text("Level: " + level, 380, 23);
}

function drawGameObjects() {
 		// player
    fill(playerColor);
    rect(playerX - 20, playerY - 40, 20, 80, 4);

    // enemy
    fill(enemyColor);
    rect(enemyX, enemyY - 40, 20, 80, 4);

    // ball
    fill(particleColor, 0);
    stroke(255, 255, 255);
    ellipse(ballX, ballY, 20, 20); 
}

function holdBall() {
    ballX = playerX + 15;
    ballY = playerY;
    ballXDirection = 0;
    ballYDirection = 0;
}

function reboundBall(value) {
    if (value) { // if rebounding off player
        ballXDirection = -ballXDirection;
        if (mouseY - pmouseY != 0) {
            ballYDirection = mouseY - pmouseY;
        } else {
            randomiseBallYDirection();
        }
    } else { // else rebounding off enemy
        ballXDirection = -abs(ballXDirection);
    }
}

function randomiseBallYDirection() {
    ballYDirection = random(-4, 4.1);
}

function collisionDetect(object1X, object1Y, object2X, object2Y) {
    var dx = Math.abs(object1X - object2X);
    var dy = Math.abs(object1Y - object2Y);
    if (dx < 15 && dy < 50) { // collision
        return true;
    }
}

function generateParticleForce() {
  	force = createVector(-ballXDirection / 80, -ballYDirection / 80); // location to move the particle in
    particleSystem.applyForce(force);
    particleSystem.run();
    for (var i = 0; i < 3; i++) { // each iteration increases particle density
        particleSystem.addParticle(createVector(ballX, ballY));
    }
}
		
/** http://alpha.editor.p5js.org/p5/sketches/rJZG3HV4Xbb
  * The particle system for this project was cloned and modified from the p5.js examples (link above)
  * The code was modified to allow the particles to generate at the ball's location and trail behind
**/

// PARTICLE SYSTEM FUNCTION
var ParticleSystem = function (_vector, _image) {
  	// set required variables
    this._particles = [];
    this._origin = _vector.copy();
    this._image = _image;
    for (var i = 0; i < 0; i++) {
        this._particles.push(new Particle(this._origin, this._image)); // add particle to the array, with the location (vector) and image
    }
}

ParticleSystem.prototype.run = function () { // particlesystem inherits prototype properties
    var _length = this._particles.length - 1;
    for (var i = _length; i >= 0; i--) { // for each particle in the array working backwards
        var _particle = this._particles[i]; // variable must be copied otherwise throws undefined error
        _particle.run();
        if (_particle.isDead()) {  // if particle is dead
            this._particles.splice(i, 1); // remove it from the array
        }
    }
}

ParticleSystem.prototype.applyForce = function (_direction) {
    var _length = this._particles.length;
    for (var i = 0; i < _length; ++i) { // for each particle in the array
        this._particles[i].applyForce(_direction); // call the apply force function and send it the direction
    }
}

ParticleSystem.prototype.addParticle = function (_location) {
    this._particles.push(new Particle(_location, this._image));  // add particle to the array with location (vector) and image
}

// PARTICLE FUNCTION
var Particle = function (_position, _image) {
    this._location = _position.copy();
    if (holdingBall) {
        multiplier = 2;
    } else {
        multiplier = 0.5;
    }
    var _vx = randomGaussian() * multiplier;
    var _vy = randomGaussian() * multiplier;
    this._velocity = createVector(_vx, _vy); 
    this._accelerate = createVector();
    this._lifespan = 80.0;
    this._texture = _image;
}

Particle.prototype.run = function () {
    this.update();
    this.render();
}

Particle.prototype.update = function () {
    this._velocity.add(this._accelerate); // add the acceleration to the velocity
    this._location.add(this._velocity); // add the velocity to the location
    this._lifespan -= 2.5; // decrement lifespan
    this._accelerate.mult(0); // reset accelerate to zero
}

Particle.prototype.render = function () {
    imageMode(CENTER);
    tint(particleColor[0], particleColor[1], particleColor[2], this._lifespan); // r,g,b,alpha
    image(this._texture, this._location.x, this._location.y);
}

Particle.prototype.applyForce = function (_force) {
    this._accelerate.add(_force);
}

Particle.prototype.isDead = function () {
    if (this._lifespan <= 0.0) {
        return true;
    } else {
        return false;
    }
}
