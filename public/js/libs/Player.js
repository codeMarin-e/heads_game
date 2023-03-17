class Player{
    
	constructor(x, y, r, id, team, $p5) {
        this.foot_sizes = {
            width: 50,
            height: 23
        };
		this.r = r;
        this.team = team;
		this.id = parseInt(id);
		host? this.createMatter(x, y) : this.createFake(x, y);
		this.$p5 = $p5;
        this.main_angle = 0;
		this.jumping = false;
        this.kicking = false;
        this.head_sprite = false;
        this.moving = {            
            up: false,
            left: false,
            right: false,
            space: false,                
            start_game: false,
        };
	}

	createMatter(x,y,r) {
		this.head = Matter.Bodies.circle(x, y, this.r, {
            restitution: 0,                    
            angularVelocity: 0,
            angle: 0,
            label: 'head_'+this.id
		}); 
        if(this.team == 1) {
            var chamfer = { radius: [0, 20, 0, 0] };
//            var chamfer = { radius: [0, 0, 0, 0] };
            var footPosPrefix = 0;
        } else {
            var chamfer = { radius: [20, 0, 0, 0] };
//            var chamfer = { radius: [0, 0, 0, 0] };
            var footPosPrefix = 0;
        }
        this.foot = Matter.Bodies.rectangle(x+footPosPrefix*5, y+ this.r+(this.foot_sizes.height/2), this.foot_sizes.width, this.foot_sizes.height, {
            restitution: 0,                    
            angularVelocity: 0,
            angle: 0, 
            chamfer: chamfer, 
            label: 'foot_'+this.id
        });
        this.leg = Matter.Constraint.create({
            bodyA: this.head,
            pointA: { x: 0, y: this.r },
            bodyB: this.foot,
            pointB: { x: 0, y: (-1*this.foot_sizes.height/2) },
            stiffness: 1,
            label: 'leg_'+this.id
        });
		Matter.World.add(world, [this.head, this.foot, this.leg]);
//		Matter.World.add(world, [this.head, this.foot]);
	}

	remove() {
		if(!host) return;
		Matter.World.remove(world, this.head);
		Matter.World.remove(world, this.foot);
//		Matter.World.remove(world, this.leg);
	}

	createFake(x, y) {
        this.head = {
			position: {
				x: x,
				y: y
			},
			angle: 0
		};
        
        this.foot = {
			position: {
				x: x,
				y: y+this.r+(this.foot_sizes.height/2)
			},
			angle: 0
        }
	}
    
    changePosition(x, y) {
        if(!host) return;
        
        this.main_angle = 0;
        Matter.Body.set(this.head, {
            position: {
                x: x,
                y: y
            },
            angle: 0,
            angularVelocity: 0,
        });
        
        var footPosPrefix = this.team == 1? 0 : 0;
        Matter.Body.set(this.foot, {
            position: {
                x: x+footPosPrefix*5,
                y: y+ this.r+(this.foot_sizes.height/2)
            },
            angle: 0,
            angularVelocity: 0,
        });
    }
    
    keysPressed() {
        if(host) return;
        socket.send(JSON.stringify({
            type: 'keys_pressed',
            moving: this.moving,
            head_sprite: this.head_sprite,
        }));
        return;
    }
    
    do_move() {  
        var newVelocity = this.foot.velocity;
        if(this.moving.left) {  
            newVelocity.x = -3;
        }
        if(this.moving.right) {  
            newVelocity.x = 3;
        }
        
        if(this.jumping) {
            var collisions = Matter.Query.ray(Matter.Composite.allBodies(engine.world), this.foot.position, {
                x: this.foot.position.x,
                y: this.foot.position.y+(this.foot_sizes.height/2)+1//bottom
            });
            if(collisions.length > 1) {
               this.jumping = false;
            }
        }
        if(this.moving.up && !this.jumping) {  
            this.jumping = true;
            newVelocity.y = -6*3;
        }      
        
        if(this.moving.space) {
            this.kicking = true;
        }

        var newPosition = this.foot.position;
        if(this.kicking) {
            if(Math.abs(this.main_angle.toFixed(2)) >= 1.5) {
                this.kicking = false;
            } else {                   
                this.main_angle -= 0.2 * (this.team == 1? 1 : -1);
                var angle = ( this.main_angle ) * (Math.PI/180); // Convert to radians
                newPosition = {
                    x: Math.cos(angle) * (this.foot.position.x - this.head.position.x) - Math.sin(angle) * (this.foot.position.y - this.head.position.y) + this.head.position.x,
                    y: Math.sin(angle) * (this.foot.position.x - this.head.position.x) + Math.cos(angle) * (this.foot.position.y - this.head.position.y) + this.head.position.y
                }
            }
        } else {         
            if(Math.abs(this.main_angle.toFixed(2)) > 0) {
                this.main_angle += 0.04 * (this.team == 1? 1 : -1);
                var angle = (this.main_angle ) * (Math.PI/180); // Convert to radians
                newPosition = {
                    x: Math.cos(angle) * (this.foot.position.x - this.head.position.x) - Math.sin(angle) * (this.foot.position.y-this.head.position.y) + this.head.position.x,
                    y: Math.sin(angle) * (this.foot.position.x - this.head.position.x) + Math.cos(angle) * (this.foot.position.y - this.head.position.y) + this.head.position.y
                }
            }
        };
            
        Matter.Body.set(this.foot, {
            position: newPosition,
            velocity: newVelocity,
            angularVelocity: 0,
            angle: this.main_angle
        });

        Matter.Body.set(this.head, {
            angularVelocity: 0,
            angle: this.main_angle
        });
    }
    
    
	show() {
		var pos = this.head.position;
		var angle = this.head.angle;
		this.$p5.push();
		this.$p5.translate(pos.x, pos.y);
		// this.$p5.rotate(angle? angle : 0);

		this.$p5.noStroke();
        if(this.head_sprite) {
            this.$p5.imageMode(this.$p5.CENTER);
            this.$p5.image(images.players[this.head_sprite], 0, 0, this.r*2, this.r*2);
        } else {
            this.$p5.noStroke();
            this.$p5.fill(100, 100, 100);
            this.$p5.circle(0, 0, this.r*2);
        }
		this.$p5.pop();
        
		var pos =  this.foot.position;
		var angle = this.foot.angle;
		this.$p5.push();
		this.$p5.translate(pos.x, pos.y);
		this.$p5.rotate(angle? angle : 0);
		this.$p5.rectMode(this.$p5.CENTER);

		this.$p5.noStroke();
		this.$p5.imageMode(this.$p5.CENTER);
        if(this.team == 1) {
            this.$p5.image(images.shoes.left, 0, 0, this.foot_sizes.width, this.foot_sizes.height);
        } else {
            this.$p5.image(images.shoes.right, 0, 0, this.foot_sizes.width, this.foot_sizes.height);
        }
		this.$p5.pop();
	}
}