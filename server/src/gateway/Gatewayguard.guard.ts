import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';

@Injectable()
export class  GatewayGuard implements CanActivate {

	constructor(private readonly jwtService: JwtService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {

		const client = context.switchToWs().getClient();
		const token = client.handshake.auth.token;

		if (!token) {
			throw new UnauthorizedException();
		}

		try {
			await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret } );
			return true;
		} catch (error) {
			throw new UnauthorizedException();
		}
	}
}
