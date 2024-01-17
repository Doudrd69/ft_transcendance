import {
    IsNotEmpty,
    IsPositive,
    Max
} from 'class-validator';

export class DeleteConversationDto {
   
    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
	conversationID: number;

    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
	userID: number;
}