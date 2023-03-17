class Box {
	constructor(x, y, w ,h, $p5) {
		host? this.createMatter(x, y, w, h) : this.createFake(x, y);
		this.w = w;
		this.h = h;
		this.$p5 = $p5;
	}

	createMatter(x, y, w, h) {		
		this.body = Matter.Bodies.rectangle(x, y, w, h);
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
		if(angle !== null) this.$p5.rotate(angle);
		this.$p5.rectMode(this.$p5.CENTER);

		this.$p5.noStroke();
		this.$p5.fill(0, 100, 0);
		this.$p5.rect(0, 0, this.w, this.h);

		this.$p5.pop();
	}
}