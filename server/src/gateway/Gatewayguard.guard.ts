import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, Req } from '@nestjs/common';
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
			const payload = await this.jwtService.verifyAsync(token, { secret: jwtConstants.secret } );
			context.switchToWs().getData().user = payload;
			return true;
		} catch (error) {
			throw new UnauthorizedException();
		}
	}
}
