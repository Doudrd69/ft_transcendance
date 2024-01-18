import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from "src/users/entities/users.entity";
import { Ball } from "../entities/ball.entity";
import { GameEngine } from "../entities/gameEngine.entity";
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
		@InjectRepository(GameEngine)
		private gameEngineRepository: Repository<GameEngine>,
		@InjectRepository(Paddle)
		private paddleRepository: Repository<Paddle>,
		@InjectRepository(Ball)
		private ballRepository: Repository<Ball>,
		@InjectRepository(Vector)
		private vectorRepository: Repository<Vector>,

	) {}

	add(other: vector_instance, vector: vector_instance)  {
        return (this.createAndSaveVector(vector, vector.x + other.x, vector.y + other.y));
    }

	scale(scalar: number, vector: vector_instance) {
        return (this.createAndSaveVector(vector, vector.x * scalar, vector.y * scalar));
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