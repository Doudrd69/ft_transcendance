import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class AddFriendToConversationDto {

    @IsNotEmpty()
    @IsString()
    userToAdd: string;

    @IsNotEmpty()
    conversationID: number;
}