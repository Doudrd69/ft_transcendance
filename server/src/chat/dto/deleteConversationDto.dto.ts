import {
	IsInt,
    IsNotEmpty,
    IsPositive,
    Max
} from 'class-validator';

export class DeleteConversationDto {
   
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