import {
	IsNotEmpty,
	IsString,
	IsPositive,
	IsInt,
	Max,
} from 'class-validator';

export class AddUserToConversationDto {

	@IsNotEmpty()
	@IsString()
	userToAdd: string;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	conversationID: number;
}