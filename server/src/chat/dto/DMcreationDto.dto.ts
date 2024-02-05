import {
	IsNotEmpty,
	IsPositive,
	Max,
	IsInt,
} from 'class-validator';

export class DMcreationDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	user1: number;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	user2: number;
}