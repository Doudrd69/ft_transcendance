import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from "src/users/entities/users.entity";
import { Ball } from "../entities/ball.entity";
import { Paddle } from "../entities/paddle.entity";
import { Game } from "../entities/games.entity";
import { Vector } from '../entities/vector.entity';
import { vector_instance } from 'src/game_gateway/game.gateway';

export class VectorService {
	constructor(
		@InjectRepository(Game)
		private gameRepository: Repository<Game>,
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,
		@InjectRepository(Ball)
		private ballRepository: Repository<Ball>,
		@InjectRepository(Vector)
		private vectorRepository: Repository<Vector>,

	) {}

	add(thiss: vector_instance, vector: vector_instance)  {
		const newVector: vector_instance = {
			x: vector.x + thiss.x,
			y: vector.y + thiss.y,
		}
        return (newVector);
    }

	scale(scalar: number, vector: vector_instance) {
		const newVector: vector_instance = {
			x: vector.x * scalar,
			y: vector.y * scalar,
		}
        return (newVector);
    }

	sub(vector: vector_instance, other: vector_instance) {
		const newVector: vector_instance = {
			x: vector.x - other.x,
			y: vector.y - other.y,
		}
		return (newVector);
	}

	mag(vector: vector_instance) {
		return Math.sqrt(vector.x * vector.x + vector.y * vector.y);
	}

	normalize(vector: vector_instance) {
		const newVector: vector_instance = { x: 0, y: 0}
		if (this.mag(vector) === 0)
			return (newVector)
		const neueVector = { x:vector.x / this.mag(vector), y: vector.y / this.mag(vector)}
		return (neueVector);
	}

	dot(v1: vector_instance, v2: vector_instance) {
		return (v1.x * v2.x + v1.y * v2.y);
	}

	getCreateAndSaveVector(vector: vector_instance, x: number, y: number) {
		return (this.createAndSaveVector(vector, x, y));
	}

	private createAndSaveVector(vector: vector_instance, x: number, y: number) {
		vector = {
        	x: x,
			y: y,
		}

        return vector;
    }
}