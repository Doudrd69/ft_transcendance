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
import { Req } from '@nestjs/common';
	
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// This function will return a JWT for authentification
	// @HttpCode(HttpStatus.OK)
	// @Post('login')
	// login(@Body() signInDto: Record<string, any>) {
	// 	return this.authService.login(signInDto.username, signInDto.password);
	// }

	@UseGuards(AuthGuard)
	@Post('request2fa')
	activate2FA(@Req() req) {
		const { user } = req;
		return this.authService.activate2FA(user.sub);
	}

	// ici je pourrais rajouter un code dans le body et le verifier pour desactiver
	@UseGuards(AuthGuard)
	@Post('desactivate2fa')
	desactivate2FA(@Req() req, @Body() authenticatorCodeDto: AuthenticatorCodeDto) {
		const { user } = req;
		return this.authService.desactivate2FA(authenticatorCodeDto, user.sub);
	}

	@UseGuards(AuthGuard)
	@Get('get2fa')
	getMessagesFromConversation(@Req() req) {
		const { user } = req;
		return this.authService.get2fa(user.sub);
	}

	@UseGuards(AuthGuard)
	@Post('checkAuthenticatorCode')
	verifyCode(@Req() req, @Body() authenticatorCodeDto: AuthenticatorCodeDto) {
		const { user } = req;
		return this.authService.verifyCode(authenticatorCodeDto, user.sub);
	}

	@Post('access')
	getAccessToken(@Body() requestBody: { code: string } ) {
		const { code } = requestBody;
		return this.authService.getAccessToken(code);
	}
}
