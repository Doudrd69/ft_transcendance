import {
	IsDecimal,
	IsNotEmpty,
	IsPositive,
	Length,
	Max,
	IsInt,
} from 'class-validator';

export class AuthenticatorCodeDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userID: number;

	@IsNotEmpty()
	@Length(6)
	code: string;
}