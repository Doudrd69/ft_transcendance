import {
	IsAlpha,
	IsAlphanumeric,
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

export class ConversationDto {

	@IsNotEmpty()
	@Length(4, 20)
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

	@IsOptional()
	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	password?: string;
}