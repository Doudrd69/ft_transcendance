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

export class MessageDto {

	@IsNotEmpty()
	@IsString()
	from: string;

	@IsNotEmpty()
	@IsString()
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	@Length(1, 254)
	content: string;

	@IsNotEmpty()
	// @IsDate()
	post_datetime: Date;

	@IsNotEmpty()
	conversationID: number;
}