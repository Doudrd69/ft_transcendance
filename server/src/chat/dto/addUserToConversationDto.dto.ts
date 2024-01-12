import {
    IsNotEmpty,
    IsString
} from 'class-validator';

export class AddUserToConversationDto {

    @IsNotEmpty()
    @IsString()
    userToAdd: string;

    @IsNotEmpty()
    conversationID: number;
}