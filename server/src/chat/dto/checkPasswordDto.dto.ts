import {
	IsAlpha,
	IsAscii,
	IsNotEmpty,
	IsPositive,
	IsString,
	Length,
	Matches,
	Max,
	IsInt,
} from 'class-validator';

export class CheckPasswordDto {

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
	userInput: string;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	username: string;
}