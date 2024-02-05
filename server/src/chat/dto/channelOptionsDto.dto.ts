import {
	IsAlphanumeric,
	IsAscii,
	IsBoolean,
	IsInt,
	IsNotEmpty,
	IsOptional,
	IsPositive,
	IsString,
	Length,
	Matches,
	Max
} from 'class-validator';

export class ChannelOptionsDto {

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	@IsInt()
	conversationID: number;

	@IsNotEmpty()
	@IsBoolean()
	state: boolean;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
	password: string;
}

