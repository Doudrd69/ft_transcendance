import {
	IsInt,
	IsNotEmpty,
	IsPositive,
	Max
} from 'class-validator';

export class UpdateIsPublicDto {

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
}

