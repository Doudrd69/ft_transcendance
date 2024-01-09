import {
	IsAlpha,
	IsAscii,
	IsBoolean,
	IsNotEmpty,
	IsPositive, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	Length,
	Matches,
	Max
} from 'class-validator';

export class UpdateConversationDto {

    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
	conversationID: number;

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	userID: number;

	@IsNotEmpty()
	@IsBoolean()
	isPublic: boolean;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	newPassword?: string;
}