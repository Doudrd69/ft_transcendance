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

export class UserOptionsDto {
   
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
	state: boolean;
}