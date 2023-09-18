import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
	) {}

	private passwordPolicy(password: string) {
		if (password.length >= 8)
			return true;
		return false;
	}

	async createNewUser(username: string, password: string): Promise<User> {
		const userToCreate = await this.usersRepository.findOne({ where: { username } });
		if (!userToCreate) {
			const saltOrRounds = 10;
			if (this.passwordPolicy(password)) {
				password = await bcrypt.hash(password, saltOrRounds);
				const newUser = this.usersRepository.create({ username, password });
				return await this.usersRepository.save(newUser);
			}
			throw new Error('Password policy : 8 characters minimum');
		}
		throw new Error('User with this username already exists');
	}

	async deleteUser(username: string) {
		const userToDelete = await this.usersRepository.findOne({ where: { username } });
		if (userToDelete) {
			return await this.usersRepository.delete(username);
		}
		throw new NotFoundException();
	}

	async updateUser(username: string, newUsername: string) {
		const userToUpdate = await this.usersRepository.findOne({ where: { username } });
		if (userToUpdate) {
			userToUpdate.username = newUsername;
			return await this.usersRepository.save(userToUpdate);
		}
		throw new NotFoundException();
	}

	findOne(username: string): Promise<User | null> {
		return this.usersRepository.findOne({ where: { username } });
	}
}