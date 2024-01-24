import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	Length,
	Matches
} from 'class-validator';

export class FriendRequestDto {

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	initiatorLogin: string;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;
}
