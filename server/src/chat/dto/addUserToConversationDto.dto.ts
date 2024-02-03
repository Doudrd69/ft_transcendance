import {
	IsNotEmpty,
	IsString,
	IsOptional,
	IsPositive,
	IsInt,
	Max,
} from 'class-validator';

export class AddUserToConversationDto {

	@IsOptional()
	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userToAdd?: number;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	conversationID: number;
}