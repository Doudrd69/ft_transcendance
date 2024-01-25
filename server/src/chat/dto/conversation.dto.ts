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
} from 'class-validator';

export class ConversationDto {

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	name: string;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userID: number;

	@IsNotEmpty()
	@IsBoolean()
	is_channel: boolean;

	@IsNotEmpty()
	@IsBoolean()
	isPublic: boolean;

	@IsNotEmpty()
	@IsBoolean()
	isProtected: boolean;

	// @Length(6, 20)
	// @IsAscii()
	// @IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	password?: string;
}