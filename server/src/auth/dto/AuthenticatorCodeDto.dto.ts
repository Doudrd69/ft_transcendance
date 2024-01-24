import {
	IsDecimal,
	IsNotEmpty,
	IsPositive,
	Length,
	Max
} from 'class-validator';

export class AuthenticatorCodeDto {

	@IsNotEmpty()
	@IsPositive()
	@Max(1000)
	userID: number;

	@IsNotEmpty()
	@IsDecimal()
	@Length(6)
	code: string;
}