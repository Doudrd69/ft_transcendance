import {
	IsNotEmpty,
	IsPositive,
	Max
} from 'class-validator';

export class DMcreationDto {
	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	user1: number;

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	user2: number;
}