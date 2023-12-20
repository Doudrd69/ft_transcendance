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
	IsDate,
	Min,
	Max,
	Matches,
  } from 'class-validator';

export class FriendRequestDto {

	@IsNotEmpty()
	@IsString()
	initiatorLogin: string;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;

	recipientID?: number;
}