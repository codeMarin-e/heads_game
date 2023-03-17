class Ball {
	constructor(x, y, r, $p5) {
		host? this.createMatter(x, y, r) : this.createFake(x, y);
		this.r = r;
		this.$p5 = $p5;
	}

	createMatter(x,y,r) {
		this.body = Matter.Bodies.circle(x, y, r, {
			restitution: 1.00
		});
		Matter.World.add(world, this.body);
	}

	createFake(x, y) {
		this.body = {
			position: {
				x: x,
				y: y
			},
			angle: 0
		}
	}

	remove() {
		if(!host) return;
		Matter.World.remove(world, this.body);
	}

	show() {
		const pos = this.body.position;
		const angle = this.body.angle;
		this.$p5.push();
		this.$p5.translate(pos.x, pos.y);
		this.$p5.rotate(angle? angle : 0);
		this.$p5.rectMode(this.$p5.CENTER);

		this.$p5.noStroke();
		
		this.$p5.fill(255, 255, 255);
		this.$p5.imageMode(this.$p5.CENTER);
		this.$p5.image(images.ball, 0, 0, this.r*2, this.r*2);
		// this.$p5.circle(0, 0, this.r);

		this.$p5.pop();
	}
}