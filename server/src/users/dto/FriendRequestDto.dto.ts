import {
	IsAlphanumeric,
	IsAscii,
	IsNotEmpty,
	IsOptional,
	Length,
	Matches
} from 'class-validator';

export class FriendRequestDto {

	@IsOptional()
	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	initiatorLogin?: string;

	@IsNotEmpty()
	@Length(6, 20)
	@IsAscii()
	@IsAlphanumeric()
	@Matches(/^[^"';%()|<>\\]*$/)
	recipientLogin: string;
}
