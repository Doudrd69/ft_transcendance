import {
	validate,
	validateOrReject,
	Contains, // Checks if the string contains the seed: @Contains(seed: string)
	IsString,
	IsAlpha,
	IsAlphanumeric,
	Length,
	IsNotEmpty,
	IsEmail, // Checks if the string is an email: @IsEmail(options?: IsEmailOptions)
	IsFQDN,
	IsAscii,
	IsPositive,
	IsDate,
	Min,
	Max,
	Matches,
  } from 'class-validator';

export class UpdateUsernameDto {

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	userID: number;

	@IsNotEmpty({ message: 'Please enter a new username'})
	@Length(6, 20, { message: 'Username must be between 6 and 20 characters'})
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	newUsername: string;
}