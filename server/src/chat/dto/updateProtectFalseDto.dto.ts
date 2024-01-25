import {
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsPositive,
	Max
} from 'class-validator';

export class UpdateProtectFalseDto {

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	@IsInt()
	conversationID: number;

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	@IsInt()
	userID: number;

	@IsNotEmpty()
	@IsBoolean()
	state: boolean;
}

