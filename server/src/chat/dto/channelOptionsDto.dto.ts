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

export class ChannelOptionsDto {
   
    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
	conversationID: number;

    @IsNotEmpty()
	@IsBoolean()
	userID: number;

	@IsNotEmpty()
	@IsBoolean()
	state: boolean;

    @IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlpha()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
    password?: string;
}