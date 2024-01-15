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

export class ChannelOptionsDto {
   
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

	@IsNotEmpty()
	@IsBoolean()
	state: boolean;

    // @IsNotEmpty()
	// @Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
    password?: string;
}