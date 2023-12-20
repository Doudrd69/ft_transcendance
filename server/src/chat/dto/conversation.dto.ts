import {
	validate,
	validateOrReject,
	Contains, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	IsAlpha,
	IsAlphanumeric,
	IsInt,
	Length,
	IsNotEmpty,
	IsEmail, // Checks if the string is an email: @IsEmail(options?: IsEmailOptions)
	IsFQDN,
	IsAscii,
    IsBoolean,
	IsDate,
	Min,
	Max,
	Matches,
  } from 'class-validator';

export class ConversationDto {

    @IsNotEmpty()
    @Length(6, 20)
    @IsAscii()
    @IsAlpha()
    @IsString()
	@Matches(/^[^"';%()|<>\\]*$/)
    name: string;

    @IsNotEmpty()
    userID: number;

    @IsNotEmpty()
    @IsBoolean()
    is_channel: boolean;
}