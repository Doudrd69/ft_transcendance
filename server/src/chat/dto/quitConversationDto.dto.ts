import {
	IsInt,
	IsNotEmpty,
	Max,
	IsPositive,
} from 'class-validator';

export class QuitConversationDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	conversationID: number;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userID: number;
}