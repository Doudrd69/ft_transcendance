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
    IsDate,
} from 'class-validator';
import { isDate } from 'util/types';

export class MuteUserDto {
   
    @IsNotEmpty()
	@IsPositive()
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
	@Max(1000)
	from: number;

    mutedUntil: number;
}