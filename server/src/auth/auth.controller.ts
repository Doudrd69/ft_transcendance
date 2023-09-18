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
	
@Controller('auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	// This function will return a JWT for authentification
	// @HttpCode(HttpStatus.OK)
	// @Post('login')
	// login(@Body() signInDto: Record<string, any>) {
	// 	return this.authService.login(signInDto.username, signInDto.password);
	// }

	@HttpCode(HttpStatus.OK)
	@Post('access')
	getAccessToken(@Body() requestBody: {code: string}) {
		const { code } = requestBody; // Access the 'code' property within the object
		console.log('Code received from client: ', code);
		return this.authService.getAccessToken(code);
	}

	@UseGuards(AuthGuard)
	@Get('profile')
	getProfile(@Request() req) {
		return req.user;
	}
}
