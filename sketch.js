/**
  *	@author Luke Reynolds
  *	@email lreynolds188@gmail.com
  *	@website http://lukereynolds.net/
  */

var ballXDirection = null;
var ballYDirection = null;
var playing = null;
var ballX = null;
var ballY = null;
var playerX = 30;
var playerY = 240;
var enemyX = 690;
var enemyY = 240;
var enemySpeed = 4.5;
var lives = 10;
var level = 1;
var shootPlasma = false;
var suckPlasma = false;
var holdingBall = false;
var multiplier = 0;
var charge = 0;

// variable holding the texture of a particle
var particle_texture = null;
var particle_color = null;
var player_color = null;
var enemy_color = null;

// variable holding the particle system
var particle_system = null;

function preload(){
      particle_texture = loadImage("particle_texture.png");
}

function setup(){ 
      createCanvas(720, 480);
  
  		updateColors();

      // initialize the particle system
      particle_system = new ParticleSystem(createVector(ballX, ballY), particle_texture);
}

function draw(){ 
      background(0);
  		
      var force = createVector(-ballXDirection/80, -ballYDirection/80);
      particle_system.applyForce(force);
      particle_system.run();
      for (var i=0; i<2; i++){
        particle_system.addParticle(createVector(ballX, ballY)); 
      }
  
  		// scoreboard
  		fill(0, 0);
      stroke(0, 255, 0);
      quad(70, 5, 50, 30, 200, 30, 220, 5);
      quad(230, 5, 210, 30, 520, 30, 500, 5);
      quad(510, 5, 530, 30, 670, 30, 650, 5);
  
  		// charge indicators
  		fill(charge, 180-charge, 0);
  		noStroke();
  		quad(70, 5, 50, 30, 50+charge, 30, 70+charge, 5);

      // text
      fill(255, 255, 255);
      stroke(0);
      textSize(14);
      text("Lives: " + lives, 280, 23);
      text("Level: " + level, 390, 23);
  		
      // player
      fill(player_color);
      rect(playerX - 20, playerY - 40, 20, 80, 4);

      // enemy
      fill(enemy_color);
      rect(enemyX, enemyY - 40, 20, 80, 4);
  
  		// ball
			fill(particle_color, 0);
  		stroke(255, 255, 255);
  		ellipse(ballX, ballY, 20, 20);

      update();
}

function update(){  
  		// player follows mouse
      if (mouseY < height - 10 && mouseY > 10){
        playerY = mouseY;
      }
  		
      if (!playing){
        holdBall();
        if (mouseIsPressed){
          playing = true;
          ballXDirection = 10;
    			ballYDirection = mouseY - pmouseY;
        }
      } else {

        if (mouseIsPressed){
          if (charge <= 148){
           	charge += 2; 
          }
          if (mouseButton == LEFT){
            if (holdingBall){
              holdBall(); 
            }
            if (collisionDetect(ballX, ballY, playerX, playerY)){
              holdingBall = true;
            }  
          }
        }
       
        
        // update ball location
        ballX = ballX + ballXDirection;
        ballY = ballY + ballYDirection;

        // detect win
        if (ballX >= width){
          level++;
          playing = false;
          updateColors();
        }

        // detect loss
        if (ballX <= 0){
          lives--;
          playing = false;
          updateColors();
        }	
        
        // ball border collision
        if (ballY <= 10 || ballY >= height){
          ballYDirection = -ballYDirection;
        }
        
        // ball player collision
        if (collisionDetect(ballX, ballY, enemyX, enemyY)){
           reboundBall(false);
        }
        if (collisionDetect(ballX, ballY, playerX, playerY)){
           reboundBall(true);
        } 

        // enemy AI
        if (ballY - enemyY < 1){
          enemyY -= enemySpeed;
        } else if(ballY - enemyY > 1){
          enemyY += enemySpeed; 
        }
      }
}

function mouseReleased(){
    if (mouseButton == LEFT){
      charge = 0;
      if (holdingBall){
        suckPlasma = false;
        holdingBall = false;
        ballXDirection = 10;
        ballYDirection = mouseY - pmouseY;
      }
		}
}

function updateColors(){
 		player_color = color(random(255), random(255), random(255));
  	enemy_color = color(random(255), random(255), random(255));
  	particle_color = [random(255), random(255), random(255)];
}

function holdBall(){
  	ballX = playerX + 15;
  	ballY = playerY;
    ballXDirection = 0;
    ballYDirection = 0;
}

function reboundBall(value){
      // Reverse x direction and rebound y direction
      ballXDirection = -ballXDirection;
  		if (value){
        if (mouseY - pmouseY != 0){
          ballYDirection = mouseY - pmouseY;
        }
			}
}

function collisionDetect(object1X, object1Y, object2X, object2Y){
  var dx = Math.abs(object1X - object2X);
  var dy = Math.abs(object1Y - object2Y);
  
  // collision
  if (dx < 15 && dy < 50){
    return true;
  }
}

// PARTICLE SYSTEM CLASS
var ParticleSystem = function(vector, _img){
 		 	this.particles = [];
  		this.origin = vector.copy();
  		this.img = _img;
  		for (var i = 0; i < 0; ++i){
       		this.particles.push(new Particle(this.origin, this.img)); 
      }
}

ParticleSystem.prototype.run = function(){
 			var len = this.particles.length;
  
  		for (var i = len-1; i >= 0; i--){
       		var particle = this.particles[i];
        	particle.run();
        
        	// if particle is dead, kill it
        	if(particle.isDead()){
           		this.particles.splice(i, 1); 
          }
      }
}

ParticleSystem.prototype.applyForce = function(dir){
 			var len = this.particles.length;
  		for (var i = 0; i < len; ++i){
       		this.particles[i].applyForce(dir); 
      }
}

ParticleSystem.prototype.addParticle = function(location){
 			this.particles.push(new Particle(location, this.img)); 
}

// PARTICLE CLASS
var Particle = function(pos, img){
 			this.loc = pos.copy();
  		if (holdingBall){
       	multiplier = 2; 
      } else {
       	multiplier = 0.5; 
      }
  		var vx = randomGaussian() * multiplier;
  		var vy = randomGaussian() * multiplier;
  		this.vel = createVector(vx, vy);
  		this.acc = createVector();
  		this.lifespan = 80.0;
  		this.texture = img;
}

Particle.prototype.run = function(){
 			this.update();
  		this.render();
}

Particle.prototype.render = function(){
 			imageMode(CENTER);
  		tint(particle_color[0], particle_color[1], particle_color[2], this.lifespan);
      image(this.texture, this.loc.x, this.loc.y);
}

Particle.prototype.applyForce = function(f){
 			this.acc.add(f); 
}

Particle.prototype.isDead = function(){
  		if (this.lifespan <= 0.0){
       		return true;
      } else {
       		return false; 
      }
}

Particle.prototype.update = function(){
 			this.vel.add(this.acc);
  		this.loc.add(this.vel);
  		this.lifespan -= 2.5;
  		this.acc.mult(0);
}
