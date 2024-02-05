import {
	IsAlpha,
	IsAscii,
	IsBoolean,
	IsNotEmpty,
	IsPositive, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	Length,
	Matches,
	Max,
	IsInt,
	IsOptional,
} from 'class-validator';

export class UpdateConversationDto {

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

	@IsNotEmpty()
	@IsBoolean()
	isPublic: boolean;

	@IsNotEmpty()
	@IsBoolean()
	isProtected: boolean;

	@IsOptional()
	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	newPassword: string;
}