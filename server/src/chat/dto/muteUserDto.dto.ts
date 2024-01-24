import {
	IsAlpha,
	IsAscii,
	IsBoolean,
	IsNotEmpty,
	IsPositive,
	IsString,
	Length,
	Matches,
	Max,
	IsInt,
} from 'class-validator';

export class MuteUserDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	conversationID: number;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	username: string;

	@IsNotEmpty()
	@IsBoolean()
	state: boolean;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	from: number;

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	mutedUntil: number;
}