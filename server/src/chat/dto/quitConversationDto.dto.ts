import {
	IsAscii,
	IsNotEmpty,
	IsString,
	Length,
	Matches,
	IsInt,
	Max
} from 'class-validator';

export class QuitConversationDto {

	@IsNotEmpty()
	@IsInt()
	@Max(1000)
	conversationID: number;

	@IsNotEmpty()
	@IsInt()
	@Max(1000)
	userID: number;
}