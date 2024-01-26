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
	@IsPositive()
	@IsInt()
	@Max(1000)
	target: number;


	@IsNotEmpty()
	@IsBoolean()
	state: boolean;
}