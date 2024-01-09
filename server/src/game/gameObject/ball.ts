import { Vector } from "./vector";


export class Ball {
	
	x: number;
	y: number;
	r: number;
	speed: Vector;

	constructor(x: number, y: number, r: number) {
		this.x = x;
		this.y = y;
		this.r = r;
		this.speed = new Vector(0,0);
	}

	

}