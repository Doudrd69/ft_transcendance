import {
	validate,
	validateOrReject,
	Contains, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	IsAlpha,
	IsAlphanumeric,
	Length,
	IsNotEmpty,
	IsPositive,
	IsEmail, // Checks if the string is an email: @IsEmail(options?: IsEmailOptions)
	IsFQDN,
	IsAscii,
	IsDate,
	Min,
	Max,
  } from 'class-validator';

export class RequestTfaDto {

    @IsNotEmpty()
	@IsPositive()
	@Max(1000)
    userID: number;
}