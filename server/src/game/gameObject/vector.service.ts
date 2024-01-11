import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from "src/users/entities/users.entity";
import { Ball } from "../entities/ball.entity";
import { GameEngine } from "../entities/gameEngine.entity";
import { Paddle } from "../entities/paddle.entity";
import { Game } from "../entities/games.entity";

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

	) {}

}