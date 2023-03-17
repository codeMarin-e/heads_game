class Ground extends Box {
	constructor(x, y, w ,h, $p5) {
		super(x, y, w, h, $p5);
		this.body.isStatic = true;
	}

	show() {
		const pos = this.body.position;
		const angle = this.body.angle;
		this.$p5.push();
		this.$p5.translate(pos.x, pos.y);
		// this.$p5.rotate(angle);
		this.$p5.rectMode(this.$p5.CENTER);

		this.$p5.noStroke();
		this.$p5.imageMode(this.$p5.CENTER);
		this.$p5.image(images.grass, 0, 0, this.w, this.h);
		// this.$p5.fill(0, 100, 0);
		// this.$p5.rect(0, 0, this.w, this.h);

		this.$p5.pop();
	}
}