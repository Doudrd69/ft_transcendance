import {
	Body,
	Controller,
	Get,
	HttpCode,
	HttpStatus,
	Post,
	Request,
	UseGuards
	} from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { RequestTfaDto } from './dto/RequestTfaDto.dto';
import { AuthenticatorCodeDto } from './dto/AuthenticatorCodeDto.dto';
	
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// This function will return a JWT for authentification
	// @HttpCode(HttpStatus.OK)
	// @Post('login')
	// login(@Body() signInDto: Record<string, any>) {
	// 	return this.authService.login(signInDto.username, signInDto.password);
	// }

	// @HttpCode(HttpStatus.OK)
	@Post('request2fa')
	activate2FA(@Body() requestTfaDto: RequestTfaDto) {
		return this.authService.activate2FA(requestTfaDto);
	}

	@Post('checkAuthenticatorCode')
	verifyCode(@Body() authenticatorCodeDto: AuthenticatorCodeDto) {
		return this.authService.verifyCode(authenticatorCodeDto);
	}


	@Post('access')
	getAccessToken(@Body() requestBody: {code: string}) {
		const { code } = requestBody;
		return this.authService.getAccessToken(code);
	}

	@UseGuards(AuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
