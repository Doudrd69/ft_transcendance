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

export class UserOptionsDto {
   
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
}