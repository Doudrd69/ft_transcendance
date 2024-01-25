import {
	IsNotEmpty,
	IsPositive,
	Max,
	IsInt,
} from 'class-validator';

export class RequestTfaDto {

	@IsNotEmpty()
	@IsPositive()
	@IsInt()
	@Max(1000)
	userID: number;
}