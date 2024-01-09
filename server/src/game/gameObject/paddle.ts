

export class Paddle {

	width: number;
	heigth: number;
	x_pos: number;
	y_pos: number;
	speed: number;

	constructor(heigth: number, width: number, x: number, y: number) {
		this.heigth = heigth;
		this.width = width;
		this.x_pos = x;
		this.y_pos = y;
		this.speed = 1/60;
	}

	async up() {
		this.y_pos -= this.speed;
		if (this.y_pos < 0)
			this.y_pos = 0;
	}

	async down() {
		this.y_pos += this.speed;
		if (this.y_pos < 0)
			this.y_pos = 0;
	}
}
