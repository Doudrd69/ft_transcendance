import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsPositive,
	Length,
	Matches,
	Max,
	IsInt,
} from 'class-validator';

export class UpdateUsernameDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userID: number;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	newUsername: string;
}