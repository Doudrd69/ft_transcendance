import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsPositive,
	Length,
	Matches,
	Max
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