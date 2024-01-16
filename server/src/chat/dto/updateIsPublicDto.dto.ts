import {
	IsAlpha,
	IsAscii,
	IsBoolean,
	IsNotEmpty,
	IsPositive, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	Length,
	Matches,
	IsInt,
	Max
} from 'class-validator';

export class UpdateIsPublicDto {
   
    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
	@IsInt()
	conversationID: number;

    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
	@IsInt()
	userID: number;
}

