import {
	validate,
	validateOrReject,
	Contains, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	IsAlpha,
	IsAlphaNumeric,
	IsInt,
	Length,
	IsNotEmpty,
	IsEmail, // Checks if the string is an email: @IsEmail(options?: IsEmailOptions)
	IsFQDN,
	IsAscii,
	IsDate,
	Min,
	Max,
  } from 'class-validator';

export class FriendRequestDto {

	initiatorLogin: string;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	recipientLogin: string;

	recipientID?: number;
}