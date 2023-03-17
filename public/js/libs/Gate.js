class Gate {
	constructor(x, y, w ,h, team, $p5) {
		this.team = team;
		host? this.createMatter(x, y, w, h) : this.createFake(x, y, w, h);
		this.w = w;
		this.h = h;
		this.$p5 = $p5;
	}

	createMatter(x, y, w, h) {		
        
		this.body = {
			position: {
				x: x,
				y: y
			},
            parts: [],
			angle: 0
		}
        
        
        
//		this.body = Matter.Bodies.rectangle(x, y, w, h, {
//            isStatic: true
//        });
        if(this.team == 1) {   
            this.body.parts[0] = Matter.Bodies.rectangle(x, y-h/2 + 6/2, w, 6, {
                isStatic: true,
                friction: 0,
            });   
            Matter.World.add(world, this.body.parts[0] );
            Matter.Body.set(this.body.parts[0], { angle: -25 } );
            this.body.parts[1] = Matter.Bodies.rectangle(x-w/2+6/2, y + 6/2, 6, h, {
                isStatic: true,
                friction: 0,
            });
        } else { 
            this.body.parts[0] = Matter.Bodies.rectangle(x, y-h/2 + 6/2, w, 6, {
                isStatic: true,
                friction: 0,
            });
            Matter.World.add(world, this.body.parts[0] );
            Matter.Body.set(this.body.parts[0], { angle: 25 } );
            this.body.parts[1] = Matter.Bodies.rectangle(x+w/2-6/2, y + 6/2, 6, h, {
                isStatic: true,
                friction: 0,
            });
        }
		
		Matter.World.add(world, this.body.parts[1] );
	}

	createFake(x, y, w, h) {
        if(this.team == 1) {
            var part1 = {
                angle: -25,
                position: {
                    x: x,
                    y: y-h/2 + 6/2
                },
            }
            var part2 = {
                angle: 0,
                position: {
                    x: x-w/2+6/2,
                    y: y + 6/2
                },
            }
        } else {
            var part1 = {
                angle: 25,
                position: {
                    x: x,
                    y: y-h/2 + 6/2
                },
            }
            var part2 = {
                angle: 0,
                position: {
                    x: x+w/2-6/2,
                    y: y + 6/2
                },
            }
        }
		this.body = {
			position: {
				x: x,
				y: y
			},
			angle: 0,
            parts: [part1, part2],
		}
	}

	remove() {
		if(!host) return;
		Matter.World.remove(world, this.body);
	}

	show() {
		var pos = this.body.position;
		var angle = this.body.angle;
		this.$p5.push();
		this.$p5.translate(pos.x, pos.y);
		if(angle !== null) this.$p5.rotate(angle);
		this.$p5.noStroke();
		this.$p5.fill(0, 100, 0);
		this.$p5.imageMode(this.$p5.CENTER);
        this.$p5.image(images.gates.net, 0, 0, this.w, this.h);
        
		this.$p5.rectMode(this.$p5.CENTER);
		this.$p5.noStroke();
		this.$p5.fill(100, 100, 100);
        
        if(this.team == 1) 
            this.$p5.rect(0+this.w/2-6/2, 5, 6, this.h-5);
        else
            this.$p5.rect(0-this.w/2+6/2, 5, 6, this.h-5);
        
		this.$p5.rectMode(this.$p5.CENTER);
		this.$p5.noStroke();
		this.$p5.fill(100, 100, 100);

		this.$p5.pop();
        
        var pos = this.body.parts[0].position;
		var angle = this.body.parts[0].angle;
		this.$p5.push();
		this.$p5.rectMode(this.$p5.CENTER);
		this.$p5.noStroke();
		this.$p5.fill(100, 100, 100);
        this.$p5.translate(pos.x, pos.y);
		if(angle !== null) this.$p5.rotate(angle);
		this.$p5.rect(0, 0, this.w, 6);
        this.$p5.pop();
        
        var pos = this.body.parts[1].position;
		var angle = this.body.parts[1].angle;
		this.$p5.push();
		this.$p5.rectMode(this.$p5.CENTER);
		this.$p5.noStroke();
		this.$p5.fill(100, 100, 100);
        this.$p5.translate(pos.x, pos.y);
		if(angle !== null) this.$p5.rotate(angle);
		this.$p5.rect(0, 0, 6, this.h);
        this.$p5.pop();
	}
}